<template>
  <div class="bg-card p-3">
    <!-- 操作面板 -->
    <el-space wrap class="mb-3">
      <el-button
        @click="performBatchDelete"
        :disabled="selectedItems.length === 0 || operationState.isStopped"
      >
        批量删除 ({{ selectedItems.length }})
      </el-button>

      <el-button
        @click="performBatchUpdate"
        :disabled="selectedItems.length === 0 || operationState.isStopped"
      >
        批量更新状态
      </el-button>

      <el-button
        type="warning"
        @click="pauseOperation"
      >
        暂停操作
      </el-button>

      <el-button
        type="success"
        @click="resumeOperation"
      >
        恢复操作
      </el-button>

      <el-button
        type="danger"
        @click="stopOperation"
      >
        停止操作
      </el-button>

      <el-button @click="reset" :disabled="operationState.loading"> 重置</el-button>
    </el-space>


    <!-- 实时日志 -->
    <div class="log-section" v-if="logs.length > 0">
      <h3>操作日志</h3>
      <div class="log-container">
        <div
          v-for="(log, index) in logs.slice(-10)"
          :key="index"
          :class="['log-item', `log-${log.type}`]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <re-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="#" width="55" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          {{ row.status === 'active' ? '激活' : '停用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作结果">
        <template #default="{ row }">
          {{ getResultText(getOperationResult(row.id)) }}
        </template>
      </el-table-column>
    </re-table>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useBatchOperation } from '@/composables'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
  { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', status: 'inactive' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', status: 'active' },
  { id: 6, name: '孙八', email: 'sunba@example.com', status: 'active' },
  { id: 7, name: '周九', email: 'zhoujiu@example.com', status: 'inactive' },
  { id: 8, name: '吴十', email: 'wushi@example.com', status: 'active' },
])

const selectedItems = ref([])
const logs = ref([])
const currentOperation = ref('delete')

// 添加日志
const addLog = (message, type = 'info') => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    message,
    type,
  })
}

// 模拟删除 API（支持更长的延迟来测试停止功能）
const deleteApi = async (item) => {
  addLog(`开始删除用户: ${item.name}`, 'info')

  // 模拟较长的网络延迟（3-6秒）
  const delay = Math.random() * 3000 + 3000
  await new Promise((resolve) => setTimeout(resolve, delay))

  // 模拟随机失败
  if (Math.random() < 0.2) {
    addLog(`删除用户 ${item.name} 失败`, 'error')
    throw new Error(`删除用户 ${item.name} 失败：服务器错误`)
  }

  addLog(`成功删除用户: ${item.name}`, 'success')
  return {
    success: true,
    id: item.id,
    deletedAt: new Date().toISOString(),
  }
}

// 模拟更新 API
const updateApi = async (item) => {
  addLog(`开始更新用户: ${item.name}`, 'info')

  // 模拟网络延迟（2-4秒）
  const delay = Math.random() * 2000 + 2000
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (Math.random() < 0.15) {
    addLog(`更新用户 ${item.name} 失败`, 'error')
    throw new Error(`更新用户 ${item.name} 状态失败`)
  }

  addLog(`成功更新用户: ${item.name}`, 'success')
  return {
    success: true,
    id: item.id,
    oldStatus: item.status,
    newStatus: item.status === 'active' ? 'inactive' : 'active',
    updatedAt: new Date().toISOString(),
  }
}

// 删除操作
const deleteOperation = useBatchOperation({
  api: deleteApi,
  concurrency: 2, // 降低并发数以便观察停止效果
  onProgress: ({ progress, completed, total, current }) => {
    console.log(`删除进度: ${progress}% - 正在删除: ${current.name}`)
  },
  onSuccess: (result, item) => {
    ElMessage.success(`用户 ${item.name} 删除成功`)
  },
  onError: (error, item) => {
    if (error.message.includes('stopped')) {
      ElMessage.warning(`用户 ${item.name} 删除被停止`)
    } else {
      ElMessage.error(`用户 ${item.name} 删除失败: ${error.message}`)
    }
  },
  onComplete: ({ completed, failed, total }) => {
    const message = `删除操作完成! 成功: ${completed}, 失败: ${failed}, 总计: ${total}`
    ElMessage({
      type: failed > 0 ? 'warning' : 'success',
      message,
    })
    addLog(message, failed > 0 ? 'warning' : 'success')
  },
})

// 更新操作
const updateOperation = useBatchOperation({
  api: updateApi,
  concurrency: 1, // 串行执行以便观察停止效果
  onProgress: ({ progress, current }) => {
    console.log(`更新进度: ${progress}% - 正在更新: ${current.name}`)
  },
  onSuccess: (result, item) => {
    ElMessage.success(`用户 ${item.name} 状态更新成功`)
    // 更新表格数据
    const tableItem = tableData.value.find((t) => t.id === item.id)
    if (tableItem) {
      tableItem.status = result.newStatus
    }
  },
  onError: (error, item) => {
    if (error.message.includes('stopped')) {
      ElMessage.warning(`用户 ${item.name} 更新被停止`)
    } else {
      ElMessage.error(`用户 ${item.name} 状态更新失败: ${error.message}`)
    }
  },
})

// 监听停止状态
watch(
  [deleteOperation.isStopped, updateOperation.isStopped],
  ([deleteStopped, updateStopped]) => {
    if (deleteStopped || updateStopped) {
      addLog('批量操作已停止', 'warning')
    }
  }
)

