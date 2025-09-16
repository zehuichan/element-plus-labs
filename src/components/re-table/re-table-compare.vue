<template>
  <div ref="tableWrapperInstance" class="re-table-optimized">
    <el-table
      v-bind="$attrs"
      v-loading="loading"
      border
      highlight-current-row
      show-overflow-tooltip
      scrollbar-always-on
      :ref="changeInstance"
      :data="refData"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      @cell-click="handleCellClick"
    >
      <template #default>
        <slot>
          <component
            :is="h(ReTableColumn, null, $slots)"
            :columns="refColumns"
            :rules="rules"
            :editable="editable"
          />
        </slot>
      </template>

      <!-- 插入至表格最后一行之后的内容 -->
      <template #append>
        <slot name="append" />
      </template>

      <!-- 当数据为空时自定义的内容 -->
      <template #empty>
        <slot name="empty" />
      </template>
    </el-table>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  getCurrentInstance,
  reactive,
  onMounted,
  onUnmounted,
  onDeactivated,
  provide,
  nextTick,
  h,
  watch,
  shallowRef,
} from 'vue'

import { cloneDeep, findIndex, isEqual } from 'lodash-unified'

import { useAccess } from '@/composables/use-access'
import { useMemoryOptimizer } from '@/composables/use-memory-optimizer'

import {
  getEventTargetNode,
  isBoolean,
  isFunction,
} from '@/utils'

import {
  IGNORE_COLUMN_FLAG,
  ORIGINAL_CELL_META,
  RE_TABLE_FORM_INJECTION_KEY,
  RE_TABLE_INJECTION_KEY,
} from '../re-table/tokens'

import ReTableColumn from '../re-table/re-table-column.vue'

const props = defineProps({
  tableKey: {
    type: [String, Number],
    default: '0',
  },
  rowKey: {
    type: [Function, String],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: [Boolean, String, Object],
    default: false,
  },
  rules: {
    type: Object,
  },
  // 新增：内存优化配置
  memoryOptimization: {
    type: Object,
    default: () => ({
      enabled: true,
      maxDataLength: 5000,
      maxCacheSize: 500,
      enableAutoCleanup: true,
      cleanupInterval: 5 * 60 * 1000, // 5分钟
    })
  }
})

const vm = getCurrentInstance()

// 🚀 内存优化器 - 核心优化功能
const {
  optimizer,
  optimizeDataArray,
  createMemoryFriendlyCache,
  addCleanupTask,
  registerTimer,
  cleanupArray
} = useMemoryOptimizer({
  autoCleanup: props.memoryOptimization.enabled,
  cleanupOnUnmounted: true,
  cleanupOnDeactivated: true,
  maxArrayLength: props.memoryOptimization.maxDataLength
})

// 创建内存友好的缓存来替代普通的缓存
const memoryFriendlyCache = createMemoryFriendlyCache(props.memoryOptimization.maxCacheSize)

const tableWrapperInstance = ref()
const tableInstance = ref()
const paginationInstance = ref()
const activated = ref(false)

// 🔧 优化：使用 shallowRef 减少深度响应式开销
const refData = shallowRef([])
const cachedData = shallowRef([])
const cellMeta = ref({ ...ORIGINAL_CELL_META })

const { hasAccessByCodes, hasAccessByRoles } = useAccess()

const formRefs = shallowRef({})
provide(RE_TABLE_FORM_INJECTION_KEY, formRefs)

// 🔧 优化：避免在 computed 中创建新对象，减少内存分配
const cachedColumns = computed(() => {
  const cacheKey = `columns_${props.columns.length}_${JSON.stringify(props.columns.map(c => c.prop)).slice(0, 100)}`

  let cached = memoryFriendlyCache.get(cacheKey)
  if (!cached) {
    cached = props.columns.map((column) => ({ ...column }))
    memoryFriendlyCache.set(cacheKey, cached)
  }
  return cached
})

const refColumns = computed(() => {
  const cacheKey = `refColumns_${props.columns.length}`

  let cached = memoryFriendlyCache.get(cacheKey)
  if (!cached) {
    cached = props.columns.filter((column) => hasAuth(column) && hasHidden(column))
    memoryFriendlyCache.set(cacheKey, cached)
  }
  return cached
})

