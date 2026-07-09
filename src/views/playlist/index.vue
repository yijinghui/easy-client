<template>
  <div class="page-content">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="playlist" class="playlist-detail">
      <div class="playlist-header">
        <div class="playlist-cover-large">
          <img :src="playlist.cover" :alt="playlist.title" />
        </div>
        <div class="playlist-info">
          <h1 class="playlist-title">{{ playlist.title }}</h1>
          <div class="playlist-meta">
            <span class="meta-item">{{ playlist.userName }}</span>
            <span class="meta-divider">·</span>
            <span class="meta-item">{{ playlist.songCount }} 首歌曲</span>
            <span class="meta-divider">·</span>
            <span class="meta-item">{{ playlist.playCount }} 次播放</span>
          </div>
          <p class="playlist-intro">{{ playlist.introduction || '暂无简介' }}</p>
          <div class="playlist-tags">
            <span class="tag-item">{{ playlist.style }}</span>
          </div>
          <div class="playlist-actions">
            <button class="play-all-btn" @click="playAll" title="播放全部">
              <el-icon :size="16"><Headset /></el-icon>
              播放全部
            </button>
            <button 
              class="icon-btn favorite-btn" 
              :class="{ active: playlist.isFavorite }" 
              @click="toggleFavorite"
              :title="playlist.isFavorite ? '取消收藏' : '收藏'"
            >
              <el-icon :size="18"><Star /></el-icon>
            </button>
            <template v-if="isOwnPlaylist">
              <button class="icon-btn edit-btn" @click="handleEdit" title="编辑">
                <el-icon :size="18"><Edit /></el-icon>
              </button>
              <button class="icon-btn delete-btn" @click="handleDelete" title="删除">
                <el-icon :size="18"><Delete /></el-icon>
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="playlist-songs">
        <div class="songs-header">
          <h2>歌曲列表</h2>
          <span class="songs-count">{{ playlist.songCount }} 首</span>
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
          >
            <div class="col-title">
              <div class="cover-wrapper">
                <img :src="song.cover" class="small-cover" />
                <div class="play-overlay" @click="playSong(song, index)">
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
              <span class="action-icon like-icon" :class="{ liked: song.isFavorite }" @click="toggleSongFavorite(song)">♡</span>
              <div class="action-btn" @click.stop="toggleMenu(song.id)">
                <span class="action-icon">⋮</span>
              </div>
              <div v-if="activeMenu === song.id" :class="['action-menu', { 'action-menu-up': index >= songs.length - 3 }]" @click.stop>
                <div v-if="isOwnPlaylist" class="menu-item" @click="handleRemoveSongFromPlaylist(song)">
                  <span>从歌单中移除</span>
                </div>
                <div class="menu-item" @click="handleAddToPlaylist(song)">
                  <span>加入歌单</span>
                </div>
                <div class="menu-item" @click="song.isFavorite ? handleRemoveFromFavorite(song) : handleAddToFavorite(song)">
                  <span>{{ song.isFavorite ? '取消收藏' : '加入我喜欢' }}</span>
                </div>
                <div class="menu-item" @click="handleAddToQueue(song)">
                  <span>添加到播放列表</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="songs.length === 0" class="empty-state">
            <span>暂无歌曲</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <span>歌单不存在或已被删除</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, Edit, Delete, Headset } from '@element-plus/icons-vue'
import { usePlayerStore } from '@/stores/player'
import { getPlaylistSongs, getPlaylistDetail, removeSongFromPlaylist, getUserPlaylists, addSongToPlaylist } from '@/api/playlist'
import { collectPlaylist, cancelCollectPlaylist, collectSong, cancelCollectSong } from '@/api/favorite'
import { getSongAudio, getSongCover, getPlaylistCover } from '@/utils/asset'
import { getCurrentUserId } from '@/utils/auth'
import { deletePlaylist } from '@/api/playlist'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const playlist = ref(null)
const songs = ref([])
const loading = ref(true)
const userPlaylists = ref([])
const showAddToPlaylistModal = ref(false)
const currentSongForPlaylist = ref(null)
const activeMenu = ref(null)

