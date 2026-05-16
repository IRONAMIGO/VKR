<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useStudents } from '@/composables/useStudents'
import { useGroups } from '@/composables/useGroups'
import type { StudentPublicWithGroup, StudentCreate, StudentUpdate } from '@/api/client/types.gen'
import StudentTable from '@/components/StudentTable.vue'
import StudentFormDialog from '@/components/StudentFormDialog.vue'

const router = useRouter()
const { items: groups, fetchGroups } = useGroups()
fetchGroups()

const selectedGroupId = ref<number | null | undefined>(undefined)
const {
  items,
  loading,
  total,
  fetchStudents,
  createStudent,
  deleteStudent,
} = useStudents(computed(() => selectedGroupId.value ?? undefined))

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10)
const offset = computed(() => (currentPage.value - 1) * pageSize.value)

async function loadPage() {
  await fetchStudents(offset.value, pageSize.value)
}

function onFilterChange() {
  currentPage.value = 1
  loadPage()
}

// Первичная загрузка
loadPage()

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
const dialogMode = ref<'create'>('create')
const dialogData = ref(undefined)

function openCreateDialog() {
  dialogMode.value = 'create'
  dialogData.value = undefined
  dialogVisible.value = true
}

async function confirmDelete(row: StudentPublicWithGroup) {
  try {
    await ElMessageBox.confirm(`Удалить студента "${row.name}"?`, 'Подтверждение', {
      type: 'warning',
    })
    await deleteStudent(row.id)
    await loadPage()
  } catch {
    // отмена
  }
}

async function handleFormSubmit(data: StudentCreate | StudentUpdate) {
  if (dialogMode.value === 'create') {
    await createStudent(data as StudentCreate)
    dialogVisible.value = false
    await loadPage()
  }
}

function onOpenStudent(row: StudentPublicWithGroup) {
  router.push(`/students/${row.id}`)
}
</script>

<template>
  <div>
    <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px">
      <span>Фильтр по группе:</span>
      <el-select
          v-model="selectedGroupId"
          placeholder="Все группы"
          clearable
          style="width: 250px"
          @change="onFilterChange"
      >
        <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
      </el-select>
      <el-button type="primary" @click="openCreateDialog">Добавить студента</el-button>
    </div>

    <StudentTable
        :items="items"
        :loading="loading"
        style="margin-top: 16px"
        @open="onOpenStudent"
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

    <StudentFormDialog
        v-model="dialogVisible"
        mode="create"
        :groups="groups"
        @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>

</style>