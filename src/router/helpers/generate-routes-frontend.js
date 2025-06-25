import { filterTree, mapTree } from '@/utils/tree-helper'

/**
 * 动态生成路由 - 前端方式
 */
async function generateRoutesByFrontend(routes, roles, forbiddenComponent) {
  // 根据角色标识过滤路由表,判断当前用户是否拥有指定权限
  const finalRoutes = filterTree(routes, (route) => {
    return hasAuthority(route, roles)
  })
  if (!forbiddenComponent) {
    return finalRoutes
  }

  // 如果有禁止访问的页面，将禁止访问的页面替换为403页面
  return mapTree(finalRoutes, (route) => {
    if (menuHasVisibleWithForbidden(route)) {
      route.component = forbiddenComponent
    }
    return route
  })
}


/**
 * 判断路由是否有权限访问
 * @param route
 * @param access
 */
function hasAuthority(route, access) {
  const authority = route.meta?.authority
  if (!authority) {
    return true
  }
  const canAccess = access.some((value) => authority.includes(value))

  return canAccess || (!canAccess && menuHasVisibleWithForbidden(route))
}


/**
 * 判断路由是否在菜单中显示，但是访问会被重定向到403
 * @param route
 */
function menuHasVisibleWithForbidden(route) {
  return (
    !!route.meta?.authority &&
    Reflect.has(route.meta || {}, 'menuVisibleWithForbidden') &&
    !!route.meta?.menuVisibleWithForbidden
  )
}

export { generateRoutesByFrontend, hasAuthority }
