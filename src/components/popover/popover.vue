<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <slot name="trigger"></slot>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        v-bind="$attrs"
        class="side-content z-popup bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border w-72 rounded-md border shadow-md outline-none"
        align="start"
      >
        <slot></slot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup>
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
</script>

<style lang="scss">

</style>
