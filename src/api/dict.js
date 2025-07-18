import request from '@/utils/request'
import { resultSuccess } from './_util'


const DICT_DATA = (len = 100) => {
  const result = []

  for (let index = 0; index < len; index++) {
    result.push({
      id: `${index}`,
      label: `选项${index}`,
      value: `${index}`,
    })
  }
  return result
}

export function getDicts(dictType) {
  return new Promise((resolve, reject) => {
    resolve(resultSuccess(DICT_DATA(10)))
  })
}
