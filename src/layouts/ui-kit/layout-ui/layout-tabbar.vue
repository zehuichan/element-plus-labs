<template>
  <section
    :style="style"
    class="border-border bg-background flex w-full border-b transition-all"
  >
    <slot></slot>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  height: Number,
})

const style = computed(() => {
  const { height } = props
  return {
    height: `${height}px`,
  }
})
</script>

<style>

</style>
