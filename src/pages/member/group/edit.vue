<template>
  <div class="group-edit">
    <el-form-renderer
      v-loading="isLoading"
      ref="groupForm"
      :content="content"
      label-width="100px"
    >
      <el-form-item label="约束条件" required>
        <el-button type="primary" @click="conditionVisible = true"
          >添加条件</el-button
        >
        <div
          class="group-edit-restrictions"
          v-for="(item, index) in rules"
          :key="index"
        >
          <el-input disabled :value="item.name || item.relationName"></el-input>
          <!-- 分类型标签 -->
          <template v-if="item.type === 1">
            <el-select v-model="item.symbol">
              <el-option
                v-for="(val, valIndex) in Object.keys(typeRule)"
                :key="valIndex"
                :value="val"
                :label="typeRule[val]"
              ></el-option>
            </el-select>
            <el-select v-model="item.tagId">
              <el-option
                v-for="(val, valIndex) in conditionList[index]"
                :key="valIndex"
                :value="val.attributeId"
                :label="val.tagName"
              ></el-option>
            </el-select>
          </template>
          <!-- 统计型标签 -->
          <template v-if="item.type === 2">
            <el-select v-model="item.symbol">
              <el-option
                v-for="(val, valIndex) in Object.keys(tagRule)"
                :key="valIndex"
                :value="val"
                :label="tagRule[val]"
              ></el-option>
            </el-select>
            <template v-if="item.number">
              <el-input v-model="item.number"></el-input>
            </template>
            <template v-else>
              <el-input v-model="item.tagNumber"></el-input>
            </template>
          </template>
          <!-- 时间型标签，大数据还没规定好 -->
          <template v-show="item.type == 3"> </template>
          <i class="el-icon-remove" @click="removeCondition(index, item)" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :loading="saveLoading"
          >保存</el-button
        >
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>

      <tag-info
        ref="tagInfo"
        :visible.sync="conditionVisible"
        :rules="rules"
        @selected="getTagRules"
      ></tag-info>
    </el-form-renderer>
  </div>
</template>

<script>
import TagInfo from '@/container/member/tag-info'
import {
  memberGroupList,
  ruleList,
  createMemberGroup,
  memberGroupDetail
} from '@/const/api'

const RULE = {
  1: '<',
  2: '≤',
  3: '=',
  4: '>',
  5: '≥'
}
const TYPE_RULE = {
  6: '是',
  7: '否'
}

export default {
  name: 'group-edit',
  components: {
    TagInfo
  },
  data() {
    return {
      content: [
        {
          $type: 'input',
          $id: 'name',
          label: '分组名称',
          $el: {placeholder: '请输入', maxLength: 15},
          rules: [{required: true, message: '请输入分组', trigger: 'blur'}]
        },
        {
          $type: 'input',
          $id: 'info',
          label: '分组描述',
          $el: {placeholder: '请输入', type: 'textarea', maxLength: 50}
        },
        {
          $type: 'radio-group',
          $id: 'status',
          label: '状态',
          $default: '1',
          $options: [{label: '启用', value: '1'}, {label: '禁用', value: '0'}]
        },
        {
          $type: 'radio-group',
          $id: 'logicRule',
          label: '条件关系',
          $default: '0',
          $options: [
            {label: '且（满足以下所有约束条件才成立）', value: '0'},
            {label: '或（满足以下1个条件即成立）', value: '1'}
          ]
        }
      ],
      conditionVisible: false,
      saveLoading: false,
      isLoading: false,
      rules: [],
      tagRule: RULE,
      typeRule: TYPE_RULE,
      conditionList: []
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    isView() {
      return !!this.$route.query.isView
    }
  },
  mounted() {
    if (this.id) this.getGroupDetail()
  },
  methods: {
    // 获取分组详情
    getGroupDetail() {
      this.isLoading = true
      this.$axios
        .$get(memberGroupDetail(this.id))
        .then(resp => {
          resp.payload.memberGroup.logicRule = resp.payload.memberGroup.logicRule.toString()
          resp.payload.memberGroup.status = resp.payload.memberGroup.status
            ? '1'
            : '0'
          this.$refs.groupForm.updateForm(resp.payload.memberGroup)
          this.rules = [...resp.payload.memberGroupRuleList]
          this.rules.forEach((item, index) => {
            item.symbol = item.symbol.toString()
            this.$axios.$get(ruleList(item.relationId)).then(resp => {
              let data = JSON.parse(resp.payload)
              this.$set(this.conditionList, index, data)
            })
          })
        })
        .catch(e => console.log(e))
        .finally(() => (this.isLoading = false))
    },
    getTagRules(val) {
      const oldLen = [...this.rules].length
      this.rules = this.rules.concat(val)
      val.forEach((item, index) => {
        this.$axios.$get(ruleList(item.id)).then(resp => {
          let data = JSON.parse(resp.payload)
          this.$set(this.conditionList, index + oldLen, data)
        })
      })
    },
    // 删除约束条件
    removeCondition(i, val) {
      this.rules = this.rules.filter((val, index) => index !== i)
      this.conditionList = this.conditionList.filter(
        (val, index) => index !== i
      )
      this.$refs.tagInfo.deleteTag(val.id)
    },
    // 新增/编辑分组
    save() {
      this.$refs.groupForm.validate(valid => {
        if (!valid) return

        // 约束条件不得多于10
        if (this.rules.length && this.rules.length > 10) {
          this.$message.warning('最多添加10个条件')
          return
        }
        // 必须选择约束条件 && 条件得填充
        if (
          !this.rules.length ||
          !this.rules.every(
            val =>
              (val.symbol && (val.type === 1 && val.tagId)) ||
              (val.type === 2 && val.tagNumber)
          )
        ) {
          this.$message.warning('请完善约束条件!')
          return
        }
        this.saveLoading = true
        const methods = this.id ? '$put' : '$post'
        const url = this.id ? memberGroupDetail(this.id) : createMemberGroup
        // 标签条件规则
        let rules = this.rules.map((item, i) => {
          if (!this.conditionList) return
          let index = this.conditionList[i].findIndex(
            val => val.attributeId === item.id || item.relationId
          )
          const obj =
            item.type == 1
              ? {
                  tagName: this.conditionList[i][index].attributeName
                }
              : {tagNumber: item.tagNumber || item.number}
          return Object.assign(
            {
              relationId: item.relationId || item.id,
              relationName: item.relationName || item.name,
              type: item.type,
              symbol: item.symbol
            },
            obj
          )
        })
        let groupForm = this.$refs.groupForm.getFormValue()
        let data = {
          memberGroup: {
            name: groupForm.name,
            info: groupForm.info,
            status: +groupForm.status,
            logicRule: +groupForm.logicRule
          },
          memberGroupRuleList: rules
        }
        this.$axios[methods](url, data)
          .then(resp => {
            if (resp.code !== '0') {
              this.$message.warning(resp.msg)
              return
            }
            this.$message.success('操作成功')
            this.$router.back()
          })
          .catch(e => console.log(e))
          .finally(() => (this.saveLoading = false))
      })
    }
  }
}
</script>
<style lang="less">
.group-edit {
  &-restrictions {
    margin-top: 10px;

    .el-input {
      width: auto;
    }
  }
}
</style>
