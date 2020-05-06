import {cellPhone, email as regEmail} from '@levy9527/pattern-js'
import {regInt} from '@/const/regexp.js'
import {formatDate} from '@/const/filter'
import {InputNumber} from 'element-ui'

const phone = (rule, value, callback) => {
  if (!cellPhone.test(value)) {
    callback(new Error('请输入正确的手机格式'))
  } else {
    callback()
  }
}

const sex = {
  0: '未知',
  1: '男',
  2: '女'
}

// 计算某个生日(时间戳格式)，计算出年龄
export const calcAgeByBirthday = ageTime => {
  let birthdayYear = new Date(ageTime).getFullYear()
  let nowYear = new Date().getFullYear()
  return nowYear - birthdayYear
}

// 会员列表查询form
export const memberSearchForm = [
  {
    $type: 'input',
    $id: 'account',
    label: '会员账号',
    $el: {placeholder: '请输入'}
  },
  {
    $type: 'select',
    $id: 'groupId',
    label: '所属分组',
    $el: {placeholder: '请输入'}
  },
  {
    $type: 'select',
    $id: 'state',
    label: '状态',
    $el: {placeholder: '请输入'},
    $options: [{label: '启用', value: '1'}, {label: '禁用', value: '0'}]
  },
  {
    $type: 'input',
    $id: 'mobile',
    label: '会员手机号',
    $el: {placeholder: '请输入'}
  }
]
// 账号信息form项
export const accountContent = [
  {
    $type: 'input',
    $id: 'account',
    label: '会员账号',
    $el: {placeholder: '请输入', maxlength: 15},
    rules: [{required: true, message: '请输入会员账号', trigger: 'blur'}]
  },
  {
    $type: 'input',
    $id: 'mobile',
    label: '手机号',
    $el: {placeholder: '请输入'},
    rules: [
      {
        message: '请输入正确的手机号码',
        trigger: 'blur',
        required: true
      },
      {validator: phone, trigger: 'blur'}
    ]
  },
  {
    $type: 'radio-group',
    $id: 'state',
    label: '状态',
    $el: {placeholder: '请输入'},
    rules: [{required: true, message: '请选择状态', trigger: 'blur'}],
    $default: '0',
    $options: [{label: '启用', value: '1'}, {label: '禁用', value: '0'}]
  },
  {
    $type: 'input',
    $id: 'nickName',
    label: '昵称',
    $el: {placeholder: '请输入', maxlength: 15}
  }
]
// 个人信息form项 (因this指向问题，弃用 ,0190329)
export const userContent = [
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
    $default: '0',
    $options: [{label: '男', value: '0'}, {label: '女', value: '1'}]
  },
  {
    $id: 'birth',
    $type: 'date-picker',
    label: '生日',
    $el: {
      // type: 'daterange',   // 如果 type 为 daterange，则获取到的是一个数组
      placeholder: '请选择',
      valueFormat: 'timestamp'
    }
  },
  {
    $type: 'input-number',
    component: InputNumber,
    $id: 'age',
    label: '年龄',
    $el: {placeholder: '请输入', max: 999, min: 1, precision: 0}
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
    $el: {placeholder: '请输入', maxlength: 20}
  },
  {
    $type: 'input',
    $id: 'qq',
    label: 'QQ',
    $el: {placeholder: '请输入', maxlength: 20}
  }
]
// 会员excel模版
export const excelStencil = [
  {prop: 'account', label: '会员账号'},
  {prop: 'mobile', label: '会员手机号'},
  {prop: 'state', label: '状态(启用,禁用)'}
]
// 导出模版
export const exportExcelStencil = [
  {prop: 'account', label: '会员账号'},
  {prop: 'mobile', label: '会员手机号'},
  {prop: 'state', label: '状态(启用,禁用)'},
  {prop: 'nickName', label: '昵称'},
  {prop: 'name', label: '姓名'},
  {prop: 'sex', label: '性别'},
  {prop: 'age', label: '年龄'},
  {prop: 'birth', label: '生日'},
  {prop: 'job', label: '工作'},
  {prop: 'wechat', label: '微信'},
  {prop: 'email', label: '邮箱'},
  {prop: 'qq', label: 'QQ'},
  {prop: 'provinces', label: '省份'},
  {prop: 'city', label: '城市'},
  {prop: 'district', label: '地区'},
  {prop: 'location', label: '详细地址'}
]
// 会员分组列
export const groupColumns = [
  {prop: 'name', label: '分组名称'},
  {prop: 'tagNames', label: '标签', formatter: row => row.tagNames.join(',')},
  {prop: 'type', label: '分组类型'},
  {prop: 'state', label: '状态'},
  {
    prop: 'creatTime',
    label: '创建时间',
    formatter: row => formatDate(row.creatTime, 'YYYY-MM-DD HH:mm:ss')
  }
]
// 新增分组content
export const addGroupContent = [
  {
    $type: 'input',
    $id: 'name',
    label: '分组名称',
    $el: {placeholder: '请输入'},
    rules: [{required: true, message: '请输入分组名称', trigger: 'blur'}]
  },
  {
    $type: 'input',
    $id: 'name',
    label: '分组描述',
    $el: {placeholder: '请输入', type: 'textarea'}
  },
  {
    $type: 'radio-group',
    $id: 'state',
    label: '状态',
    $el: {placeholder: '请输入'},
    rules: [{required: true, message: '请选择状态', trigger: 'blur'}],
    $default: '0',
    $options: [{label: '启用', value: '0'}, {label: '禁用', value: '1'}]
  }
]

