<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RecognitionResultPublicWithStudent } from '@/api/client/types.gen'
import { useImageBoundingBoxes } from '@/composables/useImageBoundingBoxes'

const props = defineProps<{
  imageUrl: string
  boxes: RecognitionResultPublicWithStudent[]
  /** ID выделенного результата (null – ни один не выделен) */
  highlightedResultId?: number | null
}>()

const emit = defineEmits<{
  (e: 'boxClick', index: number): void
}>()

const containerRef = ref<HTMLElement | null>(null)

const { boxes: overlayBoxes } = useImageBoundingBoxes(
    containerRef,
    computed(() => props.boxes),
    computed(() => props.highlightedResultId ?? null)
)
</script>

<template>
  <div ref="containerRef" class="image-container">
    <el-image
        :src="imageUrl"
        fit="contain"
        style="width: 100%; display: block"
    />
    <div class="overlay" v-if="overlayBoxes.length">
      <div
          v-for="(box, index) in overlayBoxes"
          :key="box.id"
          class="bounding-box"
          :class="{
            highlighted: box.highlighted,
            unknown: box.studentId === null
          }"
          :style="box.style"
          @click.stop="emit('boxClick', index)"
      >
        <span class="box-label">{{ box.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  display: block;
  width: 800px;
  max-width: 100%;
  max-height: 800px;
  overflow: hidden;
  margin: 0 auto;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.bounding-box {
  position: absolute;
  border: 2px solid #44ff44;
  pointer-events: all;
  cursor: pointer;
}
.bounding-box.highlighted {
  border-color: #409eff;
  z-index: 2;
}
.box-label {
  position: absolute;
  bottom: 100%;
  left: -2px;
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  padding: 2px 4px;
  white-space: nowrap;
  pointer-events: none;
}
.bounding-box.unknown:not(.highlighted) {
  border-color: #ff4444;
}
</style>