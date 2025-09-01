import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())

// 初始化驗證狀態（從 localStorage 恢復登入狀態）
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)
app.mount('#app')