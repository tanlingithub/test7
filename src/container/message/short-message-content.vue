<template>
  <div>
    <el-input
      type="textarea"
      v-model="childContent"
      :rows="6"
      maxLength="300"
      resize="none"
    ></el-input>
    <!--添加活动链接  -->
    <el-dialog
      width="800px"
      ref="dialog"
      :visible.sync="linkVisible"
      :show-close="false"
      title="添加活动链接"
    >
      <el-tabs v-model="linkMode" class="tabs" type="card">
        <el-tab-pane label="关联营销活动" name="linkActivityUrl">
          <el-tabs v-model="activityType" tab-position="left">
            <el-tab-pane label="拼团活动" name="group"></el-tab-pane>
            <el-tab-pane label="优惠卷" name="coupon"></el-tab-pane>
          </el-tabs>
          <div class="tab-pane-activity">
            <el-table
              ref="activityTable"
              class="activity-table"
              :data="tableData.list"
              :show-header="false"
              highlight-current-row
              @current-change="handleCurrentChange"
              v-loading="tableData.loading"
              height="264"
            >
              <el-table-column label="活动名称" prop="name"></el-table-column>
            </el-table>
            <el-pagination
              layout="prev, pager, next"
              :total="tableData.total"
              @current-change="tableCurrentChange"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自定义链接" name="customUrl">
          <el-input
            v-model="changeMsgUrl"
            placeholder="请输入链接地址"
          ></el-input>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <div class="selectActivity">
          <span>已选&nbsp;</span><span>"{{ selectedActivity.name }}"</span>
        </div>
        <el-button @click="linkVisible = false">取 消</el-button>
        <el-button type="primary" @click="imgUrlSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加测试电话号码 -->
    <el-dialog width="500px" :visible.sync="testVisible" title="测试短信">
      <el-input
        prop="PhoneCode"
        v-model="testPhoneCode"
        placeholder="请输入测试手机号"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSureTestPhone"
          :disabled="!this.testPhoneCode || !this.childContent"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- text按钮 -->
    <el-button type="text" @click="clickAddShorMessButton">
      <i class="el-icon-circle-plus-outline"></i>添加短信链接
    </el-button>
    <el-button type="text" @click="testVisible = true">测试短信内容</el-button>
    <span class="content-length-span">
      已输入
      <span>{{ childContent.length }}</span
      >个字符
    </span>
  </div>
</template>

<script>
import {Tabs, TabPane} from 'element-ui'
import {testMessage, groupList, couponsList} from '@/const/api'

const ACTIVITY_TYPE = {
  group: groupList,
  coupon: couponsList
}
// 与后端协定的url短链转换格式
const ACTIVITY_URL = '{activityUrl}'
const CUSTOM_URL = 'customUrl'

export default {
  components: {
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  },
  props: {
    content: {
      type: String,
      default: ''
    },
    sign: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableData: {
        url: '',
        loading: false,
        list: [],
        page: 1,
        size: 6,
        total: 0
      },
      testPhoneCode: '',
      activityType: 'group',
      linkMode: 'linkActivityUrl',
      testVisible: false,
      linkVisible: false,
      msgUrl: '',
      changeMsgUrl: '',
      childContent: this.content,
      activityUrl: groupList,
      activityList: [],
      selectedActivity: {}
    }
  },
  computed: {},
  watch: {
    childContent(val) {
      this.$emit('update:content', val)
    },
    //监听活动和优惠卷的tabs，改变时发出获取相应列表请求
    activityType: {
      handler: function(val) {
        this.handleGetTableData()
      },
      immediate: false
    },
    selectedActivity(val) {
      //处理不点击保留上一个id，需要置空
      this.changeMsgUrl = val.id
        ? `http://cdn-dev.deepexi.com/handshake-plan-mobile/index.html#/goods-detail?auth=1&path=goods-detail&id=${
            val.id
          }`
        : ''
    }
  },
  mounted() {},
  methods: {
    handleGetTableData() {
      this.tableData = {
        url: '',
        loading: false,
        list: [],
        page: 1,
        size: 6,
        total: 0
      }
      this.tableData.url = ACTIVITY_TYPE[this.activityType]
      this.getTableData()
    },
    //发出获取活动||优惠卷列表请求
    getTableData() {
      this.tableData.loading = true
      let params = {page: this.tableData.page, size: this.tableData.size}
      this.$axios.$get(this.tableData.url, {params: params}).then(res => {
        this.tableData.list = res.payload.content
        this.tableData.total = res.payload.totalElements
        this.tableData.loading = false
      })
    },
    //  分页 页号变动时
    tableCurrentChange(currentPage) {
      this.tableData.page = currentPage
      this.getTableData()
    },
    handleSureTestPhone() {
      const content = this.content.replace(this.msgUrl, ACTIVITY_URL)
      //发送测试短信,短信内容直接放在body中。
      this.$axios
        .post(`${testMessage}/${this.testPhoneCode}`, {
          content,
          url: this.msgUrl
        })
        .then(res => {
          this.$message.success('发送测试短信成功!')
        })
        .catch(err => {
          console.log(err)
        })
      this.testVisible = false
    },
    handleCurrentChange(row) {
      this.selectedActivity = row || {}
    },
    // 点击添加短信链接
    clickAddShorMessButton() {
      this.handleGetTableData()
      this.linkVisible = true
    },
    imgUrlSure() {
      //当改变了url值的时候
      if (this.changeMsgUrl) {
        //当输入框将原有url删除时
        this.childContent =
          this.msgUrl && this.childContent.indexOf(this.msgUrl) > -1
            ? this.childContent.replace(this.msgUrl, this.changeMsgUrl)
            : this.childContent.concat(this.changeMsgUrl)
        this.msgUrl = this.changeMsgUrl
      }
      this.linkVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.tabs {
  height: 400px;
  overflow: auto;

  .content-length-span {
    float: right;
  }

  .el-tabs {
    float: left;
  }

  .tab-pane-activity {
    width: calc(100% - 110px);
    float: right;

    .el-pagination {
      text-align: right;
    }
  }
}

.dialog-footer {
  .selectActivity {
    width: 400px;
    display: inline;
    float: left;
    text-align: left;

    span:last-child {
      color: #1890ff;
    }
  }
}
</style>
