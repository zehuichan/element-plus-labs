import { ref, computed } from 'vue'
import { isFunction } from '@/utils'

/**
 * @property {number} progress - 进度百分比 (0-100)
 * @property {number} completed - 已完成数量
 * @property {number} failed - 失败数量
 * @property {number} total - 总数量
 * @property {*} current - 当前处理的项目
 * @property {*} [result] - 成功时的结果
 * @property {Error} [error] - 失败时的错误
 */

/**
 * @typedef {Object} BatchResult
 * @property {number} index - 索引
 * @property {*} item - 原始数据项
 * @property {*} result - 操作结果
 * @property {'success'} status - 状态
 */

/**
 * @typedef {Object} BatchError
 * @property {number} index - 索引
 * @property {*} item - 原始数据项
 * @property {Error} error - 错误信息
 * @property {'error'} status - 状态
 */

/**
 * @typedef {Object} CompleteSummary
 * @property {number} total - 总数量
 * @property {number} completed - 已完成数量
 * @property {number} failed - 失败数量
 * @property {BatchResult[]} results - 成功结果列表
 * @property {BatchError[]} errors - 错误列表
 */

/**
 * @typedef {Object} ExecuteOptions
 * @property {number} [concurrency] - 并发数
 * @property {number} [delay] - 每个请求间的延迟时间(ms)
 */

/**
 * @typedef {Object} BatchOperationConfig
 * @property {Function} [api] - 批量操作的 API 接口，接收单个项目并返回 Promise
 * @property {number} [concurrency=3] - 并发数，默认为 3
 * @property {function(ProgressInfo): void} [onProgress] - 进度回调函数
 * @property {function(*, *, number): void} [onSuccess] - 成功回调函数，参数为 (result, item, index)
 * @property {function(Error, *, number): void} [onError] - 错误回调函数，参数为 (error, item, index)
 * @property {function(CompleteSummary): void} [onComplete] - 完成回调函数
 */

/**
 * @typedef {Object} BatchOperationReturn
 * @property {import('vue').Ref<boolean>} loading - 加载状态
 * @property {import('vue').Ref<number>} progress - 进度百分比
 * @property {import('vue').Ref<number>} total - 总数量
 * @property {import('vue').Ref<number>} completed - 已完成数量
 * @property {import('vue').Ref<number>} failed - 失败数量
 * @property {import('vue').Ref<BatchResult[]>} results - 成功结果列表
 * @property {import('vue').Ref<BatchError[]>} errors - 错误列表
 * @property {import('vue').Ref<boolean>} isStopped - 是否已停止
 * @property {import('vue').Ref<boolean>} isPaused - 是否已暂停
 * @property {import('vue').ComputedRef<boolean>} isCompleted - 是否已完成
 * @property {import('vue').ComputedRef<number>} successRate - 成功率
 * @property {import('vue').ComputedRef<number>} failureRate - 失败率
 * @property {function(Array, ExecuteOptions=): Promise<void>} execute - 执行批量操作
 * @property {function(): void} reset - 重置状态
 * @property {function(): void} stop - 停止操作（会立即停止新任务的执行）
 * @property {function(): void} pause - 暂停操作（会暂停新任务的执行）
 * @property {function(): void} resume - 恢复操作（恢复暂停的批量操作）
 */

/**
 * 批量操作 Hook
 *
 * 支持自定义 API 接口和并发数控制，提供完整的进度跟踪和错误处理
 *
 * @example
 * // 基本使用
 * const { loading, progress, execute } = useBatchOperation({
 *   api: async (item) => await deleteApi(item),
 *   concurrency: 3,
 *   onProgress: ({ progress }) => console.log(`进度: ${progress}%`)
 * })
 *
 * // 执行批量操作
 * await execute(items, { concurrency: 5, delay: 100 })
 *
 * @param {BatchOperationConfig} [config={}] - 配置项
 * @returns {BatchOperationReturn} 返回批量操作相关的响应式数据和方法
 */
