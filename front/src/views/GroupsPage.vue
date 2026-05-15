<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useGroups } from '@/composables/useGroups'
import { useStreams } from '@/composables/useStreams'
import type { GroupPublicWithStream, GroupCreate, GroupUpdate } from '@/api/client/types.gen'
import GroupTable from '@/components/GroupTable.vue'
import GroupFormDialog from '@/components/GroupFormDialog.vue'

const { items: streams, fetchStreams } = useStreams()
fetchStreams() // Загружаем все потоки для фильтра

const selectedStreamId = ref<number | null | undefined>(undefined)
const {
  items,
  loading,
  total,
  fetchGroups,
  fetchGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} = useGroups(computed(() => selectedStreamId.value ?? undefined))

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10)
const offset = computed(() => (currentPage.value - 1) * pageSize.value)

async function loadPage() {
  await fetchGroups(offset.value, pageSize.value)
}

// Загрузка с учётом фильтра и пагинации
function onFilterChange() {
  currentPage.value = 1
  loadPage()
}

// Первичная загрузка
loadPage()

// Обработчики пагинации
function handlePageChange(page: number) {
  currentPage.value = page
  loadPage()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadPage()
}

const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('create')
const dialogData = ref<GroupPublicWithStream | undefined>(undefined)

function openCreateDialog() {
  dialogMode.value = 'create'
  dialogData.value = undefined
  dialogVisible.value = true
}

function openViewDialog(row: GroupPublicWithStream) {
  dialogMode.value = 'view'
  dialogData.value = row
  dialogVisible.value = true
}

async function openEditDialog(row: GroupPublicWithStream) {
  const data = await fetchGroup(row.id)
  if (!data) return
  dialogMode.value = 'edit'
  dialogData.value = data
  dialogVisible.value = true
}

async function confirmDelete(row: GroupPublicWithStream) {
  try {
    await ElMessageBox.confirm(`Удалить группу "${row.name}"?`, 'Подтверждение', {
      type: 'warning',
    })
    await deleteGroup(row.id)
    await loadPage()
  } catch {
    // отмена
  }
}

async function handleFormSubmit(data: GroupCreate | GroupUpdate) {
  if (dialogMode.value === 'edit' && dialogData.value) {
    await updateGroup(dialogData.value.id, data as GroupUpdate)
  } else {
    await createGroup(data as GroupCreate)
  }
  dialogVisible.value = false
  await loadPage()
}
</script>

<template>
  <div>
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px">
      <span>Фильтр по потоку:</span>
      <el-select
          v-model="selectedStreamId"
          placeholder="Все потоки"
          clearable
          style="width: 250px"
          @change="onFilterChange"
      >
        <el-option v-for="s in streams" :key="s.id" :label="s.name" :value="s.id" />
      </el-select>
      <el-button type="primary" @click="openCreateDialog">Добавить группу</el-button>
    </div>

    <GroupTable
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

    <GroupFormDialog
        v-model="dialogVisible"
        :mode="dialogMode"
        :initial-data="dialogData"
        :streams="streams"
        @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>

</style>