/**
 * MinIO 文件服务根地址。
 * 浏览器访问图片需拼接此前缀，例如：http://localhost:9000/vibe-music-data/users/xxx.jpg
 */
const MINIO_BASE_URL = 'http://localhost:9000/vibe-music-data'

/**
 * 解析文件路径为完整 URL
 * @param {string} path - 相对路径或完整 URL
 * @returns {string} 完整的文件访问 URL
 */
export function resolveFileUrl(path) {
  if (!path) return ''
  // 已是完整 URL 则直接返回
  if (/^https?:\/\//i.test(path)) return path
  // 移除开头的斜杠，避免拼接时出现双斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  // 拼接MinIO地址
  return `${MINIO_BASE_URL}/${cleanPath}`
}

/**
 * 获取用户头像完整 URL
 * @param {string} avatarPath - 用户头像相对路径
 * @param {string} defaultAvatar - 默认头像 URL（可选）
 * @returns {string} 用户头像完整 URL
 */
export function getUserAvatar(avatarPath, defaultAvatar) {
  const defaultAvatarUrl = defaultAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  if (!avatarPath) {
    return defaultAvatarUrl
  }
  return resolveFileUrl(avatarPath)
}

/**
 * 获取歌曲封面完整 URL
 * @param {string} coverPath - 歌曲封面相对路径
 * @param {string} defaultCover - 默认封面 URL（可选）
 * @returns {string} 歌曲封面完整 URL
 */
export function getSongCover(coverPath, defaultCover) {
  if (!coverPath) {
    return defaultCover || ''
  }
  return resolveFileUrl(coverPath)
}

/**
 * 获取歌曲音频完整 URL
 * @param {string} audioPath - 歌曲音频相对路径
 * @returns {string} 歌曲音频完整 URL
 */
export function getSongAudio(audioPath) {
  if (!audioPath) return ''
  return resolveFileUrl(audioPath)
}

/**
 * 获取歌单封面完整 URL
 * @param {string} coverPath - 歌单封面相对路径
 * @param {string} defaultCover - 默认封面 URL（可选）
 * @returns {string} 歌单封面完整 URL
 */
export function getPlaylistCover(coverPath, defaultCover) {
  if (!coverPath) {
    return defaultCover || ''
  }
  return resolveFileUrl(coverPath)
}

/**
 * 获取歌房封面完整 URL（使用创建者头像作为封面）
 * @param {string} creatorAvatar - 创建者头像相对路径
 * @param {string} defaultCover - 默认封面 URL（可选）
 * @returns {string} 歌房封面完整 URL
 */
export function getRoomCover(creatorAvatar, defaultCover) {
  const defaultCoverUrl = defaultCover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20notes%20abstract%20background%20gradient%20purple%20blue&image_size=square'
  if (!creatorAvatar) {
    return defaultCoverUrl
  }
  return resolveFileUrl(creatorAvatar)
}

/**
 * 格式化日期时间
 * @param {string} value - 日期时间字符串
 * @returns {string} 格式化后的日期时间
 */
export  function formatDateTime(value) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}
