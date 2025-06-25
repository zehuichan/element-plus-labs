<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      v-if="virtualTriggering"
      :ref="forwardRef"
      :style="virtualStyled"
      as="span"
    />
    <DropdownMenuTrigger
      v-else
      as-child
    >
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <template v-for="item in items">
          <DropdownMenuItem @select="handleClick(item)">
            {{ item.text || item.label }}
          </DropdownMenuItem>
          <DropdownMenuSeparator v-if="item.separator" />
        </template>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { computed } from 'vue'
import { DropdownMenuGroup, DropdownMenuTrigger, useForwardExpose, } from 'reka-ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '../dropdown-menu'

const props = defineProps({
  x: Number,
  y: Number,
  virtualTriggering: Boolean,
  items: Array,
})

const virtualStyled = computed(() => {
  return {
    position: 'fixed',
    width: 0,
    height: 0,
    left: props.x + 'px',
    right: props.x + 'px',
    top: props.y + 'px',
    bottom: props.y + 'px',
  }
})

const { forwardRef } = useForwardExpose()

const handleClick = (item) => {
  if (item.disabled) {
    return
  }
  item?.handler?.(item)
}
</script>

<style lang="scss">

</style>
