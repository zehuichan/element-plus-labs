export const layoutProps = {
  isMobile: {
    type: Boolean,
    default: false,
  },
  // 页头
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
  // 侧边栏
  sidebarTheme: {
    type: String,
    default: 'dark',
  },
  sidebarWidth: {
    type: Number,
    default: 180,
  },
  sidebarCollapseWidth: {
    type: Number,
    default: 64,
  },
  sidebarHidden: {
    type: Boolean,
    default: false,
  },
  // 标签栏
  tabbarEnable: {
    type: Boolean,
    default: true,
  },
  tabbarHeight: {
    type: Number,
  },
  // 页脚
  footerEnable: {
    type: Boolean,
    default: false,
  },
  footerFixed: {
    type: Boolean,
    default: true,
  },
  footerHeight: {
    type: Number,
    default: 32,
  },
  zIndex: {
    type: Number,
    default: 200,
  },
}
