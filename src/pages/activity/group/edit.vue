<template>
  <div class="group-edit">
    <el-form-renderer
      class="activity-form"
      label-width="140px"
      :content="content"
      ref="form"
      v-loading="formLoading"
    >
    </el-form-renderer>

    <div class="product-selected" v-loading="selectedProductLoading">
      <label>
        <el-button
          size="small"
          type="primary"
          icon="el-icon-circle-plus"
          @click="toAddCommodity"
          :disabled="commodityData.selected.length > 0 || isProcessingActivity"
        >
          选择商品
        </el-button>
        <el-button
          size="small"
          type="danger"
          icon="el-icon-remove"
          :disabled="commodityData.deleteSelect.length == 0"
          @click="deleteCommodity"
        >
          删除商品
        </el-button>
      </label>

      <!-- 新增编辑页的商品表单 -->
      <el-table
        :data="commodityData.selected"
        @selection-change="commodityData.deleteSelect = $event"
      >
        <el-table-column
          v-if="!isProcessingActivity"
          type="selection"
          width="55"
        ></el-table-column>
        <el-table-column width="100">
          <template slot-scope="scope">
            <img
              :src="scope.row.imageUrl ? scope.row.imageUrl.split(',')[0] : ''"
              width="50"
              height="50"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品"></el-table-column>
        <el-table-column prop="salePrice" label="价格"></el-table-column>
      </el-table>
    </div>

    <!-- 底部按钮 -->
    <div class="footer">
      <el-button
        type="primary"
        @click="saveGroup(false)"
        :loading="submitLoading"
        v-show="$route.query.isView"
        >保存并发布</el-button
      >
      <el-button
        type="primary"
        @click="saveGroup(true)"
        :loading="submitDraftLoading"
        v-show="$route.query.isView"
        >仅保存</el-button
      >
      <el-button @click="$router.back()">取消</el-button>
    </div>
    <el-dialog
      title="选择商品"
      :visible.sync="showDialog"
      width="850px"
      @close="resetDialog"
    >
      <!-- 弹框页的商品表单 -->
      <el-form :inline="true">
        <el-form-item label="商品名称" class="item">
          <el-input v-model="name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="commodityData.list"
        v-loading="inFetchingCommodity"
        style="width:100%;"
        @selection-change="commodityData.currentSelect = $event"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="computedSelected"
        >
        </el-table-column>
        <el-table-column width="100">
          <template slot-scope="scope">
            <img
              :src="getPeroductImgUrl(scope.row.imageUrl)"
              width="50"
              height="50"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品"></el-table-column>
        <el-table-column prop="salePrice" label="价格"></el-table-column>
      </el-table>

      <!-- 弹框的商品表单开启多页 -->
      <el-pagination
        @current-change="fetchTaskList($event)"
        class="group-pagination"
        layout="prev, pager, next, jumper"
        :total="commodityData.total"
        :current-page="commodityData.page"
      >
      </el-pagination>
      <span slot="footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="commodityData.currentSelect.length > 1"
          @click="saveSelectCommodity"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {groupList, cancelGroupList, activityGoodsPageApi} from '@/const/api'
