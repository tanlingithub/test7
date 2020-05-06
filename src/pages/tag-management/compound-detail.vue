<template>
  <div class="compound-detail" v-loading="loading">
    <h1 class="mb20">编辑复合标签</h1>

    <el-form label-width="100px" label-suffix="：" :disabled="disabled">
      <el-form-item label="标签名称">
        <el-input
          v-model="form.tagName"
          placeholder="请输入标签名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="标签分类">
        <el-select
          v-model="form.tagType"
          placeholder="请选择标签分类"
          style="width:100%;"
        >
          <el-option
            v-for="item in TAG_TYPE_LIST"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签描述">
        <el-input
          type="textarea"
          v-model="form.description"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="约束条件">
        <el-button @click="dialogVisible = true">添加条件</el-button>
        <div class="condition-box">
          <p v-for="(i, index) in form.logicRule" :key="index">
            <el-input placeholder="请输入" v-model="i.label"></el-input>
            <el-select v-model="i.condition" placeholder="请选择">
              <el-option
                v-for="item in FULL_CONDITION_MAP_LIST"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请输入"
              v-model="i.value"
              v-if="!i.enumList"
            ></el-input>
            <el-select v-else v-model="i.value" placeholder="请选择">
              <el-option
                v-for="item in i.enumList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-button
              type="text"
              icon="el-icon-remove"
              @click="deleteData(index)"
            ></el-button>
          </p>
        </div>
      </el-form-item>
      <el-form-item label="条件关系">
        <el-radio-group v-model="form.rule">
          <el-radio label="1">且(满足以上所有约束条件才成立)</el-radio>
          <el-radio label="2">或(满足以上1个条件即成立)</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div style="text-align:center;">
      <el-button @click="$router.back()" :disabled="false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" v-if="!disabled"
        >保 存</el-button
      >
    </div>

    <el-dialog title="添加条件" :visible.sync="dialogVisible" width="800px">
      <div class="condition-dialog">
        <el-data-tree
          ref="tree"
          @node-click="handleNodeClick"
          v-bind="treeConfig"
          @loaded="treeLoaded"
          class="condition-tree"
        ></el-data-tree>
        <div class="condition-items">
          <el-form>
            <el-form-item>
              <el-checkbox-group v-model="totalSelectCondition">
                <el-checkbox
                  v-for="i in previewTreeData"
                  :label="i.id"
                  :key="i.id"
                  name="condition"
                  >{{ i.label }}</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="filterConditionData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {compoundTagInfo, conditionTree, addCompound} from '@/const/api.js'

import {FULL_CONDITION_MAP_LIST} from '@/const/common.js'

import ElDataTree from '@femessage/el-data-tree'

import {TAG_TYPE_LIST} from '@/const/common.js'

export default {
  name: 'edit-native',
  components: {
    ElDataTree
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      TAG_TYPE_LIST,
      FULL_CONDITION_MAP_LIST,
      form: {
        tagName: '',
        tagType: '',
        description: '',
        rule: '',
        logicRule: [
          // {
          //   label: "",
          //   condition: "",
          //   value: ""
          // }
        ]
      },
      treeConfig: {
        title: '分类管理',
        parentKey: 'parentId',
        dataPath: 'data.payload',
        hasTitle: false,
        showFilter: false,
        hasOperation: false,
        treeAttrs: {
          nodeKey: 'id',
          highlightCurrent: true,
          autoExpandParent: true,
          showCheckbox: false,
          expandOnClickNode: false,
          renderAfterExpand: true,
          defaultExpandAll: true,
          props: {
            label: 'label',
            children: 'none'
          }
        },
        url: conditionTree,
        hasNew: false,
        hasEdit: false,
        hasDelete: false
      },
      totalSelectCondition: [],
      previewTreeData: [],
      fullTreeData: []
    }
  },
  computed: {
    ID() {
      return this.$route.query.id
    },
    disabled() {
      return Boolean(this.$route.query.readOnly)
    }
  },
  mounted() {
    this.ID && this.getTagInfo()
  },
  methods: {
    getTagInfo() {
      this.loading = true

      this.$axios
        .$get(compoundTagInfo(this.ID))
        .then(res => {
          this.loading = false
          this.totalSelectCondition = res.payload.logicRule.map(i => i.id)
          this.form = res.payload
        })
        .catch(e => {
          this.loading = false
          this.$message.error(e.msg)
        })
    },
    onSubmit() {
      console.log(this.form)
      let methods = this.ID ? '$put' : '$post',
        url = this.ID ? compoundTagInfo(this.ID) : addCompound

      this.$axios[methods](url, this.form)
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
    deleteData(index) {
      this.$confirm('确认移除吗？')
        .then(res => {
          res === 'confirm' && this.form.logicRule.splice(index, 1)
        })
        .catch(e => {})
    },
    handleNodeClick(data) {
      this.previewTreeData = data.children
    },
    filterConditionData() {
      let data = this.fullTreeData.reduce((total, item) => {
        return total
          .concat(
            (item.children || []).filter(i => {
              return this.totalSelectCondition.indexOf(i.id) > -1
            })
          )
          .map(i => ({...i, value: i.value || ''}))
      }, [])

      this.form.logicRule = this.form.logicRule.concat(data)
      this.dialogVisible = false
    },
    treeLoaded(res) {
      this.fullTreeData = res
    }
  }
}
</script>
<style lang="less">
.compound-detail {
  max-width: 800px;

  .condition-box {
    margin-top: 20px;
    p {
      margin-bottom: 5px;
      display: flex;
      .el-input {
        margin-right: 4px;
        width: 200px;
      }
      .el-select {
        min-width: 200px;
      }
    }
  }

  .condition-dialog {
    display: flex;
    .condition-tree {
      width: 200px;
    }

    .condition-items {
      flex: 1;
      border: 1px solid #ebeef5;
      border-left: none;
      padding: 30px;

      .el-checkbox {
        margin-left: 0;
        width: 25%;
      }
    }
  }
}
</style>
