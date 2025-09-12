import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

/**
 * 性能监听 composable
 * 监听组件渲染性能、内存使用、交互响应时间等指标
 */
export function usePerformanceMonitor(componentName = 'Component', options = {}) {
  const {
    enableMemoryMonitor = true,
    enableRenderMonitor = true,
    enableInteractionMonitor = true,
    reportInterval = 5000, // 报告间隔，毫秒
    memoryThreshold = 50 * 1024 * 1024, // 内存阈值，50MB
    renderThreshold = 16, // 渲染时间阈值，16ms (60fps)
  } = options

  // 性能数据
  const performanceData = ref({
    componentName,
    renderTimes: [],
    memoryUsage: [],
    interactions: [],
    totalRenders: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
    minRenderTime: Infinity,
    memoryLeaks: [],
    slowOperations: [],
  })

  // 监听器状态
  const isMonitoring = ref(false)
  let performanceObserver = null
  let memoryTimer = null
  let reportTimer = null
  let startTime = null
  let renderCount = 0

  /**
   * 开始渲染时间测量
   */
  const startRenderMeasure = () => {
    if (!enableRenderMonitor) return
    startTime = performance.now()
  }

  /**
   * 结束渲染时间测量
   */
  const endRenderMeasure = (operationName = 'render') => {
    if (!enableRenderMonitor || !startTime) return

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // 记录渲染时间
    performanceData.value.renderTimes.push({
      time: renderTime,
      timestamp: Date.now(),
      operation: operationName,
    })

    // 更新统计数据
    performanceData.value.totalRenders++
    performanceData.value.maxRenderTime = Math.max(performanceData.value.maxRenderTime, renderTime)
    performanceData.value.minRenderTime = Math.min(performanceData.value.minRenderTime, renderTime)

    // 计算平均渲染时间
    const totalTime = performanceData.value.renderTimes.reduce((sum, item) => sum + item.time, 0)
    performanceData.value.averageRenderTime = totalTime / performanceData.value.totalRenders

    // 检查慢渲染
    if (renderTime > renderThreshold) {
      performanceData.value.slowOperations.push({
        type: 'slow_render',
        operation: operationName,
        time: renderTime,
        timestamp: Date.now(),
        threshold: renderThreshold,
      })
      console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (${operationName})`)
    }

    startTime = null
  }

  /**
   * 测量内存使用情况
   * @returns {Object|null} 返回内存使用情况的详细信息，如果不支持则返回null
   */
  const measureMemory = () => {
    if (!enableMemoryMonitor) {
      return {
        supported: false,
        error: 'Memory monitoring is disabled'
      }
    }

    // 检查浏览器是否支持 performance.memory
    if ('memory' in performance) {
      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      }

      performanceData.value.memoryUsage.push(memory)

      // 计算内存使用百分比
      const usagePercentage = ((memory.used / memory.total) * 100).toFixed(2)
      const limitPercentage = ((memory.used / memory.limit) * 100).toFixed(2)

      // 格式化内存大小（转换为MB）
      const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2)

      // 检查内存泄漏
      const isHighUsage = memory.used > memoryThreshold
      if (isHighUsage) {
        performanceData.value.memoryLeaks.push({
          used: memory.used,
          timestamp: Date.now(),
          threshold: memoryThreshold,
        })
      }

      // 只保留��近100条记录
      if (performanceData.value.memoryUsage.length > 100) {
        performanceData.value.memoryUsage = performanceData.value.memoryUsage.slice(-100)
      }

      // 返回详细的内存使用情况
      return {
        supported: true,
        raw: memory,
        formatted: {
          used: `${formatMemory(memory.used)}MB`,
          total: `${formatMemory(memory.total)}MB`,
          limit: `${formatMemory(memory.limit)}MB`,
          usagePercentage: `${usagePercentage}%`,
          limitPercentage: `${limitPercentage}%`,
        },
        analysis: {
          isHighUsage,
          threshold: `${formatMemory(memoryThreshold)}MB`,
          trend: getMemoryTrend(),
          recommendations: getMemoryRecommendations(memory, isHighUsage),
        },
        history: {
          recent: performanceData.value.memoryUsage.slice(-5),
          leaks: performanceData.value.memoryLeaks.length,
        }
      }
    } else {
      return {
        supported: false,
        error: 'performance.memory is not supported in this browser'
      }
    }
  }

  /**
   * 获取内存使用趋势
   */
  const getMemoryTrend = () => {
    const recentUsage = performanceData.value.memoryUsage.slice(-10)
    if (recentUsage.length < 2) return 'insufficient_data'

    const firstUsage = recentUsage[0].used
    const lastUsage = recentUsage[recentUsage.length - 1].used
    const change = lastUsage - firstUsage
    const changePercentage = ((change / firstUsage) * 100).toFixed(2)

    if (Math.abs(change) < 1024 * 1024) { // 小于1MB变化
      return { trend: 'stable', change: 0, changePercentage: '0%' }
    } else if (change > 0) {
      return { trend: 'increasing', change, changePercentage: `+${changePercentage}%` }
    } else {
      return { trend: 'decreasing', change, changePercentage: `${changePercentage}%` }
    }
  }

  /**
   * 获取内存优化建议
   */
  const getMemoryRecommendations = (memory, isHighUsage) => {
    const recommendations = []

    if (isHighUsage) {
      recommendations.push('内存使用量过高，建议检查是否存在内存泄漏')
    }

    const usagePercentage = (memory.used / memory.total) * 100
    if (usagePercentage > 80) {
      recommendations.push('内存使用率超过80%，建议清理不必要的对象引用')
    }

    if (performanceData.value.memoryLeaks.length > 5) {
      recommendations.push('检测到多次内存泄漏警告，建议进行内存分析')
    }

    const trend = getMemoryTrend()
    if (trend.trend === 'increasing') {
      recommendations.push('内存使用量持续增长，建议检查是否有未清理的定时器或事件监听器')
    }

    if (recommendations.length === 0) {
      recommendations.push('内存使用情况正常')
    }

    return recommendations
  }

  /**
   * 记录交互事件
   */
  const recordInteraction = (interactionType, details = {}) => {
    if (!enableInteractionMonitor) return

    const interaction = {
      type: interactionType,
      timestamp: Date.now(),
      details,
      responseTime: null,
    }

    performanceData.value.interactions.push(interaction)

    // 只保留最近50条交互记录
    if (performanceData.value.interactions.length > 50) {
      performanceData.value.interactions = performanceData.value.interactions.slice(-50)
    }

    return interaction
  }

  /**
   * 更新交互响应时间
   */
  const updateInteractionTime = (interaction, endTime) => {
    if (interaction && endTime) {
      interaction.responseTime = endTime - interaction.timestamp

      // 检查响应时间是否过慢（超过100ms）
      if (interaction.responseTime > 100) {
        performanceData.value.slowOperations.push({
          type: 'slow_interaction',
          operation: interaction.type,
          time: interaction.responseTime,
          timestamp: interaction.timestamp,
          threshold: 100,
          details: interaction.details,
        })
        console.warn(`[Performance] Slow interaction in ${componentName}: ${interaction.responseTime}ms (${interaction.type})`)
      }
    }
  }

  /**
   * 创建性能观察器
   */
  const createPerformanceObserver = () => {
    if ('PerformanceObserver' in window) {
      performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
            performanceData.value.renderTimes.push({
              time: entry.duration,
              timestamp: Date.now(),
              operation: entry.name,
            })
          }
        })
      })

      try {
        performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
      } catch (error) {
        console.warn('[Performance] PerformanceObserver not fully supported:', error)
      }
    }
  }

  /**
   * 生成性能报告
   */
  const generateReport = () => {
    const report = {
      componentName: performanceData.value.componentName,
      timestamp: Date.now(),
      summary: {
        totalRenders: performanceData.value.totalRenders,
        averageRenderTime: performanceData.value.averageRenderTime.toFixed(2),
        maxRenderTime: performanceData.value.maxRenderTime.toFixed(2),
        minRenderTime: performanceData.value.minRenderTime === Infinity ? 0 : performanceData.value.minRenderTime.toFixed(2),
        totalInteractions: performanceData.value.interactions.length,
        slowOperations: performanceData.value.slowOperations.length,
        memoryLeaks: performanceData.value.memoryLeaks.length,
      },
      details: {
        recentRenderTimes: performanceData.value.renderTimes.slice(-10),
        recentMemoryUsage: performanceData.value.memoryUsage.slice(-5),
        recentInteractions: performanceData.value.interactions.slice(-10),
        slowOperations: performanceData.value.slowOperations.slice(-10),
      },
    }

    return report
  }

  /**
   * 输出性能报告
   */
  const logReport = () => {
    const report = generateReport()
    console.group(`[Performance Report] ${componentName}`)
    console.log('Summary:', report.summary)
    console.log('Recent Render Times:', report.details.recentRenderTimes)
    console.log('Recent Memory Usage:', report.details.recentMemoryUsage)
    console.log('Recent Interactions:', report.details.recentInteractions)
    if (report.details.slowOperations.length > 0) {
      console.warn('Slow Operations:', report.details.slowOperations)
    }
    console.groupEnd()
  }

  /**
   * 开始监听
   */
  const startMonitoring = () => {
    if (isMonitoring.value) return

    isMonitoring.value = true
    console.log(`[Performance] Starting monitoring for ${componentName}`)

    // 创建性能观察器
    createPerformanceObserver()

    // 开始内存监听
    if (enableMemoryMonitor) {
      memoryTimer = setInterval(measureMemory, 1000)
    }

    // 开始定期报告
    reportTimer = setInterval(logReport, reportInterval)
  }

  /**
   * 停止监听
   */
  const stopMonitoring = () => {
    if (!isMonitoring.value) return

    isMonitoring.value = false
    console.log(`[Performance] Stopping monitoring for ${componentName}`)

    // 清理定时器
    if (memoryTimer) {
      clearInterval(memoryTimer)
      memoryTimer = null
    }

    if (reportTimer) {
      clearInterval(reportTimer)
      reportTimer = null
    }

    // 清理性能观察器
    if (performanceObserver) {
      performanceObserver.disconnect()
      performanceObserver = null
    }

    // 输出最终报告
    logReport()
  }

  /**
   * 清理性能数据
   */
  const clearData = () => {
    performanceData.value = {
      componentName,
      renderTimes: [],
      memoryUsage: [],
      interactions: [],
      totalRenders: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
      memoryLeaks: [],
      slowOperations: [],
    }
  }

  // 组件挂载时开始监听
  onMounted(() => {
    startMonitoring()
  })

  // 组件卸载时停止监听
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // 状态
    isMonitoring,
    performanceData,

    // 方法
    startRenderMeasure,
    endRenderMeasure,
    measureMemory,
    recordInteraction,
    updateInteractionTime,
    generateReport,
    logReport,
    startMonitoring,
    stopMonitoring,
    clearData,
  }
}
