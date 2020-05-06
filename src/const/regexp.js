// 正整数,位数:0-n
//  /^([1-9]\d{0,6}|0)$/
export const regIntFrZero = n => {
  return new RegExp(`^\(\[1\-9\]\\d\{0\,${n - 1}\}\|0\)$`)
}

// 正整数,位数:m-n
//  /^[1-9]\d{0,6}$/
export const regInt = (m, n) => {
  return new RegExp(`^\[1\-9\]\\d\{${m - 1}\,${n - 1}\}$`)
}

// 小数, m位以内整数部分，n位以内整数部分
//  /^([1-9]\d{0,4}|0)(\.\d{0,2})?$/
export const regDecimal = (m, n) => {
  return new RegExp(
    `^\(\[1\-9\]\\d\{0\,${m - 1}\}\|0\)\(\\.\\d\{0\,${n}\}\)\?$`
  )
}

// 手机号
export const regPhone = () => {
  return new RegExp(`^1\(3\|4\|5\|7\|8\)\\d\{9\}$`)
}
