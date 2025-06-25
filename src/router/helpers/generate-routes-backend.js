import { mapTree } from '@/utils/tree-helper'
import { isString } from '@/utils'

/**
 * 动态生成路由 - 后端方式
 */
async function generateRoutesByBackend(options) {
  const { fetchMenuListAsync, layoutMap = {}, pageMap = {} } = options

  try {
    const menuRoutes = await fetchMenuListAsync?.()
    if (!menuRoutes) {
      return []
    }

    console.table(Object.keys(pageMap))
    const normalizePageMap = {}

    for (const [key, value] of Object.entries(pageMap)) {
      normalizePageMap[normalizeViewPath(key)] = value
    }

    const routes = convertRoutes(menuRoutes, layoutMap, normalizePageMap)

    return routes
  } catch (error) {
    console.error(error)
    throw error
  }
}

function convertRoutes(routes, layoutMap, pageMap) {
  return mapTree(routes, (node) => {
    const route = node
    const { component, name } = node

    if (!name) {
      console.error('route name is required', route)
    }

    // layout转换
    if (component && layoutMap[component]) {
      route.component = layoutMap[component]
      // 页面组件转换
    } else if (isString(component)) {
      const normalizePath = normalizeViewPath(component)
      const pageKey = normalizePath.endsWith('.vue')
        ? normalizePath
        : `${normalizePath}.vue`
      if (pageMap[pageKey]) {
        route.component = pageMap[pageKey]
      } else {
        console.error(`route component is invalid: ${pageKey}`, route)
        route.component = pageMap['/_core/fallback/not-found.vue']
      }
    }

    return route
  })
}

function normalizeViewPath(path) {
  // 去除相对路径前缀
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '')

  // 确保路径以 '/' 开头
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`

  // 这里耦合了vben-admin的目录结构
  return viewPath.replace(/^\/views/, '')
}

export { generateRoutesByBackend }
