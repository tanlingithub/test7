<template>
  <el-data-table ref="customTable" v-bind="customTagConfig"></el-data-table>
</template>

<script>
import {bigTagList, bigTagType, deleteBigTag} from '@/const/api'
import {formatDate} from '@/const/filter'
export default {
  name: 'custom-list',
  data() {
    return {
      customTagConfig: {
        url: bigTagList,
        dataPath: 'payload.content',
        hasNew: false,
        hasEdit: false,
        hasDelete: false,
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push('big-edit')
              return Promise.resolve(false)
            }
          }
        ],
        customQuery: {
          type: 1
        },
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '查看',
            type: 'primary',
            atClick: row => {
              this.$router.push(`big-edit?id=${row.tagId}&isView=0`)
              return Promise.resolve(false)
            }
          },
          {
            text: '编辑',
            atClick: row => {
              this.$router.push(`big-edit?id=${row.tagId}`)
              return Promise.resolve(false)
            }
          },
          {
            text: '删除',
            type: 'danger',
            atClick: row => {
              this.$confirm('确认当前操作吗', '提示', {
                type: 'warning',
                beforeClose: (action, instance, done) => {
                  if (action == 'confirm') {
                    instance.confirmButtonLoading = true
                    this.$axios
                      .$delete(`${deleteBigTag}?mixedTagId=${row.tagId}`)
                      .then(resp => {
                        if (resp.code === '0') {
                          this.$refs.customTable.getList()
                          this.$message.success('删除成功')
                        }
                        done()
                      })
                      .finally(() => {
                        instance.confirmButtonLoading = false
                      })
                  } else done()
                }
              }).catch(er => {
                /*取消*/
              })
              return Promise.resolve(false)
            }
          }
        ],
        operationAttrs: {
          width: '280px'
        },
        columns: [
          {prop: 'tagId', label: '标签编号'},
          {prop: 'tagName', label: '标签名称'},
          {prop: 'categoryName', label: '所属标签分类'},
          {prop: 'count', label: '打标次数'},
          {
            prop: 'updatedAt',
            label: '更新时间',
            formatter: row => formatDate(row.updateTime, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '标签名称',
            $el: {placeholder: '请输入'}
          },
          {
            $type: 'select',
            $id: 'tagTypeId',
            label: '标签分类',
            $el: {placeholder: '请输入'},
            $options: []
          }
        ]
      }
    }
  },
  mounted() {
    this.getTagType()
  },
  methods: {
    getTagType() {
      this.$axios.$get(bigTagType).then(resp => {
        let options = resp.payload.content.map(item => {
          return {label: item.name, value: item.id}
        })
        this.$refs.customTable.$refs.searchForm.setOptions('tagTypeId', options)
      })
    }
  }
}
</script>

<style></style>
