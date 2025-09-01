<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          員工登入
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          請輸入您的公司 Email
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            v-model="email"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="your.email@company.com"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/" class="text-indigo-600 hover:text-indigo-500">
            返回首頁
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value) {
    error.value = '請輸入 Email'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value)
    
    // 登入成功後導向到觀眾頁面
    const roomId = 'default-room' // 實際應用中可能需要選擇房間
    router.push(`/audience/${roomId}`)
  } catch (err: any) {
    error.value = err.message || '登入失敗'
  } finally {
    loading.value = false
  }
}
</script>