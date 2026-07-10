<template>
  <div class="player-wrapper">
    <!-- 音频元素 -->
    <audio 
      ref="audioRef" 
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleAudioError"
    ></audio>
    
    <!-- 播放队列弹窗 -->
    <Playlist :visible="showPlaylist" @close="showPlaylist = false" />
    
    <!-- 展开的播放器详情 -->
    <div v-if="isExpanded" class="player-expanded">
      <div class="expanded-content">
        <div class="expanded-left">
          <div class="album-cover">
            <img :src="playerStore.currentSong.cover || defaultCover" class="cover-large" />
          </div>
          <div class="song-info">
            <h3 class="song-title">{{ playerStore.currentSong.name || '暂无播放歌曲' }}</h3>
            <p class="song-artist">{{ playerStore.currentSong.artist || '未知歌手' }}</p>
          </div>
        </div>
        <div class="expanded-right">
          <div ref="lyricsContainerRef" class="lyrics-container">
            <template v-if="playerStore.currentSong.name">
              <template v-if="parsedLyrics.length > 0">
                <p 
                  v-for="(item, index) in parsedLyrics" 
                  :key="index" 
                  class="lyric-line"
                  :class="{ active: index === currentLyricIndex }"
                >
                  {{ item.text }}
                </p>
              </template>
              <template v-else>
                <p class="no-lyric-text">暂无歌词</p>
              </template>
            </template>
            <template v-else>
              <p class="no-song-text">暂无播放歌曲</p>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部播放栏 -->
    <footer class="player-bar" >
      <!-- 左侧：封面和歌曲信息 -->
      <div class="player-left" @click="toggleExpand">
        <div class="cover-wrapper">
          <img :src="playerStore.currentSong.cover || defaultCover" class="player-cover" />
        </div>
        <div class="player-info">
          <span class="player-title">{{ playerStore.currentSong.name || '暂无播放歌曲' }}</span>
          <span class="player-artist">{{ playerStore.currentSong.artist || '' }}</span>
        </div>
      </div>
      
      <!-- 中间：播放控制 -->
      <div class="player-center">
        <div class="player-controls">
          <span class="control-icon" @click.stop="handlePrev">⏮</span>
          <div class="play-btn" @click.stop="handlePlay">
            <span class="play-icon">{{ playerStore.isPlaying ? '⏸' : '▶' }}</span>
          </div>
          <span class="control-icon" @click.stop="handleNext">⏭</span>
          <span class="control-icon like-icon" :class="{ liked: isLiked }" @click.stop="handleLike">♡</span>
          <span class="control-icon mode-icon" @click.stop="handleToggleMode">
            <img 
              v-if="playerStore.playMode === 'sequence'" 
              src="@/assets/icons/loop.png" 
              class="mode-icon-img"
              title="顺序播放"
            />
            <img 
              v-else-if="playerStore.playMode === 'shuffle'" 
              src="@/assets/icons/shuffle.png" 
              class="mode-icon-img active"
              title="随机播放"
            />
            <img 
              v-else 
              src="@/assets/icons/playbock.png" 
              class="mode-icon-img active"
              title="单曲循环"
            />
          </span>
        </div>
        <div class="progress-container">
          <span class="time">{{ playerStore.formattedCurrentTime || '00:00' }}</span>
          <div 
            class="progress-bar" 
            :class="{ dragging: isDragging }"
            @mousedown.stop="handleProgressMouseDown"
            @click.stop="handleProgressClick"
          >
            <div class="progress-bar-bg"></div>
            <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
            <div class="progress-dot" :style="{ left: playerStore.progress + '%' }"></div>
          </div>
          <span class="time">{{ playerStore.formattedDuration || '00:00' }}</span>
        </div>
      </div>
      
      <!-- 右侧：音量控制 -->
      <div class="player-right" @click.stop>
        <div class="volume-control">
          <img src="@/assets/icons/comment.svg" class="control-icon comment-icon" @click.stop="handleComment" />
          <span class="control-icon volume-icon" @click.stop="handleToggleMute">
            <img 
              v-if="isMuted || playerStore.volume === 0" 
              src="@/assets/icons/close.svg" 
              class="volume-icon-img"
              title="点击取消静音"
            />
            <img 
              v-else 
              src="@/assets/icons/open.svg" 
              class="volume-icon-img"
              title="点击静音"
            />
          </span>
          <input 
            type="range" 
            v-model="playerStore.volume" 
            min="0" 
            max="100" 
            class="volume-slider"
            @input="handleVolumeChange"
          />
        </div>
        <span class="control-icon list-icon" @click.stop="showPlaylist = !showPlaylist">☰</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { collectSong, cancelCollectSong } from '@/api/favorite'
