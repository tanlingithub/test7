<template>
  <section class="group-detail">
    <!-- tab标签 -->
    <el-tabs v-model="activeTag" @tab-click="changeTab">
      <el-tab-pane
        :label="item.name"
        :name="item.id"
        v-for="(item, index) in tagType"
        :key="index"
      ></el-tab-pane>
    </el-tabs>

    <!-- 显示对应图表 -->
    <el-checkbox-group v-model="selectedCharts">
      <el-checkbox
        v-for="(item, index) in baseTab"
        :key="index"
        :label="item"
        >{{ item.name }}</el-checkbox
      >
    </el-checkbox-group>

    <!-- 图表信息 -->
    <el-row v-loading="tagLoading">
      <el-col
        :span="11"
        class="echart-box"
        v-for="(item, index) in columns"
        v-if="selectedCharts.map(val => val.name).includes(item.type)"
        :key="index"
      >
        <el-button @click="changeType(index)">切换类型</el-button>
        <ve-chart
          v-if="item.rows && item.rows.length"
          :settings="item.settings"
          :legend-visible="false"
          :data="item"
          :extend="extend"
        ></ve-chart>
        <div v-else class="none-data">
          <img
            class="image"
            src="//deepexi-moby.oss-cn-shenzhen.aliyuncs.com/Group 3-1553828425863.png"
          />
          <p>{{ item.type }}暂无数据</p>
        </div>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import Vue from 'vue'
import VCharts from 'v-charts'
import {Tabs, TabPane, CheckboxGroup} from 'element-ui'
import {groupDataColumns, chartModule} from '@/const/member'
import {firstTag, childrenTag, groupDetail} from '@/const/api'
Vue.use(VCharts)

const HISTOGRAM = 'histogram' // 柱状
const PIE = 'pie' // 饼状

export default {
  name: 'group-detail',
  components: {
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-checkbox-group': CheckboxGroup
  },
  data() {
    return {
      // 图表扩展配置
      extend: {
        series: {
          label: {show: true, position: 'top'}
        },
        barWidth: 20
      },
      // 图表列
      columns: [],
      selectedCharts: [],
      tagType: [],
      baseTab: [],
      activeTag: '',
      tagLoading: false
    }
  },
  mounted() {
    this.getAllTag()
  },
  methods: {
    // 获取一级标签
    getAllTag() {
      this.$axios.$get(firstTag).then(resp => {
        this.tagType = resp.payload
        this.activeTag = this.tagType && this.tagType[0].id

        this.getBaseTag(this.tagType && this.tagType[0].id)
      })
    },
    // 获取二级标签
    getBaseTag(id) {
      this.tagLoading = true
      this.$axios.$get(childrenTag(id)).then(resp => {
        this.baseTab = resp.payload

        let data = this.baseTab.map(val => {
          return {
            id: val.id,
            name: val.name
          }
        })

        this.$axios
          .$post(groupDetail(this.$route.query.id), data)
          .then(resp => {
            this.selectedCharts = this.baseTab
            let chartList = this.baseTab.map(val => {
              return chartModule(val.name, [])
            })

            resp.payload.forEach(val => {
              if (val && val.labels) {
                let index = chartList.findIndex(
                  item => item.type === val.tagname
                )
                chartList[index].rows = val.labels
              }
            })

            this.columns = chartList
          })
          .finally(() => {
            this.tagLoading = false
          })
      })
    },
    changeTab(val) {
      this.getBaseTag(val.name)
    },
    changeType(index) {
      this.columns[index].settings.type =
        this.columns[index].settings.type === HISTOGRAM ? PIE : HISTOGRAM
    }
  }
}
</script>

<style lang="less">
.group-detail {
  .echart-box {
    margin: 20px 40px 20px 0;
    padding: 20px 20px 0 20px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .none-data {
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .image {
      width: 250px;
      margin: 50px;
    }
  }
}
</style>
