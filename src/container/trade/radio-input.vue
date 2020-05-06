<!--
  /**
   * 结合单选框和其他表单内容的组件, value值是选中的值，或者是选中的表单项内容
   */ 
-->
<template>
  <el-radio-group class="radio-input" v-model="form">
    <div v-for="(item, index) in content" :key="index" class="inline-block">
      <el-radio :label="item.value">{{ item.label }}</el-radio>
      <el-input
        class="extra-item"
        v-if="item.type === 'input'"
        v-model="selectForm[item.key]"
        :disabled="form != item.value"
      />

      <el-date-picker
        class="extra-item"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        v-if="item.type === 'datetime'"
        v-model="selectForm[item.key]"
        :disabled="form != item.value"
      />
    </div>
  </el-radio-group>
</template>
<script>
import {DatePicker} from 'element-ui'
import {formatDate} from '@/const/filter'

const DATETIME = 'datetime'

export default {
  name: 'radio-input',
  props: {
    content: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: '0',
      selectForm: {},
      selectItem: {}
    }
  },
  watch: {
    form(val) {
      if (!val) return

      this.selectItem = this.content.find(item => val === item.value) || {}

      if (!this.selectItem.type) this.$emit('input', val)
    },
    selectForm: {
      handler(val) {
        let value = ''
        if (this.selectItem.type === DATETIME) {
          value = this.selectForm[this.selectItem.key].map(item =>
            item.getTime()
          )
        }
        this.$emit('input', [
          this.form,
          ...(value || [val[this.selectItem.key]])
        ])
      },
      deep: true
    }
  }
}
</script>
<style lang="less">
.radio-input {
  .inline-block {
    display: inline-block;
  }

  .inline-block + .inline-block {
    margin-left: 30px;
  }

  .extra-item {
    width: auto;
    margin-left: 30px;
  }
}
</style>
