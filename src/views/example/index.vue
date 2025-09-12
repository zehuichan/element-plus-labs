<template>
  <div class="p-6">
    <el-select-v2
      v-model="select"
      :options="qr_project_type"
      multiple
      @change="qr_project_type_change"
    />
    <el-divider />
    <el-table
      :data="qr_project_tree_data"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      default-expand-all
    >
      <el-table-column prop="qr_project_type" label="质检项目类型" />
      <el-table-column prop="qr_standard" label="检验标准" />
      <el-table-column prop="qr_result" label="判定结果" />
      <el-table-column prop="desc" label="质检说明" />
    </el-table>
    {{ select }}
  </div>
</template>

<script setup>
import { ref } from "vue";
import { qr_project_type, qr_project_tree_data } from "@/views/example/data";

const select = ref([]);
const tableData = ref([]);

const qr_project_type_change = (val) => {
  const result = [];
  val.forEach((item) => {});
};
</script>
<style lang="scss"></style>
