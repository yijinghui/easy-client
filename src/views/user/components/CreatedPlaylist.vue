<template>
  <div v-if="loading" class="loading-state">加载中...</div>
  <div v-else-if="playlists.length === 0" class="empty-state">
    <span>暂无创建的歌单</span>
  </div>
  <div v-else class="created-playlists-grid">
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
      <div class="playlist-actions-card">
        <span class="action-btn" @click.stop="emit('edit-playlist', playlist.id)">编辑</span>
        <span class="action-btn delete" @click.stop="handleDeletePlaylist(playlist)">删除</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPlaylists, deletePlaylist } from '@/api/playlist'
import { getPlaylistCover } from '@/utils/asset'
import { getCurrentUserId } from '@/utils/auth'

const emit = defineEmits(['go-to-playlist', 'edit-playlist', 'delete-playlist'])

const playlists = ref([])
const loading = ref(false)

const fetchCreatedPlaylists = async () => {
  loading.value = true
  try {
    const userId = getCurrentUserId()
    if (!userId) return
    
    const res = await getUserPlaylists(userId)
    if (res.data) {
      playlists.value = res.data.map(playlist => ({
        id: playlist.playlistId,
        name: playlist.title || '',
        cover: getPlaylistCover(playlist.coverUrl),
        songCount: playlist.songCount || 0
      }))
    }
  } catch (error) {
    console.error('获取创建的歌单失败', error)
  } finally {
    loading.value = false
  }
}

const handleDeletePlaylist = async (playlist) => {
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
    playlists.value = playlists.value.filter(p => p.id !== playlist.id)
    ElMessage.success('歌单删除成功')
    window.dispatchEvent(new CustomEvent('playlist-deleted'))
    emit('delete-playlist', playlist)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchCreatedPlaylists()
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

.created-playlists-grid {
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

.playlist-actions-card {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.action-btn {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #ecf5ff;
}

.action-btn.delete {
  color: #f56c6c;
}

.action-btn.delete:hover {
  background: #fef0f0;
}
</style>