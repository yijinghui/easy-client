<template>
  <div class="page-content">
    <div class="search-tabs">
      <span 
        class="tab-item" 
        :class="{ active: currentTab === 'song' }"
        @click="switchTab('song')"
      >
        歌曲
      </span>
      <span 
        class="tab-item" 
        :class="{ active: currentTab === 'playlist' }"
        @click="switchTab('playlist')"
      >
        歌单
      </span>
      <span 
        class="tab-item" 
        :class="{ active: currentTab === 'artist' }"
        @click="switchTab('artist')"
      >
        歌手
      </span>
      <span 
        class="tab-item" 
        :class="{ active: currentTab === 'user' }"
        @click="switchTab('user')"
      >
        用户
      </span>
    </div>

    <div v-if="!keyword" class="empty-state">
      <span>请输入关键词搜索</span>
    </div>

    <template v-else>
      <SearchSong 
        v-if="currentTab === 'song'" 
        ref="songRef"
        :keyword="keyword"
        :is-logged-in="isLoggedIn"
      />
      <SearchPlaylist 
        v-else-if="currentTab === 'playlist'" 
        ref="playlistRef"
        :keyword="keyword"
      />
      <SearchArtist 
        v-else-if="currentTab === 'artist'" 
        ref="artistRef"
        :keyword="keyword"
      />
      <SearchUser 
        v-else-if="currentTab === 'user'" 
        ref="userRef"
        :keyword="keyword"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import SearchSong from './components/SongList.vue'
import SearchPlaylist from './components/PlaylistList.vue'
import SearchArtist from './components/ArtisList.vue'
import SearchUser from './components/UserList.vue'

const route = useRoute()

const currentTab = ref('song')
const keyword = ref('')
const isLoggedIn = ref(false)

const songRef = ref(null)
const playlistRef = ref(null)
const artistRef = ref(null)
const userRef = ref(null)

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

const switchTab = async (tab) => {
  currentTab.value = tab
  await nextTick()
  const refs = {
    song: songRef,
    playlist: playlistRef,
    artist: artistRef,
    user: userRef
  }
  const currentRef = refs[tab]
  currentRef?.value?.load(1)
}

watch(
  () => route.query.q,
  async () => {
    const text = (route.query.q || route.query.text || '').trim()
    keyword.value = text
    
    await nextTick()
    songRef.value?.reset()
    playlistRef.value?.reset()
    artistRef.value?.reset()
    userRef.value?.reset()
    
    if (text) {
      songRef.value?.load(1)
      playlistRef.value?.load(1)
      artistRef.value?.load(1)
      userRef.value?.load(1)
    }
  }
)

onMounted(async () => {
  checkLoginStatus()
  const text = (route.query.q || route.query.text || '').trim()
  keyword.value = text
  if (text) {
    await nextTick()
    songRef.value?.load(1)
  }
})
</script>

<style scoped>
.page-content h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 8px 0;
}

.search-tabs {
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.tab-item {
  padding: 12px 24px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

.tab-count {
  margin-left: 4px;
  font-size: 12px;
  color: #909399;
}

.tab-item.active .tab-count {
  color: #409eff;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

:deep(.search-list) {
  overflow: visible;
}
</style>