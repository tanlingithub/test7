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
        hasView: true,
        hasDelete: false,
        operationAttrs: {
          width: '200px',
          fixed: 'right'
        },
        tableAttrs: {border: true},
        extraButtons: [
          {
            type: 'danger',
            text: '删除',
            show: row => RELATE !== row.joinActivityFlag,
            atClick: row => {
              this.$confirm(`确定删除该商品吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(res => {
                this.$axios
                  .delete(`${activityGoodsPageApi}/${row.id}`)
                  .then(res => {
                    this.$message({
                      type: 'success',
                      message: '操作成功'
                    })
                    this.$refs.dataTable.getList()
                  })
                  .catch(e => {
                    console.log(e)
                  })
              })
              return Promise.resolve(false)
            }
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
        ],
        form: [
          {
            $type: 'input',
            $id: 'name',
            label: '商品名称',
            $el: {
              placeholder: '请输入',
              maxlength: 30
            },
            rules: [
              {
                required: true,
                message: '请输入商品名称',
                trigger: 'blur'
              }
            ]
          },
          {
            $type: 'input',
            $id: 'type',
            label: '商品分类',
            $el: {
              placeholder: '请输入',
              maxlength: 30
            },
            rules: [
              {
                required: true,
                message: '请输入商品类别',
                trigger: 'blur'
              }
            ]
          },
          {
            $type: 'input',
            $id: 'salePrice',
            label: '销售价格',
            $el: {
              placeholder: '请输入'
            },
            rules: [
              {
                required: true,
                trigger: 'blur',
                validator: validProductPrice
              }
            ],
            outputFormat: salePrice => parseFloat(salePrice).toFixed(2),
            inputFormat: row => parseFloat(row.salePrice).toFixed(2)
          },
          {
            $id: 'imageUrl',
            component: UploadToAli,
            label: '商品图片',
            $el: {
              max: 20,
              size: 10240,
              multiple: true
            },
            rules: [
              {
                required: true,
                trigger: 'blur',
                message: '至少添加1张图片'
              }
            ],
            outputFormat: imageUrl => {
              if (imageUrl) {
                return imageUrl.join()
              }
            },
            inputFormat: row => {
              if (row.imageUrl) {
                return row.imageUrl.split(',')
              }
            }
          },
          {
            $type: 'input',
            component: VEditor,
            $id: 'description',
            label: '商品描述',
            $el: {
              height: 200
            },
            rules: [
              {
                required: true,
                message: '请输入商品描述',
                trigger: 'blur'
              }
            ]
          }
        ]
      }
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
