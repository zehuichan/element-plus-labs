<template>
  <div></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessageBox } from 'element-plus'

let checkUpdatesInterval = 1
let isCheckingUpdates = false
const currentVersionTag = ref('')
const lastVersionTag = ref('')
const timer = ref()

async function getVersionTag() {
  try {
    if (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    ) {
      return null
    }

    const response = await fetch(import.meta.env.BASE_URL || '/', {
      cache: 'no-cache',
      method: 'HEAD',
    })

    return (
      response.headers.get('etag') || response.headers.get('last-modified')
    )
  } catch {
    console.error('Failed to fetch version tag')
    return null
  }
}

async function checkForUpdates() {
  const versionTag = await getVersionTag()
  if (!versionTag) {
    return
  }

  if (!lastVersionTag.value) {
    lastVersionTag.value = versionTag
    return
  }

  if (lastVersionTag.value !== versionTag && versionTag) {
    clearInterval(timer.value)
    handleNotice(versionTag)
  }
}

function handleNotice(versionTag) {
  currentVersionTag.value = versionTag
  ElMessageBox.alert('点击刷新以获取最新版本', '新版本可用', {
    showClose: false,
    confirmButtonText: '刷新',
    callback: () => {
      lastVersionTag.value = currentVersionTag.value
      window.location.reload()
    },
  })
}

function start() {
  if (checkUpdatesInterval <= 0) {
    return
  }

  // 每 checkUpdatesInterval(默认值为1) 分钟检查一次
  timer.value = setInterval(checkForUpdates, checkUpdatesInterval * 60 * 1000)
}

function handleVisibilitychange() {
  if (document.hidden) {
    stop()
  } else {
    if (!isCheckingUpdates) {
      isCheckingUpdates = true
      checkForUpdates().finally(() => {
        isCheckingUpdates = false
        start()
      })
    }
  }
}

function stop() {
  clearInterval(timer.value)
}

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', handleVisibilitychange)
})

onUnmounted(() => {
  stop()
  document.removeEventListener('visibilitychange', handleVisibilitychange)
})
</script>
