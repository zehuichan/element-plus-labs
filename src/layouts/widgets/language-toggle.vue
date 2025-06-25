<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <div
        class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-8 w-8 px-1 text-lg hover:bg-accent hover:text-accent-foreground text-foreground/80 rounded-full cursor-pointer"
      >
        <re-icon icon="svg:languages" size="16" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuRadioGroup :model-value="preferences.app.locale" @update:model-value="handleUpdate">
          <DropdownMenuRadioItem
            class="focus:bg-accent focus:text-accent-foreground relative flex select-none items-center rounded-sm px-2 py-1.5 pl-[25px] text-xs outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground text-foreground/80 mb-1 cursor-pointer"
            value="zh-CN"
          >
            <DropdownMenuItemIndicator class="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <div class="size-1.5 rounded-full bg-foreground" />
            </DropdownMenuItemIndicator>
            简体中文
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            class="focus:bg-accent focus:text-accent-foreground relative flex select-none items-center rounded-sm px-2 py-1.5 pl-[25px] text-xs outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground text-foreground/80 mb-1 cursor-pointer"
            value="en-US"
          >
            <DropdownMenuItemIndicator class="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <div class="size-1.5 rounded-full bg-foreground" />
            </DropdownMenuItemIndicator>
            English
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import {
  DropdownMenuGroup,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from 'reka-ui'
import {
  DropdownMenu,
  DropdownMenuContent
} from '@/components/dropdown-menu'
import { preferences, updatePreferences } from '@/preferences'
import { loadLocaleMessages } from '@/install/i18n'

const handleUpdate = async (value) => {
  const locale = value
  updatePreferences({
    app: {
      locale,
    },
  })
  await loadLocaleMessages(locale)
}
</script>

<style lang="scss">

</style>
