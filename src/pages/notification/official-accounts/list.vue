<template>
  <el-data-table v-bind="tableConfig" ref="dataTable"></el-data-table>
</template>

<script>
import {formatDate} from '@/const/filter'
import {vipcnListApi, cancleSend} from '@/const/api'
const MESSAGE_STATUS = {0: '已发送', 1: '待发送', 2: '已取消', 3: '草稿'}
const SEND_MODE = {1: '即时发送', 2: '定时发送'}
const CANCLE_SEND_STATUS = '2'
export default {
  data() {
    return {
      tableConfig: {
        url: vipcnListApi(),
        hasNew: false,
        hasDelete: false,
        hasEdit: false,
        operationAttrs: {
          minWidth: '160px'
        },
        columns: [
          {
            label: '消息标题',
            prop: 'title'
          },
          {
            label: '发送目标人群',
            prop: 'target',
            formatter: row => row.target && row.target.join(',')
          },
          {
            label: '发送公众号',
            prop: 'vipcn'
          },
          {
            label: '发送方式',
            prop: 'sendMode',
            formatter: row => SEND_MODE[row.sendMode]
          },
          {
            label: '状态',
            formatter: row => MESSAGE_STATUS[row.status]
          },
          {
            label: '创建时间',
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '查看',
            atClick: row => {
              this.$router.push(`edit?id=${row.id}&isView=true`)
              return Promise.resolve(false)
            }
          },
          {
            text: '编辑',
            atClick: row => {
              let query = {id: row.id}
              this.$router.push({
                path: 'edit',
                query
              })
              return Promise.resolve(false)
            },
            show: row => MESSAGE_STATUS[row.status] == MESSAGE_STATUS[3]
          },
          {
            text: '取消发送',
            atClick: row => {
              //加弹出窗
              this.confirm(
                '是否取消发送？',
                'put',
                `${cancleSend(row.id)}?status=${CANCLE_SEND_STATUS}`
              )
              return Promise.resolve(false)
            },
            show: row => MESSAGE_STATUS[row.status] == MESSAGE_STATUS[1]
          },
          {
            text: '删除',
            atClick: row => {
              //加弹出窗
              this.confirm('是否删除？', 'delete', vipcnListApi(row.id))
              return Promise.resolve(false)
            },
            show: row =>
              MESSAGE_STATUS[row.status] == MESSAGE_STATUS[2] ||
              MESSAGE_STATUS[row.status] == MESSAGE_STATUS[3]
          }
        ],
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push({
                path: 'edit'
              })
              return Promise.resolve(false)
            }
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'title',
            label: '消息标题',
            $el: {
              placeholder: '请输入'
            }
          },
          {
            $type: 'select',
            $id: 'status',
            label: '消息状态',
            $el: {
              placeholder: '请选择'
            },
            $options: Object.keys(MESSAGE_STATUS).map(el => {
              return {
                label: MESSAGE_STATUS[el],
                value: `${el}`
              }
            })
          }
        ]
      }
    }
  },
  methods: {
    confirm(text, method, url) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios[method](url)
            .then(res => {
              this.$refs.dataTable.getList()
              this.$message.success('操作成功')
            })
            .catch(err => {
              console.log(err)
            })
        })
        .catch(() => {
          this.$message.error('已取消操作')
        })
    }
  }
}
</script>

<style></style>
