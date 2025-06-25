<template>
  <el-menu-item v-if="!hasChildren" :index="menu.path">
    <i v-if="menu.icon" class="el-icon menu-icon">
      <re-icon :key="menu.icon" :icon="menu.icon" />
    </i>
    <span class="is-truncated">{{ menu.name }}</span>
    <div v-if="!collapse && menu.badge" class="absolute right-2 leading-none">
      <el-badge :type="menu.badgeVariants" :value="menu.badge" :is-dot="menu.badgeType==='dot'" />
    </div>
  </el-menu-item>
  <el-sub-menu
    v-else
    :index="menu.path"
  >
    <template #title>
      <i v-if="menu.icon" class="el-icon menu-icon">
        <re-icon :icon="menu.icon" />
      </i>
      <span class="is-truncated">{{ menu.name }}</span>
      <div v-if="!collapse && menu.badge" class="absolute right-2 leading-none">
        <el-badge :type="menu.badgeVariants" :value="menu.badge" :is-dot="menu.badgeType==='dot'" />
      </div>
    </template>
    <menu-item
      v-for="childItem in menu.children || []"
      :key="childItem.path"
      :menu="childItem"
    />
  </el-sub-menu>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'MenuItem',
})

const props = defineProps({
  menu: Object,
  collapse: Boolean
})

const hasChildren = computed(() => {
  const { menu } = props
  return (
    Reflect.has(menu, 'children') && !!menu.children && menu.children.length > 0
  )
})
</script>
