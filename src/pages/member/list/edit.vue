<template>
  <div class="member-edit" v-loading="pageLoading">
    <!-- 账号信息 -->
    <p class="member-edit-title">账号信息</p>
    <el-form-renderer
      ref="accountForm"
      :content="accountContent"
      label-width="100px"
    ></el-form-renderer>

    <!-- 标签与分组 -->
    <p class="member-edit-title">标签与分组</p>
    <el-row class="member-edit-group">
      <el-col :span="2" class="member-edit-label">分组：</el-col>
      <el-col :span="20">
        <el-button
          type="primary"
          size="small"
          class="button"
          @click="groupVisible = true"
          >添加</el-button
        >已添加{{ selectedGroup.length }}个分组
        <div class="group-list">
          <el-tag
            v-for="(item, index) in selectedGroup"
            :key="index"
            closable
            @close="handleClose(item)"
            >{{ item.name }}</el-tag
          >
        </div>
      </el-col>
    </el-row>

    <el-row class="member-edit-group">
      <el-col :span="2" class="member-edit-label">标签：</el-col>
      <el-col :span="20">
        <el-button
          type="primary"
          size="small"
          class="button"
          @click="tagVisible = true"
          >添加</el-button
        >已添加{{ selectedTag.length }}个标签
        <div class="group-list">
          <el-tag
            v-for="(item, index) in selectedTag"
            :key="index"
            closable
            @close="deleteTag(item)"
            >{{ item.name }}</el-tag
          >
        </div>
      </el-col>
    </el-row>

    <!-- 个人信息 -->
    <p class="member-edit-title">个人信息</p>
    <el-form-renderer
      ref="userForm"
      :content="userContent"
      label-width="100px"
    ></el-form-renderer>

    <!-- 添加分组 -->
    <el-dialog
      :visible.sync="groupVisible"
      title="添加分组"
      @opened="updateGroup"
    >
      <group-table
        ref="groupTable"
        :data="groupData"
        :groupList.sync="selectedGroup"
        border
      ></group-table>
      <div slot="footer">
        <el-button @click="groupVisible = false">取消</el-button>
        <el-button type="primary" @click="groupVisible = false">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加标签 -->
    <tag-info
      ref="tagInfo"
      :visible.sync="tagVisible"
      :rules.sync="selectedTag"
      @selected="getTagList"
      :isRuleTag="false"
    ></tag-info>

    <div class="member-edit-button">
      <el-button type="primary" :loading="isLoading" @click="save"
        >保存</el-button
      >
      <el-button @click="$router.back()">取消</el-button>
    </div>
  </div>
</template>
<script>
import UploadToAli from '@femessage/upload-to-ali'
import ElSelectArea from '@femessage/el-select-area'
import GroupTable from '@/container/member/group-table'
import TagInfo from '@/container/member/tag-info'
import {
  accountContent,
  calcAgeByBirthday,
  validEmail,
  validQQ
} from '@/const/member'
import {CheckboxGroup, Tabs, TabPane, Tag, InputNumber} from 'element-ui'
import {memberList, memberGroupList, memberInfo} from '@/const/api'
const SUCCESS_CODE = '0'

