<template>
  <plus-layout
    :header-height="preferences.header.height"
    :header-theme="headerTheme"

    :is-mobile="preferences.app.isMobile"

    :sidebar-theme="sidebarTheme"
    :sidebar-collapse="preferences.sidebar.collapsed"
    :sidebar-hidden="preferences.sidebar.hidden"
    :sidebar-width="preferences.sidebar.width"
    :sidebar-collapse-width="preferences.sidebar.collapseWidth"

    :tabbar-enable="preferences.tabbar.enable"
    :tabbar-height="preferences.tabbar.height"

    :footer-enable="preferences.footer.enable"
    :footer-fixed="preferences.footer.fixed"
    :footer-height="preferences.footer.height"

    :z-index="preferences.app.zIndex"

    @update:sidebar-collapse="
      (value) => updatePreferences({ sidebar: { collapsed: value } })
    "
  >
    <template v-if="preferences.widget.sidebarToggle" #toggle-button>
      <toggle-button class="mr-1" @click="toggleSidebar" />
    </template>
    <template v-if="preferences.widget.refresh" #refresh>
      <refresh class="mr-1" />
    </template>
    <template v-if="preferences.breadcrumb.enable" #breadcrumb>
      <breadcrumb
        :hide-when-only-one="preferences.breadcrumb.hideOnlyOne"
        :show-home="preferences.breadcrumb.showHome"
      />
    </template>
    <template v-if="preferences.app.enableCheckUpdates" #check-updates>
      <check-updates />
    </template>
    <template v-if="preferences.widget.globalSearch" #global-search>
      <global-search
        class="mr-1 sm:mr-4"
        :menus="menus"
        :enable-shortcut-key="globalSearchShortcutKey"
      />
    </template>
    <template #preferences>
      <preferences-button
        class="mr-1"
        @clear-preferences-and-logout="handleLogout"
      />
    </template>
    <template v-if="preferences.widget.themeToggle" #theme-toggle>
      <theme-toggle class="mr-1" />
    </template>
    <template v-if="preferences.widget.languageToggle" #language-toggle>
      <language-toggle class="mr-1" />
    </template>
    <template v-if="preferences.widget.fullscreen" #fullscreen>
      <full-screen class="mr-1" />
    </template>
    <template v-if="preferences.widget.notification" #notification>
      <notification class="mr-1" />
    </template>
    <template #user-dropdown>
      <userinfo />
    </template>
    <template v-if="preferences.tabbar.enable" #tabbar>
      <tabs-view />
    </template>
    <template #logo>
      logo
    </template>
    <template #menu>
      <menu-view
        :menus="menus"
        :theme="sidebarTheme"
        :collapse="preferences.sidebar.collapsed"
      />
    </template>
    <template #trigger>
      <sidebar-trigger
        v-model="sidebarCollapsed"
      />
    </template>
    <template #splitter>
      <splitter
        v-model="sidebarWidth"
        :collapse="preferences.sidebar.collapsed"
      />
    </template>
    <template #content-overlay>
      <content-spinner
        :enable="preferences.transition.loading"
      />
    </template>
    <template #footer>
      <copyright
        v-if="preferences.copyright.enable"
        v-bind="preferences.copyright"
      />
    </template>
    <template #extra>
      <el-backtop />
    </template>
  </plus-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useAccessStore, useAuthStore } from '@/store'
import { preferences, updatePreferences, usePreferences, } from '@/preferences'

import { PlusLayout } from '@/layouts/ui-kit/layout-ui'
import { TabsView } from '@/layouts/ui-kit/tabs-ui'
import { Menu as MenuView } from '@/layouts/ui-kit/menu-ui'
import {
  Breadcrumb,
  CheckUpdates,
  Copyright,
  GlobalSearch,
  Refresh,
  ToggleButton,
  Preferences as PreferencesButton,
  ThemeToggle,
  LanguageToggle,
  FullScreen,
  Notification,
  Userinfo,
  ContentSpinner,
  Splitter,
  SidebarTrigger,
} from '@/layouts/widgets'

const authStore = useAuthStore()
const accessStore = useAccessStore()

const { isDark, globalSearchShortcutKey } = usePreferences()

const menus = computed(() => accessStore.accessMenus)

const sidebarTheme = computed(() => {
  const dark = isDark.value || preferences.theme.semiDarkSidebar
  return dark ? 'dark' : 'light'
})

const sidebarCollapsed = computed({
  get: () => preferences.sidebar.collapsed,
  set: (value) => updatePreferences({ sidebar: { collapsed: value } })
})

const sidebarWidth = computed({
  get: () => preferences.sidebar.width,
  set: (value) => updatePreferences({ sidebar: { width: value } })
})

const headerTheme = computed(() => {
  const dark = isDark.value || preferences.theme.semiDarkHeader
  return dark ? 'dark' : 'light'
})

function toggleSidebar() {
  if (preferences.app.isMobile) {
    updatePreferences({ sidebar: { collapsed: false } })
  } else {
    updatePreferences({ sidebar: { hidden: !preferences.sidebar.hidden } })
  }
}

async function handleLogout() {
  await authStore.logout(false)
}
</script>

<style>

</style>
