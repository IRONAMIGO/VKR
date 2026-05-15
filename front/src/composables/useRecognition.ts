import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createResultApiReportsPost } from '@/api/client/sdk.gen'
import type { RecognitionDataPublic } from '@/api/client/types.gen'

export function useRecognition() {
    const results = ref<RecognitionDataPublic>()
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function recognize(params: {
        lecture_date?: string
        lecture_num: number
        photo: File | Blob
    }): Promise<RecognitionDataPublic | undefined> {
        loading.value = true
        error.value = null
        try {
            const response = await createResultApiReportsPost({
                body: {
                    data: {
                        lecture_date: params.lecture_date,
                        lecture_num: params.lecture_num,
                    },
                    photo: params.photo,
                },
            })
            if (response.data) {
                results.value = response.data
                ElMessage.success('Распознавание завершено')
                return response.data
            }
        } catch (e: any) {
            const msg = e?.message || 'Ошибка распознавания'
            error.value = msg
            ElMessage.error(msg)
        } finally {
            loading.value = false
        }
    }

    return {
        results,
        loading,
        error,
        recognize,
    }
}