<template>
  <component
    :is="h(ElInput, bindProps, $slots)"
    :ref="changeInstance"
  />
</template>

<script setup>
import { computed, getCurrentInstance, h, useAttrs } from 'vue'
import { ElInput } from 'element-plus'

defineOptions({
  name: 'ReInput',
  inheritAttrs: false,
})

const vm = getCurrentInstance()

const attrs = useAttrs()

const bindProps = computed(() => {
  return {
    ...attrs,
    clearable: true,
    placeholder: attrs.placeholder || '请输入',
  }
})

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
