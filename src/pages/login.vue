<template>
  <div class="login">
    <!--样式在layout/login-->
    <div class="main">
      <el-form
        :model="form"
        status-icon
        :rules="rules"
        ref="loginForm"
        class=""
      >
        <el-form-item label="租户" prop="tenantId">
          <el-input
            placeholder="租户编码"
            v-model.trim="form.tenantId"
          ></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input placeholder="账号" v-model.trim="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="密码"
            type="password"
            v-model.trim="form.password"
            auto-complete="off"
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            type="primary"
            @click="login"
            :loading="loading"
            size="medium"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
      <div style="text-align: right;">
        <span @click="registerVisible = true">未有账号，直接注册</span>
      </div>
    </div>

    <el-dialog
      :visible.sync="registerVisible"
      :modal-append-to-body="false"
      width="400px"
      title="注册账户"
    >
      <el-form-renderer
        ref="registerForm"
        label-width="70px"
        :content="registerContent"
      ></el-form-renderer>
      <div slot="footer">
        <el-button @click="registerVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="registerConfirm"
          :loading="registerLoading"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {registerApi} from '@/const/api'
export default {
  layout: 'login',
  name: 'login',
  components: {},
  data() {
    return {
      loading: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        tenantId: [
          {required: true, message: '请输入租户编码', trigger: 'blur'}
        ],
        username: [{required: true, message: '请输入账号', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}]
      },
      registerVisible: false,
      registerLoading: false,
      registerContent: [
        {
          $type: 'input',
          $id: 'tenantId',
          label: '租户',
          $el: {placeholder: '请输入'},
          rules: [{required: true, message: '请输入租户', trigger: 'blur'}]
        },
        {
          $type: 'input',
          $id: 'username',
          label: '用户名',
          $el: {placeholder: '请输入'},
          rules: [{required: true, message: '请输入用户名', trigger: 'blur'}]
        },
        {
          $type: 'input',
          $id: 'password',
          label: '密码',
          $el: {placeholder: '请输入', type: 'password'},
          rules: [{required: true, message: '请输入密码', trigger: 'blur'}]
        }
      ]
    }
  },
  methods: {
    login() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true

          this.$store.commit('update', {
            tenantId: this.form.tenantId
          })

          this.$store
            .dispatch('login', {
              username: this.form.username,
              password: this.form.password
            })
            .then(() => {
              this.loading = false
              this.$router.replace('/')
            })
            .catch(e => {
              // TODO 异常处理
              this.loading = false
              console.log(e)
            })
        } else {
          return false
        }
      })
    },
    registerConfirm() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return
        this.registerLoading = true

        let form = this.$refs.registerForm.getFormValue()
        this.$store.commit('update', {
          tenantId: form.tenantId
        })
        this.$axios
          .$post(registerApi, {
            username: form.username,
            password: form.password
          })
          .then(resp => {
            this.$message.success('注册成功!')
          })
          .catch(e => console.log(e))
          .finally(() => {
            this.registerVisible = false
            this.registerLoading = false
          })
      })
    }
  }
}
</script>
