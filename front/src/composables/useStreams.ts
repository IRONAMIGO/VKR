import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    readStreamsApiStreamsGet,
    readStreamApiStreamsStreamIdGet,
    createStreamApiStreamsPost,
    updateStreamApiStreamsStreamIdPut,
    deleteStreamApiStreamsStreamIdDelete,
} from '@/api/client/sdk.gen'
import type { StreamPublic, StreamCreate, StreamUpdate } from '@/api/client/types.gen'

export function useStreams() {
    const items = ref<StreamPublic[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const total = ref(0)

    let lastOffset: number | null = null
    let lastLimit: number | null = null

    async function fetchStreams(offset?: number | null, limit?: number | null) {
        loading.value = true
        error.value = null
        lastOffset = offset ?? null
        lastLimit = limit ?? null
        try {
            const query: Record<string, unknown> = {}
            if (offset != null) query.offset = offset
            if (limit != null) query.limit = limit

            const response = await readStreamsApiStreamsGet({ query })
            if (response.data) {
                items.value = response.data
            }
            if (response.response) {
                const totalHeader = response.response.headers.get('X-Total-Count')
                total.value = totalHeader ? Number(totalHeader) : 0
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка загрузки потоков'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await fetchStreams(lastOffset, lastLimit)
    }

    async function fetchStream(id: number): Promise<StreamPublic | undefined> {
        loading.value = true
        try {
            const response = await readStreamApiStreamsStreamIdGet({ path: { stream_id: id } })
            return response.data
        } catch (e: any) {
            const msg = e?.message || 'Ошибка получения потока'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function createStream(data: StreamCreate): Promise<StreamPublic | undefined> {
        loading.value = true
        try {
            const response = await createStreamApiStreamsPost({ body: data })
            if (response.data) {
                ElMessage.success('Поток создан')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка создания потока'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function updateStream(id: number, data: StreamUpdate): Promise<StreamPublic | undefined> {
        loading.value = true
        try {
            const response = await updateStreamApiStreamsStreamIdPut({
                path: { stream_id: id },
                body: data,
            })
            if (response.data) {
                ElMessage.success('Поток обновлён')
                await refresh()
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка обновления потока'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    async function deleteStream(id: number): Promise<void> {
        loading.value = true
        try {
            await deleteStreamApiStreamsStreamIdDelete({ path: { stream_id: id } })
            ElMessage.success('Поток удалён')
            await refresh()
        } catch (e: any) {
            const msg = e?.message || 'Ошибка удаления потока'
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
        fetchStreams,
        refresh,
        fetchStream,
        createStream,
        updateStream,
        deleteStream,
    }
}