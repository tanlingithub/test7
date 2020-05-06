<template>
  <div class="user-list">
    <el-upload
      ref="upload"
      hidden
      :before-upload="handleUpload"
      action="default"
    >
      <button ref="button" slot="trigger"></button>
    </el-upload>
    <el-data-table ref="memberTable" v-bind="tableConfig"> </el-data-table>
    <el-dialog :visible.sync="importVisible" title="批量导入会员">
      <h3>恭喜您，成功导入{{ importExcelObj.successNum }}条数据</h3>
      <p>
        导入失败{{ importExcelObj.failNum }}条数据，<span
          class="text-blue"
          @click="exportExcel(importExcelObj.vos)"
          >下载错误数据</span
        >
      </p>
    </el-dialog>
    <el-dialog :visible.sync="exportVisible" title="请输入导出的数据范围">
      <div class="content-pd">
        <label>日期：</label>
        <el-date-picker
          v-model="exportTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </div>
      <template slot="footer">
        <el-button @click="exportVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="exportExcel()"
          :loading="exportLoading"
          >确定</el-button
        >
      </template>
    </el-dialog>
    <el-dialog :visible.sync="importMethodVisible" title="批量导入会员">
      <el-button @click="downloadExcel">下载excel模版</el-button>
      <el-button type="primary" @click="$refs.button.click()"
        >直接导入</el-button
      >
    </el-dialog>
  </div>
</template>
<script>
import {
  memberSearchForm,
  importExcelKey,
  excelStencil,
  exportExcelStencil
} from '@/const/member'
import ExportExcel from '@/components/export-excel'
import {importExcel} from '@/components/import-excel'
import {
  memberList,
  disabledMember,
  enableMember,
  memberGroupList,
  importMember,
  exportMember
} from '@/const/api'
import {formatDate} from '@/const/filter'
import {Tag, Upload, DatePicker, Popover} from 'element-ui'

const ENABLE = '启用'
const DISABLE = '禁用'

export default {
  name: 'member-list',
  components: {
    'el-tag': Tag,
    'el-upload': Upload,
    'el-date-picker': DatePicker,
    'el-popover': Popover
  },
  data() {
    return {
      importVisible: false,
      importMethodVisible: false,
      importExcelObj: {},
      exportTime: '',
      exportVisible: false,
      exportLoading: false,
      tableConfig: {
        url: memberList,
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
            atClick: () => {
              this.$router.push('edit')
              return Promise.resolve(false)
            }
          },
          {
            text: '批量导入会员信息',
            atClick: () => {
              this.importMethodVisible = true
              return Promise.resolve(false)
            }
          },
          {
            text: '批量导出',
            atClick: () => {
              this.exportVisible = true
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
              this.confirm(enableMember(row.id))
              return Promise.resolve(false)
            }
          },
          {
            text: '禁用',
            show: row => row.state === ENABLE,
            atClick: row => {
              this.confirm(disabledMember(row.id))
              return Promise.resolve(false)
            }
          },
          {
            text: '删除',
            type: 'danger',
            show: row => row.state === DISABLE,
            atClick: row => {
              this.confirm(`${memberList}/${row.id}`, 'delete')
              return Promise.resolve(false)
            }
          }
        ],
        columns: [
          {prop: 'account', label: '会员账号'},
          {prop: 'mobile', label: '会员手机号', width: '150'},
          {
            prop: 'groups',
            label: '所属分组',
            width: '350',
            formatter: row => (
              <div>
                {row.groups
                  .filter((val, index) => index < 3)
                  .map((val, i) => {
                    return (
                      <el-tag key={i} class="mg-1">
                        {val}
                      </el-tag>
                    )
                  })}
                {(() => {
                  if (row.groups.length > 3)
                    return (
                      <el-popover trigger="hover">
                        {row.groups
                          .filter((val, index) => index > 3)
                          .map((val, i) => {
                            return (
                              <el-tag key={i} class="mg-1">
                                {val}
                              </el-tag>
                            )
                          })}
                        <span slot="reference">···</span>
                      </el-popover>
                    )
                })()}
              </div>
            )
          },
          {prop: 'state', label: '状态', width: '100'},
          {
            prop: 'createdAt',
            label: '注册时间',
            formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: memberSearchForm
      }
    }
  },
  mounted() {
    this.getMemberGroupList()
  },
  methods: {
    // 下载excel模版
    downloadExcel() {
      ExportExcel({
        columns: excelStencil,
        data: [],
        fileName: '会员模版'
      }).then(() => {
        this.$message.success('下载模版成功')
        this.importMethodVisible = false
      })
    },
    // 获取分组列表
    getMemberGroupList() {
      this.$axios.$get(`${memberGroupList}?size=999`).then(resp => {
        let groupData = resp.payload.content.map(val => {
          return {
            label: val.name,
            value: val.id
          }
        })

        this.$refs.memberTable.$refs.searchForm.setOptions('groupId', groupData)
      })
    },
    // 导出excel
    async exportExcel(list) {
      if (!this.exportTime && !list) {
        this.$message.warning('请选择时间区间')
        return
      }
      this.exportLoading = true
      try {
        if (!list) {
          var resp = await this.$axios.$get(
            `${exportMember}?beginDate=${this.exportTime[0].getTime()}&endDate=${this.exportTime[1].getTime()}`
          )
        }
        ExportExcel({
          columns: exportExcelStencil,
          data: list || resp.payload,
          fileName: '会员列表'
        }).then(() => {
          this.$message.success('导出成功')
          this.exportVisible = false
        })
      } catch (e) {
        console.log(e)
        this.$message.warning('操作失败')
      } finally {
        this.exportLoading = false
      }
    },
    // 导入excel
    handleUpload(file) {
      importExcel(file).then(({header, results}) => {
        let importList = results.map(val => {
          return Object.keys(importExcelKey).reduce((pred, cur) => {
            pred[cur] = val[importExcelKey[cur]]
            return pred
          }, {})
        })
        this.$axios.$post(importMember, importList).then(resp => {
          this.importExcelObj = resp.payload
          this.importVisible = true
        })
      })
      return false
    },
    confirm(id, method) {
      this.$confirm('确认当前操作吗', '提示', {
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            this.$axios[method || 'post'](id)
              .then(() => {
                this.$refs.memberTable.getList()
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
    }
  }
}
</script>
<style lang="less">
.user-list {
  .mg-1 {
    margin: 4px;
  }

  .text-blue {
    color: #409eff;
    cursor: pointer;
  }

  .content-pd {
    padding: 20px;
  }
}
</style>
