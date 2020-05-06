<template>
  <div class="accounts-list">
    <div class="head-button">
      <el-button type="primary" @click="routerToBound">绑定公众号</el-button>
      <span>绑定公众号后，即可群发活动消息</span>
    </div>
    <div class="accounts">
      <div class="accout-box" v-for="(item, index) in accounts" :key="index">
        <div class="image">
          <img src width="100px" alt />
        </div>
        <div class="message">
          <p>
            公众号昵称：{{ item.nickName }}
            <el-button type="text" @click="removeBound(item.id)"
              >解除授权</el-button
            >
          </p>
          <p>公众微信号：{{ item.wechatNumber }}</p>
          <p>公众号类型：认证服务号</p>
          <p>主体信息：{{ item.info }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {accountsList, accountsBound, autoToPage} from '@/const/api'

const REDIRECT_URL =
  'http://cdn-dev.deepexi.com/handshake-plan-console/index.html#/notification/authorization/success'

export default {
  data() {
    return {
      accounts: []
    }
  },
  mounted() {
    this.getAccountsList()
  },
  methods: {
    getAccountsList() {
      this.$axios.get(accountsList).then(res => {
        this.accounts = res.data.payload
      })
    },
    routerToBound() {
      this.$axios
        .$get(autoToPage(encodeURIComponent(REDIRECT_URL)))
        .then(resp => {
          location.href = resp
        })
    },
    //解除绑定
    removeBound(id) {
      this.$confirm('确认当前操作吗', '提示', {
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            this.$axios
              .delete(accountsBound(id))
              .then(() => {
                this.$message.success('解绑成功')
                this.getAccountsList()
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

<style lang="less" scoped>
.accounts-list {
  font-size: 15px;

  .head-button {
    width: 40%;
    line-height: 30px;
    display: flex;
    justify-content: space-around;
    color: #ccc;
  }

  .accounts {
    display: flex;
    flex-wrap: wrap;
  }

  .accout-box {
    position: relative;
    width: 30%;
    display: flex;
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 1px 1px 1px #ccc;
    align-items: center;
  }

  .message {
    width: 70%;
    margin-left: 20px;
    line-height: 35px;
  }

  .image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #ccc;
  }
}
</style>
