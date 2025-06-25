<template>
  <popover class="relative right-2 w-[360px] p-0">
    <template #trigger>
      <div
        class="bell-button inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-8 w-8 px-1 text-lg hover:bg-accent hover:text-accent-foreground text-foreground/80 rounded-full cursor-pointer"
      >
        <re-icon icon="svg:bell" size="16" />
      </div>
    </template>

    <div class="relative">
      <div class="flex items-center justify-between p-4 py-3">
        <div class="text-foreground text-sm">通知</div>
        <el-button size="default" text>
          <re-icon icon="park:email-successfully" />
        </el-button>
      </div>

      <el-scrollbar v-if="notifications.length > 0">
        <ul class="!flex max-h-[360px] w-full flex-col">
          <template v-for="item in notifications" :key="item.title">
            <li
              class="hover:bg-accent border-border relative flex w-full cursor-pointer items-start gap-4 border-t px-3 py-3"
            >
              <span
                v-if="!item.isRead"
                class="bg-primary absolute right-3 top-3 h-2 w-2 rounded"
              />

              <span
                class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full"
              >
                <img
                  :src="item.avatar"
                  class="aspect-square h-full w-full object-cover"
                  alt="img"
                  role="img"
                />
              </span>
              <div class="flex flex-col gap-1 leading-none">
                <p class="font-semibold text-sm">
                  {{ item.title }}
                </p>
                <p class="text-muted-foreground my-1 line-clamp-2 text-xs">
                  {{ item.message }}
                </p>
                <p class="text-muted-foreground line-clamp-2 text-xs">
                  {{ item.date }}
                </p>
              </div>
            </li>
          </template>
        </ul>
      </el-scrollbar>

      <template v-else>
        <div class="flex-center text-muted-foreground min-h-[150px] w-full">
          暂无数据
        </div>
      </template>

      <div class="border-border flex items-center justify-between border-t px-4 py-3">
        <el-button text :disabled="notifications.length <= 0" @click="handleClear">
          清空
        </el-button>
        <el-button type="primary" @click="handleViewAll">
          查看所有消息
        </el-button>
      </div>
    </div>
  </popover>
</template>

<script setup>
import { ref } from 'vue'
import { Popover } from '@/components/popover'

const notifications = ref([
  {
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
])

function handleViewAll() {
}

function handleMakeAll() {

}

function handleClear() {

}

function handleClick(item) {

}
</script>

<style lang="scss">
.bell-button {
  &:hover {
    svg {
      animation: bell-ring 1s both;
    }
  }
}

@keyframes bell-ring {
  0%,
  100% {
    transform-origin: top;
  }

  15% {
    transform: rotateZ(10deg);
  }

  30% {
    transform: rotateZ(-10deg);
  }

  45% {
    transform: rotateZ(5deg);
  }

  60% {
    transform: rotateZ(-5deg);
  }

  75% {
    transform: rotateZ(2deg);
  }
}
</style>
