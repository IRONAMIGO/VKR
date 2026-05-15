<script setup lang="ts">
import type { GroupPublicWithStream } from '@/api/client/types.gen'

defineProps<{
  items: GroupPublicWithStream[]
  loading: boolean
}>()

defineEmits<{
  view: [row: GroupPublicWithStream]
  edit: [row: GroupPublicWithStream]
  delete: [row: GroupPublicWithStream]
}>()
</script>

<template>
  <div class="table-wrapper">
    <el-table :data="items" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название" min-width="160" />
      <el-table-column label="Поток" min-width="120">
        <template #default="{ row }">
          {{ row.stream?.name ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" min-width="260" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="$emit('view', row)">Просмотр</el-button>
          <el-button size="small" type="primary" @click="$emit('edit', row)">Ред.</el-button>
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