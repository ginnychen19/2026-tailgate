import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'

// 建立 Vue Router 實例，定義所有前端路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      // 首頁路由，需登入
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      // 登入頁面，不需登入
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      // 觀眾頁面，需登入，roomId 為動態參數
      path: '/audience/:roomId',
      name: 'audience',
      component: () => import('@/views/Audience.vue'),
      meta: { requiresAuth: true }
    },
    {
      // 大螢幕顯示頁面，需登入，roomId 為動態參數
      path: '/screen/:roomId',
      name: 'screen',
      component: () => import('@/views/Screen.vue'),
      meta: { requiresAuth: true }
    },
    {
      // 管理後台頁面，需登入且需 admin 權限
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    }
  ]
})

// 全域路由守衛：每次路由跳轉前都會執行這段邏輯
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 1. 若目標路由需要認證但用戶未登入，導向登入頁
  if (to.meta.requiresAuth && !authStore.accessToken) {
    console.log('路由需要認證，跳轉到登入頁面')
    next('/login')
    return
  }
  
  // 2. 若已登入用戶訪問登入頁，根據角色自動導向正確頁面
  if (to.path === '/login' && authStore.accessToken) {
    const userRole = authStore.user?.role || 'audience'
    
    if (userRole === 'admin') {
      // 管理員導向首頁（管理選擇介面）
      console.log('管理員已登入，跳轉到首頁（選擇介面）')
      next('/')
    } else {
      // 一般用戶導向預設觀眾頁
      console.log('一般用戶已登入，跳轉到觀眾頁面')
      next('/audience/default-room')
    }
    return
  }
  
  // 3. 若訪問需要 admin 權限的頁面但用戶不是 admin，導向觀眾頁
  if (to.meta.role === 'admin') {
    const userRole = authStore.user?.role || 'audience'
    if (userRole !== 'admin') {
      console.log('非管理員用戶嘗試訪問管理頁面，跳轉到觀眾頁面')
      next('/audience/default-room')
      return
    }
  }
  
  // 4. 其他情況正常放行
  next()
})

export default router