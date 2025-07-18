<template>
  <component :is="h(ElInput, bindProps, $slots)" />
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
    placeholder: attrs.placeholder || '请输入',
    ref: changeInstance,
  }
})

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
