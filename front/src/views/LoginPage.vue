<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/composables/useAuth.ts'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

async function handleLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('Введите имя пользователя и пароль')
    return
  }
  loading.value = true
  try {
    const success = await auth.login(form.username, form.password)
    if (success) {
      ElMessage.success('Вход выполнен')
      const redirect = (route.query.redirect as string) || '/api/students'
      await router.push(redirect)
    } else {
      ElMessage.error('Неверное имя пользователя или пароль')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || 'Ошибка входа')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <template #header>
        <h2>Вход в систему</h2>
      </template>
      <el-form
          label-position="top"
          @submit.prevent="handleLogin"
      >
        <el-form-item label="Имя пользователя">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="Пароль">
          <el-input
              v-model="form.password"
              type="password"
              show-password
              autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              style="width: 100%"
          >
            Войти
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 16px;
}
.login-card {
  width: 100%;
  max-width: 400px;
}
h2 {
  margin: 0;
  text-align: center;
}
</style>