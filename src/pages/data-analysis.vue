<template>
  <div class="activity-effect">
    <list-container :routes="routes">
      <el-button
        @click="toSelectActive"
        slot="right"
        class="select-active"
        :loading="nowActiveLoading"
        plain
      >{{ $store.state.active.nowActive.name }}</el-button>
    </list-container>
    <el-row type="flex">
      <el-col :span="24">
        <nuxt-child ref="nuxtChild" v-loading="nowActiveLoading" class="margain-top"></nuxt-child>
        <div v-if="!nowActiveLoading && !$store.state.active.nowActive.id">暂无数据</div>
      </el-col>
    </el-row>
    <el-dialog title="选择活动" :visible.sync="activeShow" width="40%">
      <el-row class="active-select-wrap" v-loading="activeLoading">
        <el-col :span="5">
          <el-tabs type="card" v-model="activityType" tab-position="left">
            <el-tab-pane label="拼团活动" name="group"></el-tab-pane>
            <el-tab-pane label="优惠卷" name="coupon"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="19">
          <div
            v-for="(item, index) in activeAll"
            :key="index"
            :class="
              (newActive.id || $store.state.active.nowActive.id) == item.id
                ? 'activeAllShow selectedActive'
                : 'activeAllShow'
            "
            @click="selectNewActive(item)"
          >{{ item.name }}</div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 40, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="pagination"
          ></el-pagination>
        </el-col>
      </el-row>
      <div class="footer-wrap">
        <div>
          已选活动“
          <span class="blue">
            {{
            newActive.name ? newActive.name : $store.state.active.nowActive.name
            }}
          </span>”
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="activeShow = false">取 消</el-button>
          <el-button type="primary" @click="sureNewActive">确 定</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ListContainer from '@/container/data-analysis/list-container'
import {groupList, couponsList} from '@/const/api'
import {formatDate} from '@/const/filter'

//活动类型为拼团
const GROUPTYPE = 'group'

export default {
  name: 'activity-effect',
  data() {
    return {
      nowActiveLoading: false,
      selectLoading: false,
      activeAll: [],
      activityType: GROUPTYPE,
      routes: [
        {
          name: '活动概括',
          path: '/data-analysis/activity'
        },
        {
          name: '活动推送分析',
          path: '/data-analysis/effect'
        }
      ],
      newActive: {
        name: '',
        id: ''
      },
      activeShow: false,
      activeLoading: false,
      getActiveUrl: groupList,
      activeTableConfig: {
        columns: [
          {
            prop: 'name'
          }
        ],
        hasOperation: false,
        hasNew: false
      },
      currentPage: 1,
      total: 0,
      pageSize: 10
    }
  },
  components: {
    ListContainer
  },
  watch: {
    //切换活动类型
    activityType(newData) {
      this.getActiveUrl = newData == GROUPTYPE ? groupList : couponsList
      // this.getActive()
    },
    activeAll(newData) {
      this.activeAll = newData
    },
    activeShow(newData) {
      if (!newData) {
        this.newActive = {}
      }
    }
  },
  mounted() {
    //待接入
    this.nowActiveLoading = true
    this.$store.dispatch('active/getNowActive').finally(() => {
      this.nowActiveLoading = false
    })
  },
  methods: {
    //点击活动列表
    selectNewActive(data) {
      this.newActive = data
    },
    //确认选择活动
    sureNewActive() {
      this.$store.commit('active/setNowActive', this.newActive)
      this.newActive = {}
      this.activeShow = false
    },
    //点击活动按钮
    toSelectActive() {
      this.activeShow = true
      this.getActive()
    },
    //获取活动（拼团或者优惠券）
    getActive() {
      this.activeLoading = true
      this.$axios
        .$get(this.getActiveUrl, {
          params: {
            size: this.pageSize,
            page: this.currentPage
          }
        })
        .then(res => {
          this.activeAll = res.payload.content || []
          this.total = res.payload.totalElements || 0
        })
        .finally(() => {
          this.activeLoading = false
        })
    },
    // 换size
    handleSizeChange(data) {
      this.pageSize = data
      this.getActive()
    },
    //换页
    handleCurrentChange(data) {
      this.currentPage = data
      this.getActive()
    }
  }
}
</script>
<style lang="less">
.activity-effect {
  .footer-wrap {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding-top: 20px;
  }

  .el-date-editor .el-range-separator {
    width: 8%;
  }

  .blue {
    color: #2460c1;
  }
  .margain-top {
    margin-top: 20px;
  }
  .pagination {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .active-select-wrap {
    display: flex;
    flex-flow: row nowrap;
    border: 1px solid #e4e7ed;
  }

  .el-tabs--card > .el-tabs__header {
    border-bottom: none;
    text-align: center;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__nav {
    border-top: none;
    border-left: none;
  }

  .el-tabs--left.el-tabs--card .el-tabs__nav {
  }
  .el-pagination__jump {
    margin-left: 0px;
  }
  .selectedActive {
    background-color: #e4e7ed;
  }

  .activeAllShow {
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    border-bottom: 1px solid #e4e7ed;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