import { resolveFileUrl } from '@/utils/asset'
import Playlist from './Playlist.vue'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()
const isExpanded = ref(false)
const showPlaylist = ref(false)
const audioRef = ref(null)
const isDragging = ref(false)
const isMuted = ref(false)
const lastVolume = ref(30)
const defaultCover = resolveFileUrl('songCovers/default.webp')

const parsedLyrics = ref([])
const currentLyricIndex = ref(-1)
const lyricsContainerRef = ref(null)
const loadedSongUrl = ref('')

const getSongFavoriteStatus = (song) => {
  if (!song?.id) return false
  return !!(song.isFavorite ?? song.isLiked ?? song.isLike ?? false)
}

const setSongFavoriteStatus = (song, value) => {
  song.isFavorite = value
  song.isLiked = value
  song.isLike = value
}

const isLiked = computed(() => getSongFavoriteStatus(playerStore.currentSong))

const isSameAudioUrl = (audioSrc, songUrl) => {
  if (!audioSrc || !songUrl) return false
  try {
    return new URL(audioSrc).href === new URL(songUrl, window.location.origin).href
  } catch {
    return audioSrc.endsWith(songUrl) || songUrl.endsWith(audioSrc)
  }
}

const parseTimeStr = (timeStr) => {
  if (!timeStr || !timeStr.trim()) return null
  const match = timeStr.trim().match(/^(\d{2}):(\d{2})\.(\d{2,3})$/)
  if (!match) return null
  const minutes = parseInt(match[1])
  const seconds = parseInt(match[2])
  const milliseconds = parseInt(match[3].padEnd(3, '0'))
  return minutes * 60 + seconds + milliseconds / 1000
}

const parseLyricsWithTimestamps = (lyricText, timestampStr) => {
  if (!lyricText || !timestampStr) return []
  
  const lyrics = lyricText.split(/[,，]/).map(l => l.trim()).filter(l => l)
  const timestamps = timestampStr.split(/[,，]/).map(t => parseTimeStr(t)).filter(t => t !== null)
  
  const result = []
  const len = Math.min(lyrics.length, timestamps.length)
  
  for (let i = 0; i < len; i++) {
    result.push({
      time: timestamps[i],
      text: lyrics[i]
    })
  }
  
  return result
}

const parseLyrics = (lyricText, timestampStr) => {
  if (!lyricText || lyricText.trim() === '') {
    return []
  }
  
  if (timestampStr && timestampStr.trim()) {
    return parseLyricsWithTimestamps(lyricText, timestampStr)
  }
  
  const lines = lyricText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const result = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || !line.trim()) continue
    
    const trimmedLine = line.trim()
    
    const match = trimmedLine.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()
      
      if (text) {
        result.push({ time, text })
      }
    }
  }
  
  return result
}

const updateCurrentLyric = (currentTime) => {
  if (parsedLyrics.value.length === 0) {
    currentLyricIndex.value = -1
    return
  }
  
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime >= parsedLyrics.value[i].time) {
      currentLyricIndex.value = i
      scrollToCurrentLyric()
      return
    }
  }
  
  currentLyricIndex.value = -1
}

const scrollToCurrentLyric = () => {
  if (!lyricsContainerRef.value || currentLyricIndex.value === -1) return
  
  const lyricElements = lyricsContainerRef.value.querySelectorAll('.lyric-line')
  if (lyricElements[currentLyricIndex.value]) {
    const element = lyricElements[currentLyricIndex.value]
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

watch(
  () => playerStore.currentSong,
  (newSong) => {
    if (newSong && newSong.id) {
      const lyricsHead = newSong.lyricsHead || ''
      const lyricsContent = newSong.lyrics || ''
      const lyricText = lyricsHead ? `${lyricsHead},${lyricsContent}` : lyricsContent
      const timestampStr = newSong.lyricsTimestamps || ''
      const lyrics = parseLyrics(lyricText, timestampStr)
      parsedLyrics.value = lyrics
      currentLyricIndex.value = -1
    } else {
      parsedLyrics.value = []
      currentLyricIndex.value = -1
    }
  },
  { immediate: true }
)

watch(
  () => playerStore.currentTime,
  (currentTime) => {
    updateCurrentLyric(currentTime)
  }
)

const handleLike = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }

  if (!playerStore.currentSong.id) {
    ElMessage.info('请先选择一首歌曲')
    return
  }

  try {
    if (isLiked.value) {
      await cancelCollectSong(playerStore.currentSong.id)
      setSongFavoriteStatus(playerStore.currentSong, false)
      ElMessage.success('取消收藏')
      window.dispatchEvent(new CustomEvent('favorite-updated', {
        detail: {
          type: 'remove',
          songId: playerStore.currentSong.id,
          song: playerStore.currentSong
        }
      }))
    } else {
      await collectSong(playerStore.currentSong.id)
      setSongFavoriteStatus(playerStore.currentSong, true)
      ElMessage.success('收藏成功')
      window.dispatchEvent(new CustomEvent('favorite-updated', {
        detail: {
          type: 'add',
          songId: playerStore.currentSong.id,
          song: playerStore.currentSong
        }
      }))
    }
  } catch (error) {
    console.error('操作失败', error)
    ElMessage.error('操作失败，请重试')
  }
}

