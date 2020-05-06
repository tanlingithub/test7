<template>
  <el-data-table ref="groupTable" v-bind="tableConfig"></el-data-table>
</template>
<script>
import {groupColumns} from '@/const/member'
import {memberGroupList, enableGroup, disabledGroup} from '@/const/api'

const ENABLE = '启用'
const DISABLE = '禁用'

export default {
  name: 'group-list',
  data() {
    return {
      tableConfig: {
        url: memberGroupList,
        hasNew: false,
        hasEdit: false,
        hasDelete: false,
        operationAttrs: {
          width: '280px'
        },
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: row => {
              this.$router.push('edit')
              return Promise.resolve(false)
            }
          }
        ],
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '查看',
            type: 'primary',
            atClick: row => {
              this.$router.push(`detail?id=${row.id}`)
              return Promise.resolve(false)
            }
          },
          {
            text: '编辑',
            atClick: row => {
              this.$router.push(`edit?id=${row.id}`)
              return Promise.resolve(false)
            }
          },
          {
            text: '启用',
            type: 'primary',
            show: row => row.state === DISABLE,
            atClick: row => {
              this.confirm(enableGroup(row.id))
              return Promise.resolve(false)
            }
          },
          {
            text: '禁用',
            show: row => row.state === ENABLE,
            atClick: row => {
              this.confirm(disabledGroup(row.id))
              return Promise.resolve(false)
            }
          },
          {
            text: '删除',
            type: 'danger',
            show: row => row.state === DISABLE,
            atClick: row => {
              this.confirm(`${memberGroupList}/${row.id}`, '$delete')
              return Promise.resolve(false)
            }
          }
        ],
        columns: groupColumns
      }
    }
  },
  methods: {
    confirm(id, method) {
      this.$confirm('确认当前操作吗', '提示', {
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            this.$axios[method || '$post'](id)
              .then(resp => {
                if (resp.code !== '0') {
                  this.$message.warning(resp.msg)
                  return
                }
                this.$refs.groupTable.getList()
              })
              .finally(() => {
                instance.confirmButtonLoading = false
                done()
              })
          } else done()
        }
      }).catch(er => {
        /*取消*/
      })
    }
  }
}
</script>
