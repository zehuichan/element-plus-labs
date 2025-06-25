<template>
  <div>
    <div
      class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-8 w-8 px-1 text-lg hover:bg-accent hover:text-accent-foreground text-foreground/80 rounded-full cursor-pointer"
      @click="open=true"
    >
      <re-icon icon="svg:settings" size="16" />
    </div>
    <drawer v-model="open" title="编好设置" size="24rem" @closed="handleClosed">
      <el-segmented class="custom-segmented" v-model="activeTab" :options="TAB_PRESET" block />
      <template v-if="activeTab==='appearance'">
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">主题</h3>
          <div class="flex w-full flex-wrap justify-between">
            <template v-for="theme in THEME_PRESET" :key="theme.value">
              <div
                class="flex cursor-pointer flex-col"
                @click="listen('theme','mode', theme.value)"
              >
                <div
                  class="border rounded-md flex-center py-4 hover:border-primary transition-all duration-150"
                  :class="{
                    'border-primary': preferences.theme.mode === theme.value,
                  }"
                >
                  <re-icon :icon="theme.icon" class="mx-9 size-5" />
                </div>
                <div class="text-muted-foreground mt-2 text-center text-xs">
                  {{ theme.label }}
                </div>
              </div>
            </template>
            <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5 mt-6">
              <div class="flex items-center text-[13px]">深色侧边栏</div>
              <el-switch
                :model-value="preferences.theme.semiDarkSidebar"
                :disabled="isDark"
                @change="listen('theme','semiDarkSidebar', $event)"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">其他</h3>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">色弱模式</div>
            <el-switch
              :model-value="preferences.app.colorWeakMode"
              @change="listen('app', 'colorWeakMode', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">灰色模式</div>
            <el-switch
              :model-value="preferences.app.colorGrayMode"
              @change="listen('app', 'colorGrayMode', $event)"
            />
          </div>
        </div>
      </template>
      <template v-if="activeTab==='layout'">
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">面包屑导航</h3>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">开启面包屑导航</div>
            <el-switch
              :model-value="preferences.breadcrumb.enable"
              @change="listen('breadcrumb', 'enable', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">仅有一个时隐藏</div>
            <el-switch
              :model-value="preferences.breadcrumb.hideOnlyOne"
              @change="listen('breadcrumb', 'hideOnlyOne', $event)"
            />
          </div>
        </div>
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">标签栏</h3>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用标签栏</div>
            <el-switch
              :model-value="preferences.tabbar.enable"
              @change="listen('tabbar', 'enable', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">持久化标签页</div>
            <el-switch
              :model-value="preferences.tabbar.keepAlive"
              @change="listen('tabbar', 'keepAlive', $event)"
            />
          </div>
        </div>
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">小部件</h3>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用全局搜索</div>
            <el-switch
              :model-value="preferences.widget.globalSearch"
              @change="listen('widget', 'globalSearch', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用主题切换</div>
            <el-switch
              :model-value="preferences.widget.themeToggle"
              @change="listen('widget', 'themeToggle', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用语言切换</div>
            <el-switch
              :model-value="preferences.widget.languageToggle"
              @change="listen('widget', 'languageToggle', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用全屏</div>
            <el-switch
              :model-value="preferences.widget.fullscreen"
              @change="listen('widget', 'fullscreen', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用刷新</div>
            <el-switch
              :model-value="preferences.widget.refresh"
              @change="listen('widget', 'refresh', $event)"
            />
          </div>
        </div>
        <div class="flex flex-col py-4">
          <h3 class="mb-3 font-semibold leading-none tracking-tight text-[15px]">底栏</h3>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">启用底栏</div>
            <el-switch
              :model-value="preferences.footer.enable"
              @change="listen('footer', 'enable', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">固定在底部</div>
            <el-switch
              :model-value="preferences.footer.fixed"
              @change="listen('footer', 'fixed', $event)"
            />
          </div>
        </div>
      </template>
      <template v-if="activeTab==='shortcut'">
        <div class="flex flex-col py-4">
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">快捷键</div>
            <el-switch
              :model-value="preferences.shortcutKeys.enable"
              @change="listen('shortcutKeys', 'enable', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">全局搜索</div>
            <div class="ml-auto mr-2 text-xs opacity-60">{{ ctrlView }} <kbd> K </kbd></div>
            <el-switch
              :model-value="preferences.shortcutKeys.globalSearch"
              :disabled="!preferences.shortcutKeys.enable"
              @change="listen('shortcutKeys', 'globalSearch', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">用户设置</div>
            <div class="ml-auto mr-2 text-xs opacity-60">{{ altView }} <kbd> M </kbd></div>
            <el-switch
              :model-value="preferences.shortcutKeys.globalInformation"
              :disabled="!preferences.shortcutKeys.enable"
              @change="listen('shortcutKeys', 'globalInformation', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">退出登录</div>
            <div class="ml-auto mr-2 text-xs opacity-60">{{ ctrlView }} <kbd> Q </kbd></div>
            <el-switch
              :model-value="preferences.shortcutKeys.globalLogout"
              :disabled="!preferences.shortcutKeys.enable"
              @change="listen('shortcutKeys', 'globalLogout', $event)"
            />
          </div>
        </div>
      </template>
      <template v-if="activeTab==='general'">
        <div class="flex flex-col py-4">
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">语言</div>
            <el-select-v2
              class="!w-[165px]"
              :model-value="preferences.app.locale"
              :options="SUPPORT_LANGUAGES"
              @change="listen('app', 'locale', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">水印</div>
            <el-switch
              :model-value="preferences.app.watermark"
              @change="listen('app', 'watermark', $event)"
            />
          </div>
          <div class="hover:bg-accent my-1 flex w-full items-center justify-between rounded-md px-2 py-2.5">
            <div class="flex items-center text-[13px]">定时检查更新</div>
            <el-switch
              :model-value="preferences.app.enableCheckUpdates"
              @change="listen('app', 'enableCheckUpdates', $event)"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex-center">
          <el-button class="w-[160px] !h-[32px]" type="primary" @click="handleCopy">
            复制偏好设置
          </el-button>
          <el-button class="w-[160px] !h-[32px]" text @click="handleClearCache">
            清空缓存 & 退出登录
          </el-button>
        </div>
      </template>
    </drawer>
  </div>
