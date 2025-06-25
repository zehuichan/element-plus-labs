<template>
  <div>
    <div
      class="bg-accent group flex h-8 cursor-pointer items-center gap-3 rounded-2xl border-none bg-none px-2 py-0.5 outline-none"
      @click="toggleOpen()"
    >
      <re-icon class="text-muted-foreground group-hover:text-foreground group-hover:opacity-100" icon="svg:search" />
      <span
        class="text-muted-foreground group-hover:text-foreground hidden text-xs duration-300 md:block"
      >
        搜索
      </span>
      <span
        v-if="enableShortcutKey"
        class="bg-background border-foreground/60 text-muted-foreground group-hover:text-foreground relative hidden rounded-sm rounded-r-xl px-1.5 py-1 text-xs leading-none group-hover:opacity-100 md:block"
      >
        {{ isWindowsOs() ? 'Ctrl' : '⌘' }}
        <kbd>K</kbd>
      </span>
    </div>
    <el-dialog
      v-model="open"
      class="global-search-dialog"
      width="600px"
      top="60px"
      append-to-body
      :show-close="false"
      @opened="handleOpened"
    >
      <el-input
        ref="inputRef"
        v-model="keyword"
        placeholder="搜索"
        clearable
        size="large"
        @input="handleSearch"
      >
        <template #prefix>
          <icon-park type="search" />
        </template>
      </el-input>
      <!-- 无搜索结果 -->
      <div
        v-show="keyword && searchResults.length === 0"
        class="text-muted-foreground text-center"
      >
        <p class="my-10">
          无法找到相关结果
          <span class="text-foreground font-medium">
            "{{ keyword }}"
          </span>
        </p>
      </div>
      <!-- 历史搜索记录 & 没有搜索结果 -->
      <div
        v-if="!keyword && searchResults.length === 0"
        class="text-muted-foreground text-center"
      >
        <p class="my-10">
          没有搜索历史
        </p>
      </div>
      <ul v-show="searchResults.length > 0" class="list mt-3">
        <li
          v-for="(item, index) in uniqueByField(searchResults, 'path')"
          :key="item.path"
          :class="{ 'active bg-primary text-primary-foreground': activeIndex === index }"
          :data-search-item="index"
          :data-index="index"
          class="bg-accent flex-center group mb-3 w-full cursor-pointer rounded-sm px-3 py-3"
          @click="handleEnter"
          @mouseenter="handleMouseenter"
        >
          <re-icon v-if="item.icon" :icon="item.icon" class="mr-2" />
          <re-icon v-else icon="park:hamburger-button" class="mr-2" />
          <div class="flex-1 text-xs">{{ item.name }}</div>
          <div class="list__item-enter">
            <re-icon icon="svg:enter" />
          </div>
        </li>
      </ul>
      <template #footer>
        <div class="commands-key">
          <re-icon icon="svg:enter" size="15" />
          <span class="label ml-2">确认</span>
        </div>
        <div class="commands-key">
          <re-icon icon="svg:arrow-down" size="15" />
          <re-icon icon="svg:arrow-up" size="15" />
          <span class="label ml-2">切换</span>
        </div>
        <div class="commands-key">
          <re-icon icon="svg:esc" size="15" />
          <span class="label ml-2">关闭</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { shallowRef, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import { onKeyStroke, useDebounceFn, useLocalStorage, useMagicKeys, whenever } from '@vueuse/core'

import { isHttpUrl, isWindowsOs, traverseTreeValues, uniqueByField } from '@/utils'

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
  enableShortcutKey: Boolean,
})

// 存储所有需要转义的特殊字符
const code = new Set([
  '$',
  '(',
  ')',
  '*',
  '+',
  '.',
  '?',
  '[',
  '\\',
  ']',
  '^',
  '{',
  '|',
  '}',
])

// Translate special characters
function transform(c) {
  // 如果字符在特殊字符列表中，返回转义后的字符
  // 如果不在，返回字符本身
  return code.has(c) ? `\\${c}` : c
}

function createSearchReg(key) {
  // 将输入的字符串拆分为单个字符
  // 对每个字符进行转义
  // 然后用'.*'连接所有字符，创建正则表达式
  const keys = [...key].map((item) => transform(item)).join('.*')
  // 返回创建的正则表达式
  return new RegExp(`.*${keys}.*`)
}

