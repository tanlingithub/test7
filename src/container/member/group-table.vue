<template>
  <el-table
    ref="groupTable"
    class="group-table"
    v-bind="$attrs"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55"> </el-table-column>
    <el-table-column label="分组名称" prop="name"></el-table-column>
    <el-table-column label="标签" prop="tagNames">
      <template slot-scope="scope">
        <el-tag
          v-for="(item, index) in scope.row.tagNames"
          :key="index"
          class="mr-1"
          >{{ item }}</el-tag
        >
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import {Tag} from 'element-ui'
export default {
  components: {
    'el-tag': Tag
  },
  data() {
    return {
      selectedGroup: []
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedGroup = val
      this.$emit('update:groupList', this.selectedGroup)
    }
  }
}
</script>
<style lang="less">
.group-table {
  .mr-1 {
    margin-right: 10px;
  }
}
</style>
