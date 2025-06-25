const USER_DATA = {
  accessToken: '12312312',
  avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
  email: '123@gmail.com',
  id: 1,
  password: '123456',
  realName: '超级管理员',
  roles: ['super'],
  username: 'admin',
  homePath: '/demo',
}

const MENU_DATA = [
  {
    component: 'LAYOUT',
    meta: {
      hideChildrenInMenu: true,
      title: '功能',
      icon: 'park:layers',
      badge: 'new',
      badgeType: 'normal',
      badgeVariants: 'primary',
    },
    name: 'demo',
    path: '/demo',
    children: [
      {
        name: 'Demo',
        path: '/demo',
        component: '/demo/index',
        meta: {
          title: 'demo',
          icon: 'park:lightning',
        }
      }
    ]
  },
  {
    path: '/feature',
    name: 'feature',
    component: 'LAYOUT',
    meta: {
      title: '演示',
      icon: 'park:tips'
    },
    children: [
      {
        path: '/feature/unocss',
        component: '/feat/unocss/index',
        name: 'unocss',
        meta: {
          title: 'unocss',
        }
      }
    ]
  },
  {
    path: '/examples',
    name: 'Examples',
    component: 'LAYOUT',
    meta: {
      title: '示例',
      icon: 'park:more-app'
    },
    children: [
      {
        name: 'FormExample',
        path: '/examples/form',
        meta: {
          title: '表单',
        },
        children: [
          {
            name: 'FormBasicExample',
            path: '/examples/form/basic',
            component: '/examples/form/basic',
            meta: {
              title: '基础表单',
            },
          }
        ]
      },
      {
        name: 'TableExample',
        path: '/examples/table',
        meta: {
          title: '表格',
        },
        children: [
          {
            name: 'TableDocExample',
            path: '/examples/table/doc',
            component: '/examples/table/index',
            meta: {
              title: '表格文档',
            },
          },
          {
            name: 'TableBasicExample',
            path: '/examples/table/basic',
            component: '/examples/table/basic',
            meta: {
              title: '基础表格',
            },
          },
          {
            name: 'TableRemoteExample',
            path: '/examples/table/remote',
            component: '/examples/table/remote',
            meta: {
              title: '远程加载',
            },
          },
          {
            name: 'TableCellEditorExample',
            path: '/examples/table/cell-editor',
            component: '/examples/table/cell-editor',
            meta: {
              title: '单元格编辑',
            },
          },
        ]
      },
      {
        name: 'IconsExample',
        path: '/examples/icons',
        component: '/examples/icons/index',
        meta: {
          title: '图标',
        }
      },
      {
        name: 'TextExample',
        path: '/examples/text',
        component: '/examples/text/index',
        meta: {
          title: '文本',
        }
      },
      {
        name: 'ContextMenuExample',
        path: '/examples/context-menu',
        component: '/examples/context-menu/index',
        meta: {
          title: '右键菜单',
        }
      },
      {
        name: 'DropdownMenuExample',
        path: '/examples/dropdown-menu',
        component: '/examples/dropdown-menu/index',
        meta: {
          title: '下拉菜单',
        }
      },
      {
        name: 'ModalExample',
        path: '/examples/modal',
        component: '/examples/modal/index',
        meta: {
          title: '弹窗',
        }
      },
      {
        name: 'DrawerExample',
        path: '/examples/drawer',
        component: '/examples/drawer/index',
        meta: {
          title: '抽屉',
        }
      },
    ]
  },
  {
    path: '/upms',
    name: 'upms',
    component: 'LAYOUT',
    meta: {
      title: '系统管理',
      icon: 'park:config'
    },
    children: [
      {
        path: '/upms/account',
        component: '/upms/account/index',
        name: 'account',
        meta: { title: '用户管理' }
      },
      {
        path: '/upms/role',
        component: '/upms/role/index',
        name: 'role',
        meta: { title: '角色管理' }
      },
      {
        path: '/upms/menu',
        component: '/upms/menu/index',
        name: 'menu',
        meta: { title: '菜单管理' }
      },
      {
        path: '/upms/dictionary',
        component: '/upms/dictionary/index',
        name: 'dictionary',
        meta: { title: '字典管理' }
      }
    ]
  },
]

export {
  USER_DATA,
  MENU_DATA,
}
