<template>
  <div class="coupons-detail">
    <p class="coupons-num-box" v-loading="numLoading">
      <span
        >发放数量：<span class="num">{{ numData.total }}</span> </span
      ><span class="canclick" @click="changeList('1')"
        >已使用：<span class="num">{{ numData.use }}</span></span
      >
      <span class="canclick" @click="changeList('0')"
        >未使用：<span class="num">{{ numData.unUse }}</span></span
      >
    </p>
    <el-data-table v-bind="tableConfig" :url="tableUrl"></el-data-table>
  </div>
</template>
<script>
import {couponsDetailList, couponsDetailNum} from '@/const/api'
import {formatDate} from '@/const/filter'

const COUPONS_TYPE = {
  '0': '未使用',
  '1': '已使用',
  '2': '已失效',
  '3': '已过期',
  '4': '使用中'
}

export default {
  name: 'coupons-detail',
  data() {
    return {
      tableUrl: '',
      numData: {
        total: '',
        use: '',
        unUse: ''
      },
      numLoading: false,
      tableConfig: {
        hasNew: false,
        hasEdit: false,
        hasDelete: false,
        hasOperation: false,
        tableAttrs: {border: true},
        extraButtons: [],
        columns: [
          {prop: 'memberId', label: '会员账号'},
          {
            prop: 'memberPhone',
            label: '会员手机号'
          },
          {
            prop: 'couponName',
            label: '优惠券名称'
          },
          {
            prop: 'orderNumber',
            label: '关联订单号',
            formatter: row => (
              <span
                onClick={this.toOrder.bind(this, row.orderNumber, row.status)}
                class="coupon-num"
              >
                {row.orderNumber}
              </span>
            )
          },
          {
            prop: 'status',
            label: '状态',
            formatter: row => COUPONS_TYPE[row.status]
          },
          {
            prop: 'hasUsedTime',
            label: '使用时间',
            formatter: row => formatDate(row.hasUsedTime, 'YYYY-MM-DD HH:mm:ss')
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'memberPhone',
            label: '会员手机号',
            $el: {placeholder: '请输入'}
          }
        ]
      }
    }
  },
  computed: {
    couponId() {
      return this.$route.query.couponId
    }
  },
  mounted() {
    this.getList(this.$route.query.couponId)
    this.getNum(this.$route.query.couponId)
  },
  methods: {
    getList(couponId) {
      this.tableUrl = `${couponsDetailList}?couponId=${couponId}`
    },
    getNum(couponId) {
      this.numLoading = true
      this.$axios
        .get(`${couponsDetailNum}?couponId=${couponId}`)
        .then(res => {
          this.numData = res.data.payload || {}
        })
        .finally(() => {
          this.numLoading = false
        })
    },
    changeList(status) {
      this.tableUrl = `${couponsDetailList}?couponId=${
        this.couponId
      }&status=${status}`
    },
    toOrder(id, status) {
      if (!id) {
        return
      }
      this.$router.push({
        path: '/activity/order/detail',
        query: {
          orderSummaryId: id,
          activityStatus: status
        }
      })
    }
  }
}
</script>
<style lang="less">
.coupons-detail {
  .coupons-num-box {
    margin-bottom: 20px;

    .num {
      color: blue;
      margin: 0 10px 0 2px;
    }
  }

  .coupon-num {
    color: blue;
    cursor: pointer;
  }

  .canclick {
    cursor: pointer;
  }
}
</style>
