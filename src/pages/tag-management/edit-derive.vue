<template>
  <div class="edit-derive" v-loading="loading">
    <h1 class="mb20">编辑派生标签</h1>

    <el-form label-width="140px" label-suffix="：">
      <el-form-item label="派生标签名称">
        <el-input
          style="max-width:222px;"
          v-model="form.deriveName"
          placeholder="请输入派生标签名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="派生标签分类">
        <el-select v-model="form.tagType" placeholder="请选择派生标签分类">
          <el-option
            v-for="item in TAG_TYPE_LIST"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联表原生标签">
        {{ form.mean }}
      </el-form-item>
      <el-form-item label="派生规则">
        <derive-setting
          ref="deriveSetting"
          v-if="form.id"
          :form="form"
        ></derive-setting>
      </el-form-item>
      <el-form-item style="text-align:center;">
        <el-button @click="$router.back()">取 消</el-button>
        <el-button type="primary" @click="onSubmit">保 存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {deriveTagInfo} from '@/const/api.js'

import DeriveSetting from '@/container/tag/derive-setting.vue'

import {
  TYPE_MAP,
  TAG_TYPE_MAP,
  TAG_TYPE_LIST,
  DEFAULT_KEY_VALUE
} from '@/const/common.js'

export default {
  name: 'edit-derive',
  components: {
    DeriveSetting
  },
  data() {
    return {
      loading: false,
      TYPE_MAP,
      TAG_TYPE_MAP,
      TAG_TYPE_LIST,
      form: {}
    }
  },
  computed: {
    ID() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.getTagInfo()
  },
  methods: {
    getTagInfo() {
      this.loading = true

      this.$axios
        .$get(deriveTagInfo(this.ID))
        .then(res => {
          this.loading = false
          this.form = res.payload
        })
        .catch(e => {
          this.loading = false
          this.$message.error(e.msg)
        })
    },
    onSubmit() {
      let data = this.$refs.deriveSetting.getValue()

      this.$axios
        .$put(deriveTagInfo(this.ID), data)
        .then(res => {
          this.loading = false
          this.$message.success('操作成功')
          this.$router.back()
        })
        .catch(e => {
          this.loading = false
          this.$message.error(e.msg)
        })
    }
  }
}
</script>
<style lang="less">
.edit-derive {
  max-width: 1000px;

  .data-item {
    display: flex;
    justify-content: space-between;
    max-width: 300px;
    margin-bottom: 5px;

    .el-input {
      margin-right: 4px;
    }
  }
}
</style>
