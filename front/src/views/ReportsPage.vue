<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useReports } from '@/composables/useReports'
import { useStreams } from '@/composables/useStreams'
import { useGroups } from '@/composables/useGroups'
import { useStudents } from '@/composables/useStudents'
import ReportsTable from '@/components/ReportsTable.vue'
import ReportUploadDialog from '@/components/RecognizeUploadDialog.vue'

const router = useRouter()

const { items: streams, fetchStreams } = useStreams()
const { items: groups, fetchGroups } = useGroups()
const { items: students, fetchStudents } = useStudents()

const groupMap = ref<Record<number, { name: string; stream_id: number }>>({})
const streamMap = ref<Record<number, { name: string }>>({})

const filters = ref({
  lectureDate: null as string | null,
  lectureNum: null as number | null,
  streamId: null as number | null,
  groupId: null as number | null,
  studentId: null as number | null,
})

const { items: reports, loading, total, fetchReports } = useReports()

const currentPage = ref(1)
const pageSize = ref(10)

async function loadReportsPage() {
  await fetchReports(
      filters.value,
      (currentPage.value - 1) * pageSize.value,
      pageSize.value
  )
}

async function loadDictionaries() {
  try {
    await Promise.all([
      fetchStreams(null, null),
      fetchGroups(null, null),
      fetchStudents(null, null),
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
  } catch {
    ElMessage.error('Ошибка загрузки справочных данных')
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadReportsPage()
}
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadReportsPage()
}
function applyFilters() {
  currentPage.value = 1
  loadReportsPage()
}
function resetFilters() {
  filters.value = {
    lectureDate: null,
    lectureNum: null,
    streamId: null,
    groupId: null,
    studentId: null,
  }
  applyFilters()
}

const uploadDialogVisible = ref(false)
function onUploaded() {
  loadReportsPage()
}
function openReportDetail(id: number) {
  router.push(`/api/reports/${id}`)
}

onMounted(async () => {
  await loadDictionaries()
  await loadReportsPage()
})
</script>

<template>
  <div class="reports-page">
    <div class="filters">
      <el-date-picker
          v-model="filters.lectureDate"
          type="date"
          placeholder="Дата лекции"
          format="DD.MM.YYYY"
          value-format="YYYY-MM-DD"
          clearable
          style="width: 180px"
      />
      <el-input-number
          :model-value="filters.lectureNum"
          :min="1"
          placeholder="№ пары"
          controls-position="right"
          style="width: 130px"
          @update:model-value="(val: number | undefined) => filters.lectureNum = val === undefined ? null : val"
      />
      <el-select v-model="filters.streamId" placeholder="Поток" clearable style="width: 200px">
        <el-option v-for="s in streams" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-select v-model="filters.groupId" placeholder="Группа" clearable style="width: 200px">
        <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
      </el-select>
      <el-select v-model="filters.studentId" placeholder="Студент" clearable filterable style="width: 220px">
        <el-option v-for="st in students" :key="st.id" :label="st.name" :value="st.id" />
      </el-select>
      <el-button type="primary" @click="applyFilters">Применить</el-button>
      <el-button @click="resetFilters">Сбросить</el-button>
      <el-button type="success" style="margin-left: auto" @click="uploadDialogVisible = true">
        Загрузить фото для распознавания
      </el-button>
    </div>

    <ReportsTable
        :items="reports"
        :loading="loading"
        :group-map="groupMap"
        :stream-map="streamMap"
        style="margin-top: 16px"
        @report-detail="openReportDetail"
    />

    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 15, 20, 25]"
          background
          layout="prev, pager, next, sizes, total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <ReportUploadDialog v-model="uploadDialogVisible" @uploaded="onUploaded" />
  </div>
</template>

<style scoped>
.reports-page {
  padding: 16px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>