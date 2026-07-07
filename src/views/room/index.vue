<template>
  <div class="page-content">
    <h2>活跃歌房</h2>

    <div v-if="loading" class="empty-state">
      <span>加载中...</span>
    </div>

    <template v-else>
      <div v-if="!isLoggedIn" class="empty-state">
        <span>请登录后查看歌房列表</span>
        <el-button type="primary" @click="goLogin" class="login-btn">去登录</el-button>
      </div>
      <template v-else>
        <div class="card-grid">
          <div v-for="room in rooms" :key="room.roomId" class="room-card" @click="joinRoom(room)">
              <div class="card-cover">
                <img :src="room.cover" :alt="room.roomName" />
                <div class="online-badge">
                  <span class="online-dot"></span>
                  <span>{{ room.onlineCount }}/{{ room.maxUsers }}</span>
                </div>
              </div>
              <div class="card-info">
                <h4>{{ room.roomName }}</h4>
                <p>房主：{{ room.creatorName }}</p>
                <span class="create-time">{{ room.formattedTime }}</span>
              </div>
            </div>

          <div class="room-card create-card" @click="showCreateModal = true">
            <div class="create-cover">
              <span class="create-icon">+</span>
            </div>
            <div class="card-info">
              <h4>创建歌房</h4>
              <p>开启你的音乐聚会</p>
            </div>
          </div>
        </div>

        <div v-if="rooms.length === 0" class="empty-state">
          <span>暂无活跃歌房</span>
        </div>
      </template>
    </template>

    <el-dialog
      v-model="showCreateModal"
      title="创建歌房"
      :close-on-click-modal="false"
      width="400px"
      class="create-room-modal"
    >
      <div class="form-container">
        <div class="form-item">
          <label>歌房名称</label>
          <el-input
            v-model="form.roomName"
            placeholder="请输入歌房名称"
            maxlength="50"
            show-word-limit
          />
        </div>
        <div class="form-item">
          <label>最大人数</label>
          <el-input-number
            v-model="form.maxUsers"
            :min="1"
            :max="100"
            :step="1"
            placeholder="请输入最大人数"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreateRoom" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActiveRooms, createRoom } from '@/api/room'
import { getRoomCover } from '@/utils/asset'
import { getAuthToken } from '@/utils/auth'

const router = useRouter()

const rooms = ref([])
const loading = ref(false)
const isLoggedIn = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const form = ref({
  roomName: '',
  maxUsers: 20
})

const mapRoom = (room) => ({
  roomId: room.roomId,
  roomName: room.roomName || '',
  creatorId: room.creatorId,
  creatorName: room.creatorName || '',
  creatorAvatar: room.creatorAvatar || '',
  cover: getRoomCover(room.creatorAvatar),
  roomStatus: room.roomStatus || 0,
  maxUsers: room.maxUsers || 0,
  createTime: room.createTime || '',
  formattedTime: room.createTime ? room.createTime.replace('T', ' ').slice(0, 19) : '-',
  onlineCount: room.onlineCount || 0
})

const checkLoginStatus = () => {
  isLoggedIn.value = !!getAuthToken()
}

const fetchRooms = async () => {
  if (!isLoggedIn.value) return

  loading.value = true
  try {
    const res = await getActiveRooms()
    if (res.data && Array.isArray(res.data)) {
      rooms.value = res.data.map(mapRoom)
    } else {
      rooms.value = []
    }
  } catch (error) {
    console.error('获取歌房列表失败', error)
    rooms.value = []
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}

const joinRoom = (room) => {
  router.push({
    name: 'roomLive',
    params: { roomId: room.roomId },
    query: {
      owner: '0',
      roomName: room.roomName,
      maxUsers: room.maxUsers,
      hostAvatar: room.creatorAvatar,
      hostName: room.creatorName
    }
  })
}

const handleCreateRoom = async () => {
  if (!form.value.roomName.trim()) {
    ElMessage.warning('请输入歌房名称')
    return
  }
  if (!form.value.maxUsers || form.value.maxUsers < 1) {
    ElMessage.warning('请输入有效的最大人数')
    return
  }

  creating.value = true
  try {
    const roomName = form.value.roomName.trim()
    const maxUsers = form.value.maxUsers
    const res = await createRoom({
      roomName,
      maxUsers
    })
    if (res.code === 0 || res.code === 200 || res.code === '0' || res.code === '200') {
      const createdRoom = res.data || {}
      const roomId = createdRoom.roomId || createdRoom.id || createdRoom
      if (!roomId) {
        ElMessage.error('歌房创建成功，但未获取到房间ID')
        fetchRooms()
        return
      }

      ElMessage.success('歌房创建成功')
      showCreateModal.value = false
      form.value = {
        roomName: '',
        maxUsers: 20
      }
      router.push({
        name: 'roomLive',
        params: { roomId },
        query: {
          owner: '1',
          roomName,
          maxUsers
        }
      })
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建歌房失败', error)
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  checkLoginStatus()
  fetchRooms()
})
</script>

<style scoped>
.page-content {
  h2 {
    font-size: 20px;
    color: #303133;
    margin: 0 0 20px 0;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.room-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s;
}

.room-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.online-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-dot {
  width: 6px;
  height: 6px;
  background: #67c23a;
  border-radius: 50%;
}

.card-info {
  padding: 12px;
}

.card-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-info p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.create-time {
  font-size: 11px;
  color: #c0c4cc;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.login-btn {
  margin-top: 8px;
}

.create-card {
  border: 2px dashed #dcdfe6;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.create-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.create-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.create-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 72px;
  color: #c0c4cc;
  font-weight: 200;
  line-height: 1;
}

.create-card:hover .create-icon {
  color: #409eff;
}

.create-card .card-info h4 {
  color: #606266;
}

.create-card .card-info p {
  color: #c0c4cc;
}

.form-container {
  padding: 10px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.form-item :deep(.el-input__wrapper),
.form-item :deep(.el-input-number__wrapper) {
  border-radius: 6px;
}

.create-room-modal :deep(.el-dialog__body) {
  padding: 20px;
}

.create-room-modal :deep(.el-dialog__header) {
  padding-bottom: 16px;
}

.create-room-modal :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 500;
}
</style>
