import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { wrapperEnv } from './build/utils'
import { createVitePlugins } from './build/plugin'
import { createProxy } from './build/proxy'

import pkg from './package.json'
import dayjs from 'dayjs'

const { dependencies, description, devDependencies, version } = pkg

// https://cn.vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const root = process.cwd()

  const env = loadEnv(mode, root)

  const viteEnv = wrapperEnv(env)

  const { VITE_PORT, VITE_BASE, VITE_PROXY, VITE_DROP_CONSOLE } = viteEnv

  const isBuild = command === 'build'

  return {
    base: VITE_BASE,
    root: root,
    define: {
      __METADATA__: JSON.stringify({
        buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        dependencies,
        description,
        devDependencies,
        version,
      })
    },
    plugins: createVitePlugins(viteEnv, isBuild),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: true,
      port: VITE_PORT,
      // proxy: createProxy(VITE_PROXY)
      proxy: {
        '/api': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // mock代理目标地址
          target: 'http://localhost:3000/api',
          ws: true,
        },
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        }
      }
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : []
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      brotliSize: false,
      chunkSizeWarningLimit: 2000
    }
  }
})
