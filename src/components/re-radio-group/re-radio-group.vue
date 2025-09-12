<template>
  <component
    :is="h(ElRadioGroup, $attrs, $slots)"
    :ref="changeInstance"
  >
    <template v-for="item in getOptions" :key="`${item.value}`">
      <el-radio-button
        v-if="button"
        :value="item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </el-radio-button>
      <el-radio
        v-else
        :value="item.value"
        :border="border"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </el-radio>
    </template>
  </component>
</template>

<script setup>
import { computed, getCurrentInstance, h, nextTick, ref, unref, watch } from 'vue'
import { ElRadioGroup } from 'element-plus'
import { objectOmit } from '@vueuse/core'
import { cloneDeep, get, isEqual, isFunction } from '@/utils'

defineOptions({
  name: 'ReRadioGroup',
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
  button: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: false,
  }
})

const vm = getCurrentInstance()
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

async function fetchApi() {
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
      fetchApi()
    }
  }
}

watch(
  () => props.params,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) {
      return
    }
    fetchApi()
  },
  { deep: true, immediate: props.immediate },
)

function changeInstance(instance) {
  vm.exposed = vm.exposeProxy = instance || {}
}
</script>

<style lang="scss">

</style>
