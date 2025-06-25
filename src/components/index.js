
import { Drawer } from './drawer'
import { ReIcon } from './re-icon'

const components = [
  Drawer,
  ReIcon,
]

export function setupComponents(app) {
  components.map((item) => {
    if (item.install) {
      app.use(item)
    } else if (item.name) {
      app.component(item.name, item)
    }
  })
}
