<template>
  <DropdownMenuRoot v-bind="forwarded">
    <slot />
  </DropdownMenuRoot>
</template>

<script setup>
import { DropdownMenuRoot, useForwardPropsEmits, } from 'reka-ui'

const props = defineProps({
  modal: Boolean
})
const emits = defineEmits(DropdownMenuRoot.emits)

const forwarded = useForwardPropsEmits(props, emits)
</script>

<style lang="scss">

</style>
