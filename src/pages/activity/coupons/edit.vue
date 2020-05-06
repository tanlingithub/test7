<template>
  <!-- 优惠券类型，form-renderer的enableWhen为false的一方rules不会生效,无法使用form-renderer -->
  <el-form
    :model="couponForm"
    ref="couponForm"
    class="coupons-edit"
    label-width="100px"
    v-loading="editLoading"
    :rules="rules"
  >
    <el-form-item label="优惠券名称" prop="name">
      <el-input :maxlength="15" v-model="couponForm.name"></el-input>
    </el-form-item>
    <el-form-item label="优惠券类型">
      <el-radio-group v-model="couponForm.type">
        <el-radio label="0">代金券</el-radio>
        <el-radio label="1">折扣券</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="couponForm.type === '0'" label="代金券面值" prop="faceValue">
      <el-input placeholder="请输入" v-model="couponForm.faceValue" :maxlength="7"></el-input>
    </el-form-item>
    <el-form-item v-if="couponForm.type === '1'" label="折扣券面值" prop="discountValue">
      <el-input placeholder="请输入" v-model="couponForm.discountValue" :maxlength="3"></el-input>
    </el-form-item>
    <!-- 券使用时间 -->
    <el-form-item label="券使用时间">
      <el-radio-group v-model="useLimitTimeFlag" class="use-time">
        <el-radio label="0">不限制</el-radio>
        <el-radio label="1">指定时间</el-radio>
      </el-radio-group>
      <template v-if="useLimitTimeFlag === '1'">
        <el-date-picker
          v-model="useLimitTime"
          type="datetimerange"
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </template>
    </el-form-item>
    <!-- 使用条件 -->
    <el-form-item label="使用条件" class="use-amount" prop="useLimitAmuont">
      <el-radio-group v-model="useLimitAmuontFlag">
        <el-radio label="0">无门槛</el-radio>
        <el-radio label="1">订单金额（元）</el-radio>
      </el-radio-group>
      <template v-if="useLimitAmuontFlag === '1'">
        <el-input placeholder="请输入" v-model="couponForm.useLimitAmuont" class="input-amuont"></el-input>
      </template>
    </el-form-item>
    <!-- 发放对象 -->
    <el-form-item label="发放对象">
      <el-radio-group v-model="memberObj">
        <el-radio label="1">全部会员</el-radio>
        <el-radio label="2">按会员分组</el-radio>
        <el-radio label="3">按会员标签</el-radio>
      </el-radio-group>
      <br />
      <template v-if="memberObj === '2'">
        <el-button type="primary" @click="addMemberGroup">添加</el-button>
        <br />
        <el-tag
          v-for="item in selectedGroup"
          :key="item.id"
          closable
          class="group-tag"
          @close="deleteGroup(item)"
        >{{ item.name }}</el-tag>
      </template>

      <template v-if="memberObj === '3'">
        <el-button type="primary" @click="tagVisible = true">添加</el-button>
        <br />
        <el-tag
          v-for="item in selectedTag"
          :key="item.id"
          class="group-tag"
          closable
          @close="deleteTag(item)"
        >{{ item.name }}</el-tag>
      </template>
    </el-form-item>

    <!-- 适用商品 -->
    <el-form-item label="适用商品">
      <el-radio-group v-model="product">
        <el-radio label="1">全部商品</el-radio>
        <el-radio label="2">指定商品参与</el-radio>
        <el-radio label="3">指定商品不参与</el-radio>
      </el-radio-group>
      <br />
      <template v-if="product === '2'">
        <el-button type="primary" @click="productVisible = true">添加</el-button>
        <data-table class="product-table" :data.sync="selectedProduct"></data-table>
      </template>
      <template v-if="product === '3'">
        <el-button type="primary" @click="disabledVisible = true">添加</el-button>
        <data-table class="product-table" :data.sync="disabledProduct"></data-table>
      </template>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="publishLoading" @click="publish('publish')">保存并发放</el-button>
      <el-button :loading="saveLoading" @click="publish('save')">仅保存</el-button>
      <el-button @click="$router.back()">取消</el-button>
    </el-form-item>

    <!-- 添加分组 -->
    <el-dialog :visible.sync="groupVisible" title="添加分组">
      <group-table ref="groupTable" :data="groupData" :groupList.sync="selectedGroup" border></group-table>
      <div slot="footer">
        <el-button @click="cancelGroup">取消</el-button>
        <el-button type="primary" @click="groupVisible = false">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加标签 -->
    <tag-info ref="tagInfo" :visible.sync="tagVisible" @selected="getTagList" :isRuleTag="false"></tag-info>

    <!-- 指定商品 -->
    <!-- <el-dialog :visible.sync="productVisible" title="选择商品">
      <el-data-table
        ref="productTable"
        v-bind="suitAbleConfig"
        :columns="columns"
        @selection-change="handleSelectionProduct"></el-data-table>
      <div slot="footer">
        <el-button @click="productVisible = false">取消</el-button>
        <el-button type="primary" @click="productVisible = false">确定</el-button>
      </div>
    </el-dialog>-->
    <suitable-table
      ref="suitableTable"
      :visible.sync="productVisible"
      @selected="handleSelectionProduct"
    ></suitable-table>
    <suitable-table
      ref="suitableTable"
      :visible.sync="disabledVisible"
      @selected="handleSelectionDisabled"
    ></suitable-table>
  </el-form>
