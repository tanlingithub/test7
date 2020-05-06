<template>
  <div class="margin-bottom">
    <el-row v-loading="dataLoading">
      <el-col
        v-for="(item, index) in hspActivityCountData"
        :key="index"
        :span="4"
      >
        <span>{{ item }}</span
        >：
        <span :class="index == 'pushTypeName' ? '' : 'blue'">{{
          index == 'pushDate'
            ? formatDate(statisticsData[index], 'YYYY-MM-DD HH:mm:ss')
            : statisticsData[index]
        }}</span>
      </el-col>
    </el-row>
    <el-data-table
      ref="smsTable"
      v-bind="detailTableConfig"
      :url="detailTableUrl"
      :dataPath="'payload.dataList'"
    ></el-data-table>
    <div class="margin-bottom bg-color" v-loading="dataLoading">
      <p>
        数据说明：本次推送人群中，{{
          statisticsData.fristPushNum || 0
        }}的会员是首次推送消息，{{
          statisticsData.repeatPushNum || 0
        }}会员是多次推送消息；其中多次推送过消息的会员中，{{
          statisticsData.taskActivityNum || 0
        }}会员已参与活动
      </p>
      <p>
        营销说明：仍有<span class="blue">{{
          statisticsData.noTaskActivityNum || 0
        }}</span
        >的会员未参与活动，是否继续<span
          class="blue is-pointer"
          @click="messageTo"
          >群发营销短信</span
        >
      </p>
    </div>
  </div>
</template>
<script>
import {
  hspActivityCountData,
  tableColumns,
  smsType,
  wechatType
} from '@/const/analysis'

import {formatDate} from '@/const/filter'

export default {
  data() {
    return {
      formatDate,
      dataLoading: false,
      statisticsData: {},
      hspActivityCountData,
      detailTableConfig: {
        columns: tableColumns(this.type),
        hasOperation: false,
        hasNew: false
      }
    }
  },
  props: {
    detailTableUrl: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: smsType
    },
    statisticsUrl: {
      type: String,
      default: ''
    }
  },
  watch: {
    statisticsUrl(newData) {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    //群发营销短信
    messageTo() {
      this.$router.replace({
        path: '/notification/short-message/add-normal'
      })
    },
    getData() {
      this.dataLoading = true
      this.$axios
        .$get(this.statisticsUrl)
        .then(res => {
          this.statisticsData = res.payload || {}
        })
        .finally(() => {
          this.dataLoading = false
        })
    }
  }
}
</script>
<style lang="less"></style>
