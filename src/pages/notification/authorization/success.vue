<template>
  <div class="auth-success">
    <i class="el-icon-success" size="24"></i>
    <p class="auth-success-text">授权成功</p>
    <el-button>返回上一页</el-button>
  </div>
</template>
<script>
import {authJumpBind} from '@/const/api'
export default {
  data() {
    return {}
  },
  computed: {
    authCode() {
      return this.$route.query.auth_code
    }
  },
  mounted() {
    if (this.authCode) this.bind()
  },
  methods: {
    bind() {
      this.$axios.$get(`${authJumpBind}?auth_code=${this.authCode}`)
    }
  }
}
</script>
<style lang="less">
.auth-success {
  padding: 50px 0;
  text-align: center;

  .el-icon-success {
    font-size: 80px;
    color: #2460c1;
  }

  &-text {
    margin: 16px 0;
    font-size: 16px;
  }
}
</style>
