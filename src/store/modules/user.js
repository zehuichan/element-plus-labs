import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  actions: {
    setUserInfo(userInfo) {
      // 设置用户信息
      this.userInfo = userInfo
      // 设置角色信息
      const roles = userInfo?.roles ?? []
      this.setUserRoles(roles)
    },
    setUserRoles(roles) {
      this.userRoles = roles
    },
  },
  state: () => ({
    userInfo: null,
    userRoles: [],
  }),
})

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useUserStore, hot))
}
