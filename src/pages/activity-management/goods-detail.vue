<template>
  <div class="activity-goods-detail">
    <el-form-renderer
      :content="content"
      label-width="150px"
      class="form-box"
      ref="formRender"
      :disabled="isView"
    >
      <el-form-item v-if="!isView">
        <el-button type="primary" @click="handleSave('formRender')"
          >保存</el-button
        >
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form-renderer>
  </div>
</template>
<script>
import UploadToAli from '@femessage/upload-to-ali'
import VEditor from '@femessage/v-editor'
import {preComfirm} from '@/const/utils'
export default {
  name: 'activity-goods-detail',
  components: {
    UploadToAli,
    VEditor
  },
  data() {
    return {
      saveLoading: false,
      initLoading: false,
      content: [
        {
          $type: 'input',
          $id: 'name',
          label: '商品名称',
          $el: {
            placeholder: '请输入',
            maxlength: 30
          },
          rules: [
            {
              required: true,
              message: '请输入商品名称',
              trigger: 'blur'
            }
          ]
        },
        {
          $type: 'input',
          $id: 'type',
          label: '商品分类',
          $el: {
            placeholder: '请输入',
            maxlength: 30
          },
          rules: [
            {
              required: true,
              message: '请输入商品类别',
              trigger: 'blur'
            }
          ]
        },
        {
          $type: 'input',
          $id: 'salePrice',
          label: '销售价格',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {
              required: true,
              required: '不能为空',
              trigger: 'blur'
            },
            {
              pattern: /^\d{1,5}(\.\d{1,2})?$/,
              message: '小数点前最多5位，小数点后最多2位',
              trigger: 'blur'
            }
          ]
          // outputFormat: salePrice => parseFloat(salePrice).toFixed(2),
          // inputFormat: row => parseFloat(row.salePrice).toFixed(2)
        },
        {
          $id: 'imageUrl',
          component: UploadToAli,
          label: '商品图片',
          $el: {
            max: 20,
            size: 10240,
            multiple: true
          },
          rules: [
            {
              required: true,
              trigger: 'blur',
              message: '至少添加1张图片'
            }
          ],
          outputFormat: imageUrl => {
            if (imageUrl) {
              return imageUrl.join()
            }
          },
          inputFormat: row => {
            if (row.imageUrl) {
              return row.imageUrl.split(',')
            }
          }
        },
        {
          $type: 'input',
          component: VEditor,
          $id: 'description',
          label: '商品描述',
          $el: {
            height: 268,
            width: '100%'
          },
          rules: [
            {
              required: true,
              message: '请输入商品描述',
              trigger: 'blur'
            }
          ]
        }
      ]
    }
  },
  created() {
    const {type, id} = this.$route.query
    this.isView = type == 'view'
    this.isEdit = type == 'edit'
    this.isNew = !!!id
    id && this.initData(id)
  },
  methods: {
    handleSave(refKey) {
      const {getFormValue, validate} = this.$refs[refKey]
      validate(valid => {
        if (!valid) return
        const formValue = getFormValue()
        this.requestFunc(formValue)
      })
    },
    async requestFunc(formValue) {
      try {
        this.saveLoading = true
        await this.$axios.$post('/goods/detail', formValue)
        this.$router.go(-1)
      } catch (err) {
        this.$message.error(err)
      } finally {
        this.saveLoading = false
      }
    },
    async initData(id) {
      try {
        this.initLoading = true
        const {payload} = await this.$axios.$get('/goods/detail' + `?id=${id}`)
        this.$refs[formRender].updateForm(payload)
      } catch (err) {
        this.$message.error(err)
      } finally {
        this.initLoading = false
      }
    },
    handleCancel() {
      const params = {
        content: '确认取消当前填写吗'
      }
      params.callbackYes = () => {
        this.$router.go(-1)
      }
      preComfirm.call(this, params)
    }
  }
}
</script>
<style lang="less" scoped>
.activity-goods-detail {
  .form-box {
    max-width: 800px;
    margin: 0 auto;
  }
  /deep/.upload-item {
    margin: 0 5px;
  }
}
</style>
