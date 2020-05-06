const version = '/api/v1'

const hspTradeCenter =
  'http://39.100.141.76:3000/mock/95/hsp-trade-center' + version
const hspMemberCenter = '/hsp-member-center' + version
const hspAuthCenter = '/hsp-auth-center' + version
const hspMessageCenter = '/hsp-message-center' + version
const hspDatastatisticsCenter = 'hsp-datastatistics-center' + version
const hspWechatCenter = '/hsp-wechat-center' + version

//拼团
export const groupList = hspTradeCenter + '/hspGroupbuyActivitys'
export const cancelGroupList = id => `${groupList}/${id}`
// 拼团-停止
export const stopGroup = id =>
  `${hspTradeCenter}/hspGroupbuyActivitys/stop/${id}`

// export const mockServer = 'http://yapi.deepexi.io:5002/mock/898'
export const mockServer = 'http://39.100.141.76:3000/mock/95' + version

//商品
export const activityGoodsPageApi = hspTradeCenter + '/hspActiveProducts'
export const orderListPageApi = hspTradeCenter + '/hspTradeOrders'
// 优惠券列表
export const couponsList = `${hspTradeCenter}/hspCoupons`
export const couponStop = id => `${hspTradeCenter}/hspCoupons/stop/${id}`

//
export const couponsDetailList = `${hspTradeCenter}/myhspCoupons/couponDetail/list`
export const couponsDetailNum = `${hspTradeCenter}/myhspCoupons/couponDetail/count`

// 会员列表
export const memberList = `${hspMemberCenter}/hspMembers`
// 会员基本信息
export const memberInfo = id => `${hspMemberCenter}/hspMembers/${id}`
// 会员成长轨迹
export const memberTraceApi = id =>
  `${hspMemberCenter}/hspMemberGroups/trail/${id}`
// 会员记录次数
export const memberCount = id => `${hspMemberCenter}/hspMemberCounts/${id}`
// 会员分享记录列表
export const memberShareList = id =>
  `${hspDatastatisticsCenter}/hspMemberShareInfos/${id}`
// 会员活动信息列表
export const activityDataList = id =>
  `${hspDatastatisticsCenter}/hspMemberActivityInfos/activity/info/${id}`
// 禁用会员
export const disabledMember = id =>
  `${hspMemberCenter}/hspMembers/prohibit/${id}`
// 启用会员
export const enableMember = id => `${hspMemberCenter}/hspMembers/enable/${id}`
// 数据原来的用户信息
export const dataMember = id =>
  `${hspDatastatisticsCenter}/hspMemberCounts/member/info/${id}`

// 会员分组列表
export const memberGroupList = `${hspMemberCenter}/hspMemberGroups`
//标签分类列表分页
export const tagsClassifyPage = `${hspMemberCenter}/hspTagTypes`
// 启用分组
export const enableGroup = id =>
  `${hspMemberCenter}/hspMemberGroups/enable/${id}`
// 禁用分组
export const disabledGroup = id =>
  `${hspMemberCenter}/hspMemberGroups/prohibit/${id}`

// 标签列表，根据类型去查询自定义或者基础
// export const tagList = `${hspMemberCenter}/hspTags`
export const tagList = 'http://39.98.50.163:3000/mock/1647/hspTags'
// 自定义标签
export const customTag = `${hspMemberCenter}/hspCustomTag`
// 标签分类不分页
export const tagTypeList = `${hspMemberCenter}/hspTagTypes/list`
// 基础标签分页
export const basicsTag = `${hspMemberCenter}/hspTagBases`
// 基础标签不分页
export const tagBaseList = `${hspMemberCenter}/hspTagBases/list`
// 标签查询规则
export const tagRule = `${hspMemberCenter}/hspRules/findByRelationIds`
// 根据规则id获取对应规则
export const ruleList = id => `${hspMemberCenter}/es/pid/${id}`

//通过会员分组获取手机号
export const meberMobile = `${hspMemberCenter}/hspMembers/mobile`
// 批量导入
export const importMember = `${hspMemberCenter}/hspMembers/import`
// 批量导出
export const exportMember = `${hspMemberCenter}/hspMembers/export`

// 注册
export const registerApi = `${mockServer}/accounts/register`
// 登陆
export const loginApi = `${mockServer}/accounts/login`
// 解析token
export const analysisToken = `${mockServer}/accounts/queryUserByToken`
// 账户信息
export const userInfoApi = `${mockServer}/accounts/queryUserById`

//公众号消息列表&&新增公众号消息&&公众号消息详情
export const vipcnListApi = id =>
  id
    ? `${hspMessageCenter}/hspMessages/${id}`
    : `${hspMessageCenter}/hspMessages`
//获取全部公众号列表（不分页）
export const accountsList = `${hspWechatCenter}/mp/account/list`
// 公众号授权新增
export const accountBind = `${hspWechatCenter}/mp/account`
//公众号绑定||解绑
export const accountsBound = id => `${hspWechatCenter}/mp/account/${id}`
//公众号消息取消发送
export const cancleSend = id => `${hspMessageCenter}/hspMessages/status/${id}`

//短信列表
export const messageList = `${hspMessageCenter}/hspSmsRules`
// 短信-取消发送
export const messageCancelSend = id => `${hspMessageCenter}/hspSmsRules/${id}`
//短信详情
export const messageDetail = id => `${hspMessageCenter}/hspSmss/${id}`
//获取短信数量
export const messageNum = `${hspMessageCenter}/hspSmss/num`
//新建普通短信
export const newNormalMessage = `${hspMessageCenter}/hspSmss`
//新建营销短信
export const newActivityMessage = `${hspMessageCenter}/hspSmss/activity`

