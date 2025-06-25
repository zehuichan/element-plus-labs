import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAccessStore = defineStore('access', {
  actions: {
    getMenuByPath(path) {
      function findMenu(menus, path) {
        for (const menu of menus) {
          if (menu.path === path) {
            return menu
          }
          if (menu.children) {
            const matched = findMenu(menu.children, path)
            if (matched) {
              return matched
            }
          }
        }
      }

      return findMenu(this.accessMenus, path)
    },
    setAccessCodes(codes) {
      this.accessCodes = codes
    },
    setAccessMenus(menus) {
      this.accessMenus = menus
    },
    setAccessRoutes(routes) {
      this.accessRoutes = routes
    },
    setAccessToken(token) {
      this.accessToken = token
    },
    setIsAccessChecked(isAccessChecked) {
      this.isAccessChecked = isAccessChecked
    },
    setLoginExpired(loginExpired) {
      this.loginExpired = loginExpired
    },
    setRefreshToken(token) {
      this.refreshToken = token
    },
  },
  persist: {
    // 持久化
    pick: ['accessToken', 'refreshToken', 'accessCodes'],
  },
  state: () => ({
    accessCodes: [],
    accessFields: [],
    accessMenus: [],
    accessRoutes: [],
    accessToken: null,
    isAccessChecked: false,
    loginExpired: false,
    refreshToken: null,
  })
})

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot))
}
