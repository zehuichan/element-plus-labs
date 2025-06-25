export function resultSuccess(result, { message = 'ok' } = {}) {
  return {
    code: 200,
    data: result,
    message,
    type: 'success'
  }
}

export function resultError(message = 'Request failed', { code = -1, result = null } = {}) {
  return {
    code,
    data: result,
    message,
    type: 'error'
  }
}

export function pageResultSuccess(page, pageSize, list) {
  const pageData = pagination(
    Number.parseInt(`${page}`),
    Number.parseInt(`${pageSize}`),
    list,
  )
  return {
    code: 200,
    rows: pageData,
    total: list.length,
    message: 'ok',
    type: 'success'
  }
}

export function pageResultError(message = 'Request failed', { code = -1, result = [] } = {}) {
  return {
    code,
    rows: result,
    total: 0,
    message,
    type: 'error'
  }
}


export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pagination(pageNo, pageSize, array) {
  const offset = (pageNo - 1) * Number(pageSize)
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset)
    : array.slice(offset, offset + Number(pageSize))
}
