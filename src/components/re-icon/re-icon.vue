<template>
  <component :is="icon" v-if="isComponent" v-bind="$attrs" />
  <img v-else-if="isRemoteIcon" :src="icon" v-bind="$attrs" alt="icon" />
  <icon-park v-else-if="stringToIcon(icon, true, 'park')" v-bind="$attrs" :type="stringToIcon(icon)" />
  <plus-icon v-else-if="stringToIcon(icon, true, 'plus')" v-bind="$attrs" :name="stringToIcon(icon)" />
  <svg-icon v-else-if="stringToIcon(icon, true, 'svg')" v-bind="$attrs" :name="stringToIcon(icon)" />
</template>

<script setup>
import { computed } from 'vue'
import { isFunction, isHttpUrl, isObject, isString } from '@/utils'
import IconPark from './icon-park.vue'
import PlusIcon from './plus-icon.vue'
import SvgIcon from './svg-icon.vue'

const props = defineProps({
  fallback: Boolean,
  icon: [String, Object, Function],
})

const isRemoteIcon = computed(() => {
  return isString(props.icon) && isHttpUrl(props.icon)
})

const isComponent = computed(() => {
  const { icon } = props
  return !isString(icon) && (isObject(icon) || isFunction(icon))
})

// eg: stringToIcon('svg:arrow-up') => 'arrow-up'
// eg: stringToIcon('svg:arrow-up', true, 'svg') => boolean
// eg: stringToIcon('park:arrow-up') => 'arrow-up'
// eg: stringToIcon('park:arrow-up', true, 'park') => boolean
function stringToIcon(value, validate = false, prefix = '') {
  const colonSeparated = value.split(':')
  const iconType = colonSeparated[0]
  const iconName = colonSeparated[1]

  if (validate) {
    return iconType === prefix
  }

  return iconName
}
</script>
