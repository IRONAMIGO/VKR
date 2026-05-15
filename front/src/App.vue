<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import ruRu from 'element-plus/es/locale/lang/ru'
import { useRoute, useRouter } from 'vue-router'
import { isDark } from '@/composables/dark.ts'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth.ts'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

async function handleLogout() {
  logout()
  await router.push('/api/login')
}
</script>

<template>
  <el-config-provider :locale="ruRu">
    <el-container class="app-container">
      <el-header class="el-header">
        <el-menu
            mode="horizontal"
            router
            :default-active="route.path"
            class="header-menu"
        >
          <el-menu-item index="/api/streams">Потоки</el-menu-item>
          <el-menu-item index="/api/groups">Группы</el-menu-item>
          <el-menu-item index="/api/students">Студенты</el-menu-item>
          <el-menu-item index="/api/reports">Отчетность</el-menu-item>
        </el-menu>

        <div class="header-right">
          <template v-if="isAuthenticated && user">
            <span class="user-name">{{ user.user_name }}</span>
            <el-button size="small" @click="handleLogout">Выйти</el-button>
          </template>
          <div class="dark-toggle">
            <el-switch
                v-model="isDark"
                size="large"
                :active-icon="Moon"
                :inactive-icon="Sunny"
            />
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<style>
body {
  margin: 0;
}

.app-container {
  min-height: 100vh;
}

.el-header {
  display: flex;
  align-items: center;
  padding: 0;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-menu {
  flex: auto;
  border-bottom: none !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 32px;
}

.user-name {
  font-weight: 500;
}

.dark-toggle {
  display: flex;
  align-items: center;
}
</style>