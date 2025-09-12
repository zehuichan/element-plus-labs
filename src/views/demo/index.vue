<template>
  <div class="bg-card p-3">
    <el-form label-position="top">
      <el-form-item label="ReInput">
        <ReInput
          v-model="dataForm.input"
        />
      </el-form-item>
      <el-form-item label="ReMention">
        <ReMention
          v-model="dataForm.mention"
          :api="getDicts"
          label-field="label"
          value-field="label"
          result-field="data"
        />
      </el-form-item>
      <el-form-item label="ReSelect">
        <ReSelect
          v-model="dataForm.select"
          :options="options"
        />
      </el-form-item>
      <el-form-item label="ReTreeSelect">
        <ReTreeSelect
          v-model="dataForm.select2"
          :api="getAllMenusApi"
          label-field="name"
          value-field="path"
          result-field="data"
        />
      </el-form-item>
      <el-form-item label="ReRadio(border)">
        <ReRadioGroup
          v-model="dataForm.radio"
          :api="getDicts"
          label-field="label"
          value-field="value"
          result-field="data"
          border
        />
      </el-form-item>
      <el-form-item label="ReRadio(button)">
        <ReRadioGroup
          v-model="dataForm.radio"
          :api="getDicts"
          label-field="label"
          value-field="value"
          result-field="data"
          button
        />
      </el-form-item>
      <el-form-item label="ReCheckboxGroup(border)">
        <ReCheckboxGroup
          v-model="dataForm.checkbox"
          :api="getDicts"
          label-field="label"
          value-field="value"
          result-field="data"
          border
        />
      </el-form-item>
      <el-form-item label="ReCheckboxGroup(button)">
        <ReCheckboxGroup
          v-model="dataForm.checkbox"
          :api="getDicts"
          label-field="label"
          value-field="value"
          result-field="data"
          button
        />
      </el-form-item>
      <el-form-item label="ReAutocomplete">
        <ReAutocomplete
          v-model:label="dataForm.userName"
          v-model:value="dataForm.userId"
          :api="getDicts"
          :params="{ key: 'userName' }"
          :before-fetch="beforeFetch"
          label-field="label"
          value-field="value"
          result-field="data"
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
import { getAllMenusApi } from '@/api/sys'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option ${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}))

const dataForm = ref({
  input: '',
  mention: '',
  select: '',
  select2: '',
  radio: '',
  checkbox: [],
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
