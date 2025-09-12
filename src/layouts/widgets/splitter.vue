<template>
  <div
    class="splitter"
    :class="{ dragging: dragging, disabled: collapse }"
    title="拖拽调整侧边栏宽度"
    role="separator"
    aria-label="调整侧边栏宽度"
    @mousedown="onMousedown"
    @touchstart="onTouchStart"
  />
  <!-- Prevent iframe touch events from breaking -->
  <div v-show="masked" class="splitter-mask" />
</template>

<script setup>
import { ref } from 'vue'

// 侧边栏宽度常量配置

const ASIDE_WIDTH = {
  MIN: 220, // 最小宽度
  MAX: 360, // 最大宽度
  DEFAULT: 260, // 默认宽度
}

const modelValue = defineModel()

const props = defineProps({
  collapse: Boolean,
})

const resizing = ref(false)
const masked = ref(false)
const dragging = ref(false)

let startX = 0
let startWidth = 0

// 验证并限制宽度值的辅助函数
const clampWidth = (width) => {
  // 确保传入值是有效数字
  const numWidth = Number(width)

  // 如果不是有效数字，返回默认值
  if (isNaN(numWidth) || !isFinite(numWidth)) {
    return ASIDE_WIDTH.DEFAULT
  }

  return Math.max(
    ASIDE_WIDTH.MIN,
    Math.min(ASIDE_WIDTH.MAX, Math.round(numWidth))
  )
}

const onMousedown = (e) => {
  // 如果侧边栏已折叠，禁用拖拽
  if (props.collapse) {
    return
  }

  e.preventDefault()
  resizing.value = true

  startX = e.pageX
  startWidth = modelValue.value

  masked.value = true
  dragging.value = true

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove, { passive: false })
}

const onTouchStart = (e) => {
  // 如果侧边栏已折叠，禁用拖拽
  if (props.collapse) {
    return
  }

  if (e.touches.length === 1) {
    e.preventDefault()
    resizing.value = true

    const touch = e.touches[0]
    startX = touch.pageX
    startWidth = modelValue.value

    masked.value = true
    dragging.value = true

    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
  }
}

const onMouseUp = () => {
  resizing.value = false
  startX = 0
  startWidth = 0

  masked.value = false
  dragging.value = false

  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
}

const onMouseMove = (e) => {
  if (!resizing.value) return

  e.preventDefault()

  // 计算移动距离，然后加到初始宽度上
  const diff = e.pageX - startX
  const newWidth = startWidth + diff

  // 确保计算结果是有效数字
  if (isFinite(newWidth)) {
    modelValue.value = clampWidth(newWidth)
  }
}

const onTouchEnd = (e) => {
  resizing.value = false
  startX = 0
  startWidth = 0

  masked.value = false
  dragging.value = false

  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('touchmove', onTouchMove)
}

const onTouchMove = (e) => {
  if (!resizing.value) return

  if (e.touches.length === 1) {
    e.preventDefault()

    const touch = e.touches[0]
    // 计算移动距离，然后加到初始宽度上
    const diff = touch.pageX - startX
    const newWidth = startWidth + diff

    // 确保计算结果是有效数字
    if (isFinite(newWidth)) {
      modelValue.value = clampWidth(newWidth)
    }
  }
}
</script>

<style lang="scss">
// 调整手柄样式
.splitter {
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  background: transparent;
  cursor: col-resize;
  z-index: 999;
  pointer-events: auto;
  // 硬件加速
  will-change: transform;
  transform: translateZ(0);

  // 增加实际可交互区域
  &::before {
    content: "";
    position: absolute;
    right: -3px;
    top: 0;
    bottom: 0;
    width: 12px;
    background: transparent;
  }

  // 提供可视化指示 - 简化动画
  &::after {
    content: "";
    position: absolute;
    right: 1px;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 40px;
    background: var(--el-color-primary-light-3);
    opacity: 0;
    transition: opacity 0.15s ease; // 只保留透明度过渡
  }

  &:hover::after {
    opacity: 1;
  }

  // 拖拽时的视觉反馈 - 移除尺寸变化动画
  &:active::after {
    background: var(--el-color-primary-dark-2);
    opacity: 1;
  }

  // 拖拽时手柄的增强样式 - 使用 Vue 响应式状态
  &.dragging {
    &::after {
      opacity: 1;
      background: var(--el-color-primary-dark-2);
      box-shadow: 0 0 3px 3px hsl(var(--background));
      width: 1px;
      height: 100%;
      right: 2px;
      top: 0;
      transform: none;
      transition: none; // 拖拽时完全禁用过渡
    }
  }

  // 折叠状态下禁用拖拽
  &.disabled {
    cursor: default;
    pointer-events: none;

    &::before,
    &::after {
      display: none;
    }
  }
}

// 拖拽遮罩层 - 替代全局拖拽状态
.splitter-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  cursor: col-resize;
  z-index: 9999;
  user-select: none;
  pointer-events: auto;

  // 阻止 iframe 或其他元素的事件干扰
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.001); // 几乎透明的背景确保事件捕获
  }
}
</style>
