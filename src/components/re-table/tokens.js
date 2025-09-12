export const SELECTION_COLUMN_FLAG = 'selection'

export const INDEX_COLUMN_FLAG = 'index'

export const IGNORE_COLUMN_FLAG = [SELECTION_COLUMN_FLAG, INDEX_COLUMN_FLAG]

export const RE_TABLE_INJECTION_KEY = Symbol('ReTable')

export const RE_TABLE_FORM_INJECTION_KEY = Symbol('ReTableForm')

export const ORIGINAL_CELL_META = {
  row: -1,
  col: -1,
  activated: false,
  contextmenu: false,
  disabled: false,
  editable: false,
  readonly: false,
  valid: undefined,
}
