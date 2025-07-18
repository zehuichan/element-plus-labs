<template>
  <component :is="h(ApiComponent, bindProps, $slots)" />
</template>

<script setup>
import { computed, getCurrentInstance, h, useAttrs } from 'vue'

import { ElSelectV2 } from 'element-plus'

import { ApiComponent } from '@/components/api-component'

defineOptions({
  name: 'ReSelect',
  inheritAttrs: false,
})

const vm = getCurrentInstance()

const attrs = useAttrs()

const bindProps = computed(() => {
  return {
    ...attrs,
    component: ElSelectV2,
    ref: changeInstance,
    placeholder: attrs.placeholder || '请选择',
    filterable: true,
    visibleEvent: 'onVisibleChange',
  }
})

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