</template>
<script>
import RadioInput from '@/container/trade/radio-input'
import GroupTable from '@/container/member/group-table'
import TagInfo from '@/container/member/tag-info'
import DataTable from '@/container/trade/data-table'
import SuitableTable from '@/container/trade/suitable-product-table'
import {
  suitAbleConfig,
  discountVaild,
  faceVaild,
  amountVaild
} from '@/const/order'
import {memberGroupList, couponsList, activityGoodsPageApi} from '@/const/api'
import {Tag} from 'element-ui'

const ALL = '1'
const ALL_TYPE = '0'
//发送状态
const PUBLISH_TYPE = '1'
//草稿状态
const SAVE_TYPE = '3'

const SEND = 'publish'

const sendObjectKey = {
  2: 'selectedGroup',
  3: 'selectedTag'
}

const suitAbleProductKey = {
  2: 'selectedProduct',
  3: 'disabledProduct'
}

export default {
  name: 'coupons-edit',
  components: {
    RadioInput,
    GroupTable,
    TagInfo,
    DataTable,
    SuitableTable,
    'el-tag': Tag
  },
  data() {
    return {
      useLimitAmuont: '',
      useLimitAmuontFlag: '0',
      useLimitTimeFlag: '0',
      useLimitTime: [],
      editLoading: false,
      groupVisible: false,
      productVisible: false,
      selectedGroup: [],
      selectedTag: [],
      groupData: [],
      saveLoading: false,
      couponData: {},
      memberObj: ALL, // 发放对象
      product: ALL, // 使用商品
      publishLoading: false,
      suitAbleConfig, // 商品table
      all: ALL,
      tagVisible: false,
      columns: [
        {type: 'selection'},
        {
          prop: 'name',
          label: '商品',
          formatter: row => {
            return (
              <div>
                <img class="product-img" src={row.imageUrl} />
                {row.name}
              </div>
            )
          }
        },
        {prop: 'salePrice', label: '价格'}
      ],
      couponForm: {
        name: '',
        type: '0',
        faceValue: '',
        discountValue: ''
      },
      rules: {
        name: [{required: true, message: '请输入优惠券名称', trigger: 'blur'}],
        faceValue: [
          {required: true, message: '请输入代金券面值', trigger: 'blur'},
          {validator: faceVaild, trigger: 'blur'}
        ],
        discountValue: [
          {required: true, message: '请输入折扣券面值', trigger: 'blur'},
          {validator: discountVaild, trigger: 'blur'}
        ]
      },
      selectedProduct: [],
      disabledProduct: [],
      copyGroup: [],
      isFirst: false,
      disabledVisible: false
    }
  },
  computed: {
    couponId() {
      return this.$route.query.couponId
    }
  },
  async mounted() {
    if (this.couponId) {
      // await this.getCoupon(this.couponId)
      // this.getProduct()
    }
    // this.getGroupList()
  },
  methods: {
    //获取优惠券详情
    async getCoupon(id) {
      this.editLoading = true
      await this.$axios
        .$get(`${couponsList}/${id}`)
        .then(res => {
          let resData = res.payload
          this.couponData = res.payload
          //处理券使用时间
          this.useLimitTime = [
            resData.useLimitStartTime,
            resData.useLimitEndTime
          ]
          this.useLimitAmuontFlag = resData.useLimitAmuontFlag || ALL_TYPE
          this.useLimitTimeFlag = resData.useLimitTimeFlag || ALL_TYPE
          //处理使用条件
          // this.useLimitAmuont = resData.useLimitAmuont
          this.memberObj = resData.sendType
          this.product = resData.suitableType
          Object.keys(this.couponForm).forEach(key => {
            this.couponForm[key] = res.payload[key]
          })
        })
        .finally(() => {
          this.editLoading = false
        })
    },
    // 获取会员分组
    async getGroupList() {
      let resp = await this.$axios.$get(memberGroupList)
      this.groupData = resp.payload.content
      if (this.couponId && this.couponData.sendType !== ALL)
        this.selectedGroup = this.groupData.filter(
          val => this.couponData.sendParms.indexOf(val.id) > -1
        )
    },
    // 获取适用商品
    async getProduct() {
      if (this.couponData.suitableType === ALL) return
      let resp = await this.$axios.$get(activityGoodsPageApi)
      // 更新到对应类型的商品
      const key = suitAbleProductKey[this.couponData.suitableType]
      this[key] = resp.payload.content.filter(
        val => this.couponData.suitableParms.indexOf(val.id) > -1
      )
    },
    // 添加会员分组
    addMemberGroup() {
      // 做一层拷贝，取消的时候回显原本的值
      this.copyGroup = [...this.selectedGroup]
      this.groupVisible = true
      if (this.isFirst) return
      this.isFirst = true
      this.$nextTick(() => {
        this.copyGroup.forEach(val => {
          this.$refs.groupTable.$refs.groupTable.toggleRowSelection(val)
        })
      })
    },
    // 取消选择会员分组
    cancelGroup() {
      this.$refs.groupTable.$refs.groupTable.clearSelection()
      this.copyGroup.forEach(val => {
        this.$refs.groupTable.$refs.groupTable.toggleRowSelection(val)
      })
      this.groupVisible = false
    },
    // 删除会员分组
    deleteGroup(val) {
      if (this.$refs.groupTable)
        this.$refs.groupTable.$refs.groupTable.toggleRowSelection(val)
      this.selectedGroup = this.selectedGroup.filter(item => item.id !== val.id)
    },
    // 获取会员标签
    getTagList(val) {
      this.selectedTag = val
    },
    //删除标签
    deleteTag(val) {
      this.selectedTag = this.selectedTag.filter(item => item.id !== val.id)
      this.$refs.tagInfo.deleteTag(val.id)
    },
    // 选择商品
    handleSelectionProduct(val) {
      this.selectedProduct = val
    },
    handleSelectionDisabled(val) {
      this.disabledProduct = val
    },
    // 发放优惠券
    publish(type) {
      this.$refs.couponForm.validate(valid => {
        if (!valid) return

        if (
          this.useLimitAmuontFlag !== ALL_TYPE &&
          !amountVaild.test(this.couponForm.useLimitAmuont)
        ) {
          this.$message.warning('订单金额需要在1~99999之间(限整数)')
          return
        }

        this.publishLoading = type === SEND
        this.saveLoading = type !== SEND

        let sendObject = {
          type: this.memberObj,
          parms:
            this.memberObj === ALL
              ? '0'
              : this[sendObjectKey[this.memberObj]]
                  .map(item => item.id)
                  .join(',')
        }

        let suitAbleProduct = {
          suitable_type: this.product,
          suitable_parms:
            this.product === ALL
              ? '0'
              : this[suitAbleProductKey[this.product]]
                  .map(item => item.id)
                  .join(',')
        }
        let data = Object.assign({sendObject, suitAbleProduct}, this.couponForm)
        data.useLimitAmuontFlag = this.useLimitAmuontFlag
        data.useLimitTimeFlag = this.useLimitTimeFlag
        if (this.useLimitTimeFlag !== ALL_TYPE) {
          data.useLimitStartTime = this.useLimitTime[0]
          data.useLimitEndTime = this.useLimitTime[1]
        }
        if (this.useLimitAmuontFlag === ALL_TYPE) {
          delete data['useLimitAmuont']
        }
        //区分发送和仅保存的状态
        data.status = type === SEND ? PUBLISH_TYPE : SAVE_TYPE
        let method = this.couponId ? '$put' : '$post'
        let reqUrl = this.couponId
          ? `${couponsList}/${this.couponId}`
          : `${couponsList}`
        this.$axios[method](reqUrl, data)
          .then(resp => {
            if (resp.code === '0') {
              this.$message.success('操作成功')
              this.$router.back()
            } else {
              this.$message.warning(resp.msg)
            }
          })
          .catch(e => console.log(e))
          .finally(() => {
            this.publishLoading = false
            this.saveLoading = false
          })
      })
    }
  }
}
</script>
<style lang="less">
.coupons-edit {
  .product-img {
    width: 100px;
    margin-right: 20px;
    vertical-align: middle;
  }

  .use-time {
    margin-right: 20px;
  }

  .group-tag {
    display: inline-block;
    margin: 10px 20px 0 0;
  }

  .product-table {
    margin-top: 10px;
  }

  .input-amuont {
    width: 30%;
    margin-left: 20px;
  }
}
</style>
