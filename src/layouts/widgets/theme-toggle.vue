<template>
  <div
    v-bind="$attrs"
    class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-8 w-8 px-1 text-lg hover:bg-accent hover:text-accent-foreground text-foreground/80 rounded-full cursor-pointer"
    @click="toggleTheme"
  >
    <re-icon v-if="isDark" icon="svg:sun" size="16" />
    <re-icon v-else icon="svg:moon" size="16" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { updatePreferences, usePreferences } from '@/preferences'

const { isDark } = usePreferences()

const flag = computed({
  get: () => isDark.value,
  set: (value) => {
    updatePreferences({
      theme: { mode: value ? 'dark' : 'light' },
    })
  },
})

function toggleTheme() {
  flag.value = !flag.value
}
</script>

<style lang="scss">

</style>
