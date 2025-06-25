<template>
  <DropdownMenuItem
    v-bind="forwarded"
    class="focus:bg-accent focus:text-accent-foreground relative flex select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
    :class="{'pl-8': inset}"
  >
    <slot />
  </DropdownMenuItem>
</template>

<script setup>
import { DropdownMenuItem, useForwardPropsEmits } from 'reka-ui'

const props = defineProps({
  inset: Boolean,
  disabled: Boolean,
})
const emits = defineEmits(DropdownMenuItem.emits)

const forwarded = useForwardPropsEmits(props, emits)
</script>

<style lang="scss">

</style>
