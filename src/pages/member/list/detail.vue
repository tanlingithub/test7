<template>
  <div class="member-detail" v-loading="isLoading">
    <!-- 会员基本信息 -->
    <el-row>
      <el-col :span="7" class="member-detail-basicinfo">
        <img class="basicinfo-img" :src="memberInfoData.headImg" />
        <div>
          <p>
            <i class="basicinfo-icon el-icon-view"></i>昵称：{{
              memberInfoData.nickName
            }}
          </p>
          <p>
            <i class="basicinfo-icon el-icon-news"></i>账号：{{
              memberInfoData.account
            }}
          </p>
          <p>
            <i class="basicinfo-icon el-icon-mobile-phone"></i>手机:
            {{ memberInfoData.mobile }}
          </p>
        </div>
      </el-col>
      <el-col :span="17" class="member-detail-info">
        <h4 class="info-cell">会员信息</h4>
        <el-row>
          <el-col
            v-for="(item, index) in infoCell"
            :key="index"
            :span="12"
            class="info-cell"
            >{{ item.label }}：{{
              (item.formatter && item.formatter(memberInfoData)) ||
                memberInfoData[item.key]
            }}</el-col
          >
        </el-row>
      </el-col>
    </el-row>

    <!-- 用户操作记录 -->
    <el-row class="member-detail-record">
      <el-col :span="5">
        <p class="record-num">{{ dataMember.pushNum || 0 }}</p>
        <p>推送次数</p>
      </el-col>
      <el-col :span="5">
        <p class="record-num">{{ dataMember.lookActivityNum || 0 }}</p>
        <p>浏览活动次数</p>
      </el-col>
      <el-col :span="5">
        <p class="record-num">{{ dataMember.joinActivityNum || 0 }}</p>
        <p>参与活动次数</p>
      </el-col>
      <el-col :span="5">
        <p class="record-num">{{ dataMember.moneyNum || 0 }}</p>
        <p>付费金额</p>
      </el-col>
      <el-col :span="4">
        <p class="record-num">{{ dataMember.shareNum || 0 }}</p>
        <p>分享次数</p>
      </el-col>
    </el-row>

    <!-- 成长轨迹 -->
    <p class="member-detail-bartitle">成长轨迹</p>
    <el-steps v-if="!!memberTrace.length" :active="2" align-center>
      <el-step
        v-for="item in memberTrace"
        :key="item.groupId"
        :title="item.groupName"
        :description="formatDate(item.createAt, 'YYYY-MM-DD HH:mm:ss')"
      ></el-step>
    </el-steps>
    <p v-else>暂无会员轨迹</p>

    <!-- 标签地图 -->
    <p class="member-detail-bartitle">标签地图</p>
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane
        v-for="(val, index) in tabType"
        :key="index"
        :label="val.name"
        :name="val.id"
      >
        <div
          class="tag-content"
          v-if="!!memberTag.length"
          v-loading="tagLoading"
        >
          <div class="column">
            <el-tag
              v-for="(val, index) in memberTag"
              :key="index"
              v-if="index % 2 === 1"
              >{{ val.tagName }}</el-tag
            >
          </div>
          <img
            src="//deepexi-moby.oss-cn-shenzhen.aliyuncs.com/Fill 1-1552413059580.png"
            alt=""
          />
          <div class="column">
            <el-tag
              v-for="(val, index) in memberTag"
              :key="index"
              v-if="index % 2 === 0"
              >{{ val.tagName }}</el-tag
            >
          </div>
        </div>
        <div v-else>暂无标签地图</div>
      </el-tab-pane>
    </el-tabs>

    <!-- 业务信息 -->
    <p class="member-detail-bartitle">业务信息</p>
    <el-tabs v-model="businessTab">
      <el-tab-pane label="活动记录" name="1">
        <el-data-table v-bind="tableConfig"></el-data-table>
      </el-tab-pane>
      <el-tab-pane label="分享记录" name="2">
        <el-data-table v-bind="shareTable"></el-data-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {infoCell} from '@/const/member'
import {
  memberInfo,
  memberTraceApi,
  memberCount,
  memberShareList,
  activityDataList,
  tagTypeList,
  dataMember,
  firstTag,
  tagMap
} from '@/const/api'
import {formatDate} from '@/const/filter'
import {Steps, Step, Tabs, TabPane, Tag} from 'element-ui'

