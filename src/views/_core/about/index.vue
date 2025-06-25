<template>
  <div>
    <el-card>
      <el-descriptions title="生产环境依赖" :column="4" border direction="vertical">
        <el-descriptions-item v-for="item in dependenciesItems" :label="item.title">
          {{ item.content }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card class="mt-4">
      <el-descriptions title="开发环境依赖" :column="4" border direction="vertical">
        <el-descriptions-item v-for="item in devDependenciesItems" :label="item.title">
          {{ item.content }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>

const {
  buildTime,
  dependencies = {},
  devDependencies = {},
  version,
  // vite inject-metadata 插件注入的全局变量
} = __METADATA__ || {}

const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}))

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}))
</script>

<style lang="scss">

</style>
