<template>
  <footer
    id="layout-footer"
    :style="style"
    class="bg-background-deep bottom-0 w-full transition-all duration-200"
  >
    <div class="flex-center text-muted-foreground relative h-full w-full text-xs">
      <slot></slot>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fixed: Boolean,
  height: Number,
  width: String,
  zIndex: Number
})

const style = computed(() => {
  const { fixed, height, width, zIndex } = props
  return {
    height: `${height}px`,
    position: fixed ? 'fixed' : 'static',
    width,
    zIndex,
  }
})
</script>

<style>

</style>
