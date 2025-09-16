import { directiveHooks } from '@vueuse/core'

import { useAccess } from './index'

function isAccessible(el, binding) {
  const { accessMode, hasAccessByCodes, hasAccessByRoles } = useAccess()

  const value = binding.value

  if (!value) return
  const authMethod =
    accessMode.value === 'frontend' && binding.arg === 'role'
      ? hasAccessByRoles
      : hasAccessByCodes

  const values = Array.isArray(value) ? value : [value]

  if (!authMethod(values)) {
    el?.remove()
  }
}

const vAccess = {
  [directiveHooks.mounted](el, binding) {
    isAccessible(el, binding)
  }
}

export { vAccess }
