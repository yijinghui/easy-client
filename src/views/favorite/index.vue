<template>
  <div class="page-content">
    <h2>我喜欢的音乐</h2>
    <SongList 
      :songs="favoriteSongs" 
      :show-favorite="false"
      unfavorite-text="从我喜欢中移除"
      @favorite-change="handleFavoriteChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getFavoriteSongs } from '@/api/favorite'
import { getSongAudio, getSongCover } from '@/utils/asset'
import SongList from '@/components/song/SongList.vue'

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

const handleFavoriteChange = ({ song, isFavorite }) => {
  if (!isFavorite) {
    favoriteSongs.value = favoriteSongs.value.filter(s => s.id !== song.id)
  }
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
    favoriteSongs.value = favoriteSongs.value.filter(s => s.id !== songId)
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
</style>
