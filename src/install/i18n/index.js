import {
  i18n,
  loadLocaleMessages,
  loadLocalesMap,
  loadLocalesMapFromDir,
  setupI18n
} from './i18n'

const $t = i18n.global.t
const $te = i18n.global.te

export {
  $t,
  $te,
  i18n,
  loadLocaleMessages,
  loadLocalesMap,
  loadLocalesMapFromDir,
  setupI18n
}

export { useI18n } from 'vue-i18n'
