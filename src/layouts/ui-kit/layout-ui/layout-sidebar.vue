<template>
  <div
    v-if="domVisible"
    :class="theme"
    :style="hiddenSideStyle"
    class="h-full transition-all duration-150"
  />
  <div
    :class="theme"
    :style="style"
    class="bg-sidebar border-border border-r fixed left-0 top-0 h-full transition-all duration-150 flex flex-col"
  >
    <div v-if="$slots.logo" class="shrink-0 w-full h-[52px]">
      <slot name="logo"></slot>
    </div>
    <aside class="flex-1">
      <el-scrollbar>
        <slot></slot>
      </el-scrollbar>
    </aside>
    <div class="shrink-0 w-full h-[42px]">
      <slot name="trigger"></slot>
    </div>
    <div class="shrink-0">
      <slot name="splitter"></slot>
    </div>
  </div>
  <div
    v-if="maskVisible"
    :style="maskStyle"
    class="bg-overlay fixed left-0 top-0 h-full w-full transition-[background-color] duration-200"
    @click="handleClickMask"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  collapseWidth: {
    type: Number,
  },
  domVisible: {
    type: Boolean,
    default: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  show: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
  },
  width: {
    type: Number,
  },
  zIndex: {
    type: Number,
    default: 200,
  },
})

const collapse = defineModel('collapse')

const hiddenSideStyle = computed(() => calcMenuWidthStyle(true))
const maskVisible = computed(() => !collapse.value && props.isMobile)

const style = computed(() => {
  const { zIndex } = props
  return {
    overflow: 'hidden',
    ...calcMenuWidthStyle(false),
    zIndex,
  }
})
const maskStyle = computed(() => {
  return { zIndex: props.zIndex - 1 }
})

function handleClickMask() {
  collapse.value = true
}

// todo isHiddenDom
function calcMenuWidthStyle(isHiddenDom) {
  const { show, width } = props

  let widthValue = width === 0 ? '0px' : `${width}px`

  return {
    ...(widthValue === '0px' ? { overflow: 'hidden' } : {}),
    flex: `0 0 ${widthValue}`,
    marginLeft: show ? 0 : `-${widthValue}`,
    maxWidth: widthValue,
    minWidth: widthValue,
    width: widthValue,
    willChange: 'width',
  }
}
</script>

<style>
.dark {
  --color-background: hsl(var(--background));
  --color-background-deep: hsl(var(--background-deep));
  --color-foreground: hsl(var(--foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-border: hsl(var(--border));

  --color-sidebar: hsl(var(--sidebar));

  --color-accent: hsl(var(--accent));
  --color-accent-hover: hsl(var(--accent-hover));
  --color-accent-foreground: hsl(var(--accent-foreground));
}
</style>
