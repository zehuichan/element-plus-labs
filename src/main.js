import { createApp } from 'vue'

import App from './App.vue'

// global css
import './assets'

import { router } from './router'
import { initStores } from './store'

async function bootstrap(namespace) {
  const app = createApp(App)
  // 配置 pinia-tore
  await initStores(app, { namespace })
  // 配置路由及路由守卫
  app.use(router)
  app.mount('#app')
}

bootstrap('labs')
