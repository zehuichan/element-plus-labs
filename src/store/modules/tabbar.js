import { nextTick, toRaw } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { openRouteInNewWindow, startProgress, stopProgress } from '@/utils'

export const useTabbarStore = defineStore('tabbar', {
  actions: {
    async _bulkCloseByKeys(keys) {
      const keySet = new Set(keys)
      this.tabs = this.tabs.filter(
        (item) => !keySet.has(getTabKeyFromTab(item))
      )

      await this.updateCacheTabs()
    },
    _close(tab) {
      if (isAffixTab(tab)) {
        return
      }
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      index !== -1 && this.tabs.splice(index, 1)
    },
    async _goToDefaultTab(router) {
      if (this.getTabs.length <= 0) {
        return
      }
      const firstTab = this.getTabs[0]
      if (firstTab) {
        await this._goToTab(firstTab, router)
      }
    },
    async _goToTab(tab, router) {
      const { params, path, query } = tab
      const toParams = {
        params: params || {},
        path,
        query: query || {},
      }
      await router.replace(toParams)
    },
    addTab(routeTab) {
      let tab = cloneTab(routeTab)
      if (!tab.key) {
        tab.key = getTabKey(routeTab)
      }
      if (!isTabShown(tab)) {
        return tab
      }

      const tabIndex = this.tabs.findIndex((item) => {
        return equalTab(item, tab)
      })

      if (tabIndex === -1) {
        // 获取动态路由打开数，超过 0 即代表需要控制打开数
        const maxNumOfOpenTab = routeTab?.meta?.maxNumOfOpenTab ?? -1
        // 如果动态路由层级大于 0 了，那么就要限制该路由的打开数限制了
        // 获取到已经打开的动态路由数, 判断是否大于某一个值
        if (
          maxNumOfOpenTab > 0 &&
          this.tabs.filter((tab) => tab.name === routeTab.name).length >= maxNumOfOpenTab
        ) {
          // 关闭第一个
          const index = this.tabs.findIndex(
            (item) => item.name === routeTab.name,
          )
          index !== -1 && this.tabs.splice(index, 1)
        }
        this.tabs.push(tab)
      } else {
        // 页面已经存在，不重复添加选项卡，只更新选项卡参数
        const currentTab = toRaw(this.tabs)[tabIndex]
        const mergedTab = {
          ...currentTab,
          ...tab,
          meta: { ...currentTab?.meta, ...tab.meta },
        }
        if (currentTab) {
          const curMeta = currentTab.meta
          if (Reflect.has(curMeta, 'affixTab')) {
            mergedTab.meta.affixTab = curMeta.affixTab
          }
          if (Reflect.has(curMeta, 'newTabTitle')) {
            mergedTab.meta.newTabTitle = curMeta.newTabTitle
          }
        }

        tab = mergedTab
        this.tabs.splice(tabIndex, 1, mergedTab)
      }
      this.updateCacheTabs()
      return tab
    },
    async closeAllTabs(router) {
      const newTabs = this.tabs.filter((tab) => isAffixTab(tab))
      this.tabs = newTabs.length > 0 ? newTabs : [...this.tabs].splice(0, 1)
      await this._goToDefaultTab(router)
      this.updateCacheTabs()
    },
    async closeLeftTabs(tab) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))

      if (index < 1) {
        return
      }

      const leftTabs = this.tabs.slice(0, index)
      const keys = []

      for (const item of leftTabs) {
        if (!isAffixTab(item)) {
          keys.push(item.key)
        }
      }
      await this._bulkCloseByKeys(keys)
    },
    async closeOtherTabs(tab) {
      const closeKeys = this.tabs.map((item) => getTabKeyFromTab(item))

      const keys = []

      for (const key of closeKeys) {
        if (key !== getTabKeyFromTab(tab)) {
          const closeTab = this.tabs.find(
            (item) => getTabKeyFromTab(item) === key,
          )
          if (!closeTab) {
            continue
          }
          if (!isAffixTab(closeTab)) {
            keys.push(closeTab.key)
          }
        }
      }
      await this._bulkCloseByKeys(keys)
    },
    async closeRightTabs(tab) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))

      if (index >= 0 && index < this.tabs.length - 1) {
        const rightTabs = this.tabs.slice(index + 1)

        const keys = []
        for (const item of rightTabs) {
          if (!isAffixTab(item)) {
            keys.push(item.key)
          }
        }
        await this._bulkCloseByKeys(keys)
      }
    },
    async closeTab(tab, router) {
      const { currentRoute } = router

      // 关闭不是激活选项卡
      if (getTabKey(currentRoute.value) !== getTabKeyFromTab(tab)) {
        this._close(tab)
        this.updateCacheTabs()
        return
      }
      const index = this.getTabs.findIndex(
        (item) => getTabKeyFromTab(item) === getTabKey(currentRoute.value),
      )

      const before = this.getTabs[index - 1]
      const after = this.getTabs[index + 1]

      // 下一个tab存在，跳转到下一个
      if (after) {
        this._close(currentRoute.value)
        await this._goToTab(after, router)
        // 上一个tab存在，跳转到上一个
      } else if (before) {
        this._close(currentRoute.value)
        await this._goToTab(before, router)
      } else {
        console.error('Failed to close the tab; only one tab remains open.')
      }
    },
    async closeTabByKey(key, router) {
      const originKey = decodeURIComponent(key)
      const index = this.tabs.findIndex(
        (item) => getTabKeyFromTab(item) === originKey,
      )
      if (index === -1) {
        return
      }

      const tab = this.tabs[index]
      if (tab) {
        await this.closeTab(tab, router)
      }
    },
    getTabByKey(path) {
      return this.getTabs.find((item) => getTabKeyFromTab(item) === key)
    },
    async openTabInNewWindow(tab) {
      openRouteInNewWindow(tab.fullPath || tab.path)
    },
    async pinTab(tab) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      if (index === -1) {
        return
      }
      const oldTab = this.tabs[index]
      tab.meta.affixTab = true
      tab.meta.title = oldTab?.meta?.title
      // this.addTab(tab);
      this.tabs.splice(index, 1, tab)
      // 过滤固定tabs，后面更改affixTabOrder的值的话可能会有问题，目前行464排序affixTabs没有设置值
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))
      // 获得固定tabs的index
      const newIndex = affixTabs.findIndex((item) => equalTab(item, tab))
      // 交换位置重新排序
      await this.sortTabs(index, newIndex)
    },
    async refresh(router) {
      // 如果是Router路由，那么就根据当前路由刷新
      // 如果是string字符串，为路由名称，则定向刷新指定标签页，不能是当前路由名称，否则不会刷新
      if (typeof router === 'string') {
        return await this.refreshByName(router)
      }

      const { currentRoute } = router
      const { name } = currentRoute.value

      this.excludeCachedTabs.add(name)
      this.renderRouteView = false
      startProgress()

      await new Promise((resolve) => setTimeout(resolve, 200))

      this.excludeCachedTabs.delete(name)
      this.renderRouteView = true
      stopProgress()
    },
    async refreshByName(name) {
      this.excludeCachedTabs.add(name)
      await new Promise((resolve) => setTimeout(resolve, 200))
      this.excludeCachedTabs.delete(name)
    },
    async resetTabTitle(tab) {
      if (!tab?.meta?.newTabTitle) {
        return
      }
      const findTab = this.tabs.find((item) => equalTab(item, tab))
      if (findTab) {
        findTab.meta.newTabTitle = undefined
        await this.updateCacheTabs()
      }
    },
    setAffixTabs(tabs) {
      for (const tab of tabs) {
        tab.meta.affixTab = true
        this.addTab(routeToTab(tab))
      }
    },
    async setTabTitle(tab, title) {
      const findTab = this.tabs.find((item) => equalTab(item, tab))

      if (findTab) {
        findTab.meta.newTabTitle = title

        await this.updateCacheTabs()
      }
    },
    setUpdateTime() {
      this.updateTime = Date.now()
    },
    async sortTabs(oldIndex, newIndex) {
      const currentTab = this.tabs[oldIndex]
      if (!currentTab) {
        return
      }
      this.tabs.splice(oldIndex, 1)
      this.tabs.splice(newIndex, 0, currentTab)
      this.dragEndIndex = this.dragEndIndex + 1
    },
    async toggleTabPin(tab) {
      const affixTab = tab?.meta?.affixTab ?? false

      await (affixTab ? this.unpinTab(tab) : this.pinTab(tab))
    },
    async unpinTab(tab) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab))
      if (index === -1) {
        return
      }
      const oldTab = this.tabs[index]
      tab.meta.affixTab = false
      tab.meta.title = oldTab?.meta?.title
      // this.addTab(tab);
      this.tabs.splice(index, 1, tab)
      // 过滤固定tabs，后面更改affixTabOrder的值的话可能会有问题，目前行464排序affixTabs没有设置值
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))
      // 获得固定tabs的index,使用固定tabs的下一个位置也就是活动tabs的第一个位置
      const newIndex = affixTabs.length
      // 交换位置重新排序
      await this.sortTabs(index, newIndex)
    },
    updateCacheTabs() {
      const cacheMap = new Set()

      for (const tab of this.tabs) {
        // 跳过不需要持久化的标签页
        const keepAlive = tab.meta?.keepAlive
        if (!keepAlive) {
          continue
        }
        (tab.matched || []).forEach((t, i) => {
          if (i > 0) {
            cacheMap.add(t.name)
          }
        })

        const name = tab.name
        cacheMap.add(name)
      }
      this.cachedTabs = cacheMap
    },
  },
  getters: {
    affixTabs() {
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab))

      return affixTabs.sort((a, b) => {
        const orderA = a.meta?.affixTabOrder ?? 0
        const orderB = b.meta?.affixTabOrder ?? 0
        return orderA - orderB
      })
    },
    getCachedTabs() {
      return [...this.cachedTabs]
    },
    getExcludeCachedTabs() {
      return [...this.excludeCachedTabs]
    },
    getTabs() {
      const normalTabs = this.tabs.filter((tab) => !isAffixTab(tab))
      return [...this.affixTabs, ...normalTabs].filter(Boolean)
    },
  },
  persist: [
    {
      pick: ['tabs'],
      storage: sessionStorage,
    },
  ],
  state: () => ({
    cachedTabs: new Set(),
    dragEndIndex: 0,
    excludeCachedTabs: new Set(),
    renderRouteView: true,
    tabs: [],
    updateTime: Date.now(),
  }),
})

