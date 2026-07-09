<template>
  <div class="rank-page">
    <div class="rank-header">
      <h1>排行榜</h1>
      <div class="rank-tabs">
        <span 
          class="tab-item" 
          :class="{ active: currentTab === 'week' }"
          @click="switchTab('week')"
        >
          周榜 TOP200
        </span>
        <span 
          class="tab-item" 
          :class="{ active: currentTab === 'month' }"
          @click="switchTab('month')"
        >
          月榜 TOP200
        </span>
      </div>
    </div>

    <div class="rank-list">
      <div 
        v-for="(song, index) in rankSongs" 
        :key="song.id || song.songId || index" 
        class="rank-item"
        @click="playSong(index)"
      >
        <div class="rank-number" :class="getRankClass(index)">
          NO.{{ index + 1 }}
        </div>
        <div class="song-cover">
          <img :src="song.cover" :alt="song.name" />
        </div>
        <div class="song-info">
          <h4>{{ song.name }}</h4>
          <p>{{ song.artist }}</p>
        </div>
        <div class="song-stats">
          <span class="play-label">播放量</span>
          <span class="play-count">{{ formatNumber(song.playCount || 0) }}</span>
        </div>
        <div class="song-actions">
          <span 
            class="action-btn favorite-btn" 
            :class="{ liked: song.isFavorite }"
            @click.stop="toggleFavorite(song)"
          >
            ♡
          </span>
          <span 
            class="action-btn add-btn" 
            @click.stop="addToQueue(song)"
          >
            <img src="@/assets/icons/playlist.png" />
          </span>
          <div class="more-action-btn" @click.stop="toggleMenu(song.id)">
            <span class="more-action-icon">⋮</span>
          </div>
          <div v-if="activeMenu === song.id" :class="['action-menu', { 'action-menu-up': index >= rankSongs.length - 3 }]" @click.stop>
            <div class="menu-item" @click="song.isFavorite ? handleRemoveFromFavorite(song) : handleAddToFavorite(song)">
              <span>{{ song.isFavorite ? '取消收藏' : '加入我喜欢' }}</span>
            </div>
            <div class="menu-item" @click="addToQueue(song)">
              <span>添加到播放列表</span>
            </div>
            <div class="menu-item" @click="handleAddToPlaylist(song)">
              <span>加入歌单</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-loading text="加载中..." />
    </div>

    <div v-if="!loading && rankSongs.length === 0" class="empty-state">
      <el-icon size="48" color="#909399"><Music /></el-icon>
      <p>暂无排行榜数据</p>
    </div>
  </div>

  <el-dialog title="选择歌单" v-model="showAddToPlaylistModal" width="400px">
    <div class="playlist-list">
      <div v-for="playlist in userPlaylists" :key="playlist.id" class="playlist-item" @click="confirmAddToPlaylist(playlist.id)">
        <span>{{ playlist.name }}</span>
      </div>
      <div v-if="userPlaylists.length === 0" class="empty-state">
        <span>暂无歌单</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getWeekTop200 } from '@/api/song'
import { collectSong, cancelCollectSong } from '@/api/favorite'
import { getUserPlaylists, addSongToPlaylist } from '@/api/playlist'
import { getSongAudio, getSongCover } from '@/utils/asset'
import { getCurrentUserId } from '@/utils/auth'
import axios from 'axios'

const router = useRouter()
const playerStore = usePlayerStore()

const currentTab = ref('week')
const rankSongs = ref([])
const loading = ref(false)
const activeMenu = ref(null)
const userPlaylists = ref([])
const showAddToPlaylistModal = ref(false)
const currentSongForPlaylist = ref(null)

const normalizeSong = (song) => {
  const id = song.songId
  return {
    id,
    name: song.songName,
    artist: song.artistName,
    album: song.album || '',
    cover: getSongCover(song.coverUrl, `https://picsum.photos/80/80?random=${id || Math.random()}`),
    url: getSongAudio(song.audioUrl),
    duration: parseFloat(song.duration) || 0,
    playCount: song.playCount || 0,
    isFavorite: song.isFavorite ?? false,
    lyrics: song.lyrics || '',
    lyricsHead: song.lyricsHead || '',
    lyricsTimestamps: song.nested || ''
  }
}

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const fetchRankSongs = async () => {
  loading.value = true
  try {
    let items = []
    if (currentTab.value === 'week') {
      const res = await getWeekTop200(0)
      if (res.data && res.data.items && Array.isArray(res.data.items)) {
        items = res.data.items
      } else if (res.data && Array.isArray(res.data)) {
        items = res.data
      }
    } else {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get('http://localhost:8080/song/top200/month', { 
        params: { offset: 0 },
        headers
      })
      if (res.data && Array.isArray(res.data)) {
        items = res.data
      }
    }
    
    if (items.length > 0) {
      rankSongs.value = items.map(normalizeSong)
    } else {
      rankSongs.value = []
    }
  } catch (error) {
    console.error('获取排行榜数据失败', error)
    rankSongs.value = []
  } finally {
    loading.value = false
  }
}