// 行元数据
const rowMeta = computed(() => refData.value[cellMeta.value.row])
// 列元数据
const columnMeta = computed(() => refColumns.value[cellMeta.value.col])

const hasAuth = (column, def = true) => {
  const { authType } = props
  const value = column.auth
  if (!value) {
    return def
  }
  const values = Array.isArray(value) ? value : [value]
  return authType === 'role'
    ? hasAccessByRoles(values)
    : hasAccessByCodes(values)
}

const hasHidden = (column) => {
  const hidden = column.hidden
  if (isBoolean(hidden)) {
    return !hidden
  }
  if (isFunction(hidden)) {
    return !hidden(column)
  }
  return true
}

// 行类
const rowClassName = ({ row, rowIndex }) => {
  const classNames = [`re-table-optimized-row-${rowIndex}`]
  return classNames.join(' ')
}

// 单元格类
const cellClassName = ({ rowIndex, columnIndex }) => {
  const classNames = [`re-table-optimized-cell-${rowIndex}-${columnIndex}`]

  if (rowIndex === cellMeta.value.row && columnIndex === cellMeta.value.col) {
    classNames.push('current-cell')
  }

  if (!equalCell(rowIndex, columnIndex)) {
    classNames.push('dirty-cell')
  }

  return classNames.join(' ')
}

// 🔧 优化：添加防抖的单元格更新
let updateCellTimer = null
const updateCell = (data) => {
  if (updateCellTimer) {
    clearTimeout(updateCellTimer)
  }

  updateCellTimer = registerTimer(setTimeout(() => {
    cellMeta.value = Object.assign(cellMeta.value, data)
    updateCellTimer = null
  }, 16)) // 60fps
}

// 🔧 优化：equalCell 函数添加缓存
const equalCell = (rowIndex, columnIndex) => {
  const cacheKey = `equal_${rowIndex}_${columnIndex}`

  let cached = memoryFriendlyCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const column = refColumns.value[columnIndex]
  const prop = column?.prop
  if (!prop) {
    memoryFriendlyCache.set(cacheKey, true)
    return true
  }

  const rowData = refData.value[rowIndex]
  const oldRowData = cachedData.value[rowIndex]
  const result = isEqual(rowData[prop], oldRowData[prop])

  memoryFriendlyCache.set(cacheKey, result)
  return result
}

/**
 * 对表格中的表单进行校验
 * @param {Boolean|Array} rows - 指定校验的行数据，true表示校验所有数据，false或未传表示校验变动数据
 * @returns {Promise} 返回一个 Promise，包含校验结果
 */
const validate = async (rows = true) => {
  if (Object.keys(formRefs.value).length === 0) {
    return Promise.resolve(null)
  }

  if (rows === true) {
    rows = refData.value
  } else {
    rows = Array.isArray(rows) ? rows : [rows]
  }

  const validRest = {}

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    try {
      const da = await Promise.all(formRefs.value[rowIndex].map((item) => item?.validate()))
      console.log(da, 'da')
    } catch (errors) {
      validRest[rowIndex] = errors
    }
  }

  return Promise.resolve(validRest)
}

/**
 * 实现表格单元格的导航
 */
const transformStart = (rowDelta, colDelta) => {
  const totalRows = refData.value.length
  const totalColumns = refColumns.value.length

  if (totalRows === 0 || totalColumns === 0) {
    return {
      row: -1,
      col: -1,
    }
  }

  let { row, col } = cellMeta.value
  let newRow = row + rowDelta
  let newCol = col + colDelta
  let attempts = 0
  const maxAttempts = totalRows * totalColumns

  while (attempts < maxAttempts) {
    // 边界处理
    if (newCol < 0) {
      newRow -= 1
      newCol = totalColumns - 1
    } else if (newCol >= totalColumns) {
      newRow += 1
      newCol = 0
    }
    if (newRow < 0) {
      newRow = totalRows - 1
    } else if (newRow >= totalRows) {
      newRow = 0
    }

    // 检查是否为忽略列
    if (!IGNORE_COLUMN_FLAG.includes(refColumns.value[newCol].type)) {
      return {
        row: newRow,
        col: newCol,
      }
    }

    // 继续寻找下一个有效单元格
    newRow += rowDelta
    newCol += colDelta
    attempts++
  }
}

