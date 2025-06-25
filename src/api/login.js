import { resultSuccess } from '@/api/_util'
import { USER_DATA } from '@/api/_data'

// 登录方法
export function login(data) {
  return Promise.resolve(resultSuccess(USER_DATA))
}

// 获取用户详细信息
export function getInfo() {
  return Promise.resolve(resultSuccess(USER_DATA))
}

// 退出方法
export function logout() {
  return Promise.resolve(resultSuccess())
}
