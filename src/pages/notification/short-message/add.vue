<template>
  <div class="add-marketing">
    <el-form
      ref="form"
      :model="form"
      label-width="100px"
      :rules="rules"
      class="form"
    >
      <!-- 收信人 -->
      <el-form-item label="收信人" prop="targetCrowd">
        <el-select v-model="form.targetCrowd">
          <el-option
            v-for="item in receiversGroup"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-tooltip class="item" effect="dark" placement="right-end">
          <div slot="content">
            <p class="tooltip-line">说明：</p>
            <p class="tooltip-line">
              ① 昨日未登录新会员：昨日没有登录系统的30天内注册的新会员
            </p>
            <p class="tooltip-line">
              ② 昨日已登录新会员：昨日有登录系统的30天内注册的新会员
            </p>
            <p class="tooltip-line">
              ③ 昨日未参与活动的会员：昨日访问但未参与活动的会员。
            </p>
          </div>
          <i class="el-icon-question icon"></i>
        </el-tooltip>
      </el-form-item>
      <!--短信内容  -->
      <el-form-item label="短信内容" prop="content">
        <short-message-content
          ref="msgContent"
          :sign="form.sign"
          :content.sync="form.content"
        ></short-message-content>
      </el-form-item>
      <!-- 短信签名 -->
      <el-form-item label="短信签名" prop="sign">
        <el-input v-model="form.sign" maxLength="4"></el-input>
      </el-form-item>
      <!-- 发送规则 -->
      <el-form-item label="发送规则">
        <el-form-item prop="time">
          <!-- 多选项 -->
          每日<el-time-picker
            v-model="form.time"
            class="time-picker"
            value-format="timestamp"
          ></el-time-picker
          >发送一条
        </el-form-item>
        <el-form-item prop="dayCount">
          持续发送
          <el-input-number
            v-model="form.dayCount"
            :min="1"
            label="描述文字"
          ></el-input-number>
          天，每天发送一条
        </el-form-item>
        <el-form-item prop="tag">
          <el-checkbox v-model="form.tag"
            >若某个会员有多条消息涉及同一活动链接时，仅发送最近的一条</el-checkbox
          >
        </el-form-item>
      </el-form-item>
      <!-- 底部按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          @click="handleSend"
          :disabled="!this.form.content.length || !this.form.targetCrowd"
          >发送</el-button
        >
        <el-button @click="handleResetForm">取消</el-button>
      </el-form-item>
    </el-form>
    <phone-show
      :sign="form.sign"
      :message="form.content"
      :url="$refs.msgContent && $refs.msgContent.msgUrl"
    >
    </phone-show>
  </div>
</template>

<script>
import ShortMessageContent from '@/container/message/short-message-content'
import PhoneShow from '@/container/message/phone-show'
import {TimePicker, InputNumber} from 'element-ui'
import {newActivityMessage} from '@/const/api'

const GROUPS = {
  1: '昨日未登录新会员',
  2: '昨日已登录新会员',
  3: '昨日未参与活动的会员'
}
const ACTIVITY_URL = '{activityUrl}'
export default {
  components: {
    ShortMessageContent,
    'el-time-picker': TimePicker,
    'el-input-number': InputNumber,
    PhoneShow
  },
  data() {
    return {
      form: {
        targetCrowd: '',
        content: '',
        sign: '',
        msgUrl: '',
        time: new Date().setHours(9, 0, 0),
        dayCount: 7,
        tag: false
      },
      rules: {
        targetCrowd: [
          {required: true, message: '请选择收信人', trigger: 'blur'}
        ],
        content: [{required: true, message: '请输入短信内容', trigger: 'blur'}]
      },
      receiversGroup: Object.keys(GROUPS).map(el => {
        return {
          label: GROUPS[el],
          value: `${el}`
        }
      })
    }
  },
  methods: {
    handleSend() {
      const content = this.form.content.replace(
        this.$refs.msgContent.msgUrl,
        ACTIVITY_URL
      )
      let data = {
        content: `[${this.form.sign}]${content}`,
        dayCount: this.form.dayCount,
        time: this.form.time,
        targetCrowd: this.form.targetCrowd,
        msgUrl: this.$refs.msgContent.msgUrl,
        sign: this.form.sign,
        tag: this.form.tag,
        activityId: this.$refs.msgContent.selectedActivity.id
      }
      this.$msgbox({
        title: '提示',
        message: '是否确认发送短信?',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '发送中...'
            this.sendMessages(data)
            instance.confirmButtonLoading = false
            done()
          } else {
            done()
          }
        }
      })
        .then(confirm => {})
        .catch(cacel => {})
    },
    sendMessages(data) {
      this.$axios
        .post(newActivityMessage, data)
        .then(res => {
          this.$message.success('发送短信成功!')
          this.$router.back()
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleResetForm() {
      this.$msgbox({
        title: '提示',
        message: '取消后表单内容将重置，是否确认取消?',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            this.$refs.form.resetFields()
            this.$router.back()
            done()
          } else {
            done()
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.add-marketing {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  margin: 0 auto;

  .form {
    width: 50%;
  }

  .time-picker {
    margin: 0 10px;
  }
}
</style>
