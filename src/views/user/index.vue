<template>
  <div class="user-center">
    <div class="profile-header">
      <div class="header-actions">
        <div class="action-icon-wrapper" @click="showEditModal = true" title="编辑资料">
          <el-icon :size="20"><Edit /></el-icon>
        </div>
        <div class="action-icon-wrapper logout" @click="handleLogout" title="退出登录">
          <el-icon :size="20"><SwitchButton /></el-icon>
        </div>
      </div>
      <div class="profile-avatar-wrapper">
        <el-avatar :size="120" :src="userInfo.userAvatar" class="profile-avatar">
          <User v-if="!userInfo.userAvatar" />
        </el-avatar>
        <a class="change-avatar-link" @click="triggerAvatarUpload">更换头像</a>
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
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.followCount }}</span>
            <span class="stat-label">关注</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.fansCount }}</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userInfo.visitorCount }}</span>
            <span class="stat-label">访客</span>
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
            @click="switchFavoriteSubTab('songs')"
          >
            歌曲
          </span>
          <span 
            class="tab-item" 
            :class="{ active: favoriteSubTab === 'playlists' }"
            @click="switchFavoriteSubTab('playlists')"
          >
            歌单
          </span>
        </div>

        <div v-if="favoriteSubTab === 'songs'">
          <div v-if="loadingFavoriteSongs" class="loading-state">加载中...</div>
          <div v-else-if="favoriteSongs.length === 0" class="empty-state">
            <span>暂无收藏歌曲</span>
          </div>
          <div v-else class="favorite-songs-list">
            <div class="list-header">
              <div class="col-index">#</div>
              <div class="col-title">歌名</div>
              <div class="col-artist">歌手</div>
              <div class="col-album">专辑</div>
              <div class="col-duration">时长</div>
              <div class="col-action"></div>
            </div>
            <div 
              v-for="(song, index) in favoriteSongs" 
              :key="song.id" 
              class="song-item"
              :class="{ playing: playerStore.currentSong?.id === song.id }"
              @click="playSong(song, index)"
            >
              <div class="col-index">
                <span class="song-index">{{ index + 1 }}</span>
                <el-icon v-if="playerStore.currentSong?.id === song.id" name="Playing" class="playing-icon" />
              </div>
              <div class="col-title">
                <div class="cover-wrapper">
                  <img :src="song.cover" class="small-cover" />
                  <div class="play-overlay">
                    <span class="play-icon">▶</span>
                  </div>
                </div>
                <div class="song-detail">
                  <span class="song-name">{{ song.name }}</span>
                  <span class="song-album-text">{{ song.album }}</span>
                </div>
              </div>
              <div class="col-artist">{{ song.artist }}</div>
              <div class="col-album">{{ song.album }}</div>
              <div class="col-duration">{{ formatDuration(song.duration) }}</div>
              <div class="col-action">
                <span class="action-icon like-icon liked" @click.stop="toggleSongFavorite(song)">♡</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="favoriteSubTab === 'playlists'">
          <div v-if="loadingFavoritePlaylists" class="loading-state">加载中...</div>
          <div v-else-if="favoritePlaylists.length === 0" class="empty-state">
            <span>暂无收藏歌单</span>
          </div>
          <div v-else class="favorite-playlists-grid">
            <div 
              v-for="playlist in favoritePlaylists" 
              :key="playlist.id" 
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img :src="playlist.cover" :alt="playlist.name" />
                <div class="playlist-play-overlay">
                  <span class="play-btn">▶</span>
                </div>
              </div>
              <div class="playlist-info">
                <h4 class="playlist-name">{{ playlist.name }}</h4>
                <p class="playlist-meta">{{ playlist.songCount }} 首歌曲</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'created'" class="tab-content">
        <div v-if="loadingCreatedPlaylists" class="loading-state">加载中...</div>
        <div v-else-if="createdPlaylists.length === 0" class="empty-state">
          <span>暂无创建的歌单</span>
        </div>
        <div v-else class="created-playlists-grid">
          <div 
            v-for="playlist in createdPlaylists" 
            :key="playlist.id" 
            class="playlist-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="playlist-play-overlay">
                <span class="play-btn">▶</span>
              </div>
            </div>
            <div class="playlist-info">
              <h4 class="playlist-name">{{ playlist.name }}</h4>
              <p class="playlist-meta">{{ playlist.songCount }} 首歌曲</p>
            </div>
            <div class="playlist-actions-card">
              <span class="action-btn" @click.stop="editPlaylist(playlist.id)">编辑</span>
              <span class="action-btn delete" @click.stop="deletePlaylistItem(playlist)">删除</span>
            </div>
          </div>
        </div>
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Edit, SwitchButton } from '@element-plus/icons-vue'
import { getUserInfo, logout, certifyArtist, updateUserAvatar } from '@/api/user'
import { getUserAvatar, getSongCover, getPlaylistCover } from '@/utils/asset'
import { removeAuthToken, getCurrentUserId } from '@/utils/auth'
import { usePlayerStore } from '@/stores/player'
import { getFavoriteSongs, getFavoritePlaylists, cancelCollectSong } from '@/api/favorite'
import { getUserPlaylists, deletePlaylist } from '@/api/playlist'
import UserEditModal from './components/UserEditModal.vue'

const router = useRouter()
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
const avatarInput = ref(null)
const activeTab = ref('favorite')
const favoriteSubTab = ref('songs')

