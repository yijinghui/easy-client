import request from '@/utils/request'

export const searchArtists = (artistName, pageNum = 1, pageSize = 20) => request.get('/artist/search', { params: { artistName, pageNum, pageSize } })

export const getArtistDetail = (artistId) => request.get(`/artist/${artistId}`)