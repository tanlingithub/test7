<template>
  <div class="activity-effect-effect">
    <!-- 活动推送总流量 -->
    <div class="all margin-bottom">
      <div class="title-wrap margin-bottom">
        <div class="title">
          <div class="title-left"></div>
          <span class="title-word">活动推送总流量</span>
          <el-tooltip placement="top-start" width="50">
            <div slot="content">
              指标说明：<br />
              <p v-for="(item, index) in dec" :key="index">{{ item }}</p>
            </div>
            <i class="el-icon-question is-pointer title"></i>
          </el-tooltip>
        </div>
      </div>
      <el-row v-loading="dataLoading" class="all-wrap">
        <el-col
          :span="5"
          v-for="(item, index) in hspActivityCountAll"
          :key="index"
          class="all-item"
        >
          <p class="movement-num">{{ item.num || 0 }}</p>
          <p class="movement-name">{{ item.name }}</p>
          <p class="movement-average">
            历史平均<span class="margin-right">{{ item.name }}</span
            >{{ item.average }}
          </p>
          <p class="movement-scope">
            <span class="margin-right">同比</span>
            <span>{{ item.goUp ? '↑' : '↓' }}</span>
            {{ item.scope }}%
          </p>
          <p class="movement-proportion" v-if="item.proportion !== null">
            占总{{ item.name }}<span class="margin-right">比例</span
            >{{ item.proportion }}%
          </p>
        </el-col>
      </el-row>
    </div>
    <!-- 活动推送详情 -->
    <el-row class="sms">
      <div class="margin-bottom title-wrap">
        <div class="title">
          <div class="title-left"></div>
          <span class="title-word">活动推送详情</span>
        </div>
      </div>
      <div v-for="(item, index) in pushIds" :key="index">
        <active-detail
          :ref="'smsDetail' + item.id"
          :statisticsUrl="
            `${pushDataBigDatas}?pushId=${item.id}&pushType=${item.type}`
          "
          :detailTableUrl="
            `${listDataBigDatas}?pushId=${item.id}&pushType=${item.type}`
          "
          :type="item.type"
          v-loading="smsLoading"
        ></active-detail>
      </div>
    </el-row>
  </div>
</template>
<script>
import {
  hspActivityCountAll,
  hspActivityCountSmsData,
  hspActivityCountSms,
  hspActivityCountWechatData,
  hspActivityCountWechat,
  pushIdBigDatas,
  listDataBigDatas,
  pushDataBigDatas
} from '@/const/api'
import ActiveDetail from '@/container/data-analysis/active-detail'
import {hspActivityCountName, smsType, wechatType} from '@/const/analysis'

import {Tooltip} from 'element-ui'

export default {
  name: 'data-analysis-effect',
  data() {
    return {
      pushDataBigDatas,
      listDataBigDatas,
      pushIds: [],
      smsType,
      wechatType,
      dataLoading: false,
      smsLoading: false,
      wechatLoading: false,
      hspActivityCountAll: [],
      dec: [
        '1、活动推送总流量：访问/参加/分享通过公众号、短信、邮件等方式推送的活动链接的会员人数，通过群发方式的活动会有专属活动链接，用以统计和分析活动数据',
        '2、访问人数/参与人数/分享人数：是指访问/参与/分享专属活动链接页面的会员人数',
        '3、历史平均访问/参与/分享人数：是指访问/参与/分享同等类型（比如都是拼团活动）的专属活动链接页面的单次会员人数；同比则是当前值与历史平均值的比例关系'
      ],
      smsUrl: '',
      wechatUrl: '',
      smsData: {},
      wechatData: {}
    }
  },
  components: {
    'el-tooltip': Tooltip,
    ActiveDetail
  },
  computed: {
    accountId() {
      let nowActive = this.$store.state.active.nowActive
      return (nowActive && nowActive.id) || ''
    }
  },
  watch: {
    accountId(newData) {
      this.getInit()
    }
  },
  mounted() {
    this.getInit()
  },
  methods: {
    // 获取数据
    getInit() {
      if (!this.accountId) {
        return
      }
      this.getAll()
      this.getPushId()
    },
    //活动总流量
    getAll() {
      this.dataLoading = true
      this.$axios
        .$get(hspActivityCountAll(this.accountId))
        .then(res => {
          let hspActivityCountAll = res.payload
          for (let index in hspActivityCountAll) {
            hspActivityCountAll[index].name = hspActivityCountName[index]
          }
          this.hspActivityCountAll = hspActivityCountAll
        })
        .finally(() => {
          this.dataLoading = false
        })
    },
    getPushId() {
      this.$axios.$get(pushIdBigDatas(this.accountId)).then(res => {
        this.pushIds = res.payload || []
      })
    }
  }
}
</script>
<style lang="less">
.activity-effect-effect {
  color: #333;

  .el-col p {
    text-align: center;
    margin-bottom: 10px;
  }

  .el-tooltip p {
    width: 100px;
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

  .title-wrap {
    width: 100%;
    background: rgba(240, 240, 240, 1);
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
  }

  .movement-num {
    font-size: 40px;
    color: #2460c1;
  }

  .movement-name {
    color: #333333;
    font-size: 20px;
  }

  .movement-average,
  .movement-scope,
  .movement-proportion {
    color: #666666;
    font-size: 14px;
  }

  .blue {
    color: #2460c1;
  }

  .all-wrap {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
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

  .border-left {
    border-right: 1px solid lightgray;

    &:last-child {
      border-right: none;
    }
  }

  .all-item {
    height: 220px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    margin-right: 20px;

    &:last-child {
      margin-right: 0px;
    }
  }

  .is-pointer {
    cursor: pointer;
  }
}
</style>