const transformEnd = (scrollIntoView) => {
  const { row, activated, editable } = cellMeta.value

  // 聚焦输入框（如有）
  if (activated && (props.editable || editable)) {
    nextTick(() => {
      const currentCell =
        tableInstance.value.$el.querySelector('.current-cell')
      if (currentCell) {
        const input = currentCell.querySelector('input, textarea')
        if (input) {
          input.focus({ preventScroll: true })
        }
      }
    })
  }

  // 滚动到当前行
  if (scrollIntoView && row >= 0) {
    nextTick(() => {
      const rowElement = tableInstance.value.$el.querySelector(
        `.re-table-optimized-row-${row}`
      )
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
    })
  }
}

/**
 * 处理单元格编辑事件
 */
const handleCellClick = (row, column, cell, event) => {
  // 需求1：忽略 selection、index 等特殊列
  if (IGNORE_COLUMN_FLAG.includes(column.type)) {
    return
  }

  const {
    row: currentRowIndex,
    col: currentColIndex,
    editable,
  } = cellMeta.value

  const rowIndex = props.rowKey
    ? findIndex(refData.value, (item) => item[props.rowKey] === row[props.rowKey])
    : findIndex(refData.value, row)
  const columnIndex = column.getColumnIndex()

  const currentCell = currentRowIndex === rowIndex && currentColIndex === columnIndex && (props.editable === 'cell' || props.editable === 'manual')
  const currentRow = currentRowIndex === rowIndex && props.editable === 'row'

  // 前置需求：当前行或者当前单元格处于编辑状态时，点击行或者单元格不做任何处理
  if (currentCell || currentRow) {
    return
  }

  let shouldEdit = editable

  // 需求2：props.editable = true 时，表格整体可编辑
  if (props.editable === true) {
    shouldEdit = true
  }
  // 需求3：props.editable = row 时，点击行编辑
  else if (props.editable === 'row') {
    shouldEdit = true
  }
  // 需求4：props.editable = cell 时，点击单元格编辑
  else if (props.editable === 'cell') {
    shouldEdit = true
  }

  updateCell({
    row: rowIndex,
    col: columnIndex,
    activated: true,
    editable: shouldEdit,
    contextmenu: event.button === 2,
  })
}

// 🔧 优化：键盘事件处理
const registerGlobalKeydownEvent = (event) => {
  if (!activated.value) {
    return
  }

  const { editable, readonly, disabled, contextmenu } = cellMeta.value

  if (contextmenu && ['Enter', ' ', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return
  }

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      updateCell({ ...transformStart(-1, 0) })
      transformEnd(true)
      break
    case 'ArrowDown':
      event.preventDefault()
      updateCell({ ...transformStart(1, 0) })
      transformEnd(true)
      break
    case 'ArrowLeft':
      event.preventDefault()
      updateCell({ ...transformStart(0, -1) })
      transformEnd(false)
      break
    case 'ArrowRight':
      event.preventDefault()
      updateCell({ ...transformStart(0, 1) })
      transformEnd(false)
      break
    case 'Tab':
      event.preventDefault()
      updateCell({ ...transformStart(0, event.shiftKey ? -1 : 1), editable: false, })
      transformEnd(true)
      break
    case 'Enter':
      event.preventDefault()
      updateCell({ ...transformStart(1, 0), editable: false })
      transformEnd(true)
      break
    case 'F2':
      updateCell({ editable: true })
      transformEnd(false)
      break
    case 'Escape':
      updateCell({ editable: false })
      transformEnd(false)
      break
  }
}

const registerGlobalMousedownEvent = (event) => {
  const { flag } = getEventTargetNode(event, tableInstance.value.$el)
  activated.value = flag
}

const changeInstance = (instance) => {
  if (instance) {
    instance.validate = validate
  }
  vm.exposed = vm.exposeProxy = tableInstance.value = instance || {}
}

// 🚀 内存优化：数据更新时清理缓存和优化数组
const optimizeTableData = () => {
  // 清理缓存
  memoryFriendlyCache.clear()

  // 优化数据数组
  if (refData.value && refData.value.length > 0) {
    refData.value = optimizeDataArray(refData.value, {
      maxLength: props.memoryOptimization.maxDataLength,
      compress: true,
      keepLatest: true
    })
  }

  if (cachedData.value && cachedData.value.length > 0) {
    cachedData.value = optimizeDataArray(cachedData.value, {
      maxLength: props.memoryOptimization.maxDataLength,
      compress: true,
      keepLatest: true
    })
  }
}

