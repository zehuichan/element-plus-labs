import { openWindow } from './window'

/**
 * @description: base64 to blob
 */
export function dataURLtoBlob(base64Buf) {
  const arr = base64Buf.split(',')
  const typeItem = arr[0]
  const mime = typeItem.match(/:(.*?);/)[1]
  const bstr = window.atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * img url to base64
 * @param url
 * @param mineType
 */
export function urlToBase64(url, mineType) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS')
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = ''
    img.onload = () => {
      if (!canvas || !ctx) {
        return reject()
      }
      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL(mineType || 'image/png')
      canvas = null
      resolve(dataURL)
    }
    img.src = url
  })
}

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(url, filename, mime, bom) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom)
  })
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(buf, filename, mime, bom) {
  const base64Buf = dataURLtoBlob(buf)
  downloadByData(base64Buf, filename, mime, bom)
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(data, filename, mime, bom) {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' })

  const blobURL = window.URL.createObjectURL(blob)
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = blobURL
  tempLink.setAttribute('download', filename)
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank')
  }
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
  window.URL.revokeObjectURL(blobURL)
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({ url, target = '_blank', fileName }) {
  const isChrome =
    window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1
  const isSafari =
    window.navigator.userAgent.toLowerCase().indexOf('safari') > -1

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!')
    return false
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a')
    link.href = url
    link.target = target

    if (link.download !== undefined) {
      link.download =
        fileName || url.substring(url.lastIndexOf('/') + 1, url.length)
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents')
      e.initEvent('click', true, true)
      link.dispatchEvent(e)
      return true
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?download'
  }

  openWindow(url, { target })
  return true
}