const favoriteSongs = ref([])
const favoritePlaylists = ref([])
const createdPlaylists = ref([])

const loadingFavoriteSongs = ref(false)
const loadingFavoritePlaylists = ref(false)
const loadingCreatedPlaylists = ref(false)

onMounted(() => {
  fetchUserInfo()
})

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'created') {
    fetchCreatedPlaylists()
  }
}

const switchFavoriteSubTab = (subTab) => {
  favoriteSubTab.value = subTab
  if (subTab === 'songs') {
    fetchFavoriteSongs()
  } else if (subTab === 'playlists') {
    fetchFavoritePlaylists()
  }
}

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

const fetchFavoriteSongs = async () => {
  loadingFavoriteSongs.value = true
  try {
    const res = await getFavoriteSongs({ pageNum: 1, pageSize: 100 })
    if (res.data && res.data.items) {
      favoriteSongs.value = res.data.items.map(song => ({
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: getSongCover(song.coverUrl),
        url: song.audioUrl,
        duration: parseFloat(song.duration) || 0,
        isFavorite: true
      }))
    }
  } catch (error) {
    console.error('获取收藏歌曲失败', error)
  } finally {
    loadingFavoriteSongs.value = false
  }
}

const fetchFavoritePlaylists = async () => {
  loadingFavoritePlaylists.value = true
  try {
    const res = await getFavoritePlaylists({ pageNum: 1, pageSize: 100 })
    if (res.data && res.data.items) {
      favoritePlaylists.value = res.data.items.map(playlist => ({
        id: playlist.playlistId,
        name: playlist.title || playlist.name || '',
        cover: getPlaylistCover(playlist.coverUrl),
        songCount: playlist.songCount || 0
      }))
    }
  } catch (error) {
    console.error('获取收藏歌单失败', error)
  } finally {
    loadingFavoritePlaylists.value = false
  }
}

const fetchCreatedPlaylists = async () => {
  loadingCreatedPlaylists.value = true
  try {
    const userId = getCurrentUserId()
    if (!userId) return
    
    const res = await getUserPlaylists(userId)
    if (res.data) {
      createdPlaylists.value = res.data.map(playlist => ({
        id: playlist.playlistId,
        name: playlist.title || '',
        cover: getPlaylistCover(playlist.coverUrl),
        songCount: playlist.songCount || 0
      }))
    }
  } catch (error) {
    console.error('获取创建的歌单失败', error)
  } finally {
    loadingCreatedPlaylists.value = false
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

const handleSaveUserInfo = async () => {
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

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playSong = (song, index) => {
  playerStore.playlist = [...favoriteSongs.value]
  playerStore.playSong(index)
}

const toggleSongFavorite = async (song) => {
  try {
    await cancelCollectSong(song.id)
    song.isFavorite = false
    favoriteSongs.value = favoriteSongs.value.filter(s => s.id !== song.id)
    ElMessage.success('已取消收藏')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'remove', songId: song.id }
    }))
  } catch (error) {
    console.error('取消收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const goToPlaylist = (playlistId) => {
  router.push(`/playlist/${playlistId}`)
}

const editPlaylist = (playlistId) => {
  router.push(`/playlist/edit/${playlistId}`)
}

const deletePlaylistItem = async (playlist) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除歌单「${playlist.name}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePlaylist(playlist.id)
    createdPlaylists.value = createdPlaylists.value.filter(p => p.id !== playlist.id)
    ElMessage.success('歌单删除成功')
    window.dispatchEvent(new CustomEvent('playlist-deleted'))
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.user-center {
  max-width: 1350px;
  margin: 0 auto;
  padding: 40px 24px;
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
  margin-bottom: 42px;
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
  margin: 0 0 20px 0;
  color: #606266;
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

.loading-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.empty-state {
  padding: 90px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.favorite-songs-list {
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.list-header .col-index {
  width: 60px;
  font-size: 12px;
  color: #909399;
}

.list-header .col-title {
  flex: 1;
  font-size: 12px;
  color: #909399;
  margin-right: auto;
}

.list-header .col-artist {
  width: 150px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.list-header .col-album {
  width: 180px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.list-header .col-duration {
  width: 80px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.list-header .col-action {
  width: 40px;
  flex-shrink: 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background: #fafafa;
}

.song-item.playing {
  background: #f0f5ff;
}

.song-item .col-index {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  flex-shrink: 0;
}

.song-index {
  font-size: 13px;
  color: #909399;
}

.playing-icon {
  color: #409eff;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.song-item .col-title {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  margin-right: auto;
}

.cover-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  margin-right: 14px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.small-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: #fff;
  font-size: 14px;
}

.song-detail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item .col-artist {
  width: 150px;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.song-item .col-album {
  width: 180px;
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.song-item .col-duration {
  width: 80px;
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.song-item .col-action {
  width: 40px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon {
  font-size: 16px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 50%;
}

.action-icon:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.like-icon {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 50%;
}

.like-icon:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.like-icon.liked {
  color: #ef4444;
}

.favorite-playlists-grid,
.created-playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .playlist-play-overlay {
  opacity: 1;
}

.play-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #409eff;
}

.playlist-info {
  padding: 0 4px;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.playlist-actions-card {
  display: flex;
  gap: 16px;
  padding: 8px 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .playlist-actions-card {
  opacity: 1;
}

.action-btn {
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.delete {
  color: #f56c6c;
}

.action-btn.delete:hover {
  background: #fef0f0;
}
</style>