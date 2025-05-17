import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: import.meta.env.VITE_ROUTER_HISTORY === 'hash'
    ? createWebHashHistory(import.meta.env.VITE_BASE)
    : createWebHistory(import.meta.env.VITE_BASE),
  routes: routes
})

export { router }
