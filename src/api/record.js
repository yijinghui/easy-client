import request from '@/utils/request'

export const getPlayRecords = (params) => request.get('/record/list');

export const deletePlayRecord = (songId) => request.delete(`/record/delete/${songId}`);