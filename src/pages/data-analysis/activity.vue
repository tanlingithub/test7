<template>
  <div class="activity-effect-activity">
    <!-- 活动推送总流量 -->
    <div class="margin-bottom">
      <div class="flex-bettew title-wrap margin-bottom">
        <div class="title">
          <div class="title-left"></div>
          <span class="title-word">活动漏斗</span>
          <el-tooltip placement="top-start" width="50">
            <div slot="content">
              指标说明：<br />
              <p v-for="(item, index) in dec" :key="index">{{ item }}</p>
            </div>
            <i class="el-icon-question is-pointer title"></i>
          </el-tooltip>
        </div>
        <el-date-picker
          v-model="selectDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
        >
        </el-date-picker>
      </div>
      <el-row>
        <el-col :span="24" class="activenum-wrap" v-loading="activeNumLoading">
          <el-col
            v-for="(item, index) in activiName"
            :key="index"
            class="activenum"
          >
            <el-col :span="5" :class="'activenum-item ' + index">
              <div class="activenum-title">总{{ item }}人数</div>
              <div class="blue">
                {{ activeNum[index].allNum }}
              </div>
            </el-col>
            <el-col :span="5" :class="'activenum-item opacity-' + index">
              <div class="activenum-title">日均{{ item }}人数</div>
              <div>{{ activeNum[index].dayAverage }}</div>
            </el-col>
            <el-col :span="6" :class="'activenum-item opacity-' + index">
              <div class="activenum-title">
                与历史“日均{{ item }}”平均水平相比
              </div>
              <div>
                <img
                  :src="
                    require('@/assets/img/' +
                      (activeNum[index].goUp ? 'more' : 'reduce') +
                      '.png')
                  "
                  alt=""
                />
                {{ activeNum[index].scope }}%
              </div>
            </el-col>
            <el-col :span="1" :class="'opacity-' + index">
              <div class="img-middle">
                <div class="img-bg">
                  <img
                    class="img-bg-img"
                    :src="require('@/assets/img/' + index + '.png')"
                    alt=""
                  />
                </div>
                <div class="img-top">
                  <img src="@/assets/img/person.png" alt="" />
                  <span>{{ item }}人数</span>
                </div>
                <div :class="'img-arrow arrow-' + index">
                  <div class="img-arrow-wrap">
                    <img
                      :src="require('@/assets/img/arrow' + index + '.png')"
                      alt=""
                    />
                    <span v-if="index == 'lookNum'" class="word-lookNum"
                      >转化率：{{ activeNum.lookxjoin }}%</span
                    >
                    <span v-if="index == 'joinNum'"
                      >转化率：{{ activeNum.lookxshare }}%</span
                    >
                    <span v-if="index == 'shareNum'"
                      >转化率：{{ activeNum.joinxshare }}%</span
                    >
                  </div>
                </div>
              </div>
            </el-col>
          </el-col>
        </el-col>
      </el-row>
      <div v-loading="dataLoading" class="all-wrap">
        <div class="bg-color">
          <p>
            数据说明： 本次活动<span
              v-for="(item, index) in activiName"
              :key="index"
              >日均{{ item }}人数{{
                activeNum[index].goUp ? '高于' : '低于'
              }}历史平均水平，{{ activeNum[index].goUp ? '提高' : '下降'
              }}{{ activeNum[index].scope }}%
              <span v-if="index != 'shareNum'">，</span></span
            >
          </p>
          <p>
            营销说明：
            <span v-if="lookNumGoUp && !joinNumGoUp">
              建议增加对已访问人数的活动消息推送<span class="blue">(公众号</span
              >|<span class="blue">自动化营销短信)</span>，提高转化率
            </span>
            <span v-if="joinNumGoUp">
              您的活动参与人数良好，可以通过<span class="blue">(公众号</span
              >|<span class="blue">自动化营销短信)</span
              >，继续推送活动，提高覆盖率
            </span>
            <span v-if="!lookNumGoUp && !joinNumGoUp">
              目前活动效果较差，建议尝试(<span class="blue">(公众号</span>|<span
                class="blue"
                >自动化营销短信)</span
              >等方式推送活动，并跟踪推送效果
            </span>
          </p>
        </div>
      </div>
    </div>
    <!-- 活动参与群头画像 -->
    <el-row class="sms" v-loading="activePortrayLoading">
      <div class="margin-bottom title-wrap">
        <div class="title">
          <div class="title-left"></div>
          <span class="title-word">活动参与群体画像</span>
        </div>
      </div>
      <el-col>
        <el-checkbox-group v-model="selectGroups" class="margin-bottom">
          <el-checkbox
            v-for="(item, index) in groups"
            :label="item"
            :key="index"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
        <el-col
          v-for="(item, index) in showGroups"
          :key="index"
          span="11"
          class="echart-box"
        >
          <div class="button">
            <div>
              {{ item.name }}
            </div>
            <el-button @click="changeType(index)" v-if="item.type != 'address'"
              >切换类型</el-button
            >
          </div>
          <div class="changeAddress">
            <div
              @click="addressChange(item, 'reduce')"
              v-if="item.type == 'address'"
            >
              <i class="el-icon-arrow-left"></i>
            </div>
            <ve-chart
              :settings="item.settings"
              :legend-visible="false"
              :data="item"
              :extend="extend"
            ></ve-chart>
            <div
              @click="addressChange(item, 'add')"
              v-if="item.type == 'address'"
            >
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Vue from 'vue'
import 'v-charts/lib/style.css'
import {Tooltip, CheckboxGroup} from 'element-ui'
import VCharts from 'v-charts'

import {
  groupDataColumns,
  tagList,
  activiName,
  activeNumDefault
} from '@/const/analysis'
import {
  hspActivityCountActivity,
  portrayActive,
  portrayActiveTag,
  hspActivityCountBigDatasActivity,
  portrayActiveBigDatas
} from '@/const/api'
Vue.use(VCharts)

const HISTOGRAM = 'histogram' // 柱状
const PIE = 'pie' // 饼状
//图表最多显示数目
const MAX = 10
//图标向左按钮
const LEFT_REDUCE = 'reduce'
export default {
  name: 'data-analysis-effect',
  data() {
    return {
      itemData: [], //分页后数据
      allData: [], //拷贝的总数据
      addressMax: 0, //最大页数
      addressIndex: 0, //当前页数
      activiName,
      groupDataColumns,
      selectDate: [],
      showGroups: [],
      selectTag: [],
      activeNumLoading: false,
      activePortrayLoading: false,
      funnelSetting: {
        settings: {
          type: 'funnel',
          dataType: 'percent'
        },

        columns: ['key', 'value'],
        rows: [
          {key: '访问人数转化率', value: '0.8'},
          {key: '参与人数转化率', value: '0.9'},
          {key: '分享人数转化率', value: '0.9'}
        ],
        loading: true,
        dataEmpty: true
      },
      groups: tagList,
      dataLoading: false,
      selectGroups: [],
      activeNum: activeNumDefault,
      dec: [
        '1、总访问人数：打开某活动链接页面的人数，包含通过活动推送和非活动推送两部分',
        '2、总参与人数：参与并完成某个活动人数',
        '3、总分享人数：通过微信、小程序、H5等应用渠道分享给好友的人数',
        '4、日均访问人数 = 总访问人数/活动天数',
        '5、日均参与人数 = 总参与人数/活动天数',
        '6、日均分享人数 = 总分享人数/活动天数',
        '7、与历史平均水平相比：是指将当前日均数据（如日均访问人数）与历史日均数据（不含当前日均数据）相比的值'
      ],
      // 图表扩展配置
      extend: {
        series: {
          label: {show: true, position: 'top'}
        },
        barWidth: 20
      }
    }
  },
  components: {
    'el-tooltip': Tooltip,
    'el-checkbox-group': CheckboxGroup
  },
  watch: {
    //群体画像选择改变
    selectGroups(newData) {
      this.selectTag = newData.map(group => {
        return {
          id: group.id,
          name: group.name
        }
      })
      this.getPortray()
    },
    //日期改变
    selectDate(newData) {
      this.getInit()
    },
    //活动改变
    accountId() {
      this.getInit()
    }
  },
  computed: {
    accountId() {
      let nowActive = this.$store.state.active.nowActive
      return (nowActive && nowActive.id) || ''
    },
    lookNumGoUp() {
      return this.activeNum['lookNum'] && this.activeNum['lookNum'].goUp
    },
    joinNumGoUp() {
      return this.activeNum['joinNum'] && this.activeNum['joinNum'].goUp
    },
    startDate() {
      return this.selectDate[0] || this.$store.state.active.nowActive.startTime
    },
    endDate() {
      return this.selectDate[1] || this.$store.state.active.nowActive.endTime
    }
  },
  mounted() {
    this.getInit()
  },
  methods: {
    getInit() {
      this.getActivity()
      //处理显示标签
      this.getTags()
    },
    getActivity() {
      if (!this.accountId) {
        return
      }
      this.activeNumLoading = true
      this.$axios
        .$get(hspActivityCountBigDatasActivity(this.accountId), {
          params: {
            startDate:
              this.startDate || new Date().getTime() - 24 * 60 * 60 * 1000,
            endDate: this.endDate || new Date().getTime()
          }
        })
        .then(res => {
          //处理数据为null的情况
          this.activeNum = res.payload
            ? this.activeNumInit(res.payload)
            : activeNumDefault
        })
        .finally(() => {
          this.activeNumLoading = false
        })
    },
    //处理返回参数
    activeNumInit(data) {
      Object.keys(data).forEach(portrayItem => {
        if (!data[portrayItem]) {
          data[portrayItem] = activeNumDefault[portrayItem]
        }
      })
      return data
    },
    getPortray() {
      if (!this.accountId) {
        return
      }
      this.activePortrayLoading = true
      let startDate =
        this.startDate || new Date().getTime() - 24 * 60 * 60 * 1000
      let endDate = this.endDate || new Date().getTime()
      this.$axios
        .$post(
          `${portrayActiveBigDatas(
            this.accountId
          )}?startDate=${startDate}&endDate=${endDate}`,
          this.selectTag
        )
        .then(res => {
          let portray = res.payload || {}
          this.showGroups = this.handlePortray(portray)
        })
        .finally(() => {
          this.activePortrayLoading = false
        })
    },
    getTags() {
      if (!this.accountId) {
        return
      }
      this.$axios
        .$get(portrayActiveTag(this.accountId), {
          params: {
            startDate:
              this.startDate || new Date().getTime() - 24 * 60 * 60 * 1000,
            endDate: this.endDate || new Date().getTime()
          }
        })
        .then(res => {
          //处理显示标签
          this.groups = res.payload.map(groupsItem => {
            return Object.assign(
              {
                label: groupsItem.name,
                key: groupsItem.id
              },
              groupsItem
            )
          })
        })
    },
    changeType(index) {
      this.showGroups[index].settings.type =
        this.showGroups[index].settings.type === HISTOGRAM ? PIE : HISTOGRAM
    },
    handlePortray(data) {
      let portrayData = data.map(item => {
        return {
          type: item.labels.length > MAX ? 'address' : '',
          name: item.tagname,
          id: item.tagid,
          settings: {
            type: 'histogram'
          },
          columns: ['key', 'value'],
          rows:
            item.labels.length > MAX
              ? this.addressData(item.labels)[0]
              : item.labels
        }
      })
      return portrayData
    }
  },
  //处理地址展示
  addressData(data) {
    //拷贝总的地区数据
    let allData = data.concat([])
    this.allData = allData
    let itemData = []
    //分割
    for (let i = 0; i < allData.length; i += MAX) {
      itemData.push(allData.slice(i, i + MAX))
    }
    this.addressMax = itemData.length - 1
    this.itemData = itemData
    return itemData
  },
  //切换地址
  addressChange(data, type) {
    if (type == LEFT_REDUCE) {
      this.addressIndex = this.addressIndex - 1 > 0 ? this.addressIndex - 1 : 0
    } else {
      this.addressIndex =
        this.addressIndex + 1 > this.addressMax
          ? this.addressMax
          : this.addressIndex + 1
    }
    data.rows = this.itemData[this.addressIndex]
  }
}
</script>
<style lang="less">
.activity-effect-activity {
  color: #333333;

  .changeAddress {
    display: flex;
    align-items: center;
  }

  .el-icon-arrow-left,
  .el-icon-arrow-right {
    font-size: 20px;
  }

  .button {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .el-col p {
    text-align: center;
    margin-bottom: 10px;
  }

  .opacity {
    opacity: 0.2;
  }

  .activenum-item {
    height: 100px;
    padding: 20px 50px 20px 50px;
    margin-bottom: 10px;
  }

  .lookNum {
    background-color: #ccdfff;
  }

  .joinNum {
    background-color: #dbe4ff;
  }

  .shareNum {
    background-color: #ddf4ff;
  }

  .opacity-lookNum {
    background: rgba(204, 223, 255, 0.2);
  }

  .opacity-joinNum {
    background: rgba(219, 228, 255, 0.2);
  }

  .opacity-shareNum {
    background: rgba(221, 244, 255, 0.2);
  }

  .arrow-lookNum {
    position: absolute;
    left: 60px;
    top: 50px;

    img {
      width: 120px;
      height: 250px;
    }
  }

  .arrow-joinNum {
    position: absolute;
    left: 45px;
    top: -50px;

    img {
      width: 60px;
      height: 100px;
    }
  }

  .arrow-shareNum {
    position: absolute;
    left: 45px;
    top: -60px;

    img {
      width: 60px;
      height: 100px;
    }
  }

  .img-arrow-wrap {
    span {
      position: absolute;
      left: 100px;
    }

    .word-lookNum {
      top: 80px;
      left: 150px;
    }
  }

  .el-tooltip p {
    width: 100px;
  }

  .flex-bettew {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .title {
    font-size: 14px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  .title-word {
    margin-left: 10px;
    margin-right: 10px;
  }

  .title-left {
    background-color: #2460c1;
    height: 20px;
    width: 4px;
  }

  .img-relative {
    position: relative;
  }

  .img-middle {
    width: 150px;
    height: 100px;
    line-height: 100px;
    position: relative;
  }

  .img-bg {
    width: 150px;
    text-align: center;
    position: absolute;
    z-index: 22;
  }

  .img-top {
    width: 150px;
    color: #ffffff;
    text-align: center;
    position: absolute;
    z-index: 999;
  }

  .img-arrow {
    width: 250px;
    color: #333;
    text-align: center;
    position: absolute;
  }

  .title-wrap {
    width: 100%;
    background: rgba(240, 240, 240, 1);
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
  }

  .blue {
    color: #2460c1;
  }

  .margin-bottom {
    margin-bottom: 20px;
  }

  .margin-right {
    margin-right: 20px;
  }

  .bg-color {
    background-color: rgba(248, 248, 248, 1);
    padding: 20px;
  }

  .activenum-title {
    color: #333;
    margin-bottom: 20px;
  }

  .echart-box {
    margin: 20px 40px 20px 0px;
    padding: 20px 20px 0 20px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .is-pointer {
    cursor: pointer;
  }
}
</style>
