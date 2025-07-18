<template>
  <div class="bg-card p-3">
    <el-form>
      <el-form-item>
        <ReAutocomplete
          v-model:label="dataForm.userName"
          v-model:value="dataForm.userId"
          :api="getDicts"
          :params="{ key: 'userName' }"
          :before-fetch="beforeFetch"
          label-field="label"
          value-field="value"
          result-field="data"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <ReButton type="primary" @click="submit">submit</ReButton>
      </el-form-item>
    </el-form>
    <el-card>
      <code>
        {{ dataForm }}
      </code>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDicts } from '@/api/dict'

const dataForm = ref({
  userName: '',
  userId: '',
})

const beforeFetch = (params) => {
  console.log('beforeFetch', params)
}

// 表单数据回填
const getData = async () => {

}

// 表单数据提交
const submit = async () => {
}

onMounted(() => {

})
</script>

<style lang="scss">

</style>
