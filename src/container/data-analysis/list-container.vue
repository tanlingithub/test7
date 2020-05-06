<template>
  <div class="list-container">
    <div class="list-container-header is-between">
      <!--tabs 不能自定义右边内容，放弃-->
      <!--<route-tab :tab="tabs" :routes="routes">-->
      <!--<slot></slot>-->
      <!--</route-tab>-->
      <ul class="tab-like-box">
        <li class="tab-active-bar" :style="activeBarTransition"></li>
        <li
          v-for="(route, index) in routes"
          :key="route.name"
          class="tab"
          :class="{'is-active': currentActive === index}"
          @click="switchTab(route, $event)"
        >
          <span :ref="`tabContent${index}`">{{ route.name }}</span>
        </li>
      </ul>
      <div class="flex right-part" v-if="!onlyTabs">
        <!--右边自定义内容区域-->
        <slot name="right"></slot>
      </div>
    </div>
    <div class="tab-like-content">
      <slot></slot>
      <div v-if="isShowPagination">
        <el-pagination
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizeOptions"
          :page-size="pageSize"
          layout="total, prev, pager, next, sizes, jumper"
          :total="config.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import RouteTab from '@/components/RouteTab'
import {Pagination} from 'element-ui'

export default {
  name: 'ListContainer',
  components: {
    RouteTab,
    'el-pagination': Pagination
  },
  props: {
    config: {
      type: Object,
      default: () => {
        return {
          size: 8,
          page: 1,
          total: 0
        }
      }
    },
    isShowPagination: {
      type: Boolean,
      default: false
    },
    routes: {
      type: Array,
      default: () => {
        return [
          // {
          //   name: '我创建的工程',
          //   path: '/',
          //   query: {},
          //   disabled: false,
          //   closable: false
          // }
        ]
      }
    },
    onlyTabs: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeBarTransition: {},
      defaultActive: 0,

      searchParams: {
        type: '', // tab的值
        search: '', // 搜索值
        sort: '' // 列表或者卡片展示
      },

      pageSizeOptions: [8, 16, 24, 32],
      pageSize: 8,
      currentPage: 1,

      currentActive: 0
    }
  },
  computed: {
    query() {
      return this.$route.query
    }
  },
  watch: {
    routes: {
      handler: function() {
        this.positionActiveTab()
      },
      immediate: true
    }
  },
  methods: {
    positionActiveTab() {
      this.routes.forEach((it, i) => {
        // 匹配当前路由，当前tab的样式为激活状态
        if (this.$route.path === it.path) {
          this.tabAtiveLine(i)
          this.currentActive = i
          this.searchParams = this.query
        }
      })
    },
    tabAtiveLine(index) {
      // 在dom渲染后执行
      this.$nextTick(() => {
        let firstTab = this.$refs[`tabContent0`][0]
        let computedFirstTabOffsetLeft = firstTab.offsetLeft

        let target = this.$refs[`tabContent${index}`][0]
        let tabContentWidth = target.offsetWidth
        let offsetL = target.offsetLeft

        this.activeBarTransition = {
          width: `${tabContentWidth + 2 * computedFirstTabOffsetLeft}px`,
          transform: `translateX(${offsetL - computedFirstTabOffsetLeft}px)`
        }
      })
    },
    switchTab(route) {
      //重复点击当前路由按钮不进行处理
      if (this.$route.path !== route.path) {
        let extraQuery = {...this.query} // 不包括内部维护的searchParamsß
        delete extraQuery.type
        delete extraQuery.search
        delete extraQuery.sort

        this.searchParams.search = ''
        this.$router.replace({
          path: route.path,
          query: {...route.query, ...extraQuery}
        })
      }
    },

    doSearch() {
      this.$emit('search', this.searchParams)
    },

    handlePageSizeChange(pageSize) {
      this.$emit('pageSizeChange', pageSize)
    },

    handleCurrentChange(currentPage) {
      this.$emit('currentChange', currentPage)
    }
  }
}
</script>

<style scoped lang="less">
.list-container {
  @lineHeight: 60px;
  @primary-color: #409eff;
  @black: #2d303b;
  .list-container-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    /*margin-bottom 10px*/
    /*padding 0 60px*/
    border-bottom: 1px solid #eee;
    background: #fff;

    .tab-active-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
      width: 80px;
      height: 2px;
      background: @primary-color;
      transition: 0.3s cubic-bezier(0.645, 0.045, 0.355, 1); // element.ui tabbar 的动画
    }
    .tab-like-box {
      list-style: none;
      padding: 0;
      font-weight: 400;
      display: inherit;
      width: auto;

      .tab {
        padding: 0 16px;
        line-height: @lineHeight;
        display: inline-block;
        cursor: pointer;
        color: @black;

        &.is-active {
          color: @primary-color;
        }
      }
    }

    .right-part {
      line-height: @lineHeight;
    }
  }
}
</style>