// 会员详情信息
export const infoCell = [
  {key: 'name', label: '姓名'},
  {
    key: 'sex',
    label: '性别',
    formatter: row => sex[row.sex]
  },
  {
    key: 'birth',
    label: '生日',
    formatter: row => formatDate(row.createdAt, 'YYYY-MM-DD')
  },
  {key: 'age', label: '年龄'},
  {key: 'job', label: '职业'},
  {key: 'wechat', label: '微信'},
  {key: 'qq', label: 'QQ'},
  {key: 'email', label: '邮箱'},
  {key: 'location', label: '联系地址'}
]

// 导入key/value
export const importExcelKey = {
  account: '会员账号',
  mobile: '会员手机号',
  state: '状态(启用,禁用)'
}

export const chartModule = (type, rows) => {
  return {
    type,
    settings: {type: 'histogram'},
    columns: ['key', 'value']
  }
}

// 会员分组画像
export const groupDataColumns = [
  {
    type: 'sex',
    settings: {type: 'histogram'},
    columns: ['key', 'value'],
    rows: [
      {
        key: '男',
        value: 1393
      },
      {
        key: '女',
        value: 3900
      }
    ]
  },
  {
    type: 'age',
    settings: {type: 'histogram'},
    columns: ['key', 'value'],
    rows: [
      {
        key: '18岁以下',
        value: 1393
      },
      {
        key: '19-23',
        value: 100
      },
      {
        key: '24-28',
        value: 1230
      },
      {
        key: '29-33',
        value: 750
      },
      {
        key: '34-38',
        value: 1750
      },
      {
        key: '39-48',
        value: 2750
      },
      {
        key: '48岁以上',
        value: 1750
      }
    ]
  },
  {
    type: 'ageInterval',
    settings: {type: 'histogram'},
    columns: ['key', 'value'],
    rows: [
      {
        key: '60后',
        value: 1393
      },
      {
        key: '70后',
        value: 3900
      },
      {
        key: '80后',
        value: 1693
      },
      {
        key: '90后',
        value: 4393
      },
      {
        key: '00后',
        value: 3393
      }
    ]
  },
  {
    type: 'constellation',
    settings: {type: 'histogram'},
    columns: ['key', 'value'],
    rows: [
      {
        key: '白羊座',
        value: 1393
      },
      {
        key: '金牛座',
        value: 3900
      },
      {
        key: '双子座',
        value: 1693
      },
      {
        key: '巨蟹座',
        value: 4393
      },
      {
        key: '狮子座',
        value: 2393
      },
      {
        key: '处女座',
        value: 7393
      },
      {
        key: '天秤座',
        value: 2293
      },
      {
        key: '天蝎座',
        value: 9393
      },
      {
        key: '射手座',
        value: 2113
      },
      {
        key: '摩羯座',
        value: 3393
      },
      {
        key: '水瓶座',
        value: 5393
      },
      {
        key: '双鱼座',
        value: 3793
      }
    ]
  }
]

// 表单校验-邮箱-非必填
export const validEmail = (rule, value, callback) => {
  if (value && !regEmail.test(value)) {
    return callback(new Error('请输入正确的邮箱'))
  }
  callback()
}

// 表单校验-QQ-非必填
export const validQQ = (rule, value, callback) => {
  if (value && !regInt(5, 20).test(value)) {
    return callback(new Error('请输入正确的QQ(5-20位数字)'))
  }
  callback()
}
