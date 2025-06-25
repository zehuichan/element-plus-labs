<template>
  <div class="icon-button" @click="refresh">
    <re-icon icon="park:redo" size="16" />
  </div>
</template>

<script setup>
import { useRefresh } from '@/composables/useRefresh'

const { refresh } = useRefresh()
</script>

<style lang="scss">
.icon-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  border-radius: calc(.5rem - 2px);
  color: hsl(var(--foreground)/.8);
  cursor: pointer;

  &:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
}
</style>
