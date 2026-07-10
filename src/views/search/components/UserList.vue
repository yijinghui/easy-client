<template>
  <div class="user-list">
    <div v-if="loading" class="empty-state">
      <span>搜索中...</span>
    </div>
    <template v-else>
      <div class="user-grid">
        <div 
          v-for="user in results" 
          :key="user.id" 
          class="user-card"
          @click="handleClick(user)"
        >
          <div class="user-avatar">
            <img :src="user.avatar" :alt="user.nickname" />
          </div>
          <div class="user-info">
            <h4 class="user-nickname">{{ user.nickname }}</h4>
            <p class="user-count">{{ user.followerCount || 0 }} 粉丝</p>
          </div>
        </div>
      </div>

      <div v-if="results.length === 0" class="empty-state">
        <span>未找到相关用户</span>
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
import { searchUsers } from '@/api/user'
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

const mapUser = (user) => ({
  id: user.userId,
  nickname: user.username,
  avatar: resolveFileUrl(user.userAvatar) || `https://picsum.photos/48/48?random=${user.userId || Math.random()}`,
  followerCount: user.fansCount || 0
})

const fetchUsers = async (pageNum = 1) => {
  const text = props.keyword
  if (!text) return

  loading.value = true
  try {
    const res = await searchUsers(text, pageNum, pageSize.value)
    if (res.data && Array.isArray(res.data.items)) {
      results.value = res.data.items.map(mapUser)
      total.value = res.data.total ?? results.value.length
    } else {
      results.value = []
      total.value = 0
    }
    emit('loaded', results.value)
  } catch (error) {
    console.error('搜索用户失败', error)
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = (pageNum) => {
  page.value = pageNum
  fetchUsers(pageNum)
}

const handleClick = (user) => {
  router.push(`/user/${user.id}`)
}

const reset = () => {
  results.value = []
  total.value = 0
  page.value = 1
}

const load = (pageNum = 1) => {
  page.value = pageNum
  fetchUsers(pageNum)
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
.user-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card:hover {
  background: #f0f9ff;
  transform: translateX(4px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.user-count {
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