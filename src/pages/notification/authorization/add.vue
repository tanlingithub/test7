<template>
  <el-form-renderer
    class="account-bound"
    :content="content"
    labelPosition="left"
    labelWidth="100px"
    ref="formRender"
  >
    <el-button type="primary" @click="handleBoundAccount">绑定</el-button>
    <el-button type="danger" @click="test">取消</el-button>
  </el-form-renderer>
</template>

<script>
import {accountBind, autoToPage} from '@/const/api'

export default {
  data() {
    return {
      content: [
        {
          $id: 'account',
          $type: 'input',
          label: '账号',
          $el: {
            placeholder: '请输入'
          },
          rules: [{required: true, message: '请输入账号', trigger: 'blur'}]
        },
        {
          $id: 'appId',
          $type: 'input',
          label: '开发者ID',
          $el: {
            placeholder: '请输入'
          },
          rules: [{required: true, message: '请输入开发者ID', trigger: 'blur'}]
        },
        {
          $id: 'secret',
          $type: 'input',
          label: '开发者密码',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {required: true, message: '请输入开发者密码', trigger: 'blur'}
          ]
        },
        {
          $id: 'nickName',
          $type: 'input',
          label: '公众号昵称',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {required: true, message: '请输入公众号昵称', trigger: 'blur'}
          ]
        },
        {
          $id: 'wechatNumber',
          $type: 'input',
          label: '公众微信号',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {required: true, message: '请输入公众微信号', trigger: 'blur'}
          ]
        },
        {
          $id: 'type',
          $type: 'select',
          label: '公众号类型',
          $el: {
            placeholder: '请选择'
          },
          $options: [{label: '认证服务号', value: 'AUTH_SERVICE_NUMBER'}],
          rules: [
            {required: true, message: '请选择公众号类型·', trigger: 'blur'}
          ]
        },
        {
          $id: 'info',
          $type: 'input',
          label: '主体信息',
          $el: {
            placeholder: '请输入',
            type: 'textarea'
          },
          rules: [{required: true, message: '请输入主体信息', trigger: 'blur'}]
        }
      ]
    }
  },
  methods: {
    test() {
      this.$axios.$get(autoToPage('http://cdn-dev.deepexi.com')).then(resp => {
        location.replace(resp)
      })
    },
    handleBoundAccount() {
      //判断表单项内容是否为空
      const form = this.$refs.formRender.getFormValue()
      let canBound = true
      this.$refs.formRender.validate(valid => {
        if (!valid) {
          this.$message.error('必填项不能为空')
          canBound = false
          return false
        }
      })
      if (!canBound) {
        return
      }
      this.bound(form)
    },
    bound(form) {
      this.$axios
        .post(accountBind, form)
        .then(res => {
          this.$message.success('绑定成功')

          this.$refs.formRender.resetFields()
          this.$router.back()
        })
        .catch(err => {
          console.log(err)
        })
    },
    clearValue() {
      this.$refs.formRender.resetFields()
    }
  }
}
</script>

<style>
.account-bound {
  width: 50%;
  margin: 0 auto;
}
</style>
