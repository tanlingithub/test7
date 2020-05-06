<template>
  <div class="native-list">
    <el-data-table ref="table" v-bind="tableConfig"></el-data-table>
  </div>
</template>

<script>
import {nativeTagList, bigTagType} from '@/const/api'
import {formatDate} from '@/const/filter'
import getList from '@/graphql/getList.gql'

import {TAG_TYPE_MAP} from '@/const/common.js'

const STATUS_LIST = [
  {label: '运行中', value: '0'},
  {label: '已失效', value: '1'}
]

export default {
  page: {
    title: '原生标签'
  },
  data() {
    return {
      tableConfig: {
        // useGraphql: true,
        // dataPath: 'list',
        // url: getList,
        url: nativeTagList,
        hasNew: false,
        hasDelete: true,
        // onDelete() {
        //   return Promise.resolve(true)
        // },
        hasEdit: false,
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '标签名称',
            $el: {placeholder: '请输入标签名称'}
          },
          {
            $type: 'select',
            $id: 'tagType',
            label: '标签分类',
            $options: [],
            $el: {placeholder: '请输入选择标签分类'}
          },
          {
            $type: 'select',
            $id: 'status',
            label: '标签状态',
            $options: STATUS_LIST,
            $el: {placeholder: '请输入选择标签分类'}
          }
        ],
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push('add-native')
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
              this.$router.push(`edit-native?id=${row.id}`)
              return Promise.resolve(false)
            }
          }
        ],
        columns: [
          {prop: 'name', label: '标签名称'},
          {
            prop: 'tagType',
            label: '标签分类',
            formatter: row => TAG_TYPE_MAP[row.tagType]
          },
          {prop: 'status', label: '状态'},
          {prop: 'description', label: '标签描述'},
          {prop: 'createdBy', label: '创建人'},
          {
            prop: 'createdAt',
            label: '更新时间',
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ]
      }
    }
  },
  mounted() {
    this.getTagType()

    // this.$apollo
    //   .query({
    //     query: getList,
    //     variables: {}
    //   })
    //   .then(res => {
    //     this.loading = false
    //   })
    //   .catch(e => {
    //     this.loading = false
    //   })
  },
  methods: {
    getTagType() {
      this.$axios.$get(bigTagType).then(resp => {
        let options = resp.payload.content.map(item => {
          return {label: item.name, value: item.id}
        })
        this.$refs.table.$refs.searchForm.setOptions('tagType', options)
      })
    }
  }
}
</script>
<style lang="less">
.native-list {
}
</style>
