import request from '@/utils/request'

/**
 * 获取banner列表
 */
export const getBannerList = () => request.get('/banner/list');


