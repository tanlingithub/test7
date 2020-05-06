<template>
  <el-data-table
    ref="dataTable"
    v-bind="tableConfig"
    class="goods-table"
  ></el-data-table>
</template>

<script>
import {activityGoodsPageApi} from '@/const/api'
import {formatDate} from '@/const/filter'
import {regDecimal} from '@/const/regexp'
import UploadToAli from '@femessage/upload-to-ali'
import VEditor from '@femessage/v-editor'
import {noVoidMsg} from '@/const/utils'

const RELATE = 1
// 商品最低金额
const minProductPrice = 0.01
// 表单检验-商品价格
const validProductPrice = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入商品销售价格'))
  }
  //  /^([1-9]\d{0,4}|0)(\.\d{0,2})?$/
  if (!regDecimal(5, 2).test(value + '')) {
    return callback(
      new Error('请输入正确的商品销售价格(5位以内的正整数，2位以内小数)')
    )
  }
  if (value < minProductPrice) {
    return callback(new Error(`销售价格不能小于${minProductPrice}`))
  }
  callback()
}
export default {
  data() {
    return {
      tableConfig: {
        url: activityGoodsPageApi,
        hasNew: false,
        hasEdit: false,
        hasView: false,
        hasDelete: false,
        operationAttrs: {
          width: '200px',
          fixed: 'right'
        },
        tableAttrs: {border: true},
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push({
                path: `/activity-management/goods-detail`,
                query: {type: 'new'}
              })
              return Promise.resolve(false)
            }
          }
        ],
        extraButtons: [
          {
            type: 'danger',
            text: '删除',
            atClick: async row => {
              const res = await this.handleDelete(row.id)
              return Promise.resolve(res)
            }
          },
          {
            text: '查看',
            atClick: row => this.viewOrEdit('view', row.id)
          },
          {
            text: '编辑',
            atClick: row => this.viewOrEdit('edit', row.id)
          }
        ],
        columns: [
          {
            prop: 'id',
            label: '商品编码',
            minWidth: 200
          },
          {
            prop: 'name',
            label: '商品名称'
          },
          {
            prop: 'type',
            label: '商品分类'
          },
          {
            prop: 'salePrice',
            label: '销售价格',
            width: 100,
            formatter: row => row.salePrice.toFixed(2)
          },
          {
            prop: 'joinActivityFlag',
            label: '是否已关联活动',
            width: 120,
            formatter: row => (row.joinActivityFlag == RELATE ? '是' : '否')
          },
          {
            prop: 'createdAt',
            label: '创建时间',
            width: 200,
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '商品名称',
            $el: {
              placeholder: '请输入'
            }
          },
          {
            $type: 'input',
            $id: 'type',
            label: '商品类别',
            $el: {
              placeholder: '请输入'
            }
          }
        ]
      }
    }
  },
  methods: {
    async handleDelete(id) {
      const pramas = {
        content: '确认删除吗',
        successMsg: '删除成功',
        errorMsg: '删除失败'
      }
      pramas.callFunc = () => {
        return this.$axios.$post('goods/delete', {id})
      }
      return noVoidMsg.call(this, pramas)
    },
    viewOrEdit(type, id) {
      this.$router.push({
        path: '/activity-management/goods-detail',
        query: {type, id}
      })
    }
  }
}
</script>

<style lang="less">
.goods-table {
  .el-form-item__label {
    float: none;
  }
}
</style>
