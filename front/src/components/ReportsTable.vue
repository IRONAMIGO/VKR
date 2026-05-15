<script setup lang="ts">
import type {
  RecognitionDataPublicWithRecognitionResultAndStudent,
  RecognitionResultPublicWithStudent,
} from '@/api/client/types.gen'
import { getPhotoUrl } from '@/utils/photoUrl'

const props = defineProps<{
  items: RecognitionDataPublicWithRecognitionResultAndStudent[]
  loading: boolean
  groupMap: Record<number, { name: string; stream_id: number }>
  streamMap: Record<number, { name: string }>
}>()

defineEmits<{
  reportDetail: [id: number]
}>()

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
</script>

<template>
  <div class="reports-table-wrapper">
    <el-table v-loading="loading" :data="items" row-key="id" border>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expanded-content">
            <el-table :data="row.results" border size="small" style="width: 100%">
              <el-table-column label="Студент" min-width="180">
                <template #default="{ row: result }">
                  {{ getStudentName(result) }}
                </template>
              </el-table-column>
              <el-table-column label="Группа" min-width="150">
                <template #default="{ row: result }">
                  {{ getGroupName(result) }}
                </template>
              </el-table-column>
              <el-table-column label="Поток" min-width="150">
                <template #default="{ row: result }">
                  {{ getStreamName(result) }}
                </template>
              </el-table-column>
              <el-table-column label="Уверенность" min-width="110" align="center">
                <template #default="{ row: result }">
                  {{ (result.confidence * 100).toFixed(1) }}%
                </template>
              </el-table-column>
              <el-table-column label="Сходство" min-width="110" align="center">
                <template #default="{ row: result }">
                  <template v-if="result.similarity != null">
                    {{ (result.similarity * 100).toFixed(1) }}%
                  </template>
                  <template v-else>—</template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Дата" min-width="120">
        <template #default="{ row }">
          {{ row.lecture_date ? new Date(row.lecture_date).toLocaleDateString() : '—' }}
        </template>
      </el-table-column>
      <el-table-column label="№ пары" min-width="90" align="center">
        <template #default="{ row }">
          {{ row.lecture_num }}
        </template>
      </el-table-column>
      <el-table-column label="Изображение" min-width="100" align="center">
        <template #default="{ row }">
          <el-image
              v-if="row.image_path"
              :src="getPhotoUrl(row.image_path)"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[getPhotoUrl(row.image_path)]"
              preview-teleported
              :hide-on-click-modal=true
          />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="Распознано лиц" min-width="130" align="center">
        <template #default="{ row }">
          {{ row.results.filter((r: RecognitionResultPublicWithStudent) => r.student_id != null).length ?? 0 }} из {{ row.results.length ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" min-width="130" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="$emit('reportDetail', row.id)">
            Подробнее
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.reports-table-wrapper {
  overflow-x: auto;
}
.expanded-content {
  padding: 8px 16px;
  overflow-x: auto;
}
</style>