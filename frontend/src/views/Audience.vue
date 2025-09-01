<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- 房間資訊 -->
    <div class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">{{ roomName }}</h1>
          <p class="text-gray-400">歡迎，{{ user?.nickname || user?.name }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-green-400">● 已連線</span>
          <button @click="logout" class="text-red-400 hover:text-red-300">
            登出
          </button>
        </div>
      </div>
    </div>

    <!-- 彈幕顯示區域 -->
    <div class="container mx-auto p-4">
      <div class="bg-black rounded-lg p-4 min-h-96 mb-6 relative overflow-hidden">
        <div class="text-center text-gray-500 mb-4">彈幕顯示區域</div>
        <!-- 這裡會顯示即時彈幕 -->
      </div>

      <!-- 發送彈幕 -->
      <div class="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 class="text-lg font-semibold mb-4">發送彈幕</h3>
        <div class="flex space-x-4">
          <input
            v-model="message"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="輸入您的彈幕..."
            class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="100"
          />
          <label class="flex items-center space-x-2">
            <input
              v-model="anonymous"
              type="checkbox"
              class="rounded"
            />
            <span>匿名發送</span>
          </label>
          <button
            @click="sendMessage"
            :disabled="!message.trim() || sending"
            class="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-2 rounded-lg"
          >
            {{ sending ? '發送中...' : '發送' }}
          </button>
        </div>
        <div class="text-sm text-gray-400 mt-2">
          還剩 {{ 100 - message.length }} 字元
        </div>
      </div>

      <!-- 表情反應 -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">表情反應</h3>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="sendReaction(emoji)"
            :disabled="sendingReaction"
            class="text-4xl hover:scale-110 transition-transform disabled:opacity-50"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { io, Socket } from 'socket.io-client'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const roomId = route.params.roomId as string
const roomName = ref('預設房間')
const user = authStore.user

const message = ref('')
const anonymous = ref(false)
const sending = ref(false)
const sendingReaction = ref(false)
const emojis = ['👍', '😂', '😭', '🎉']

let socket: Socket | null = null

onMounted(async () => {
  // 檢查用戶是否已登入
  if (!authStore.accessToken) {
    console.log('用戶未登入，跳轉到登入頁面')
    router.push('/login')
    return
  }

  // 連接到 Socket.io
  socket = io()
  
  socket.on('connect', () => {
    console.log('Connected to server')
    socket?.emit('room.join', { roomId })
  })

  socket.on('message.approved', (data) => {
    console.log('Message approved:', data)
    // 這裡可以處理彈幕顯示
  })

  socket.on('reaction.push', (data) => {
    console.log('Reaction received:', data)
    // 這裡可以處理表情反應顯示
  })
})

onUnmounted(() => {
  socket?.disconnect()
})

const sendMessage = async () => {
  if (!message.value.trim() || sending.value) return

  sending.value = true
  try {
    const response = await fetch(`/api/messages/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({
        content: message.value.trim(),
        anonymous: anonymous.value
      })
    })

    if (response.ok) {
      message.value = ''
    } else {
      const error = await response.json()
      alert(error.error || '發送失敗')
    }
  } catch (error) {
    console.error('Send message error:', error)
    alert('發送失敗')
  } finally {
    sending.value = false
  }
}

const sendReaction = async (emoji: string) => {
  if (sendingReaction.value) return

  sendingReaction.value = true
  try {
    const response = await fetch(`/api/reactions/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({ emoji, mode: 'rain' })
    })

    if (!response.ok) {
      const error = await response.json()
      alert(error.error || '發送失敗')
    }
  } catch (error) {
    console.error('Send reaction error:', error)
    alert('發送失敗')
  } finally {
    sendingReaction.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
