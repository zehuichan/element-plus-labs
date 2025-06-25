<template>
  <ContextMenu v-bind="forwarded">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent
      class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-[1000] min-w-32 overflow-hidden rounded-md border p-1 shadow-md cursor-pointer"
      @keydown.enter.stop
      @mousedown.stop
    >
      <slot name="item">
        <template v-for="menu in menusView" :key="menu.key">
          <ContextMenuItem
            :inset="menu.inset || !menu.icon"
            :disabled="menu.disabled"
            @click="handleClick(menu)"
          >
            <component
              :is="menu.icon"
              v-if="menu.icon"
              class="mr-2 text-sm"
            />
            {{ menu.text || menu.label }}
          </ContextMenuItem>
          <ContextMenuSeparator v-if="menu.separator" />
        </template>
      </slot>
    </ContextMenuContent>
  </ContextMenu>
</template>

<script setup>
import { computed } from 'vue'
import { ContextMenuTrigger, useForwardPropsEmits } from 'reka-ui'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '../context-menu'

const props = defineProps({
  modal: Boolean,
  handlerData: Object,
  menus: Function,
})
const emits = defineEmits(['update:open'])

const forwarded = useForwardPropsEmits(props, emits)

const menusView = computed(() => {
  return props.menus?.(props.handlerData)
})

function handleClick(menu) {
  if (menu.disabled) {
    return
  }
  menu?.handler?.(props.handlerData)
}
</script>

<style lang="scss">

</style>
