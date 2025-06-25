import { filterTree, mapTree } from '@/utils/tree-helper'

/**
 * 根据 routes 生成菜单列表
 * @param routes
 * @param router
 */
async function generateMenus(routes, router) {
  // 将路由列表转换为一个以 name 为键的对象映射
  // 获取所有router最终的path及name
  const finalRoutesMap = Object.fromEntries(
    router.getRoutes().map(({ name, path }) => [name, path]),
  )

  let menus = mapTree(routes, (route) => {
    // 获取最终的路由路径
    const path = finalRoutesMap[route.name] ?? route.path

    const {
      meta = {},
      name: routeName,
      redirect,
      children = []
    } = route
    const {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      hideChildrenInMenu = false,
      icon,
      link,
      order,
      title = '',
    } = meta

    // 确保菜单名称不为空
    const name = (title || routeName || '')

    // 隐藏子菜单
    const resultChildren = hideChildrenInMenu
      ? []
      : children ?? []

    // 设置子菜单的父子关系
    if (resultChildren.length > 0) {
      resultChildren.forEach((child) => {
        child.parents = [...(route.parents || []), path]
        child.parent = path
      })
    }

    // 确定最终路径
    const resultPath = hideChildrenInMenu ? redirect || path : link || path

    return {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      icon,
      name,
      order,
      parent: route.parent,
      parents: route.parents,
      path: resultPath,
      show: !meta?.hideInMenu,
      children: resultChildren,
    }
  })

  // 对菜单进行排序，避免order=0时被替换成999的问题
  menus = menus.sort((a, b) => (a?.order ?? 999) - (b?.order ?? 999))

  // 过滤掉隐藏的菜单项
  return filterTree(menus, (menu) => !!menu.show)
}

export { generateMenus }
