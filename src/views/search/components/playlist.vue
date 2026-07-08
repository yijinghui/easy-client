<template>
  <div class="playlist-list">
    <div v-if="loading" class="empty-state">
      <span>搜索中...</span>
    </div>
    <template v-else>
      <div class="playlist-grid">
        <div 
          v-for="playlist in results" 
          :key="playlist.id" 
          class="playlist-card"
          @click="handleClick(playlist)"
        >
          <div class="playlist-cover">
            <img :src="playlist.cover" :alt="playlist.name" />
          </div>
          <div class="playlist-info">
            <h4 class="playlist-name">{{ playlist.name }}</h4>
            <p class="playlist-count">播放 {{ playlist.playCount }} · 收藏 {{ playlist.likeCount }}</p>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="empty-state">
        <span>未找到相关歌单</span>
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElPagination } from 'element-plus'
import { useRouter } from 'vue-router'
import { searchPlaylists } from '@/api/playlist'
import { resolveFileUrl } from '@/utils/asset'

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['loaded'])

const router = useRouter()

const loading = ref(false)
const results = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const mapPlaylist = (playlist) => ({
  id: playlist.id || playlist.playlistId,
  name: playlist.title,
  cover: resolveFileUrl(playlist.coverUrl) || `https://picsum.photos/150/150?random=${playlist.id || Math.random()}`,
  playCount: playlist.playCount || 0,
  likeCount: playlist.likeCount || 0
})

const fetchPlaylists = async (pageNum = 1) => {
  const text = props.keyword
  if (!text) return

  loading.value = true
  try {
    const res = await searchPlaylists(text, pageNum, pageSize.value)
    if (res.data && Array.isArray(res.data.items)) {
      if (pageNum === 1) {
        results.value = res.data.items.map(mapPlaylist)
      } else {
        results.value = [...results.value, ...res.data.items.map(mapPlaylist)]
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
    console.error('搜索歌单失败', error)
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
  fetchPlaylists(pageNum)
}

const handleClick = (playlist) => {
  router.push(`/playlist/${playlist.id}`)
}

const reset = () => {
  results.value = []
  total.value = 0
  page.value = 1
}

const load = (pageNum = 1) => {
  page.value = pageNum
  fetchPlaylists(pageNum)
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
.playlist-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  padding: 0 4px;
}

.playlist-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-count {
  font-size: 12px;
  color: #909399;
  margin: 0;
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
</style>