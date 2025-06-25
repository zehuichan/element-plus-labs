/**
 * 合并动态路由模块的默认导出
 * @param routeModules 动态导入的路由模块对象
 * @returns 合并后的路由配置数组
 */
function mergeRouteModules(routeModules) {
  const mergedRoutes = []

  for (const routeModule of Object.values(routeModules)) {
    const moduleRoutes = routeModule?.default ?? []
    mergedRoutes.push(...moduleRoutes)
  }

  return mergedRoutes
}

export { mergeRouteModules }
