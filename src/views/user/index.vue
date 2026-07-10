<template>
  <div class="user-center">
    <div class="profile-header">
      <div class="header-actions">
        <div v-if="isOwnProfile" class="action-icon-wrapper" @click="showEditModal = true" title="编辑资料">
          <el-icon :size="20"><Edit /></el-icon>
        </div>
        <div 
          v-if="isOwnProfile" 
          class="action-icon-wrapper settings-btn" 
          @click.stop="showSettingsMenu = !showSettingsMenu" 
          title="设置"
        >
          <el-icon :size="20"><Setting /></el-icon>
        </div>
        <div v-if="isOwnProfile" class="action-icon-wrapper logout" @click="handleLogout" title="退出登录">
          <el-icon :size="20"><SwitchButton /></el-icon>
        </div>
        
        <div v-if="showSettingsMenu" class="settings-menu" @click.stop>
          <div class="menu-item" @click="handleMenuItem('username')">
            <span>修改用户名</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="handleMenuItem('email')">
            <span>修改邮箱</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="handleMenuItem('password')">
            <span>修改密码</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="handleMenuItem('forgotPassword')">
            <span>忘记密码</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item danger" @click="handleMenuItem('deleteAccount')">
            <span>注销账号</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item danger" @click="handleMenuItem('logout')">
            <span>退出登录</span>
            <span class="menu-arrow">›</span>
          </div>
        </div>
      </div>
      <div class="profile-avatar-wrapper">
        <el-avatar :size="120" :src="userInfo.userAvatar" class="profile-avatar">
          <User v-if="!userInfo.userAvatar" />
        </el-avatar>
        <a v-if="isOwnProfile" class="change-avatar-link" @click="triggerAvatarUpload">更换头像</a>
        <input 
          ref="avatarInput" 
          type="file" 
          accept="image/*" 
          class="avatar-input" 
          @change="handleAvatarChange"
        />
      </div>
      <div class="profile-info">
        <div class="name-row">
          <h1 class="profile-name">{{ userInfo.username }}</h1>
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
        <p class="profile-intro">{{ userInfo.introduction || '暂无简介' }}</p>
        <p v-if="isOwnProfile && userInfo.email" class="email">{{ userInfo.email }}</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.favoriteSongCount }}</span>
            <span class="stat-label">收藏歌曲</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.favoritePlaylistCount }}</span>
            <span class="stat-label">收藏歌单</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.createdPlaylistCount }}</span>
            <span class="stat-label">创建歌单</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-tabs">
        <span 
          class="tab-item" 
          :class="{ active: activeTab === 'favorite' }"
          @click="switchTab('favorite')"
        >
          我喜欢
        </span>
        <span 
          class="tab-item" 
          :class="{ active: activeTab === 'created' }"
          @click="switchTab('created')"
        >
          创建的歌单
        </span>
      </div>

      <div v-if="activeTab === 'favorite'" class="tab-content">
        <div class="sub-tabs">
          <span 
            class="tab-item" 
            :class="{ active: favoriteSubTab === 'songs' }"
            @click="favoriteSubTab = 'songs'"
          >
            歌曲
          </span>
          <span 
            class="tab-item" 
            :class="{ active: favoriteSubTab === 'playlists' }"
            @click="favoriteSubTab = 'playlists'"
          >
            歌单
          </span>
        </div>

        <SongList 
          v-if="favoriteSubTab === 'songs'"
          :songs="favoriteSongs"
          :show-favorite="true"
          unfavorite-text="从我喜欢中移除"
          @favorite-change="handleFavoriteChange"
        />

        <FavoritePlaylist 
          v-else-if="favoriteSubTab === 'playlists'"
          :user-id="profileUserId"
          @go-to-playlist="goToPlaylist"
        />
      </div>

      <div v-else-if="activeTab === 'created'" class="tab-content">
        <CreatedPlaylist 
          :user-id="profileUserId"
          @go-to-playlist="goToPlaylist"
          @edit-playlist="editPlaylist"
        />
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Edit, SwitchButton, Setting } from '@element-plus/icons-vue'
import { getUserInfo, getUserInfoById, logout, certifyArtist, updateUserAvatar } from '@/api/user'
import { getFavoriteSongs, getFavoriteSongsByUserId } from '@/api/favorite'
import { getUserAvatar, getSongAudio, getSongCover } from '@/utils/asset'
import { removeAuthToken, getCurrentUserId } from '@/utils/auth'
import { usePlayerStore } from '@/stores/player'
import UserEditModal from './components/UserEditForm.vue'
import SongList from '@/components/song/SongList.vue'
import FavoritePlaylist from './components/FavoritePlaylistList.vue'
import CreatedPlaylist from './components/CreatedPlaylistList.vue'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()

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
const showSettingsMenu = ref(false)
const avatarInput = ref(null)
const activeTab = ref('favorite')
const favoriteSubTab = ref('songs')
const favoriteSongs = ref([])

const isOwnProfile = computed(() => {
  return String(userInfo.value.userId) === getCurrentUserId()
})

const profileUserId = computed(() => {
  return route.params.userId || null
})

