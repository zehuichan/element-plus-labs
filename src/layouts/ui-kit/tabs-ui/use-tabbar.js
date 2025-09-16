import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAccessStore, useTabbarStore } from '@/store'
import { filterTree } from '@/utils/tree-helper'
import { useTabs } from '@/composables/use-tabs'
import { useI18n } from '@/locales'
import {
  CloseOne,
  CloseSmall,
  NewEfferent,
  Pin,
  Pushpin,
  Redo,
  ToLeft,
  ToRight,
  TransferData
} from '@icon-park/vue-next'

export function useTabbar(props) {
  const router = useRouter()
  const route = useRoute()
  const accessStore = useAccessStore()
  const tabbarStore = useTabbarStore()

  const {
    closeAllTabs,
    closeCurrentTab,
    closeLeftTabs,
    closeOtherTabs,
    closeRightTabs,
    closeTabByKey,
    getTabDisableState,
    openTabInNewWindow,
    refreshTab,
    toggleTabPin,
  } = useTabs()

  const { locale } = useI18n()

  const currentActive = computed(() => {
    return route.fullPath
  })

  const currentTabs = ref()

  watch(
    [
      () => tabbarStore.getTabs,
      () => tabbarStore.updateTime,
      () => locale.value,
    ],
    ([tabs]) => {
      currentTabs.value = tabs.map((tab) => {
        return {
          ...tab,
        }
      })
    },
  )

  /**
   * 初始化固定标签页
   */
  const initAffixTabs = () => {
    const affixTabs = filterTree(router.getRoutes(), (route) => {
      return !!route.meta?.affixTab
    })
    tabbarStore.setAffixTabs(affixTabs)
  }

  // 点击tab,跳转路由
  const handleClick = (key) => {
    router.push(key)
  }

  // 关闭tab
  const handleClose = async (key) => {
    await closeTabByKey(key)
  }

  function wrapperTabLocale(tab) {
    return {
      ...tab,
      meta: {
        ...tab?.meta,
        title: tab?.meta?.title,
      },
    }

  }

  watch(
    () => accessStore.accessMenus,
    () => {
      initAffixTabs()
    },
    { immediate: true },
  )

  watch(
    () => route.fullPath,
    () => {
      const meta = route.matched?.[route.matched.length - 1]?.meta
      tabbarStore.addTab({
        ...route,
        meta: meta || route.meta,
      })
    },
    { immediate: true },
  )

  const createContextMenus = (tab) => {
    const {
      disabledCloseAll,
      disabledCloseCurrent,
      disabledCloseLeft,
      disabledCloseOther,
      disabledCloseRight,
      disabledRefresh,
    } = getTabDisableState(tab)

    const affixTab = tab?.meta?.affixTab ?? false

    const menus = [
      {
        disabled: disabledCloseCurrent,
        handler: async () => {
          await closeCurrentTab(tab)
        },
        icon: CloseSmall,
        key: 'close',
        text: '关闭',
      },
      {
        handler: async () => {
          await toggleTabPin(tab)
        },
        icon: affixTab ? Pin : Pushpin,
        key: 'affix',
        text: affixTab ? '取消固定' : '固定',
      },
      {
        disabled: disabledRefresh,
        handler: refreshTab,
        icon: Redo,
        key: 'reload',
        text: '重新加载',
      },
      {
        handler: async () => {
          await openTabInNewWindow(tab)
        },
        icon: NewEfferent,
        key: 'open-in-new-window',
        separator: true,
        text: '在新窗口打开',
      },

      {
        disabled: disabledCloseLeft,
        handler: async () => {
          await closeLeftTabs(tab)
        },
        icon: ToLeft,
        key: 'close-left',
        text: '关闭左侧标签页',
      },
      {
        disabled: disabledCloseRight,
        handler: async () => {
          await closeRightTabs(tab)
        },
        icon: ToRight,
        key: 'close-right',
        separator: true,
        text: '关闭右侧标签页',
      },
      {
        disabled: disabledCloseOther,
        handler: async () => {
          await closeOtherTabs(tab)
        },
        icon: TransferData,
        key: 'close-other',
        text: '关闭其他标签页',
      },
      {
        disabled: disabledCloseAll,
        handler: closeAllTabs,
        icon: CloseOne,
        key: 'close-all',
        text: '关闭全部标签页',
      },
    ]
    return menus
  }

  return {
    createContextMenus,
    currentActive,
    currentTabs,
    handleClick,
    handleClose,
  }
}