</template>
1
<script setup>
import { computed, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { preferences, updatePreferences, usePreferences, clearPreferencesCache, resetPreferences } from '@/preferences'
import { SUPPORT_LANGUAGES } from '@/enums'
import { isWindowsOs } from '@/utils'
import { loadLocaleMessages } from '@/install/i18n'

const emit = defineEmits(['clearPreferencesAndLogout'])

const THEME_PRESET = [
  { label: '浅色', value: 'light', icon: 'svg:sun', },
  { label: '深色', value: 'dark', icon: 'svg:moon-star', },
  { label: '跟随系统', value: 'auto', icon: 'svg:sun-moon', },
]

const TAB_PRESET = [
  { label: '外观', value: 'appearance', },
  { label: '布局', value: 'layout', },
  { label: '快捷键', value: 'shortcut', },
  { label: '通用', value: 'general', },
]

const open = ref(false)
const activeTab = ref('appearance')

const { copy } = useClipboard({ legacy: true })
const { diffPreference, isDark } = usePreferences()

const ctrlView = computed(() => (isWindowsOs() ? 'Ctrl' : '⌘'))
const altView = computed(() => (isWindowsOs() ? 'Alt' : '⌥'))

const listen = (key, subKey, val) => {
  updatePreferences({ [key]: { [subKey]: val } })
  if (key === 'app' && subKey === 'locale') {
    loadLocaleMessages(val)
  }
}

const handleClosed = () => {
  activeTab.value = 'appearance'
  open.value = false
}

const handleCopy = async () => {
  await copy(JSON.stringify(diffPreference.value, null, 2))
}

const handleClearCache = () => {
  resetPreferences()
  clearPreferencesCache()
  emit('clearPreferencesAndLogout')
}
</script>

<style lang="scss">

</style>