watch(
  () => route.params.userId,
  (newUserId, oldUserId) => {
    console.log('路由参数变化 - newUserId:', newUserId, 'oldUserId:', oldUserId)
    if (newUserId !== oldUserId) {
      fetchUserInfo()
      fetchFavoriteSongs()
    }
  },
  { immediate: false }
)

onMounted(() => {
  fetchUserInfo()
  fetchFavoriteSongs()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const handleDocumentClick = () => {
  showSettingsMenu.value = false
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const fetchUserInfo = async () => {
  try {
    let res
    const targetUserId = profileUserId.value
    if (targetUserId) {
      res = await getUserInfoById(targetUserId)
    } else {
      res = await getUserInfo()
    }
    
    if (res && res.data) {
      console.log('设置 userInfo:', res.data)
      userInfo.value = {
        userId: res.data.userId || 0,
        username: res.data.username || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        userAvatar: getUserAvatar(res.data.userAvatar),
        introduction: res.data.introduction || '',
        favoriteSongCount: res.data.favoriteSongCount || 0,
        favoritePlaylistCount: res.data.favoritePlaylistCount || 0,
        createdPlaylistCount: res.data.createdPlaylistCount || 0,
        artistId: res.data.artistId || null
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    ElMessage.error('获取用户信息失败')
  }
}

const fetchFavoriteSongs = async () => {
  try {
    let res
    const targetUserId = profileUserId.value
    if (targetUserId) {
      res = await getFavoriteSongsByUserId(targetUserId, { pageNum: 1, pageSize: 100 })
    } else {
      res = await getFavoriteSongs({ pageNum: 1, pageSize: 100 })
    }
    if (res.data && res.data.items) {
      favoriteSongs.value = res.data.items.map(song => ({
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: getSongCover(song.coverUrl),
        url: getSongAudio(song.audioUrl),
        duration: parseFloat(song.duration) || 0,
        isFavorite: true,
        lyrics: song.lyrics || '',
        lyricsHead: song.lyricsHead || '',
        lyricsTimestamps: song.nested || ''
      }))
    }
  } catch (error) {
    console.error('获取收藏歌曲失败', error)
    favoriteSongs.value = []
  }
}

const handleFavoriteChange = ({ song, isFavorite }) => {
  if (!isFavorite) {
    favoriteSongs.value = favoriteSongs.value.filter(s => s.id !== song.id)
  }
}

const handleCertify = () => {
  ElMessageBox.prompt('请输入您要认证的歌手ID', '歌手认证（待开发）', {
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

const handleSaveUserInfo = async () => {
  showEditModal.value = false
  ElMessage.success('编辑成功')
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

const handleMenuItem = (type) => {
  showSettingsMenu.value = false
  const menuMap = {
    username: '修改用户名',
    email: '修改邮箱',
    password: '修改密码',
    forgotPassword: '忘记密码',
    deleteAccount: '注销账号',
    logout: '退出登录'
  }
  ElMessage.info(`${menuMap[type]}功能开发中`)
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
  })
}

const playSong = (song, index, songList) => {
  playerStore.playlist = songList || [song]
  playerStore.playSong(index || 0)
}

const goToPlaylist = (playlistId) => {
  router.push(`/playlist/${playlistId}`)
}

const editPlaylist = (playlistId) => {
  router.push(`/playlist/edit/${playlistId}`)
}
</script>

<style scoped>
.user-center {
  max-width: 1350px;
  margin: 0 auto;
}

.profile-header {
  position: relative;
  display: flex;
  gap: 40px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
  color: #303133;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8f0fe;
}

.header-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
}

.action-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: #909399;
  transition: all 0.2s;
}

.action-icon-wrapper:hover {
  background: #f0f5ff;
  color: #409eff;
}

.action-icon-wrapper.logout:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.profile-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  background: linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%);
}

.name-row {
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
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  padding: 4px 8px;
  white-space: nowrap;
  margin-bottom: 70px;
}

.change-avatar-link:hover {
  color: #409eff;
}

.avatar-input {
  display: none;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #303133;
}

.profile-intro {
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  color: #606266;
}

.email {
  font-size: 13px;
  margin: 0 0 20px 0;
  user-select: text;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: auto;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e4e7ed;
}

.profile-content {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
}

.profile-tabs {
  display: flex;
  justify-content: flex-start;
}

.profile-tabs .tab-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.profile-tabs .tab-item:hover {
  color: #409eff;
}

.profile-tabs .tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.profile-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

.tab-content {
  padding: 24px;
  min-height: 300px;
}

.sub-tabs {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sub-tabs .tab-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.sub-tabs .tab-item:hover {
  color: #409eff;
}

.sub-tabs .tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.sub-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

.settings-menu {
  position: absolute;
  right: 0;
  top: 52px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
}

.menu-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-arrow {
  opacity: 0;
  color: #c0c4cc;
  font-size: 26px;
  transition: opacity 0.2s;
}

.menu-item:hover .menu-arrow {
  opacity: 1;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.danger:hover {
  color: #f56c6c;
  background: #fef0f0;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}
</style>