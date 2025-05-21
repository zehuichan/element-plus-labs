export function openWindow(url, options = {}) {
  // 解构并设置默认值
  const { noopener = true, noreferrer = true, target = '_blank' } = options

  // 基于选项创建特性字符串
  const features = [noopener && 'noopener=yes', noreferrer && 'noreferrer=yes']
    .filter(Boolean)
    .join(',')

  // 打开窗口
  window.open(url, target, features)
}

export function openRouteInNewWindow(path) {
  const { hash, origin } = location
  const fullPath = path.startsWith('/') ? path : `/${path}`
  const url = `${origin}${hash ? '/#' : ''}${fullPath}`
  openWindow(url, { target: '_blank' })
}
