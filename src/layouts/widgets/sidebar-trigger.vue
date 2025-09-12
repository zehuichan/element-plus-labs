<template>
  <div
    class="flex-center hover:text-foreground text-foreground/60 hover:bg-accent-hover bg-accent absolute bottom-2 left-3 z-10 cursor-pointer rounded-sm p-1"
    @click="handleCollapsed"
  >
    <re-icon icon="park:double-right" size="14" v-if="collapsed" />
    <re-icon icon="park:double-left" size="14" v-else />
  </div>
</template>

<script setup>
const collapsed = defineModel()

function handleCollapsed() {
  collapsed.value = !collapsed.value
}
</script>

<style lang="scss">

</style>
