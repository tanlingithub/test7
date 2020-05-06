<template>
  <div class="derive-setting">
    <el-form label-width="100px" label-suffix="：">
      <el-form-item label="规则类型">
        <el-radio-group v-model="ruleForm.ruleType">
          <el-radio label="1">按区间统计人数</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="设置区间">
        <el-table :data="ruleForm.deriveRules">
          <el-table-column label="区间名称" width="130px">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.intervalName"
                :placeholder="`统计区间${scope.$index}`"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="条件">
            <template slot-scope="scope">
              <el-select v-model="scope.row.leftCondition" placeholder="请选择">
                <el-option
                  v-for="item in CONDITION_LIST"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="赋值">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.leftValue"
                placeholder="请输入"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column width="24px;" v-if="ruleForm.deriveRules.length > 0">
            <template slot-scope="scope"
              >,</template
            >
          </el-table-column>
          <el-table-column label="条件">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.rightCondition"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in CONDITION_LIST"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="赋值">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.rightValue"
                placeholder="请输入"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100px">
            <template slot="header" slot-scope="scope">
              <el-button type="text" icon="el-icon-plus" @click="addData"
                >添加</el-button
              >
            </template>

            <template slot-scope="scope">
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="deleteData(scope.$index)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {CONDITION_LIST} from '@/const/common.js'

const DEFAULT_RULES = {
  intervalName: '',
  leftCondition: '',
  leftValue: '',
  rightCondition: '',
  rightValue: ''
}

export default {
  name: 'derive-setting',
  props: {
    form: {
      type: Object,
      default() {
        return {
          deriveRules: []
        }
      }
    }
  },
  watch: {
    form: {
      handler(val) {
        this.ruleForm = Object.assign(
          {ruleType: '1'},
          JSON.parse(JSON.stringify(val))
        )
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      CONDITION_LIST,
      ruleForm: {}
    }
  },
  methods: {
    addData() {
      this.ruleForm.deriveRules.push({...DEFAULT_RULES})
    },
    deleteData(index) {
      this.$confirm('确认移除吗？')
        .then(res => {
          res === 'confirm' && this.ruleForm.deriveRules.splice(index, 1)
        })
        .catch(e => {})
    },
    getValue() {
      return JSON.parse(JSON.stringify(this.ruleForm))
    }
  }
}
</script>
<style lang="less">
.derive-setting {
}
</style>
