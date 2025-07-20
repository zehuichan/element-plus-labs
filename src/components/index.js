import { Drawer } from './drawer'
import { ReIcon } from './re-icon'
import { ReButton } from './re-button'
import { ReSelect } from './re-select'
import { ReTreeSelect } from './re-tree-select'
import { ReRadioGroup } from './re-radio-group'
import { ReAutocomplete } from './re-autocomplete'
import { ReInput } from './re-input'

const components = [
  Drawer,
  ReIcon,
  ReButton,
  ReSelect,
  ReTreeSelect,
  ReRadioGroup,
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
