<template>
  <div class="page-content">
    <h2>我喜欢的音乐</h2>
    <div class="favorite-list">
      <div class="favorite-header">
        <div class="col-title">歌名/歌手</div>
        <div class="col-album">专辑</div>
        <div class="col-duration">时长</div>
      </div>
      <div v-for="song in favoriteSongs" :key="song.id" class="favorite-item">
        <div class="song-info">
          <div class="cover-wrapper">
            <img :src="song.cover" class="small-cover" />
            <div class="play-overlay" @click="playFavoriteSong(song)">
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
      </div>
      <div v-if="favoriteSongs.length === 0" class="empty-state">
        <span>暂无喜欢的歌曲</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getFavoriteSongs } from '@/api/favorite'
import { getSongAudio, getSongCover } from '@/utils/asset'

const router = useRouter()
const playerStore = usePlayerStore()

const favoriteSongs = ref([])
const isLoggedIn = ref(false)

onMounted(() => {
  checkLoginStatus()
  fetchFavoriteSongs()
  window.addEventListener('favorite-updated', handleFavoriteUpdated)
})

onUnmounted(() => {
  window.removeEventListener('favorite-updated', handleFavoriteUpdated)
})

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

const fetchFavoriteSongs = async () => {
  if (!isLoggedIn.value) return
  
  try {
    const res = await getFavoriteSongs({ pageNum: 1, pageSize: 100 })
    if (res.data && Array.isArray(res.data.items)) {
      favoriteSongs.value = res.data.items.map(song => ({
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: getSongCover(song.coverUrl, `https://picsum.photos/100/100?random=${song.songId}`),
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

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playFavoriteSong = (song) => {
  if (!isLoggedIn.value) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }
  
  playerStore.playlist = [...favoriteSongs.value]
  const index = favoriteSongs.value.findIndex(s => s.id === song.id)
  playerStore.playSong(index)
}

const handleFavoriteUpdated = (e) => {
  const { type, songId, song } = e.detail
  
  if (type === 'add') {
    const exists = favoriteSongs.value.find(s => s.id === songId)
    if (!exists) {
      favoriteSongs.value.unshift({
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        cover: getSongCover(song.cover, `https://picsum.photos/100/100?random=${song.id}`),
        url: song.url,
        duration: song.duration,
        isFavorite: true,
        lyrics: song.lyrics || '',
        lyricsHead: song.lyricsHead || '',
        lyricsTimestamps: song.lyricsTimestamps || ''
      })
    }
  } else if (type === 'remove') {
    const index = favoriteSongs.value.findIndex(s => s.id === songId)
    if (index !== -1) {
      favoriteSongs.value.splice(index, 1)
    }
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

.favorite-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>