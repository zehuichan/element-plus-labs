<template>
  <div class="tabs-view flex h-full flex-1 overflow-hidden">
    <!-- 左侧滚动按钮 -->
    <span
      v-show="showScrollButton"
      :class="{
        'tabs-view-button': true,
        'hover:bg-muted text-muted-foreground cursor-pointer': !scrollIsAtLeft,
        'pointer-events-none opacity-30': scrollIsAtLeft,
      }"
      class="px-2 flex items-center"
      @click="scrollDirection('left')"
    >
      <re-icon icon="park:arrow-left" size="14" />
    </span>

    <div class="size-full flex-1 overflow-hidden">
      <div ref="scrollbarRef" class="overflow-hidden h-full right-shadow relative">
        <div
          data-scroll-area-viewport
          class="tabs-view-main h-full w-full rounded-[inherit] focus:outline-none"
          @scroll="handleScrollAt"
          @wheel="onWheel"
        >
          <div class="tabs-view-content h-full w-full">
            <transition-group name="slide-left">
              <div
                v-for="(tab, i) in currentTabs"
                :key="tab.key"
                class="tabs-view-item group translate-all relative"
                :class="{ 'is-active': tab.key === currentActive, draggable: !tab.affixTab, 'affix-tab': tab.affixTab }"
                :data-active-tab="currentActive"
                :data-index="i"
                data-tab-item="true"
                @click="handleClick(tab.key)"
              >
                <re-context-menu :handler-data="tab" :menus="createContextMenus">
                  <div class="tabs-view-item__inner">
                    <div class="tabs-view-item__title">{{ tab.meta.title }}</div>
                    <re-icon
                      v-show="!tab.meta.affixTab && currentTabs.length > 1"
                      class="tabs-view-item__extra"
                      icon="park:close-small"
                      size="14"
                      @click.stop="closeTabByKey(tab.key)"
                    />
                    <re-icon
                      v-show="tab.meta.affixTab && currentTabs.length > 1"
                      class="tabs-view-item__extra"
                      icon="park:pushpin"
                      size="14"
                      @click.stop="unpinTab(tab)"
                    />
                  </div>
                </re-context-menu>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧滚动按钮 -->
    <span
      v-show="showScrollButton"
      :class="{
        'tabs-view-button': true,
        'hover:bg-muted text-muted-foreground cursor-pointer': !scrollIsAtRight,
        'pointer-events-none opacity-30': scrollIsAtRight,
      }"
      class="hover:bg-muted text-muted-foreground cursor-pointer px-2 flex items-center"
      @click="scrollDirection('right')"
    >
      <re-icon icon="park:arrow-right" size="14" />
    </span>
  </div>
</template>

<script setup>
import { useTabs } from '@/composables/useTabs'

import { useTabsDrag } from './use-tabs-drag'
import { useTabsViewScroll } from './use-tabs-view-scroll'
import { useTabbar } from './use-tabbar'

import { ReContextMenu } from '@/components/re-context-menu'

const props = defineProps({
  contentClass: {
    type: String,
    default: 'tabs-view-content',
  },
  draggable: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits()

const { unpinTab, closeTabByKey } = useTabs()
const { currentActive, currentTabs, createContextMenus, handleClick } = useTabbar()
const {
  handleScrollAt,
  handleWheel,
  scrollbarRef,
  scrollDirection,
  scrollIsAtLeft,
  scrollIsAtRight,
  showScrollButton,
} = useTabsViewScroll({ active: currentActive.value, tabs: currentTabs.value })

function onWheel(e) {
  handleWheel(e)
  e.stopPropagation()
  e.preventDefault()
}

useTabsDrag(props, emit)
</script>

<style lang="scss">
.tabs-view {
  width: 100%;
  height: 100%;
  display: flex;
  transition: all 0.2s ease-in-out;
  font-size: 12px;
  font-weight: 500;
  padding: 4px;
  gap: 4px;
}

.tabs-view-button {
  background: hsl(var(--accent));
  border-radius: 4px;
}

.tabs-view-main {
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: 4px;
}

.tabs-view-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tabs-view-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
  border-radius: 2px;
  color: hsl(var(--accent-foreground));
  background-color: hsl(var(--accent));

  &:hover {
    background-color: hsl(var(--accent-dark));
  }

  &.is-active {
    background-color: var(--el-color-primary);
    color: hsl(var(--primary-foreground));
  }

  .tabs-view-item__inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 32px 4px 12px;
  }

  .tabs-view-item__title {
    white-space: nowrap;
    overflow: hidden;
    text-align: left;
  }

  .tabs-view-item__extra {
    position: absolute;
    right: 7px;
  }
}
</style>
