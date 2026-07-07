<template>
  <div class="page-content">
    <h2>推荐歌曲</h2>
    <div class="card-grid">
      <template v-if="recommendSongs.length > 0">
        <div v-for="(item, index) in recommendSongs" :key="item.id || item.songId || index" class="playlist-card">
          <div class="card-cover">
            <img :src="item.cover" :alt="item.name" />
            <div class="play-overlay" @click="playRecommendSong(index)">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="card-info">
            <h4>{{ item.name }}</h4>
            <p>{{ item.artist }}</p>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-for="i in 6" :key="i" class="playlist-card skeleton-card">
          <div class="card-cover">
            <div class="cover-skeleton"></div>
          </div>
          <div class="card-info">
            <div class="info-skeleton title-skeleton"></div>
            <div class="info-skeleton artist-skeleton"></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getSongAudio, getSongCover } from '@/utils/asset'

const props = defineProps({
  recommendSongs: {
    type: Array,
    default: () => []
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const playerStore = usePlayerStore()

const normalizeSong = (song) => {
  const id = song.songId
  return {
    ...song,
    songId: song.songId,
    songName: String(song.songName),
    artistName: String(song.artistName),
    artistId: song.artistId,
    album: String(song.album ?? ''),
    cover: getSongCover(song.coverUrl ?? song.cover, `https://picsum.photos/180/180?random=${id || Math.random()}`),
    url: getSongAudio(song.audioUrl ?? song.url),
    duration: parseFloat(song.duration) || 0,
    isLiked: song.isFavorite ?? false,
    lyrics: song.lyrics|| '',
    lyricsHead: song.lyricsHead || '',
    lyricsTimestamps: song.lyricsTimestamps || song.nested || ''
  }
}

const playRecommendSong = (index) => {
  if (!props.isLoggedIn) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  const playlist = props.recommendSongs.map(normalizeSong)
  const currentSong = playlist[index]

  if (!currentSong) {
    ElMessage.warning('歌曲信息异常，暂时无法播放')
    return
  }

  if (!currentSong.url) {
    ElMessage.warning('当前歌曲暂无音频资源')
    return
  }
  
  playerStore.setPlaylist(playlist)
  playerStore.playSong(index)
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay .play-icon {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin-left: 2px;
}

.card-info {
  padding: 12px;
}

.card-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skeleton-card {
  cursor: default;
  box-shadow: none;
}

.cover-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.info-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.title-skeleton {
  width: 80%;
  height: 14px;
  margin-bottom: 8px;
}

.artist-skeleton {
  width: 60%;
  height: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>