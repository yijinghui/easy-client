<template>
  <div class="edit-modal-mask" @click="handleClose">
    <div class="edit-modal-content" @click.stop>
      <div class="edit-modal-header">
        <span class="modal-title">编辑资料</span>
        <span class="modal-close" @click="handleClose">×</span>
      </div>

      <div class="edit-modal-body">
        <el-form :model="editForm" :rules="formRules" ref="formRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model="editForm.phone" placeholder="请输入手机号" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item label="简介" prop="introduction">
            <el-input 
              v-model="editForm.introduction" 
              type="textarea" 
              :rows="3"
              placeholder="请输入简介" 
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="edit-modal-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserInfo } from '@/api/user'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const formRef = ref(null)

const editForm = ref({
  userId: 0,
  username: '',
  phone: '',
  email: '',
  introduction: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

onMounted(() => {
  editForm.value = {
    userId: props.userInfo.userId,
    username: props.userInfo.username,
    phone: props.userInfo.phone,
    email: props.userInfo.email,
    introduction: props.userInfo.introduction
  }
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    await updateUserInfo({
      userId: editForm.value.userId,
      username: editForm.value.username,
      phone: editForm.value.phone,
      email: editForm.value.email,
      introduction: editForm.value.introduction
    })
    emit('save', editForm.value)
  } catch (error) {
    ElMessage.error(error.message || '编辑失败，请重试')
  }
}
</script>

<style scoped>
.edit-modal-mask {
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

.edit-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  overflow: hidden;
}

.edit-modal-header {
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

.edit-modal-body {
  padding: 24px;
}

.edit-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.edit-modal-footer .el-button {
  margin-left: 12px;
}
</style>