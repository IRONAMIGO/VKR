<script setup lang="ts">
import type { StudentPublicWithGroup } from '@/api/client/types.gen'

defineProps<{
  items: StudentPublicWithGroup[]
  loading: boolean
}>()

defineEmits<{
  open: [row: StudentPublicWithGroup]
  delete: [row: StudentPublicWithGroup]
}>()
</script>

<template>
  <div class="table-wrapper">
    <el-table :data="items" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="ФИО" min-width="160" />
      <el-table-column label="Группа" min-width="120">
        <template #default="{ row }">
          {{ row.group?.name ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" min-width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="$emit('open', row)">Открыть</el-button>
          <el-button size="small" type="danger" @click="$emit('delete', row)">Удалить</el-button>
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