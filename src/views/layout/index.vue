<template>
  <div class="home-container">
    <aside class="sidebar">
      <UserProfile @logout="handleLogout" />

      <router-link to="/home" class="nav-link">
        <div class="nav-item" :class="{ active: $route.path === '/home' }">
          <House class="nav-icon" />
          <span class="nav-text">首页</span>
        </div>
      </router-link>

      <router-link to="/rank" class="nav-link">
        <div class="nav-item" :class="{ active: $route.path === '/rank' }">
          <TrendCharts class="nav-icon" />
          <span class="nav-text">排行榜</span>
        </div>
      </router-link>

      <router-link to="/room" class="nav-link">
        <div class="nav-item" :class="{ active: $route.path === '/room' }">
          <Headset class="nav-icon" />
          <span class="nav-text">在线歌间</span>
        </div>
      </router-link>

      <div class="my-section">
        <span class="my-label">我的</span>
      </div>

      <nav class="nav-menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.key"
          :to="`/${item.key}`"
          class="nav-link"
        >
          <div class="nav-item" :class="{ active: $route.path === `/${item.key}` }">
            <component :is="iconMap[item.icon]" class="nav-icon" />
            <span class="nav-text">{{ item.label }}</span>
            <span v-if="item.count" class="nav-count">{{ item.count }}</span>
          </div>
        </router-link>
      </nav>

      <div class="divider"></div>

      <PlaylistList />
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索歌曲、歌手、专辑"
            size="default"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </header>

      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, TrendCharts, Headset, Star, Clock, User, Search } from '@element-plus/icons-vue'
import UserProfile from './components/UserProfile.vue'
import PlaylistList from './components/PlaylistList.vue'

const router = useRouter()
const route = useRoute()

const iconMap = {
  Heart: Star,
  Clock,
  User
}

const searchKeyword = ref('')

const menuItems = ref([
  { key: 'favorite', label: '喜欢', icon: 'Heart' },
  { key: 'recent', label: '最近播放', icon: 'Clock' },
  { key: 'user', label: '个人中心', icon: 'User' },
])

onMounted(() => {
})

onUnmounted(() => {
})

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/search', query: { q: keyword } })
  }
}

watch(
  () => route.query.q,
  (q) => {
    if (route.path === '/search' && typeof q === 'string') {
      searchKeyword.value = q
    }
  },
  { immediate: true }
)

const handleLogout = () => {
  searchKeyword.value = ''
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  user-select: none;
  -webkit-user-select: none;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-link {
  text-decoration: none;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  margin: 2px 0;
}

.nav-item:hover {
  background: #f5f7fa;
  border-radius: 4px;
}

.nav-item.active {
  background: #e8f0fe;
  color: #409eff;
  border-radius: 4px;
}

.nav-icon {
  margin-right: 12px;
  font-size: 16px;
  color: #909399;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item.active .nav-icon {
  color: #409eff;
}

.nav-text {
  flex: 1;
}

.nav-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.my-section {
  padding: 12px 20px 8px;
}

.my-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-menu {
  padding: 4px 0;
}

.divider {
  height: 8px;
  background: linear-gradient(to bottom, #f5f7fa, #fff);
  margin: 8px 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 60px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-box .el-input {
  background: #f5f7fa;
  border-radius: 20px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
