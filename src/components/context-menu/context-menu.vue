<template>
  <ContextMenuRoot v-bind="forwarded">
    <slot></slot>
  </ContextMenuRoot>
</template>

<script setup>
import { ContextMenuRoot, useForwardPropsEmits } from 'reka-ui'

const props = defineProps({
  modal: Boolean,
})
const emits = defineEmits(ContextMenuRoot.emits)

const forwarded = useForwardPropsEmits(props, emits)
</script>

<style lang="scss">

</style>
