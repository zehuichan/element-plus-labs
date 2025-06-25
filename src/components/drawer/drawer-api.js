import { bindMethods, isFunction } from '@/utils'
import { Store } from '@/utils/store'

export class DrawerApi {
  // Shared data
  sharedData = {
    payload: {},
  }
  store

  api

  state

  constructor(options = {}) {
    const {
      connectedComponent: _,
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
      ...storeState
    } = options

    const defaultState = {
      class: '',
      closeOnClickModal: true,
      closeOnPressEscape: true,
      bodyClass: '',
      footer: true,
      header: true,
      show: false,
      loading: false,
      modal: true,
      openAutoFocus: false,
      direction: 'rtl',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      title: '',
      size: '30%',
    }

    this.store = new Store(
      {
        ...defaultState,
        ...storeState,
      },
      {
        onUpdate: () => {
          const state = this.store.state
          if (state?.show === this.state?.show) {
            this.state = state
          } else {
            this.state = state
            this.api.onOpenChange?.(!!state?.show)
          }
        },
      },
    )

    this.state = this.store.state

    this.api = {
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
    }
    bindMethods(this)
  }

  async close() {
    // 通过 onBeforeClose 钩子函数来判断是否允许关闭弹窗
    // 如果 onBeforeClose 返回 false，则不关闭弹窗
    const allowClose = (await this.api.onBeforeClose?.()) ?? true
    if (allowClose) {
      this.store.setState((prev) => ({
        ...prev,
        show: false
      }))
    }
  }

  open() {
    this.store.setState((prev) => ({ ...prev, show: true }))
  }

  onCancel() {
    if (this.api.onCancel) {
      this.api.onCancel?.()
    } else {
      this.close()
    }
  }

  onConfirm() {
    this.api.onConfirm?.()
  }

  onClosed() {
    if (!this.state.show) {
      this.api.onClosed?.()
    }
  }

  onOpened() {
    if (this.state.show) {
      this.api.onOpened?.()
    }
  }

  getData() {
    return this.sharedData?.payload ?? {}
  }

  setData(payload) {
    this.sharedData.payload = payload
    return this
  }

  setState(stateOrFn) {
    if (isFunction(stateOrFn)) {
      this.store.setState(stateOrFn)
    } else {
      this.store.setState((prev) => ({ ...prev, ...stateOrFn }))
    }
    return this
  }
}
