import { computed } from 'vue'
import { diff, isDarkTheme } from '@/utils'
import { preferencesManager } from './preferences'

export function usePreferences() {
  const preferences = preferencesManager.getPreferences()
  const initialPreferences = preferencesManager.getInitialPreferences()

  const diffPreference = computed(() => {
    return diff(preferences, initialPreferences)
  })

  const appPreferences = computed(() => preferences.app)

  const shortcutKeysPreferences = computed(() => preferences.shortcutKeys)

  const isDark = computed(() => {
    return isDarkTheme(preferences.theme.mode)
  })

  const locale = computed(() => {
    return preferences.app.locale
  })

  const isMobile = computed(() => {
    return appPreferences.value.isMobile
  })

  const theme = computed(() => {
    return isDark.value ? 'dark' : 'light'
  })

  const isShowHeaderNav = computed(() => {
    return preferences.header.enable
  })

  const isFullContent = computed(
    () => appPreferences.value.layout === 'full-content',
  )

  const sidebarCollapsed = computed(() => {
    return preferences.sidebar.collapsed
  })

  const sidebarHidden = computed(() => {
    return preferences.sidebar.hidden
  })

  const keepAlive = computed(
    () => preferences.tabbar.enable && preferences.tabbar.keepAlive,
  )

  const contentIsMaximize = computed(() => {
    const headerIsHidden = preferences.header.hidden
    const sidebarIsHidden = preferences.sidebar.hidden
    return headerIsHidden && sidebarIsHidden && !isFullContent.value
  })

  const globalSearchShortcutKey = computed(() => {
    const { enable, globalSearch } = shortcutKeysPreferences.value
    return enable && globalSearch
  })

  const globalLogoutShortcutKey = computed(() => {
    const { enable, globalLogout } = shortcutKeysPreferences.value
    return enable && globalLogout
  })

  const globalInformationShortcutKey = computed(() => {
    const { enable, globalInformation } = shortcutKeysPreferences.value
    return enable && globalInformation
  })

  // todo
  const globalSavaShortcutKey = computed(() => {
    const { enable, globalSave } = shortcutKeysPreferences.value
    return enable && globalSave
  })

  const globalLockScreenShortcutKey = computed(() => {
    const { enable, globalLockScreen } = shortcutKeysPreferences.value
    return enable && globalLockScreen
  })

  return {
    contentIsMaximize,
    diffPreference,
    globalSearchShortcutKey,
    globalLogoutShortcutKey,
    globalInformationShortcutKey,
    globalLockScreenShortcutKey,
    isDark,
    isFullContent,
    isMobile,
    keepAlive,
    sidebarCollapsed,
    sidebarHidden,
    theme,
  }
}
