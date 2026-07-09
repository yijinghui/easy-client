<template>
  <div class="page-content">
    <h2>我喜欢的音乐</h2>
    <div class="favorite-list">
      <div class="favorite-header">
        <div class="col-title">歌名/歌手</div>
        <div class="col-album">专辑</div>
        <div class="col-duration">时长</div>
        <div class="col-actions"></div>
      </div>
      <div v-for="(song, index) in favoriteSongs" :key="song.id" class="favorite-item">
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
        <div class="song-actions">
          <span class="action-btn add-btn" @click.stop="addToPlayQueue(song)">
            <img src="@/assets/icons/playlist.png" />
          </span>
          <div class="more-action-btn" @click.stop="toggleMenu(song.id)">
            <span class="more-action-icon">⋮</span>
          </div>
          <div v-if="activeMenu === song.id" :class="['action-menu', { 'action-menu-up': index >= favoriteSongs.length - 3 }]" @click.stop>
            <div class="menu-item" @click="handleRemoveFromFavorite(song)">
              <span>从我喜欢中移除</span>
            </div>
            <div class="menu-item" @click="addToPlayQueue(song)">
              <span>添加到播放列表</span>
            </div>
            <div class="menu-item" @click="handleAddToPlaylist(song)">
              <span>加入歌单</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="favoriteSongs.length === 0" class="empty-state">
        <span>暂无喜欢的歌曲</span>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { getFavoriteSongs, cancelCollectSong } from '@/api/favorite'
import { getUserPlaylists, addSongToPlaylist } from '@/api/playlist'
import { getSongAudio, getSongCover } from '@/utils/asset'
import { getCurrentUserId } from '@/utils/auth'

const router = useRouter()
const playerStore = usePlayerStore()

const favoriteSongs = ref([])
const isLoggedIn = ref(false)
const activeMenu = ref(null)
const userPlaylists = ref([])
const showAddToPlaylistModal = ref(false)
const currentSongForPlaylist = ref(null)

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

const addToPlayQueue = (song) => {
  if (!isLoggedIn.value) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }
  
  playerStore.addToPlayQueue(song)
  activeMenu.value = null
  ElMessage.success(`已加入播放队列`)
}

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
}

const handleRemoveFromFavorite = async (song) => {
  try {
    await cancelCollectSong(song.id)
    const index = favoriteSongs.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
      favoriteSongs.value.splice(index, 1)
    }
    activeMenu.value = null
    ElMessage.success('已从我喜欢中移除')
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: 'remove', songId: song.id }
    }))
  } catch (error) {
    console.error('移除收藏失败', error)
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

.favorite-header .col-actions {
  width: 80px;
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
  flex-shrink: 0;
}

.song-duration {
  width: 80px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
  flex-shrink: 0;
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

.add-btn {
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
}

.add-btn img {
  margin-top: 3px;
  width: 23px;
  height: 23px;
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
  width: 100%;
  height: 100%;
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>