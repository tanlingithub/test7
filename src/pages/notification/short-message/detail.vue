<template>
  <div class="message-detail">
    <el-data-table v-bind="tableConfig"></el-data-table>
    <p class="message-num-box">
      <span
        >待发送：<span class="num">{{ waitSend }}</span> </span
      ><span
        >发送成功：<span class="num">{{ sendSuccess }}</span></span
      >
      <span
        >发送失败：<span class="num">{{ sendFail }}</span></span
      >
    </p>
  </div>
</template>

<script>
import {messageDetail, messageNum} from '@/const/api'
export default {
  data() {
    return {
      waitSend: '',
      sendSuccess: '',
      sendFail: '',
      tableConfig: {
        url: messageDetail(this.$route.query.id),
        hasOperation: false,
        hasNew: false,
        columns: [
          {
            label: '会员账号',
            prop: 'name'
          },
          {
            label: '会员手机号',
            prop: 'mobile'
          },
          {
            label: '短信内容',
            prop: 'content'
          },
          {
            label: '状态',
            prop: 'state'
          },
          {
            label: '发送时间',
            prop: 'sendTime'
          }
        ],
        searchForm: [
          {
            $type: 'input',
            $id: 'mobile',
            label: '手机号',
            $el: {
              placeholder: '请输入'
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.getMessageNum()
  },
  methods: {
    getMessageNum() {
      this.$axios.get(messageNum).then(res => {
        this.waitSend = res.data.payload.waitSend
        this.sendSuccess = res.data.payload.sendSuccess
        this.sendFail = res.data.payload.sendFail
      })
    }
  }
}
</script>

<style lang="less" scoped>
.message-detail {
  height: 100%;
  position: relative;
  .message-num-box {
    position: absolute;
    bottom: 0;
    letter-spacing: 5px;
    font-size: 20px;
    display: flex;
    .num {
      color: blue;
      margin: 0 10px 0 2px;
    }
  }
}
</style>