const handlePlay = () => {
  if (!playerStore.currentSong.name) {
    ElMessage.info('请先选择一首歌曲')
    return
  }

  if (playerStore.isPlaying) {
    playerStore.pause()
  } else {
    playerStore.play()
  }
}

const handlePrev = () => {
  if (!playerStore.currentSong.name) {
    ElMessage.info('请先选择一首歌曲')
    return
  }
  playerStore.prev()
  loadAndPlay()
}

const handleNext = () => {
  if (!playerStore.currentSong.name) {
    ElMessage.info('请先选择一首歌曲')
    return
  }
  playerStore.next()
  loadAndPlay()
}

const handleToggleMode = () => {
  playerStore.togglePlayMode()
}

const handleComment = () => {
  if (!playerStore.currentSong.name) {
    ElMessage.info('请先选择一首歌曲')
    return
  }

  if (route.name === 'comment' && route.params.songId === String(playerStore.currentSong.id)) {
    router.back()
  } else {
    router.push({
      name: 'comment',
      params: { songId: String(playerStore.currentSong.id) },
      query: {
        name: playerStore.currentSong.name,
        artist: playerStore.currentSong.artist,
        album: playerStore.currentSong.album,
        cover: playerStore.currentSong.cover
      }
    })
  }
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleProgressClick = (e) => {
  if (!playerStore.currentSong.duration) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const time = percent * playerStore.currentSong.duration
  playerStore.seek(time)
  if (audioRef.value) {
    audioRef.value.currentTime = time
  }
}

const handleProgressMouseDown = (e) => {
  if (!playerStore.currentSong.duration) return
  isDragging.value = true
  document.addEventListener('mousemove', handleProgressMouseMove)
  document.addEventListener('mouseup', handleProgressMouseUp)
  handleProgressMove(e)
}

const handleProgressMouseMove = (e) => {
  if (!isDragging.value) return
  handleProgressMove(e)
}

const handleProgressMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)
}

const handleProgressMove = (e) => {
  if (!playerStore.currentSong.duration) return
  const progressBar = document.querySelector('.progress-bar')
  if (!progressBar) return
  const rect = progressBar.getBoundingClientRect()
  let percent = (e.clientX - rect.left) / rect.width
  percent = Math.max(0, Math.min(1, percent))
  const time = percent * playerStore.currentSong.duration
  playerStore.seek(time)
  if (audioRef.value) {
    audioRef.value.currentTime = time
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    playerStore.currentTime = audioRef.value.currentTime
  }
}

const handleEnded = () => {
  if (!playerStore.playlist.length) {
    playerStore.pause()
    playerStore.currentTime = 0
    if (audioRef.value) {
      audioRef.value.currentTime = 0
    }
    return
  }

  if (playerStore.playMode === 'single') {
    playerStore.currentTime = 0
    if (audioRef.value) {
      audioRef.value.currentTime = 0
    }
    if (playerStore.isPlaying) {
      audioRef.value?.play().catch(() => {})
    }
    return
  }

  playerStore.next()
  loadAndPlay()
}

const handleAudioError = (e) => {
  console.error('音频错误:', e)
  playerStore.pause()
  ElMessage.error('音频加载失败')
}

const handleToggleMute = () => {
  if (!audioRef.value) return
  
  if (isMuted.value) {
    isMuted.value = false
    playerStore.setVolume(lastVolume.value)
    audioRef.value.volume = lastVolume.value / 100
  } else {
    lastVolume.value = playerStore.volume
    isMuted.value = true
    playerStore.setVolume(0)
    audioRef.value.volume = 0
  }
}

const handleVolumeChange = () => {
  if (audioRef.value) {
    audioRef.value.volume = playerStore.volume / 100
  }
  
  if (playerStore.volume > 0 && isMuted.value) {
    isMuted.value = false
  }
}

const loadAudioSource = (url, resetTime = true) => {
  if (!audioRef.value || !url) return false

  audioRef.value.pause()
  audioRef.value.src = url
  audioRef.value.load()
  loadedSongUrl.value = url
  audioRef.value.volume = playerStore.volume / 100

  if (resetTime) {
    audioRef.value.currentTime = 0
    playerStore.currentTime = 0
  }

  return true
}

const playCurrentAudio = () => {
  if (!audioRef.value || !playerStore.currentSong.url) return

  audioRef.value.play().catch(error => {
    console.error('播放失败:', error)
    playerStore.pause()
    ElMessage.error('播放失败，请检查音频链接')
  })
}

