<template>
  <component :is="h(ElAutocomplete, bindProps, $slots)" :ref="changeInstance" v-model="modelValue" />
</template>

<script setup>
import { computed, getCurrentInstance, h, nextTick, ref, useAttrs } from 'vue'
import { ElAutocomplete } from 'element-plus'
import { cloneDeep, get, isFunction } from '@/utils'

defineOptions({
  name: 'ReAutocomplete',
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

const emit = defineEmits(['optionsChange'])

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

const bindProps = computed(() => {
  return {
    ...attrs,
    valueKey: props.labelField,
    onSelect(item) {
      labelValue.value = get(item, props.labelField)
      valueValue.value = get(item, props.valueField)
    },
    onClear() {
      labelValue.value = undefined
      valueValue.value = undefined
    },
    fetchSuggestions: fetchApi,
    placeholder: attrs.placeholder || '请输入',
  }
})

async function fetchApi(queryString, cb) {
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
      ...(params?.key ? { [params?.key]: queryString } : null)
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
      cb && cb(refOptions.value)
      return
    }
    if (resultField) {
      refOptions.value = get(res, resultField) || []
      cb && cb(refOptions.value)
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
      fetchApi(queryString, cb)
    }
  }
}

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
