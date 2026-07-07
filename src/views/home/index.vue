<template>
  <div class="home-page">
    <Banner />
    <Recommend :recommendSongs="recommendSongs" :isLoggedIn="isLoggedIn" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Banner from '@/views/home/components/Banner.vue'
import Recommend from '@/views/home/components/Recommend.vue'
import { getRecommendedSongs } from '@/api/song'
import { getSongAudio, getSongCover } from '@/utils/asset'

const recommendSongs = ref([])
const isLoggedIn = ref(false)

onMounted(() => {
  fetchRecommendSongs()
  checkLoginStatus()
})

// 获取推荐歌曲
const fetchRecommendSongs = async () => {
  try {
    const res = await getRecommendedSongs()
    const items = res.data?.items || res.data
    if (items && Array.isArray(items)) {
      recommendSongs.value = items.map(song => ({
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        album: song.album,
        cover: getSongCover(song.coverUrl),
        url: getSongAudio(song.audioUrl),
        duration: parseFloat(song.duration) || 0,
        isFavorite: song.isFavorite ?? false,
        lyrics: song.lyrics || '',
        lyricsHead: song.lyricsHead || '',
        lyricsTimestamps: song.nested || ''
      }))
    }
  } catch (error) {
    console.error('获取推荐歌曲失败', error)
    recommendSongs.value = []
  }
}

// 检查是否登录
const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}
</script>

<style scoped>
.home-page {
  width: 100%;
}
</style>