// 🚀 内存优化：定期清理不必要的DOM引用和事件监听器
const cleanupDOMReferences = () => {
  // 清理可能的循环引用
  if (formRefs.value) {
    Object.keys(formRefs.value).forEach(key => {
      if (!refData.value[key]) {
        delete formRefs.value[key]
      }
    })
  }

  // 清理缓存
  memoryFriendlyCache.clear()

  // 强制垃圾回收
  optimizer.forceGC()
}

// 🚀 内存优化：监听数据变化，定期优化
watch(() => props.data, (newData) => {
  refData.value = cloneDeep(newData)
  cachedData.value = cloneDeep(newData)

  // 延迟执行优化，避免阻塞UI
  const optimizeTimer = registerTimer(setTimeout(() => {
    optimizeTableData()
  }, 100))
}, {
  immediate: true,
  deep: false // 使用浅层监听减少性能开销
})

// 🚀 内存优化：监听组件激活状态
watch(activated, (isActivated) => {
  if (!isActivated) {
    // 组件非激活时，清理部分缓存
    const optimizeTimer = registerTimer(setTimeout(() => {
      memoryFriendlyCache.clear()
      optimizer.forceGC()
    }, 1000))
  } else {
    updateCell({ ...ORIGINAL_CELL_META })
  }
})

// 🚀 内存优化：定期清理（可配置间隔）
if (props.memoryOptimization.enableAutoCleanup) {
  const cleanupInterval = registerTimer(setInterval(cleanupDOMReferences, props.memoryOptimization.cleanupInterval))
}

// 🚀 内存优化：添加清理任务
addCleanupTask(() => {
  // 清理所有引用
  refData.value = []
  cachedData.value = []

  if (formRefs.value) {
    Object.keys(formRefs.value).forEach(key => {
      delete formRefs.value[key]
    })
  }

  // 清理DOM引用
  tableWrapperInstance.value = null
  tableInstance.value = null
  paginationInstance.value = null

  // 清理缓存
  memoryFriendlyCache.clear()
})

// 🚀 内存优化：使用 addEventListener 方法注册事件，确保自动清理
onMounted(() => {
  if (typeof window !== 'undefined') {
    optimizer.addEventListener(window, 'keydown', registerGlobalKeydownEvent)
    optimizer.addEventListener(window, 'focus', () => {
      activated.value = true
    })
    optimizer.addEventListener(window, 'blur', () => {
      activated.value = false
    })
    optimizer.addEventListener(window, 'mousedown', registerGlobalMousedownEvent)
  }

  activated.value = true
})

provide(
  RE_TABLE_INJECTION_KEY,
  reactive({
    tableKey: props.tableKey,
    rowKey: props.rowKey,
    tableWrapperInstance,
    tableInstance,
    paginationInstance,
    activated,
    cellMeta,
    refData,
    cachedData,
    refColumns,
    cachedColumns,
    rowMeta,
    columnMeta,
    hasAuth,
    hasHidden,
  })
)

// 🚀 内存优化：暴露优化后的方法
defineExpose({
  validate,
  // 添加内存优化方法
  optimizeMemory: optimizeTableData,
  clearCache: () => memoryFriendlyCache.clear(),
  forceCleanup: () => optimizer.cleanup(),
  getMemoryStats: () => ({
    cacheSize: memoryFriendlyCache.size(),
    dataLength: refData.value.length,
    cachedDataLength: cachedData.value.length,
  })
})
</script>

<style lang="scss">
.re-table-optimized {
  .el-table {
    --el-table-header-bg-color: hsl(var(--accent));
    --el-table-header-text-color: hsl(var(--accent-foreground));
    --el-table-text-color: var(--el-text-color-regular);

    thead {
      th {
        font-weight: 500;
      }
    }
  }

  .current-cell {
    box-shadow: inset 0 0 0 1px var(--el-color-success-dark-2);
  }

  .dirty-cell {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: -5px;
      left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent var(--el-color-danger) transparent transparent;
      transform: rotate(45deg);
    }
  }

  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
