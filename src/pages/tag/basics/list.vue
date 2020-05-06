<template>
  <el-data-table ref="basicsTable" v-bind="basicsTagConfig"></el-data-table>
</template>

<script>
import {bigBasicTag, bigTagType} from '@/const/api'
import {formatDate} from '@/const/filter'
export default {
  name: 'basics-list',
  data() {
    return {
      basicsTagConfig: {
        url: bigBasicTag,
        hasNew: false,
        hasDelete: true,
        hasEdit: false,
        customQuery: {type: 0},
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push('edit')
              return Promise.resolve(false)
            }
          }
        ],
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '编辑',
            type: 'primary',
            atClick: row => {
              this.$router.push(`edit?id=${row.id}`)
              return Promise.resolve(false)
            }
          }
        ],
        columns: [
          {prop: 'name', label: '标签名称'},
          // {prop: 'columnComment', label: '关联表属性'},
          {prop: 'description', label: '标签描述'},
          {prop: 'createdBy', label: '创建人'},
          {
            prop: 'createdAt',
            label: '更新时间',
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '标签名称',
            $el: {placeholder: '请输入'}
          }
        ]
      }
    }
  }
}
</script>

<style></style>
