<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-8">
        🎉 尾牙彈幕互動系統
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <!-- 觀眾入口 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-6xl mb-4">👥</div>
          <h2 class="text-xl font-semibold mb-4">觀眾參與</h2>
          <p class="text-gray-600 mb-4">發送彈幕和表情，參與現場互動</p>
          <router-link 
            to="/login" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-block"
          >
            開始參與
          </router-link>
        </div>

        <!-- 大螢幕顯示 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-6xl mb-4">🖥️</div>
          <h2 class="text-xl font-semibold mb-4">大螢幕顯示</h2>
          <p class="text-gray-600 mb-4">彈幕和表情雨的即時顯示</p>
          <button 
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            @click="goToScreen"
          >
            開啟大螢幕
          </button>
        </div>

        <!-- 管理後台 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-6xl mb-4">⚙️</div>
          <h2 class="text-xl font-semibold mb-4">管理後台</h2>
          <p class="text-gray-600 mb-4">審核彈幕、管理房間設定</p>
          <router-link 
            to="/admin" 
            class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg inline-block"
          >
            管理後台
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const goToScreen = () => {
  // 假設有預設房間 ID，實際應用中可能需要選擇房間
  const roomId = 'default-room'
  router.push(`/screen/${roomId}`)
}

// 檢查登入狀態，根據角色決定是否跳轉
onMounted(() => {
  if (authStore.accessToken) {
    const userRole = authStore.user?.role || 'audience'
    
    if (userRole !== 'admin') {
      console.log('一般用戶已登入，自動跳轉到觀眾頁面')
      router.push('/audience/default-room')
    } else {
      console.log('管理員已登入，顯示選擇介面')
      // 管理員留在首頁，可以看到所有選項
    }
  }
})
</script>