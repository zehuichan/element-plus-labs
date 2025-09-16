import { computed } from 'vue'
import { useAccessStore, useUserStore } from '@/store'
import { preferences, updatePreferences } from '@/preferences'

export function useAccess() {
  const accessStore = useAccessStore()
  const userStore = useUserStore()

  const accessMode = computed(() => {
    return preferences.app.accessMode
  })

  function hasAccessByRoles(roles) {
    const userRoleSet = new Set(userStore.userRoles)
    const intersection = roles.filter((item) => userRoleSet.has(item))
    return intersection.length > 0
  }

  function hasAccessByCodes(codes) {
    const userCodesSet = new Set(accessStore.accessCodes)
    const intersection = codes.filter((item) => userCodesSet.has(item))
    return intersection.length > 0
  }

  // todo 控制字段权限
  function hasAccessByFileds(fields, def = true) {
    if (!fields) {
      return def
    }
    const userFieldsSet = new Set(accessStore.accessFields)
    const values = Array.isArray(fields) ? fields : [fields]
    const intersection = values.filter((item) => userFieldsSet.has(item))
    return intersection.length > 0
  }

  function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode: preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    })
  }

  return {
    accessMode,
    hasAccessByCodes,
    hasAccessByRoles,
    hasAccessByFileds,
    toggleAccessMode
  }
}
