<script setup>
import { computed, getCurrentInstance, nextTick, ref, unref, useAttrs, watch } from 'vue'

import { cloneDeep, get, isEqual, isFunction } from '@/utils'

import { objectOmit } from '@vueuse/core'

  defineOptions({
    name: 'ApiComponent',
    inheritAttrs: false
  })

const props = defineProps({
  component: {
    type: Object,
  },
  numberToString: {
    type: Boolean,
    default: false,
  },
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
  childrenField: {
    type: String,
    default: 'children',
  },
  valueField: {
    type: String,
    default: 'value',
  },
  optionsPropName: {
    type: String,
    default: 'options',
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
  loadingSlot: {
    type: String,
    default: '',
  },
  visibleEvent: {
    type: String,
    default: '',
  },
  modelPropName: {
    type: String,
    default: 'modelValue',
  },
  autoSelect: {
    type: [String, Function, Boolean],
    default: false,
  },
})

const emit = defineEmits(['optionsChange'])

const modelValue = defineModel({ default: undefined })
// 如果需要单独获取label和value值，可以使用以下两个model
const labelValue = defineModel('label', { default: undefined })
const valueValue = defineModel('value', { default: undefined })

const vm = getCurrentInstance()
const attrs = useAttrs()
const innerParams = ref({})
const refOptions = ref([])
const loading = ref(false)
// 首次是否加载过了
const isFirstLoaded = ref(false)
// 标记是否有待处理的请求
const hasPendingRequest = ref(false)

const getOptions = computed(() => {
  const { labelField, valueField, childrenField, numberToString } = props

  const refOptionsData = unref(refOptions)

  function transformData(data) {
    return data.map((item) => {
      const value = get(item, valueField)
      return {
        ...objectOmit(item, [labelField, valueField, childrenField]),
        label: get(item, labelField),
        value: numberToString ? `${value}` : value,
        ...(childrenField && item[childrenField]
          ? { children: transformData(item[childrenField]) }
          : {}),
      }
    })
  }

  const data = transformData(refOptionsData)

  return data.length > 0 ? data : props.options
})

// 转换modelValue方法
// 如果labelValue和valueValue都存在，则返回一个对象，否则返回modelValue
// 注意options.value必须是一个对象，应该为它设置value-key
const transformModelValue = computed(() => {
  if (labelValue.value && valueValue.value) {
    return {
      [props.labelField]: labelValue.value,
      [props.valueField]: valueValue.value,
    }
  }
  return modelValue.value
})

const bindProps = computed(() => {
  return {
    [props.modelPropName]: unref(transformModelValue),
    [props.optionsPropName]: unref(getOptions),
    [`onUpdate:${props.modelPropName}`]: (val) => {
      modelValue.value = val
      labelValue.value = get(val, props.labelField)
      valueValue.value = get(val, props.valueField)
    },
    ...objectOmit(attrs, [`onUpdate:${props.modelPropName}`]),
    ...(props.visibleEvent
      ? {
        [props.visibleEvent]: handleFetchForVisible,
      }
      : {}),
  }
})

async function fetchApi() {
  const { api, beforeFetch, afterFetch, resultField } = props

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
    let finalParams = unref(mergedParams)
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
      emitChange()
      return
    }
    if (resultField) {
      refOptions.value = get(res, resultField) || []
    }
    emitChange()
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
      fetchApi()
    }
  }
}

async function handleFetchForVisible(visible) {
  if (visible) {
    if (props.alwaysLoad) {
      await fetchApi()
    } else if (!props.immediate && !unref(isFirstLoaded)) {
      await fetchApi()
    }
  }
}

const mergedParams = computed(() => {
  return {
    ...props.params,
    ...unref(innerParams),
  }
})

watch(
  mergedParams,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) {
      return
    }
    fetchApi()
  },
  { deep: true, immediate: props.immediate },
)

function emitChange() {
  if (
    modelValue.value === undefined &&
    props.autoSelect &&
    unref(getOptions).length > 0
  ) {
    let firstOption
    if (isFunction(props.autoSelect)) {
      firstOption = props.autoSelect(unref(getOptions))
    } else {
      switch (props.autoSelect) {
        case 'first': {
          firstOption = unref(getOptions)[0]
          break
        }
        case 'last': {
          firstOption = unref(getOptions)[unref(getOptions).length - 1]
          break
        }
        case 'one': {
          if (unref(getOptions).length === 1) {
            firstOption = unref(getOptions)[0]
          }
          break
        }
      }
    }

    if (firstOption) modelValue.value = firstOption.value
  }
  emit('optionsChange', unref(getOptions))
}

function changeInstance(instance) {
  vm.exposeProxy = vm.exposeProxy = instance || {}
}
</script>

<template>
  <component
    :is="component"
    v-bind="bindProps"
    :placeholder="$attrs.placeholder"
    :ref="changeInstance"
  >
    <template v-for="item in Object.keys($slots)" #[item]="data" :key="item">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </component>
</template>
