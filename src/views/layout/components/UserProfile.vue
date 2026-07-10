<template>
  <div class="user-section" @click="handleUserClick">
    <el-avatar :size="48" :src="userProfile.userAvatar" class="user-avatar">
      <User v-if="!userProfile.userAvatar" />
    </el-avatar>
    <div class="user-info">
      <span class="username">{{ displayUsername }}</span>
      <span class="user-id">{{ displayUserId }}</span>
    </div>
  </div>

  <div v-if="showUserProfile" class="user-profile-modal" @click="showUserProfile = false">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <span class="modal-title">个人信息</span>
        <span class="modal-close" @click="showUserProfile = false">×</span>
      </div>
      <div class="modal-body">
        <div class="profile-avatar">
          <el-avatar :size="100" :src="userProfile.userAvatar">
            <User v-if="!userProfile.userAvatar" />
          </el-avatar>
        </div>
        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userProfile.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用户ID</span>
            <span class="info-value">{{ userProfile.userId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userProfile.phone || '未绑定' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userProfile.email || '未绑定' }}</span>
          </div>
          <div class="info-row introduction-row">
            <span class="info-label">简介</span>
            <span class="info-value introduction-value">{{ userProfile.introduction || '暂无简介' }}</span>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userProfile.favoriteSongCount }}</span>
            <span class="stat-label">收藏歌曲</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userProfile.favoritePlaylistCount }}</span>
            <span class="stat-label">收藏歌单</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userProfile.createdPlaylistCount }}</span>
            <span class="stat-label">创建歌单</span>
          </div>
        </div>
        <div class="logout-section">
          <el-button class="logout-btn" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout, getUserInfo } from '@/api/user'
import { getUserAvatar } from '@/utils/asset'
import { getAuthToken, removeAuthToken } from '@/utils/auth'
import { User } from '@element-plus/icons-vue'

const router = useRouter()

const showUserProfile = ref(false)
const isLoggedIn = ref(false)

const userProfile = ref({
  userId: 0,
  username: '',
  phone: '',
  email: '',
  userAvatar: '',
  introduction: '',
  favoriteSongCount: 0,
  favoritePlaylistCount: 0,
  createdPlaylistCount: 0,
})

const displayUsername = computed(() => {
  return isLoggedIn.value ? userProfile.value.username : '未登录'
})

const displayUserId = computed(() => {
  return isLoggedIn.value ? `ID: ${userProfile.value.userId}` : ''
})

const emit = defineEmits(['logout'])

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('user-avatar-updated', handleAvatarUpdated)
})

onUnmounted(() => {
  window.removeEventListener('user-avatar-updated', handleAvatarUpdated)
})

const handleAvatarUpdated = async () => {
  if (isLoggedIn.value) {
    await fetchUserInfo()
  }
}

const checkLoginStatus = async () => {
  const token = getAuthToken()
  if (token) {
    isLoggedIn.value = true
    await fetchUserInfo()
  }
}

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.data) {
      userProfile.value = {
        userId: res.data.userId || 0,
        username: res.data.username || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        userAvatar: getUserAvatar(res.data.userAvatar),
        introduction: res.data.introduction || '',
        favoriteSongCount: res.data.favoriteSongCount || 0,
        favoritePlaylistCount: res.data.favoritePlaylistCount || 0,
        createdPlaylistCount: res.data.createdPlaylistCount || 0,
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败', error)
    }
    removeAuthToken()
    isLoggedIn.value = false
    userProfile.value = {
      userId: 0,
      username: '',
      phone: '',
      email: '',
      userAvatar: '',
      introduction: '',
      favoriteSongCount: 0,
      favoritePlaylistCount: 0,
      followCount: 0,
      fansCount: 0
    }
    showUserProfile.value = false
    ElMessage.success('已退出登录')
    emit('logout')
    router.push('/home')
  })
}

const handleUserClick = () => {
  if (isLoggedIn.value) {
    showUserProfile.value = true
  } else {
    router.push('/login')
  }
}

defineExpose({
  fetchUserInfo,
  isLoggedIn
})
</script>

<style scoped>
.user-section {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  cursor: pointer;
}

.user-section:hover {
  background: #fafafa;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #409eff 100%);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.user-profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #fff;
  border-radius: 5px;
  width: 400px;
  max-width: 90%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modal-close {
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: #606266;
}

.modal-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.profile-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
}

.info-label {
  font-size: 14px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.introduction-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.introduction-value {
  line-height: 1.6;
  word-break: break-word;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.logout-section {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

.logout-btn {
  width: 100%;
  background: transparent;
  border: 1px solid #d9d9d9;
  color: #606266;
  padding: 8px 16px;
}

.logout-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
