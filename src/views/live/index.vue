<template>
  <div class="live-room-page">
    <audio
      ref="audioRef"
      :src="currentSong?.url || ''"
      @timeupdate="handleAudioTimeUpdate"
      @loadedmetadata="handleAudioLoadedMetadata"
      @ended="handleAudioEnded"
      @error="handleAudioError"
    ></audio>

    <header class="room-header">
      <div class="room-meta">
        <button class="back-btn" @click="confirmLeave">退出歌房</button>
        <div>
          <div class="room-title-row">
            <h1>{{ roomName }}</h1>
            <span v-if="isOwner" class="owner-tag">房主</span>
          </div>
          <p>房间号 {{ roomId }} · {{ onlineCount }}/{{ maxUsers }} 在线</p>
        </div>
      </div>
      <div class="connection-status" :class="connectionStatus">
        <span></span>
        {{ connectionText }}
      </div>
    </header>

    <main class="room-main">
      <section class="stage-panel" :class="{ playing: currentSong }">
        <div class="album-disc">
          <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong.name" class="stage-cover" />
          <div v-else class="disc-ring">
            <div class="disc-core">LIVE</div>
          </div>
        </div>
        <div class="song-info">
          <span class="eyebrow">{{ currentSong ? '正在播放' : '当前歌房' }}</span>
          <h2>{{ currentSong?.name || roomName }}</h2>
          <p v-if="currentSong">{{ currentSong.artist || '未知歌手' }} · {{ currentSong.album || '未知专辑' }}</p>
          <p v-else>暂无播放歌曲，房主可搜索歌曲加入待播列表后开始播放。</p>
        </div>
        <div class="progress-row">
          <span>{{ formatDuration(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="songDuration || 0"
            step="1"
            :value="currentTime"
            :disabled="!currentSong || !isOwner"
            @input="handleProgressInput"
            @change="handleProgressChange"
          />
          <span>{{ formatDuration(songDuration) }}</span>
        </div>
        <div v-if="isOwner" class="control-bar">
          <button class="play-btn" :disabled="!isOwner || !canStartPlayback" @click="handleStartOrToggle">
            {{ currentSong ? (isPlaying ? '暂停播放' : '继续播放') : '开始播放' }}
          </button>
          <button class="control-btn" :disabled="!isOwner || queueSongs.length === 0" @click="handleNextSong">下一首</button>
        </div>
      </section>

      <aside class="side-panel">
        <div class="panel-card host-card">
          <span class="panel-label">房主</span>
          <div class="host-profile">
            <div class="host-avatar">
              <img v-if="isOwner ? currentUserAvatar : hostAvatar" :src="isOwner ? currentUserAvatar : hostAvatar" :alt="isOwner ? '我的头像' : '房主头像'" />
              <span v-else>{{ hostInitial }}</span>
            </div>
            <div>
              <strong>{{ isOwner ? '我' : hostName }}</strong>
              <p>{{ isOwner ? '你正在主持这个歌房' : '尽情享受音乐吧~' }}</p>
            </div>
          </div>
        </div>

        <div v-if="isOwner" class="panel-card queue-card">
          <div class="panel-title">
            <span>待播列表</span>
            <em>{{ queueSongs.length }} 首</em>
          </div>

          <div class="song-search">
            <form class="song-search-form" @submit.prevent="handleSearchSongs">
              <input v-model.trim="searchKeyword" placeholder="搜索歌曲加入待播" />
              <button :disabled="searchLoading || !searchKeyword">搜索</button>
            </form>
            <div v-if="searchLoading" class="search-empty">搜索中...</div>
            <template v-else-if="searchResults.length">
              <div class="search-results-toolbar">
                <span>搜索结果 {{ searchResults.length }} 首</span>
              </div>
              <div class="search-results">
                <div v-for="song in searchResults" :key="song.id" class="search-result-item">
                  <img :src="song.cover" :alt="song.name" />
                  <div>
                    <strong>{{ song.name }}</strong>
                    <span>{{ song.artist || '未知歌手' }}</span>
                  </div>
                  <button @click="addSongToQueue(song)">加入</button>
                </div>
              </div>
            </template>
          </div>

          <div v-if="queueSongs.length" class="queue-list">
            <div v-for="(song, index) in queueSongs" :key="`${song.id}-${index}`" class="queue-item">
              <span class="queue-index">{{ index + 1 }}</span>
              <img :src="song.cover" :alt="song.name" />
              <div class="queue-info">
                <strong>{{ song.name }}</strong>
                <span>{{ song.artist || '未知歌手' }}</span>
              </div>
              <button v-if="isOwner" class="queue-remove" @click="removeQueueSong(index)">移除</button>
            </div>
          </div>
          <div v-else class="empty-box">暂无歌曲，房主可搜索歌曲加入待播列表</div>
        </div>

        <div class="panel-card chat-card">
          <div class="panel-title">
            <span>房间聊天</span>
            <em>{{ chatMessages.length }} 条消息</em>
          </div>
          <div ref="chatListRef" class="chat-list">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="chat-item"
              :class="[message.type, message.isMine ? 'mine' : 'other']"
            >
              <template v-if="message.type === 'system'">
                {{ message.content }}
              </template>
              <template v-else>
                <div class="chat-avatar">
                  <img v-if="message.avatar" :src="message.avatar" :alt="message.nickname || '用户头像'" />
                  <span v-else>{{ getAvatarText(message.nickname) }}</span>
                </div>
                <div class="chat-content">
                  <div class="chat-meta">
                    <span>{{ message.nickname || '房间用户' }}</span>
                    <time>{{ formatMessageTime(message.timestamp) }}</time>
                  </div>
                  <div class="chat-bubble">{{ message.content }}</div>
                </div>
              </template>
            </div>
          </div>
          <form class="chat-input" @submit.prevent="sendChatMessage">
            <input
              v-model.trim="chatContent"
              :disabled="connectionStatus !== 'connected'"
              maxlength="200"
              placeholder="和大家聊点什么..."
            />
            <button :disabled="!canSendChat">发送</button>
          </form>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuthToken, getCurrentUserId } from '@/utils/auth'
import { getSongAudio, getSongCover, getUserAvatar } from '@/utils/asset'
import { getUserInfo } from '@/api/user'
import { searchSongs } from '@/api/song'
import { getRoomChatMessages, getActiveRooms } from '@/api/room'

const route = useRoute()
const router = useRouter()

const roomId = computed(() => String(route.params.roomId || ''))
const roomName = computed(() => route.query.roomName || `歌房 ${roomId.value}`)
const maxUsers = computed(() => Number(route.query.maxUsers || 20))
const isOwner = ref(route.query.owner === '1')
const hostAvatar = computed(() => getUserAvatar(route.query.hostAvatar))
const hostName = computed(() => route.query.hostName || '房主')
const hostInitial = computed(() => String(roomName.value).slice(0, 1) || '房')
const onlineCount = ref(1)
const connectionStatus = ref('connecting')
const websocket = ref(null)
const leavingByUser = ref(false)
const unloadingPage = ref(false)
const chatContent = ref('')
const chatMessages = ref([])
const chatListRef = ref(null)
const currentUserAvatar = ref('')
const currentUserName = ref('')
const audioRef = ref(null)
const currentSong = ref(null)
const queueSongs = ref([])
const searchKeyword = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const songDuration = ref(0)
const seekingTime = ref(null)
const heartbeatTimer = ref(null)
const heartbeatTimeoutTimer = ref(null)
const reconnectTimer = ref(null)
const lastHeartbeatAt = ref(0)
const reconnecting = ref(false)
let reconnectAttempts = 0
let messageId = 0

const HEARTBEAT_INTERVAL = 3000
const HEARTBEAT_TIMEOUT = 9000
const MAX_PROGRESS_DRIFT_MS = 1500
const SOFT_PROGRESS_DRIFT_MS = 300

const connectionText = computed(() => {
  const textMap = {
    connecting: '连接中',
    connected: '已连接',
    closed: '已断开'
  }
  return textMap[connectionStatus.value] || '连接中'
})

const canSendChat = computed(() => connectionStatus.value === 'connected' && chatContent.value.length > 0)
const canStartPlayback = computed(() => !!currentSong.value || queueSongs.value.length > 0)

const wsUrl = computed(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const token = encodeURIComponent(getAuthToken())
  return `${protocol}//localhost:8080/ws/room?token=${token}`
})

const sendSocketMessage = (payload) => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(JSON.stringify(payload))
  }
}

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}

