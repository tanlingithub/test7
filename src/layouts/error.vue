<template>
  <transition name="page">
    <div class="container" v-show="showPage">
      <el-row>
        <el-col :sm="24" :md="12">
          <img
            class="error-img"
            src="https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg"
          />
        </el-col>
        <el-col :sm="24" :md="6">
          <h1 class="code">
            {{ statusCode }}
          </h1>
          <div class="sub-text">
            抱歉，你访问的页面不存在
          </div>
          <el-button type="primary" class="to-home" @click="$router.back()">
            返回上一页
          </el-button>
        </el-col>
      </el-row>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    statusCode() {
      return this.error.statusCode
    }
  },
  data() {
    return {
      showPage: false
    }
  },
  mounted() {
    // 解决不同layout的路由过渡问题
    setTimeout(() => {
      this.showPage = true
    }, 350)
  }
}
</script>
<style lang="stylus">
.container {
  padding: 180px 0 0;
  user-select: none;

  .error-img {
    max-width: 100%;
    float: right;
  }

  .code {
    font-size: 80px;
    font-weight: 400;
    text-align: center;
    margin-top: 50px;
  }

  .sub-text {
    margin-bottom: 16px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 20px;
    line-height: 28px;
    text-align: center;
  }

  .to-home {
    margin: 0 auto;
    display: block;

    a {
      color: #fff;
    }
  }
}
</style>
