import { createApp } from 'vue'

import App from './App.vue'

// global css
import './assets/design'

import { initPreferences, overridesPreferences } from './preferences'
import { setupI18n } from './locales'
import { initStores } from './store'
import { setupElementPlus } from './install/framework'
import { setupComponents } from './components'
import { router } from './router'

async function bootstrap(namespace) {
  const app = createApp(App)
  // 配置偏好设置
  await initPreferences({
    namespace,
    overrides: overridesPreferences
  })
  // 国际化 i18n 配置
  await setupI18n(app)
  // 配置Element Plus
  setupElementPlus(app)
  // 配置实验组件
  setupComponents(app)
  // 配置 pinia-tore
  await initStores(app, { namespace })
  // 配置路由及路由守卫
  app.use(router)
  app.mount('#app')
}

void bootstrap('labs')
