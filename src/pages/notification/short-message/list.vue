<template>
  <el-data-table v-bind="tableConfig"> </el-data-table>
</template>

<script>
import {formatDate} from '@/const/filter'
import {messageList, messageCancelSend} from '@/const/api'
const SEND_STATE = {
  prepare: '待发送',
  sending: '发送中',
  over: '发送完成',
  canceled: '已取消'
}

const addNewPath = 'add'
export default {
  components: {},
  data() {
    return {
      sendTime: '',
      tableConfig: {
        url: messageList,
        hasEdit: false,
        hasDelete: false,
        hasNew: false,
        headerButtons: [
          {
            text: '新增普通短信',
            type: 'primary',
            atClick: () => {
              this.$router.push('add-normal')
              return Promise.resolve(false)
            }
          },
          {
            text: '新增营销短信',
            type: 'primary',
            atClick: () => {
              this.$router.push('add')
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
              this.$router.push({
                path: 'detail',
                query: {
                  id: row.id
                }
              })
              return Promise.resolve(false)
            }
          },
          {
            text: '取消发送',
            type: 'text',
            show: row => row.state == SEND_STATE.prepare,
            atClick: async row => {
              let result = await this.cancelSend(row.id)
              return Promise.resolve(result)
            }
          },
          {
            text: '删除',
            type: 'text',
            show: row => row.state == SEND_STATE.canceled
          }
        ],
        operationAttrs: {
          minWidth: '120px'
        },
        columns: [
          {
            label: '短信内容',
            prop: 'content',
            minWidth: '400px'
          },
          {
            label: '状态',
            prop: 'state'
          },
          {
            label: '发送人数',
            prop: 'sendPersonNum'
          },
          {
            label: '成功条数',
            prop: 'sendSuccess'
          },
          {
            label: '失败条数',
            prop: 'sendFail'
          },
          {
            label: '短信类型',
            prop: 'type'
          },
          {
            label: '发送时间',
            minWidth: '150px',
            formatter: row => formatDate(row.sendTime, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'date-picker',
            $id: 'sendTime',
            label: '发送时间',
            $el: {
              valueFormat: 'timestamp',
              type: 'datetimerange'
            },
            //传两个时间戳
            outputFormat: sendTime => {
              if (!sendTime) return
              return {beginDate: sendTime[0], endDate: sendTime[1]}
            }
          },
          {
            $type: 'select',
            $id: 'state',
            label: '状态',
            $options: Object.keys(SEND_STATE).map(el => {
              return {
                label: SEND_STATE[el],
                value: SEND_STATE[el]
              }
            })
          }
        ]
      }
    }
  },
  methods: {
    // 取消发送
    async cancelSend(id) {
      let result = await this.$axios.$delete(messageCancelSend(id))
      if (result.code == '0') {
        this.$message.success('已取消发送')
        return true
      }
      this.$message.warning(result.msg)
      return false
    }
  }
}
</script>

<style></style>
