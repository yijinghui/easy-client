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
  const playlist = ref([
    { id: 1, name: '夜曲', artist: '周杰伦', album: '十一月的萧邦', cover: 'https://picsum.photos/100/100?random=1', duration: 245, isLiked: false },
    { id: 2, name: '晴天', artist: '周杰伦', album: '叶惠美', cover: 'https://picsum.photos/100/100?random=2', duration: 269, isLiked: false },
    { id: 3, name: '稻香', artist: '周杰伦', album: '魔杰座', cover: 'https://picsum.photos/100/100?random=3', duration: 223, isLiked: false },
    { id: 4, name: '七里香', artist: '周杰伦', album: '七里香', cover: 'https://picsum.photos/100/100?random=4', duration: 299, isLiked: false },
    { id: 5, name: '简单爱', artist: '周杰伦', album: '范特西', cover: 'https://picsum.photos/100/100?random=5', duration: 270, isLiked: false }
  ])
  
  const favoriteSongIds = ref([])
  
  const currentIndex = ref(0)
  
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
  
  function next() {
    if (!playlist.value.length) return

    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    currentSong.value = normalizeSong(playlist.value[currentIndex.value])
    currentTime.value = 0
  }
  
  function prev() {
    if (!playlist.value.length) return

    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    currentSong.value = normalizeSong(playlist.value[currentIndex.value])
    currentTime.value = 0
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
  
  return {
    currentSong,
    currentTime,
    isPlaying,
    volume,
    playlist,
    currentIndex,
    favoriteSongIds,
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
    isSongFavorite
  }
})
