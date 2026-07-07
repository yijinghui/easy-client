import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getAuthToken, removeAuthToken } from '@/utils/auth'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080', // 后续可改为/api，由nginx反向代理处理
  timeout: 10000
})

const handleUnauthorized = (message) => {
  removeAuthToken()
  window.dispatchEvent(new Event('auth-expired'))
  ElMessage.warning(message || '登录后享受更多体验哦~')
  if (router.currentRoute.value.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
  }
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 优先使用当前标签页的 token，避免多账号标签页互相覆盖
    const token = getAuthToken()
    console.log('请求携带token:', token, '请求URL:', config.url)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据状态码判断请求是否成功
    // code为0或200都视为成功
    if (res.code === 0 || res.code === 200 || res.code === '0' || res.code === '200') {
      return res
    } else {
      // 只有非401错误才显示错误提示
      if (res.code !== 401) {
        ElMessage.error(res.message || '请求失败')
      } else {
        const isSilent401 = response.config._silent401
        if (!isSilent401) {
          handleUnauthorized(res.message)
        }
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    // 如果是服务器响应了数据但状态码不是2xx
    if (error.response && error.response.data) {
      const res = error.response.data
      // 401未授权不显示错误提示，由业务层处理
      if (error.response.status !== 401) {
        ElMessage.error(res.message || '请求失败')
      } else {
        const isSilent401 = error.response.config._silent401
        if (!isSilent401) {
          handleUnauthorized(res.message)
        }
      }
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
