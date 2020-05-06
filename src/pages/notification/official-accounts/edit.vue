<template>
  <div class="add-message">
    <div class="add-message-left">
      <el-form-renderer
        :content="content"
        labelPosition="left"
        labelWidth="100px"
        ref="formRender"
        :disabled="disabled"
      ></el-form-renderer>
      <el-form :model="form" :rules="rules" ref="form" :disabled="disabled">
        <!-- 添加链接按钮 -->
        <el-form-item label="原文链接：">
          <el-radio
            v-model="form.linkType"
            @change="watchLinkTypeChange"
            label="0"
            >无</el-radio
          >
          <el-radio
            v-model="form.linkType"
            @change="watchLinkTypeChange"
            label="1"
            >自定链接</el-radio
          >
          <el-radio
            v-model="form.linkType"
            @change="watchLinkTypeChange"
            label="2"
            >活动链接</el-radio
          >
        </el-form-item>
        <el-dialog width="50%" :visible.sync="linkDialogVisible">
          <el-tabs>
            <el-tab-pane
              v-for="(activity, index) in activityType"
              :label="activity.name"
              :key="index"
            >
              <el-table
                ref="activityTable"
                :show-header="false"
                :data="groupActivityList"
                @current-change="selectActivity"
                highlight-current-row
              >
                <el-table-column prop="name"></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <span slot="footer" class="dialog-footer">
            <el-button @click="linkDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="linkDialogVisible = false"
              >确 定</el-button
            >
          </span>
        </el-dialog>
        <el-form-item prop="linkUrl">
          <el-input
            v-model="form.linkUrl"
            v-show="form.linkType == 1 || form.linkUrl"
            placeholder="请输入链接地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="发送方式：">
          <el-radio v-model="form.sendMode" label="1">即时发送</el-radio>
          <el-radio v-model="form.sendMode" label="2">定时发送</el-radio>
          <el-date-picker
            v-model="form.sendTime"
            type="datetime"
            placeholder="选择日期时间"
            v-show="!dataTimeStatus"
            :picker-options="dateTimePickerOptions"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="发送人群">
          <el-radio v-model="form.targetType" label="0">全部</el-radio>
          <el-radio v-model="form.targetType" label="1">按会员分组</el-radio>
        </el-form-item>

        <el-form-item>
          <el-dialog width="600px" :visible.sync="groupDialogVisible">
            <el-table
              :data="vipGroupList"
              @selection-change="handleSelectChange"
              ref="groupTable"
            >
              <el-table-column
                :reserve-selection="true"
                type="selection"
                width="55"
              ></el-table-column>
              <el-table-column
                label="分组名称"
                prop="name"
                min-width="80px"
              ></el-table-column>
              <el-table-column label="标签" min-width="150px">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, index) in scope.row.tagNames"
                    :key="index"
                    >{{ item }}</el-tag
                  >
                </template>
              </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
              <el-button @click="handleSelected(false)">取 消</el-button>
              <el-button type="primary" @click="handleSelected(true)"
                >确 定</el-button
              >
            </span>
          </el-dialog>
          <el-button
            @click="handleSelectGroup"
            v-show="!selectGroup"
            type="text"
          >
            <i class="el-icon-circle-plus-outline"></i>选择分组
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-tag v-for="(item, index) in form.memberGroupName" :key="index">{{
            item
          }}</el-tag>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="save('toBesent')">推送</el-button>
      <el-button type="primary" @click="save('draft')">保存草稿</el-button>
      <el-button type="danger" @click="reset">取消</el-button>
    </div>
    <div class="phone-main">
      <img
        src="https://deepexi.oss-cn-shenzhen.aliyuncs.com/handshake-plan/console/wechat-top.png"
        alt=""
        class="phone-top"
      />
      <div class="phone-middle">
        <div
          class="phone-middle-item"
          v-if="form.imageUrl || form.title || form.summary"
        >
          <img
            :src="form.imageUrl"
            alt=""
            class="phone-middle-item-img"
            v-if="form.imageUrl"
          />
          <div class="word">
            <p class="phone-middle-item-title">
              {{ form.title }}
            </p>
            <p class="phone-middle-item-summary">
              {{ form.summary }}
            </p>
          </div>
        </div>
      </div>
      <img
        src="https://deepexi.oss-cn-shenzhen.aliyuncs.com/handshake-plan/console/wechat-bottom.png"
        alt=""
        class="phone-bottom"
      />
    </div>
  </div>
</template>
<script>
import {
  accountsList,
  memberGroupList,
  vipcnListApi,
  groupList
} from '@/const/api'
import UploadToAli from '@femessage/upload-to-ali'
import VEditor from '@femessage/v-editor'

