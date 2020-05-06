<template>
  <el-dialog :visible.sync="visible" title="选择商品">
    <el-data-table
      ref="productTable"
      v-bind="suitAbleConfig"
      :columns="columns"
      @selection-change="handleSelectionProduct"
    ></el-data-table>
    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="$emit('update:visible', false)"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import {suitAbleConfig} from '@/const/order'
export default {
  name: 'suitable-table',
  props: {
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      suitAbleConfig: suitAbleConfig,
      columns: [
        {type: 'selection'},
        {
          prop: 'name',
          label: '商品',
          formatter: row => {
            return (
              <div>
                <img class="product-img" src={row.imageUrl} />
                {row.name}
              </div>
            )
          }
        },
        {prop: 'salePrice', label: '价格'}
      ]
    }
  },
  methods: {
    // 选择商品
    handleSelectionProduct(val) {
      this.$emit('selected', val)
    }
  }
}
</script>

<style></style>
