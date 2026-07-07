const TOKEN_KEY = 'token'

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || ''

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const parseJwtPayload = (token = getAuthToken()) => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4, '=')
    const binaryPayload = window.atob(paddedPayload)
    return JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binaryPayload, (char) => char.charCodeAt(0)))
    )
  } catch (error) {
    return null
  }
}

export const getCurrentUserId = () => {

  const payload = parseJwtPayload()
  if (!payload) {
    return ''
  }
  // 后端 JWT 结构：所有业务数据嵌套在 claims 对象内
  // payload = { claims: { userId: xxx, username: xxx, role: xxx } }
  const claims = payload.claims || payload
  const userId = claims.userId || claims.id || ''
  return String(userId)
}
