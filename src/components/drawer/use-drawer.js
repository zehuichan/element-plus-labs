import { defineComponent, h, inject, nextTick, provide, reactive, ref } from 'vue'
import { useStore } from '@/utils/store'

import { DrawerApi } from './drawer-api'

import _Drawer from './drawer.vue'

const USER_DRAWER_INJECT_KEY = Symbol('DRAWER_INJECT')

const DEFAULT_DRAWER_PROPS = {}

export function setDefaultDrawerProps(props) {
  Object.assign(DEFAULT_DRAWER_PROPS, props)
}

export function useDrawer(options = {}) {
  const { connectedComponent } = options
  if (connectedComponent) {
    const extendedApi = reactive({})
    const isDrawerReady = ref(true)

    const Drawer = defineComponent(
      (props, { attrs, slots }) => {
        provide(USER_DRAWER_INJECT_KEY, {
          extendApi(api) {
            Object.setPrototypeOf(extendedApi, api)
          },
          options,
          async reCreateDrawer() {
            isDrawerReady.value = false
            await nextTick()
            isDrawerReady.value = true
          },
        })
        checkProps(extendedApi, {
          ...props,
          ...attrs,
          ...slots
        })
        return () =>
          h(
            isDrawerReady.value ? connectedComponent : 'div',
            {
              ...props,
              ...attrs
            },
            slots,
          )
      },
      {
        inheritAttrs: false,
      },
    )
    return [Drawer, extendedApi]
  }

  const injectData = inject(USER_DRAWER_INJECT_KEY, {})

  const mergedOptions = {
    ...DEFAULT_DRAWER_PROPS,
    ...injectData.options,
    ...options,
  }

  mergedOptions.onOpenChange = (isOpen) => {
    options.onOpenChange?.(isOpen)
    injectData.options?.onOpenChange?.(isOpen)
  }

  const onClosed = mergedOptions.onClosed

  mergedOptions.onClosed = () => {
    onClosed?.()
    if (mergedOptions.destroyOnClose) {
      injectData.reCreateDrawer?.()
    }
  }
  const api = new DrawerApi(mergedOptions)

  const extendedApi = api

  extendedApi.useStore = (selector) => {
    return useStore(api.store, selector)
  }

  const Drawer = defineComponent(
    (props, { attrs, slots }) => {
      return () =>
        h(
          _Drawer,
          { ...props, ...attrs, drawerApi: extendedApi },
          slots
        )
    },
    {
      inheritAttrs: false,
    },
  )
  injectData.extendApi?.(extendedApi)
  return [Drawer, extendedApi]
}

async function checkProps(api, attrs) {
  if (!attrs || Object.keys(attrs).length === 0) {
    return
  }
  await nextTick()

  const state = api?.store?.state

  if (!state) {
    return
  }

  const stateKeys = new Set(Object.keys(state))

  for (const attr of Object.keys(attrs)) {
    if (stateKeys.has(attr) && !['class'].includes(attr)) {
      console.warn(
        `[Drawer]: When 'connectedComponent' exists, do not set props or slots '${attr}', which will increase complexity. If you need to modify the props of Drawer, please use useVbenDrawer or api.`,
      )
    }
  }
}
