import request from '@/utils/request'

/**
 * 获取歌曲评论列表
 * @param {number} songId - 歌曲ID
 * @param {object} params - 查询参数（rootId, firstId）
 */
export const getSongComments = (songId, params) => request.get(`/comment/song/${songId}/list`, { params });

/**
 * 添加歌曲评论
 * @param {number} songId - 歌曲ID
 * @param {object} data - 评论数据（content, parentId, rootId）
 */
export const addSongComment = (songId, data) => request.post(`/comment/song/${songId}/add`, data);

/**
 * 点赞/取消点赞评论
 * @param {number} commentId - 评论ID
 * @param {number} likeStatus - 点赞状态（1:点赞 -1:取消点赞）
 */
export const likeComment = (commentId, likeStatus) => request.patch(`/comment/like/${commentId}`, null, { params: { likeStatus } });

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 */
export const deleteComment = (commentId) => request.delete(`/comment/${commentId}`);