const addChatMessage = (message) => {
  const currentUserId = getCurrentUserId()
  const messageUserId = message.userId == null ? '' : String(message.userId)
  const isMine = message.action === 'chat' && currentUserId && messageUserId === currentUserId
  chatMessages.value.push({
    id: `${message.action || message.type}-${message.timestamp || Date.now()}-${message.userId || ''}-${messageId++}`,
    type: message.type || (message.action === 'chat' ? 'chat' : 'system'),
    action: message.action,
    userId: message.userId,
    nickname: message.nickname || message.userNickname,
    avatar: getUserAvatar(message.avatar, ''),
    content: message.content,
    timestamp: message.timestamp || Date.now(),
    isMine
  })
  scrollChatToBottom()
}

const addSystemMessage = (content, timestamp = Date.now()) => {
  addChatMessage({
    type: 'system',
    content,
    timestamp
  })
}

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAvatarText = (nickname) => String(nickname || '用').slice(0, 1)

const stripHighlightTag = (value) => String(value ?? '').replace(/<\/?em>/gi, '')

const normalizeSong = (song = {}) => {
  const id = song.id ?? song.songId ?? null
  const rawCover = song.cover ?? song.coverUrl ?? null
  const rawUrl = song.url ?? song.audioUrl ?? null

  return {
    ...song,
    id,
    name: stripHighlightTag(song.name ?? song.songName),
    artist: stripHighlightTag(song.artist ?? song.artistName),
    album: song.album || '',
    cover: getSongCover(rawCover, id ? `https://picsum.photos/100/100?random=${id}` : ''),
    url: getSongAudio(rawUrl),
    duration: Number.parseFloat(song.duration) || 0
  }
}

