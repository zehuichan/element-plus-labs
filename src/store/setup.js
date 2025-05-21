import { createPinia } from 'pinia'

let pinia

export async function initStores(app, options) {
  const { createPersistedState } = await import('pinia-plugin-persistedstate')

  pinia = createPinia()
  pinia.use(createPersistedState({
    storage: localStorage,
  }))

  app.use(pinia)
  return pinia
}

export function resetAllStores() {
  if (!pinia) {
    console.error('Pinia is not installed')
    return
  }
  const allStores = pinia._s

  for (const [_key, store] of allStores) {
    store.$reset()
  }
}