// 当前使用的操作
const operationState = reactive({
  get loading() {
    return currentOperation.value === 'delete'
      ? deleteOperation.loading.value
      : updateOperation.loading.value
  },
  get progress() {
    return currentOperation.value === 'delete'
      ? deleteOperation.progress.value
      : updateOperation.progress.value
  },
  get total() {
    return currentOperation.value === 'delete'
      ? deleteOperation.total.value
      : updateOperation.total.value
  },
  get completed() {
    return currentOperation.value === 'delete'
      ? deleteOperation.completed.value
      : updateOperation.completed.value
  },
  get failed() {
    return currentOperation.value === 'delete'
      ? deleteOperation.failed.value
      : updateOperation.failed.value
  },
  get results() {
    return currentOperation.value === 'delete'
      ? deleteOperation.results.value
      : updateOperation.results.value
  },
  get errors() {
    return currentOperation.value === 'delete'
      ? deleteOperation.errors.value
      : updateOperation.errors.value
  },
  get isCompleted() {
    return currentOperation.value === 'delete'
      ? deleteOperation.isCompleted.value
      : updateOperation.isCompleted.value
  },
  get isStopped() {
    return currentOperation.value === 'delete'
      ? deleteOperation.isStopped.value
      : updateOperation.isStopped.value
  },
  get isPaused() {
    return currentOperation.value === 'delete'
      ? deleteOperation.isPaused.value
      : updateOperation.isPaused.value
  },
  get successRate() {
    return currentOperation.value === 'delete'
      ? deleteOperation.successRate.value
      : updateOperation.successRate.value
  },
})

// 表格选择
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

// 执行批量删除
const performBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 个用户吗？操作过程中可以点击"停止操作"按钮取消。`,
      '批量删除确认',
      { type: 'warning' }
    )

    currentOperation.value = 'delete'
    addLog(`开始批量删除 ${selectedItems.value.length} 个用户`, 'info')

    deleteOperation.execute(selectedItems.value, {
      concurrency: 2,
      delay: 100,
    })
  } catch {
    // 用户取消
  }
}

// 执行批量更新
const performBatchUpdate = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要更新的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要更新选中的 ${selectedItems.value.length} 个用户的状态吗？操作过程中可以点击"停止操作"按钮取消。`,
      '批量更新确认',
      { type: 'info' }
    )

    currentOperation.value = 'update'
    addLog(`开始批量更新 ${selectedItems.value.length} 个用户状态`, 'info')

    updateOperation.execute(selectedItems.value, {
      concurrency: 1,
    })
  } catch {
    // 用户取消
  }
}

// 停止操作
const stopOperation = () => {
  if (currentOperation.value === 'delete') {
    deleteOperation.stop()
  } else {
    updateOperation.stop()
  }
  addLog('用户手动停止操作', 'warning')
}

// 暂停操作
const pauseOperation = () => {
  if (currentOperation.value === 'delete') {
    deleteOperation.pause()
  } else {
    updateOperation.pause()
  }
  addLog('用户手动暂停操作', 'info')
}

// 恢复操作
const resumeOperation = () => {
  if (currentOperation.value === 'delete') {
    deleteOperation.resume()
  } else {
    updateOperation.resume()
  }
  addLog('用户手动恢复操作', 'success')
}

// 重置
const reset = () => {
  deleteOperation.reset()
  updateOperation.reset()
  logs.value = []
  addLog('状态已重置', 'info')
}

// 获取操作结果
const getOperationResult = (itemId) => {
  const deleteResult = deleteOperation.results.value.find(
    (r) => r.item.id === itemId
  )
  const updateResult = updateOperation.results.value.find(
    (r) => r.item.id === itemId
  )
  const deleteError = deleteOperation.errors.value.find(
    (e) => e.item.id === itemId
  )
  const updateError = updateOperation.errors.value.find(
    (e) => e.item.id === itemId
  )

  return deleteResult || updateResult || deleteError || updateError
}

// 获取结果标签类型
const getResultTagType = (result) => {
  if (!result) return ''
  return result.status === 'success' ? 'success' : 'danger'
}

// 获取结果文本
const getResultText = (result) => {
  if (!result) return ''
  return result.status === 'success' ? '成功' : '失败'
}

// 获取进度条状态
const getProgressStatus = () => {
  if (operationState.isStopped) return 'exception'
  if (operationState.isPaused) return undefined // 暂停时保持默认样式
  if (operationState.isCompleted) {
    return operationState.failed > 0 ? 'warning' : 'success'
  }
  return undefined
}
</script>

<style scoped>
.batch-operation-demo {
  padding: 20px;
}

.operation-panel {
  margin-bottom: 20px;
}

.operation-panel .el-button {
  margin-right: 10px;
}

.status-section {
  margin: 20px 0;
}

.progress-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.progress-info {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.log-section {
  margin: 20px 0;
}

.log-section h3 {
  color: #303133;
  margin-bottom: 10px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 10px;
  font-family: "Courier New", monospace;
}

.log-item {
  margin-bottom: 4px;
  font-size: 12px;
}

.log-time {
  color: #666;
  margin-right: 8px;
}

.log-info .log-message {
  color: #67c23a;
}

.log-success .log-message {
  color: #00d4aa;
}

.log-warning .log-message {
  color: #e6a23c;
}

.log-error .log-message {
  color: #f56c6c;
}
</style>
