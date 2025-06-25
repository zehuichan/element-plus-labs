import { resultSuccess } from './_util'
import { MENU_DATA } from './_data'

export function getAllMenusApi() {
  return new Promise((resolve, reject) => {
    resolve(resultSuccess(MENU_DATA))
  })
}
