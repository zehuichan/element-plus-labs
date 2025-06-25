import { coreRoutes, fallbackNotFoundRoute } from './core'
import { mergeRouteModules } from './helpers/merge-route-modules'
import { traverseTreeValues } from '@/utils'

const dynamicRouteFiles = import.meta.glob('./modules/**/*.js', {
  eager: true
})

// 动态路由
const dynamicRoutes = mergeRouteModules(dynamicRouteFiles)

// 外部路由列表，访问这些页面可以不需要Layout，可能用于内嵌在别的系统(不会显示在菜单中)
const staticRoutes = []
const externalRoutes = []

const routes = [
  ...coreRoutes,
  ...externalRoutes,
  fallbackNotFoundRoute,
]

const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name)

// 有权限校验的路由列表，包含动态路由和静态路由
const accessRoutes = [...dynamicRoutes, ...staticRoutes]

export { accessRoutes, coreRouteNames, routes }