const inputRef = ref()
const open = ref(false)
const searchItems = shallowRef(props.menus)
const keyword = ref('')
const activeIndex = ref(-1)
const searchResults = ref([])

const router = useRouter()
const searchHistory = useLocalStorage(`__search-history-${location.hostname}__`, [])
const keys = useMagicKeys()
const cmd = isWindowsOs() ? keys['ctrl+k'] : keys['cmd+k']

whenever(cmd, () => {
  if (props.enableShortcutKey) {
    open.value = true
  }
})

const preventDefaultBrowserSearchHotKey = (event) => {
  if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
  }
}

const toggleKeydownListener = () => {
  if (props.enableShortcutKey) {
    addEventListener('keydown', preventDefaultBrowserSearchHotKey)
  } else {
    removeEventListener('keydown', preventDefaultBrowserSearchHotKey)
  }
}

const toggleOpen = () => {
  open.value = !open.value
}

watch(() => props.enableShortcutKey, toggleKeydownListener)

const scrollIntoView = () => {
  const element = document.querySelector(
    `[data-search-item="${activeIndex.value}"]`,
  )

  if (element) {
    element.scrollIntoView({ block: 'nearest' })
  }
}

const search = (searchKey) => {
  // 去除搜索关键词的前后空格
  searchKey = searchKey.trim()

  // 如果搜索关键词为空，清空搜索结果并返回
  if (!searchKey) {
    searchResults.value = []
    return
  }

  // 使用搜索关键词创建正则表达式
  const reg = createSearchReg(searchKey)

  // 初始化结果数组
  const results = []

  // 遍历搜索项
  traverseTreeValues(searchItems.value, (item) => {
    // 如果菜单项的名称匹配正则表达式，将其添加到结果数组中
    if (reg.test(item.name?.toLowerCase())) {
      results.push(item)
    }
  })

  // 更新搜索结果
  searchResults.value = results

  // 如果有搜索结果，设置索引为 0
  if (results.length > 0) {
    activeIndex.value = 0
  }

  // 赋值索引为 0
  activeIndex.value = 0
}

const handleSearch = useDebounceFn(search, 200)

const handleMouseenter = (e) => {
  const index = e.target?.dataset.index
  activeIndex.value = Number(index)
}

const handleEnter = async () => {
  if (searchResults.value.length === 0) {
    return
  }
  const result = searchResults.value
  const index = activeIndex.value
  if (result.length === 0 || index < 0) {
    return
  }
  const to = result[index]
  if (to) {
    searchHistory.value.push(to)
    handleClose()
    await nextTick()
    if (isHttpUrl(to.path)) {
      window.open(to.path, '_blank')
    } else {
      void router.push({ path: to.path, replace: true })
    }
  }
}

const handleUp = () => {
  if (searchResults.value.length === 0) {
    return
  }
  activeIndex.value--
  if (activeIndex.value < 0) {
    activeIndex.value = searchResults.value.length - 1
  }
  scrollIntoView()
}

const handleDown = () => {
  if (searchResults.value.length === 0) {
    return
  }
  activeIndex.value++
  if (activeIndex.value > searchResults.value.length - 1) {
    activeIndex.value = 0
  }
  scrollIntoView()
}

const handleOpened = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })

  if (searchHistory.value.length > 0) {
    searchResults.value = uniqueByField(searchHistory.value, 'path')
  }
}

const handleClose = () => {
  searchResults.value = []
  open.value = false
  keyword.value = ''
}

// enter search
onKeyStroke('Enter', handleEnter)
// Monitor keyboard arrow keys
onKeyStroke('ArrowUp', handleUp)
onKeyStroke('ArrowDown', handleDown)
// esc close
onKeyStroke('Escape', handleClose)

onMounted(() => {
  toggleKeydownListener()

  onUnmounted(() => {
    removeEventListener('keydown', preventDefaultBrowserSearchHotKey)
  })
})
</script>

<style lang="scss">
.global-search-dialog {
  padding: 0;

  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 12px 12px 0;
  }

  .el-dialog__footer {
    padding: 12px;
    display: flex;
    border-top: 1px solid hsl(var(--border));
  }

  .list {
    padding: 0;
  }

  .commands-key {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(60, 60, 60, 0.7);
    margin-right: 0.8em;

    .label {
      font-size: 12px;
    }
  }
}
</style>
