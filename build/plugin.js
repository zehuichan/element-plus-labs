import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'

import { configHtmlPlugin } from './html'
import { configCompressPlugin } from './compress'
import { configFrameworkPlugin } from './framework'

export function createVitePlugins(viteEnv, isBuild) {
  const {
    VITE_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
  } = viteEnv

  const vitePlugins = [
    // have to
    vue(),
    // have to
    vueJsx(),
    // have to
    tailwindcss()
  ]

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  vitePlugins.push(configFrameworkPlugin())

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin(
        VITE_COMPRESS,
        VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      )
    )
  }

  return vitePlugins
}