import {formatDate} from '@/const/filter'
import {ACTIVITY_STATUS} from '@/const/group'
import {regIntFrZero, regDecimal, regInt} from '@/const/regexp'
import {RadioGroup, InputNumber} from 'element-ui'
import lodashFind from 'lodash.find'
// 活动状态-草稿
const ACTIVITY_DRAFT = 0
// 活动状态-未开始
const ACTIVITY_NOTSTARTED = 1
// 活动状态-进行中
const ACTIVITY_STARTING = 2
// 正在进行的活动，可编辑字段id
const editableIdsWhenProcessing = ['stockCount', 'startTime']
// 拼团最低金额
const minGroupPrice = 0.01
// 检验库存字段
const validStockCount = (minCount = 0) => {
  return (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请输入拼团商品库存'))
    }
    //  /^([1-9]\d{0,6}|0)$/
    if (!regIntFrZero(7).test(value + '')) {
      return callback(new Error('库存数格式错误（7位以内的正整数）'))
    }
    if (minCount && value < minCount) {
      return callback(new Error(`库存数不能小于${minCount}`))
    }
    callback()
  }
}
// 检验拼团商品价格
const validGroupPrice = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入拼团商品价格'))
  }
  //  /^([1-9]\d{0,4}|0)(\.\d{0,2})?$/
  if (!regDecimal(5, 2).test(value + '')) {
    return callback(
      new Error('请输入正确的拼团商品价格(5位以内的正整数，2位以内小数)')
    )
  }
  if (value < minGroupPrice) {
    return callback(new Error(`拼团商品价格不能小于${minGroupPrice}`))
  }
  callback()
}
// 检验活动日期
const validActivityDate = (startTimeAc, endTimeAc) => {
  return (rule, value, callback) => {
    let startTime = value[0]
    let endTime = value[1]
    if (!startTime || !endTime) {
      return callback(new Error('请选择时间'))
    }
    if (startTimeAc < startTime) {
      let msg = `开始时间不能大于${formatDate(
        startTimeAc,
        'YYYY-MM-DD HH:mm:ss'
      )}`
      return callback(new Error(msg))
    }
    if (endTimeAc > endTime) {
      let msg = `结束时间不能小于${formatDate(
        endTimeAc,
        'YYYY-MM-DD HH:mm:ss'
      )}`
      return callback(new Error(msg))
    }
    callback()
  }
}
export default {
  data() {
    return {
      // 表单区域 loading
      formLoading: false,
      // 选中商品区域loading
      selectedProductLoading: false,
      // 当前活动详情数据
      activityDetail: {},
      commodityData: {
        currentSelect: [],
        deleteSelect: [],
        selected: [],
        list: [],
        page: 1,
        total: 0
      },
      name: '',
      submitLoading: false,
      submitDraftLoading: false,
      inFetchingCommodity: false,
      showDialog: false,
      content: [
        {
          $type: 'input',
          $id: 'name',
          label: '活动名称：',
          $el: {
            type: 'text',
            placeholder: '请输入',
            maxlength: '30',
            formatter: row => row.hspGroupbuyActivity.name
          },
          rules: [
            {
              required: true,
              message: '请输入活动名称',
              trigger: 'blur'
            }
          ]
        },
        {
          $type: 'input',
          $id: 'stockCount',
          label: '拼团商品库存：',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {
              required: true,
              trigger: 'blur',
              validator: validStockCount(0)
            }
          ]
        },
        {
          $type: 'input',
          $id: 'activityPrice',
          label: '拼团商品价格：',
          $default: '0.00',
          $el: {
            placeholder: '请输入'
          },
          rules: [
            {
              required: true,
              trigger: 'blur',
              validator: validGroupPrice
            }
          ],
          outputFormat: activityPrice => (activityPrice * 1).toFixed(2),
          inputFormat: row => (row.activityPrice * 1).toFixed(2)
        },
        {
          $type: 'date-picker',
          $id: 'startTime',
          label: '活动时间：',
          $el: {
            type: 'datetimerange',
            'value-format': 'timestamp',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'picker-options': {
              disabledDate(time) {
                return time.getTime() < Date.now() - 8.64e7
              }
            }
          },

          inputFormat: row => {
            return [row.startTime || '', row.endTime || '']
          },
          outputFormat: val => {
            if (!val) {
              return {startTime: '', endTime: ''}
            }
            return {
              startTime: val[0],
              endTime: val[1]
            }
          },
          rules: [
            {
              required: true,
              message: '请完整输入活动时间',
              trigger: 'blur'
            }
          ]
        },
        {
          $type: 'input-number',
          $id: 'completePersonCount',
          component: InputNumber,
          label: '参团人数(人):',
          $default: '2',
          $el: {
            type: 'number',
            placeholder: '请输入',
            min: 2,
            max: 9999,
            precision: 0
          },
          rules: [
            {
              required: true,
              message: '请输入参团人数'
              // trigger: 'blur'
            }
          ]
        },
        {
          $type: 'input-number',
          $id: 'effectiveTime',
          component: InputNumber,
          label: '拼团有效期(h):',
          $default: '24',
          $el: {
            type: 'number',
            placeholder: '请输入',
            min: 1,
            max: 120
          },
          rules: [
            {
              required: true,
              message: '请输入拼团有效期',
              trigger: 'blur'
            }
          ]
        },
        {
          $type: 'radio-group',
          $id: 'purchaseLimitFlag',
          label: '商品限购:',
          component: RadioGroup,
          $default: '0', //默认值为0,
          $el: {
            disabled: false
          },
          $options: [{label: '开启限购', value: '1'}]
        },
        {
          $type: 'input-number',
          $id: 'purchaseLimitCount',
          component: InputNumber,
          label: '每人最多购买:',
          $default: 1,
          $enableWhen: {purchaseLimitFlag: '1'},
          $el: {
            type: 'number',
            placeholder: '请输入',
            min: 1,
            max: 999,
            precision: 0
          },
          rules: [
            {
              required: true,
              message: '请输入每人最多购买数量',
              trigger: 'blur'
            }
          ]
        }
      ]
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    // 当前活动状态是否为进行中
    isProcessingActivity() {
      return (
        this.activityDetail &&
        this.activityDetail.status * 1 === ACTIVITY_STARTING
      )
    }
  },
  created() {},
  mounted() {
    if (this.id) {
      this.fetchDetail()
    }
  },
  watch: {},
  methods: {
    onSubmit() {
      this.$axios
        .$get(`${activityGoodsPageApi}?name=${this.name}`) //调用接口
        .then(res => {
          this.commodityData.list = res.payload.content
        })
        .catch(e => {})
    },
    //保存新增页信息,isDraft: 是否为草稿
    saveGroup(isDraft = false) {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }

        let commodityList = this.commodityData.selected.map(v => {
          return {
            id: v.id
          }
        })
        if (commodityList.length == 0) {
          this.$message('请选择商品')
          return
        }
        if (!this.validGroupPriceRule()) {
          return
        }
        if (isDraft) {
          this.submitDraftLoading = true
        } else {
          this.submitLoading = true
        }

        let params = this.$refs.form.getFormValue()
        let status = isDraft ? ACTIVITY_DRAFT : ''
        let method = this.id ? '$put' : '$post'
        let url = this.id ? cancelGroupList(this.id) : groupList

        let productId = this.commodityData.selected[0].id
        let productName = this.commodityData.selected[0].name
        let data = {
          ...params,
          productId,
          productName,
          status
        }

        this.$axios[method](url, data)
          .then(res => {
            this.$message.success('保存成功')
            this.$router.push('/activity/group/list')
          })
          .catch(err => {})
          .finally(() => {
            this.submitLoading = false
            this.submitDraftLoading = false
          })
      })
    },

    computedSelected(row) {
      return !this.commodityData.selected.find(item => item.id === row.id)
    },
    //选择商品
    toAddCommodity() {
      this.showDialog = true
      this.commodityData.page = 1
      this.fetchTaskList()
    },
    //删除商品
    deleteCommodity() {
      this.commodityData.selected = this.commodityData.selected.filter(v => {
        return !this.commodityData.deleteSelect.find(item => item.id === v.id)
      })
    },
    //保存选择的商品
    saveSelectCommodity() {
      let commodity = this.commodityData.currentSelect.filter(v => {
        return !this.commodityData.selected.find(item => item.id === v.id)
      })
      this.commodityData.selected.push(...commodity)
      this.showDialog = false
      let id = this.commodityData.selected[0].id
    },
    //分页
    fetchTaskList(page = 1) {
      this.inFetchingCommodity = true
      this.$axios
        .$get(activityGoodsPageApi, {
          params: {
            page,
            size: 10
          }
        })
        .then(res => {
          this.commodityData.list = res.payload.content
          this.commodityData.total = res.payload.totalElements
        })
        .catch(e => {})
        .finally(() => {
          this.inFetchingCommodity = false
        })
    },
    //重新设置对话框
    resetDialog() {
      this.commodityData.list = []
      this.commodityData.page = 1
    },
    // 校验表单中'拼团价格'的校验规则
    validGroupPriceRule() {
      let currentGoodSalePrice =
        this.commodityData.selected.length > 0
          ? this.commodityData.selected[0].salePrice * 1
          : 0.0
      let formValue = this.$refs.form.getFormValue()
      if (Number(formValue.activityPrice) > currentGoodSalePrice) {
        this.$message('拼团价格不得高于商品价格')
        return false
      }
      return true
    },
    async fetchDetail() {
      this.formLoading = true
      this.selectedProductLoading = true
      try {
        let hspMessagesRes = await this.$axios.$get(cancelGroupList(this.id))
        this.activityDetail = hspMessagesRes.payload || {}
        this.setWhenActivityProcessing()
        let activityGoodsRes = await this.$axios.$get(
          `${activityGoodsPageApi}/${this.activityDetail.productId}`
        )
        this.commodityData.selected = [activityGoodsRes.payload]
        this.$refs.form.updateForm({
          ...this.activityDetail
        })
      } finally {
        setTimeout(() => {
          this.formLoading = false
          this.selectedProductLoading = false
        }, 500)
      }
    },
    // 提取选择商品中图片路径
    getPeroductImgUrl(urls) {
      return urls ? urls.split(',')[0] : ''
    },
    // 当活动为正则进行时，进行的一部分操作
    setWhenActivityProcessing() {
      if (!this.isProcessingActivity) {
        return
      }
      // 禁用一部分form-item
      this.content.forEach(item => {
        if (!editableIdsWhenProcessing.includes(item.$id)) {
          item.$el.disabled = true
        }
      })
      // 设置库存校验规则
      lodashFind(this.content, {$id: 'stockCount'}).rules = [
        {
          trigger: 'blur',
          validator: validStockCount(this.activityDetail.stockCount)
        }
      ]
      // 设置活动日期校验规则
      lodashFind(this.content, {$id: 'startTime'}).rules = [
        {
          trigger: 'blur',
          validator: validActivityDate(
            this.activityDetail.startTime,
            this.activityDetail.endTime
          )
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.group-edit {
  .activity-form {
    width: 520px;
    margin: 0 auto;
  }

  .el-select,
  .el-form-item {
    width: 40%;
  }

  /deep/ .el-input,
  /deep/ .el-date-editor,
  /deep/ .el-input-number {
    width: 100%;
  }

  .group-pagination {
    margin-top: 20px;
    text-align: right;
  }

  .footer {
    margin: 10px;
    text-align: center;
  }
}
</style>
