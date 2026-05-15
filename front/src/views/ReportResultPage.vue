<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { useStreams } from '@/composables/useStreams'
import { useGroups } from '@/composables/useGroups'
import { useStudents } from '@/composables/useStudents'
import { readReportApiReportsDataIdGet, updateResultApiReportsResultsResultIdPut } from '@/api/client/sdk.gen'
import type {
  RecognitionDataPublicWithRecognitionResultAndStudent,
  RecognitionResultPublicWithStudent
} from '@/api/client/types.gen'
import ReportResultTable from '@/components/ReportResultTable.vue'
import EditRecognitionResultDialog from '@/components/EditRecognitionResultDialog.vue'
import BoundingBoxOverlay from '@/components/BoundingBoxOverlay.vue'
import { getPhotoUrl } from '@/utils/photoUrl'

const route = useRoute()
const router = useRouter()

const reportId = computed(() => Number(route.params.id))
const report = ref<RecognitionDataPublicWithRecognitionResultAndStudent | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// справочники
const { items: streams, fetchStreams } = useStreams()
const { items: groups, fetchGroups } = useGroups()
const { items: students, fetchStudents } = useStudents()
const groupMap = ref<Record<number, { name: string; stream_id: number }>>({})
const streamMap = ref<Record<number, { name: string }>>({})

// таблица: текущий выделенный результат (по ID)
const selectedResultId = ref<number | null>(null)

function handleTableSelect(resultId: number | null) {
  selectedResultId.value = resultId
}

// при клике на бокс – выделяем строку таблицы и сам бокс
function handleBoxClick(index: number) {
  if (report.value) {
    const result = report.value.results[index]
    selectedResultId.value = result?.id ?? null
  }
}

// диалог редактирования
const editDialogVisible = ref(false)
const editingResult = ref<RecognitionResultPublicWithStudent | null>(null)

function handleEdit(result: RecognitionResultPublicWithStudent) {
  editingResult.value = result
  editDialogVisible.value = true
}

async function handleEditSubmit({ resultId, studentId }: { resultId: number; studentId: number | null }) {
  try {
    await updateResultApiReportsResultsResultIdPut({
      path: { result_id: resultId },
      body: { student_id: studentId }
    })
    ElMessage.success('Результат обновлён')
    editDialogVisible.value = false
    await fetchReport() // обновить данные
  } catch (e: any) {
    ElMessage.error(e.message || 'Ошибка обновления')
  }
}

// загрузка отчёта
async function fetchReport() {
  if (!reportId.value) return
  loading.value = true
  error.value = null
  try {
    const { data } = await readReportApiReportsDataIdGet({ path: { data_id: reportId.value } })
    report.value = data ?? null
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки отчёта'
    ElMessage.error(error.value!)
  } finally {
    loading.value = false
  }
}

// загрузка справочников и построение мап
async function loadDictionaries() {
  await Promise.all([
    fetchStreams(null, null),
    fetchGroups(null, null),
    fetchStudents(null, null)
  ])
  const gMap: Record<number, { name: string; stream_id: number }> = {}
  groups.value.forEach(g => {
    gMap[g.id] = { name: g.name, stream_id: g.stream_id }
  })
  groupMap.value = gMap

  const sMap: Record<number, { name: string }> = {}
  streams.value.forEach(s => {
    sMap[s.id] = { name: s.name }
  })
  streamMap.value = sMap
}

onMounted(async () => {
  await loadDictionaries()
  await fetchReport()
})
</script>

<template>
  <div class="report-result-page">
    <el-button @click="router.back()" type="default" style="margin-bottom: 16px" :icon="Back">
      Назад к списку
    </el-button>

    <div v-if="loading" v-loading="loading" style="min-height: 200px" />

    <template v-else-if="report">
      <h2>Отчёт от {{ report.lecture_date ? new Date(report.lecture_date).toLocaleDateString() : '—' }}, пара №{{ report.lecture_num }}</h2>

      <BoundingBoxOverlay
          v-if="report.image_path"
          :image-url="getPhotoUrl(report.image_path)"
          :boxes="report.results"
          :highlighted-result-id="selectedResultId"
          @box-click="handleBoxClick"
          style="margin-bottom: 24px;"
      />

      <ReportResultTable
          :results="report.results"
          :loading="false"
          :group-map="groupMap"
          :stream-map="streamMap"
          :selected-id="selectedResultId"
          @select="handleTableSelect"
          @edit="handleEdit"
          style="margin-top: 16px"
      />
    </template>

    <el-empty v-else description="Отчёт не найден" />

    <EditRecognitionResultDialog
        v-model="editDialogVisible"
        :initial-result="editingResult"
        :students="students"
        :groups="groups"
        :streams="streams"
        @submit="handleEditSubmit"
    />
  </div>
</template>