<template>
  <div class="playlist-edit">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="playlist" class="edit-container">
      <div class="edit-header">
        <h2>编辑歌单</h2>
        <button class="cancel-btn" @click="handleCancel">取消</button>
      </div>
      
      <div class="edit-form">
        <div class="form-section">
          <label class="form-label">歌单封面</label>
          <div class="cover-edit-area" @click="handleCoverClick">
            <img 
              :src="coverUrl" 
              :alt="playlist.title" 
              class="cover-preview"
            />
            <div class="cover-overlay">
              <span class="overlay-icon">+</span>
              <span class="overlay-text">更换封面</span>
              <span class="overlay-hint">点击选择图片</span>
            </div>
          </div>
          <input 
            ref="fileInputRef"
            type="file" 
            accept="image/*" 
            class="file-input"
            @change="handleFileChange"
          />
        </div>

        <!-- 标题 -->
        <div class="form-section">
          <label class="form-label required">歌单标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            class="form-input" 
            placeholder="请输入歌单标题" 
            maxlength="50"
          />
        </div>

        <!-- 风格 -->
        <div class="form-section">
          <label class="form-label required">歌单风格</label>
          <input 
            v-model="form.style" 
            type="text" 
            class="form-input" 
            placeholder="请输入歌单风格，如：流行、摇滚、古典" 
            maxlength="20"
          />
        </div>

        <!-- 简介 -->
        <div class="form-section">
          <label class="form-label">歌单简介</label>
          <textarea 
            v-model="form.introduction" 
            class="form-textarea" 
            placeholder="请输入歌单简介（可选）" 
            rows="4" 
            maxlength="500"
          ></textarea>
          <span class="textarea-count">{{ form.introduction?.length || 0 }}/500</span>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button class="save-btn" :disabled="saving" @click="handleSave">
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <span>歌单不存在或已被删除</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPlaylistDetail, updatePlaylist, updatePlaylistCover } from '@/api/playlist'
import { getPlaylistCover } from '@/utils/asset'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const playlist = ref(null)
const fileInputRef = ref(null)

const form = ref({
  playlistId: null,
  title: '',
  introduction: '',
  style: ''
})

const coverUrl = computed(() => {
  if (!playlist.value) return ''
  return getPlaylistCover(
    playlist.value.coverUrl,
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20playlist%20cover%20${encodeURIComponent(playlist.value.style || 'abstract')}&image_size=square`
  )
})

const fetchPlaylist = async () => {
  loading.value = true
  
  const playlistId = parseInt(route.params.id)
  if (!playlistId || isNaN(playlistId)) {
    loading.value = false
    return
  }

  try {
    const res = await getPlaylistDetail(playlistId)
    if (res.data) {
      playlist.value = res.data
      form.value = {
        playlistId: res.data.playlistId,
        title: res.data.title || '',
        introduction: res.data.introduction || '',
        style: res.data.style || ''
      }
    }
  } catch (error) {
    console.error('获取歌单信息失败', error)
    ElMessage.error('获取歌单信息失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  // 表单验证
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入歌单标题')
    return
  }
  if (!form.value.style.trim()) {
    ElMessage.warning('请输入歌单风格')
    return
  }

  saving.value = true

  try {
    await updatePlaylist(form.value)
    ElMessage.success('歌单信息更新成功')
    // 返回歌单详情页
    router.push(`/playlist/${form.value.playlistId}`)
  } catch (error) {
    console.error('更新歌单失败', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const handleCoverClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    ElMessage.warning('请选择有效的图片格式（支持 JPG、PNG、WebP、GIF）')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 5MB')
    return
  }

  uploading.value = true

  try {
    await updatePlaylistCover(form.value.playlistId, file)
    ElMessage.success('封面更新成功')
    await fetchPlaylist()
    window.dispatchEvent(new CustomEvent('playlist-cover-updated', {
      detail: {
        playlistId: form.value.playlistId
      }
    }))
  } catch (error) {
    console.error('更新封面失败', error)
    ElMessage.error('更新封面失败，请重试')
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

onMounted(() => {
  fetchPlaylist()
})
</script>

<style scoped>
.playlist-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.edit-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.edit-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.cancel-btn {
  padding: 6px 16px;
  background: #f5f7fa;
  border: 1px solid #d9d9d9;
  color: #606266;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f0f0f0;
  border-color: #c0c4cc;
}

.edit-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: #f56c6c;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: #606266;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}

.form-input::placeholder {
  color: #c0c4cc;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: #606266;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-textarea::placeholder {
  color: #c0c4cc;
}

.textarea-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.cover-edit-area {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #d9d9d9;
  transition: all 0.2s;
}

.cover-edit-area:hover {
  border-color: #409eff;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.overlay-icon {
  font-size: 24px;
  color: #fff;
  opacity: 0.9;
}

.overlay-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.overlay-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.file-input {
  display: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.save-btn {
  flex: 1;
  padding: 12px;
  background: #409eff;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.save-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
