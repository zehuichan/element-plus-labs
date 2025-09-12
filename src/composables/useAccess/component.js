import { defineComponent } from 'vue'

import { useAccess } from './index'

const UseAccess = defineComponent({
  name: 'UseAccess',
  props: {
    codes: () => [],
    type: 'role',
  },
  setup(props, { slots }) {

    const { hasAccessByCodes, hasAccessByRoles } = useAccess()

    const hasAuth = computed(() => {
      const { codes, type } = props
      return type === 'role' ? hasAccessByRoles(codes) : hasAccessByCodes(codes)
    })

    return () => (
      <>
        {!props.codes?.length ? slots.default?.() : hasAuth.value ? slots.default?.() : null}
      </>
    )
  }
})

export { UseAccess }
