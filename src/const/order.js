import {activityGoodsPageApi} from '@/const/api'
import {regInt} from '@/const/regexp.js'

export const discountVaild = (rule, value, callback) => {
  if (!/^[1-9]{1}(\.[0-9])?$/.test(value)) {
    callback(new Error('折扣券格式不正确，正确格式为1~9.9'))
  } else {
    callback()
  }
}

export const faceVaild = (rule, value, callback) => {
  if (!/^[1-9][0-9]{0,4}(\.[0-9])?$/.test(value)) {
    callback(new Error('代金券面值格式不正确，正确格式为1~99999.9'))
  } else {
    callback()
  }
}

export const amountVaild = regInt(1, 5)
export const suitAbleConfig = {
  url: activityGoodsPageApi,
  hasOperation: false,
  hasNew: false,
  hasDelete: false,
  searchForm: [
    {
      $type: 'input',
      $id: 'name',
      label: '商品名称',
      $el: {placeholder: '请输入'}
    }
  ]
}
