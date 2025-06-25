<template>
  <div v-if="showHome" class="icon-button mr-1" @click="goHome">
    <re-icon icon="park:home" size="16" />
  </div>
  <el-breadcrumb class="breadcrumb ml-2" separator-icon="ArrowRight">
    <transition-group name="breadcrumb-transition">
      <template
        v-for="(item, index) in breadcrumbs"
        :key="`${item.path}-${item.title}-${index}`"
      >
        <el-breadcrumb-item
          :to="index !== breadcrumbs.length - 1 ? item : null"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </template>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  hideWhenOnlyOne: Boolean,
  showHome: Boolean,
})

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const matched = route.matched

  const resultBreadcrumb = []

  for (const match of matched) {
    const { meta, path } = match
    const { hideChildrenInMenu, hideInBreadcrumb, icon, name, title } =
    meta || {}
    if (hideInBreadcrumb || hideChildrenInMenu || !path) {
      continue
    }

    resultBreadcrumb.push({
      icon,
      path: path || route.path,
      title: title ? title || name : '',
    })
  }

  if (props.hideWhenOnlyOne && resultBreadcrumb.length === 1) {
    return []
  }

  return resultBreadcrumb
})

function goHome() {
  router.push('/')
}
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

  &:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
}

.breadcrumb {
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: 500;
  }
}

.breadcrumb-transition-enter-active {
  transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1),
  opacity 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.breadcrumb-transition-leave-active {
  display: none;
}

.breadcrumb-transition-enter-from {
  opacity: 0;
  transform: translateX(30px) skewX(-30deg);
}
</style>
