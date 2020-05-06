<template>
  <el-dialog
    class="tag-info"
    title="添加标签"
    :visible.sync="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-tabs @tab-click="changeTab">
      <el-tab-pane
        class="tag-card"
        :label="item.name"
        v-for="(item, index) in tabType"
        :key="index"
        v-loading="tabLoading"
      >
        <el-checkbox-group v-model="selectedTag">
          <el-checkbox
            v-for="(item, index) in baseTab"
            :key="index"
            border
            :label="item"
            @change="handleChange($event, item)"
            >{{ item.name }}</el-checkbox
          >
        </el-checkbox-group>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="selectBasicTag" :loading="isLoading"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import {CheckboxGroup, Tabs, TabPane} from 'element-ui'
import {tagTypeList, tagList, tagRule, firstTag, childrenTag} from '@/const/api'
export default {
  name: 'tag-info',
  components: {
    'el-checkbox-group': CheckboxGroup,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isRuleTag: {
      type: Boolean,
      default: true
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedTag: [],
      tabType: [],
      baseTab: [],
      tabLoading: false,
      isLoading: false
    }
  },
  computed: {
    ruleIdList() {
      return this.rules.map(val => val.attributeId || val.id) || []
    }
  },
  mounted() {
    this.getTagType()
  },
  methods: {
    // 获取标签分类
    async getTagType() {
      try {
        let resp = await this.$axios.$get(firstTag)
        this.tabType = resp.payload
        // 根据标签分类获取基础标签
        await this.getBaseTag(this.tabType && this.tabType[0].id)
      } catch (e) {
        console.error(e)
      }
    },
    // 获取基础标签
    async getBaseTag(id) {
      this.tabLoading = true
      let resp = await this.$axios
        .$get(childrenTag(id))
        .finally(() => (this.tabLoading = false))

      this.baseTab = resp.payload
      this.baseTab.forEach((val, i) => {
        if (this.ruleIdList.includes(val.id)) this.selectedTag.push(val)
      })
      return Promise.resolve(true)
    },
    // 切换标签
    changeTab(val) {
      let id = this.tabType && this.tabType[val.index].id
      this.getBaseTag(id)
    },
    // 确认选择基础标签
    selectBasicTag() {
      this.isLoading = true
      // 过滤编辑带过来的约束条件
      const filterTag = this.selectedTag.filter(
        v => !this.ruleIdList.includes(v.id)
      )

      this.$emit('selected', this.rules.concat(filterTag))
      this.isLoading = false
      this.$emit('update:visible', false)
    },
    // 更新标签
    updatedTag(val) {
      this.selectedTag = val
    },
    // 删除标签，传入标签id
    deleteTag(id) {
      this.selectedTag = this.selectedTag.filter(val => val.id !== id)
    },
    // 取消勾选☑️则更新数据
    // TODO这样的组件API设计有点违背个人的品味，鉴于进度，标注后面优化
    handleChange(bool, val) {
      if (bool) return

      let filterList = this.rules.filter(item => item.id !== val.id)
      this.$emit('update:rules', filterList)
    }
  }
}
</script>
<style lang="less">
.tag-info {
  .is-bordered {
    margin-left: 10px;
    margin-bottom: 10px;
  }

  .tag-card {
    min-height: 50px;
  }
}
</style>
