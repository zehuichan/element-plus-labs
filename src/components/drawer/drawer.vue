<template>
  <el-drawer
    class="popup-ui drawer"
    v-bind="forwarded"
    :show-close="false"
    append-to-body
    @open="onOpen"
    @opened="onOpened"
    @close="onClose"
    @closed="onClosed"
  >
    <template #header="{ titleId, titleClass }">
      <div class="popup-ui__header flex items-center justify-between">
        <div :id="titleId" :class="titleClass">{{ title }}</div>
        <slot name="extra"></slot>
        <div class="popup-ui__header-item ml-2" @click="onClose">
          <re-icon icon="park:close" size="14" />
        </div>
      </div>
    </template>
    <template #default>
      <el-scrollbar>
        <div class="popup-ui__content">
          <slot />
        </div>
      </el-scrollbar>
    </template>
    <template #footer>
      <slot name="footer">
        <div class="flex justify-end">
          <el-button v-if="showCancelButton" plain @click="cancel">
            {{ cancelButtonText }}
          </el-button>
          <el-button v-if="showConfirmButton" type="primary" @click="confirm">
            {{ confirmButtonText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { usePriorityValues } from '@/composables/usePriorityValues'
import { drawerProps, drawerEmits } from './drawer'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps(drawerProps)
const emit = defineEmits(drawerEmits)

const attrs = useAttrs()

const state = props.drawerApi?.useStore?.()

const {
  showCancelButton,
  showConfirmButton,
  cancelButtonText,
  confirmButtonText,
  size,
  title,
  direction,
} = usePriorityValues(props, state)

const forwarded = computed(() => {
  const propsData = {
    ...attrs,
    size: size.value,
    title: title.value,
    direction: direction.value,
  }
  if (props.drawerApi) {
    propsData.modelValue = state.value.show
    propsData.updateModelValue = () => props.drawerApi.close()
  }
  return propsData
})

function cancel() {
  props.drawerApi?.onCancel()
  emit('cancel')
}

function confirm() {
  props.drawerApi?.onConfirm()
  emit('confirm')
}

// todo remove
function onOpen() {
}

function onOpened() {
  props.drawerApi?.onOpened()
}

function onClose() {
  props.drawerApi?.close()
  emit('update:modelValue', false)
}

function onClosed() {
  props.drawerApi?.onClosed()
}
</script>

<style lang="scss">
@import "@/assets/design/popup-ui.css";
</style>
