<template>
  <div v-if="loading" class="loading-state">加载中...</div>
  <div v-else-if="playlists.length === 0" class="empty-state">
    <span>暂无收藏歌单</span>
  </div>
  <div v-else class="favorite-playlists-grid">
    <div 
      v-for="playlist in playlists" 
      :key="playlist.id" 
      class="playlist-card"
      @click="emit('go-to-playlist', playlist.id)"
    >
      <div class="playlist-cover">
        <img :src="playlist.cover" :alt="playlist.name" />
      </div>
      <div class="playlist-info">
        <h4 class="playlist-name">{{ playlist.name }}</h4>
        <p class="playlist-meta">{{ playlist.songCount }} 首歌曲</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getFavoritePlaylists, getFavoritePlaylistsByUserId } from '@/api/favorite'
import { getPlaylistCover } from '@/utils/asset'

const props = defineProps({
  userId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['go-to-playlist'])

const playlists = ref([])
const loading = ref(false)

const fetchFavoritePlaylists = async () => {
  loading.value = true
  try {
    let res
    if (props.userId) {
      res = await getFavoritePlaylistsByUserId(props.userId, { pageNum: 1, pageSize: 100 })
    } else {
      res = await getFavoritePlaylists({ pageNum: 1, pageSize: 100 })
    }
    if (res.data && res.data.items) {
      playlists.value = res.data.items.map(playlist => ({
        id: playlist.playlistId,
        name: playlist.title || playlist.name || '',
        cover: getPlaylistCover(playlist.coverUrl),
        songCount: playlist.songCount || 0
      }))
    }
  } catch (error) {
    console.error('获取收藏歌单失败', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.userId,
  () => {
    fetchFavoritePlaylists()
  }
)

onMounted(() => {
  fetchFavoritePlaylists()
})
</script>

<style scoped>
.loading-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.empty-state {
  padding: 90px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.favorite-playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  padding: 12px 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}
</style>