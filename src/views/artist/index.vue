<template>
  <div class="page-content">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="artist" class="artist-detail">
      <div class="artist-header">
        <div class="artist-avatar-large">
          <img :src="artist.avatar" :alt="artist.name" />
        </div>
        <div class="artist-info">
          <h1 class="artist-name">{{ artist.name }}</h1>
          <div class="artist-meta">
            <span class="meta-item">{{ artist.songCount }} 首歌曲</span>
          </div>
          <p class="artist-intro">{{ artist.introduction || '暂无简介' }}</p>
          <div class="artist-actions">
            <button class="play-all-btn" @click="playAll" title="播放全部">
              <el-icon :size="16"><Headset /></el-icon>
              播放全部
            </button>
          </div>
        </div>
      </div>

      <SongList :songs="songs" :playlist-id="artist.id" />
    </div>
    <div v-else class="empty-state">
      <span>歌手不存在或已被删除</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Headset } from '@element-plus/icons-vue'
import { usePlayerStore } from '@/stores/player'
import { getArtistDetail } from '@/api/artist'
import { getArtistSongs } from '@/api/song'
import { getSongCover, getSongAudio, resolveFileUrl } from '@/utils/asset'
import SongList from '@/components/song/SongList.vue'

const route = useRoute()
const playerStore = usePlayerStore()

const artist = ref(null)
const songs = ref([])
const loading = ref(true)

const fetchArtist = async () => {
  loading.value = true
  songs.value = []
  artist.value = null
  
  const artistId = parseInt(route.params.id)
  if (!artistId || isNaN(artistId)) {
    loading.value = false
    return
  }
  
  try {
    const res = await getArtistDetail(artistId)
    if (res.data) {
      const found = res.data
      artist.value = {
        id: found.artistId || found.id,
        name: found.name || found.artistName,
        avatar: resolveFileUrl(found.avatar) || `https://picsum.photos/100/100?random=${found.id || found.artistId || Math.random()}`,
        introduction: found.introduction || '',
        songCount: found.songCount || 0
      }
      await fetchArtistSongs(artistId)
    }
  } catch (error) {
    console.error('获取歌手信息失败', error)
  } finally {
    loading.value = false
  }
}

const fetchArtistSongs = async (artistId) => {
  try {
    const res = await getArtistSongs(artistId, { pageNum: 1, pageSize: 100 })
    if (res.data && res.data.items) {
      songs.value = res.data.items.map(song => ({
        id: song.songId || song.id,
        name: song.songName || song.name,
        artist: song.artistName || song.artist || artist.value?.name || '',
        album: song.album || '',
        cover: getSongCover(song.coverUrl || song.cover),
        url: getSongAudio(song.audioUrl || song.url),
        duration: parseFloat(song.duration) || 0,
        isFavorite: song.isFavorite || false,
        lyrics: song.lyrics || '',
        lyricsHead: song.lyricsHead || '',
        lyricsTimestamps: song.nested || ''
      }))
      if (artist.value) {
        artist.value.songCount = res.data.total || songs.value.length
      }
    }
  } catch (error) {
    console.error('获取歌手歌曲失败', error)
  }
}

onMounted(() => {
  fetchArtist()
})

watch(
  () => route.params.id,
  () => {
    fetchArtist()
  }
)

const playAll = () => {
  if (songs.value.length === 0) {
    ElMessage.info('该歌手暂无歌曲')
    return
  }
  playerStore.playlist = [...songs.value]
  playerStore.playSong(0, artist.value?.id)
}
</script>

<style scoped>
.page-content {
  max-width: 1200px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.artist-detail {
  padding-bottom: 20px;
}

.artist-header {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.artist-avatar-large {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.artist-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.artist-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.artist-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 13px;
  color: #909399;
}

.artist-intro {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.artist-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  align-items: center;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.play-all-btn:hover {
  background: #e8f0fe;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>