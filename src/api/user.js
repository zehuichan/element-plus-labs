import { resultSuccess } from './_util'
import { USER_DATA } from '@/api/_data'

export function loginApi(data) {
  return Promise.resolve(resultSuccess(USER_DATA))
}

export function getUserInfoApi() {
  return Promise.resolve(resultSuccess(USER_DATA))
}

export function getAccessCodesApi() {
  return Promise.resolve(resultSuccess(USER_DATA))
}
