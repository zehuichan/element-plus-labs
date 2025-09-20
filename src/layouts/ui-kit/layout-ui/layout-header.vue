<template>
  <header
    :class="theme"
    :style="style"
    class="bg-header border-border top-0 flex w-full flex-[0_0_auto] items-center border-b pl-2 transition-[margin-top] duration-200"
  >
    <template v-for="slot in leftSlots" :key="slot.name">
      <slot :name="slot.name"></slot>
    </template>
    <div class="menu-align-start flex h-full min-w-0 flex-1 items-center"></div>
    <template v-for="slot in rightSlots" :key="slot.name">
      <slot :name="slot.name"></slot>
    </template>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  height: Number,
  theme: String,
})

const REFERENCE_VALUE = 50

const style = computed(() => {
  const { height } = props

  return {
    height: `${height}px`,
  }
})

const leftSlots = computed(() => {
  const list = []

  list.push({ index: REFERENCE_VALUE + 10, name: 'toggle-button' })
  list.push({ index: REFERENCE_VALUE + 20, name: 'refresh' })
  list.push({ index: REFERENCE_VALUE + 30, name: 'breadcrumb' })

  return list.sort((a, b) => a.index - b.index)
})

const rightSlots = computed(() => {
  const list = [{ index: REFERENCE_VALUE + 100, name: 'user-dropdown' }]

  list.push({ index: REFERENCE_VALUE, name: 'check-updates' })
  list.push({ index: REFERENCE_VALUE + 10, name: 'global-search' })
  list.push({ index: REFERENCE_VALUE + 20, name: 'preferences' })
  list.push({ index: REFERENCE_VALUE + 30, name: 'theme-toggle' })
  list.push({ index: REFERENCE_VALUE + 40, name: 'language-toggle' })
  list.push({ index: REFERENCE_VALUE + 50, name: 'fullscreen' })
  list.push({ index: REFERENCE_VALUE + 60, name: 'notification' })

  return list.sort((a, b) => a.index - b.index)
})
</script>

<style>
.dark {
  --color-header: hsl(var(--header));
}
</style>
