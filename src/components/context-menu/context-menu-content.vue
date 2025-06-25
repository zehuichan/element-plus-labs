<template>
  <ContextMenuPortal>
    <ContextMenuContent
      v-bind="Object.assign(forwarded, $attrs)"
      class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-[1000] min-w-32 overflow-hidden rounded-md border p-1 shadow-md cursor-pointer"
      @keydown.enter.stop
      @mousedown.stop
    >
      <slot></slot>
    </ContextMenuContent>
  </ContextMenuPortal>
</template>

<script setup>
import { ContextMenuContent, ContextMenuPortal, useForwardPropsEmits } from 'reka-ui'

const props = defineProps({
  sideOffset: {
    type: [Number, String],
    default: 4,
  },
})
const emits = defineEmits(ContextMenuContent.emits)

const forwarded = useForwardPropsEmits(props, emits)
</script>

<style lang="scss">

</style>
