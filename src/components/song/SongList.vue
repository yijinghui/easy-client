<template>
  <div class="song-list-wrapper">
    <div class="songs-header">
      <h2>歌曲列表</h2>
      <span class="songs-count">{{ songs.length }} 首</span>
    </div>
    <div class="songs-list">
      <div class="list-header">
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
        :class="{ playing: playerStore.currentSong?.id === song.id }"
        @click="playSong(song, index)"
      >
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
          <span 
            v-if="showFavorite"
            class="action-icon like-icon" 
            :class="{ liked: song.isFavorite }" 
            @click.stop="toggleSongFavorite(song)"
          >♡</span>
          <div class="action-btn" @click.stop="toggleMenu(song.id)">
            <span class="action-icon">⋮</span>
          </div>
          <div v-if="activeMenu === song.id" :class="['action-menu', { 'action-menu-up': index >= songs.length - 2 }]" @click.stop>
            
            <div class="menu-item" @click="handleAddToPlaylist(song)">
              <span>加入歌单</span>
            </div>
            <div class="menu-item" @click="song.isFavorite ? handleRemoveFromFavorite(song) : handleAddToFavorite(song)">
              <span>{{ song.isFavorite ? unfavoriteText : '加入我喜欢' }}</span>
            </div>
            <div class="menu-item" @click="handleAddToQueue(song)">
              <span>添加到播放列表</span>
            </div>
            <div v-if="showRemoveFromPlaylist && isOwnPlaylist" class="menu-item" @click="handleRemoveFromPlaylist(song)">
              <span>{{ removeText }}</span>
            </div>
            <div v-if="showDelete" class="menu-item" @click="handleDelete(song)">
              <span>删除播放记录</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="songs.length === 0" class="empty-state">
        <span>暂无歌曲</span>
      </div>
    </div>

    <el-dialog title="选择歌单" v-model="showAddToPlaylistModal" width="400px">
      <div v-if="userPlaylists.length === 0" class="empty-state">
        <span>暂无歌单</span>
      </div>
      <div v-else class="playlist-list">
        <div 
          v-for="pl in userPlaylists" 
          :key="pl.id" 
          class="playlist-item"
          @click="confirmAddToPlaylist(pl.id)"
        >
          <span>{{ pl.name }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getUserPlaylists, addSongToPlaylist } from '@/api/playlist'
import { collectSong, cancelCollectSong } from '@/api/favorite'
import { getCurrentUserId } from '@/utils/auth'

const props = defineProps({
  songs: {
    type: Array,
    default: () => []
  },
  playlistId: {
    type: [Number, String],
    default: null
  },
  showRemoveFromPlaylist: {
    type: Boolean,
    default: false
  },
  isOwnPlaylist: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showFavorite: {
    type: Boolean,
    default: true
  },
  removeText: {
    type: String,
    default: '从歌单中移除'
  },
  unfavoriteText: {
    type: String,
    default: '取消收藏'
  }
})

const emit = defineEmits(['song-play', 'favorite-change', 'remove-from-playlist', 'delete'])

const router = useRouter()
const playerStore = usePlayerStore()

const userPlaylists = ref([])
const showAddToPlaylistModal = ref(false)
const currentSongForPlaylist = ref(null)
const activeMenu = ref(null)

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playSong = (song, index) => {
  playerStore.playlist = [...props.songs]
  playerStore.playSong(index, props.playlistId)
  emit('song-play', { song, index })
}

const toggleSongFavorite = async (song) => {
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
    emit('favorite-change', { song, isFavorite: song.isFavorite })
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败')
  }
}

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
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
    ElMessage.success('已添加到歌单')
  } catch (error) {
    console.error('添加到歌单失败', error)
    ElMessage.error('操作失败')
  }
}

const handleAddToFavorite = async (song) => {
  try {
    await collectSong(song.id)
    song.isFavorite = true
    activeMenu.value = null
    ElMessage.success('已加入我喜欢')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'add', songId: song.id, song }
    }))
    emit('favorite-change', { song, isFavorite: true })
  } catch (error) {
    console.error('添加收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const handleRemoveFromFavorite = async (song) => {
  try {
    await cancelCollectSong(song.id)
    song.isFavorite = false
    activeMenu.value = null
    ElMessage.success('已取消收藏')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'remove', songId: song.id }
    }))
    emit('favorite-change', { song, isFavorite: false })
  } catch (error) {
    console.error('取消收藏失败', error)
    ElMessage.error('操作失败')
  }
}

const handleAddToQueue = async (song) => {
  playerStore.addToPlayQueue(song)
  activeMenu.value = null
  ElMessage.success('已加入播放列表')
}

const handleRemoveFromPlaylist = (song) => {
  activeMenu.value = null
  emit('remove-from-playlist', { song })
}

const handleDelete = (song) => {
  activeMenu.value = null
  emit('delete', { song })
}

defineExpose({
  playSong,
  toggleMenu
})
</script>

<style scoped>
.song-list-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.songs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.songs-header h2 {
  font-size: 16px;
  color: #303133;
  margin: 0;
}

.songs-count {
  font-size: 13px;
  color: #909399;
}

.songs-list {
  padding: 0;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
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
  width: 80px;
  flex-shrink: 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
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

.song-item .col-title {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  margin-right: auto;
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
  width: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.action-icon {
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.like-icon {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 16px;
}

.like-icon:hover {
  color: #ef4444;
}

.like-icon.liked {
  color: #ef4444;
}

.action-btn {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>