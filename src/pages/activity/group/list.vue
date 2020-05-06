<template>
  <div class="activity-group-list">
    <el-data-table v-bind="tableConfig" ref="dataTable"> </el-data-table>
    <el-dialog :visible.sync="shareVisible" title="活动分享">
      <el-input ref="httpInput" class="http-input" :value="shareUrl" />
      <el-button type="primary" @click="copy">复制</el-button>
      <div class="http-code">
        <v-qrcode :value="shareUrl"></v-qrcode>
        <span>微信扫码，立即分享</span>
      </div>
    </el-dialog>

    <!--预览-->
    <el-dialog
      class="dialog-preview"
      :visible.sync="dialogPreview.visible"
      width="460px"
      title="活动预览"
    >
      <iframe :src="dialogPreview.src"></iframe>
    </el-dialog>
  </div>
</template>

<script>
import {groupList, cancelGroupList, stopGroup} from '@/const/api'
import {ACTIVITY_STATUS} from '@/const/group'
import VQrcode from '@femessage/v-qrcode'
import {formatDate} from '@/const/filter'
const NOTSTARTED = 1
const INTHEEVENT = 2
const END = 3
const FAILURE = 4
const DRAFT = 0
// 预览活动基础路径
const previewBaseLink =
  ' http://cdn-dev.deepexi.com/handshake-plan-mobile/index.html#/goods-detail?type=isView'
export default {
  components: {VQrcode},
  data() {
    return {
      shareVisible: false,
      shareUrl: '',
      tableConfig: {
        url: groupList,
        hasNew: false,
        hasEdit: false,
        hasView: false,
        hasDelete: false,
        dataPath: 'payload.content',
        headerButtons: [
          {
            text: '新增',
            type: 'primary',
            atClick: () => {
              this.$router.push({
                path: `/activity/group/edit`,
                query: {isView: true}
              })
              return Promise.resolve(false)
            }
          }
        ],
        operationAttrs: {
          width: '250px',
          fixed: 'right'
        },
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '分享',
            type: 'primary',
            show: row => row.status == NOTSTARTED || row.status == INTHEEVENT,
            atClick: row => {
              this.shareUrl = `http://cdn-dev.deepexi.com/handshake-plan-mobile/index.html?auth=1&path=goods-detail&id=${
                row.id
              }`
              this.shareVisible = true
              return Promise.resolve(false)
            }
          },
          {
            text: '推送',
            show: row => row.status == NOTSTARTED || row.status == INTHEEVENT,
            atClick: () => {
              this.$router.push('/notification/official-accounts/edit')
              return Promise.resolve(false)
            }
          },
          {
            type: 'primary',
            text: '查看',
            show: row => row.status != DRAFT,
            atClick: row => {
              this.$router.push(`/activity/group/edit?id=${row.id}`)
              return Promise.resolve(false)
            }
          },
          {
            text: '编辑',
            show: row =>
              row.status == NOTSTARTED ||
              row.status == INTHEEVENT ||
              row.status == DRAFT,
            atClick: row => {
              this.$router.push({
                path: `/activity/group/edit?id=${row.id}`,
                query: {isView: true}
              })
              return Promise.resolve(false)
            }
          },
          {
            type: 'danger',
            text: '删除',
            show: row => row.status == NOTSTARTED || row.status == DRAFT,
            atClick: row => {
              this.deleteActivity(row)
              return Promise.resolve(false)
            }
          },
          {
            text: '停止',
            show: row => row.status == INTHEEVENT,
            atClick: row => {
              this.stopActivity(row)
              return Promise.resolve(false)
            }
          },
          {
            text: '预览',
            show: row => row.status != DRAFT,
            atClick: row => {
              this.dialogPreview.visible = true
              this.dialogPreview.src = this.dialogPreview.link + '&id=' + row.id
              return Promise.resolve(false)
            }
          }
        ],

        columns: [
          {
            prop: 'name',
            label: '拼团活动名称',
            minWidth: '125px'
          },
          {
            prop: 'productName',
            label: '商品名称',
            minWidth: '105px'
          },
          {
            prop: 'stockCount',
            label: '拼团商品库存',
            minWidth: '125px'
          },
          {
            prop: 'orderAmount',
            label: '订单实付金额',
            minWidth: '125px'
          },
          {
            prop: 'orderCount',
            label: '成团订单数',
            minWidth: '125px'
          },
          {
            prop: 'peopleCount',
            label: '成团人数',
            minWidth: '95px'
          },
          {
            prop: 'status',
            label: '状态',
            minWidth: '95px',
            formatter: row => ACTIVITY_STATUS[row.status]
          },
          {
            prop: 'startTime',
            label: '开始时间',
            minWidth: '95px',
            formatter: row =>
              row.startTime
                ? formatDate(row.startTime, 'YYYY-MM-DD HH:mm:ss')
                : ''
          },
          {
            prop: 'endTime',
            label: '结束时间',
            minWidth: '95px',
            formatter: row =>
              row.endTime ? formatDate(row.endTime, 'YYYY-MM-DD HH:mm:ss') : ''
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '活动名称',
            $el: {placeholder: '请输入'}
          },
          {
            $type: 'input',
            $id: 'productName',
            label: '商品名称',
            $el: {placeholder: '请输入'}
          },
          {
            $type: 'select',
            $id: 'status',
            label: '活动状态',
            $el: {placeholder: '全部'},
            $options: Object.keys(ACTIVITY_STATUS).map(v => {
              return {
                value: v,
                label: ACTIVITY_STATUS[v]
              }
            })
          },
          {
            $type: 'date-picker',
            $id: 'effectiveTime',
            label: '活动时间',
            $el: {
              type: 'daterange',
              'value-format': 'timestamp',
              'start-placeholder': '开始时间',
              'end-placeholder': '结束时间'
            },
            inputFormat: row => {
              return [row.effectiveTimeStart || '', row.effectiveTimeEnd || '']
            },
            outputFormat: val => {
              if (!val) {
                return {effectiveTimeStart: '', effectiveTimeEnd: ''}
              }
              return {
                start: val[0],
                end: val[1]
              }
            }
          }
        ]
      },
      // 预览弹框所需参数
      dialogPreview: {
        visible: false,
        link: previewBaseLink,
        src: ''
      }
    }
  },
  methods: {
    copy() {
      this.$refs.httpInput.select()
      document.execCommand('copy')
      this.$message.success('复制成功')
    },
    deleteActivity(row) {
      this.$confirm('您确认删除此活动吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$axios.$delete(cancelGroupList(row.id)).then(resp => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$refs.dataTable.getList()
          })
        })
        .catch(e => {})
    },
    stopActivity(row) {
      this.$confirm('您确认停止此活动吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$axios.$put(stopGroup(row.id)).then(resp => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.$refs.dataTable.getList()
          })
        })
        .catch(e => {})
    }
  }
}
</script>
<style lang="less">
.activity-group-list {
  .http-input {
    width: 80%;
    margin-right: 10px;
  }

  .http-code {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
  }

  .dialog-preview {
    .el-dialog__body {
      iframe {
        width: 100%;
        height: 900px;
      }
    }
  }
}
</style>
