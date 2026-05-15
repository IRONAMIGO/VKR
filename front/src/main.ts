import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import { client } from '@/api/client/client.gen'

const app = createApp(App)
app.use(router)

// Интерсептор запросов – добавляет токен авторизации
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
        // Корректный способ установки заголовка через метод set()
        config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
});

// Интерсептор ответов – сбрасывает локальные данные при 401
(client.interceptors.response as any).use(
    (response: any) => response,
    (error: any) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
        }
        return Promise.reject(error)
    }
)

app.mount('#app')