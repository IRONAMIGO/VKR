import { ref, computed, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue'
import type { RecognitionResultPublicWithStudent } from '@/api/client/types.gen'

export interface BoundingBoxStyle extends CSSProperties {
    top: string
    left: string
    width: string
    height: string
}

export interface BoxOverlay {
    id: number
    studentId: number | null
    name: string
    confidence: number
    similarity?: number | null
    style: BoundingBoxStyle
    highlighted: boolean
}

export function useImageBoundingBoxes(
    containerRef: Ref<HTMLElement | null>,
    results: Ref<RecognitionResultPublicWithStudent[]>,
    highlightedId?: Ref<number | null>
) {
    const containerWidth = ref(0)
    const containerHeight = ref(0)
    let resizeObserver: ResizeObserver | null = null

    onMounted(() => {
        const container = containerRef.value
        if (container) {
            resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    containerWidth.value = entry.contentRect.width
                    containerHeight.value = entry.contentRect.height
                }
            })
            resizeObserver.observe(container)
        }
    })

    onUnmounted(() => {
        resizeObserver?.disconnect()
    })

    const boxes = computed<BoxOverlay[]>(() => {
        const container = containerRef.value
        if (!container || !containerWidth.value || !containerHeight.value) return []

        const img = container.querySelector('img')
        if (!img || !img.naturalWidth || !img.naturalHeight) return []

        const naturalWidth = img.naturalWidth
        const naturalHeight = img.naturalHeight
        const displayWidth = containerWidth.value
        const displayHeight = containerHeight.value

        const scaleX = displayWidth / naturalWidth
        const scaleY = displayHeight / naturalHeight
        const scale = Math.min(scaleX, scaleY)

        const offsetX = (displayWidth - naturalWidth * scale) / 2
        const offsetY = (displayHeight - naturalHeight * scale) / 2

        return results.value.map(r => {
            const name = r.student?.name ?? 'Неизвестный'
            const left = r.bbox_x1 * scale + offsetX
            const top = r.bbox_y1 * scale + offsetY
            const width = (r.bbox_x2 - r.bbox_x1) * scale
            const height = (r.bbox_y2 - r.bbox_y1) * scale

            return {
                id: r.id,
                studentId: r.student_id ?? null,
                name,
                confidence: r.confidence,
                similarity: r.similarity,
                style: {
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                } as BoundingBoxStyle,
                highlighted: highlightedId ? r.id === highlightedId.value : false,
            }
        })
    })

    return { boxes }
}