<template>
  <component
    :is="h(ApiComponent, bindProps, $slots)"
    :ref="changeInstance"
  />
</template>

<script setup>
import { computed, getCurrentInstance, h, useAttrs } from 'vue'

import { ElTreeSelect } from 'element-plus'

import { ApiComponent } from '@/components/api-component'

defineOptions({
  name: 'ReTreeSelect',
  inheritAttrs: false,
})

const vm = getCurrentInstance()

const attrs = useAttrs()

const bindProps = computed(() => {
  return {
    ...attrs,
    component: ElTreeSelect,
    placeholder: attrs.placeholder || '请选择',
    nodeKey: 'value',
    loadingSlot: 'loading',
    optionsPropName: 'data',
    visibleEvent: 'onVisibleChange',
  }
})

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
