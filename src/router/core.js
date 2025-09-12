import { DEFAULT_HOME_PATH } from './constant'

const fallbackNotFoundRoute = {
  component: () => import('@/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
}

const coreRoutes = [
  {
    path: '/',
    redirect: DEFAULT_HOME_PATH,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/_core/passport/index.vue')
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('@/views/_core/center/index.vue'),
  },
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/index.vue'),
  },
]

export { coreRoutes, fallbackNotFoundRoute }
