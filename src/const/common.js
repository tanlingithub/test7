const Object2Array = obj => {
  return Object.keys(obj).map(k => ({
    label: obj[k],
    value: k
  }))
}

export const TYPE_MAP = {
  archar: 'archar',
  date: 'date',
  tinyint: 'tinyint'
}

// 用于定义属性 数据库存储值 对应属性中文表达
export const DEFAULT_KEY_VALUE = {
  label: '',
  value: ''
}

// 原生标签类型
export const TAG_TYPE_MAP = {
  1: '自然属性',
  2: '社会属性',
  3: '行为特征',
  4: '消费属性',
  5: '心理特征'
}

// 原生标签类型列表
export const TAG_TYPE_LIST = Object2Array(TAG_TYPE_MAP)

// 区间条件
export const CONDITION_MAP = {
  1: '≥',
  2: '>',
  // 3:'=',
  4: '≤',
  5: '<'
}

export const CONDITION_SYMBOL_MAP = {
  1: '[',
  2: '(',
  // 3:'=',
  4: ']',
  5: ')'
}

// 区间条件列表
export const CONDITION_LIST = Object2Array(CONDITION_MAP)

// 派生标签 约束条件使用
export const FULL_CONDITION_MAP = {
  1: '≥',
  2: '>',
  3: '=',
  4: '≤',
  5: '<',
  6: '≠'
}

export const FULL_CONDITION_MAP_LIST = Object2Array(FULL_CONDITION_MAP)