export function useTaskQueue(config = {}) {
  const {
    api,
    concurrency = 3,
    onProgress,
    onSuccess,
    onError,
    onComplete,
  } = config

  // 响应式状态
  const loading = ref(false)
  const progress = ref(0)
  const total = ref(0)
  const completed = ref(0)
  const failed = ref(0)
  const results = ref([])
  const errors = ref([])

  // 控制状态
  const abortController = ref(null)
  const isStopped = ref(false)
  const isPaused = ref(false)
  const pausePromiseResolve = ref(null)

  // 计算属性
  const isCompleted = computed(
    () => completed.value + failed.value === total.value
  )
  const successRate = computed(() => {
    if (total.value === 0) return 0
    return Math.round((completed.value / total.value) * 100)
  })
  const failureRate = computed(() => {
    if (total.value === 0) return 0
    return Math.round((failed.value / total.value) * 100)
  })

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise<void>}
   */
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 等待暂停解除
   * @returns {Promise<void>}
   */
  function waitForResume() {
    if (!isPaused.value) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      pausePromiseResolve.value = resolve
    })
  }

  /**
   * 限制并发的异步任务执行器
   * @param {Array} tasks - 任务数组
   * @param {number} limit - 并发限制
   * @returns {Promise<Array>} Promise.allSettled 的结果
   */
  async function limitConcurrency(tasks, limit) {
    const results = []
    const executing = []

    for (const [index, task] of tasks.entries()) {
      // 检查是否已停止
      if (isStopped.value) {
        break
      }

      // 检查是否暂停，如果暂停则等待恢复
      if (isPaused.value) {
        await waitForResume()
      }

      // 再次检查停止状态（在等待暂停解除后）
      if (isStopped.value) {
        break
      }

      const promise = executeTask(task, index).then((result) => {
        executing.splice(executing.indexOf(promise), 1)
        return result
      })

      results.push(promise)
      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)

        // 在等待后再次检查是否已停止或暂停
        if (isStopped.value) {
          break
        }

        if (isPaused.value) {
          await waitForResume()
        }
      }
    }

    return Promise.allSettled(results)
  }

  /**
   * 执行单个任务
   * @param {*} item - 任务数据
   * @param {number} index - 任务索引
   * @returns {Promise<{status: 'fulfilled'|'rejected', value?: *, item: *, index: number, reason?: Error}>}
   */
  async function executeTask(item, index) {
    try {
      // 检查是否已停止
      if (isStopped.value) {
        throw new Error('Operation was stopped')
      }

      // 检查是否暂停
      if (isPaused.value) {
        await waitForResume()
      }

      // 暂停解除后再次检查是否已停止
      if (isStopped.value) {
        throw new Error('Operation was stopped')
      }

      if (!isFunction(api)) {
        throw new Error('API function is required')
      }

      const result = await api(item)

      // 更新成功计数
      completed.value++

      // 更新进度
      progress.value = Math.round(
        ((completed.value + failed.value) / total.value) * 100
      )

      // 存储成功结果
      results.value.push({
        index,
        item,
        result,
        status: 'success',
      })

      // 触发进度回调
      if (isFunction(onProgress)) {
        onProgress({
          progress: progress.value,
          completed: completed.value,
          failed: failed.value,
          total: total.value,
          current: item,
          result,
        })
      }

      // 触发成功回调
      if (isFunction(onSuccess)) {
        onSuccess(result, item, index)
      }

      return { status: 'fulfilled', value: result, item, index }
    } catch (error) {
      // 更新失败计数
      failed.value++

      // 更新进度
      progress.value = Math.round(
        ((completed.value + failed.value) / total.value) * 100
      )

      // 存储错误信息
      errors.value.push({
        index,
        item,
        error,
        status: 'error',
      })

      // 触发进度回调
      if (isFunction(onProgress)) {
        onProgress({
          progress: progress.value,
          completed: completed.value,
          failed: failed.value,
          total: total.value,
          current: item,
          error,
        })
      }

      // 触发错误回调
      if (isFunction(onError)) {
        onError(error, item, index)
      }

      return { status: 'rejected', reason: error, item, index }
    }
  }

  /**
   * 执行批量操作
   * @param {Array} items - 需要处理的数据数组
   * @param {ExecuteOptions} [options={}] - 执行选项
   * @returns {Promise<void>}
   */
  async function execute(items = [], options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('Items must be a non-empty array')
      return
    }

    // 重置状态
    reset()

    // 创建新的 AbortController
    abortController.value = new AbortController()
    isStopped.value = false

    const {
      concurrency: optionsConcurrency = concurrency,
      delay: delayMs = 0,
    } = options

    loading.value = true
    total.value = items.length

    try {
      // 如果设置了延迟，则在每个任务之间添加延迟
      let tasks = items
      if (delayMs > 0) {
        tasks = items.map((item) => async () => {
          await delay(delayMs)
          return item
        })
        tasks = await Promise.all(tasks.map((task) => task()))
      }

      // 执行批量操作
      await limitConcurrency(tasks, optionsConcurrency)

      // 触发完成回调
      if (isFunction(onComplete)) {
        onComplete({
          total: total.value,
          completed: completed.value,
          failed: failed.value,
          results: results.value,
          errors: errors.value,
        })
      }
    } catch (error) {
      console.error('Batch operation failed:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   * @returns {void}
   */
  function reset() {
    // 如果有正在进行的操作，先停止
    if (abortController.value) {
      abortController.value.abort()
    }

    // 如果处于暂停状态，先恢复
    if (isPaused.value) {
      resume()
    }

    loading.value = false
    progress.value = 0
    total.value = 0
    completed.value = 0
    failed.value = 0
    results.value = []
    errors.value = []
    isStopped.value = false
    isPaused.value = false
    pausePromiseResolve.value = null
    abortController.value = null
  }

  /**
   * 暂停批量操作
   * 会暂停新任务的执行，已开始的任务会继续完成
   * @returns {void}
   */
  function pause() {
    if (!loading.value || isStopped.value) {
      console.warn('无法暂停：操作未在运行或已停止')
      return
    }

    isPaused.value = true
    console.log('批量操作已暂停')
  }

  /**
   * 恢复批量操作
   * 恢复暂停的批量操作继续执行
   * @returns {void}
   */
  function resume() {
    if (!isPaused.value) {
      console.warn('无法恢复：操作未暂停')
      return
    }

    isPaused.value = false

    // 解除暂停等待
    if (pausePromiseResolve.value) {
      pausePromiseResolve.value()
      pausePromiseResolve.value = null
    }

    console.log('批量操作已恢复')
  }

  /**
   * 停止批量操作
   * 会立即停止新任务的执行，已开始的任务会继续完成
   * @returns {void}
   */
  function stop() {
    isStopped.value = true
    loading.value = false

    // 如果当前处于暂停状态，先恢复以确保停止能够正常执行
    if (isPaused.value) {
      resume()
    }

    // 中止 AbortController（如果 API 支持的话）
    if (abortController.value) {
      abortController.value.abort()
    }

    console.log('批量操作已停止')
  }

  return {
    // 响应式状态
    loading,
    progress,
    total,
    completed,
    failed,
    results,
    errors,
    isStopped,
    isPaused,

    // 计算属性
    isCompleted,
    successRate,
    failureRate,

    // 方法
    execute,
    reset,
    stop,
    pause,
    resume,
  }
}
