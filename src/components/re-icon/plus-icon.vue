<template>
  <el-icon v-bind="$attrs">
    <component :is="name" />
  </el-icon>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  name: String,
})
</script>

<style lang="scss">

</style>
