import { ref, computed, readonly } from 'vue'
import { loginForAccessTokenApiTokenPost, readUsersMeApiUsersMeGet } from '@/api/client/sdk.gen.ts'
import type { UserPublic } from '@/api/client/types.gen.ts'

const token = ref<string | null>(localStorage.getItem('access_token'))
const user = ref<UserPublic | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
)
const initialized = ref(false)

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value)

    async function login(username: string, password: string): Promise<boolean> {
        const resp = await loginForAccessTokenApiTokenPost({
            body: { username, password },
        })
        if (resp.data) {
            token.value = resp.data.access_token
            localStorage.setItem('access_token', resp.data.access_token)

            // Подтягиваем информацию о пользователе
            try {
                const userResp = await readUsersMeApiUsersMeGet()
                if (userResp.data) {
                    user.value = userResp.data
                    localStorage.setItem('user', JSON.stringify(userResp.data))
                }
            } catch {
                // Игнорируем – токен всё равно уже сохранён
            }
            return true
        }
        return false
    }

    async function fetchUser() {
        if (!token.value) return
        try {
            const userResp = await readUsersMeApiUsersMeGet()
            if (userResp.data) {
                user.value = userResp.data
                localStorage.setItem('user', JSON.stringify(userResp.data))
            } else {
                // Данные пользователя не получены – сбрасываем сессию
                logout()
            }
        } catch {
            // Любая сетевая/серверная ошибка – тоже сбрасываем
            logout()
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
    }

    async function init() {
        if (initialized.value) return
        initialized.value = true
        if (token.value) {
            await fetchUser()
        }
    }

    return {
        token: readonly(token),
        user: readonly(user),
        isAuthenticated: readonly(isAuthenticated),
        initialized: readonly(initialized),
        login,
        logout,
        fetchUser,
        init,
    }
}