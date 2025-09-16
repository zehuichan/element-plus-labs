<template>
  <div class="relative flex min-h-full w-full contain-style" content="Zehui Chan" z-index="300">
    <!--sidebar-->
    <layout-sidebar
      v-model:collapse="sidebarCollapse"
      :dom-visible="!isMobile"
      :is-mobile="isMobile"
      :show="!sidebarHidden"
      :theme="sidebarTheme"
      :width="getSidebarWidth"
      :collapse-width="getSidebarCollapseWidth"
      :z-index="getSidebarZIndex"
    >

      <template #logo>
        <slot name="logo"></slot>
      </template>
      <template #default>
        <slot name="menu"></slot>
      </template>
      <template #trigger>
        <slot name="trigger"></slot>
      </template>
      <template #splitter>
        <slot name="splitter"></slot>
      </template>
    </layout-sidebar>
    <div
      ref="contentRef"
      class="flex flex-1 flex-col overflow-hidden transition-all duration-200 ease-in"
    >
      <div
        :class="[SCROLL_FIXED_CLASS]"
        :style="headerWrapperStyle"
        class="overflow-hidden transition-all duration-200"
      >
        <!--header-->
        <layout-header
          :height="headerHeight"
          :theme="headerTheme"
        >
          <template #toggle-button>
            <slot name="toggle-button"></slot>
          </template>
          <template #refresh>
            <slot name="refresh"></slot>
          </template>
          <template #breadcrumb>
            <slot name="breadcrumb"></slot>
          </template>
          <template #check-updates>
            <slot name="check-updates"></slot>
          </template>
          <template #global-search>
            <slot name="global-search"></slot>
          </template>
          <template #preferences>
            <slot name="preferences"></slot>
          </template>
          <template #theme-toggle>
            <slot name="theme-toggle"></slot>
          </template>
          <template #language-toggle>
            <slot name="language-toggle"></slot>
          </template>
          <template #fullscreen>
            <slot name="fullscreen"></slot>
          </template>
          <template #notification>
            <slot name="notification"></slot>
          </template>
          <template #user-dropdown>
            <slot name="user-dropdown"></slot>
          </template>
        </layout-header>
        <!--tabbar-->
        <layout-tabbar
          v-if="tabbarEnable"
          :height="tabbarHeight"
        >
          <slot name="tabbar"></slot>
        </layout-tabbar>
      </div>
      <!--content-->
      <main
        class="bg-background-deep relative flex-1"
        :style="contentStyle"
      >
        <div class="relative h-full bg-background-deep">
          <layout-content />
          <slot name="content-overlay"></slot>
        </div>
      </main>
      <!--footer-->
      <layout-footer
        v-if="footerEnable"
        :fixed="footerFixed"
        :height="footerHeight"
        :width="getFooterWidth"
        :z-index="zIndex"
      >
        <slot name="footer"></slot>
      </layout-footer>
    </div>
    <slot name="extra"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutSidebar,
  LayoutTabbar,
} from './'
import { layoutProps } from './layout'

const props = defineProps(layoutProps)

const sidebarCollapse = defineModel('sidebarCollapse', { default: false })
const sidebarEnable = defineModel('sidebarEnable', { default: true })

const SCROLL_FIXED_CLASS = '_scroll__fixed_'

const headerFixed = computed(() => {
  const { headerMode } = props
  return (
    headerMode === 'fixed' ||
    headerMode === 'auto-scroll' ||
    headerMode === 'auto'
  )
})

const getSidebarZIndex = computed(() => {
  const { isMobile, zIndex } = props
  let offset = isMobile ? 1 : -1
  return zIndex + offset
})

const getHeaderWrapperHeight = computed(() => {
  let height = 0
  height += props.headerHeight
  if (props.tabbarEnable) {
    height += props.tabbarHeight
  }
  return height
})

const getSidebarCollapseWidth = computed(() => {
  const { isMobile, sidebarCollapseWidth } = props
  return isMobile ? 0 : sidebarCollapseWidth
})

const getSidebarWidth = computed(() => {
  const { isMobile, sidebarHidden, sidebarWidth } = props
  let width = 0

  if (sidebarHidden) {
    return width
  }

  if (!sidebarEnable.value || sidebarHidden) {
    return width
  }
  if (sidebarCollapse.value) {
    width = isMobile ? 0 : getSidebarCollapseWidth.value
  } else {
    width = sidebarWidth
  }
  return width
})

const getFooterWidth = computed(() => {
  if (!props.footerFixed) {
    return '100%'
  }
  return mainStyle.value.width
})

const mainStyle = computed(() => {
  let width = '100%'
  let sidebarAndExtraWidth = 'unset'

  if (!props.isMobile) {
    width = `calc(100% - ${getSidebarWidth.value}px)`
  }

  return {
    sidebarAndExtraWidth,
    width,
  }
})

const headerWrapperStyle = computed(() => {
  const fixed = headerFixed.value
  return {
    position: fixed ? 'fixed' : 'static',
    width: mainStyle.value.width,
    height: `${getHeaderWrapperHeight.value}px`,
    zIndex: props.zIndex
  }
})

const contentStyle = computed(() => {
  const fixed = headerFixed.value
  return {
    marginTop: fixed
      ? `${getHeaderWrapperHeight.value}px`
      : 0,
  }
})
</script>

<style lang="scss">

</style>
