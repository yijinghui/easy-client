<template>
  <div class="user-center">
    <div class="profile-card">
      <div class="profile-header">
        <div class="info-grid">
          <div class="info-row avatar-row">
            <span class="info-label">头像</span>
            <div class="info-value avatar-value">
              <el-avatar :size="80" :src="userInfo.userAvatar" class="profile-avatar">
                <User v-if="!userInfo.userAvatar" />
              </el-avatar>
              <el-tag 
                v-if="userInfo.userId && userInfo.artistId" 
                type="success" 
                size="small" 
                class="certify-tag"
              >
                已认证
              </el-tag>
              <el-tag 
                v-else-if="userInfo.userId && !userInfo.artistId" 
                type="info" 
                size="small" 
                class="certify-tag certify-tag-clickable"
                @click="handleCertify"
              >
                未认证
              </el-tag>
            </div>
            <a class="change-avatar-link" @click="triggerAvatarUpload">更换头像</a>
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              class="avatar-input" 
              @change="handleAvatarChange"
            />
          </div>
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用户ID</span>
            <span class="info-value">{{ userInfo.userId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userInfo.phone || '未绑定' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userInfo.email || '未绑定' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">简介</span>
            <span class="info-value">{{ userInfo.introduction || '暂无简介' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label">收藏歌曲</span>
            <span class="stat-value">{{ userInfo.favoriteSongCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">收藏歌单</span>
            <span class="stat-value">{{ userInfo.favoritePlaylistCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">关注</span>
            <span class="stat-value">{{ userInfo.followCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">粉丝</span>
            <span class="stat-value">{{ userInfo.fansCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">访客</span>
            <span class="stat-value">{{ userInfo.visitorCount }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <el-button @click="showEditModal = true">编辑资料</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <UserEditModal 
      v-if="showEditModal" 
      :user-info="userInfo" 
      @close="showEditModal = false"
      @save="handleSaveUserInfo"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { getUserInfo, logout, certifyArtist, updateUserAvatar } from '@/api/user'
import { getUserAvatar } from '@/utils/asset'
import { removeAuthToken } from '@/utils/auth'
import UserEditModal from './components/UserEditModal.vue'

const router = useRouter()

const userInfo = ref({
  userId: 0,
  username: '',
  phone: '',
  email: '',
  userAvatar: '',
  introduction: '',
  favoriteSongCount: 0,
  favoritePlaylistCount: 0,
  followCount: 0,
  fansCount: 0,
  visitorCount: 0,
  artistId: null
})

const showEditModal = ref(false)
const avatarInput = ref(null)

onMounted(() => {
  fetchUserInfo()
})

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.data) {
      userInfo.value = {
        userId: res.data.userId || 0,
        username: res.data.username || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        userAvatar: getUserAvatar(res.data.userAvatar),
        introduction: res.data.introduction || '',
        favoriteSongCount: res.data.favoriteSongCount || 0,
        favoritePlaylistCount: res.data.favoritePlaylistCount || 0,
        followCount: res.data.followCount || 0,
        fansCount: res.data.fansCount || 0,
        visitorCount: res.data.visitorCount || 0,
        artistId: res.data.artistId || null
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    ElMessage.error('获取用户信息失败')
  }
}

const handleCertify = () => {
  ElMessageBox.prompt('请输入您要认证的歌手ID', '歌手认证', {
    confirmButtonText: '提交认证',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入数字歌手ID',
    inputPattern: /^[0-9]+$/,
    inputErrorMessage: '请输入有效的数字ID',
    message: '请输入您的歌手ID进行认证，认证申请提交后将等待审核。'
  }).then(async ({ value }) => {
    try {
      const artistId = parseInt(value)
      await certifyArtist(artistId)
      ElMessage.success('认证申请已提交，等待审核')
      await fetchUserInfo()
    } catch (error) {
      ElMessage.error('认证失败，请重试')
    }
  })
}

const handleSaveUserInfo = async (updatedInfo) => {
  showEditModal.value = false
  ElMessage.success('资料更新成功')
  await fetchUserInfo()
}

const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    await updateUserAvatar(formData)
    ElMessage.success('头像更新成功')
    await fetchUserInfo()
    window.dispatchEvent(new CustomEvent('user-avatar-updated'))
  } catch (error) {
    ElMessage.error('头像更新失败，请重试')
  }

  event.target.value = ''
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
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}
</script>

<style scoped>
.user-center {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px;
}

.profile-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  border: 1px solid #e8f0fe;
}

.profile-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.info-grid {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 15px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row:nth-child(even) {
  background: #f9fafb;
}

.info-label {
  width: 100px;
  color: #6b7280;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #374151;
}

.avatar-row {
  justify-content: flex-start;
}

.avatar-value {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.certify-tag {
  font-size: 12px;
  font-weight: 500;
}

.certify-tag-clickable {
  cursor: pointer;
}

.certify-tag-clickable:hover {
  opacity: 0.8;
}

.change-avatar-link {
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.change-avatar-link:hover {
  color: #3b82f6;
}

.avatar-input {
  display: none;
}

.profile-avatar {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  border: 2px solid #e5e7eb;
}

.artist-tag {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
  font-weight: 500;
  padding: 2px 8px;
  font-size: 13px;
  margin-left: 8px;
}

.profile-stats {
  margin-bottom: 24px;
}

.stats-grid {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.stat-row {
  display: flex;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 15px;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row:nth-child(even) {
  background: #f9fafb;
}

.stat-label {
  width: 100px;
  color: #6b7280;
  flex-shrink: 0;
}

.stat-value {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.profile-actions .el-button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border-color: #d1d5db;
  color: #374151;
  background: #fff;
}

.profile-actions .el-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.profile-actions .el-button--primary {
  background: #374151;
  border-color: #374151;
  color: #fff;
}

.profile-actions .el-button--primary:hover {
  background: #1f2937;
  border-color: #1f2937;
}

.profile-actions .el-button--danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.profile-actions .el-button--danger:hover {
  background: #fecaca;
  border-color: #fca5a5;
}
</style>