export default {
  name: 'member-edit',
  components: {
    UploadToAli,
    GroupTable,
    TagInfo,
    'el-checkbox-group': CheckboxGroup,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-tag': Tag
  },
  data() {
    return {
      accountContent: accountContent.concat({
        label: '头像',
        $id: 'headImg',
        $type: 'UploadToAli',
        $default: '',
        component: UploadToAli
      }),
      userContent: [
        {
          $type: 'input',
          $id: 'name',
          label: '姓名',
          $el: {placeholder: '请输入', maxlength: 15}
        },
        {
          $type: 'radio-group',
          $id: 'sex',
          label: '性别',
          $el: {placeholder: '请输入'},
          $default: '1',
          $options: [{label: '男', value: '1'}, {label: '女', value: '2'}]
        },
        {
          $id: 'birth',
          $type: 'date-picker',
          label: '生日',
          $el: {
            // type: 'daterange',   // 如果 type 为 daterange，则获取到的是一个数组
            placeholder: '请选择',
            valueFormat: 'timestamp',
            pickerOptions: {
              disabledDate: val => {
                console.val
                return val > new Date().getTime()
              }
            }
          },
          atChange: (id, val) => {
            let age = calcAgeByBirthday(val)
            this.$refs.userForm.updateForm({age: age})
          }
        },
        {
          $type: 'input-number',
          component: InputNumber,
          $id: 'age',
          label: '年龄',
          $el: {placeholder: '请输入', max: 999, min: 0, precision: 0}
        },
        {
          $type: 'input',
          $id: 'job',
          label: '职业',
          $el: {placeholder: '请输入', maxlength: 15}
        },
        {
          $type: 'input',
          $id: 'wechat',
          label: '微信',
          $el: {placeholder: '请输入', maxlength: 20}
        },
        {
          $type: 'input',
          $id: 'email',
          label: '邮箱',
          $el: {placeholder: '请输入', maxlength: 20},
          rules: [
            {
              trigger: 'blur',
              validator: validEmail
            }
          ]
        },
        {
          $type: 'input',
          $id: 'qq',
          label: 'QQ',
          $el: {placeholder: '请输入', maxlength: 20},
          rules: [
            {
              trigger: 'blur',
              validator: validQQ
            }
          ]
        },
        {
          label: '所在地区',
          $id: 'area',
          $type: 'ElSelectArea',
          $default: [],
          component: ElSelectArea,
          outputFormat: val => {
            if (!val) return {}

            return {
              provinces: val[0],
              city: val[1],
              district: val[2]
            }
          }
        },
        {
          label: '详细地址',
          $id: 'location',
          $type: 'input',
          $el: {
            type: 'textarea',
            maxlength: 30
          }
        }
      ],
      isLoading: false,
      groupVisible: false,
      groupData: [],
      tagVisible: false,
      selectedTag: [],
      selectedGroup: [],
      memberId: this.$route.query.id,
      memberInfoData: {},
      pageLoading: false,
      isUpdate: false
    }
  },
  mounted() {
    if (this.memberId) this.getMemberInfo()
    this.getGroupList()
  },
  methods: {
    // 获取会员信息，用于编辑
    getMemberInfo() {
      this.pageLoading = true
      this.$axios
        .$get(memberInfo(this.$route.query.id))
        .then(resp => {
          // form-renderer的更新值需要是字符串,数字0会有问题
          const {state, provinces, city, district} = resp.payload.hspMember
          this.memberInfoData = Object.assign(
            {
              state: state.toString(),
              area: [provinces, city, district]
            },
            resp.payload.hspMember
          )

          this.$refs.accountForm.updateForm(this.memberInfoData)
          this.$refs.userForm.updateForm(this.memberInfoData)
          this.selectedTag = resp.payload.tags
          this.selectedGroup = resp.payload.groups
        })
        .catch(e => console.log(e))
        .finally(() => (this.pageLoading = false))
    },
    // 获取会员分组
    getGroupList() {
      this.$axios
        .$get(memberGroupList)
        .then(resp => {
          this.groupData = resp.payload.content
        })
        .catch(e => console.log(e))
    },
    // 删除制定会员分组
    handleClose(val) {
      this.selectedGroup = this.selectedGroup.filter(item => item.id !== val.id)
    },
    // 获取标签
    getTagList(val) {
      this.selectedTag = val
    },
    //删除标签
    deleteTag(val) {
      this.selectedTag = this.selectedTag.filter(item => item.id !== val.id)
      this.$refs.tagInfo.deleteTag(val.id)
    },
    // 更新分组
    updateGroup(val) {
      if (this.isUpdate) return
      this.isUpdate = true
      this.$nextTick(() => {
        const filterId = this.selectedGroup.map(val => val.id)

        let filterList = this.groupData.filter(val => filterId.includes(val.id))
        filterList.forEach(val =>
          this.$refs.groupTable.$refs.groupTable.toggleRowSelection(val)
        )
      })
    },
    // 保存会员信息
    save() {
      this.$refs.accountForm.validate(valid => {
        if (!valid) return
        this.$refs.userForm.validate(validUserForm => {
          if (!validUserForm) {
            return false
          }
          this.isLoading = true

          let accountForm = this.$refs.accountForm.getFormValue()
          let userForm = this.$refs.userForm.getFormValue()

          // 分组数据的处理
          let groupIdList = this.selectedGroup.map(item => item.id)
          let tagIdList = this.selectedTag.map(item => {
            return {
              id: item.id,
              name: item.name,
              parentId: item.categoryId
            }
          })

          let data = {
            hspMember: Object.assign({}, accountForm, userForm),
            dto: {tagIdList, groupIdList}
          }

          const method = this.memberId ? '$put' : '$post'
          const url = this.memberId
            ? `${memberList}/${this.memberId}`
            : memberList
          this.$axios[method](url, data)
            .then(resp => {
              if (resp.code !== SUCCESS_CODE) {
                this.$message.warning(resp.msg)
                return
              }

              this.$message.success('操作成功')
              this.$router.back()
            })
            .catch(() => this.$message.warning('操作失败'))
            .finally(() => (this.isLoading = false))
        })
      })
    }
  }
}
</script>
<style lang="less">
.member-edit {
  border: 1px solid #ebebeb;

  .el-form {
    margin-right: 20px;
  }

  &-group {
    line-height: 36px;
    margin-bottom: 20px;

    .button {
      margin-right: 10px;
    }
  }

  &-label {
    width: 100px;
    text-align: right;
  }

  &-title {
    position: relative;
    padding-left: 10px;
    margin-bottom: 20px;
    height: 40px;
    line-height: 40px;
    background: #ebebeb;
  }

  &-button {
    margin: 20px;
  }

  .group-list {
    .el-tag {
      margin: 10px 10px 0 0;
    }
  }

  /deep/.el-input-number {
    width: 100%;
  }
}
</style>
