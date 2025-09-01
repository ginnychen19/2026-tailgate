<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- 房間標題 -->
    <div class="absolute top-4 left-4 z-10">
      <h1 class="text-2xl font-bold">{{ roomName }}</h1>
      <p class="text-gray-400">即時彈幕顯示</p>
    </div>

    <!-- 彈幕顯示區域 -->
    <div class="relative w-full h-screen">
      <!-- 彈幕容器 -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="danmaku in danmakuList"
          :key="danmaku.id"
          :style="danmaku.style"
          class="absolute text-white text-2xl font-bold whitespace-nowrap pointer-events-none"
          :class="danmaku.anonymous ? 'text-gray-400' : 'text-white'"
        >
          {{ danmaku.content }}
          <span v-if="!danmaku.anonymous && danmaku.user" class="text-sm text-gray-300 ml-2">
            - {{ danmaku.user.nickname || danmaku.user.name }}
          </span>
        </div>
      </div>

      <!-- 表情反應 -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="reaction in reactionList"
          :key="reaction.id"
          :style="reaction.style"
          class="absolute text-6xl pointer-events-none animate-bounce"
        >
          {{ reaction.emoji }}
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="absolute bottom-4 right-4 z-10">
      <div class="bg-gray-800 bg-opacity-80 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <button
            @click="clearScreen"
            class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
          >
            清空螢幕
          </button>
          <button
            @click="togglePause"
            :class="isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'"
            class="px-4 py-2 rounded-lg"
          >
            {{ isPaused ? '恢復' : '暫停' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io, Socket } from 'socket.io-client'

const route = useRoute()
const roomId = route.params.roomId as string
const roomName = ref('預設房間')

const danmakuList = ref<any[]>([])
const reactionList = ref<any[]>([])
const isPaused = ref(false)

let socket: Socket | null = null
let danmakuCounter = 0
let reactionCounter = 0

onMounted(() => {
  // 連接到 Socket.io
  socket = io('http://localhost:3001')
  
  socket.on('connect', () => {
    console.log('Screen connected to server')
    socket?.emit('room.join', { roomId })
  })

  socket.on('message.approved', (data) => {
    if (!isPaused.value) {
      addDanmaku(data)
    }
  })

  socket.on('reaction.push', (data) => {
    if (!isPaused.value) {
      addReaction(data)
    }
  })

  socket.on('room.cleared', () => {
    clearScreen()
  })
})

onUnmounted(() => {
  socket?.disconnect()
})

const addDanmaku = (data: any) => {
  const danmaku = {
    id: `danmaku-${++danmakuCounter}`,
    content: data.content,
    user: data.user,
    anonymous: data.anonymous,
    style: {
      top: `${Math.random() * 60 + 10}%`,
      left: '100%',
      transform: 'translateX(0)',
      transition: 'transform 8s linear'
    }
  }

  danmakuList.value.push(danmaku)

  // 動畫效果
  setTimeout(() => {
    danmaku.style.transform = 'translateX(-100vw)'
  }, 100)

  // 移除彈幕
  setTimeout(() => {
    const index = danmakuList.value.findIndex(d => d.id === danmaku.id)
    if (index > -1) {
      danmakuList.value.splice(index, 1)
    }
  }, 8000)
}

const addReaction = (data: any) => {
  const reaction = {
    id: `reaction-${++reactionCounter}`,
    emoji: data.emoji,
    style: {
      left: `${Math.random() * 80 + 10}%`,
      top: '100%',
      transform: 'translateY(0)',
      transition: 'transform 3s ease-out'
    }
  }

  reactionList.value.push(reaction)

  // 動畫效果
  setTimeout(() => {
    reaction.style.transform = 'translateY(-100vh)'
  }, 100)

  // 移除表情
  setTimeout(() => {
    const index = reactionList.value.findIndex(r => r.id === reaction.id)
    if (index > -1) {
      reactionList.value.splice(index, 1)
    }
  }, 3000)
}

const clearScreen = () => {
  danmakuList.value = []
  reactionList.value = []
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
</style>
