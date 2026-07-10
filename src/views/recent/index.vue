<template>
  <div class="page-content">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else>
      <h2>最近播放</h2>
      <div v-if="!isLoggedIn" class="empty-state">
        <span>登录后查看最近播放列表</span>
      </div>
      <SongList 
        v-else
        :songs="recentSongs" 
        :show-delete="true"
        @delete="handleDeleteRecord"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPlayRecords, deletePlayRecord } from '@/api/record'
import { getSongAudio, getSongCover } from '@/utils/asset'
import SongList from '@/components/song/SongList.vue'

const recentSongs = ref([])
const isLoggedIn = ref(false)
const loading = ref(false)

onMounted(() => {
  checkLoginStatus()
  fetchRecentSongs()
})

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

const fetchRecentSongs = async () => {
  if (!isLoggedIn.value) return
  if (loading.value) return

  loading.value = true

  try {
    const res = await getPlayRecords({ pageNum: 1, pageSize: 1000 })
    if (res.data && Array.isArray(res.data)) {
      recentSongs.value = res.data.map(song => ({
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
    }
  } catch (error) {
    console.error('获取播放记录失败', error)
    recentSongs.value = []
  } finally {
    loading.value = false
  }
}

const handleDeleteRecord = async ({ song }) => {
  try {
    await deletePlayRecord(song.id)
    recentSongs.value = recentSongs.value.filter(s => s.id !== song.id)
    ElMessage.success('已删除播放记录')
  } catch (error) {
    console.error('删除播放记录失败', error)
    ElMessage.error('操作失败')
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

.loading-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
