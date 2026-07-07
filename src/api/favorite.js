import request from '@/utils/request'

export const getFavoriteSongs = (data) => request.post('/favorite/songs', data)

export const collectSong = (songId) => request.post(`/favorite/songs/${songId}`)

export const cancelCollectSong = (songId) => request.delete(`/favorite/songs/${songId}`)

export const getFavoritePlaylists = (data, config) => request.post('/favorite/playlists', data, { ...config })

export const collectPlaylist = (playlistId) => request.post(`/favorite/playlists/${playlistId}`)

export const cancelCollectPlaylist = (playlistId) => request.delete(`/favorite/playlists/${playlistId}`)