import request from '@/utils/request'

/**
 * 获取活跃歌房列表
 */
export const getActiveRooms = () => request.get('/room/list');

/**
 * 创建歌房
 * @param {Object} data - 歌房数据
 * @param {string} data.roomName - 歌房名称
 * @param {number} data.maxUsers - 最大人数
 */
export const createRoom = (data) => request.post('/room/create',data);

export const getRoomChatMessages = (roomId) => request.get('/room/chat', { params: { roomId } });