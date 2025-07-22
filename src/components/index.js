import { Drawer } from './drawer'
import { ReIcon } from './re-icon'
import { ReButton } from './re-button'
import { ReSelect } from './re-select'
import { ReTreeSelect } from './re-tree-select'
import { ReRadioGroup } from './re-radio-group'
import { ReCheckboxGroup } from './re-checkbox-group'
import { ReAutocomplete } from './re-autocomplete'
import { ReInput } from './re-input'
import { ReMention } from './re-mention'

const components = [
  Drawer,
  ReIcon,
  ReButton,
  ReSelect,
  ReTreeSelect,
  ReRadioGroup,
  ReCheckboxGroup,
  ReAutocomplete,
  ReInput,
  ReMention,
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
