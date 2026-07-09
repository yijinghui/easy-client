import request from '@/utils/request'

export const getFavoriteSongs = (params, config) => request.get('/favorite/songs', { params, ...config })

export const getFavoriteSongsByUserId = (userId, params, config) => request.get(`/favorite/songs/${userId}`, { params, ...config })

export const collectSong = (songId) => request.post(`/favorite/songs/${songId}`)

export const cancelCollectSong = (songId) => request.delete(`/favorite/songs/${songId}`)

export const getFavoritePlaylists = (params, config) => request.get('/favorite/playlists', { params, ...config })

export const getFavoritePlaylistsByUserId = (userId, params, config) => request.get(`/favorite/playlists/${userId}`, { params, ...config })

export const collectPlaylist = (playlistId) => request.post(`/favorite/playlists/${playlistId}`)

export const cancelCollectPlaylist = (playlistId) => request.delete(`/favorite/playlists/${playlistId}`)