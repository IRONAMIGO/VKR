import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    readReferencesApiStudentsStudentIdPhotosGet,
    readReferenceApiStudentsStudentIdPhotosPhotoIdGet,
    createReferenceApiStudentsStudentIdPhotosPost,
    deleteReferenceApiStudentsStudentIdPhotosPhotoIdDelete,
} from '@/api/client/sdk.gen'
import type { ReferenceFacePublic } from '@/api/client/types.gen'

export function useReferences(studentId: Ref<number>) {
    const photos = ref<ReferenceFacePublic[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Сохраняем последние параметры пагинации для возможности обновления
    let lastOffset = 0
    let lastLimit = 20

    async function fetchPhotos(offset = 0, limit = 20) {
        loading.value = true
        error.value = null
        lastOffset = offset
        lastLimit = limit
        try {
            const response = await readReferencesApiStudentsStudentIdPhotosGet({
                path: { student_id: studentId.value },
                query: { offset, limit },
            })
            if (response.data) {
                photos.value = response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка загрузки фотографий'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await fetchPhotos(lastOffset, lastLimit)
    }

    async function fetchPhoto(id: number): Promise<ReferenceFacePublic | undefined> {
        loading.value = true
        try {
            const response = await readReferenceApiStudentsStudentIdPhotosPhotoIdGet({
                path: { student_id: studentId.value, photo_id: id },
            })
            return response.data
        } catch (e: any) {
            const msg = e?.message || 'Ошибка получения фото'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function uploadPhoto(file: File) {
        loading.value = true
        try {
            const response = await createReferenceApiStudentsStudentIdPhotosPost({
                path: { student_id: studentId.value },
                body: { photo: file },
            })
            if (response.data) {
                ElMessage.success('Фото отправлено')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка отправки фото'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function deletePhoto(photoId: number) {
        loading.value = true
        try {
            await deleteReferenceApiStudentsStudentIdPhotosPhotoIdDelete({
                path: { student_id: studentId.value, photo_id: photoId },
            })
            ElMessage.success('Фото удалено')
            await refresh()
        } catch (e: any) {
            const msg = e?.message || 'Ошибка удаления фото'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    return {
        photos,
        loading,
        error,
        fetchPhotos,
        refresh,
        fetchPhoto,
        uploadPhoto,
        deletePhoto,
    }
}