import request from '@/utils/request'

/**
 * 用户密码登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 */
export const loginByPassword = (data) => request.post('/user/login/password',data);

/**
 * 用户邮箱登录
 * @param {Object} data - 登录数据
 * @param {string} data.email - 邮箱
 * @param {string} data.verificationCode - 验证码
 */
export const loginByEmail = (data) => request.post('/user/login/email',data);

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @param {string} data.verificationCode - 验证码
 */
export const register = (data) => request.post('/user/register',data);

/**
 * 用户登出
 */
export const logout = () => request.post('/user/logout');

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => request.get('/user/me');

/**
 * 获取指定用户信息
 * @param {number} userId - 用户ID
 */
export const getUserInfoById = (userId) => request.get(`/user/info/${userId}`);

/**
 * 更新用户基本信息
 * @param {Object} data - 用户信息
 * @param {number} data.userId - 用户ID
 * @param {string} data.username - 用户名
 * @param {string} data.phone - 手机号
 * @param {string} data.email - 邮箱
 * @param {string} data.introduction - 简介
 */
export const updateUserInfo = (data) => request.put('/user/me',data);

/**
 * 更新用户头像
 * @param {File} file - 头像文件
 */
export const updateUserAvatar = (file) => request.patch('/user/avatar', file, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

/**
 * 更新用户邮箱
 * @param {Object} data - 邮箱更新数据
 * @param {string} data.newEmail - 新邮箱
 * @param {string} data.verificationCode - 验证码
 */
export const updateUserEmail = (data) => request.put('/user/email',data);

/**
 * 更新用户密码
 * @param {Object} data - 密码更新数据
 * @param {string} data.email - 邮箱
 * @param {string} data.verificationCode - 验证码
 * @param {string} data.newPassword - 新密码
 * @param {string} data.repeatPassword - 确认密码
 */
export const updateUserPassword = (data) => request.put('/user/password',data);

/**
 * 忘记密码/重置密码
 * @param {Object} data - 重置密码数据
 * @param {string} data.email - 邮箱
 * @param {string} data.verificationCode - 验证码
 * @param {string} data.newPassword - 新密码
 * @param {string} data.repeatPassword - 确认密码
 */
export const resetUserPassword = (data) => request.patch('/user/password/reset',data);

/**
 * 发送验证码
 * @param {string} email - 邮箱
 * @param {number} optionType - 操作类型（1:注册 2:登录 3:修改密码 4:修改邮箱）
 */
export const sendVerificationCode = (email, optionType) => request.get(`/user/code/${optionType}/${email}`);

/**
 * 用户注销
 */
export const deleteAccount = () => request.delete('/user/account');

/**
 * 歌手认证
 * @param {number} artistId - 歌手ID
 */
export const certifyArtist = (artistId) => request.post('/user/artist/certify', null, {
  params: { artistId }
});

/**
 * 搜索用户
 * @param {string} username - 用户名
 * @param {number} pageNum - 页码
 * @param {number} pageSize - 每页大小
 */
export const searchUsers = (username, pageNum = 1, pageSize = 20) => request.get('/user/search', { params: { username, pageNum, pageSize } });