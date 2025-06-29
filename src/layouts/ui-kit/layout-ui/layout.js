export const layoutProps = {
  headerMode: {
    type: String,
    default: 'fixed',
  },
  headerHeight: {
    type: Number,
  },
  headerTheme: {
    type: String,
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  sidebarTheme: {
    type: String,
    default: 'dark'
  },
  sidebarWidth: {
    type: Number,
    default: 180
  },
  sidebarCollapseWidth: {
    type: Number,
    default: 64
  },
  // 侧边栏是否隐藏
  sidebarHidden: {
    type: Boolean,
    default: false
  },
  tabbarEnable: {
    type: Boolean,
    default: true
  },
  tabbarHeight: {
    type: Number,
  },
  footerEnable: {
    type: Boolean,
    default: false
  },
  footerFixed: {
    type: Boolean,
    default: true
  },
  footerHeight: {
    type: Number,
    default: 32
  },
  zIndex: {
    type: Number,
    default: 200
  }
}
