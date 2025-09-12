import { onUnmounted, onDeactivated } from 'vue'

/**
 * 内存优化工具类
 * 用于清理不必要的对象引用，防止内存泄漏
 */
export class MemoryOptimizer {
  constructor() {
    this.cleanupTasks = []
    this.timers = []
    this.observers = []
    this.eventListeners = []
    this.weakRefs = new WeakMap()
  }

  /**
   * 添加清理任务
   * @param {Function} task 清理函数
   */
  addCleanupTask(task) {
    if (typeof task === 'function') {
      this.cleanupTasks.push(task)
    }
  }

  /**
   * 注册定时器，自动清理
   * @param {Function} timer 定时器（setInterval、setTimeout等）
   */
  registerTimer(timer) {
    this.timers.push(timer)
    return timer
  }

  /**
   * 注册观察器，自动清理
   * @param {Object} observer 观察器（MutationObserver、ResizeObserver等）
   */
  registerObserver(observer) {
    this.observers.push(observer)
    return observer
  }

  /**
   * 注册事件监听器，自动清理
   * @param {Element} element DOM元素
   * @param {string} event 事件名称
   * @param {Function} handler 事件处理函数
   * @param {Object} options 事件选项
   */
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options)
    this.eventListeners.push({ element, event, handler, options })
  }

  /**
   * 使用WeakRef存储大对象，避免强引用
   * @param {string} key 键名
   * @param {Object} value 要存储的对象
   */
  setWeakRef(key, value) {
    this.weakRefs.set(key, new WeakRef(value))
  }

  /**
   * 获取WeakRef存储的对象
   * @param {string} key 键名
   * @returns {Object|null} 对象或null（如果已被垃圾回收）
   */
  getWeakRef(key) {
    const ref = this.weakRefs.get(key)
    return ref ? ref.deref() : null
  }

  /**
   * 清理数组，移除不必要的元素
   * @param {Array} array 要清理的数组
   * @param {number} maxLength 最大长度
   * @param {Function} filter 过滤函数
   */
  cleanupArray(array, maxLength = 100, filter = null) {
    if (!Array.isArray(array)) return array

    // 应用过滤器
    if (filter && typeof filter === 'function') {
      array.splice(0, array.length, ...array.filter(filter))
    }

    // 限制数组长度
    if (array.length > maxLength) {
      array.splice(0, array.length - maxLength)
    }

    return array
  }

  /**
   * 深度清理对象，移除循环引用
   * @param {Object} obj 要清理的对象
   * @param {Set} visited 已访问的对象集合
   */
  deepCleanObject(obj, visited = new Set()) {
    if (obj === null || typeof obj !== 'object' || visited.has(obj)) {
      return obj
    }

    visited.add(obj)

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepCleanObject(item, visited))
    }

    const cleaned = {}
    for (const [key, value] of Object.entries(obj)) {
      // 跳过函数和特殊属性
      if (typeof value === 'function' || key.startsWith('_')) {
        continue
      }
      cleaned[key] = this.deepCleanObject(value, visited)
    }

    visited.delete(obj)
    return cleaned
  }

  /**
   * 强制垃圾回收（仅在支持的环境中）
   */
  forceGC() {
    if (window.gc) {
      window.gc()
    } else if (global && global.gc) {
      global.gc()
    }
  }

  /**
   * 执行所有清理任务
   */
  cleanup() {
    // 清理定时器
    this.timers.forEach(timer => {
      if (timer) {
        clearTimeout(timer)
        clearInterval(timer)
      }
    })
    this.timers.length = 0

    // 清理观察器
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect()
      }
    })
    this.observers.length = 0

    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler, options)
      }
    })
    this.eventListeners.length = 0

    // 执行自定义清理任务
    this.cleanupTasks.forEach(task => {
      try {
        task()
      } catch (error) {
        console.warn('清理任务执行失败:', error)
      }
    })
    this.cleanupTasks.length = 0

    // 清理WeakMap
    this.weakRefs = new WeakMap()

    // 尝试强制垃圾回收
    this.forceGC()
  }
}

/**
 * Vue组合式函数：内存优化
 * @param {Object} options 配置选项
 * @returns {Object} 内存优化器实例和相关方法
 */
export function useMemoryOptimizer(options = {}) {
  const {
    autoCleanup = true,
    cleanupOnUnmounted = true,
    cleanupOnDeactivated = true,
    maxArrayLength = 100,
    enableWeakRef = true,
  } = options

  const optimizer = new MemoryOptimizer()

  // 自动清理功能
  if (autoCleanup) {
    if (cleanupOnUnmounted) {
      onUnmounted(() => {
        optimizer.cleanup()
      })
    }

    if (cleanupOnDeactivated) {
      onDeactivated(() => {
        optimizer.cleanup()
      })
    }
  }

  /**
   * 优化大型数据数组
   * @param {Array} dataArray 数据数组
   * @param {Object} options 优化选项
   */
  const optimizeDataArray = (dataArray, options = {}) => {
    const {
      maxLength = maxArrayLength,
      keepLatest = true,
      compress = false,
    } = options

    if (!Array.isArray(dataArray)) return dataArray

    // 限制数组长度
    if (dataArray.length > maxLength) {
      if (keepLatest) {
        dataArray.splice(0, dataArray.length - maxLength)
      } else {
        dataArray.splice(maxLength)
      }
    }

    // 压缩数据（移除不必要的属性）
    if (compress) {
      dataArray.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          // 移除以下划线开头的私有属性
          Object.keys(item).forEach(key => {
            if (key.startsWith('_') || key.startsWith('$')) {
              delete item[key]
            }
          })
        }
      })
    }

    return dataArray
  }

  /**
   * 创建内存友好的缓存
   * @param {number} maxSize ���大缓存大小
   */
  const createMemoryFriendlyCache = (maxSize = 100) => {
    const cache = new Map()

    return {
      get(key) {
        const value = cache.get(key)
        if (value !== undefined) {
          // LRU: 将访问的项移到最后
          cache.delete(key)
          cache.set(key, value)
        }
        return value
      },
      set(key, value) {
        if (cache.size >= maxSize) {
          // 删除最旧的项
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
        cache.set(key, value)
      },
      delete(key) {
        cache.delete(key)
      },
      clear() {
        cache.clear()
      },
      size() {
        return cache.size
      }
    }
  }

  return {
    optimizer,
    optimizeDataArray,
    createMemoryFriendlyCache,

    // 直接暴露优化器方法
    addCleanupTask: optimizer.addCleanupTask.bind(optimizer),
    registerTimer: optimizer.registerTimer.bind(optimizer),
    registerObserver: optimizer.registerObserver.bind(optimizer),
    addEventListener: optimizer.addEventListener.bind(optimizer),
    setWeakRef: optimizer.setWeakRef.bind(optimizer),
    getWeakRef: optimizer.getWeakRef.bind(optimizer),
    cleanupArray: optimizer.cleanupArray.bind(optimizer),
    deepCleanObject: optimizer.deepCleanObject.bind(optimizer),
    forceGC: optimizer.forceGC.bind(optimizer),
    cleanup: optimizer.cleanup.bind(optimizer),
  }
}
