import { ref, unref, type MaybeRef } from 'vue'
import { ElMessage } from 'element-plus'
import {
    readGroupsApiGroupsGet,
    readGroupApiGroupsGroupIdGet,
    createGroupApiGroupsPost,
    updateGroupApiGroupsGroupIdPut,
    deleteGroupApiGroupsGroupIdDelete,
} from '@/api/client/sdk.gen'
import type { GroupPublicWithStream, GroupCreate, GroupUpdate } from '@/api/client/types.gen'

export function useGroups(streamId?: MaybeRef<number | undefined | null>) {
    const items = ref<GroupPublicWithStream[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const total = ref(0)

    // Сохраняем последние параметры для возможности обновления
    let lastOffset: number | null = null
    let lastLimit: number | null = null

    async function fetchGroups(offset?: number | null, limit?: number | null) {
        loading.value = true
        error.value = null
        lastOffset = offset ?? null
        lastLimit = limit ?? null
        try {
            const query: Record<string, unknown> = {
                stream_id: unref(streamId) ?? undefined,
            }
            if (offset != null) query.offset = offset
            if (limit != null) query.limit = limit

            const response = await readGroupsApiGroupsGet({ query })
            if (response.data) {
                items.value = response.data
            }
            if (response.response) {
                const totalHeader = response.response.headers.get('X-Total-Count')
                total.value = totalHeader ? Number(totalHeader) : 0
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка загрузки групп'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await fetchGroups(lastOffset, lastLimit)
    }

    async function fetchGroup(id: number): Promise<GroupPublicWithStream | undefined> {
        loading.value = true
        try {
            const response = await readGroupApiGroupsGroupIdGet({ path: { group_id: id } })
            return response.data
        } catch (e: any) {
            const msg = e?.message || 'Ошибка получения группы'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function createGroup(data: GroupCreate): Promise<GroupPublicWithStream | undefined> {
        loading.value = true
        try {
            const response = await createGroupApiGroupsPost({ body: data })
            if (response.data) {
                ElMessage.success('Группа создана')
                await refresh()   // перезагружаем текущую страницу
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка создания группы'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function updateGroup(id: number, data: GroupUpdate): Promise<GroupPublicWithStream | undefined> {
        loading.value = true
        try {
            const response = await updateGroupApiGroupsGroupIdPut({
                path: { group_id: id },
                body: data,
            })
            if (response.data) {
                ElMessage.success('Группа обновлена')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка обновления группы'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function deleteGroup(id: number) {
        loading.value = true
        try {
            await deleteGroupApiGroupsGroupIdDelete({ path: { group_id: id } })
            ElMessage.success('Группа удалена')
            await refresh()
        } catch (e: any) {
            const msg = e?.message || 'Ошибка удаления группы'
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
        fetchGroups,
        refresh,
        fetchGroup,
        createGroup,
        updateGroup,
        deleteGroup,
    }
}