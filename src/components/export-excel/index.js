/* eslint-disable */

// 来源于@d2-projects/vue-table-export 有改动

import './_blob'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'

/**
 * 将日期和时间转换为日期序列值(excel支持的日期值)
 * @param v 需要转换的Date值
 * @param date1904 工作簿是否使用 1904年日期系统
 * @return {number}
 */
function datenum(v, date1904) {
  // 1904 日期系统
  if (date1904) v += 1462
  var epoch = Date.parse(v)
  // http://www.cpearson.com/excel/datetime.html
  // 基准日期，1899年12月30日
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}

/**
 * 将传进来的二维数组处理成xlsx需要的数据格式
 * @param data [[], ..., []]
 * @return {{}}
 */
function sheet_from_array_of_arrays(data) {
  let worksheet = {}
  // s: 开始的行数，列数
  // e: 结束的行数，列数
  let range = {s: {c: 0, r: 0}, e: {c: 0, r: data.length}}
  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      // 结束取最大值
      if (range.e.c < C) range.e.c = C
      let cell = {v: data[R][C]}
      if (cell.v === null || cell.v === undefined) continue
      // 单元格地址B5由对象表示{c:1, r:4}
      let cell_ref = XLSX.utils.encode_cell({c: C, r: R})

      // 格式化 number, boolean, Date
      if (typeof cell.v === 'number') cell.t = 'n'
      else if (typeof cell.v === 'boolean') cell.t = 'b'
      else if (cell.v instanceof Date) {
        cell.t = 'n'
        cell.z = XLSX.SSF._table[14]
        cell.v = datenum(cell.v)
      } else cell.t = 's'

      worksheet[cell_ref] = cell
    }
  }
  // 设置填充区域
  worksheet['!ref'] = XLSX.utils.encode_range(range)
  return worksheet
}

/**
 * 创建工作表对象
 * @return {Workbook}
 * @constructor
 */
function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook()
  this.SheetNames = []
  this.Sheets = {}
}

/**
 * 将字符串转字符流
 * @param str 需要转换的字符串
 * @return {ArrayBuffer}
 */
function s2ab(str) {
  const buf = new ArrayBuffer(str.length)
  let view = new Uint8Array(buf)
  for (let i = 0; i !== str.length; ++i) {
    view[i] = str.charCodeAt(i) & 0xff
  }
  return buf
}

/**
 * 将json转换为字符串
 * @param columns Array excel表头数组，数据格式为[{label: '', props: ''}] 与element-ui table传入的数据格式一致
 * @param data Array excel内容数组，数据格式字段名称需要跟props一致 与element-ui table传入的数据格式一致
 * @param fileName String 文件名 default download
 * @param header String 导出的表头名
 * @param merges Array 导出的表头合并的单元格, 数据格式['A1', 'E1']， 表示合并从A1到E1的单元格
 */
export default function exportExcel({
  columns = [],
  data = [],
  fileName = 'download',
  header = null,
  merges = []
}) {
  return new Promise((resolve, reject) => {
    // 处理数据格式
    const head = columns.map(e => e.label)
    const data2D = data.map(row => columns.map(col => row[col.prop]))

    data2D.unshift(head)
    if (header) {
      data2D.unshift([header])
    }
    const worksheetName = 'Sheet'

    let workbook = new Workbook(),
      worksheet = sheet_from_array_of_arrays(data2D)

    if (typeof merges[0] === 'string' && merges.length === 2) merges = [merges] // just one # ['A1', 'C1'] = > [['A1', 'C1']]
    merges = merges.map(i => (i instanceof Array ? {s: i[0], e: i[1]} : i)) // be sort :) # ['A1', 'C1'] => { s: 'A1', e: 'C3' }
    worksheet['!merges'] = merges

    workbook.SheetNames.push(worksheetName)
    workbook.Sheets[worksheetName] = worksheet

    const workbookOut = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary'
    })

    FileSaver.saveAs(
      new Blob([s2ab(workbookOut)], {type: 'application/octet-stream'}),
      fileName + '.xlsx'
    )
    resolve()
  })
}
