<template>
  <el-table class="data-table" border :data="data">
    <el-table-column prop="name" label="商品名称"></el-table-column>
    <el-table-column prop="type" label="商品分类"></el-table-column>
    <el-table-column fixed="right" label="操作" width="100">
      <template slot-scope="scope">
        <el-button @click="deleteProduct(scope.row)" type="text" size="small"
          >删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  name: 'data-table',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  methods: {
    deleteProduct(val) {
      let filterData = this.data.filter(item => item.id !== val.id)

      this.$emit('update:data', filterData)
    }
  }
}
</script>
