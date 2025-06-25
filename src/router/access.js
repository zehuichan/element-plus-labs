import { defineComponent, h } from 'vue'

import { ElMessage } from 'element-plus'

import { cloneDeep } from 'lodash-unified'

import { getAllMenusApi } from '@/api/sys'

import { BasicLayout } from '@/layouts/basic'
import { generateMenus } from './helpers/generate-menus'
import { generateRoutesByFrontend } from './helpers/generate-routes-frontend'
import { generateRoutesByBackend } from './helpers/generate-routes-backend'

import { mapTree } from '@/utils/tree-helper'
import { isFunction, isString } from '@/utils'

const forbiddenComponent = () => import('@/views/_core/fallback/forbidden.vue')

async function generateAccess(options) {
  const pageMap = import.meta.glob('../views/**/*.vue')

  const layoutMap = {
    LAYOUT: BasicLayout,
  }

  return await generateAccessible('backend', {
    ...options,
    fetchMenuListAsync: async () => {
      ElMessage.info({
        message: '加载菜单中...',
        duration: 1500,
      })
      const res = await getAllMenusApi()
      return res.data
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  })
}

async function generateAccessible(mode, options) {
  const { router } = options

  options.routes = cloneDeep(options.routes)

  // 生成路由
  const accessibleRoutes = await generateRoutes(mode, options)

  // 动态添加到router实例内
  accessibleRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 生成菜单
  const accessibleMenus = await generateMenus(accessibleRoutes, options.router)

  return { accessibleMenus, accessibleRoutes }
}

async function generateRoutes(mode, options) {
  const { forbiddenComponent, roles, routes } = options

  let resultRoutes = routes
  switch (mode) {
    case 'backend': {
      resultRoutes = await generateRoutesByBackend(options)
      break
    }
    case 'frontend': {
      resultRoutes = await generateRoutesByFrontend(
        routes,
        roles || [],
        forbiddenComponent,
      )
      break
    }
  }

  resultRoutes = mapTree(resultRoutes, (route) => {
    // 重新包装component，使用与路由名称相同的name以支持keep-alive的条件缓存。
    if (
      route.meta?.keepAlive &&
      isFunction(route.component) &&
      route.name &&
      isString(route.name)
    ) {
      const originalComponent = route.component
      route.component = async () => {
        const component = await originalComponent()
        if (!component.default) return component
        return defineComponent({
          name: route.name,
          setup(props, { attrs, slots }) {
            return () => h(component.default, { ...props, ...attrs }, slots)
          },
        })
      }
    }

    // 如果有redirect或者没有子路由，则直接返回
    if (route.redirect || !route.children || route.children.length === 0) {
      return route
    }
    const firstChild = route.children[0]

    // 如果子路由不是以/开头，则直接返回,这种情况需要计算全部父级的path才能得出正确的path，这里不做处理
    if (!firstChild?.path || !firstChild.path.startsWith('/')) {
      return route
    }

    route.redirect = firstChild.path
    return route
  })

  return resultRoutes
}

export { generateAccess }
