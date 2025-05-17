import { createApp } from 'vue'

import App from './App.vue'

// global css
import './assets'

import { router } from './router'

function bootstrap() {
  const app = createApp(App)
  // 配置路由及路由守卫
  app.use(router)
  app.mount('#app')
}

bootstrap()
