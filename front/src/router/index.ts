import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth.ts'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/LoginPage.vue'),
        },
        {
            path: '/streams',
            component: () => import('@/views/StreamsPage.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/groups',
            component: () => import('@/views/GroupsPage.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/students',
            component: () => import('@/views/StudentsPage.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/students/:id',
            name: 'StudentDetail',
            component: () => import('@/views/StudentDetailPage.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/reports',
            component: () => import('@/views/ReportsPage.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/reports/:id',
            component: () => import('@/views/ReportResultPage.vue'),
            meta: { requiresAuth: true },
        },
        // Catch‑all для всех неизвестных маршрутов
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/NotFoundPage.vue'),
        },
    ],
})

router.beforeEach(async (to, _from) => {
    const auth = useAuth()

    // Дожидаемся первой инициализации (чтение токена, запрос профиля)
    if (!auth.initialized.value) {
        await auth.init()
    }

    if (to.path === '/api/login') {
        // Если уже залогинен, перенаправляем на защищённую страницу
        if (auth.isAuthenticated.value) {
            return '/api/reports'
        }
        return true
    }

    // Для защищённых маршрутов проверяем аутентификацию
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!auth.isAuthenticated.value) {
            return {
                path: '/api/login',
                query: { redirect: to.fullPath },
            }
        }
    }

    return true
})

export default router