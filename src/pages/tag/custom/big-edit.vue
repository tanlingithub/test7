<template>
  <div class="custom-edit">
    <!-- v-loading不能放在最外层的节点，不然是全屏loading -->
    <el-form-renderer
      v-loading="customLoading"
      ref="customForm"
      :content="content"
      label-width="100px"
    >
      <el-form-item label="约束条件" required>
        <el-button
          v-if="!isView"
          type="primary"
          @click="conditionVisible = true"
          >添加条件</el-button
        >
        <div
          class="custom-edit-restrictions"
          v-for="(item, index) in rules"
          :key="index"
        >
          <el-input
            disabled
            :value="item.name || item.attributeName"
          ></el-input>
          <!-- 分类型标签 -->
          <template v-if="item.type === 1">
            <el-select v-model="item.symbol" :disabled="isView">
              <el-option
                v-for="(val, valIndex) in Object.keys(typeRule)"
                :key="valIndex"
                :value="val"
                :label="typeRule[val]"
              ></el-option>
            </el-select>
            <el-select v-model="item.tagId" :disabled="isView">
              <el-option
                v-for="(val, valIndex) in conditionList[index]"
                :key="valIndex"
                :value="val.id"
                :label="val.tagName"
              ></el-option>
            </el-select>
          </template>
          <!-- 统计型标签 -->
          <template v-if="item.type === 2">
            <el-select v-model="item.symbol" :disabled="isView">
              <el-option
                v-for="(val, valIndex) in Object.keys(tagRule)"
                :key="valIndex"
                :value="val"
                :label="tagRule[val]"
              ></el-option>
            </el-select>
            <el-input v-model="item.number" :disabled="isView"></el-input>
          </template>
          <!-- 时间型标签，大数据还没规定好 -->
          <template v-show="item.type == 3"> </template>
          <i
            v-if="!isView"
            class="el-icon-remove"
            @click="removeCondition(index, item)"
          />
        </div>
      </el-form-item>
      <el-form-item v-if="!isView">
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
  tagList,
  tagTypeList,
  ruleList,
  firstTag,
  childrenTag,
  saveBigTag,
  editBigTag,
  bigTagDetail
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
const CUSTOM_TYPE = 1
const RADIO = 'radio-group'

export default {
  name: 'custom-edit',
  components: {
    TagInfo
  },
  data() {
    return {
      content: [
        {
          $type: 'input',
          $id: 'name',
          label: '标签名称',
          $el: {
            placeholder: '请输入',
            maxlength: 15
          },
          rules: [{required: true, message: '请输入分组', trigger: 'blur'}]
        },
        {
          $type: 'select',
          $id: 'categoryId',
          label: '标签分类',
          $el: {placeholder: '请选择'}
        },
        {
          $type: 'input',
          $id: 'info',
          label: '标签描述',
          $el: {placeholder: '请输入', type: 'textarea', maxlength: 50}
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
      customLoading: false,
      rules: [],
      tagRule: RULE,
      typeRule: TYPE_RULE,
      tagTypeList: [],
      conditionList: [],
      detailInfo: {}
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
    this.getTagType()
    // 编辑/查看都获取详情数据
    if (this.id) this.getCustomDetail()
    // 查看禁用
    if (this.isView) {
      this.content.forEach(val => {
        if (val.$type !== RADIO) val.$el.disabled = true
      })
    }
  },
  methods: {
    // 获取自定义标签详情
    getCustomDetail() {
      this.customLoading = true
      this.$axios
        .$get(`${bigTagDetail}?mixedTagId=${this.id}`)
        .then(resp => {
          this.rules = [...resp.payload.mixedRuleDtoList]
          this.rules.forEach((item, index) => {
            item.symbol = item.symbol.toString()
            this.$axios.$get(ruleList(item.attributeId)).then(resp => {
              let data = JSON.parse(resp.payload)
              this.$set(this.conditionList, index, data)
            })
          })

          resp.payload.mixedTag.logicRule = resp.payload.mixedTag.logicRule.toString()
          this.$refs.customForm.updateForm(resp.payload.mixedTag)
        })
        .catch(e => console.log(e))
        .finally(() => (this.customLoading = false))
    },
    // 获取标签分类
    async getTagType() {
      let resp = await this.$axios.$get(firstTag)

      this.tagTypeList = resp.payload.map(item => {
        return {label: item.name, value: item.id}
      })
      this.$refs.customForm.setOptions('categoryId', [...this.tagTypeList])
    },
    // 获取标签规则
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
    // 新增/编辑自定义标签
    save() {
      this.$refs.customForm.validate(valid => {
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
              (val.type === 2 && val.number)
          )
        ) {
          this.$message.warning('请完善约束条件!')
          return
        }

        this.saveLoading = true
        const methods = this.id ? '$put' : '$post'
        const url = this.id ? editBigTag : saveBigTag
        // 标签条件规则
        let rules = this.rules.map((item, i) => {
          if (!this.conditionList) return
          let index = this.conditionList[i].findIndex(
            val => val.attributeId === item.id || item.attributeId
          )
          const obj =
            item.type == 1
              ? {
                  tagId: item.tagId,
                  tagName: this.conditionList[i][index].attributeName
                }
              : {number: item.number}
          return Object.assign(
            {
              attributeId: item.id || item.attributeId,
              attributeName: item.name || item.attributeName,
              type: item.type,
              symbol: item.symbol
            },
            obj
          )
        })

        let data = {
          mixedTag: this.$refs.customForm.getFormValue(),
          mixedRuleDtoList: rules
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
.custom-edit {
  &-restrictions {
    margin-top: 10px;

    .el-input {
      width: auto;
    }
  }
}
</style>
