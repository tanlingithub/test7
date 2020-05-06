import {formatDate} from '@/const/filter'
export const smsType = '0'
export const wechatType = '1'
export const hspActivityCountName = {
  pushNum: '推送次数',
  pushPersonNum: '推送人数',
  visitPersonNum: '访问人数',
  taskPersonNum: '参与人数',
  sharePersonNum: '分享人数'
}
export const hspActivityCountData = {
  pushDate: '推送日期',
  pushTypeName: '推送方式',
  pushCount: '推送人数',
  viewCount: '访问人数',
  joinCount: '参与人数',
  shareCount: '分享人数'
}
export const activeNumDefault = {
  lookNum: {
    allNum: 0,
    dayAverage: 0,
    goUp: false,
    scope: 0
  },
  joinNum: {
    allNum: 0,
    dayAverage: 0,
    goUp: false,
    scope: 0
  },
  shareNum: {
    allNum: 0,
    dayAverage: 0,
    goUp: false,
    scope: 0
  },
  lookxjoin: 0,
  lookxshare: 0,
  joinxshare: 0
}

export const tableColumns = type => {
  return [
    {
      prop: 'memberAccount',
      label: '会员账号'
    },
    {
      prop: 'memberNickName',
      label: '会员昵称'
    },
    {
      prop: 'telephone',
      label: '手机号码'
    },
    {
      prop: 'pushDate',
      label: type === smsType ? '最早推送时间' : '推送时间',
      formatter: row => formatDate(row.pushDate, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      prop: 'visitDate',
      label: type === smsType ? '最早访问时间' : '访问时间',
      formatter: row => formatDate(row.visitDate, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      prop: 'joinDate',
      label: type === smsType ? '最早参与时间' : '参与时间',
      formatter: row => formatDate(row.joinDate, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      prop: 'shareDate',
      label: type === smsType ? '最早分享时间' : '分享时间',
      formatter: row => formatDate(row.shareDate, 'YYYY-MM-DD HH:mm:ss')
    }
  ]
}

export const activiName = {
  lookNum: '访问',
  joinNum: '参与',
  shareNum: '分享'
}

export const groupDataColumns = [
  {
    type: 'sex',
    name: '性别',
    settings: {
      type: 'histogram'
    },
    columns: ['key', 'value'],
    rows: []
  },
  {
    type: 'age',
    name: '年龄',
    settings: {
      type: 'histogram'
    },
    columns: ['key', 'value'],
    rows: []
  },
  {
    type: 'study',
    name: '学历',
    settings: {
      type: 'pie'
    },
    columns: ['key', 'value'],
    rows: []
  },
  {
    type: 'monthIncome',
    name: '月收入',
    settings: {
      type: 'pie'
    },
    columns: ['key', 'value'],
    rows: []
  },
  {
    type: 'provinces',
    name: '所在地区',
    settings: {
      type: 'histogram'
    },
    columns: ['key', 'value'],
    rows: []
  },
  {
    type: 'appSlug',
    name: '应用渠道',
    settings: {
      type: 'ring'
    },
    columns: ['key', 'value'],
    rows: []
  }
]

export const tagList = [
  {
    label: '性别',
    key: 'sex'
  },
  {
    label: '年龄',
    key: 'age'
  },
  {
    label: '学历',
    key: 'study'
  },
  {
    label: '月收入',
    key: 'monthIncome'
  },
  {
    label: '所在地区',
    key: 'provinces'
  },
  {
    label: '应用渠道',
    key: 'appSlug'
  }
]
