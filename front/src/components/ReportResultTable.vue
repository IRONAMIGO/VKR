<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RecognitionResultPublicWithStudent } from '@/api/client/types.gen'

const props = defineProps<{
  results: RecognitionResultPublicWithStudent[]
  loading: boolean
  groupMap: Record<number, { name: string; stream_id: number }>
  streamMap: Record<number, { name: string }>
  selectedId?: number | null
}>()

const emit = defineEmits<{
  select: [id: number | null]
  edit: [result: RecognitionResultPublicWithStudent]
}>()

const tableRef = ref<any>(null)  // template ref для el-table

function getStudentName(result: RecognitionResultPublicWithStudent) {
  return result.student?.name ?? 'Неизвестный'
}

function getGroupName(result: RecognitionResultPublicWithStudent) {
  const gid = result.student?.group_id
  return gid && props.groupMap[gid] ? props.groupMap[gid].name : '—'
}

function getStreamName(result: RecognitionResultPublicWithStudent) {
  const gid = result.student?.group_id
  if (!gid || !props.groupMap[gid]) return '—'
  const sid = props.groupMap[gid].stream_id
  return props.streamMap[sid]?.name ?? '—'
}

function handleCurrentChange(currentRow: RecognitionResultPublicWithStudent | null) {
  emit('select', currentRow?.id ?? null)
}

// Синхронизация выделенной строки при изменении selectedId извне
watch(() => props.selectedId, (newId) => {
  if (!tableRef.value) return
  if (newId == null) {
    tableRef.value.setCurrentRow(null)
  } else {
    const row = props.results.find(r => r.id === newId)
    tableRef.value.setCurrentRow(row ?? null)
  }
})
</script>

<template>
  <div class="table-wrapper">
    <el-table
        ref="tableRef"
        :data="results"
        v-loading="loading"
        border
        highlight-current-row
        @current-change="handleCurrentChange"
    >
      <el-table-column label="Студент" min-width="160">
        <template #default="{ row }">
          {{ getStudentName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="Группа" min-width="120">
        <template #default="{ row }">
          {{ getGroupName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="Поток" min-width="120">
        <template #default="{ row }">
          {{ getStreamName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="Уверенность" min-width="110" align="center">
        <template #default="{ row }">
          {{ (row.confidence * 100).toFixed(1) }}%
        </template>
      </el-table-column>
      <el-table-column label="Сходство" min-width="110" align="center">
        <template #default="{ row }">
          <template v-if="row.similarity != null">
            {{ (row.similarity * 100).toFixed(1) }}%
          </template>
          <template v-else>—</template>
        </template>
      </el-table-column>
      <el-table-column label="Действия" min-width="100" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click.stop="emit('edit', row)">
            Изменить
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}
</style>