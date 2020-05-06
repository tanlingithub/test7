<template>
  <el-data-table ref="dataTable" v-bind="tableConfig"></el-data-table>
</template>

<script>
import axios from 'axios'
import {formatDate} from '@/const/filter'
import {orderListPageApi} from '@/const/api'
const ORDER_STATUS = {
  ACTIVITY_COMPLETED: '已成团',
  ACTIVITY_TOBEPAID_TO_COMPLETE: '待成团', // 未支付待成团
  ACTIVITY_PAID_TO_COMPLETE: '待成团', // 已支付待成团
  ACTIVITY_CANNELLED: '已取消',
  '': '全部'
}
const ORDER_STATUS_SEARCH = {
  ACTIVITY_COMPLETED: '已成团',
  'ACTIVITY_TOBEPAID_TO_COMPLETE,ACTIVITY_PAID_TO_COMPLETE': '待成团',
  ACTIVITY_CANNELLED: '已取消',
  '': '全部'
}
export default {
  data() {
    return {
      tableConfig: {
        url: orderListPageApi,
        hasDelete: false,
        hasView: false,
        hasEdit: false,
        hasNew: false,
        tableAttrs: {border: true},
        extraButtons: [
          {
            text: '详情',
            atClick: row => {
              this.$router.push({
                path: 'detail',
                query: {
                  orderSummaryId: row.hspTradeOrder.id,
                  activityStatus: row.hspTradeOrder.activityStatus
                }
              })
              return Promise.resolve(false)
            }
          }
        ],
        columns: [
          {
            label: '商品图片',
            width: 120,
            formatter: row => (
              <img width="100px" src={row.hspTradeOrderSkus[0].imgUrl} />
            )
          },
          {
            label: '商品',
            //对象拼团商品为一个数组，但由于当前拼团只可拼一件商品，所以取拼团商品的第一位
            formatter: row => row.hspTradeOrderSkus[0].itemName
          },
          {
            label: '单价/数量',
            width: 90,
            formatter: row =>
              `${row.hspTradeOrderSkus[0].priceMoney}/${
                row.hspTradeOrderSkus[0].quantity
              }`
          },
          {
            label: '收货信息',
            formatter: row =>
              `${row.hspDeliveryAddress.receiverName}${
                row.hspDeliveryAddress.receiverPhone
              }${row.hspDeliveryAddress.detailAddress}`
          },
          {
            label: '下单时间',
            formatter: row =>
              formatDate(row.hspOrderSummary.createdAt, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'hspOrderSummary.payOrderNo',
            label: '支付单号',
            formatter: row => row.hspOrderSummary.payOrderNo || '-'
          },
          {
            prop: 'hspTradeOrder.id',
            label: '订单编号'
          },
          {
            prop: 'hspTradeOrder.activityId',
            label: '团活动编号',
            width: 110
          },
          {
            prop: 'hspOrderSummary.payMoney',
            label: '实付金额',
            formatter: row => row.hspOrderSummary.payMoney.toFixed(2)
          },
          {
            label: '订单状态',
            formatter: row => ORDER_STATUS[row.hspTradeOrder.activityStatus]
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'id',
            label: '订单编号',
            $el: {
              placeholder: '请输入'
            }
          },
          {
            $type: 'input',
            $id: 'memberPhone',
            label: '手机号',
            $el: {
              placeholder: '请手机号'
            }
          },
          {
            $type: 'select',
            $id: 'activityStatus',
            label: '订单状态',
            $el: {
              placeholder: '请选择'
            },
            $options: Object.keys(ORDER_STATUS_SEARCH).map(el => {
              return {
                label: ORDER_STATUS_SEARCH[el],
                value: `${el}`
              }
            })
          }
        ]
      }
    }
  }
}
</script>

<style></style>
