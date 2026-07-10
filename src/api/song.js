import request from '@/utils/request'

/**
 * 获取推荐歌曲
 */
export const getRecommendedSongs = () => request.get('/song/recommend')

/**
 * 获取周榜Top200歌曲
 * @param {number} offset 偏移量
 */
export const getWeekTop200 = (offset = 0) => request.get('/song/top200/week', { params: { offset } })

/**
 * 获取月榜Top200歌曲
 * @param {number} offset 偏移量
 */
export const getMonthTop200 = (offset = 0) => request.get('/song/top200/month', { params: { offset } })

/**
 * 搜索歌曲
 * @param {string} text 搜索关键词
 */
export const searchSongs = (text, pageNum = 1, pageSize = 20) => request.post('/song/search', null, { params: { text, pageNum, pageSize } })


export const getPlaylistSongs = (playlistId, params) => request.get(`/song/playlist/${playlistId}`, { params })


export const getArtistSongs = (artistId, params) => request.get(`/song/artist/${artistId}`,{ params })

/**
 * 记录播放记录
 * @param {number} songId 歌曲ID
 * @param {number} [playListId] 歌单ID（可选）
 */
export const listenSong = (songId, playListId) => {
  const params = playListId ? { playListId } : {}
  return request.post(`/song/listen/${songId}`, null, { params })
}
