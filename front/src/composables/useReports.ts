import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { readResultsReportsGet } from '@/api/client/sdk.gen'
import type { RecognitionDataPublicWithRecognitionResultAndStudent } from '@/api/client/types.gen'

export interface ReportsFilters {
    lectureDate?: string | null
    lectureNum?: number | null
    streamId?: number | null
    groupId?: number | null
    studentId?: number | null
}

export function useReports() {
    const items = ref<RecognitionDataPublicWithRecognitionResultAndStudent[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const total = ref(0)

    let lastFilters: ReportsFilters = {}
    let lastOffset: number | null = null
    let lastLimit: number | null = null

    async function fetchReports(
        filters: ReportsFilters = {},
        offset?: number | null,
        limit?: number | null
    ) {
        loading.value = true
        error.value = null
        lastFilters = { ...filters }
        lastOffset = offset ?? null
        lastLimit = limit ?? null
        try {
            const query: Record<string, unknown> = {}
            if (filters.lectureDate) query.lecture_date = filters.lectureDate
            if (filters.lectureNum != null) query.lecture_num = filters.lectureNum
            if (filters.streamId != null) query.stream_id = filters.streamId
            if (filters.groupId != null) query.group_id = filters.groupId
            if (filters.studentId != null) query.student_id = filters.studentId
            if (offset != null) query.offset = offset
            if (limit != null) query.limit = limit

            const res = await readResultsReportsGet({ query })
            items.value = res.data ?? []
            const tc = res.response?.headers?.get('X-Total-Count')
            total.value = tc ? parseInt(tc, 10) : 0
        } catch (e: any) {
            const msg = e?.message || 'Ошибка загрузки отчётов'
            error.value = msg
            ElMessage.error(msg)
            items.value = []
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await fetchReports(lastFilters, lastOffset, lastLimit)
    }

    return {
        items,
        loading,
        error,
        total,
        fetchReports,
        refresh,
    }
}