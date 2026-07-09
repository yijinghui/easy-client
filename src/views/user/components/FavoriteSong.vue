<template>
  <div v-if="loading" class="loading-state">加载中...</div>
  <div v-else-if="songs.length === 0" class="empty-state">
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
      v-for="(song, index) in songs" 
      :key="song.id" 
      class="song-item"
      :class="{ playing: currentSongId === song.id }"
      @click="emit('play-song', song, index, songs)"
    >
      <div class="col-index">
        <span class="song-index">{{ index + 1 }}</span>
        <el-icon v-if="currentSongId === song.id" name="Playing" class="playing-icon" />
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
        <span class="action-icon like-icon liked" @click.stop="handleToggleFavorite(song)">♡</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElIcon, ElMessage } from 'element-plus'
import { getFavoriteSongs, cancelCollectSong } from '@/api/favorite'
import { getSongCover } from '@/utils/asset'

defineProps({
  currentSongId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['play-song', 'toggle-favorite'])

const songs = ref([])
const loading = ref(false)

const fetchFavoriteSongs = async () => {
  loading.value = true
  try {
    const res = await getFavoriteSongs({ pageNum: 1, pageSize: 100 })
    if (res.data && res.data.items) {
      songs.value = res.data.items.map(song => ({
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
    loading.value = false
  }
}

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleToggleFavorite = async (song) => {
  try {
    await cancelCollectSong(song.id)
    song.isFavorite = false
    songs.value = songs.value.filter(s => s.id !== song.id)
    ElMessage.success('已取消收藏')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'remove', songId: song.id }
    }))
    emit('toggle-favorite', song)
  } catch (error) {
    console.error('取消收藏失败', error)
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchFavoriteSongs()
})
</script>

<style scoped>
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
</style>