<template>
  <component :is="h(ElButton, bindProps, $slots)" />
</template>

<script setup>
import { computed, getCurrentInstance, h, ref, useAttrs } from 'vue'
import { ElButton } from 'element-plus'

defineOptions({
  name: 'ReButton',
  inheritAttrs: false,
})

const attrs = useAttrs()

const vm = getCurrentInstance()

const loading = ref(false)

const bindProps = computed(() => {
  return {
    ...attrs,
    ref: changeInstance,
    loading: loading.value,
    onClick: onClick,
  }
})

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}

async function onClick() {
  loading.value = true
  try {
    await attrs?.onClick?.()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">

</style>
