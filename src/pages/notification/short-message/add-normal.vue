<template>
  <div class="add-normal">
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      :rules="rules"
      class="form"
    >
      <!-- 收信人 -->
      <el-form-item label="收信人" prop="strMobiles">
        <el-input
          type="textarea"
          @change="mobilesChange"
          v-model="form.strMobiles"
          :rows="5"
          resize="none"
          placeholder="号码之间用';'隔开"
        ></el-input>
        <el-button type="text" @click="dialogVisible = true">
          <i class="el-icon-circle-plus-outline"></i>添加已有会员
        </el-button>
        <span class="tip"
          >已添加 <span>{{ mobilesNum }}</span
          >/1000个电话
        </span>
      </el-form-item>
      <!-- 会员分组弹窗 -->
      <el-dialog
        title="按会员分组选择会员"
        :visible.sync="dialogVisible"
        width="50%"
      >
        <el-table :data="vipGroupList" @selection-change="handleSelectChange">
          <el-table-column type="selection" width="55"></el-table-column>
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
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="affirmSelected">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 短信内容 -->
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
      <!-- 发送方式 -->
      <el-form-item label="发送方式" prop="time">
        <el-radio v-model="radio" label="atOnce">立即发送</el-radio>
        <el-radio v-model="radio" label="setTime">定时发送</el-radio>
        <el-date-picker
          v-show="radio == 'setTime'"
          v-model="form.time"
          type="datetime"
          placeholder="选择日期时间"
          value-format="timestamp"
        ></el-date-picker>
      </el-form-item>
      <!-- 底部按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          @click="clickSendbutton"
          :disabled="!this.form.content.length || !this.form.strMobiles.length"
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
import {memberGroupList, meberMobile, newNormalMessage} from '@/const/api'
import {regPhone} from '@/const/regexp'
import lodashTrim from 'lodash/trim.js'
import {Tag} from 'element-ui'
import ShortMessageContent from '@/container/message/short-message-content'
import PhoneShow from '@/container/message/phone-show'

const SEND_TIME = {atOnce: 'atOnce', setTime: 'setTime'}
const ACTIVITY_URL = '{activityUrl} '
const GROUP = 'group'
// 手机号最大输入数量
const maxPhoneNum = 1000
// 非法手机号字符拼接后最大显示长度
const illPhoneStrShowLength = 30
// 检验会员手机号
const validMemmberPhoneList = (rule, value, callback) => {
  // 输入框中所有的手机号
  let phoneList = value.split(/;|；/).filter(item => {
    return item && true
  })
  if (phoneList.length === 0) {
    return callback(new Error('请输入/选择收信人手机号'))
  }
  if (phoneList.length > maxPhoneNum) {
    return callback(new Error(`最多输入${maxPhoneNum}个手机号`))
  }
  // 非法手机号数组
  let illegalPhoneList = phoneList.filter(item => {
    return item && !regPhone().test(lodashTrim(item))
  })
  if (illegalPhoneList && illegalPhoneList.length > 0) {
    let illegalPhoneStr = illegalPhoneList.join(' ,')
    let illegalPhoneStrShow =
      illegalPhoneStr.length > illPhoneStrShowLength
        ? illegalPhoneStr.substr(0, illPhoneStrShowLength) + '...'
        : illegalPhoneStr
    return callback(new Error(`存在非法手机号:[${illegalPhoneStrShow}]`))
  }
  callback()
}
export default {
  components: {
    'el-tag': Tag,
    ShortMessageContent,
    PhoneShow
  },
  data() {
    return {
      mobilesNum: 0,
      radio: 'atOnce',
      vipGroupList: [], //会员分组列表
      selectedVipGroup: [], //被选择了的会员分组
      dialogVisible: false, //会员分组弹窗
      form: {
        content: '',
        sign: '',
        type: '',
        time: Date.now(),
        strMobiles: ''
      },
      rules: {
        strMobiles: [
          {required: true, trigger: 'change', validator: validMemmberPhoneList}
        ],
        content: [
          {required: true, message: '请输入短信内容', trigger: 'change'}
        ]
      }
    }
  },
  mounted() {
    this.getVipGroupsList()
  },
  methods: {
    // 点击发送按钮
    clickSendbutton() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.handleSend()
        } else {
          return false
        }
      })
    },
    // 确认发送操作
    handleSend() {
      if (this.radio == SEND_TIME.setTime && this.form.time < Date.now()) {
        this.$message.error('当前时间不可发送')
        return
      }
      // 发送给后端的短信内容需要把链接进行转换
      const content = this.form.content.replace(
        this.$refs.msgContent.msgUrl,
        ACTIVITY_URL
      )
      let data = {
        mobiles: this.form.strMobiles
          .split(/;|；/)
          .filter(el => el)
          .map(el => `${el}`),
        content: `[${this.form.sign}]${content}`,
        sign: this.form.sign,
        type: this.radio == SEND_TIME.atOnce ? 1 : 2,
        time: this.form.time,
        msgUrl: this.$refs.msgContent.msgUrl,
        activityId: this.$refs.msgContent.selectedActivity.id,
        activityTypeEnum:
          this.$refs.msgContent.activityType === GROUP ? '0' : '1'
      }

      this.$msgbox({
        title: '提示',
        message: '是否确认发送短信?',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            await this.sendMessages(data)
            instance.confirmButtonLoading = false
          }
          done()
        }
      }).catch(cacel => {})
    },
    // 取消操作
    handleResetForm() {
      this.$msgbox({
        title: '提示',
        message: '取消后表单内容将清空，是否确认取消?',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') this.$router.back()
          done()
        }
      }).catch(cacel => {})
    },
    // 发送短信
    async sendMessages(data) {
      try {
        await this.$axios.post(newNormalMessage, data)
        this.$message.success('发送短信成功!')
        this.$router.back()
      } catch (e) {
        console.log(e)
      }
    },
    //当手机号输入框值发生改变时，获取已输入的手机号码数量
    mobilesChange(val) {
      if (val.length) {
        this.mobilesNum = val
          .split(/;|；/)
          .filter(el => el)
          .map(el => `${el}`).length
      } else {
        this.mobilesNum = 0
      }
    },
    handleSelectChange(val) {
      //被选择的会员分组发生变化
      this.selectedVipGroup = val
    },
    affirmSelected() {
      //确认选择会员分组并且通过会员分组id获取相应会员分组手机号
      let data = this.selectedVipGroup.map(el => el.id)
      this.$axios.post(meberMobile, data).then(res => {
        //获取的payload是一个直接包裹phoneCode的数组
        this.mobiles = res.data.payload.join(';')
        if (this.form.strMobiles) {
          this.form.strMobiles = this.form.strMobiles + ';' + this.mobiles
        } else {
          this.form.strMobiles = this.mobiles
        }
      })
      this.dialogVisible = false
    },
    getVipGroupsList() {
      //获取会员分组列表
      this.$axios.get(memberGroupList).then(res => {
        this.vipGroupList = res.data.payload.content
      })
    }
  }
}
</script>

<style lang="less" scoped>
.add-normal {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  margin: 0 auto;

  .form {
    width: 50%;
  }

  .tip {
    float: right;
  }
}
</style>
