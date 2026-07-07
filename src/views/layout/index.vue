<template>
  <div class="home-container">
    <aside class="sidebar">
      <div class="user-section" @click="handleUserClick">
        <el-avatar :size="48" :src="userProfile.userAvatar" class="user-avatar">
          <User v-if="!userProfile.userAvatar" />
        </el-avatar>
        <div class="user-info">
          <span class="username">{{ displayUsername }}</span>
          <span class="user-id">{{ displayUserId }}</span>
        </div>
      </div>

      <router-link to="/home" class="nav-link">
      <div class="nav-item" :class="{ active: $route.path === '/home' }">
        <el-icon name="House" class="nav-icon"></el-icon>
        <span class="nav-text">首页</span>
      </div>
    </router-link>

    <router-link to="/rank" class="nav-link">
      <div class="nav-item" :class="{ active: $route.path === '/rank' }">
        <el-icon name="TrendCharts" class="nav-icon"></el-icon>
        <span class="nav-text">排行榜</span>
      </div>
    </router-link>

    <router-link to="/room" class="nav-link">
        <div class="nav-item" :class="{ active: $route.path === '/room' }">
          <el-icon name="Headset" class="nav-icon"></el-icon>
          <span class="nav-text">在线歌间</span>
        </div>
      </router-link>

      <div class="my-section">
        <span class="my-label">我的</span>
      </div>

      <nav class="nav-menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.key"
          :to="`/${item.key}`"
          class="nav-link"
        >
          <div class="nav-item" :class="{ active: $route.path === `/${item.key}` }">
            <el-icon :name="item.icon" class="nav-icon"></el-icon>
            <span class="nav-text">{{ item.label }}</span>
            <span v-if="item.count" class="nav-count">{{ item.count }}</span>
          </div>
        </router-link>
      </nav>

      <div class="divider"></div>

      <div class="playlist-section">
        <div class="playlist-tabs">
          <span 
            class="tab-item" 
            :class="{ active: playlistTab === 'custom' }"
            @click="handleSwitchPlaylistTab('custom')"
          >
            自建歌单
          </span>
          <span class="tab-divider">|</span>
          <span 
            class="tab-item" 
            :class="{ active: playlistTab === 'favorite' }"
            @click="handleSwitchPlaylistTab('favorite')"
          >
            收藏歌单
          </span>
          <el-icon class="tab-add" @click="handleCreatePlaylist">+</el-icon>
        </div>

        <div class="playlist-list">
          <div 
            v-for="playlist in currentPlaylists" 
            :key="playlist.id"
            class="playlist-item"
            @click="handlePlaylistClick(playlist.id)"
            @contextmenu.prevent="handleContextMenu($event, playlist)"
          >
            <img :src="playlist.cover" :alt="playlist.name" class="playlist-cover" />
            <span class="playlist-name">{{ playlist.name }}</span>
          </div>
          <div v-if="currentPlaylists.length === 0" class="playlist-empty">
            {{ playlistTab === 'custom' ? '暂无自建歌单' : '暂无收藏歌单' }}
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索歌曲、歌手、专辑"
            size="default"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </header>

      <div class="content-area">
        <router-view />
      </div>
    </main>

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
              <span class="stat-value">{{ userProfile.followCount }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userProfile.fansCount }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
          <div class="logout-section">
            <el-button class="logout-btn" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
        <div class="modal-footer">
          <el-button class="edit-btn" @click="handleEditProfile">编辑</el-button>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="create-modal" @click="showCreateModal = false">
      <div class="create-modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">创建歌单</span>
          <span class="modal-close" @click="showCreateModal = false">×</span>
        </div>
        <div class="create-modal-body">
          <div class="create-input-group">
            <label class="create-label">歌单名称</label>
            <input 
              type="text" 
              v-model="playlistName" 
              class="create-input" 
              placeholder="请输入歌单名称"
              maxlength="50"
              @keyup.enter="handleSubmitCreate"
            />
          </div>
        </div>
        <div class="modal-footer">
          <el-button @click="showCreateModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCreate" :loading="creating">确定</el-button>
        </div>
      </div>
    </div>

    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleDeletePlaylist">
        删除
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logout, getUserInfo } from '@/api/user'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/api/playlist'
import { getFavoritePlaylists } from '@/api/favorite'
import { getUserAvatar, getPlaylistCover } from '@/utils/asset'
import { getAuthToken, removeAuthToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const playlistTab = ref('custom')
const showUserProfile = ref(false)
const showCreateModal = ref(false)
const playlistName = ref('')
const creating = ref(false)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  playlist: null
})

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
  followCount: 0,
  fansCount: 0
})

const customPlaylists = ref([])
const favoritePlaylists = ref([])

const displayUsername = computed(() => {
  return isLoggedIn.value ? userProfile.value.username : '未登录'
})

const displayUserId = computed(() => {
  return isLoggedIn.value ? `ID: ${userProfile.value.userId}` : ''
})

const currentPlaylists = computed(() => {
  return playlistTab.value === 'custom' ? customPlaylists.value : favoritePlaylists.value
})

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('user-avatar-updated', handleAvatarUpdated)
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('playlist-deleted', handlePlaylistDeleted)
})

onUnmounted(() => {
  window.removeEventListener('user-avatar-updated', handleAvatarUpdated)
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('playlist-deleted', handlePlaylistDeleted)
})