const isOwnPlaylist = computed(() => {
  if (!playlist.value) return false
  const playlistUserId = playlist.value.userId || ''
  if (!playlistUserId) return false
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return false
  return String(playlistUserId) === String(currentUserId)
})

const fetchPlaylist = async () => {
  loading.value = true
  songs.value = []
  playlist.value = null
  
  const currentId = parseInt(route.params.id)
  if (!currentId || isNaN(currentId)) {
    loading.value = false
    return
  }
  
  try {
    const res = await getPlaylistDetail(currentId)
    if (res.data) {
      const found = res.data
      playlist.value = {
        id: found.playlistId,
        title: found.title,
        cover: getPlaylistCover(found.coverUrl, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(found.style || 'abstract')}&image_size=square`),
        introduction: found.introduction,
        style: found.style,
        userName: found.username || '未知用户',
        userId: found.userId || '',
        playCount: found.playCount || 0,
        isFavorite: found.isFavorite || false,
        songCount: 0
      }
      await fetchPlaylistSongs(currentId)
    }
  } catch (error) {
    console.error('获取歌单信息失败', error)
  } finally {
    loading.value = false
  }
}

const fetchPlaylistSongs = async (currentId) => {
  try {
    const res = await getPlaylistSongs(currentId, { pageNum: 1, pageSize: 100 })
    if (res.data && res.data.items) {
      songs.value = res.data.items.map(song => ({
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
      if (playlist.value) {
        playlist.value.songCount = res.data.total || songs.value.length
      }
    }
  } catch (error) {
    console.error('获取歌单歌曲失败', error)
  }
}

onMounted(() => {
  fetchPlaylist()
})

watch(
  () => route.params.id,
  () => {
    fetchPlaylist()
  }
)

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const playSong = (song, index) => {
  playerStore.playlist = [...songs.value]
  playerStore.playSong(index, playlist.value?.id)
}

const playAll = () => {
  if (songs.value.length === 0) {
    ElMessage.info('歌单暂无歌曲')
    return
  }
  playerStore.playlist = [...songs.value]
  playerStore.playSong(0, playlist.value?.id)
}

const toggleFavorite = async () => {
  if (!playlist.value) return
  
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  try {
    if (playlist.value.isFavorite) {
      await cancelCollectPlaylist(playlist.value.id)
      playlist.value.isFavorite = false
      ElMessage.success('已取消收藏')
    } else {
      await collectPlaylist(playlist.value.id)
      playlist.value.isFavorite = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败')
  }
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
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败')
  }
}

const handleEdit = () => {
  router.push(`/playlist/edit/${playlist.value.id}`)
}

const handleDelete = async () => {
  if (!playlist.value) return

  try {
    await ElMessageBox.confirm(
      `确定要删除歌单「${playlist.value.title}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePlaylist(playlist.value.id)
    ElMessage.success('歌单删除成功')
    window.dispatchEvent(new CustomEvent('playlist-deleted'))
    router.push('/home')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
}

const handleRemoveSongFromPlaylist = async (song) => {
  try {
    await removeSongFromPlaylist(playlist.value.id, song.id)
    songs.value = songs.value.filter(s => s.id !== song.id)
    playlist.value.songCount = songs.value.length
    activeMenu.value = null
    ElMessage.success('已从歌单中移除')
  } catch (error) {
    console.error('移除歌曲失败', error)
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

.playlist-detail {
  padding-bottom: 20px;
}

.playlist-header {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.playlist-cover-large {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.playlist-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.playlist-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 13px;
  color: #909399;
}

.meta-divider {
  color: #d9d9d9;
}

.playlist-intro {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.playlist-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag-item {
  padding: 4px 12px;
  background: #f0f5ff;
  color: #409eff;
  font-size: 12px;
  border-radius: 4px;
}

.playlist-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  align-items: center;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
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

.favorite-btn {
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.favorite-btn.active {
  color: #e6a23c;
}

.favorite-btn.active:hover {
  background: rgba(230, 162, 60, 0.1);
}

.edit-btn {
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #f0f5ff;
  color: #409eff;
}

.delete-btn {
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.playlist-songs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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
  width: 80px;
  flex-shrink: 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
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