<template>
  <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
    <el-form-item prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="Message" size="large" @input="clearFieldError('email')" />
    </el-form-item>
    <el-form-item prop="verificationCode">
      <div class="code-input">
        <el-input v-model="form.verificationCode" placeholder="请输入验证码" prefix-icon="Key" size="large" @input="clearFieldError('verificationCode')" />
        <el-button type="primary" size="large" :disabled="countdown > 0" @click="handleSendCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </el-button>
      </div>
    </el-form-item>
    <el-form-item prop="newPassword">
      <el-input
        v-model="form.newPassword"
        type="password"
        placeholder="请输入新密码"
        prefix-icon="Lock"
        size="large"
        show-password
        @input="clearFieldError('newPassword')"
      />
    </el-form-item>
    <el-form-item prop="repeatPassword">
      <el-input
        v-model="form.repeatPassword"
        type="password"
        placeholder="请再次输入新密码"
        prefix-icon="Lock"
        size="large"
        show-password
        @input="clearFieldError('repeatPassword')"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="large" class="login-btn" @click="handleReset">
        重置密码
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resetUserPassword, sendVerificationCode } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const countdown = ref(0)
let timer = null

const form = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  repeatPassword: ''
})

const validateRepeatPassword = (_rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verificationCode: [
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  repeatPassword: [
    { validator: validateRepeatPassword, trigger: 'blur' }
  ]
}

const startCountdown = () => {
  countdown.value = 60
  timer && clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const clearFieldError = (field) => {
  if (formRef.value) {
    formRef.value.clearValidate([field])
  }
}

const handleSendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  await sendVerificationCode(form.email, 3)
  startCountdown()
}

const handleReset = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    await resetUserPassword(form)
    ElMessage.success('密码重置成功，请登录')
    router.push('/login')
  })
}
</script>