const switchTab = (tab) => {
  if (currentTab.value !== tab) {
    currentTab.value = tab
    fetchRankSongs()
  }
}

const playSong = (index) => {
  const isLoggedIn = !!localStorage.getItem('token')
  if (!isLoggedIn) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  const currentSong = rankSongs.value[index]

  if (!currentSong) {
    ElMessage.warning('歌曲信息异常，暂时无法播放')
    return
  }

  if (!currentSong.url) {
    ElMessage.warning('当前歌曲暂无音频资源')
    return
  }

  playerStore.setPlaylist(rankSongs.value)
  playerStore.playSong(index)
}

const toggleFavorite = async (song) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  try {
    if (song.isFavorite) {
      await cancelCollectSong(song.id)
      song.isFavorite = false
      ElMessage.success('已取消收藏')
    } else {
      await collectSong(song.id)
      song.isFavorite = true
      ElMessage.success('收藏成功')
    }
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: {
        type: song.isFavorite ? 'add' : 'remove',
        songId: song.id,
        song
      }
    }))
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败')
  }
}

const addToQueue = (song) => {
  const isLoggedIn = !!localStorage.getItem('token')
  if (!isLoggedIn) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  playerStore.addToPlayQueue(song)
  activeMenu.value = null
  ElMessage.success('已加入播放队列')
}

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
}

const handleAddToFavorite = async (song) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  try {
    await collectSong(song.id)
    song.isFavorite = true
    activeMenu.value = null
    ElMessage.success('已加入我喜欢')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'add', songId: song.id, song }
    }))
  } catch (error) {
    console.error('添加收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const handleRemoveFromFavorite = async (song) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  try {
    await cancelCollectSong(song.id)
    song.isFavorite = false
    activeMenu.value = null
    ElMessage.success('已取消收藏')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'remove', songId: song.id }
    }))
  } catch (error) {
    console.error('取消收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const handleAddToPlaylist = async (song) => {
  const userId = getCurrentUserId()
  if (!userId) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  try {
    const res = await getUserPlaylists(userId)
    userPlaylists.value = res.data?.map(p => ({
      id: p.playlistId,
      name: p.title || ''
    })) || []
    currentSongForPlaylist.value = song
    showAddToPlaylistModal.value = true
    activeMenu.value = null
  } catch (error) {
    console.error('获取歌单列表失败', error)
    ElMessage.error('操作失败')
  }
}

const confirmAddToPlaylist = async (targetPlaylistId) => {
  if (!currentSongForPlaylist.value) return

  try {
    await addSongToPlaylist(targetPlaylistId, currentSongForPlaylist.value.id)
    showAddToPlaylistModal.value = false
    ElMessage.success('已加入歌单')
  } catch (error) {
    console.error('加入歌单失败', error)
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchRankSongs()
})
</script>

<style scoped>
.rank-page {
  padding-bottom: 24px;
}

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.rank-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.rank-tabs {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 8px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #f0f2f5;
}

.tab-item.active {
  background: #409eff;
  color: #fff;
}

.rank-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f7fa;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  background: #fafafa;
}

.rank-number {
  width: 56px;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  text-align: center;
}

.rank-number.rank-1 {
  color: #ffd700;
  font-size: 20px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.rank-number.rank-2 {
  color: #c0c0c0;
  font-size: 18px;
  text-shadow: 0 0 6px rgba(192, 192, 192, 0.5);
}

.rank-number.rank-3 {
  color: #cd7f32;
  font-size: 20px;
  text-shadow: 0 0 6px rgba(205, 127, 50, 0.5);
}

.song-cover {
  width: 60px;
  height: 60px;
  margin-right: 16px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 16px;
}

.play-label {
  font-size: 11px;
  color: #c0c4cc;
  margin-bottom: 2px;
}

.play-count {
  font-size: 12px;
  color: #909399;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: #475569;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f9ff;
}

.favorite-btn {
  font-size: 20px;
}

.favorite-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.favorite-btn.liked {
  color: #ef4444;
}

.add-btn {
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
}

.add-btn img {
  margin-top: 3px;
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: brightness(0.6);
}

.add-btn:hover {
  background: transparent;
}

.add-btn:hover img {
  filter: brightness(1);
}

.more-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.more-action-icon {
  font-size: 20px;
  color: #909399;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 140px;
}

.action-menu-up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 4px;
}

.menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
}

.menu-item:hover {
  background: #f5f7fa;
}

.playlist-list {
  max-height: 300px;
  overflow-y: auto;
}

.playlist-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: #f5f7fa;
}

.playlist-item span {
  font-size: 14px;
  color: #303133;
}

.loading-wrapper {
  padding: 60px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-state p {
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
}
</style>