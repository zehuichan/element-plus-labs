export const drawerProps = {
  size: {
    type: String,
    default: '30%'
  },
  title: String,
  direction: {
    type: String,
    default: 'rtl'
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  confirmButtonText: {
    type: String,
    default: '确认'
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  },
  drawerApi: Object
}

export const drawerEmits = ['update:modelValue', 'cancel', 'confirm']
