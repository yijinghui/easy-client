<template>
  <div class="playlist-section">
    <div class="playlist-tabs">
      <span 
        class="tab-item" 
        :class="{ active: playlistTab === 'custom' }"
        @click="handleSwitchPlaylistTab('custom')"
      >
        自建歌单
      </span>
      <span class="tab-divider">|</span>
      <span 
        class="tab-item" 
        :class="{ active: playlistTab === 'favorite' }"
        @click="handleSwitchPlaylistTab('favorite')"
      >
        收藏歌单
      </span>
      <Plus class="tab-add" @click="handleCreatePlaylist" />
    </div>

    <div class="playlist-list">
      <div 
        v-for="playlist in currentPlaylists" 
        :key="playlist.id"
        class="playlist-item"
        @click="handlePlaylistClick(playlist.id)"
        @contextmenu.prevent="handleContextMenu($event, playlist)"
      >
        <img :src="playlist.cover" :alt="playlist.name" class="playlist-cover" />
        <span class="playlist-name">{{ playlist.name }}</span>
      </div>
      <div v-if="currentPlaylists.length === 0" class="playlist-empty">
        {{ playlistTab === 'custom' ? '暂无自建歌单' : '暂无收藏歌单' }}
      </div>
    </div>
  </div>

  <div v-if="showCreateModal" class="create-modal" @click="showCreateModal = false">
    <div class="create-modal-content" @click.stop>
      <div class="modal-header">
        <span class="modal-title">创建歌单</span>
        <span class="modal-close" @click="showCreateModal = false">×</span>
      </div>
      <div class="create-modal-body">
        <div class="create-input-group">
          <label class="create-label">歌单名称</label>
          <input 
            type="text" 
            v-model="playlistName" 
            class="create-input" 
            placeholder="请输入歌单名称"
            maxlength="50"
            @keyup.enter="handleSubmitCreate"
          />
        </div>
      </div>
      <div class="modal-footer">
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="creating">确定</el-button>
      </div>
    </div>
  </div>

  <div 
    v-if="contextMenu.show" 
    class="context-menu"
    :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    @click.stop
  >
    <div class="context-menu-item" @click="handleDeletePlaylist">
      删除
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/api/playlist'
import { getFavoritePlaylists } from '@/api/favorite'
import { getPlaylistCover } from '@/utils/asset'
import { getAuthToken } from '@/utils/auth'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const playlistTab = ref('custom')
const showCreateModal = ref(false)
const playlistName = ref('')
const creating = ref(false)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  playlist: null
})

const isLoggedIn = ref(false)
const customPlaylists = ref([])
const favoritePlaylists = ref([])

const currentPlaylists = computed(() => {
  return playlistTab.value === 'custom' ? customPlaylists.value : favoritePlaylists.value
})

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('playlist-deleted', handlePlaylistDeleted)
  window.addEventListener('playlist-cover-updated', handlePlaylistCoverUpdated)
})

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('playlist-deleted', handlePlaylistDeleted)
  window.removeEventListener('playlist-cover-updated', handlePlaylistCoverUpdated)
})

const handlePlaylistCoverUpdated = async () => {
  if (playlistTab.value === 'custom') {
    await fetchPlaylists()
  }
}

const handlePlaylistDeleted = async () => {
  await fetchPlaylists()
}

const checkLoginStatus = async () => {
  const token = getAuthToken()
  if (token) {
    isLoggedIn.value = true
    await fetchPlaylists()
    await fetchFavoritePlaylists()
  }
}

const fetchPlaylists = async () => {
  customPlaylists.value = []
  const cacheBuster = Date.now()
  try {
    const res = await getPlaylists({ _silent401: true })
    if (res.data) {
      customPlaylists.value = res.data
        .filter(p => !p.isFavorite)
        .map(p => {
          const coverUrl = getPlaylistCover(p.coverUrl, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(p.style || 'abstract')}&image_size=square`)
          return {
            id: p.playlistId,
            name: p.title,
            cover: coverUrl.includes('?') ? `${coverUrl}&_t=${cacheBuster}` : `${coverUrl}?_t=${cacheBuster}`
          }
        })
    }
  } catch (error) {
    console.error('获取歌单列表失败', error)
  }
}

const fetchFavoritePlaylists = async () => {
  favoritePlaylists.value = []
  try {
    const res = await getFavoritePlaylists({ pageNum: 1, pageSize: 50 }, { _silent401: true })
    if (res.data && res.data.items) {
      favoritePlaylists.value = res.data.items.map(p => ({
        id: p.playlistId,
        name: p.title,
        cover: getPlaylistCover(p.coverUrl, `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(p.style || 'abstract')}&image_size=square`)
      }))
    }
  } catch (error) {
    console.error('获取收藏歌单列表失败', error)
  }
}

const handlePlaylistClick = (id) => {
  router.push(`/playlist/${id}`)
}

const handleSwitchPlaylistTab = async (tab) => {
  playlistTab.value = tab
  if (tab === 'custom') {
    await fetchPlaylists()
  } else {
    await fetchFavoritePlaylists()
  }
}

const handleCreatePlaylist = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('登录后享受更多体验哦~')
    router.push('/login')
    return
  }
  playlistName.value = ''
  showCreateModal.value = true
}

const handleContextMenu = (event, playlist) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    playlist
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const handleDeletePlaylist = async () => {
  const playlist = contextMenu.value.playlist
  if (!playlist) return

  closeContextMenu()

  try {
    await ElMessageBox.confirm(
      `确定要删除歌单「${playlist.name}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePlaylist(playlist.id)
    ElMessage.success('歌单删除成功')
    
    if (playlistTab.value === 'custom') {
      await fetchPlaylists()
    } else {
      await fetchFavoritePlaylists()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmitCreate = async () => {
  if (!playlistName.value.trim()) {
    ElMessage.warning('请输入歌单名称')
    return
  }

  creating.value = true
  try {
    await createPlaylist({
      title: playlistName.value.trim(),
      introduction: '',
      style: '其他',
      coverUrl: ''
    })
    ElMessage.success('歌单创建成功')
    showCreateModal.value = false
    playlistName.value = ''
    await fetchPlaylists()
  } catch (error) {
    ElMessage.error('歌单创建失败')
  } finally {
    creating.value = false
  }
}

defineExpose({
  fetchPlaylists,
  fetchFavoritePlaylists
})
</script>

<style scoped>
.playlist-section {
  padding: 8px 0;
}

.playlist-tabs {
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  margin-bottom: 8px;
}

.tab-item {
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 0;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-divider {
  color: #d9d9d9;
}

.tab-add {
  margin-left: auto;
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tab-add:hover {
  color: #409eff;
}

.playlist-list {
  padding: 0 12px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  border-radius: 4px;
}

.playlist-item:hover {
  background: #f5f7fa;
}

.playlist-cover {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 10px;
  object-fit: cover;
}

.playlist-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modal-close {
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: #606266;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.create-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.create-modal-content {
  background: #fff;
  border-radius: 4px;
  width: 360px;
  max-width: 90%;
  overflow: hidden;
}

.create-modal-body {
  padding: 24px;
}

.create-input-group {
  display: flex;
  flex-direction: column;
}

.create-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.create-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  box-sizing: border-box;
}

.create-input:focus {
  outline: none;
  border-color: #409eff;
}

.create-input::placeholder {
  color: #c0c4cc;
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 3000;
  min-width: 100px;
}

.context-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu-item:hover {
  background: #ecf5ff;
  color: #409eff;
}
</style>
