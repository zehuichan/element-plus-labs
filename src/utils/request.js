import axios from 'axios'

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

import { useAccessStore } from '@/store'

const abortControllerMap = new Map()

// create an axios instance
const http = axios.create({
    baseURL: import.meta.env.VITE_GLOB_API_URL, // api的base_url
    timeout: 50 * 1000 // request timeout
})

// 请求头处理
http.interceptors.request.use(config => {
    const accessStore = useAccessStore()
    config.headers.Authorization = 'Bearer ' + accessStore.accessToken
    return config
})

// 请求参数处理
http.interceptors.request.use(config => {
    if (config.params) {
        config.params = filterEmptyStrings(config.params)
    }
    if (config.data) {
        config.data = filterEmptyStrings(config.data)
    }
    return config
})

// 请求缓存处理
http.interceptors.request.use(config => {
    const controller = new AbortController()
    config.signal = controller.signal
    abortControllerMap.set(config.url, controller)
    return config
})

// 正常响应处理
http.interceptors.response.use(response => {
    const { data: responseData, status } = response

    if (responseData instanceof Blob || responseData instanceof ArrayBuffer || !responseData.code) {
        return responseData
    }

    const { code } = responseData

    if (status >= 200 && status < 400 && code === 200) {
        return responseData
    } else {
        return errorMessageResponseInterceptor(response)
    }
})

export default http

export function cancelRequest(url) {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
        abortControllerMap.get(_url)?.abort()
        abortControllerMap.delete(_url)
    }
}

export function cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
        controller.abort()
    }
    abortControllerMap.clear()
}

function errorMessageResponseInterceptor(error) {
    if (axios.isCancel(error)) {
        return Promise.reject(error)
    }

    const err = error?.toString?.() ?? ''
    let errMsg = ''
    if (err?.includes('Network Error')) {
        errMsg = '网络异常，请检查您的网络连接后重试。'
    } else if (error?.message?.includes?.('timeout')) {
        errMsg = '请求超时，请稍后再试。'
    }
    if (errMsg) {
        ElMessage.error(errMsg)
        return Promise.reject(error)
    }

    const status = error?.response?.status
    let errorMessage = ''

    switch (status) {
        case 400:
            errorMessage = '请求错误。请检查您的输入并重试。'
            break
        case 401:
            errorMessage = '登录认证过期，请重新登录后继续。'
            break
        case 403:
            errorMessage = '禁止访问, 您没有权限访问此资源。'
            break
        case 404:
            errorMessage = '未找到, 请求的资源不存在。'
            break
        case 408:
            errorMessage = '请求超时，请稍后再试。'
            break
        default:
            errorMessage = '内部服务器错误，请稍后再试。'
            break
    }

    ElMessage.error(errorMessage)
    return Promise.reject(error)
}

function filterEmptyStrings(obj) {
    if (typeof obj !== 'object' || obj === null || obj instanceof FormData) return obj
    if (Array.isArray(obj)) return obj.map(filterEmptyStrings)

    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key]
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = filterEmptyStrings(value)
        }
        return acc
    }, {})
}
