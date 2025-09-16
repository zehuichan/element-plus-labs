import { computed, getCurrentInstance, unref, useAttrs, useSlots } from 'vue'
import { getFirstNonNullOrUndefined, kebabToCamelCase } from '@/utils'

/**
 * Get value from slots, attrs, props, or state in order
 * @param key
 * @param props
 * @param state
 */
export function usePriorityValue(key, props, state) {
  const instance = getCurrentInstance()
  const slots = useSlots()
  const attrs = useAttrs()

  const value = computed(() => {
    const rawProps = (instance?.vnode?.props || {})

    const standardRawProps = {}

    for (const [key, value] of Object.entries(rawProps)) {
      standardRawProps[kebabToCamelCase(key)] = value
    }
    const propsKey = standardRawProps?.[key] === undefined ? undefined : props[key]

    return getFirstNonNullOrUndefined(
      slots[key],
      attrs[key],
      props[key], // Use props directly, which already includes default values
      propsKey,
      state?.value?.[key],
    )
  })

  return value
}

/**
 * Get multiple values from state (each value is a ref)
 * @param props
 * @param state
 */
export function usePriorityValues(props, state) {
  const result = {}

  Object.keys(props).forEach((key) => {
    result[key] = usePriorityValue(key, props, state)
  })

  return result
}

/**
 * Get multiple values from state (concentrated in a computed for forwarding)
 * @param props
 * @param state
 */
export function useForwardPriorityValues(props, state) {
  const computedResult = {}

  Object.keys(props).forEach((key) => {
    computedResult[key] = usePriorityValue(key, props, state)
  })

  return computed(() => {
    const unwrapResult = {}
    Object.keys(props).forEach((key) => {
      unwrapResult[key] = unref(computedResult[key])
    })
    return unwrapResult
  })
}
