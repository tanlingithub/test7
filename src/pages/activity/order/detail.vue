<template>
  <div class="activity-order-detail" v-loading="loading">
    <p class="order-message">
      <span
        class="order-code"
        v-for="(item, index) in tradeOrderMes"
        :key="index"
        >{{ item }}：{{ orderHead[index] }}</span
      >
    </p>
    <div class="info">
      <div class="buyer-info">
        <p class="info-title">买家信息：</p>
        <div class="head-image">
          <img :src="tradeOrder.memberHeadUrl" width="80px" height="80px" />
        </div>
        <p
          class="info-item"
          v-for="(item, index) in tradeOrderBuy"
          :key="index"
        >
          {{ item }}：{{ tradeOrder[index] }}
        </p>
        <!-- <p class="info-item">账号：{{ tradeOrder.memberId }}</p> -->
      </div>
      <div class="receiver-info">
        <p class="info-title">收货人信息：</p>
        <p class="info-item" v-for="(item, index) in addressList" :key="index">
          {{ item }}：{{ address[index] }}
        </p>
      </div>
      <div class="pay-info">
        <p class="info-title">支付信息：</p>
        <p class="info-item" v-for="(item, index) in payList" :key="index">
          {{ item }}：{{ payMain[index] }}
        </p>
      </div>
    </div>
    <el-table :data="tradeOrderSkus">
      <el-table-column label="商品图片">
        <template slot-scope="scope">
          <img :src="scope.row.imgUrl" width="100px" height="100px" />
        </template>
      </el-table-column>
      <el-table-column prop="itemName" label="商品名称"></el-table-column>
      <el-table-column
        v-for="(item, index) in tradeOrderSkusTable"
        :key="index"
        :label="item"
        :prop="index"
      >
      </el-table-column>
    </el-table>
    <div class="link-order-title-box">
      <div class="link-order-title">关联拼团订单</div>
    </div>
    <el-table :data="linkOrders">
      <el-table-column label="商品">
        <template slot-scope="scope">
          <img :src="scope.row.imgUrl" width="100px" height="100px" />
          <p>
            {{ scope.row.itemName }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="价格/数量" prop="priceMoneyQuantity">
      </el-table-column>
      <el-table-column label="收货信息">
        <template slot-scope="scope">
          <p v-for="(item, index) in addressList" :key="index">
            {{ scope.row.hspDeliveryAddress[index] }}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="payMoney" label="小计"></el-table-column>
      <el-table-column label="下单时间">
        <template slot-scope="scope">
          <p>
            {{
              formatDate(
                scope.row.hspOrderSummary.createdAt,
                'YYYY-MM-DD HH:mm:ss'
              )
            }}
          </p>
        </template>
      </el-table-column>
      <el-table-column
        prop="hspTradeOrder.id"
        label="订单编号"
      ></el-table-column>
      <el-table-column label="支付单号">
        <template slot-scope="scope">
          <p>
            {{
              scope.row.hspOrderPayments.length > 0
                ? scope.row.hspOrderPayments[0].payOrderNo
                : ''
            }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="订单状态">
        <template slot-scope="scope">
          <p>{{ ORDER_STATUS[scope.row.hspTradeOrder.activityStatus] }}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope" align="center">
          <el-button size="mini" @click="getList(scope.row.hspTradeOrder.id)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {orderListPageApi} from '@/const/api'
import {formatDate} from '@/const/filter'
import {
  tradeOrderMes,
  tradeOrderBuy,
  addressList,
  payList,
  tradeOrderSkusTable
} from '@/const/orderdetail'

const ORDER_STATUS = {
  ACTIVITY_COMPLETED: '已成团',
  ACTIVITY_TOBEPAID_TO_COMPLETE: '待成团', // 未支付待成团
  ACTIVITY_PAID_TO_COMPLETE: '待成团', // 已支付待成团
  ACTIVITY_CANNELLED: '已取消',
  '': '全部'
}
const MONEY = '0.00'
export default {
  name: 'order-detail',
  data() {
    return {
      tradeOrderSkusTable,
      tradeOrderMes,
      tradeOrderBuy,
      addressList,
      payList,
      formatDate,
      ORDER_STATUS,
      orderInfo: {},
      orderSummaryId: this.$route.query.orderSummaryId,
      status: ORDER_STATUS[this.$route.query.activityStatus],
      loading: false
    }
  },
  computed: {
    orderHead() {
      return {
        orderSummaryId: this.tradeOrder.id,
        status: ORDER_STATUS[this.tradeOrder.activityStatus]
      }
    },
    orderDetail() {
      return this.orderInfo.hspOrderSummary || {}
    },
    address() {
      return this.orderInfo.hspDeliveryAddress || {}
    },
    tradeOrder() {
      return this.orderInfo.hspTradeOrder || {}
    },
    tradeOrderSkus() {
      let hspTradeOrderSkus = this.orderInfo.hspTradeOrderSkus || []
      if (hspTradeOrderSkus.length <= 0) {
        return []
      }
      hspTradeOrderSkus.map(item => {
        return Object.assign(item, {
          priceMoney: item.priceMoney
            ? parseFloat(item.priceMoney).toFixed(2)
            : MONEY,
          activityMoney: item.activityMoney
            ? parseFloat(item.activityMoney).toFixed(2)
            : MONEY,
          payMoney: item.payMoney ? parseFloat(item.payMoney).toFixed(2) : MONEY
        })
      })
      return hspTradeOrderSkus
    },
    linkOrders() {
      let linkOrders = this.orderInfo.linkOrders || []
      linkOrders.map(item => {
        let itemHspTradeOrderSkus =
          item.hspTradeOrderSkus && item.hspTradeOrderSkus[0]
        return Object.assign(item, {
          imgUrl: itemHspTradeOrderSkus.imgUrl,
          payMoney: itemHspTradeOrderSkus.payMoney
            ? itemHspTradeOrderSkus.payMoney.toFixed(2)
            : MONEY,
          itemName: itemHspTradeOrderSkus.itemName,
          priceMoneyQuantity: `${itemHspTradeOrderSkus.priceMoney.toFixed(2)}/
            ${itemHspTradeOrderSkus.quantity}`
        })
      })
      return linkOrders
    },
    payMain() {
      let hspOrderPayments =
        (this.orderInfo.hspOrderPayments &&
          this.orderInfo.hspOrderPayments[0]) ||
        {}
      const {payOrderNo, payChannel, paidAt} = hspOrderPayments
      const {itemMoney, skuDiscountMoney, payMoney} = this.orderDetail || {}
      return {
        payOrderNo,
        payChannel,
        paidAt: formatDate(paidAt, 'YYYY-MM-DD'),
        activityMoney: itemMoney ? parseFloat(itemMoney).toFixed(2) : MONEY,
        // 初次为undefined, 数据存在0的情况
        skuDiscountMoney:
          skuDiscountMoney !== undefined
            ? parseFloat(skuDiscountMoney).toFixed(2)
            : MONEY,
        payMoney: payMoney ? parseFloat(payMoney).toFixed(2) : MONEY
      }
    }
  },
  methods: {
    getList(orderSummaryId) {
      if (!orderSummaryId) {
        return
      }
      this.loading = true
      this.$axios
        .get(`${orderListPageApi}/${orderSummaryId}`)
        .then(res => {
          this.orderInfo = res.data.payload || {}
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  mounted() {
    this.getList(this.$route.query.orderSummaryId)
  }
}
</script>

<style lang="less">
@THEME_COLOR: rgba(36, 96, 193, 1);

.CUBE {
  height: 20px;
  width: 4px;
  margin: 10px;
  background-color: @THEME_COLOR;
  text-indent: 20px;
  white-space: nowrap;
}

.activity-order-detail {
  font-size: 14px;

  .order-message {
    display: flex;
    font-weight: 500;

    .order-code,
    .order-status {
      flex-basis: 25%;
      font-weight: 500;
    }
  }

  .info {
    height: 280px;
    margin: 20px 0;
    display: flex;
    justify-content: space-between;
  }

  .buyer-info,
  .receiver-info,
  .pay-info {
    flex-basis: 30%;
    padding: 10px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);

    .info-title {
      .CUBE();
    }

    .head-image {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      background-color: gray;
      margin: 10px auto;
    }

    .info-item {
      line-height: 25px;
    }
  }

  .receiver-info,
  .pay-info {
    .info-item {
      padding-left: 10px;
    }
  }

  .link-order-title-box {
    background-color: rgba(240, 240, 240, 1);
    padding: 10px;

    .link-order-title {
      .CUBE();
    }
  }
}
</style>
