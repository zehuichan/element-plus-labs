<template>
  <div
    class="flex-center z-100 bg-overlay-content absolute left-0 top-0 size-full backdrop-blur-sm transition-all duration-500"
    :class="[{'invisible opacity-0': !showSpinner}]"
    @transitionend="onTransitionEnd"
  >
    <div
      :class="{ paused: !renderSpinner }"
      v-if="renderSpinner"
      class="loader before:bg-primary/50 after:bg-primary relative size-12 before:absolute before:left-0 before:top-[60px] before:h-[5px] before:w-12 before:rounded-[50%] before:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:rounded after:content-['']"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  enable: Boolean,
})

const showSpinner = ref(false)
const renderSpinner = ref(false)
const timer = ref()

const spinning = ref(false)
const startTime = ref(0)
const router = useRouter()
const minShowTime = 500 // 最小显示时间

watch(
  () => spinning.value,
  (show) => {
    if (!show) {
      showSpinner.value = false
      clearTimeout(timer.value)
      return
    }

    // startTime.value = performance.now();
    timer.value = setTimeout(() => {
      // const loadingTime = performance.now() - startTime.value;

      showSpinner.value = true
      if (showSpinner.value) {
        renderSpinner.value = true
      }
    }, 50)
  },
  {
    immediate: true,
  },
)

const onTransitionEnd = () => {
  if (!showSpinner.value) {
    renderSpinner.value = false
  }
}

// 结束加载动画
const onEnd = () => {
  if (!props.enable) {
    return
  }
  const processTime = performance.now() - startTime.value
  if (processTime < minShowTime) {
    setTimeout(() => {
      spinning.value = false
    }, minShowTime - processTime)
  } else {
    spinning.value = false
  }
}

// 路由前置守卫
router.beforeEach((to) => {
  if (to.meta.loaded || !props.enable || to.meta.iframeSrc) {
    return true
  }
  startTime.value = performance.now()
  spinning.value = true
  return true
})

// 路由后置守卫
router.afterEach((to) => {
  if (to.meta.loaded || !props.enable || to.meta.iframeSrc) {
    return true
  }
  onEnd()
  return true
})
</script>

<style lang="scss">
.paused {
  &::before {
    animation-play-state: paused !important;
  }

  &::after {
    animation-play-state: paused !important;
  }
}

.loader {
  &::before {
    animation: loader-shadow-ani 0.5s linear infinite;
  }

  &::after {
    animation: loader-jump-ani 0.5s linear infinite;
  }
}

@keyframes loader-jump-ani {
  15% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    border-bottom-right-radius: 40px;
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes loader-shadow-ani {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1.2, 1);
  }
}
</style>
