<template>
  <component
    :is="h(ElMention, bindProps, $slots)"
    :ref="changeInstance"
    v-model="modelValue"
  />
</template>

<script setup>
import { computed, getCurrentInstance, h, nextTick, ref, unref, useAttrs } from 'vue'
import { ElMention } from 'element-plus'
import { cloneDeep, get, isFunction } from '@/utils'
import { objectOmit } from '@vueuse/core'

defineOptions({
  name: 'ReMention',
  inheritAttrs: false,
})

const props = defineProps({
  api: {
    type: Function,
    default: undefined
  },
  params: {
    type: Object,
    default: () => ({})
  },
  resultField: {
    type: String,
    default: '',
  },
  labelField: {
    type: String,
    default: 'label',
  },
  valueField: {
    type: String,
    default: 'value',
  },
  immediate: {
    type: Boolean,
    default: true,
  },
  alwaysLoad: {
    type: Boolean,
    default: false,
  },
  beforeFetch: {
    type: Function,
    default: undefined,
  },
  afterFetch: {
    type: Function,
    default: undefined,
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const modelValue = defineModel('modelValue', { default: undefined })
// 如果需要单独获取label和value值，可以使用以下两个model
const labelValue = defineModel('label', { default: undefined })
const valueValue = defineModel('value', { default: undefined })

const attrs = useAttrs()
const vm = getCurrentInstance()
const refOptions = ref([])
const loading = ref(false)
// 首次是否加载过了
const isFirstLoaded = ref(false)
// 标记是否有待处理的请求
const hasPendingRequest = ref(false)

const getOptions = computed(() => {
  const { labelField, valueField, numberToString } = props

  const refOptionsData = unref(refOptions)

  function transformData(data) {
    return data.map((item) => {
      const value = get(item, valueField)
      return {
        ...objectOmit(item, [labelField, valueField]),
        label: get(item, labelField),
        value: numberToString ? `${value}` : value,
      }
    })
  }

  const data = transformData(refOptionsData)

  return data.length > 0 ? data : props.options
})

const bindProps = computed(() => {
  return {
    ...attrs,
    loading: unref(loading),
    options: unref(getOptions),
    clearable: true,
    onSearch: fetchApi,
    placeholder: attrs.placeholder || '请输入',
  }
})

async function fetchApi(pattern, prefix) {
  const { api, params, beforeFetch, afterFetch, resultField } = props

  if (!api || !isFunction(api)) {
    return
  }

  // 如果正在加载，标记有待处理的请求并返回
  if (loading.value) {
    hasPendingRequest.value = true
    return
  }

  refOptions.value = []
  try {
    loading.value = true
    let finalParams = {
      ...params,
      ...(params?.key ? { [params?.key]: pattern } : null)
    }
    if (beforeFetch && isFunction(beforeFetch)) {
      finalParams = (await beforeFetch(cloneDeep(finalParams))) || finalParams
    }
    let res = await api(finalParams)
    if (afterFetch && isFunction(afterFetch)) {
      res = (await afterFetch(res)) || res
    }
    isFirstLoaded.value = true
    if (Array.isArray(res)) {
      refOptions.value = res
      return
    }
    if (resultField) {
      refOptions.value = get(res, resultField) || []
    }
  } catch (error) {
    console.warn(error)
    // reset status
    isFirstLoaded.value = false
  } finally {
    loading.value = false
    // 如果有待处理的请求，立即触发新的请求
    if (hasPendingRequest.value) {
      hasPendingRequest.value = false
      // 使用 nextTick 确保状态更新完成后再触发新请求
      await nextTick()
      fetchApi(pattern, prefix)
    }
  }
}

function changeInstance(instance) {
  vm.exposed = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
