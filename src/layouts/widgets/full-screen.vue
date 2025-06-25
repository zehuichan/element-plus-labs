<template>
  <div
    class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-8 w-8 px-1 text-lg hover:bg-accent hover:text-accent-foreground text-foreground/80 rounded-full cursor-pointer"
    @click="toggle"
  >
    <re-icon v-if="isFullscreen" icon="svg:minimize" size="16" />
    <re-icon v-else icon="svg:maximize" size="16" />
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, toggle } = useFullscreen()

// 重新检查全屏状态
isFullscreen.value = !!(
  document.fullscreenElement ||
  // @ts-ignore
  document.webkitFullscreenElement ||
  // @ts-ignore
  document.mozFullScreenElement ||
  // @ts-ignore
  document.msFullscreenElement
)
</script>

<style lang="scss">

</style>
