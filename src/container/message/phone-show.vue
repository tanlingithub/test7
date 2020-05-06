<template>
  <div class="phone-main">
    <img src="@/assets/img/top.png" alt="" class="phone-top" />
    <div class="phone-middle">
      <p class="phone-middle-item">
        <span v-if="sign" class="message-sign">【{{ sign }}】</span
        ><span v-html="showContent"></span>
      </p>
    </div>
    <img src="@/assets/img/bottom.png" alt="" class="phone-bottom" />
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  props: {
    sign: {
      default: '',
      type: String
    },
    message: {
      default: '',
      type: String
    },
    url: {
      default: '',
      type: String
    }
  },
  computed: {
    showContent() {
      return this.url.length
        ? this.message.replace(
            this.url,
            `<a href='${this.url}'>${this.url}</a>`
          )
        : this.message
    }
  }
}
</script>
<style lang="less">
.phone-main {
  width: 250px;
  line-height: 0px;
  word-wrap: break-word;

  .phone-bottom,
  .phone-top {
    width: 100%;
  }

  .phone-middle {
    height: 220px;
    width: 100%;
    font-size: 10px;
    line-height: 20px;
    padding: 0px 25px;
    background-image: url('https://deepexi.oss-cn-shenzhen.aliyuncs.com/handshake-plan/console/middle.png');
    background-size: 100% 100%;
  }

  .message-sign {
    font-weight: bold;
    margin-right: 5px;
  }

  .phone-middle-item {
    height: 220px;
    width: 100%;
    overflow-y: scroll;
  }

  .url {
    color: blue;
    margin: 0px 5px;
  }
}
</style>
