<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.ts'

const router = useRouter()
const { isAuthenticated } = useAuth()

const homeRoute = computed(() => (isAuthenticated.value ? '/api/students' : '/api/login'))

function goHome() {
  router.push(homeRoute.value)
}
</script>

<template>
  <div class="not-found-page">
    <el-result icon="warning" title="404" sub-title="Страница не найдена">
      <template #extra>
        <el-button type="primary" @click="goHome">Вернуться на главную</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px); /* высота с учётом хедера */
  padding: 16px;
  box-sizing: border-box;
}

/* Адаптивность для планшетов и небольших экранов */
@media (max-width: 768px) {
  .not-found-page {
    min-height: calc(100vh - 80px);
    padding: 8px;
  }
}
</style>