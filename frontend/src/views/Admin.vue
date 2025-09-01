<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 導航欄 -->
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-xl font-bold text-gray-800">管理後台</h1>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">歡迎，{{ user?.name }}</span>
            <button @click="logout" class="text-red-500 hover:text-red-700">
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <!-- 標籤頁 -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- 房間管理 -->
      <div v-if="activeTab === 'rooms'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">房間管理</h2>
            <button
              @click="showCreateRoom = true"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              創建房間
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    房間名稱
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    創建時間
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="room in rooms" :key="room.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ room.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(room.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusText(room.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(room.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="clearRoom(room.id)"
                      class="text-red-600 hover:text-red-900 mr-3"
                    >
                      清空
                    </button>
                    <button
                      @click="exportRoomData(room.id)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      匯出
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 用戶管理 -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">白名單管理</h2>
            <button
              @click="showAddUser = true"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              新增用戶
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    暱稱
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in allowlistUsers" :key="user.email">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.nickname || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getRoleClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getRoleText(user.role) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="removeUser(user.email)"
                      class="text-red-600 hover:text-red-900"
                    >
                      移除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 彈幕審核 -->
      <div v-if="activeTab === 'moderation'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">彈幕審核</h2>
          <div class="space-y-4">
            <div
              v-for="message in pendingMessages"
              :key="message.id"
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="text-gray-900">{{ message.content }}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ message.user?.name }} ({{ message.user?.email }})
                    {{ formatDate(message.createdAt) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="approveMessage(message.id)"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    通過
                  </button>
                  <button
                    @click="rejectMessage(message.id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    拒絕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 創建房間對話框 -->
    <div v-if="showCreateRoom" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">創建房間</h3>
        <input
          v-model="newRoomName"
          type="text"
          placeholder="房間名稱"
          class="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <div class="flex justify-end space-x-2">
          <button
            @click="showCreateRoom = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            @click="createRoom"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            創建
          </button>
        </div>
      </div>
    </div>

    <!-- 新增用戶對話框 -->
    <div v-if="showAddUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">新增用戶</h3>
        <input
          v-model="newUser.email"
          type="email"
          placeholder="Email"
          class="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <input
          v-model="newUser.name"
          type="text"
          placeholder="姓名"
          class="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <input
          v-model="newUser.nickname"
          type="text"
          placeholder="暱稱 (選填)"
          class="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <select
          v-model="newUser.role"
          class="w-full border rounded-lg px-3 py-2 mb-4"
        >
          <option value="audience">觀眾</option>
          <option value="host">主持人</option>
          <option value="moderator">版主</option>
          <option value="admin">管理員</option>
        </select>
        <div class="flex justify-end space-x-2">
          <button
            @click="showAddUser = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            @click="addUser"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = authStore.user
const activeTab = ref('rooms')
const showCreateRoom = ref(false)
const showAddUser = ref(false)

const rooms = ref<any[]>([])
const allowlistUsers = ref<any[]>([])
const pendingMessages = ref<any[]>([])

const newRoomName = ref('')
const newUser = ref({
  email: '',
  name: '',
  nickname: '',
  role: 'audience'
})

const tabs = [
  { id: 'rooms', name: '房間管理' },
  { id: 'users', name: '用戶管理' },
  { id: 'moderation', name: '彈幕審核' }
]

onMounted(() => {
  loadRooms()
  loadAllowlistUsers()
  loadPendingMessages()
})

const loadRooms = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/rooms', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    if (response.ok) {
      rooms.value = await response.json()
    }
  } catch (error) {
    console.error('Load rooms error:', error)
  }
}

const loadAllowlistUsers = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/allowlist', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    if (response.ok) {
      allowlistUsers.value = await response.json()
    }
  } catch (error) {
    console.error('Load allowlist users error:', error)
  }
}

const loadPendingMessages = async () => {
  try {
    // 這裡需要實作載入待審核訊息的邏輯
    // 由於需要指定房間 ID，這裡先留空
  } catch (error) {
    console.error('Load pending messages error:', error)
  }
}

const createRoom = async () => {
  if (!newRoomName.value.trim()) return

  try {
    const response = await fetch('http://localhost:3001/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({ name: newRoomName.value })
    })

    if (response.ok) {
      newRoomName.value = ''
      showCreateRoom.value = false
      loadRooms()
    }
  } catch (error) {
    console.error('Create room error:', error)
  }
}

const addUser = async () => {
  if (!newUser.value.email || !newUser.value.name) return

  try {
    const response = await fetch('http://localhost:3001/api/allowlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify(newUser.value)
    })

    if (response.ok) {
      newUser.value = { email: '', name: '', nickname: '', role: 'audience' }
      showAddUser.value = false
      loadAllowlistUsers()
    }
  } catch (error) {
    console.error('Add user error:', error)
  }
}

const removeUser = async (email: string) => {
  if (!confirm('確定要移除這個用戶嗎？')) return

  try {
    const response = await fetch(`http://localhost:3001/api/allowlist/${email}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (response.ok) {
      loadAllowlistUsers()
    }
  } catch (error) {
    console.error('Remove user error:', error)
  }
}

const clearRoom = async (roomId: string) => {
  if (!confirm('確定要清空這個房間嗎？')) return

  try {
    const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (response.ok) {
      alert('房間已清空')
    }
  } catch (error) {
    console.error('Clear room error:', error)
  }
}

const exportRoomData = async (roomId: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({ roomId, format: 'csv' })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `room-${roomId}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Export error:', error)
  }
}

const approveMessage = async (messageId: string) => {
  // 實作審核通過邏輯
}

const rejectMessage = async (messageId: string) => {
  // 實作審核拒絕邏輯
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    case 'closed': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '運行中'
    case 'paused': return '暫停'
    case 'closed': return '關閉'
    default: return status
  }
}

const getRoleClass = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800'
    case 'moderator': return 'bg-purple-100 text-purple-800'
    case 'host': return 'bg-blue-100 text-blue-800'
    case 'audience': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return '管理員'
    case 'moderator': return '版主'
    case 'host': return '主持人'
    case 'audience': return '觀眾'
    default: return role
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