import {Popover, Card, Tabs, TabPane, Tag} from 'element-ui'

const TARGET_TYPE = {
  selectAll: '0',
  selectGroup: '1'
}
const SEND_MODE = {
  selectNow: '1',
  selectTime: '2'
}
const LINK_TYPE = {noneLink: '0', customLink: '1', activityLink: '2'}
const SEND_STATUS = {sented: 0, toBeSent: 1, cacle: 2, draft: 3}
export default {
  components: {
    UploadToAli,
    VEditor,
    ElPopover: Popover,
    ElCard: Card,
    ElTabs: Tabs,
    ElTabPane: TabPane,
    ElTag: Tag
  },
  data() {
    return {
      vipGroupList: [], //会员分组列表
      accounts: [], //公众号列表
      form: {
        title: '',
        imageUrl: '',
        summary: '',
        essay: '',
        linkUrl: '',
        vipcn: [],
        vipcnIds: [],
        linkType: LINK_TYPE.noneLink,
        sendTime: Date.now(),
        sendMode: SEND_MODE.selectNow,
        targetType: TARGET_TYPE.selectAll,
        memberGroupId: [],
        memberGroupName: [],
        status: SEND_STATUS.toBeSent
      },
      activityType: [
        {
          name: '拼团活动',
          tableData: [] //接口暂无，数据为空
        },
        {
          name: '优惠卷',
          tableData: []
        }
      ],
      rules: {
        vipcn: [
          {
            required: true,
            message: '请选择公众号',
            trigger: 'blur'
          }
        ]
      },
      //时间选择器不可选择当前日期之前的日期
      dateTimePickerOptions: {
        disabledDate(time) {
          return Date.now() - 8.64e7 >= time.getTime()
        }
      },
      linkDialogVisible: false,
      groupDialogVisible: false,
      lastSelectedGroup: [],
      selectedGroup: [],
      content: [
        {
          $id: 'title',
          $type: 'input',
          label: '消息标题',
          $el: {
            placeholder: '请输入',
            maxlength: 15
          },
          rules: [
            {
              required: true,
              message: '请输入消息标题',
              trigger: 'blur'
            }
          ],
          atChange: (id, value) => {
            this.form.title = value
          }
        },
        {
          $id: 'imageUrl',
          component: UploadToAli,
          label: '封面图片',
          rules: [
            {
              required: true,
              message: '请选择封面',
              trigger: 'blur'
            }
          ],
          atChange: (id, value) => {
            this.form.imageUrl = value
          }
        },
        {
          $id: 'summary',
          $type: 'input',
          label: '消息摘要',
          $el: {
            placeholder: '请输入',
            maxlength: 120
          },
          atChange: (id, value) => {
            this.form.summary = value
          }
        },
        {
          $id: 'essay',
          component: VEditor,
          label: '消息正文',
          rules: [
            {
              required: true,
              message: '请输入消息正文',
              trigger: 'blur'
            }
          ],
          $el: {
            height: 200
          }
        },
        {
          $id: 'tencent',
          $type: 'select',
          label: '发送公众号',
          $el: {
            multiple: true
          },
          rules: [
            {
              required: true,
              message: '请选择公众号',
              trigger: 'blur'
            }
          ],
          outputFormat: tencent => {
            let item = this.accountOptions.filter(val =>
              tencent.includes(val.value)
            )
            return {
              vipcn: item.map(val => val.label),
              vipcnIds: item.map(val => val.value)
            }
          }
        }
      ],
      groupActivityList: [],
      selectedActivity: {},
      accountOptions: []
    }
  },
  computed: {
    //时间选择器显示状态
    dataTimeStatus() {
      return this.form.sendMode == SEND_MODE.selectNow
    },
    //添加分组按钮显示状态
    selectGroup() {
      return this.form.targetType == TARGET_TYPE.selectAll
    },
    //查看页面
    disabled() {
      return Boolean(this.$route.query.isView)
    },
    //判断时间状态是否可发送
    timeStatus() {
      return this.form.sendMode == SEND_MODE.selectTime
        ? this.form.sendTime > Date.now()
        : true
    },
    //判断链接类型和状态
    linkStatus() {
      return this.form.linkType != LINK_TYPE.noneLink
        ? this.form.linkUrl.length
        : true
    },
    //判断发送人群状态和类型
    targetStatusType() {
      return this.form.targetType == TARGET_TYPE.selectAll
        ? true
        : this.form.memberGroupName.length
    }
  },
  mounted() {
    this.getAccountsList()
    this.getVipGroupsList()
    this.getGroupActivity()
    if (this.$route.query.id) {
      this.getFormData(this.$route.query.id)
    }
  },
  methods: {
    // 获取拼团活动列表
    getGroupActivity() {
      this.$axios.$get(groupList).then(resp => {
        this.groupActivityList = resp.payload.content
      })
    },
    // 选择活动
    selectActivity(val) {
      this.selectedActivity = val
    },
    //radio的值变化，判断是否弹出选择活动link弹窗
    watchLinkTypeChange(label) {
      if (label == LINK_TYPE.activityLink) {
        this.linkDialogVisible = true
      }
    },
    //查看和编辑模式下获取表单数据渲染页面
    getFormData(id) {
      this.$axios.get(vipcnListApi(id)).then(res => {
        let data = res.data.payload
        this.$refs.formRender.updateForm(data)
        this.form = data
        this.form.sendMode = `${this.form.sendMode}`
        this.form.targetType = `${this.form.targetType}`
        this.form.linkType = `${this.form.linkType}`
      })
    },
    //获取公众号列表
    getAccountsList() {
      this.$axios.get(accountsList).then(res => {
        this.accounts = res.data.payload
        this.accountOptions = this.accounts.map(el => {
          return {
            label: el.nickName,
            value: el.id
          }
        })
        this.$refs.formRender.setOptions('tencent', this.accountOptions)
      })
    },
    //获取会员分组列表
    getVipGroupsList() {
      this.$axios.get(memberGroupList).then(res => {
        this.vipGroupList = res.data.payload.content
      })
    },
    send() {
      let canSend = true
      this.$refs.formRender.validate(valid => {
        if (!valid) {
          this.$message.error('必填项不能为空')
          canSend = false
        }
      })
      // if (!this.timeStatus || !this.linkStatus) {
      //   this.$message.error('不可发送')
      //   canSend = false
      // }
      if (!this.targetStatusType) {
        this.$message.error('请选择分组')
        canSend = false
      }
      if (!canSend) {
        return
      }
      let method = this.$route.query.id ? 'put' : 'post'
      let data = {}
      data =
        this.form.linkType === '2'
          ? Object.assign({}, this.form, {
              activityId: this.selectedActivity.id,
              linkUrl: `http://cdn-dev.deepexi.com/handshake-plan-mobile/index.html#/goods-detail?auth=1&path=goods-detail&id=${
                this.selectedActivity.id
              }`
            })
          : this.form
      this.$axios[method](vipcnListApi(), data).then(res => {
        this.$message.success('保存成功')
        //重置表单
        this.$refs.form.resetFields()
        this.$refs.formRender.resetFields()
        this.$router.back()
      })
    },
    //发送和保存草稿
    save(status) {
      this.form.status = SEND_STATUS[status]
      this.merge()
      this.send()
    },
    //取消
    reset() {
      this.$router.back()
    },
    //form和formrender数据拼接
    merge() {
      const value = this.$refs.formRender.getFormValue()
      Object.assign(this.form, value)
    },
    //打开添加分组弹窗时记录上一次被选中的分组
    handleSelectGroup() {
      this.groupDialogVisible = true
      this.lastSelectedGroup = this.selectedGroup
    },
    //当被选择的会员分组发生变化
    handleSelectChange(val) {
      this.selectedGroup = val
    },
    //确认||取消选择会员分组
    handleSelected(flag) {
      this.groupDialogVisible = false
      let group = flag ? this.selectedGroup : this.lastSelectedGroup
      this.$refs.groupTable.clearSelection()
      group.forEach(el => {
        this.$refs.groupTable.toggleRowSelection(el)
      })
      this.form.memberGroupName = group.map(el => el.name)
      this.form.memberGroupId = group.map(el => el.id)
    }
  }
}
</script>

<style lang="less">
.add-message {
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;

  &-left {
    width: 60%;
  }

  .link-dialog {
    height: 500px;
  }

  .w-e-toolbar {
    overflow-x: auto;
  }

  .phone-main {
    width: 250px;
    line-height: 0px;

    .phone-bottom,
    .phone-top {
      width: 100%;
    }

    .phone-middle {
      height: 300px;
      width: 100%;
      font-size: 10px;
      line-height: 20px;
      padding: 0px 25px;
      background-image: url('https://deepexi.oss-cn-shenzhen.aliyuncs.com/handshake-plan/console/wechat-middle.png');
      background-size: 100% 100%;
    }

    .url {
      color: blue;
      margin: 0px 5px;
    }
  }

  .phone-middle-item {
    width: 100%;
    background-color: #fff;
    overflow-y: scroll;
    border-radius: 10px;

    .word {
      padding: 5px;
    }

    &-img {
      width: 100%;
      height: 120px;
      border-radius: 10px 10px 0px 0px;
    }

    &-title {
      font-weight: bold;
    }

    &-summary {
      width: 100%;
      color: gray;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
