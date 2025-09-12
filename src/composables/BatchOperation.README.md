# 批量操作 Hook 使用指南

本项目提供了两个批量操作的 Hook，用于处理需要批量执行的异步操作。

## 1. useBatchOperation - 功能完整的批量操作 Hook

### 特性

- ✅ 支持自定义 API 接口
- ✅ 可配置并发数
- ✅ 实时进度跟踪
- ✅ 详细的成功/失败统计
- ✅ 完整的回调函数支持
- ✅ JSDo// 执行操作
  await execute(items, 5) // 5 为可选的并发数

````

## 2. 基本用法

### 简单批量操作

```javascript
import { useBatchOperation } from '@/composables'

// 定义批量处理 API
const batchUpload = useBatchOperation({
  api: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return await uploadFile(formData)
  },
  concurrency: 3 // 同时处理3个文件
})

const { loading, progress, results, errors, execute } = batchUpload

// 执行批量上传
const handleBatchUpload = async (files) => {
  try {
    await execute(files)
    console.log('上传完成', results.value)
  } catch (error) {
    console.error('批量上传失败', error)
  }
}
````

### 在 Vue 模板中使用

```vue
<template>
  <div>
    <el-upload :file-list="fileList" :auto-upload="false" multiple>
      <el-button>选择文件</el-button>
    </el-upload>

    <el-button
      @click="startUpload"
      :loading="loading"
      :disabled="fileList.length === 0"
    >
      开始批量上传 ({{ fileList.length }} 个文件)
    </el-button>

    <!-- 进度显示 -->
    <el-progress
      v-if="loading"
      :percentage="progress"
      :format="
        (percentage) =>
          `${Math.ceil(percentage)}% (${results.length}/${fileList.length})`
      "
    />

    <!-- 结果显示 -->
    <div v-if="results.length > 0">
      <h3>上传成功 ({{ results.length }})</h3>
      <ul>
        <li v-for="result in results" :key="result.id">
          {{ result.name }} - {{ result.url }}
        </li>
      </ul>
    </div>

    <!-- 错误显示 -->
    <div v-if="errors.length > 0">
      <h3>上传失败 ({{ errors.length }})</h3>
      <ul>
        <li v-for="error in errors" :key="error.index">
          文件 {{ error.index + 1 }}: {{ error.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useBatchOperation } from "@/composables";

const fileList = ref([]);

const { loading, progress, results, errors, execute } = useBatchOperation({
  api: uploadFileApi,
  concurrency: 2,
});

const startUpload = () => {
  execute(fileList.value.map((item) => item.raw));
};
</script>
```

## 3. 停止功能详解

### 停止机制

`useBatchOperation` 提供了真正的停止功能，而不仅仅是设置 `loading = false`：

## 4. 暂停和恢复功能

### 暂停和恢复机制

除了停止功能，`useBatchOperation` 还支持暂停和恢复操作：

```javascript
const { loading, isPaused, isStopped, execute, pause, resume, stop } =
  useBatchOperation({
    api: async (item) => {
      // 长时间运行的 API
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return await processItem(item);
    },
    concurrency: 2,
  });

// 开始批量操作
execute(items);

// 暂停操作（新任务不会开始，已开始的任务继续执行）
pause();

// 恢复操作（继续执行剩余任务）
resume();

// 停止操作（完全停止）
stop();
```

### 暂停与停止的区别

| 功能       | 暂停 (pause)     | 停止 (stop)       |
| ---------- | ---------------- | ----------------- |
| 新任务执行 | 🚫 暂停启动      | 🚫 完全停止       |
| 已开始任务 | ✅ 继续执行      | ✅ 继续执行       |
| 可恢复性   | ✅ 可恢复        | ❌ 不可恢复       |
| 状态标识   | `isPaused: true` | `isStopped: true` |

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <el-button @click="startOperation" :disabled="loading">
      开始操作
    </el-button>

    <el-button
      @click="pauseOperation"
      :disabled="!loading || isPaused || isStopped"
      type="warning"
    >
      暂停操作
    </el-button>

    <el-button
      @click="resumeOperation"
      :disabled="!loading || !isPaused || isStopped"
      type="success"
    >
      恢复操作
    </el-button>

    <el-button
      @click="stopOperation"
      :disabled="!loading || isStopped"
      type="danger"
    >
      停止操作
    </el-button>

    <!-- 状态显示 -->
    <el-alert
      v-if="isPaused"
      title="操作已暂停"
      type="info"
      description="点击恢复操作继续执行剩余任务"
    />

    <el-alert
      v-else-if="isStopped"
      title="操作已停止"
      type="warning"
      description="操作已完全停止，无法恢复"
    />
  </div>
</template>

<script setup>
const batchOperation = useBatchOperation({
  api: longRunningApi,
  concurrency: 2,
});

const { loading, isPaused, isStopped, execute, pause, resume, stop } =
  batchOperation;

const startOperation = () => execute(items);
const pauseOperation = () => pause();
const resumeOperation = () => resume();
const stopOperation = () => stop();

// 监听状态变化
watch(isPaused, (paused) => {
  if (paused) {
    console.log("⏸️ 操作已暂停");
  } else {
    console.log("▶️ 操作已恢复");
  }
});
</script>
```

### 自动暂停示例

可以根据条件自动暂停和恢复：

```javascript
const smartBatchOperation = useBatchOperation({
  api: processApi,
  concurrency: 3,
});

// 监听网络状况
const isNetworkSlow = ref(false);

watch(isNetworkSlow, (slow) => {
  if (
    slow &&
    smartBatchOperation.loading.value &&
    !smartBatchOperation.isPaused.value
  ) {
    console.log("🌐 网络变慢，自动暂停");
    smartBatchOperation.pause();
  } else if (!slow && smartBatchOperation.isPaused.value) {
    console.log("🌐 网络恢复，自动恢复");
    smartBatchOperation.resume();
  }
});

// 监听高峰时段
const isPeakHours = ref(false);

watch(isPeakHours, (peak) => {
  if (peak && smartBatchOperation.loading.value) {
    smartBatchOperation.pause();
  } else if (!peak && smartBatchOperation.isPaused.value) {
    smartBatchOperation.resume();
  }
});
```

## 5. 实际应用场景

### 批量删除用户 ading = false`：

```javascript
const { loading, isStopped, execute, stop } = useBatchOperation({
  api: async (item) => {
    // 长时间运行的 API
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await processItem(item);
  },
  concurrency: 3,
});

// 开始批量操作
execute(items);

// 停止操作（会立即停止新任务的执行）
stop();

// 监听停止状态
watch(isStopped, (stopped) => {
  if (stopped) {
    console.log("批量操作已停止");
  }
});
```

### 停止行为说明

1. **立即停止新任务**：调用 `stop()` 后，不会开始执行新的任务
2. **正在执行的任务**：已经开始的任务会继续完成（无法中途取消）
3. **状态更新**：`loading` 设置为 `false`，`isStopped` 设置为 `true`
4. **AbortController**：如果 API 支持 AbortController，会自动触发取消

### 支持 AbortController 的 API

```javascript
const apiWithAbortSupport = async (item) => {
  // 注意：当前版本需要手动处理 AbortController
  // 未来版本会直接传递 signal 参数

  const controller = new AbortController();

  const response = await fetch(`/api/process/${item.id}`, {
    method: "POST",
    signal: controller.signal,
    body: JSON.stringify(item),
  });

  return response.json();
};

const { execute, stop } = useBatchOperation({
  api: apiWithAbortSupport,
  onError: (error, item) => {
    if (error.name === "AbortError") {
      console.log(`${item.name} 请求被取消`);
    }
  },
});
```

### 在 Vue 组件中使用停止功能

```vue
<template>
  <div>
    <el-button @click="startOperation" :disabled="loading">
      开始批量操作
    </el-button>

    <el-button
      @click="stopOperation"
      :disabled="!loading || isStopped"
      type="warning"
    >
      停止操作
    </el-button>

    <el-alert
      v-if="isStopped"
      title="操作已停止"
      type="warning"
      :description="`已处理 ${completed + failed} / ${total} 项`"
    />
  </div>
</template>

<script setup>
const { loading, isStopped, total, completed, failed, execute, stop } =
  useBatchOperation({
    api: longRunningApi,
    concurrency: 2,
  });

const startOperation = () => execute(items);
const stopOperation = () => stop();
</script>
```

## 6. 高级功能

### JSDoc 类型支

- ✅ 支持停止操作（立即停止新任务执行）
- ✅ AbortController 集成支持

### 基本用法

```javascript
import { useBatchOperation } from "@/composables";

// 定义 API 接口
const deleteApi = async (item) => {
  const response = await fetch(`/api/users/${item.id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("删除失败");
  return response.json();
};

// 使用 Hook
const {
  loading, // 加载状态
  progress, // 进度百分比 (0-100)
  total, // 总数量
  completed, // 已完成数量
  failed, // 失败数量
  results, // 成功结果列表
  errors, // 错误列表
  successRate, // 成功率
  execute, // 执行方法
  reset, // 重置状态
  stop, // 停止操作
} = useBatchOperation({
  api: deleteApi,
  concurrency: 3, // 并发数
  onProgress: ({ progress, completed, total, current }) => {
    console.log(`进度: ${progress}% (${completed}/${total})`);
  },
  onSuccess: (result, item) => {
    console.log(`✅ ${item.name} 操作成功`);
  },
  onError: (error, item) => {
    console.error(`❌ ${item.name} 操作失败:`, error.message);
  },
  onComplete: (summary) => {
    console.log("批量操作完成:", summary);
  },
});

// 执行批量操作
const items = [
  { id: 1, name: "用户1" },
  { id: 2, name: "用户2" },
];
execute(items, {
  concurrency: 5, // 可覆盖默认并发数
  delay: 100, // 请求间隔 (ms)
});
```

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <!-- 操作按钮 -->
    <el-button
      @click="handleBatchDelete"
      :loading="loading"
      :disabled="selectedItems.length === 0"
    >
      批量删除 ({{ selectedItems.length }})
    </el-button>

    <!-- 进度条 -->
    <el-progress
      v-if="total > 0"
      :percentage="progress"
      :status="isCompleted ? (failed > 0 ? 'exception' : 'success') : undefined"
    />

    <!-- 统计信息 -->
    <div v-if="total > 0">
      <el-tag>总计: {{ total }}</el-tag>
      <el-tag type="success">成功: {{ completed }}</el-tag>
      <el-tag type="danger">失败: {{ failed }}</el-tag>
      <el-tag type="info">成功率: {{ successRate }}%</el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useBatchOperation } from "@/composables";

const selectedItems = ref([]);

const batchOperation = useBatchOperation({
  api: async (item) => {
    // 你的 API 调用
    const response = await fetch(`/api/delete/${item.id}`, {
      method: "DELETE",
    });
    return response.json();
  },
  concurrency: 3,
  onSuccess: (result, item) => {
    ElMessage.success(`${item.name} 删除成功`);
  },
  onError: (error, item) => {
    ElMessage.error(`${item.name} 删除失败`);
  },
});

const handleBatchDelete = () => {
  batchOperation.execute(selectedItems.value);
};

// 解构所有需要的状态和方法
const {
  loading,
  progress,
  total,
  completed,
  failed,
  results,
  errors,
  successRate,
  isCompleted,
} = batchOperation;
</script>
```

## 7. useSimpleBatch - 简化版批量操作 Hook

### 特性

- ✅ 轻量级实现
- ✅ 简单易用
- ✅ 基本的进度跟踪
- ✅ 专用 Hook 变体

### 基本用法

```javascript
import { useSimpleBatch, useBatchDelete, useBatchUpdate } from "@/composables";

// 通用简单批量操作
const { loading, progress, results, errors, execute, reset } = useSimpleBatch(
  async (item) => {
    // 你的 API 调用
    return await someApi(item);
  },
  {
    concurrency: 3,
    onProgress: ({ completed, total, progress }) => {
      console.log(`进度: ${progress}%`);
    },
  }
);

// 专用批量删除
const deleteOperation = useBatchDelete(async (item) => {
  return await deleteApi(item);
});

// 专用批量更新
const updateOperation = useBatchUpdate(async (item) => {
  return await updateApi(item);
});

// 执行操作
await execute(items, 5); // 5 为可选的并发数
```

## 8. 实际应用场景

### 批量删除用户

```javascript
const { execute: batchDelete } = useBatchDelete(
  async (user) => {
    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`删除用户 ${user.name} 失败`);
    return { deleted: true, userId: user.id };
  },
  {
    onProgress: ({ progress, item }) => {
      console.log(`删除进度: ${progress}% - 正在删除: ${item.name}`);
    },
  }
);

// 执行批量删除
await batchDelete(selectedUsers);
```

### 批量上传文件

```javascript
const fileUpload = useBatchUpload(
  async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`上传 ${file.name} 失败`);
    return response.json();
  },
  {
    concurrency: 2, // 文件上传建议较低并发
    onProgress: ({ progress, item }) => {
      console.log(`上传进度: ${progress}% - ${item.name}`);
    },
  }
);

await fileUpload.execute(selectedFiles);
```

### 批量数据同步

```javascript
const dataSyncOperation = useBatchOperation({
  api: async (record) => {
    // 数据验证
    if (!record.id) throw new Error("记录ID不能为空");

    // 同步到远程服务器
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    return response.json();
  },
  concurrency: 4,
  onProgress: ({ progress, completed, total }) => {
    updateProgressBar(progress);
    updateStatusText(`已同步 ${completed}/${total} 条记录`);
  },
  onComplete: ({ completed, failed }) => {
    showNotification(`同步完成: 成功 ${completed} 条，失败 ${failed} 条`);
  },
});
```

## 9. 错误处理

```javascript
const operation = useBatchOperation({
  api: async (item) => {
    try {
      return await riskyApi(item);
    } catch (error) {
      // 可以在这里进行重试逻辑
      if (error.status === 429) {
        // 限流
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await riskyApi(item); // 重试一次
      }
      throw error;
    }
  },
  onError: (error, item, index) => {
    // 记录错误日志
    console.error(`处理第 ${index + 1} 项失败:`, {
      item,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  },
});
```

## 10. 性能优化建议

1. **合理设置并发数**：

   - CPU 密集型操作：`concurrency = CPU核心数`
   - 网络请求：`concurrency = 3-5`
   - 文件上传：`concurrency = 1-2`

2. **使用延迟避免服务器压力**：

   ```javascript
   execute(items, { concurrency: 3, delay: 200 });
   ```

3. **分批处理大量数据**：
   ```javascript
   // 将大数组分成小批次处理
   const batchSize = 100;
   for (let i = 0; i < largeArray.length; i += batchSize) {
     const batch = largeArray.slice(i, i + batchSize);
     await execute(batch);
     // 批次间休息
     await new Promise((resolve) => setTimeout(resolve, 1000));
   }
   ```

## 11. JSDoc 类型提示

这些 Hook 使用详细的 JSDoc 注释，提供良好的 IDE 智能提示支持：

```javascript
/**
 * @typedef {Object} BatchOperationConfig
 * @property {Function} [api] - 批量操作的 API 接口
 * @property {number} [concurrency=3] - 并发数，默认为 3
 * @property {function(ProgressInfo): void} [onProgress] - 进度回调函数
 */

// IDE 会自动提示参数类型和返回值类型
const operation = useBatchOperation({
  api: async (user) => {
    // user 参数会有智能提示
    return await deleteUserApi(user);
  },
  concurrency: 3,
  onSuccess: (result, user) => {
    // result 和 user 参数都有类型提示
    console.log(`用户 ${user.name} 删除成功`);
  },
});

// 返回的方法和属性也有智能提示
const { loading, progress, execute } = operation;
```

## 12. 完整示例

查看 `src/views/demo/BatchOperationDemo.vue` 文件获取完整的使用示例，包括：

- 表格选择
- 进度显示
- 错误处理
- 结果展示

这些 Hook 可以大大简化批量操作的实现，提供统一的进度跟踪和错误处理机制。
