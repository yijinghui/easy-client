<template>
  <div class="page-content">
    <h2 v-if="keyword">搜索「{{ keyword }}」</h2>
    <h2 v-else>歌曲搜索</h2>
    <p v-if="keyword && !loading" class="result-summary">共找到 {{ total }} 首相关歌曲</p>

    <div class="search-list">
      <div class="search-header">
        <div class="col-title">歌名/歌手</div>
        <div class="col-lyrics">歌词片段</div>
        <div class="col-album">专辑</div>
        <div class="col-duration">时长</div>
      </div>

      <div v-if="loading" class="empty-state">
        <span>搜索中...</span>
      </div>

      <template v-else>
        <div v-for="song in searchResults" :key="song.id" class="search-item">
          <div class="song-info">
            <div class="cover-wrapper">
              <img :src="song.cover" class="small-cover" />
              <div class="play-overlay" @click="playSearchSong(song)">
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
          <div class="song-album">{{ song.album }}</div>
          <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        </div>

        <div v-if="!keyword" class="empty-state">
          <span>请输入关键词搜索歌曲</span>
        </div>
        <div v-else-if="searchResults.length === 0" class="empty-state">
          <span>未找到相关歌曲</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '@/stores/player'
import { searchSongs } from '@/api/song'
import { getSongAudio, getSongCover } from '@/utils/asset'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const keyword = ref('')
const searchResults = ref([])
const total = ref(0)
const loading = ref(false)
const isLoggedIn = ref(false)

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

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
  album: song.album,
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

const fetchSearchResults = async () => {
  const text = (route.query.q || route.query.text || '').trim()
  keyword.value = text

  if (!text) {
    searchResults.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    const res = await searchSongs(text)
    if (res.data && Array.isArray(res.data.items)) {
      searchResults.value = res.data.items.map(mapSong)
      total.value = res.data.total ?? searchResults.value.length
    } else {
      searchResults.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('搜索歌曲失败', error)
    searchResults.value = []
    total.value = 0
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

const playSearchSong = (song) => {
  if (!isLoggedIn.value) {
    ElMessage.info('未登录，登录后体验更多内容')
    router.push('/login')
    return
  }

  playerStore.setPlaylist(searchResults.value)
  const index = searchResults.value.findIndex(s => s.id === song.id)
  playerStore.playSong(index)
}

watch(
  () => route.query.q,
  () => {
    fetchSearchResults()
  }
)

onMounted(() => {
  checkLoginStatus()
  fetchSearchResults()
})
</script>

<style scoped>
.page-content h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 8px 0;
}

.result-summary {
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #909399;
}

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

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
