<template>
  <div class="relative h-full">
    <router-view v-slot="{ Component, route }">
      <keep-alive
        v-if="keepAlive"
        :exclude="getExcludeCachedTabs"
        :include="getCachedTabs"
      >
        <component
          :is="transformComponent(Component, route)"
          v-if="renderRouteView"
          :key="route.fullPath"
        />
      </keep-alive>
      <component
        :is="Component"
        v-else-if="renderRouteView"
        :key="route.fullPath"
      />
    </router-view>
  </div>
</template>

<script setup>
import { storeToRefs, useTabbarStore } from '@/store'

import { usePreferences } from '@/preferences'

const tabbarStore = useTabbarStore()
const { keepAlive } = usePreferences()

const { getCachedTabs, getExcludeCachedTabs, renderRouteView } = storeToRefs(tabbarStore)

function transformComponent(component, route) {
  // 组件视图未找到，如果有设置后备视图，则返回后备视图，如果没有，则抛出错误
  if (!component) {
    console.error(
      'Component view not found，please check the route configuration',
    )
    return undefined
  }

  const routeName = route.name
  // 如果组件没有 name，则直接返回
  if (!routeName) {
    return component
  }
  const componentName = component?.type?.name

  // 已经设置过 name，则直接返回
  if (componentName) {
    return component
  }

  // componentName 与 routeName 一致，则直接返回
  if (componentName === routeName) {
    return component
  }

  // 设置 name
  component.type ||= {}
  component.type.name = routeName

  return component
}
</script>

<style lang="scss">

</style>
