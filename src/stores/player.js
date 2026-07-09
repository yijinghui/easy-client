import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSongAudio, getSongCover } from '@/utils/asset'
import { listenSong } from '@/api/song'

const stripHighlightTag = (value) => String(value ?? '').replace(/<\/?em>/gi, '')

const normalizeSong = (song = {}, fallbackId) => {
  const id = song.id ?? song.songId ?? song.musicId ?? fallbackId
  const rawCover = song.cover ?? song.coverUrl
  const rawUrl = song.url ?? song.audioUrl

  return {
    ...song,
    id,
    name: stripHighlightTag(song.name ?? song.songName),
    artist: stripHighlightTag(song.artist ?? song.artistName),
    album: String(song.album ?? ''),
    cover: getSongCover(rawCover, id ? `https://picsum.photos/100/100?random=${id}` : ''),
    url: getSongAudio(rawUrl),
    duration: Number.parseFloat(song.duration) || 0,
    isFavorite: song.isFavorite ?? song.isLiked ?? song.isLike ?? false,
    isLiked: song.isLiked ?? song.isFavorite ?? song.isLike ?? false,
    isLike: song.isLike ?? song.isFavorite ?? song.isLiked ?? false,
    lyrics: song.lyrics ?? song.lyric ?? '',
    lyric: song.lyric ?? song.lyrics ?? '',
    lyricsHead: song.lyricsHead ?? '',
    lyricsTimestamps: song.lyricsTimestamps ?? song.nested ?? '',
    lyricsSegment: song.lyricsSegment ?? song.nested ?? ''
  }
}

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref({
    id: null,
    name: '',
    artist: '',
    album: '',
    cover: '',
    duration: 0,
    url: '',
    isFavorite: false,
    isLiked: false
  })
  
  const currentTime = ref(0)
  const isPlaying = ref(false)
  const volume = ref(30)
  const playlist = ref([])
  
  const favoriteSongIds = ref([])
  
  const currentIndex = ref(0)
  
  const playQueue = ref([])
  
  const playMode = ref('sequence')
  
  const progress = computed(() => {
    if (!currentSong.value.duration) return 0
    return (currentTime.value / currentSong.value.duration) * 100
  })
  
  const formattedCurrentTime = computed(() => {
    return formatTime(currentTime.value)
  })
  
  const formattedDuration = computed(() => {
    return formatTime(currentSong.value.duration)
  })
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  function play() {
    isPlaying.value = true
  }
  
  function pause() {
    isPlaying.value = false
  }
  
  function togglePlay() {
    isPlaying.value = !isPlaying.value
  }
  
  function setPlaylist(songs) {
    playlist.value = Array.isArray(songs) ? songs.map((song, index) => normalizeSong(song, `playlist-${index}`)) : []
  }
  
  async function next() {
    if (!playlist.value.length) return

    if (playQueue.value.length > 0) {
      const queuedSong = playQueue.value.shift()
      playlist.value.splice(currentIndex.value + 1, 0, queuedSong)
    }

    if (playMode.value === 'shuffle') {
      if (playlist.value.length === 1) {
        currentTime.value = 0
        return
      }
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * playlist.value.length)
      } while (randomIndex === currentIndex.value)
      currentIndex.value = randomIndex
    } else {
      currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    }

    currentSong.value = normalizeSong(playlist.value[currentIndex.value])
    currentTime.value = 0

    if (currentSong.value.id) {
      try {
        await listenSong(currentSong.value.id)
      } catch (error) {
        console.error('记录播放记录失败', error)
      }
    }
  }
  
  async function prev() {
    if (!playlist.value.length) return

    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    currentSong.value = normalizeSong(playlist.value[currentIndex.value])
    currentTime.value = 0

    if (currentSong.value.id) {
      try {
        await listenSong(currentSong.value.id)
      } catch (error) {
        console.error('记录播放记录失败', error)
      }
    }
  }
  
  function setVolume(val) {
    volume.value = Math.max(0, Math.min(100, val))
  }
  
  function seek(time) {
    currentTime.value = time
  }
  
  async function playSong(index, playListId) {
    if (!playlist.value.length || index < 0 || index >= playlist.value.length) return

    const song = normalizeSong(playlist.value[index])
    if (!song.id) return

    playlist.value[index] = song
    currentIndex.value = index

    if (playQueue.value.length > 0) {
      playlist.value.splice(index + 1, 0, ...playQueue.value)
      playQueue.value = []
    }

    currentSong.value = song
    currentTime.value = 0
    isPlaying.value = false
    setTimeout(() => {
      isPlaying.value = true
    }, 0)

    try {
      await listenSong(song.id, playListId)
    } catch (error) {
      console.error('记录播放记录失败', error)
    }
  }
  
  function setFavoriteSongIds(ids) {
    favoriteSongIds.value = ids
  }
  
  function addFavoriteSongId(songId) {
    if (!favoriteSongIds.value.includes(songId)) {
      favoriteSongIds.value.push(songId)
    }
  }
  
  function removeFavoriteSongId(songId) {
    const index = favoriteSongIds.value.indexOf(songId)
    if (index !== -1) {
      favoriteSongIds.value.splice(index, 1)
    }
  }
  
  function isSongFavorite(songId) {
    return favoriteSongIds.value.includes(songId)
  }
  
  function addToPlayQueue(song) {
    const normalizedSong = normalizeSong(song)
    const songId = normalizedSong.id

    if (playlist.value.length === 0) {
      playlist.value = [normalizedSong]
      playSong(0)
      return
    }

    const playlistIndex = playlist.value.findIndex(s => s.id === songId)
    if (playlistIndex !== -1) {
      if (playlistIndex <= currentIndex.value) {
        playlist.value.splice(playlistIndex, 1)
        playQueue.value.push(normalizedSong)
      } else {
        playlist.value.splice(playlistIndex, 1)
        playlist.value.splice(currentIndex.value + 1, 0, normalizedSong)
      }
      return
    }

    const queueIndex = playQueue.value.findIndex(s => s.id === songId)
    if (queueIndex !== -1) {
      playQueue.value.splice(queueIndex, 1)
      playQueue.value.push(normalizedSong)
      return
    }

    playQueue.value.push(normalizedSong)
  }
  
  function clearPlayQueue() {
    playQueue.value = []
  }
  
  function togglePlayMode() {
    const modes = ['sequence', 'shuffle', 'single']
    const currentIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentIndex + 1) % modes.length]
  }
  
  function shuffleArray(array) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  
  return {
    currentSong,
    currentTime,
    isPlaying,
    volume,
    playlist,
    currentIndex,
    favoriteSongIds,
    playQueue,
    playMode,
    progress,
    formattedCurrentTime,
    formattedDuration,
    play,
    pause,
    togglePlay,
    setPlaylist,
    next,
    prev,
    setVolume,
    seek,
    playSong,
    setFavoriteSongIds,
    addFavoriteSongId,
    removeFavoriteSongId,
    isSongFavorite,
    addToPlayQueue,
    clearPlayQueue,
    togglePlayMode,
    shuffleArray
  }
})
