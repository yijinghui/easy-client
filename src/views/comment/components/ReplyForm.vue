<template>
  <div class="comment-input">
    <el-input 
      v-model="content" 
      :placeholder="placeholder"
      type="textarea"
      :rows="2"
      @keyup.enter.ctrl="handleSubmit"
    />
    <el-button type="primary" @click="handleSubmit">发表</el-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '发表评论...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'update:modelValue'])

const router = useRouter()
const content = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

const isLoggedIn = () => !!localStorage.getItem('token')

const handleSubmit = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  if (!isLoggedIn()) {
    ElMessage.info('未登录，登录后才能发表评论')
    router.push('/login')
    return
  }
  
  emit('submit', content.value.trim())
  content.value = ''
}
</script>

<style scoped>
.comment-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.comment-input .el-input {
  flex: 1;
}

.comment-input .el-textarea__inner {
  border-radius: 8px;
  resize: none;
}
</style>