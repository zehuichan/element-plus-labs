<template>
  <el-menu
    :class="theme"
    :popper-class="theme"
    :default-active="defaultActive"
    :collapse="collapse"
    :unique-opened="accordion"
    :collapse-transition="false"
    mode="vertical"
    unique-opened
    @select="onSelect"
  >
    <menu-item
      v-for="menu in menus"
      :key="menu.path"
      :menu="menu"
      :collapse="collapse"
    />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAccessStore } from '@/store'
import { isHttpUrl } from '@/utils'

import MenuItem from './menu-item.vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
  theme: {
    type: String,
    default: 'light',
  },
  accordion: {
    type: Boolean,
    default: true,
  },
  collapse: {
    type: Boolean,
    default: false,
  },
})


const route = useRoute()
const router = useRouter()

const defaultActive = computed(() => {
  return route?.meta?.activePath ?? route.path
})

const onSelect = (index) => {
  if (isHttpUrl(index)) {
    window.open(index)
  } else {
    router.push(index)
  }
}
</script>

<style lang="scss">
.el-menu {
  --el-menu-item-font-size: 13px;
  border-right: 0;

  // reset element-ui css
  &.horizontal-collapse-transition {
    transition: 0s width ease-in-out, 0s padding-left ease-in-out,
    0s padding-right ease-in-out;
  }

  .menu-icon {
    font-size: 16px;
    margin-right: 8px;
    width: 16px;
  }

  .is-truncated {
    display: inline-block;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    line-height: initial;
  }
}
</style>
