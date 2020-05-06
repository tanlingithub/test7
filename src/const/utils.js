export const preComfirm = function(params) {
  const {
    callbackYes,
    callbackNo,
    title = '提示',
    content,
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning',
    distinguishCancelAndClose = true
  } = params
  this.$confirm(content, title, params)
    .then(() => {
      callbackYes && callbackYes()
    })
    .catch(action => {
      if (action !== 'cancel') return
      callbackNo && callbackNo()
    })
}

export const noVoidMsg = async function(params) {
  const {
    callbackYes,
    callbackNo,
    title = '提示',
    content,
    confirmButtonText = '确定',
    cancelButtonText = '取消',
    type = 'warning',
    distinguishCancelAndClose = true,
    callFunc,
    successMsg,
    errorMsg
  } = params
  await this.$confirm(content, title, params)

  let status
  try {
    const res = await callFunc()
    this.$message.success(successMsg)
    status == true
  } catch (err) {
    this.$message.success(errorMsg)
    status = false
  }
  return status
}