export default {
  name: 'member-detail',
  components: {
    'el-steps': Steps,
    'el-step': Step,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-tag': Tag
  },
  data() {
    return {
      infoCell,
      memberInfoData: {},
      memberTrace: [],
      memberCount: {},
      formatDate,
      tableConfig: {
        url: '',
        hasOperation: false,
        hasNew: false,
        hasDelete: false,
        columns: [
          {prop: 'name', label: '活动名称'},
          {prop: 'type', label: '活动类型'},
          {
            prop: 'pushDate',
            label: '推送时间',
            formatter: row => formatDate(row.pushDate, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'lookDate',
            label: '浏览时间',
            formatter: row => formatDate(row.lookDate, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'joinDate',
            label: '参与时间',
            formatter: row => formatDate(row.joinDate, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'paymentDate',
            label: '付款时间',
            formatter: row => formatDate(row.paymentDate, 'YYYY-MM-DD HH:mm:ss')
          },
          {
            prop: 'shareDate',
            label: '分享时间',
            formatter: row => formatDate(row.shareDate, 'YYYY-MM-DD HH:mm:ss')
          }
        ]
      },
      shareTable: {
        url: '',
        hasOperation: false,
        hasNew: false,
        hasDelete: false,
        columns: [
          {prop: 'title', label: '分享标题'},
          {prop: 'type', label: '分享类型'},
          {prop: 'channel', label: '分享渠道'},
          {prop: 'shareNum', label: '分享次数'},
          {prop: 'beShareNum', label: '被分享次数'},
          {prop: 'browseNum', label: '带来浏览量'},
          {prop: 'registerNum', label: '带来注册会员数'},
          {prop: 'paidMemberNum', label: '带来付费会员数'}
        ]
      },
      isLoading: false,
      tagLoading: false,
      activeTab: '1',
      businessTab: '1',
      tabType: [],
      dataMember: {},
      memberTag: []
    }
  },
  async mounted() {
    this.isLoading = true
    await this.getMemberInfo()
    await Promise.all([
      this.getMemberTrace(),
      this.getDataMember(),
      this.getTagType()
    ]).finally(() => {
      this.isLoading = false
    })
  },
  methods: {
    // 获取用户基本信息
    async getMemberInfo() {
      let resp = await this.$axios.$get(memberInfo(this.$route.query.id))
      this.memberInfoData = resp.payload.hspMember
      this.tableConfig.url = activityDataList(this.memberInfoData.accountId)
      this.shareTable.url = memberShareList(this.memberInfoData.accountId)
    },
    // 从数据中心获取用户
    async getDataMember() {
      let resp = await this.$axios.$get(
        dataMember(this.memberInfoData.accountId)
      )
      this.dataMember = resp.payload
    },
    // 获取用户轨迹
    async getMemberTrace() {
      let resp = await this.$axios.$get(memberTraceApi(this.$route.query.id))
      this.memberTrace = resp.payload
    },
    // 获取用户统计信息
    async getMemberCount() {
      let resp = await this.$axios.$get(memberCount(this.$route.query.id))
      this.memberCount = resp.payload
    },
    // 获取标签分类
    async getTagType() {
      try {
        let resp = await this.$axios.$get(firstTag)
        this.tabType = resp.payload
        if (this.tabType.length) {
          this.activeTab = this.tabType[0].id
          this.getTagMap(this.tabType[0].id)
        }
      } catch (e) {
        console.error(e)
      }
    },
    // 获取对应标签
    getTagMap(id) {
      this.tagLoading = true
      this.$axios
        .$get(`${tagMap}/${this.$route.query.id}/${id}`)
        .then(resp => {
          this.tagLoading = false
          this.memberTag = resp.payload
        })
        .catch(e => console.log(e))
    },
    handleClick(id) {
      this.getTagMap(id.name)
    }
  }
}
</script>
<style lang="less">
.member-detail {
  @gray: #f8f8f8;
  @darkGray: #e8e8e8;

  &-basicinfo {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: @gray;
    font-size: 12px;

    .basicinfo-img {
      border-radius: 50%;
      width: 80px;
      height: 80px;
    }

    .basicinfo-icon {
      margin: 15px 10px 0;
    }
  }

  &-info {
    padding-left: 20px;

    .info-cell {
      margin: 7px 0;
    }
  }

  &-record {
    margin-top: 20px;
    border: 1px solid @darkGray;

    .el-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 20px 0;
      border-right: 1px solid @darkGray;

      &:last-child {
        border: none;
      }
    }

    .record-num {
      margin-bottom: 10px;
      font-size: 22px;
      color: #87a8f4;
    }
  }

  &-bartitle {
    padding-left: 10px;
    margin: 20px 0;
    height: 40px;
    line-height: 40px;
    background: #ebebeb;
  }

  .tag-content {
    display: flex;
    justify-content: center;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .el-tag {
    margin-top: 10px;
  }
}
</style>
