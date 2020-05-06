<template>
  <div class="add-native" v-loading="loading">
    <h1 class="mb20">新增原生标签</h1>
    <el-steps :active="activeStep" align-center class="mb20">
      <el-step :title="i.title" v-for="i in stepList" :key="i.name"></el-step>
    </el-steps>

    <!-- step 选择属性 -->
    <div v-show="activeStep === 0">
      <el-form label-suffix="：" label-width="100px">
        <el-form-item label="数据源">
          <el-select v-model="form.origin" placeholder="请选择数据源">
            <el-option label="用户数据表" value="user"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择属性">
          <el-table
            border
            :data="originTableList"
            @selection-change="handleSelectionChange"
            style="width: 80%"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="key" label="属性名"></el-table-column>
            <el-table-column
              prop="mean"
              label="属性名对应中文"
            ></el-table-column>
            <el-table-column prop="type" label="属性类型"></el-table-column>
            <el-table-column
              prop="typeMean"
              min-width="100px"
              label="属性类型对应中文"
            ></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>
    <!-- step 选择属性 -->

    <!-- step 定义属性 -->
    <div v-show="activeStep === 1" class="mb20">
      <el-table border :data="selectList">
        <el-table-column prop="key" label="属性名"></el-table-column>
        <el-table-column prop="mean" label="属性名对应中文">
          <template slot-scope="{row}">
            <el-input
              v-if="row.type === TYPE_MAP.archar"
              v-model="row.mean"
              placeholder="请输入"
            ></el-input>
            <p v-else>{{ row.mean }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="属性类型"></el-table-column>
        <el-table-column
          prop="typeMean"
          min-width="100px"
          label="属性类型对应中文"
        ></el-table-column>
        <el-table-column label="数据库存储值" min-width="100px">
          <template slot-scope="scope">
            <el-input
              v-if="scope.row.type === TYPE_MAP.archar"
              class="data-item"
              v-model="item.value"
              v-for="(item, index) in scope.row.valueList"
              :key="index"
              placeholder="请输入"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="对应属性中文表达" min-width="130px">
          <template slot-scope="scope">
            <div
              v-if="scope.row.type === TYPE_MAP.archar"
              v-for="(item, index) in scope.row.valueList"
              :key="index"
              class="data-item"
            >
              <el-input v-model="item.label" placeholder="请输入"></el-input>
              <el-button
                v-if="index === 0"
                type="primary"
                icon="el-icon-plus"
                @click="addData(scope.row)"
              ></el-button>
              <el-button
                v-else
                type="danger"
                icon="el-icon-delete"
                @click="deleteData(scope.row, index)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- step 定义属性 -->

    <!-- step 设置标签 完成 -->
    <div v-show="activeStep === 2 || activeStep === 3" class="mb20">
      <el-table border :data="selectList">
        <el-table-column prop="tagName" label="标签名称">
          <template slot-scope="{row}">
            <el-input
              v-if="activeStep === 2"
              v-model="row.tagName"
              placeholder="请输入"
            ></el-input>
            <p v-else>{{ row.tagName }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="tagType" label="标签分类" min-width="80px">
          <template slot-scope="{row}">
            <el-select
              v-if="activeStep === 2"
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
        <el-table-column prop="mean" label="关联表属性"></el-table-column>
        <el-table-column prop="typeMean" label="属性类型"></el-table-column>
        <el-table-column label="属性值" min-width="130px">
          <template slot-scope="scope">
            <div v-if="scope.row.type === TYPE_MAP.archar">
              {{ scope.row.valueList.map(i => i.label).join('、') }}
            </div>
            <div v-else>
              ————
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- step 设置标签 完成 -->

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
  </div>
</template>

<script>
import {Steps, Step} from 'element-ui'
import {addNativeTag} from '@/const/api.js'
import {
  TYPE_MAP,
  TAG_TYPE_MAP,
  TAG_TYPE_LIST,
  DEFAULT_KEY_VALUE
} from '@/const/common.js'

export default {
  name: 'add-native',
  components: {
    'el-steps': Steps,
    'el-step': Step
  },
  data() {
    return {
      TYPE_MAP,
      TAG_TYPE_MAP,
      TAG_TYPE_LIST,
      loading: false,
      // 当前激活的步骤
      activeStep: 0,
      // 步骤列表
      stepList: [
        {
          title: '选择属性',
          name: 1
        },
        {
          title: '定义属性',
          name: 2
        },
        {
          title: '设置标签',
          name: 3
        },
        {
          title: '完成',
          name: 4
        }
      ],
      // 表单
      form: {
        origin: ''
      },
      // 数据源表格数据
      originTableList: [
        {
          key: 'sex',
          mean: '性别',
          type: 'archar',
          typeMean: '字符串',
          tagName: '性别',
          tagType: '',
          valueList: [
            {
              ...DEFAULT_KEY_VALUE
            }
          ]
        },
        {
          key: 'birth',
          mean: '生日',
          type: 'date',
          typeMean: '日期时间',
          tagName: '生日',
          tagType: '',
          valueList: [
            {
              ...DEFAULT_KEY_VALUE
            }
          ]
        },
        {
          key: 'age',
          mean: '年龄',
          type: 'tinyint',
          typeMean: '数值',
          tagName: '年龄',
          tagType: '',
          valueList: [
            {
              ...DEFAULT_KEY_VALUE
            }
          ]
        },
        {
          key: 'job',
          mean: '职业',
          type: 'archar',
          typeMean: '字符串',
          tagName: '职业',
          tagType: '',
          valueList: [
            {
              ...DEFAULT_KEY_VALUE
            }
          ]
        },
        {
          key: 'education',
          mean: '学历',
          type: 'archar',
          typeMean: '字符串',
          tagName: '学历',
          tagType: '',
          valueList: [
            {
              ...DEFAULT_KEY_VALUE
            }
          ]
        }
      ],
      selectList: []
      // [
      //   {
      //     key: "sex",
      //     mean: "性别",
      //     type: "archar",
      //     typeMean: "字符串",
      //     tagName: '性别',
      //     tagType: '',
      //     valueList: [
      //       {label: "男", value: 1},
      //       {label: "女", value: 2},
      //       {label: "未知", value: 0}
      //     ]
      //   },
      //   {
      //     key: "age",
      //     mean: "年龄",
      //     type: "tinyint",
      //     typeMean: "数值",
      //     tagName: '年龄',
      //     tagType: '',
      //     valueList: [{
      //       ...DEFAULT_KEY_VALUE
      //     }]
      //   }
      // ]
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
        .post(addNativeTag, this.selectList)
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
    addData(row) {
      row.valueList.push({...DEFAULT_KEY_VALUE})
    },
    deleteData(row, index) {
      this.$confirm('确认移除吗？')
        .then(res => {
          res === 'confirm' && row.valueList.splice(index, 1)
        })
        .catch(e => {})
    },
    addActiveStep() {
      this.activeStep++
    }
  }
}
</script>
<style lang="less">
.add-native {
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
