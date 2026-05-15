<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useStreams } from '@/composables/useStreams'
import type { StreamPublic, StreamCreate, StreamUpdate } from '@/api/client/types.gen'
import StreamTable from '@/components/StreamTable.vue'
import StreamFormDialog from '@/components/StreamFormDialog.vue'

const {
  items,
  loading,
  total,
  fetchStreams,
  fetchStream,
  createStream,
  updateStream,
  deleteStream,
} = useStreams()

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10)
const offset = computed(() => (currentPage.value - 1) * pageSize.value)

async function loadPage() {
  await fetchStreams(offset.value, pageSize.value)
}

// Первичная загрузка
loadPage()

// Обработчики событий пагинации
function handlePageChange(page: number) {
  currentPage.value = page
  loadPage()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadPage()
}

// Диалоги и CRUD
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('create')
const dialogData = ref<StreamPublic | undefined>(undefined)

function openCreateDialog() {
  dialogMode.value = 'create'
  dialogData.value = undefined
  dialogVisible.value = true
}

function openViewDialog(row: StreamPublic) {
  dialogMode.value = 'view'
  dialogData.value = row
  dialogVisible.value = true
}

async function openEditDialog(row: StreamPublic) {
  const data = await fetchStream(row.id)
  if (!data) return
  dialogMode.value = 'edit'
  dialogData.value = data
  dialogVisible.value = true
}

async function confirmDelete(row: StreamPublic) {
  try {
    await ElMessageBox.confirm(`Удалить поток "${row.name}"?`, 'Подтверждение', {
      type: 'warning',
    })
    await deleteStream(row.id)
    // После удаления перегружаем текущую страницу
    await loadPage()
  } catch {
    // отмена
  }
}

async function handleFormSubmit(data: StreamCreate | StreamUpdate) {
  if (dialogMode.value === 'edit' && dialogData.value) {
    await updateStream(dialogData.value.id, data as StreamUpdate)
  } else {
    await createStream(data as StreamCreate)
  }
  dialogVisible.value = false
  // После создания/редактирования перегружаем текущую страницу
  await loadPage()
}
</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">Добавить поток</el-button>

    <StreamTable
        :items="items"
        :loading="loading"
        style="margin-top: 16px"
        @view="openViewDialog"
        @edit="openEditDialog"
        @delete="confirmDelete"
    />

    <div style="margin-top: 16px; display: flex; justify-content: flex-end">
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

    <StreamFormDialog
        v-model="dialogVisible"
        :mode="dialogMode"
        :initial-data="dialogData"
        @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>

</style>