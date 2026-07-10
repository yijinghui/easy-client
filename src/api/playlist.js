import request from '@/utils/request'

export const createPlaylist = (data) => request.post('/playlist/create', data)

export const getPlaylists = (config) => request.get('/playlist/list', { ...config })

export const getPlaylistDetail = (playlistId) => request.get(`/playlist/${playlistId}`)

export const getUserPlaylists = (userId) => request.get(`/playlist/list/${userId}`)

export const updatePlaylist = (data) => request.put('/playlist/update', data)

export const deletePlaylist = (playlistId) => request.delete(`/playlist/${playlistId}`)

export const addSongToPlaylist = (playlistId, songId) => request.post(`/playlist/${playlistId}/song/${songId}`)

export const removeSongFromPlaylist = (playlistId, songId) => request.delete(`/playlist/${playlistId}/song/${songId}`)

export const searchPlaylists = (text, pageNum = 1, pageSize = 20) => request.get('/playlist/search', { params: { text, pageNum, pageSize } })



export const updatePlaylistCover = (playlistId, file) => {
  const formData = new FormData()
  formData.append('cover', file)
  return request.patch(`/playlist/${playlistId}/cover`, formData)
}