const handlePlaylistDeleted = async () => {
  await fetchPlaylists()
}

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
    await fetchPlaylists()
    await fetchFavoritePlaylists()
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
        followCount: res.data.followCount || 0,
        fansCount: res.data.fansCount || 0
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const fetchPlaylists = async () => {
  customPlaylists.value = []
  try {
    const res = await getPlaylists({ _silent401: true })
    if (res.data) {
      customPlaylists.value = res.data
        .filter(p => !p.isFavorite)
        .map(p => ({
          id: p.playlistId,
          name: p.title,
          cover: getPlaylistCover(p.coverUrl, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(p.style || 'abstract')}&image_size=square`)
        }))
    }
  } catch (error) {
    console.error('获取歌单列表失败', error)
  }
}

const fetchFavoritePlaylists = async () => {
  favoritePlaylists.value = []
  try {
    const res = await getFavoritePlaylists({ pageNum: 1, pageSize: 50 }, { _silent401: true })
    if (res.data && res.data.items) {
      favoritePlaylists.value = res.data.items.map(p => ({
        id: p.playlistId,
        name: p.title,
        cover: getPlaylistCover(p.coverUrl, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(p.style || 'abstract')}&image_size=square`)
      }))
    }
  } catch (error) {
    console.error('获取收藏歌单列表失败', error)
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
    customPlaylists.value = []
    favoritePlaylists.value = []
    showUserProfile.value = false
    ElMessage.success('已退出登录')
    router.push('/home')
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}

const handleEditProfile = () => {
  showUserProfile.value = false
  router.push('/user')
}

const handleUserClick = () => {
  if (isLoggedIn.value) {
    showUserProfile.value = true
  } else {
    router.push('/login')
  }
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/search', query: { q: keyword } })
  }
}

watch(
  () => route.query.q,
  (q) => {
    if (route.path === '/search' && typeof q === 'string') {
      searchKeyword.value = q
    }
  },
  { immediate: true }
)

const menuItems = ref([
  { key: 'favorite', label: '喜欢', icon: 'Heart' },
  { key: 'recent', label: '最近播放', icon: 'Clock' },
  { key: 'user', label: '个人中心', icon: 'User' },
])

const handlePlaylistClick = (id) => {
  router.push(`/playlist/${id}`)
}

const handleSwitchPlaylistTab = async (tab) => {
  playlistTab.value = tab
  if (tab === 'custom') {
    await fetchPlaylists()
  } else {
    await fetchFavoritePlaylists()
  }
}

const handleCreatePlaylist = () => {
  if (!isLoggedIn.value) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }
  playlistName.value = ''
  showCreateModal.value = true
}

const handleContextMenu = (event, playlist) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    playlist
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const handleDeletePlaylist = async () => {
  const playlist = contextMenu.value.playlist
  if (!playlist) return

  closeContextMenu()

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
    ElMessage.success('歌单删除成功')
    
    if (playlistTab.value === 'custom') {
      await fetchPlaylists()
    } else {
      await fetchFavoritePlaylists()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmitCreate = async () => {
  if (!playlistName.value.trim()) {
    ElMessage.warning('请输入歌单名称')
    return
  }

  creating.value = true
  try {
    await createPlaylist({
      title: playlistName.value.trim(),
      introduction: '',
      style: '其他',
      coverUrl: ''
    })
    ElMessage.success('歌单创建成功')
    showCreateModal.value = false
    playlistName.value = ''
    await fetchPlaylists()
  } catch (error) {
    ElMessage.error('歌单创建失败')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  user-select: none;
  -webkit-user-select: none;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

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

.nav-link {
  text-decoration: none;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  margin: 2px 0;
}

.nav-item:hover {
  background: #f5f7fa;
  border-radius: 4px;
}

.nav-item.active {
  background: #e8f0fe;
  color: #409eff;
  border-radius: 4px;
}

.nav-icon {
  margin-right: 12px;
  font-size: 16px;
  color: #909399;
}

.nav-item.active .nav-icon {
  color: #409eff;
}

.nav-text {
  flex: 1;
}

.nav-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.my-section {
  padding: 12px 20px 8px;
}

.my-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-menu {
  padding: 4px 0;
}

.divider {
  height: 8px;
  background: linear-gradient(to bottom, #f5f7fa, #fff);
  margin: 8px 0;
}

.playlist-section {
  padding: 8px 0;
}

.playlist-tabs {
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  margin-bottom: 8px;
}

.tab-item {
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 0;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-divider {
  color: #d9d9d9;
}

.tab-add {
  margin-left: auto;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.tab-add:hover {
  color: #409eff;
}

.playlist-list {
  padding: 0 12px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  border-radius: 4px;
}

.playlist-item:hover {
  background: #f5f7fa;
}

.playlist-cover {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 10px;
  object-fit: cover;
}

.playlist-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 60px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-box .el-input {
  background: #f5f7fa;
  border-radius: 20px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
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
  border-radius: 12px;
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

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.edit-btn {
  background: transparent;
  border: none;
  color: #606266;
  padding: 8px 16px;
}

.edit-btn:hover {
  color: #409eff;
}

.create-modal {
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

.create-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 360px;
  max-width: 90%;
  overflow: hidden;
}

.create-modal-body {
  padding: 24px;
}

.create-input-group {
  display: flex;
  flex-direction: column;
}

.create-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.create-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  box-sizing: border-box;
}

.create-input:focus {
  outline: none;
  border-color: #409eff;
}

.create-input::placeholder {
  color: #c0c4cc;
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 3000;
  min-width: 100px;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu-item:hover {
  background: #ecf5ff;
  color: #409eff;
}
</style>