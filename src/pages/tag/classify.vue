<template>
  <el-data-table ref="dataTable" v-bind="tableConfig"></el-data-table>
</template>

<script>
import {formatDate} from '@/const/filter'
import {bigTagType} from '@/const/api'
const HAS_DELETE = 0
export default {
  data() {
    return {
      tableConfig: {
        url: bigTagType,
        hasDelete: false,
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '删除',
            type: 'danger',
            atClick: row => {
              this.$refs.dataTable.onDefaultDelete(row)
              return Promise.resolve(false)
            },
            show: row => {
              return row.containCount == HAS_DELETE
            }
          }
        ],
        operationAttrs: {
          width: '200px'
        },
        columns: [
          {
            label: '标签分类',
            prop: 'name'
          },
          {
            label: '分类描述',
            prop: 'description',
            minWidth: '200px',
            align: 'center'
          },
          {
            label: '包含标签数量',
            prop: 'containCount'
          },
          {
            label: '创建人',
            prop: 'createdBy'
          },
          {
            label: '创建时间',
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        form: [
          {
            $type: 'input',
            label: '标签名称分类',
            $id: 'name',
            $el: {
              placeholder: '请输入：',
              maxLength: 15
            },
            rules: [
              {required: true, trigger: 'blur', message: '请输入标分类名称'}
            ]
          },
          {
            $type: 'input',
            $id: 'description',
            label: '标签描述：',
            $el: {
              type: 'textarea',
              placeholder: '请输入',
              maxLength: 60
            }
          }
        ]
      }
    }
  }
}
</script>

<style></style>
