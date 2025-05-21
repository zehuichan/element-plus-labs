import { preferencesManager } from './preferences'

function defineOverridesPreferences(preferences) {
  return preferences
}

// 偏好设置（带有层级关系）
const preferences = preferencesManager.getPreferences.apply(preferencesManager)

// 更新偏好设置
const updatePreferences = preferencesManager.updatePreferences.bind(preferencesManager)

// 重置偏好设置
const resetPreferences = preferencesManager.resetPreferences.bind(preferencesManager)

const clearPreferencesCache = preferencesManager.clearCache.bind(preferencesManager)

// 初始化偏好设置
const initPreferences = preferencesManager.initPreferences.bind(preferencesManager)

export {
  defineOverridesPreferences,
  clearPreferencesCache,
  initPreferences,
  preferences,
  preferencesManager,
  resetPreferences,
  updatePreferences,
}

export * from './overrides'
export * from './use-preferences'