//测试短信
export const testMessage = `${hspMessageCenter}/hspSmss/test`
// 标签地图
export const tagMap = `${hspMemberCenter}/hspMembers/tag/map`
//数据分析

export const hspActivityCounts = `${hspDatastatisticsCenter}/hspActivityCounts`

//大数据
export const hspActivityCountBigDatas = `${hspDatastatisticsCenter}/hspActivityCountBigDatas`

//活动推送总能量
export const hspActivityCountAll = id => `${hspActivityCounts}/all/${id}`

//活动推送详情短信群发数据
export const hspActivityCountSmsData = id =>
  `${hspActivityCounts}/sms/data/${id}`
//活动推送详情列表
export const hspActivityCountSms = id => `${hspActivityCounts}/sms/${id}`

//活动推送详情短信群发数据
export const hspActivityCountWechatData = id =>
  `${hspActivityCounts}/wechat/data/${id}`
//活动推送详情列表
export const hspActivityCountWechat = id => `${hspActivityCounts}/wechat/${id}`

//活动概括详情
export const hspActivityCountActivity = id => `${hspActivityCounts}/${id}`
//活动概括详情大数据
export const hspActivityCountBigDatasActivity = id =>
  `${hspActivityCountBigDatas}/${id}`

//最近活动
export const recentActive = `${hspTradeCenter}/hspCoupons/latest/activity`

//获取群体画像
export const portrayActive = id => `${hspActivityCounts}/portray/${id}`

// 获取一级标签
export const firstTag = `${hspMemberCenter}/big/hspTags/category/getAll`
// 获取二级标签
export const childrenTag = id =>
  `${hspMemberCenter}/big/hspTags/category/attributes/${id}`
// 保存自定义标签{大数据版本}
export const saveBigTag = `${hspMemberCenter}/big/hspTags/mixedTag/create`
// 编辑自定义标签{大数据版本}
export const editBigTag = `${hspMemberCenter}/big/hspTags/mixedTag/update`
// 自定义标签列表{大数据版本}
export const bigTagList = `${hspMemberCenter}/big/hspTags/mixedTagsPageList`
// 自定义标签详情{大数据版本}
export const bigTagDetail = `${hspMemberCenter}/big/hspTags/mixedTag/get`
// 自定义标签删除{大数据版本}
export const deleteBigTag = `${hspMemberCenter}/big/hspTags/mixedTag/delete`
// 基础标签列表{大数据版本}
export const bigBasicTag = `http://39.98.50.163:3000/mock/1647/big/hspTags/attributes/pageList`
// 标签分类{大数据版本}
export const bigTagType = `${mockServer}/big/hspTags/category/pageList`

// 创建会员分组{大数据版本}
export const createMemberGroup = `${hspMemberCenter}/big/groups/create`
// 会员分组详情/编辑{大数据版本}
export const memberGroupDetail = id => `${hspMemberCenter}/big/groups/${id}`
// 会员分组画像{大数据版本}
export const groupDetail = id =>
  `${hspMemberCenter}/big/groups/charts/date/${id}`
// 授权跳转页面
export const autoToPage = url =>
  `${hspWechatCenter}/wechatapi/auth/goto_auth_url?url=${url}`
// 回调绑定公众号
export const authJumpBind = `${hspWechatCenter}/wechatapi/auth/jump`

//获取群体画像大数据
export const portrayActiveBigDatas = id =>
  `${hspActivityCountBigDatas}/portray/${id}`

//获取群体画像tag
export const portrayActiveTag = id =>
  `${hspActivityCountBigDatas}/portray/tag/${id}`
//获取推送详情id
export const pushIdBigDatas = id => `${hspActivityCountBigDatas}/push/${id}`

//获取推送列表上数据
export const pushDataBigDatas = `${hspActivityCountBigDatas}/push/data`
// export const pushDataBigDatas = (id, type) => `${hspActivityCountBigDatas}/push/data/${id}/${type}`

//获取推送列表数据
export const listDataBigDatas = `${hspActivityCountBigDatas}/push/items`
// export const listDataBigDatas = (id, type) => `${hspActivityCountBigDatas}/push/items/${id}/${type}`

export const dmMockServer = 'http://39.100.141.76:3000/mock/95'
// 原生标签列表
export const nativeTagList = `${dmMockServer}/native/tag/list`
// 新增原生属性
export const addNativeTag = `${dmMockServer}/native/tag/add`
// 标签详情
export const nativeTagInfo = id => `${dmMockServer}/native/tag/${id}`

// 派生标签列表
export const deriveTagList = `${dmMockServer}/derive/tag/list`
// 新增派生标签
export const addDerive = `${dmMockServer}/derive/tag/add`
// 派生标签详情
export const deriveTagInfo = id => `${dmMockServer}/derive/tag/${id}`

// 复合标签列表
export const compoundTagList = `${dmMockServer}/compound/tag/list`
// 新增复合标签
export const addCompound = `${dmMockServer}/compound/tag/add`
// 复合标签详情
export const compoundTagInfo = id => `${dmMockServer}/compound/tag/${id}`
// 条件树列表
export const conditionTree = `${dmMockServer}/compound/tag/condition/list`
