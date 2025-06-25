<template>
  <el-config-provider :locale="elementLocale" size="small">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { elementLocale } from '@/locales'
</script>
