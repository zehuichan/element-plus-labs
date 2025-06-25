import { ref } from 'vue'

import dayjs from 'dayjs'
import enLocale from 'element-plus/es/locale/lang/en'
import defaultLocale from 'element-plus/es/locale/lang/zh-cn'

import {
  $t,
  setupI18n as coreSetup,
  loadLocalesMapFromDir
} from '@/install/i18n'

import { preferences } from '@/preferences'

const elementLocale = ref(defaultLocale)

const modules = import.meta.glob('./langs/**/*.json')

const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
)

async function loadMessages(lang) {
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang]?.(),
    loadThirdPartyMessage(lang),
  ])
  return appLocaleMessages?.default
}

async function loadThirdPartyMessage(lang) {
  await Promise.all([loadElementLocale(lang), loadDayjsLocale(lang)])
}

async function loadDayjsLocale(lang) {
  let locale
  switch (lang) {
    case 'zh-CN': {
      locale = await import('dayjs/locale/zh-cn')
      break
    }
    case 'en-US': {
      locale = await import('dayjs/locale/en')
      break
    }
    // 默认使用英语
    default: {
      locale = await import('dayjs/locale/en')
    }
  }
  if (locale) {
    dayjs.locale(locale)
  } else {
    console.error(`Failed to load dayjs locale for ${lang}`)
  }
}

async function loadElementLocale(lang) {
  switch (lang) {
    case 'en-US': {
      elementLocale.value = enLocale
      break
    }
    case 'zh-CN': {
      elementLocale.value = defaultLocale
      break
    }
  }
}

async function setupI18n(app, options = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  })
}

export { useI18n } from 'vue-i18n'

export { $t, elementLocale, loadMessages, setupI18n }
