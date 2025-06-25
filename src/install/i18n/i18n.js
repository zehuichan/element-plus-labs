import { unref } from 'vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: '',
  messages: {},
})

let loadMessages

function loadLocalesMap(modules) {
  const localesMap = {}

  for (const [path, loadLocale] of Object.entries(modules)) {
    const key = path.match(/([\w-]*)\.(json)/)?.[1]
    if (key) {
      localesMap[key] = loadLocale
    }
  }

  return localesMap
}

/**
 * Load locale modules with directory structure
 * @param regexp - Regular expression to match language and file names
 * @param modules - The modules object containing paths and import functions
 * @returns A map of locales to their corresponding import functions
 */
function loadLocalesMapFromDir(regexp, modules) {
  const localesRaw = {}
  const localesMap = {}

  // Iterate over the modules to extract language and file names
  for (const path in modules) {
    const match = path.match(regexp)
    if (match) {
      const [_, locale, fileName] = match
      if (locale && fileName) {
        if (!localesRaw[locale]) {
          localesRaw[locale] = {}
        }
        if (modules[path]) {
          localesRaw[locale][fileName] = modules[path]
        }
      }
    }
  }

  // Convert raw locale data into async import functions
  for (const [locale, files] of Object.entries(localesRaw)) {
    localesMap[locale] = async () => {
      const messages = {}
      for (const [fileName, importFn] of Object.entries(files)) {
        messages[fileName] = (await importFn())?.default
      }
      return { default: messages }
    }
  }

  return localesMap
}

function setI18nLanguage(locale) {
  i18n.global.locale.value = locale

  document?.querySelector('html')?.setAttribute('lang', locale)
}

// setup i18n instance with glob
async function setupI18n(app, options = {}) {
  const { defaultLocale = 'zh-CN' } = options
  // app可以自行扩展一些第三方库和组件库的国际化
  loadMessages = options.loadMessages || (async () => ({}))
  app.use(i18n)
  await loadLocaleMessages(defaultLocale)

  // 在控制台打印警告
  i18n.global.setMissingHandler((locale, key) => {
    if (options.missingWarn && key.includes('.')) {
      console.warn(
        `[intlify] Not found '${key}' key in '${locale}' locale messages.`,
      )
    }
  })
}

async function loadLocaleMessages(lang) {
  if (unref(i18n.global.locale) === lang) {
    return setI18nLanguage(lang)
  }

  const mergeMessage = await loadMessages(lang)
  i18n.global.mergeLocaleMessage(lang, mergeMessage)

  return setI18nLanguage(lang)
}

export {
  i18n,
  loadLocaleMessages,
  loadLocalesMap,
  loadLocalesMapFromDir,
  setupI18n
}
