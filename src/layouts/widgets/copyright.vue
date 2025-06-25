<template>
  <div class="text-md flex-center">
    <!-- ICP Link -->
    <a
      v-if="icp"
      :href="icpLink || 'javascript:void(0)'"
      class="hover:text-primary-hover mx-1"
      target="_blank"
    >
      {{ icp }}
    </a>

    <!-- Copyright Text -->
    Copyright © {{ date }}

    <!-- Company Link -->
    <a
      v-if="companyName"
      :href="companySiteLink || 'javascript:void(0)'"
      class="hover:text-primary-hover mx-1"
      target="_blank"
    >
      {{ companyName }}
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  companyName: String,
  companySiteLink: String,
  date: String,
  icp: String,
  icpLink: String,
})
</script>

<style lang="scss">

</style>
