<template>
  <div class="search-list">
    <div class="search-header">
      <div class="col-title">歌名/歌手</div>
      <div class="col-lyrics">歌词片段</div>
      <div class="col-album">专辑</div>
      <div class="col-duration">时长</div>
      <div class="col-actions"></div>
    </div>

    <div v-if="loading" class="empty-state">
      <span>搜索中...</span>
    </div>
    <template v-else>
      <div v-for="(song, index) in results" :key="song.id" class="search-item">
        <div class="song-info">
          <div class="cover-wrapper">
            <img :src="song.cover" class="small-cover" />
            <div class="play-overlay" @click="handlePlay(song)">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="song-detail">
            <span class="song-name" v-html="song.nameHtml"></span>
            <span class="song-artist" v-html="song.artistHtml"></span>
          </div>
        </div>
        <div
          v-if="song.lyricsSegment"
          class="song-lyrics lyrics-segment"
          v-html="song.lyricsSegment"
        ></div>
        <div v-else class="song-lyrics lyrics-empty">—</div>
        <div class="song-album" v-html="song.albumHtml"></div>
        <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        <div class="song-actions">
          <span 
            class="action-icon like-icon" 
            :class="{ liked: song.isFavorite }" 
            @click.stop="handleFavorite(song)"
          >♡</span>
          <div class="action-btn" @click.stop="toggleMenu(song.id)">
            <span class="action-icon">⋮</span>
          </div>
          <div v-if="activeMenu === song.id" :class="['action-menu', { 'action-menu-up': index >= results.length - 3 }]" @click.stop>
            <div class="menu-item" @click="handleAddToPlaylist(song)">
              <span>加入歌单</span>
            </div>
            <div class="menu-item" @click="handleAddToFavorite(song)">
              <span>{{ song.isFavorite ? '取消收藏' : '加入我喜欢' }}</span>
            </div>
            <div class="menu-item" @click="handleAddToQueue(song)">
              <span>添加到播放列表</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="empty-state">
        <span>未找到相关歌曲</span>
      </div>
    </template>
    
    <div v-if="total > pageSize && !loading" class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
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
import { ref, watch } from 'vue'
import { ElMessage, ElPagination, ElDialog } from 'element-plus'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { searchSongs } from '@/api/song'
import { getSongAudio, getSongCover } from '@/utils/asset'
import { collectSong, cancelCollectSong } from '@/api/favorite'
import { getUserPlaylists, addSongToPlaylist } from '@/api/playlist'
import { getCurrentUserId } from '@/utils/auth'

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loaded'])

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(false)
const results = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const activeMenu = ref(null)
const userPlaylists = ref([])
const showAddToPlaylistModal = ref(false)
const currentSongForPlaylist = ref(null)

const allowEmHighlight = (value) => {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;em&gt;/gi, '<em>')
    .replace(/&lt;\/em&gt;/gi, '</em>')
}

const getHighlightedValue = (song, highlightKey, fallbackKey) => {
  return allowEmHighlight(song[highlightKey] || song[fallbackKey])
}

const mapSong = (song) => ({
  id: song.songId,
  name: String(song.songName || '').replace(/<\/?em>/gi, ''),
  nameHtml: getHighlightedValue(song, 'songNameHighlight', 'songName'),
  artist: String(song.artistName || '').replace(/<\/?em>/gi, ''),
  artistHtml: getHighlightedValue(song, 'artistNameHighlight', 'artistName'),
  album: String(song.album || '').replace(/<\/?em>/gi, ''),
  albumHtml: getHighlightedValue(song, 'albumHighlight', 'album'),
  cover: getSongCover(song.coverUrl, `https://picsum.photos/40/40?random=${song.songId}`),
  url: getSongAudio(song.audioUrl),
  duration: parseFloat(song.duration) || 0,
  lyricsSegment: getHighlightedValue(song, 'lyricsSegmentHighlight', 'lyricsSegment'),
  lyric: song.lyrics || '',
  lyrics: song.lyrics || '',
  lyricsHead: song.lyricsHead || '',
  lyricsTimestamps: song.nested || '',
  isFavorite: song.isFavorite ?? false
})

const fetchSongs = async (pageNum = 1) => {
  const text = props.keyword
  if (!text) return

  loading.value = true
  try {
    const res = await searchSongs(text, pageNum, pageSize.value)
    if (res.data && Array.isArray(res.data.items)) {
      if (pageNum === 1) {
        results.value = res.data.items.map(mapSong)
      } else {
        results.value = [...results.value, ...res.data.items.map(mapSong)]
      }
      total.value = res.data.total ?? results.value.length
    } else {
      if (pageNum === 1) {
        results.value = []
        total.value = 0
      }
    }
    emit('loaded', results.value)
  } catch (error) {
    console.error('搜索歌曲失败', error)
    if (pageNum === 1) {
      results.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (pageNum) => {
  page.value = pageNum
  fetchSongs(pageNum)
}

const formatDuration = (seconds) => {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handlePlay = (song) => {
  if (!props.isLoggedIn) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  playerStore.setPlaylist(results.value)
  const index = results.value.findIndex(s => s.id === song.id)
  playerStore.playSong(index)
}

const handleFavorite = async (song) => {
  if (!props.isLoggedIn) {
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

const toggleMenu = (songId) => {
  activeMenu.value = activeMenu.value === songId ? null : songId
}

const handleAddToFavorite = async (song) => {
  if (!props.isLoggedIn) {
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
      ElMessage.success('已加入我喜欢')
    }
    activeMenu.value = null
    window.dispatchEvent(new CustomEvent('favorite-updated', {
      detail: { type: song.isFavorite ? 'add' : 'remove', songId: song.id, song }
    }))
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败')
  }
}

const handleAddToQueue = (song) => {
  playerStore.addToPlayQueue(song)
  activeMenu.value = null
  ElMessage.success('已加入播放列表')
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

const reset = () => {
  results.value = []
  total.value = 0
  page.value = 1
}

const load = (pageNum = 1) => {
  page.value = pageNum
  fetchSongs(pageNum)
}

watch(
  () => props.keyword,
  (newKeyword) => {
    if (newKeyword) {
      load(1)
    } else {
      reset()
    }
  }
)

defineExpose({
  reset,
  load,
  results
})


</script>

<style scoped>
.search-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.search-header .col-title {
  flex: 1;
  min-width: 180px;
  font-size: 12px;
  color: #909399;
}

.search-header .col-lyrics {
  flex: 1.5;
  min-width: 220px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.search-header .col-album {
  width: 160px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.search-header .col-duration {
  width: 80px;
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.search-header .col-actions {
  width: 80px;
  flex-shrink: 0;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
}

.search-item:hover {
  background: #fafafa;
}

.song-info {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
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

.search-item:hover .play-overlay {
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

.song-lyrics {
  flex: 1.5;
  min-width: 220px;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  padding-right: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lyrics-empty {
  color: #c0c4cc;
}

.song-name :deep(em),
.song-artist :deep(em),
.song-album :deep(em),
.lyrics-segment :deep(em) {
  color: #409eff;
  font-style: normal;
  font-weight: 500;
}

.song-album {
  width: 160px;
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

.song-actions {
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
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
</style>