const parseSocketSong = (song) => {
  if (!song) return null
  try {
    return normalizeSong(typeof song === 'string' ? JSON.parse(song) : song)
  } catch (error) {
    console.error('解析同步歌曲失败', error)
    return null
  }
}

const formatDuration = (seconds) => {
  const value = Number(seconds) || 0
  const mins = Math.floor(value / 60)
  const secs = Math.floor(value % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const secondsToMilliseconds = (seconds) => Math.floor((Number(seconds) || 0) * 1000)
const millisecondsToSeconds = (milliseconds) => (Number(milliseconds) || 0) / 1000

const progressToSeconds = (progress) => {
  const value = Number(progress) || 0
  return value > 1000 ? value / 1000 : value
}

const getLocalProgressMs = () => secondsToMilliseconds(audioRef.value?.currentTime ?? currentTime.value)

const resetPlaybackRate = () => {
  if (audioRef.value) {
    audioRef.value.playbackRate = 1
  }
}

const adjustPlaybackByServerProgress = (serverProgress) => {
  if (!audioRef.value || !currentSong.value) return

  const targetSeconds = millisecondsToSeconds(serverProgress)
  const localMs = getLocalProgressMs()
  const serverMs = Number(serverProgress) || 0
  const driftMs = serverMs - localMs

  if (Math.abs(driftMs) >= MAX_PROGRESS_DRIFT_MS) {
    audioRef.value.currentTime = targetSeconds
    currentTime.value = targetSeconds
    resetPlaybackRate()
    if (isPlaying.value) {
      playAudio(targetSeconds)
    }
    return
  }

  if (!isPlaying.value || Math.abs(driftMs) <= SOFT_PROGRESS_DRIFT_MS) {
    resetPlaybackRate()
    return
  }

  audioRef.value.playbackRate = driftMs > 0 ? 1.05 : 0.95
  window.setTimeout(() => {
    resetPlaybackRate()
  }, HEARTBEAT_INTERVAL)
}

const handleSearchSongs = async () => {
  if (!isOwner.value) return
  const keyword = searchKeyword.value.trim()
  if (!keyword) return

  searchLoading.value = true
  try {
    const res = await searchSongs(keyword)
    const items = Array.isArray(res.data?.items) ? res.data.items : []
    searchResults.value = items.map(normalizeSong).filter(song => song.id && song.url)
    if (!searchResults.value.length) {
      ElMessage.info('未找到可播放歌曲')
    }
  } catch (error) {
    console.error('搜索歌曲失败', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const addSongToQueue = (song) => {
  if (!isOwner.value) return
  queueSongs.value.push(normalizeSong(song))
  searchResults.value = []
  ElMessage.success('已加入待播列表')
}

const removeQueueSong = (index) => {
  queueSongs.value.splice(index, 1)
}

const setCurrentSong = (song, progress = 0) => {
  currentSong.value = song ? normalizeSong(song) : null
  currentTime.value = progress
  songDuration.value = currentSong.value?.duration || 0
}

const playAudio = async (progress = currentTime.value) => {
  if (!audioRef.value || !currentSong.value?.url) return

  audioRef.value.currentTime = Math.max(0, Number(progress) || 0)
  try {
    await audioRef.value.play()
    isPlaying.value = true
  } catch (error) {
    isPlaying.value = false
    ElMessage.error('音频播放失败')
  }
}

const pauseAudio = () => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
  isPlaying.value = false
}

const resetPlayback = () => {
  pauseAudio()
  currentSong.value = null
  currentTime.value = 0
  songDuration.value = 0
  if (audioRef.value) {
    audioRef.value.removeAttribute('src')
    audioRef.value.load()
  }
}

const sendPlayMessage = (song, progress = 0) => {
  const normalizedSong = normalizeSong(song)
  sendSocketMessage({
    action: 'play',
    roomId: roomId.value,
    songId: normalizedSong.id,
    song: normalizedSong,
    progress: secondsToMilliseconds(progress)
  })
}

const sendPauseMessage = () => {
  if (!currentSong.value) return
  sendSocketMessage({
    action: 'pause',
    roomId: roomId.value,
    songId: currentSong.value.id,
    progress: secondsToMilliseconds(currentTime.value)
  })
}

const sendSeekMessage = (progress) => {
  if (!currentSong.value) return
  sendSocketMessage({
    action: 'seek',
    roomId: roomId.value,
    songId: currentSong.value.id,
    progress: secondsToMilliseconds(progress)
  })
}

const sendStopMessage = () => {
  sendSocketMessage({
    action: 'stop',
    songId: currentSong.value?.id,
    progress: secondsToMilliseconds(currentTime.value),
    roomId: roomId.value
  })
}

const playSongFromQueue = () => {
  const nextSong = queueSongs.value.shift()
  if (!nextSong) {
    resetPlayback()
    sendStopMessage()
    return
  }

  setCurrentSong(nextSong, 0)
  nextTick(() => {
    sendPlayMessage(nextSong, 0)
    playAudio(0)
  })
}

const handleStartOrToggle = () => {
  if (!isOwner.value) return
  if (!currentSong.value) {
    playSongFromQueue()
    return
  }
  handleTogglePlay()
}


const handleTogglePlay = () => {
  if (!isOwner.value || !currentSong.value) return
  if (isPlaying.value) {
    sendPauseMessage()
    pauseAudio()
  } else {
    sendPlayMessage(currentSong.value, currentTime.value)
    playAudio(currentTime.value)
  }
}

const handleNextSong = () => {
  if (!isOwner.value) return
  playSongFromQueue()
}

const handleProgressInput = (event) => {
  seekingTime.value = Number(event.target.value) || 0
  currentTime.value = seekingTime.value
}

const handleProgressChange = (event) => {
  if (!isOwner.value || !currentSong.value) return
  const progress = Number(event.target.value) || 0
  currentTime.value = progress
  if (audioRef.value) {
    audioRef.value.currentTime = progress
  }
  sendSeekMessage(progress)
  seekingTime.value = null
}

const handleAudioTimeUpdate = () => {
  if (!audioRef.value || seekingTime.value !== null) return
  currentTime.value = audioRef.value.currentTime || 0
}

const handleAudioLoadedMetadata = () => {
  if (!audioRef.value) return
  songDuration.value = currentSong.value?.duration || audioRef.value.duration || 0
}

const handleAudioEnded = () => {
  if (isOwner.value && queueSongs.value.length) {
    playSongFromQueue()
  } else {
    resetPlayback()
    if (isOwner.value) {
      sendStopMessage()
    }
  }
}

const handleAudioError = () => {
  if (currentSong.value) {
    ElMessage.error('音频加载失败')
  }
  pauseAudio()
}

const applySyncMessage = (message) => {
  const song = parseSocketSong(message.song)
  if (!song?.id) {
    resetPlayback()
    return
  }

  const baseProgress = progressToSeconds(message.progress)
  const startTime = Number(message.startTime) || Number(message.timestamp) || Date.now()
  const playStatus = String(message.playStatus ?? '0')
  const syncedProgress = playStatus === '1'
    ? baseProgress + Math.max(0, (Date.now() - startTime) / 1000)
    : baseProgress

  setCurrentSong(song, syncedProgress)
  nextTick(() => {
    if (playStatus === '1') {
      playAudio(syncedProgress)
    } else {
      if (audioRef.value) {
        audioRef.value.currentTime = syncedProgress
      }
      pauseAudio()
    }
  })
}

const handleRemotePlay = (message) => {
  const song = parseSocketSong(message.song)
  const progress = progressToSeconds(message.progress)
  if (song?.id) {
    setCurrentSong(song, progress)
  } else if (String(currentSong.value?.id || '') !== String(message.songId || '')) {
    return
  }
  playAudio(progress)
}

const handleRemotePause = (message) => {
  currentTime.value = progressToSeconds(message.progress)
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
  pauseAudio()
}

const handleRemoteSeek = (message) => {
  currentTime.value = progressToSeconds(message.progress)
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
  if (isPlaying.value) {
    playAudio(currentTime.value)
  }
}

const handleRemoteStop = () => {
  resetPlayback()
}

const sendChatMessage = () => {
  const content = chatContent.value.trim()
  if (!content || connectionStatus.value !== 'connected') return

  sendSocketMessage({
    action: 'chat',
    roomId: roomId.value,
    content
  })
  chatContent.value = ''
}

const clearTimer = (timerRef) => {
  if (timerRef.value) {
    window.clearTimeout(timerRef.value)
    window.clearInterval(timerRef.value)
    timerRef.value = null
  }
}

const stopHeartbeat = () => {
  clearTimer(heartbeatTimer)
  clearTimer(heartbeatTimeoutTimer)
}

const sendHeartbeat = () => {
  if (leavingByUser.value || connectionStatus.value !== 'connected') return

  sendSocketMessage({
    action: 'heartbeat',
    roomId: roomId.value,
    progress: getLocalProgressMs()
  })
}

const checkHeartbeatTimeout = () => {
  if (leavingByUser.value) return

  const elapsed = Date.now() - lastHeartbeatAt.value
  if (elapsed > HEARTBEAT_TIMEOUT) {
    ElMessage.warning('歌房连接无响应，正在重连...')
    reconnectRoom()
  }
}

const startHeartbeat = () => {
  stopHeartbeat()
  lastHeartbeatAt.value = Date.now()
  sendHeartbeat()
  heartbeatTimer.value = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  heartbeatTimeoutTimer.value = window.setInterval(checkHeartbeatTimeout, HEARTBEAT_INTERVAL)
}

const scheduleReconnect = () => {
  if (leavingByUser.value || reconnectTimer.value) return

  reconnecting.value = true
  reconnectAttempts += 1
  const delay = Math.min(1000 * reconnectAttempts, 5000)
  reconnectTimer.value = window.setTimeout(() => {
    reconnectTimer.value = null
    connectRoom()
  }, delay)
}

const reconnectRoom = () => {
  if (leavingByUser.value) return
  stopHeartbeat()
  closeSocket(false)
  scheduleReconnect()
}

const handleHeartbeatMessage = (message) => {
  lastHeartbeatAt.value = Date.now()
  if (message.status === 'normal' && message.serverProgress != null) {
    adjustPlaybackByServerProgress(message.serverProgress)
  }
}

const joinRoom = () => {
  sendSocketMessage({
    action: 'join',
    roomId: roomId.value,
  })
}

const leaveRoom = () => {
  sendSocketMessage({
    action: 'leave',
    roomId: roomId.value,
  })
}

const handleSocketMessage = (event) => {
  try {
    const message = JSON.parse(event.data)
    lastHeartbeatAt.value = Date.now()
    if (message.action === 'userJoin' || message.action === 'userLeave' || message.action === 'sync') {
      onlineCount.value = message.onlineCount || onlineCount.value
    }
    if (message.action === 'heartbeat') {
      handleHeartbeatMessage(message)
    }
    if (message.action === 'sync') {
      applySyncMessage(message)
    }
    if (message.action === 'play') {
      handleRemotePlay(message)
    }
    if (message.action === 'pause') {
      handleRemotePause(message)
    }
    if (message.action === 'seek') {
      handleRemoteSeek(message)
    }
    if (message.action === 'stop') {
      handleRemoteStop()
    }
    if (message.action === 'chat') {
      addChatMessage({
        ...message,
        type: 'chat'
      })
    }
    if (message.action === 'userJoin') {
      addSystemMessage(`${message.nickname || '有用户'} 加入了歌房`, message.timestamp)
    }
    if (message.action === 'userLeave') {
      addSystemMessage(`${message.userNickname || message.nickname || '有用户'} 离开了歌房`, message.timestamp)
    }
    if (message.action === 'roomClose') {
      addSystemMessage('房主已退出，歌房已关闭')
      ElMessage.info('歌房已关闭')
      closeSocket()
      router.replace('/room')
    }
    if (message.action === 'error') {
      ElMessage.error(message.message || '歌房连接异常')
    }
  } catch (error) {
    console.error('解析歌房消息失败', error)
  }
}

const fetchCurrentUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.data) {
      if (res.data.userAvatar) {
        currentUserAvatar.value = getUserAvatar(res.data.userAvatar)
      }
      if (res.data.username) {
        currentUserName.value = res.data.username
      }
    }
  } catch (error) {
    console.error('获取当前用户信息失败', error)
  }
}

const fetchChatHistory = async () => {
  try {
    const res = await getRoomChatMessages(roomId.value)
    const messages = Array.isArray(res.data) ? res.data : []
    messages.forEach(msg => {
      addChatMessage({
        type: 'chat',
        action: 'chat',
        userId: msg.userId,
        nickname: msg.nickname,
        avatar: msg.avatar,
        content: msg.content,
        timestamp: msg.createTime ? new Date(msg.createTime).getTime() : Date.now()
      })
    })
  } catch (error) {
    console.error('获取聊天历史记录失败', error)
  }
}

const checkIfOwner = async () => {
  try {
    const res = await getActiveRooms()
    const rooms = Array.isArray(res.data) ? res.data : []
    const room = rooms.find(r => String(r.roomId) === roomId.value)
    if (room && room.creatorId != null) {
      const currentUserId = getCurrentUserId()
      const creatorId = String(room.creatorId)
      if (currentUserId === creatorId) {
        isOwner.value = true
      }
    }
    if (isOwner.value) {
      fetchCurrentUserInfo()
    }
  } catch (error) {
    console.error('检查房主身份失败', error)
  }
}

const connectRoom = () => {
  const token = getAuthToken()
  if (!token) {
    router.replace('/login')
    return
  }

  connectionStatus.value = 'connecting'
  closeSocket(false)
  websocket.value = new WebSocket(wsUrl.value)
  websocket.value.onopen = () => {
    connectionStatus.value = 'connected'
    reconnecting.value = false
    reconnectAttempts = 0
    joinRoom()
    startHeartbeat()
  }
  websocket.value.onmessage = handleSocketMessage
  websocket.value.onerror = () => {
    if (!leavingByUser.value) {
      ElMessage.error('歌房连接失败')
    }
  }
  websocket.value.onclose = () => {
    stopHeartbeat()
    connectionStatus.value = 'closed'
    if (!leavingByUser.value) {
      ElMessage.warning('歌房连接已断开，正在重连...')
      scheduleReconnect()
    }
  }
}

const closeSocket = (markNormalClose = true) => {
  if (markNormalClose) {
    leavingByUser.value = true
  }
  stopHeartbeat()
  clearTimer(reconnectTimer)
  if (websocket.value) {
    const socket = websocket.value
    websocket.value = null
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    socket.close()
  }
}

const confirmLeave = async () => {
  const message = isOwner.value ? '你是房主，退出后歌房将关闭。确定退出吗？' : '确定退出歌房吗？'
  try {
    await ElMessageBox.confirm(message, '退出歌房', {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
    leavingByUser.value = true
    stopHeartbeat()
    leaveRoom()
    setTimeout(() => {
      closeSocket()
      router.replace('/room')
    }, 200)
  } catch (error) {
    leavingByUser.value = false
  }
}

const handlePageHide = () => {
  unloadingPage.value = true
  stopHeartbeat()
}

onMounted(async () => {
  window.addEventListener('pagehide', handlePageHide)
  await checkIfOwner()
  await fetchChatHistory()
  addSystemMessage(`欢迎来到 ${roomName.value}`)
  if (isOwner.value) {
    addSystemMessage('你已作为房主进入歌房')
  }
  connectRoom()
})

onBeforeUnmount(() => {
  window.removeEventListener('pagehide', handlePageHide)
  stopHeartbeat()
  clearTimer(reconnectTimer)
  if (!leavingByUser.value && !unloadingPage.value) {
    leavingByUser.value = true
    leaveRoom()
  }
  closeSocket()
})
</script>

<style scoped>
.live-room-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #303133;
  background: #f5f7fa;
}

.room-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  color: #606266;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.room-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-title-row h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.owner-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  background: #409eff;
  font-weight: 500;
}

.room-meta p {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  font-size: 13px;
}

.connection-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e6a23c;
}

