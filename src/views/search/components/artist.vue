<template>
  <div class="artist-list">
    <div v-if="loading" class="empty-state">
      <span>搜索中...</span>
    </div>
    <template v-else>
      <div class="artist-grid">
        <div 
          v-for="artist in results" 
          :key="artist.id" 
          class="artist-card"
          @click="handleClick(artist)"
        >
          <div class="artist-avatar">
            <img :src="artist.avatar" :alt="artist.name" />
          </div>
          <div class="artist-info">
            <h4 class="artist-name">{{ artist.name }}</h4>
            <p class="artist-count">{{ artist.songCount }} 首歌曲</p>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="empty-state">
        <span>未找到相关歌手</span>
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
import { searchArtists } from '@/api/artist'
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

const mapArtist = (artist) => ({
  id: artist.id || artist.artistId,
  name: artist.name || artist.artistName,
  avatar: resolveFileUrl(artist.avatar) || `https://picsum.photos/100/100?random=${artist.id || Math.random()}`,
  songCount: artist.songCount || 0
})

const fetchArtists = async (pageNum = 1) => {
  const text = props.keyword
  if (!text) return

  loading.value = true
  try {
    const res = await searchArtists(text, pageNum, pageSize.value)
    if (res.data && Array.isArray(res.data.items)) {
      if (pageNum === 1) {
        results.value = res.data.items.map(mapArtist)
      } else {
        results.value = [...results.value, ...res.data.items.map(mapArtist)]
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
    console.error('搜索歌手失败', error)
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
  fetchArtists(pageNum)
}

const handleClick = (artist) => {
  router.push({ path: '/search', query: { q: artist.name } })
}

const reset = () => {
  results.value = []
  total.value = 0
  page.value = 1
}

const load = (pageNum = 1) => {
  page.value = pageNum
  fetchArtists(pageNum)
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
.artist-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.artist-card {
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
}

.artist-card:hover {
  transform: translateY(-4px);
}

.artist-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info {
  padding: 0 4px;
}

.artist-name {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-count {
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