const loadAndPlay = () => {
  if (!audioRef.value || !playerStore.currentSong.url) return

  loadAudioSource(playerStore.currentSong.url, true)
  playerStore.play()
  playCurrentAudio()
}

watch(
  () => playerStore.currentSong.url,
  (newUrl) => {
    if (!newUrl || !audioRef.value) return
    if (newUrl === loadedSongUrl.value) return

    loadAudioSource(newUrl, true)
    if (playerStore.isPlaying) {
      audioRef.value.play().catch(error => {
        console.error('播放失败:', error)
        playerStore.pause()
        ElMessage.error('播放失败，请检查音频链接')
      })
    }
  }
)

watch(() => playerStore.isPlaying, (isPlaying) => {
  if (!audioRef.value) return

  if (isPlaying) {
    const songUrl = playerStore.currentSong.url
    if (songUrl && !isSameAudioUrl(audioRef.value.src, songUrl)) {
      loadAudioSource(songUrl, true)
    } else {
      audioRef.value.currentTime = playerStore.currentTime
    }

    audioRef.value.play().catch(error => {
      console.error('播放失败:', error)
      playerStore.pause()
      ElMessage.error('播放失败，请检查音频链接')
    })
  } else {
    audioRef.value.pause()
  }
})

watch(() => playerStore.volume, (volume) => {
  if (audioRef.value) {
    audioRef.value.volume = volume / 100
  }
})

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = playerStore.volume / 100
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
    audioRef.value = null
  }
})
</script>
<style scoped>
.player-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  user-select: none;
  -webkit-user-select: none;
}

.player-expanded {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 64px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
  overflow-y: auto;
}



.collapse-btn:hover {
  background: #e2e8f0;
  opacity: 0.8;
}

.expanded-content {
  display: flex;
  gap: 80px;
  margin-left: 360px;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 128px);
}

.expanded-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.album-cover {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.cover-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expanded-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.song-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: center;
}

.song-artist {
  font-size: 14px;
  color: #64748b;
  margin: 8px 0 0 0;
  text-align: center;
}

.lyrics-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 0;
  width: 100%;
  max-width: 600px;
  margin-left: 50px;
}

.lyric-line {
  font-size: 14px;
  color: #94a3b8;
  line-height: 2.5;
  margin: 6px 0;
  text-align: center;
  transition: all 0.3s;
  width: 100%;
}

.lyric-line.active {
  font-size: 18px;
  color: #409eff;
  font-weight: 500;
}

.no-song-text {
  font-size: 16px;
  color: #94a3b8;
  text-align: center;
}

.no-lyric-text {
  font-size: 16px;
  color: #94a3b8;
  text-align: center;
}

.player-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-top: 1px solid #e2e8f0;
  height: 64px;
  cursor: pointer;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  transition: background 0.2s;
}

.player-bar:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.player-left {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 260px;
}

.cover-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  background: #f1f5f9;
}

.player-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.player-artist {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 40px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.control-icon {
  font-size: 18px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 50%;
}

.control-icon:hover {
  color: #409eff;
  background: #f0f9ff;
}

.like-icon {
  font-size: 26px;
  margin-top: 3px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-icon:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.like-icon.liked {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.mode-icon {
  margin-top: 5px;
}

.mode-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0.5);
  transition: all 0.2s;
}

.mode-icon:hover .mode-icon-img {
  filter: brightness(0.8);
}

.mode-icon-img.active {
  filter: brightness(1);
  color: #409eff;
}

.comment-icon {
  margin-top: 4px;
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 25%;
}

.volume-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0.6);
  transition: all 0.2s;
}

.volume-icon:hover .volume-icon-img {
  filter: brightness(1);
}

.play-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(125, 211, 252, 0.4);
  transition: all 0.2s;
  cursor: pointer;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(125, 211, 252, 0.5);
}

.play-icon {
  font-size: 18px;
  font-weight: bold;
  margin-left: 2px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: #94a3b8;
  width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  padding: 8px 0;
  margin: -8px 0;
}

.progress-bar-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  transform: translateY(-50%);
  transition: background 0.2s;
}

.progress-bar:hover .progress-bar-bg {
  background: #cbd5e1;
}

.progress-bar.dragging .progress-bar-bg {
  background: #cbd5e1;
}

.progress-bar.dragging .progress-fill {
  background: linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%);
}

.progress-bar.dragging .progress-dot {
  width: 16px;
  height: 16px;
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
}

.progress-fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #409eff 0%, #60a5fa 100%);
  border-radius: 2px;
  transition: width 0.1s;
  transform: translateY(-50%);
}

.progress-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  transition: left 0.1s, width 0.1s, height 0.1s, box-shadow 0.1s;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.player-right {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 180px;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.volume-icon {
  font-size: 16px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  cursor: pointer;
}

.list-icon {
  font-size: 16px;
}
</style>