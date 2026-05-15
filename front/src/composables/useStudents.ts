import { ref, unref, type MaybeRef } from 'vue'
import { ElMessage } from 'element-plus'
import {
    readStudentsApiStudentsGet,
    readStudentApiStudentsStudentIdGet,
    createStudentApiStudentsPost,
    updateStudentApiStudentsStudentIdPut,
    deleteStudentApiStudentsStudentIdDelete,
} from '@/api/client/sdk.gen'
import type {
    StudentPublicWithGroup,
    StudentPublic,
    StudentPrivate,
    StudentCreate,
    StudentUpdate,
} from '@/api/client/types.gen'

export function useStudents(groupId?: MaybeRef<number | undefined | null>) {
    const items = ref<StudentPublicWithGroup[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const total = ref(0)

    let lastOffset: number | null = null
    let lastLimit: number | null = null

    async function fetchStudents(offset?: number | null, limit?: number | null) {
        loading.value = true
        error.value = null
        lastOffset = offset ?? null
        lastLimit = limit ?? null
        try {
            const query: Record<string, unknown> = {
                group_id: unref(groupId) ?? undefined,
            }
            if (offset != null) query.offset = offset
            if (limit != null) query.limit = limit

            const response = await readStudentsApiStudentsGet({ query })
            if (response.data) {
                items.value = response.data
            }
            if (response.response) {
                const totalHeader = response.response.headers.get('X-Total-Count')
                total.value = totalHeader ? Number(totalHeader) : 0
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка загрузки студентов'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await fetchStudents(lastOffset, lastLimit)
    }

    async function fetchStudent(id: number): Promise<StudentPrivate | undefined> {
        loading.value = true
        try {
            const response = await readStudentApiStudentsStudentIdGet({
                path: { student_id: id },
            })
            return response.data
        } catch (e: any) {
            const msg = e?.message || 'Ошибка получения студента'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function createStudent(data: StudentCreate): Promise<StudentPublic | undefined> {
        loading.value = true
        try {
            const response = await createStudentApiStudentsPost({ body: data })
            if (response.data) {
                ElMessage.success('Студент создан')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка создания студента'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function updateStudent(id: number, data: StudentUpdate): Promise<StudentPublic | undefined> {
        loading.value = true
        try {
            const response = await updateStudentApiStudentsStudentIdPut({
                path: { student_id: id },
                body: data,
            })
            if (response.data) {
                ElMessage.success('Студент обновлён')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка обновления студента'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function deleteStudent(id: number) {
        loading.value = true
        try {
            await deleteStudentApiStudentsStudentIdDelete({ path: { student_id: id } })
            ElMessage.success('Студент удалён')
            await refresh()
        } catch (e: any) {
            const msg = e?.message || 'Ошибка удаления студента'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    return {
        items,
        loading,
        error,
        total,
        fetchStudents,
        refresh,
        fetchStudent,
        createStudent,
        updateStudent,
        deleteStudent,
    }
}