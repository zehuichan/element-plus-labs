import { Drawer } from './drawer'
import { ReIcon } from './re-icon'
import { ReButton } from './re-button'
import { ReAutocomplete } from './re-autocomplete'
import { ReInput } from './re-input'

const components = [
  Drawer,
  ReIcon,
  ReButton,
  ReAutocomplete,
  ReInput,
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
