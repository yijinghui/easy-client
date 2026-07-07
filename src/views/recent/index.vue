<template>
  <div class="page-content">
    <h2>最近播放</h2>
    <div class="favorite-list" ref="listRef">
      <div class="favorite-header">
        <div class="col-title">歌名/歌手</div>
        <div class="col-album">专辑</div>
        <div class="col-duration">时长</div>
        <div class="col-action"></div>
      </div>
      <div v-for="song in recentSongs" :key="song.id" class="favorite-item">
        <div class="song-info">
          <div class="cover-wrapper">
            <img :src="song.cover" class="small-cover" />
            <div class="play-overlay" @click="playRecentSong(song)">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="song-detail">
            <span class="song-name">{{ song.name }}</span>
            <span class="song-artist">{{ song.artist }}</span>
          </div>
        </div>
        <div class="song-album">{{ song.album }}</div>
        <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        <div class="song-action">
          <div class="action-btn" @click.stop="toggleMenu(song.id)">
            <span class="action-icon">⋮</span>
          </div>
          <div v-if="activeMenu === song.id" class="action-menu" @click.stop>
            <div class="menu-item" @click="addToPlayQueue(song)">
              <span>添加到播放队列</span>
            </div>
            <div class="menu-item" @click="addToFavorite(song)">
              <span>{{ song.isFavorite ? '取消收藏' : '加入我喜欢' }}</span>
            </div>
            <div class="menu-item" @click="deleteRecord(song.id)">
              <span>删除历史记录</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="recentSongs.length === 0 && !loading" class="empty-state">
        <span>暂无播放记录</span>
      </div>
      <div v-if="loading" class="loading-state">
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getPlayRecords, deletePlayRecord } from '@/api/record'
import { collectSong } from '@/api/favorite'
import { getSongAudio, getSongCover } from '@/utils/asset'

const router = useRouter()
const playerStore = usePlayerStore()

const recentSongs = ref([])
const isLoggedIn = ref(false)
const loading = ref(false)
const activeMenu = ref(null)

onMounted(() => {
  checkLoginStatus()
  fetchRecentSongs()
})

onUnmounted(() => {
})

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

const fetchRecentSongs = async () => {
  if (!isLoggedIn.value) return
  if (loading.value) return

  loading.value = true

  try {
    const res = await getPlayRecords({ pageNum: 1, pageSize: 1000 })
    if (res.data && Array.isArray(res.data)) {
      recentSongs.value = res.data.map(song => ({
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: getSongCover(song.coverUrl),
        url: getSongAudio(song.audioUrl),
        duration: parseFloat(song.duration) || 0,
        isFavorite: song.isFavorite || false,
        lyrics: song.lyrics || '',
        lyricsHead: song.lyricsHead || '',
        lyricsTimestamps: song.nested || ''
      }))
    }
  } catch (error) {
    console.error('获取播放记录失败', error)
    recentSongs.value = []
  } finally {
    loading.value = false
  }
}

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playRecentSong = (song) => {
  if (!isLoggedIn.value) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  playerStore.playlist = [...recentSongs.value]
  const index = recentSongs.value.findIndex(s => s.id === song.id)
  playerStore.playSong(index)
}

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
}

const addToPlayQueue = (song) => {
  if (!isLoggedIn.value) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }
  
  playerStore.addToPlayQueue(song)
  activeMenu.value = null
  ElMessage.success(`已将 "${song.name}" 加入下一首播放`)
}

const addToFavorite = async (song) => {
  try {
    await collectSong(song.id)
    song.isFavorite = !song.isFavorite
    activeMenu.value = null
    ElMessage.success(song.isFavorite ? '已添加到我喜欢' : '已取消收藏')
    
    if (song.isFavorite) {
      playerStore.addFavoriteSongId(song.id)
    } else {
      playerStore.removeFavoriteSongId(song.id)
    }
  } catch (error) {
    console.error('收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const deleteRecord = async (songId) => {
  try {
    await deletePlayRecord(songId)
    const index = recentSongs.value.findIndex(s => s.id === songId)
    if (index !== -1) {
      recentSongs.value.splice(index, 1)
    }
    activeMenu.value = null
    ElMessage.success('已删除播放记录')
  } catch (error) {
    console.error('删除播放记录失败', error)
    ElMessage.error('操作失败')
  }
}

</script>

<style scoped>
.page-content {
  h2 {
    font-size: 20px;
    color: #303133;
    margin: 0 0 20px 0;
  }
}

.favorite-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.favorite-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.favorite-header .col-title {
  flex: 1;
  font-size: 12px;
  color: #909399;
}

.favorite-header .col-album {
  width: 180px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.favorite-header .col-duration {
  width: 80px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.favorite-header .col-action {
  width: 40px;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
  position: relative;
}

.favorite-item:hover {
  background: #fafafa;
}

.song-info {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.cover-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 4px;
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
  cursor: pointer;
}

.favorite-item:hover .play-overlay {
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

.song-artist {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album {
  width: 180px;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  width: 80px;
  font-size: 12px;
  color: #909399;
}

.song-action {
  width: 40px;
  position: relative;
}

.action-btn {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-icon {
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.loading-state {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

</style>