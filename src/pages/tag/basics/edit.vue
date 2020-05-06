<template>
  <el-form-renderer
    ref="basicsTagForm"
    class="basics-edit"
    :content="content"
    label-width="150px"
  >
    <!-- TODO 一期暂时不做 -->
    <!-- <el-form-item label="关联数据表属性" required>
      <el-button type="primary">请选择</el-button>
    </el-form-item> -->
    <el-form-item>
      <el-button type="primary" @click="save" :loading="saveLoading"
        >保存</el-button
      >
      <el-button @click="$router.back()">取消</el-button>
    </el-form-item>
  </el-form-renderer>
</template>

<script>
import {tagList, tagTypeList} from '@/const/api'

export default {
  data() {
    return {
      content: [
        {
          $type: 'input',
          $id: 'name',
          label: '标签名称',
          $el: {placeholder: '请输入', maxlength: 15},
          rules: [{required: true, message: '请输入标签名称', trigger: 'blur'}]
        },
        // {
        //   $type: 'select',
        //   $id: 'tagTypeId',
        //   label: '标签分类',
        //   $el: {placeholder: '请选择'},
        //   rules: [{required: true, message: '请输入标签分类', trigger: 'blur'}],
        //   $options: [],
        //   outputFormat: val => {
        //     if (!val) return {}
        //
        //     let index = this.tagTypeList.findIndex(item => item.value === val)
        //     return {
        //       tagTypeName: this.tagTypeList[index].label,
        //       tagTypeId: val
        //     }
        //   }
        // },
        {
          $type: 'input',
          $id: 'description',
          label: '标签描述',
          $el: {placeholder: '请输入', type: 'textarea', maxlength: 60}
        }
      ],
      saveLoading: false,
      tagTypeList: []
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  async mounted() {
    // await this.getTagType()
    if (this.id) await this.getBasicTag()
  },
  methods: {
    // 获取标签详情
    async getBasicTag() {
      let resp = await this.$axios.$get(`${tagList}/${this.id}?type=0`)
      this.$refs.basicsTagForm.updateForm({...resp.payload})
    },
    // 获取标签分类
    async getTagType() {
      let resp = await this.$axios.$get(tagTypeList)

      this.tagTypeList = resp.payload.map(item => {
        return {label: item.name, value: item.id}
      })
      this.$refs.basicsTagForm.setOptions('tagTypeId', [...this.tagTypeList])
    },
    // 保存/编辑基础标签
    save() {
      this.$refs.basicsTagForm.validate(valid => {
        if (!valid) return

        this.saveLoading = true
        let method = !this.id ? '$post' : '$put'
        let url = !this.id ? tagList : `${tagList}/${this.id}`

        // TODO,后端这一块还没做，先传假的数据
        let data = Object.assign(
          {
            type: 0, // 基础标签类型
            datasourceId: '123',
            tableName: 'tableName',
            columnName: '关联表',
            columnType: 'columnType',
            columnComment: '属性',
            countRule: '1',
            ruleDtoList: [
              {
                leftBorderFlag: 0,
                leftBorderValue: '100',
                rightBorderFlag: 0,
                rightBorderValue: '123'
              }
            ]
          },
          this.$refs.basicsTagForm.getFormValue()
        )
        this.$axios[method](url, data)
          .then(resp => {
            this.$message.success('操作成功')
            this.$router.back()
          })
          .catch(e => console.log(e))
          .finally(() => {
            this.saveLoading = false
          })
      })
    }
  }
}
</script>

<style></style>
