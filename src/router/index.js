import { nextTick } from 'vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import { accessRoutes, coreRouteNames, routes } from './routes'
import { generateAccess } from './access'
import { useAccessStore, useAuthStore, useUserStore } from '@/store'
import { LOGIN_PATH } from '@/router/constant'
import { preferences } from '@/preferences'

// 创建vue-router实例
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }
    return to.hash ? { behavior: 'smooth', el: to.hash } : { left: 0, top: 0 }
  },
  // 是否应该禁止尾部斜杠。
  // strict: true,
})

router.beforeEach(async (to, from) => {
  const accessStore = useAccessStore()

  if (accessStore.isAccessChecked) {
    console.log('Access already checked, proceeding...')
    return true
  }

  const { accessibleMenus, accessibleRoutes } = await generateAccess({
    roles: [],
    router,
    routes: accessRoutes,
  })

  accessStore.setAccessMenus(accessibleMenus)
  accessStore.setAccessRoutes(accessibleRoutes)
  accessStore.setIsAccessChecked(true)

  // 重新发起跳转，确保新注册的路由生效，正常访问
  return {
    ...router.resolve(decodeURIComponent(to.fullPath)),
    replace: true
  }
})


export { router }
