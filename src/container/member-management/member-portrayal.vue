<template>
  <div class="member-portrayal">
    <div class="member-portrayal-box">
      <img
        src="https://ss2.bdstatic.com/8_V1bjqh_Q23odCf/pacific/1864138948.jpg"
        alt
      />
      <div class="circle-box">
        <span
          v-for="(word, index) in tagList"
          :key="index"
          :style="dynamicStyle(index, true)"
        >
          <b :style="dynamicStyle(index, false)">{{ word }}</b>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
const RATIO_VALUE = 2.5
export default {
  name: 'member-portrayal',
  props: {
    tagList: {
      type: Array,
      required: true,
      validator: val => val.every(item => !!item.label && !!item.time)
    }
  },
  data() {
    return {
      innerSize: {width: '', height: ''}
    }
  },
  computed: {
    isSingle() {
      const n = this.tagList.length
      return n < 10
    },
    avrageRadian() {
      const n = this.tagList.length
      if (n == 0) return
      return this.isSingle ? 360 / n : (360 * 2) / n
    },
    middleIndex() {
      return Math.round(this.tagList.length / 2)
    },
    dynamicStyle() {
      return (n, isRevese = true) => {
        // 有待生成两个随机数
        const rotateR = n * this.avrageRadian
        const width_value =
          (n < this.middleIndex && !this.isSingle ? 35 : 70) +
          73 * Math.random()
        const height_value = parseInt(width_value / 3)
        const style = {
          transform: `rotate(${isRevese ? rotateR : -rotateR}deg)`,
          right:
            (this.isSingle ? 150 : n > this.middleIndex ? 220 : 150) + 'px',
          width: width_value + 'px',
          height: height_value + 'px',
          'line-height': height_value + 'px',
          'font-size': n < this.middleIndex && !this.isSingle ? '8px' : '14px'
        }
        isRevese && delete style['right']
        isRevese && delete style['height']
        isRevese && delete style['width']
        return style
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    generateRandom() {}
  }
}
</script>
<style lang="stylus">
.member-portrayal {
  text-align: center;
  height: 500px;

  &-box {
    position: relative;
    padding: 100px 0;

    .circle-box {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      > span {
        position: absolute;
        transform-origin: 0% 0%;

        b {
          position: absolute;
          padding: 5px;
          width: 100px;
          background: #86a7f2;
          color: white;
          border-radius: 4%;
          padding: 0;
          cursor: pointer;
        }
      }
    }

    img {
      width: 200px;
      border-radius: 50%;
      display: inline-block;
    }
  }
}
</style>