// 解决热更新问题
const hot = import.meta.hot
if (hot) {
  hot.accept(acceptHMRUpdate(useTabbarStore, hot))
}

function cloneTab(route) {
  if (!route) {
    return route
  }
  const { matched, meta, ...opt } = route
  return {
    ...opt,
    matched: matched
      ? matched.map((item) => ({
        meta: item.meta,
        name: item.name,
        path: item.path,
      }))
      : undefined,
    meta: {
      ...meta,
      newTabTitle: meta.newTabTitle,
    }
  }
}

function isAffixTab(tab) {
  return tab?.meta?.affixTab ?? false
}

function isTabShown(tab) {
  const matched = tab?.matched ?? []
  return !tab.meta.hideInTab && matched.every((item) => !item.meta.hideInTab)
}

function getTabKey(tab) {
  const {
    fullPath,
    path,
    meta: { fullPathKey } = {},
    query = {},
  } = tab
  // pageKey可能是数组（查询参数重复时可能出现）
  const pageKey = Array.isArray(query.pageKey)
    ? query.pageKey[0]
    : query.pageKey
  let rawKey
  if (pageKey) {
    rawKey = pageKey
  } else {
    rawKey = fullPathKey === false ? path : (fullPath ?? path)
  }
  try {
    return decodeURIComponent(rawKey)
  } catch {
    return rawKey
  }
}

function getTabKeyFromTab(tab) {
  return tab.key ?? getTabKey(tab)
}

function equalTab(a, b) {
  return getTabKeyFromTab(a) === getTabKeyFromTab(b)
}

function routeToTab(route) {
  return {
    meta: route.meta,
    name: route.name,
    path: route.path,
    key: getTabKey(route),
  }
}

export { getTabKey }