.connection-status.connected span {
  background: #67c23a;
}

.connection-status.closed span {
  background: #f56c6c;
}

.room-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
  padding: 20px 24px;
}

.stage-panel,
.panel-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stage-panel {
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.album-disc {
  width: min(42vw, 320px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.stage-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.disc-ring {
  width: 72%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 12px solid rgba(255, 255, 255, 0.3);
  background: #fff;
}

.disc-core {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 14px;
}

.song-info {
  max-width: 600px;
  margin-top: 28px;
}

.eyebrow {
  color: #409eff;
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 500;
}

.song-info h2 {
  margin: 10px 0;
  font-size: 28px;
  color: #303133;
}

.song-info p {
  margin: 0;
  color: #909399;
  line-height: 1.6;
  font-size: 14px;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(560px, 100%);
  margin-top: 24px;
  color: #909399;
  font-size: 12px;
}

.progress-row input {
  flex: 1;
  accent-color: #409eff;
}

.control-tip {
  margin: 12px 0 0;
  color: #909399;
  font-size: 12px;
}

.control-btn,
.play-btn {
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.control-btn:disabled,
.play-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.control-btn {
  height: 36px;
  padding: 0 16px;
  color: #909399;
  background: #f5f7fa;
}

.play-btn {
  height: 44px;
  padding: 0 24px;
  color: #fff;
  background: #409eff;
  font-weight: 600;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 120px);
}

.panel-card {
  padding: 16px;
}

.panel-label,
.panel-title em {
  color: #909399;
  font-size: 12px;
  font-style: normal;
}

.host-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.host-avatar {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
}

.host-avatar,
.host-avatar span {
  display: grid;
  place-items: center;
}

.host-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.host-profile strong {
  display: block;
  margin-bottom: 2px;
  color: #303133;
  font-size: 14px;
}

.host-profile p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.empty-box {
  display: grid;
  place-items: center;
  min-height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
}

.queue-card {
  max-height: 360px;
  overflow-y: auto;
}

.song-search {
  margin-bottom: 12px;
}

.song-search-form {
  display: flex;
  gap: 8px;
}

.song-search-form input {
  flex: 1;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 10px;
  outline: none;
  font-size: 12px;
}

.song-search-form input:focus {
  border-color: #409eff;
}

.song-search-form button,
.search-result-item button,
.queue-remove {
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: #409eff;
  cursor: pointer;
  font-size: 12px;
}

.song-search-form button {
  width: 52px;
}

.song-search-form button:disabled {
  color: #909399;
  background: #f5f7fa;
  cursor: not-allowed;
}

.search-empty {
  padding: 12px 0;
  color: #909399;
  text-align: center;
  font-size: 12px;
}

.search-results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

.search-results-toolbar button {
  height: 24px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 999px;
  color: #606266;
  background: #f5f7fa;
  cursor: pointer;
  font-size: 12px;
}

.search-results,
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.search-result-item,
.queue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: #f8fafc;
}

.search-result-item img,
.queue-item img {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  object-fit: cover;
  flex: 0 0 auto;
}

.search-result-item div,
.queue-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.search-result-item strong,
.queue-info strong {
  color: #303133;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-item span,
.queue-info span,
.queue-index {
  color: #909399;
  font-size: 11px;
}

.search-result-item button {
  width: 44px;
  height: 28px;
}

.queue-remove {
  width: 44px;
  height: 26px;
  color: #f56c6c;
  background: #fef0f0;
}

.queue-index {
  width: 18px;
  text-align: center;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
}

.chat-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 92%;
  color: #606266;
  font-size: 13px;
}

.chat-item.mine {
  align-self: flex-start;
  flex-direction: row;
  justify-content: flex-start;
}

.chat-item.other {
  align-self: flex-end;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.chat-item.system {
  display: block;
  width: fit-content;
  max-width: 100%;
  padding: 4px 10px;
  border-radius: 999px;
  color: #909399;
  background: #f5f7fa;
  text-align: center;
  align-self: center;
  font-size: 12px;
}

.chat-avatar {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.chat-avatar,
.chat-avatar span {
  display: grid;
  place-items: center;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-content {
  min-width: 0;
}

.chat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
}

.chat-item.mine .chat-meta {
  justify-content: flex-start;
}

.chat-item.other .chat-meta {
  justify-content: flex-end;
}

.chat-meta time {
  font-size: 11px;
}

.chat-bubble {
  padding: 8px 10px;
  border-radius: 8px;
  color: #303133;
  background: #f5f7fa;
  line-height: 1.5;
  word-break: break-word;
}

.chat-item.mine .chat-bubble {
  color: #fff;
  background: #409eff;
}

.chat-input {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.chat-input input {
  flex: 1;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 12px;
  color: #606266;
  background: #fff;
  outline: none;
  font-size: 13px;
}

.chat-input input:disabled {
  color: #909399;
  background: #f5f7fa;
  cursor: not-allowed;
}

.chat-input input:focus {
  border-color: #409eff;
}

.chat-input button {
  width: 56px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: #409eff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-input button:disabled {
  color: #909399;
  background: #f5f7fa;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .room-header,
  .room-main {
    padding-left: 16px;
    padding-right: 16px;
  }

  .room-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .room-main {
    grid-template-columns: 1fr;
  }

  .stage-panel {
    min-height: auto;
  }
}
</style>