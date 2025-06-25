<template>
  <span
    :class="['svg-icon', spin && 'svg-icon-spin']"
    :style="style"
    v-html="svgContent"
  />
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { addUnit } from '@/utils'

const props = defineProps({
  prefix: {
    type: String,
    default: 'svg:'
  },
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
  },
  spin: {
    type: Boolean,
    default: false
  },
})


// 缓存已加载的 SVG
const svgCache = new Map()

const svgContent = ref('')

// todo 先占位，以后有用
const iconName = computed(() => {
  return props.name.startsWith(props.prefix) ? props.name : `${props.prefix}${props.name}`
})

const style = computed(() => {
  return {
    width: addUnit(props.size),
    height: addUnit(props.size),
  }
})

watchEffect(async () => {
  if (!props.name) return
  // 检查缓存
  if (svgCache.has(props.name)) {
    svgContent.value = svgCache.get(props.name)
    return
  }
  const { default: svg } = await import(`@/assets/svg/${props.name}.svg?raw`)
  svgContent.value = svg
  // 存入缓存
  svgCache.set(props.name, svg)
})
</script>

<style lang="scss">
.svg-icon {
  display: inline-block;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  svg {
    width: 100%;
    height: 100%;
  }
}

.svg-icon-spin {
  animation: rotating 2s linear infinite;
}

.svg-icon-loading {
  opacity: 0.6;
}
</style>
