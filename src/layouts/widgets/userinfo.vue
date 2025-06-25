<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <div class="hover:bg-accent ml-1 mr-2 cursor-pointer rounded-full p-1.5">
        <div class="hover:text-accent-foreground flex-center">
          <el-avatar :src="userStore.userInfo?.avatar" :size="32" />
        </div>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="mr-2 min-w-[240px] p-0 pb-1 z-200">
      <DropdownMenuLabel class="flex items-center p-3">
        <div>
          <el-avatar :src="userStore.userInfo?.avatar" :size="30" />
        </div>
        <div class="ml-2 w-full">
          <div class="text-foreground mb-1 flex items-center text-sm font-medium">
            {{ userStore.userInfo?.realName }}
          </div>
          <div class="text-muted-foreground text-xs font-normal">
            {{ userStore.userInfo?.email }}
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="leading-6" @select="handleCenter">
        <re-icon class="mr-2" icon="park:user" />
        账户设置
        <DropdownMenuShortcut v-if="globalInformationShortcutKey">
          {{ altView }} M
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem class="leading-6" @select="handleLogout">
        <re-icon class="mr-2" icon="park:logout" />
        退出登录
        <DropdownMenuShortcut v-if="globalLogoutShortcutKey">
          {{ altView }} Q
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { computed } from 'vue'

import { useRouter } from 'vue-router'

import { useMagicKeys, whenever } from '@vueuse/core'

import { ElMessageBox } from 'element-plus'

import { useAuthStore, useUserStore } from '@/store'
import { preferences, usePreferences } from '@/preferences'
import { isWindowsOs } from '@/utils'

import { DropdownMenuLabel, DropdownMenuTrigger } from 'reka-ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator } from '@/components/dropdown-menu'

const props = defineProps({
  enableShortcutKey: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()

const userStore = useUserStore()
const authStore = useAuthStore()

const enableShortcutKey = computed(() => {
  return props.enableShortcutKey && preferences.shortcutKeys.enable
})

const {
  globalLogoutShortcutKey,
  globalInformationShortcutKey,
} = usePreferences()

const altView = computed(() => (isWindowsOs() ? 'Alt' : '⌥'))

const handleLogout = async () => {
  await ElMessageBox.confirm('是否退出登录?', '提示', { type: 'warning', })
  await authStore.logout(false)
}

const handleCenter = () => {
  router.push('/center')
}

if (enableShortcutKey.value) {
  const keys = useMagicKeys()
  whenever(keys['Alt+KeyQ'], () => {
    if (globalLogoutShortcutKey.value) {
      handleLogout()
    }
  })

  whenever(keys['Alt+KeyM'], () => {
    if (globalInformationShortcutKey.value) {
      handleCenter()
    }
  })
}
</script>

<style lang="scss">

</style>
