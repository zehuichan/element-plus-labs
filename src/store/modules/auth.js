import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { defineStore } from 'pinia'

import { resetAllStores, useAccessStore, useUserStore } from '@/store'

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@/router/constant'

import { getInfo, login, logout as logoutApi } from '@/api/login'

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore()
  const userStore = useUserStore()
  const router = useRouter()

  const loginLoading = ref(false)
  const captcha = ref('')

  async function authLogin(params) {
    let userInfo = null
    try {
      loginLoading.value = true
      const res = await login(params)
      console.log(res)
      const { accessToken } = res.data
      console.log(accessToken)
      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken)

        // 获取用户信息并存储到 accessStore 中
        const fetchUserInfoResult = await fetchUserInfo()

        userInfo = fetchUserInfoResult

        userStore.setUserInfo(userInfo)
        accessStore.setAccessCodes([])

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false)
        } else {
          console.log(userInfo)
          await router.push(userInfo.homePath || DEFAULT_HOME_PATH)
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      loginLoading.value = false
    }

    return {
      userInfo,
    }
  }

  async function logout(redirect) {
    try {
      await logoutApi()
    } catch (e) {
      // 不做任何处理
      console.log(e)
    }

    resetAllStores()
    accessStore.setLoginExpired(false)

    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? { redirect: encodeURIComponent(router.currentRoute.value.fullPath) }
        : {}
    })
  }

  async function fetchUserInfo() {
    const res = await getInfo()
    userStore.setUserInfo(res.data)
    return res.data
  }

  function $reset() {
    loginLoading.value = false
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    logout,
    loginLoading,
  }
})
