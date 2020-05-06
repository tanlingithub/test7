<template>
  <div class="add-derive" v-loading="loading">
    <h1 class="mb20">新增派生标签</h1>
    <el-steps :active="activeStep" align-center class="mb20">
      <el-step :title="i.title" v-for="i in stepList" :key="i.name"></el-step>
    </el-steps>

    <!-- step 选择原生标签 -->
    <div v-show="activeStep === 0" class="mb20">
      <el-data-table
        @selection-change="handleSelectionChange"
        ref="table"
        v-bind="tableConfig"
      ></el-data-table>
    </div>
    <!-- step 选择原生标签 -->

    <!-- step 设置派生规则 -->
    <div v-show="activeStep === 1 || activeStep === 2" class="mb20">
      <el-table border :data="selectList">
        <el-table-column label="派生标签名称">
          <template slot-scope="{row}">
            <el-input
              v-if="activeStep === 1"
              v-model="row.deriveName"
              placeholder="请输入"
            ></el-input>
            <p v-else>{{ row.deriveName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="标签分类">
          <template slot-scope="{row}">
            <el-select
              v-if="activeStep === 1"
              v-model="row.tagType"
              placeholder="请选择"
            >
              <el-option
                v-for="item in TAG_TYPE_LIST"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <p v-else>{{ TAG_TYPE_MAP[row.tagType] }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="关联原生标签"></el-table-column>
        <el-table-column label="派生规则">
          <template slot-scope="scope">
            <p v-if="scope.row.deriveRules && scope.row.deriveRules.length > 0">
              按区间统计人数：
              <span v-for="(i, index) in scope.row.deriveRules" :key="index">
                {{ CONDITION_SYMBOL_MAP[i.leftCondition] }}{{ i.leftValue }},{{
                  i.rightValue
                }}{{ CONDITION_SYMBOL_MAP[i.rightCondition] }}
              </span>
            </p>
            <p v-else>未设置</p>
          </template>
        </el-table-column>
        <el-table-column label="操作" v-if="activeStep === 1">
          <template slot-scope="scope">
            <el-button type="text" @click="setting(scope)">设 置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- step 设置派生规则 -->

    <div style="text-align:center;">
      <el-button @click="$router.back()">取 消</el-button>
      <el-button
        type="primary"
        :disabled="selectList.length === 0"
        v-if="activeStep < stepList.length - 1"
        @click="addActiveStep"
        >下一步</el-button
      >
      <el-button type="primary" v-else @click="submitData">确认</el-button>
      <el-button v-show="activeStep > 0" @click="activeStep--"
        >上一步</el-button
      >
    </div>

    <el-dialog title="设置派生规则" :visible.sync="dialogVisible" width="800px">
      <derive-setting ref="deriveSetting" :form="form"></derive-setting>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getDeriveSettingData"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {Steps, Step} from 'element-ui'
import {addDerive, nativeTagList} from '@/const/api.js'

import {
  TAG_TYPE_MAP,
  TAG_TYPE_LIST,
  CONDITION_SYMBOL_MAP
} from '@/const/common.js'

import DeriveSetting from '@/container/tag/derive-setting.vue'

export default {
  name: 'add-derive',
  components: {
    'el-steps': Steps,
    'el-step': Step,
    DeriveSetting
  },
  data() {
    return {
      TAG_TYPE_MAP,
      TAG_TYPE_LIST,
      CONDITION_SYMBOL_MAP,
      dialogVisible: false,
      loading: false,
      // 当前激活的步骤
      activeStep: 0,
      // 步骤列表
      stepList: [
        {
          title: '选择原生标签',
          name: 1
        },
        {
          title: '设置派生规则',
          name: 2
        },
        {
          title: '完成',
          name: 3
        }
      ],
      selectList: [],
      // [
      //   {
      //     "relationName": null,
      //     "tagTypeId": null,
      //     "name": "性别",
      //     "count": null,
      //     "columnComment": "关联表属性",
      //     "description": "性别标签描述",
      //     "tagTypeName": "自然属性",
      //     "relationId": null,
      //     "countRule": null,
      //     "id": "001",
      //     "createdBy": "admin",
      //     "createdAt": 1562060746369,
      //     "status": "运行中",
      //     "tagType": "1",
      //     "typeMean": "字符串",
      //     "deriveRules": []
      //   }
      // ],
      tableConfig: {
        url: nativeTagList,
        hasNew: false,
        hasDelete: false,
        hasEdit: false,
        hasOperation: false,
        tableAttrs: {border: true},
        columns: [
          {type: 'selection', width: 50},
          {prop: 'name', label: '原生标签名称', minWidth: 100},
          {
            prop: 'tagType',
            label: '标签分类',
            formatter: row => TAG_TYPE_MAP[row.tagType]
          },
          {prop: 'columnComment', label: '关联表属性'},
          {prop: 'typeMean', label: '属性类型'}
        ]
      },
      form: {},
      prevIndex: 0
    }
  },
  methods: {
    handleSelectionChange(list) {
      this.selectList = [].concat(list)
    },
    submitData() {
      console.log(this.selectList)

      this.loading = true
      this.$axios
        .post(addDerive, this.selectList)
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
    addActiveStep() {
      this.activeStep++
    },
    setting(scope) {
      this.form = scope.row
      this.prevIndex = scope.$index
      this.dialogVisible = true
    },
    getDeriveSettingData() {
      let data = this.$refs.deriveSetting.getValue()

      this.$set(this.selectList, this.prevIndex, {...data})
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="less">
.add-derive {
  max-width: 1200px;

  .data-item {
    display: flex;
    justify-content: space-between;

    button {
      margin-left: 4px;
    }

    &:not(:first-child) {
      margin-top: 5px;
    }
  }
}
</style>
