import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { useDebounceFn } from '@vueuse/core'

export function useTabsViewScroll(props) {
  let resizeObserver = null
  let mutationObserver = null
  let tabItemCount = 0
  const scrollbarRef = ref(null)
  const scrollViewportEl = ref(null)
  const showScrollButton = ref(false)
  const scrollIsAtLeft = ref(true)
  const scrollIsAtRight = ref(false)

  function getScrollClientWidth() {
    const scrollbarEl = scrollbarRef.value
    if (!scrollbarEl || !scrollViewportEl.value) return {}

    const scrollbarWidth = scrollbarEl.clientWidth
    const scrollViewWidth = scrollViewportEl.value.clientWidth

    return {
      scrollbarWidth,
      scrollViewWidth,
    }
  }

  function scrollDirection(direction, distance = 150) {
    const { scrollbarWidth, scrollViewWidth } = getScrollClientWidth()

    if (!scrollbarWidth || !scrollViewWidth) return

    if (scrollbarWidth > scrollViewWidth) return

    scrollViewportEl.value?.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -(scrollbarWidth - distance) : +(scrollbarWidth - distance),
    })
  }

  async function initScrollbar() {
    await nextTick()

    const scrollbarEl = scrollbarRef.value

    if (!scrollbarEl) {
      return
    }

    const viewportEl = scrollbarEl?.querySelector(
      'div[data-scroll-area-viewport]',
    )

    scrollViewportEl.value = viewportEl
    calcShowScrollbarButton()

    await nextTick()
    scrollToActiveIntoView()

    // 监听大小变化
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(
      useDebounceFn((_entries) => {
        calcShowScrollbarButton()
        scrollToActiveIntoView()
      }, 100),
    )
    resizeObserver.observe(viewportEl)

    tabItemCount = props.tabs?.length || 0
    mutationObserver?.disconnect()
    // 使用 MutationObserver 仅监听子节点数量变化
    mutationObserver = new MutationObserver(() => {
      const count = viewportEl.querySelectorAll(`div[data-tab-item="true"]`,).length

      if (count > tabItemCount) {
        scrollToActiveIntoView()
      }

      if (count !== tabItemCount) {
        calcShowScrollbarButton()
        tabItemCount = count
      }
    })

    // 配置为仅监听子节点的添加和移除
    mutationObserver.observe(viewportEl, {
      attributes: false,
      childList: true,
      subtree: true,
    })
  }

  async function scrollToActiveIntoView() {
    if (!scrollViewportEl.value) {
      return
    }
    await nextTick()
    const viewportEl = scrollViewportEl.value
    const { scrollbarWidth } = getScrollClientWidth()
    const { scrollWidth } = viewportEl

    if (scrollbarWidth >= scrollWidth) {
      return
    }

    requestAnimationFrame(() => {
      const activeItem = viewportEl?.querySelector('.is-active')
      activeItem?.scrollIntoView({ behavior: 'smooth', inline: 'start' })
    })
  }

  /**
   * 计算tabs 宽度，用于判断是否显示左右滚动按钮
   */
  async function calcShowScrollbarButton() {
    if (!scrollViewportEl.value) {
      return
    }

    const { scrollbarWidth } = getScrollClientWidth()

    showScrollButton.value = scrollViewportEl.value.scrollWidth > scrollbarWidth
  }

  function handleScroll(event) {
    const target = event.target
    const scrollTop = target?.scrollTop ?? 0
    const scrollLeft = target?.scrollLeft ?? 0
    const offsetHeight = target?.offsetHeight ?? 0
    const offsetWidth = target?.offsetWidth ?? 0
    const scrollHeight = target?.scrollHeight ?? 0
    const scrollWidth = target?.scrollWidth ?? 0
    const isAtTop = scrollTop <= 0
    const isAtLeft = scrollLeft <= 0
    const isAtBottom = scrollTop + offsetHeight >= scrollHeight
    const isAtRight = scrollLeft + offsetWidth >= scrollWidth

    return {
      bottom: isAtBottom,
      left: isAtLeft,
      right: isAtRight,
      top: isAtTop,
    }
  }

  function handleWheel({ deltaY }) {
    scrollViewportEl.value?.scrollBy({
      behavior: 'smooth',
      left: deltaY * 3,
    })
  }

  const handleScrollAt = useDebounceFn((event) => {
    const { left, right } = handleScroll(event)
    scrollIsAtLeft.value = left
    scrollIsAtRight.value = right
  }, 100)

  watch(
    () => props.active,
    async (val) => {
      // 200为了等待 tab 切换动画完成
      // setTimeout(() => {
      scrollToActiveIntoView()
      // }, 300);
    },
    {
      flush: 'post',
    },
  )

  onMounted(initScrollbar)

  onUnmounted(() => {
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
    resizeObserver = null
    mutationObserver = null
  })

  return {
    handleScrollAt,
    handleWheel,
    initScrollbar,
    scrollbarRef,
    scrollDirection,
    scrollIsAtLeft,
    scrollIsAtRight,
    showScrollButton,
  }
}
