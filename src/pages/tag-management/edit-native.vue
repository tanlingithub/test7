<template>
  <div class="edit-native" v-loading="loading">
    <h1 class="mb20">编辑原生标签</h1>

    <el-form label-width="100px" label-suffix="：">
      <el-form-item label="标签名称">
        <el-input
          style="max-width:222px;"
          v-model="form.tagName"
          placeholder="请输入标签名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="标签分类">
        <el-select v-model="form.tagType" placeholder="请选择标签分类">
          <el-option
            v-for="item in TAG_TYPE_LIST"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联表属性">
        {{ form.mean }}
      </el-form-item>
      <el-form-item label="属性类型">
        {{ form.typeMean }}
      </el-form-item>
      <el-form-item label="属性值">
        <p>数据库存储值 对应属性中文表达</p>
        <div
          v-if="form.type === TYPE_MAP.archar"
          v-for="(item, index) in form.valueList"
          :key="index"
          class="data-item"
        >
          <el-input v-model="item.value" placeholder="请输入"></el-input>
          <el-input v-model="item.label" placeholder="请输入"></el-input>
          <el-button
            v-if="index === 0"
            type="primary"
            icon="el-icon-plus"
            @click="addData"
          ></el-button>
          <el-button
            v-else
            type="danger"
            icon="el-icon-delete"
            @click="deleteData(index)"
          ></el-button>
        </div>

        <div v-if="form.type !== TYPE_MAP.archar">
          ————
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="$router.back()">取 消</el-button>
        <el-button type="primary" @click="onSubmit">保 存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {nativeTagInfo} from '@/const/api.js'

import {
  TYPE_MAP,
  TAG_TYPE_MAP,
  TAG_TYPE_LIST,
  DEFAULT_KEY_VALUE
} from '@/const/common.js'

export default {
  name: 'edit-native',
  data() {
    return {
      loading: false,
      TYPE_MAP,
      TAG_TYPE_MAP,
      TAG_TYPE_LIST,
      form: {}
      // {
      //   key: "sex",
      //   mean: "性别",
      //   type: "archar",
      //   typeMean: "字符串",
      //   tagName: '性别',
      //   tagType: '1',
      //   valueList: [
      //     {label: "男", value: 1},
      //     {label: "女", value: 2},
      //     {label: "未知", value: 0}
      //   ]
      // }
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
        .$get(nativeTagInfo(this.ID))
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
      console.log(this.form)

      this.$axios
        .$put(nativeTagInfo(this.ID), this.form)
        .then(res => {
          this.loading = false
          this.$message.success('操作成功')
          this.$router.back()
        })
        .catch(e => {
          this.loading = false
          this.$message.error(e.msg)
        })
    },
    addData() {
      this.form.valueList.push({...DEFAULT_KEY_VALUE})
    },
    deleteData(index) {
      this.$confirm('确认移除吗？')
        .then(res => {
          res === 'confirm' && this.form.valueList.splice(index, 1)
        })
        .catch(e => {})
    }
  }
}
</script>
<style lang="less">
.edit-native {
  max-width: 800px;

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
