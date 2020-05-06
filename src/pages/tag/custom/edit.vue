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
          <el-input disabled v-model="item.columnComment"></el-input>
          <el-select v-model="item.leftBorderFlag" :disabled="isView">
            <el-option
              v-for="(val, valIndex) in Object.keys(tagRule)"
              :key="valIndex"
              :value="val"
              :label="tagRule[val]"
            ></el-option>
          </el-select>
          <el-select v-model="item.leftBorderValue" :disabled="isView">
            <el-option
              v-for="(val, valIndex) in conditionList[index]"
              :key="valIndex"
              :value="val.id"
              :label="val.info"
            ></el-option>
          </el-select>
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
import {tagList, tagTypeList, ruleList} from '@/const/api'

const RULE = {
  0: '≥',
  1: '>',
  2: '<',
  3: '≤',
  4: '=',
  5: '!='
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
          $id: 'tagTypeId',
          label: '标签分类',
          $el: {placeholder: '请选择'},
          outputFormat: val => {
            if (!val) return {}

            let index = this.tagTypeList.findIndex(item => item.value === val)
            return {
              tagTypeName: this.tagTypeList[index].label,
              tagTypeId: val
            }
          }
        },
        {
          $type: 'input',
          $id: 'description',
          label: '标签描述',
          $el: {placeholder: '请输入', type: 'textarea', maxlength: 50}
        },
        {
          $type: 'radio-group',
          $id: 'ruleRelation',
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
        .$get(`${tagList}/${this.id}?type=${CUSTOM_TYPE}`)
        .then(resp => {
          this.rules = [...resp.payload.ruleDtoList]
          this.rules.forEach((item, index) => {
            item.leftBorderFlag = item.leftBorderFlag.toString()
            this.$axios.$get(ruleList(item.tagId)).then(resp => {
              let data = JSON.parse(resp.payload)
              this.$set(this.conditionList, index, data)
            })
          })

          this.$refs.customForm.updateForm(resp.payload)
        })
        .catch(e => console.log(e))
        .finally(() => (this.customLoading = false))
    },
    // 获取标签分类
    async getTagType() {
      let resp = await this.$axios.$get(tagTypeList)

      this.tagTypeList = resp.payload.map(item => {
        return {label: item.name, value: item.id}
      })
      this.$refs.customForm.setOptions('tagTypeId', [...this.tagTypeList])
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

        // 必须选择约束条件 && 条件得填充
        if (
          !this.rules.length ||
          !this.rules.every(val => val.leftBorderFlag && val.leftBorderValue)
        ) {
          this.$message.warning('请完善约束条件!')
          return
        }

        this.saveLoading = true
        const methods = this.id ? '$put' : '$post'
        const url = this.id
          ? `${tagList}/${this.id}?type=${CUSTOM_TYPE}`
          : `${tagList}?type=${CUSTOM_TYPE}`
        // 标签条件规则
        let rules = this.rules.map(item => {
          return {
            datasourceId: item.datasourceId,
            tableName: item.tableName,
            columnName: item.columnName,
            columnType: item.columnType,
            columnComment: item.columnComment,
            leftBorderFlag: item.leftBorderFlag,
            leftBorderValue: item.leftBorderValue,
            tagId: item.relationId || item.tagId
          }
        })

        let data = Object.assign(
          {
            ruleDtoList: rules,
            type: CUSTOM_TYPE
          },
          this.$refs.customForm.getFormValue()
        )
        this.$axios[methods](url, data)
          .then(resp => {
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
