<template>
  <el-data-table v-bind="tableConfig" ref="listTable" class="coupon-list"></el-data-table>
</template>
<script>
import {couponsList, couponStop} from '@/const/api'
import {formatDate} from '@/const/filter'

const COUPONS_TYPE = {
  0: '代金券',
  1: '折扣券'
}
const COUPONS_SEND_TYPE = {
  0: '已取消',
  1: '已发送',
  2: '待发送',
  3: '草稿'
}
const COUPONS_KEY = {
  0: 'faceValue',
  1: 'discountValue'
}
const UNLIMIT = '0'
const ALL = '1'

export default {
  name: 'coupons-list',
  data() {
    return {
      tableConfig: {
        url: `${couponsList}/pages`,
        hasNew: false,
        hasEdit: false,
        hasDelete: false,
        operationAttrs: {width: '180px', fixed: 'right'},
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
        operationAttrs: {
          width: '200px',
          fixed: 'right'
        },
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '数据明细',
            type: 'primary',
            show: row => {
              return row.status == '1' || row.status == '0'
            },
            atClick: row => {
              this.toPage('detail', row.id)
              return Promise.resolve(false)
            }
          },
          {
            text: '编辑',
            type: 'primary',
            show: row => {
              return row.status == '3'
            },
            atClick: row => {
              //待处理
              this.toPage('edit', row.id)
              return Promise.resolve(false)
            }
          },
          {
            text: '停止',
            type: 'warning',
            show: row => {
              return row.status == '1'
            },
            atClick: row => {
              this.stopCoupon(row.id)
              return Promise.resolve(false)
            }
          },
          {
            text: '删除',
            type: 'danger',
            show: row => {
              return row.status == '3' || row.status == '0'
            },
            atClick: row => {
              this.deleteCoupon(row.id)
              return Promise.resolve(false)
            }
          }
        ],
        columns: [
          {prop: 'name', label: '优惠券名称', minWidth: 120},
          {
            prop: 'type',
            label: '优惠券类型',
            width: 100,
            formatter: row => COUPONS_TYPE[row.type]
          },
          {
            prop: 'faceValue',
            label: '面值/折扣',
            width: 100,
            formatter: row => row[COUPONS_KEY[row.type]]
          },
          {
            prop: 'useLimitAmountFlag',
            label: '使用条件',
            minWidth: 120,
            formatter: row => {
              return row.useLimitAmountFlag === UNLIMIT
                ? '无门槛'
                : `订单金额满${row.useLimitAmount}元`
            }
          },
          {
            prop: 'suitAbleProduct',
            label: '适用商品',
            width: 100,
            formatter: row => (row.suitableType === ALL ? '全部商品' : '-')
          },
          {
            prop: 'sendObject',
            label: '发放对象',
            width: 100,
            formatter: row => (row.sendType === ALL ? '全部对象' : '-')
          },
          {
            prop: 'status',
            label: '状态',
            width: 100,
            formatter: row => COUPONS_SEND_TYPE[row.status]
          },
          {
            prop: 'count',
            label: '券发放数量',
            width: 100,
            formatter: row => (
              <span
                onClick={this.toPage.bind(this, 'detail', row.id)}
                class="coupon-num"
              >
                {row.count}
              </span>
            )
          },
          {
            prop: 'hasUsedCount',
            label: '券使用数量',
            width: 100,
            formatter: row => (
              <span
                onClick={this.toPage.bind(this, 'detail', row.id)}
                class="coupon-num"
              >
                {row.hasUsedCount}
              </span>
            )
          },
          {
            prop: 'useLimitStartTime',
            label: '用券开始时间',
            minWidth: 120,
            formatter: row =>
              formatDate(row.useLimitStartTime, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'useLimitEndTime',
            label: '用券结束时间',
            minWidth: 120,
            formatter: row =>
              formatDate(row.useLimitEndTime, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'name',
            label: '优惠券名称',
            $el: {placeholder: '请输入'}
          },
          {
            $type: 'select',
            $id: 'type',
            label: '优惠券类型',
            $el: {placeholder: '全部'},
            $options: Object.keys(COUPONS_TYPE)
              .map(v => {
                return {
                  value: v,
                  label: COUPONS_TYPE[v]
                }
              })
              .concat([{value: '', label: '全部'}])
          },
          {
            $type: 'date-picker',
            $id: 'effectiveTime',
            label: '券使用时间',
            $el: {
              type: 'daterange',
              'value-format': 'timestamp',
              'start-placeholder': '开始时间',
              'end-placeholder': '结束时间'
            },
            inputFormat: row => {
              return [row.useLimitStartTime || '', row.useLimitEndTime || '']
            },
            outputFormat: val => {
              if (!val) {
                return {useLimitStartTime: '', useLimitEndTime: ''}
              }
              return {
                start: val[0],
                end: val[1]
              }
            }
          },
          {
            $type: 'select',
            $id: 'status',
            label: '优惠券状态',
            $el: {placeholder: '全部'},
            $options: Object.keys(COUPONS_SEND_TYPE)
              .map(v => {
                return {
                  value: v,
                  label: COUPONS_SEND_TYPE[v]
                }
              })
              .concat([{value: '', label: '全部'}])
          }
        ]
      }
    }
  },
  methods: {
    //删除优惠券
    deleteCoupon(id) {
      let message = '删除后，将无法查看该优惠券详情，确认删除吗？'
      let menthod = 'delete'
      let url = `${couponsList}/${id}`
      this.sureDialog(message, menthod, url)
    },
    //停止优惠券
    stopCoupon(id) {
      let message = '停止后，会员将无法使用该优惠券，您确认停止该优惠券使用吗？'
      let menthod = 'put'
      let url = couponStop(id)
      // this.sureDialog(message, menthod, url)
    },
    //确认弹框
    sureDialog(message, menthod, url) {
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            this.$axios[menthod](url).then(res => {
              done()
              instance.confirmButtonLoading = false
            })
          } else {
            done()
          }
        }
      }).then(() => {
        this.$message({
          type: 'info',
          message: '操作成功'
        })
        this.$refs.listTable.getList()
      })
    },
    //跳页
    toPage(type, id) {
      this.$router.push({path: type, query: {couponId: id}})
    }
  }
}
</script>
<style lang="less">
.coupon-list {
  .coupon-num {
    color: blue;
    cursor: pointer;
  }
}
</style>
