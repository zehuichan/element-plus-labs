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
      hideChildrenInMenu: false,
      title: '功能',
      icon: 'park:layers',
    },
    name: 'Demos',
    path: '/demo',
    children: [
      {
        name: 'Demo',
        path: 'index',
        component: '/demo/index',
        meta: {
          title: 'demo',
        },
      },
      {
        name: 'Hook',
        path: 'hook',
        component: '/demo/hook',
        meta: {
          title: 'hook',
        },
      },
    ],
  },
  {
    component: 'LAYOUT',
    meta: {
      hideChildrenInMenu: false,
      title: '表格',
      icon: 'park:insert-table',
    },
    name: 'experimental',
    path: '/experimental',
    children: [
      {
        name: 'Table',
        path: '/experimental/table',
        component: '/experimental/table/index.vue',
        meta: {
          title: '表格',
          icon: 'park:insert-table',
        },
      },
      {
        name: 'TableCompare',
        path: '/experimental/compare-table',
        component: '/experimental/table/compare.vue',
        meta: {
          title: '优化',
          icon: 'park:insert-table',
        },
      },
    ],
  },
]

export { USER_DATA, MENU_DATA }
