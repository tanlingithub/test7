<template>
  <div class="member-time-line">
    <div class="content-list">
      <div class="content-item" v-for="(item, index) in growList" :key="index">
        <div class="info-show" :style="dynamicStyle(index)">
          <p>{{ item.label }}</p>
          <p>{{ item.time }}</p>
        </div>
        <div class="line-item"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'member-time-line',
  components: {},
  props: {
    growList: {
      type: Array,
      default: () => [
        {
          label: '注册用户',
          time: '2018-12-12'
        },
        {
          label: '潜在用户',
          time: '2018-12-13'
        },
        {
          label: '意向用户',
          time: '2018-12-14'
        },
        {
          label: '待挖掘用户',
          time: '2018-12-15'
        },
        {
          label: '付费用户',
          time: '2018-12-16'
        },
        {
          label: '一般价值用户',
          time: '2018-12-16'
        },
        {
          label: '高价值用户',
          time: '2018-12-16'
        },
        {
          label: '尊贵用户',
          time: '2019-06-06'
        }
      ]
    }
  },
  computed: {
    dynamicStyle() {
      return n => {
        const isOdd = n % 2 !== 0
        return {
          [isOdd ? 'top' : 'bottom']: '1000%'
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.member-time-line {
  padding :80px 0;
  .content-list {
    display: flex;

    .content-item {
      flex: 1;
      position: relative;
      height: 2px;
      width: 100%;

      .info-show {
        position: absolute;
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: #333;
        font-weight: 500;
        cursor: pointer;
      }

      .line-item {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 2px;
        width: 100%;
        background: #87a8f4;

        &::after {
          content: '';
          display: block;
          height: 10px;
          width: 10px;
          border-radius: 50%;
          position: absolute;
          top: -100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2460c1;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
