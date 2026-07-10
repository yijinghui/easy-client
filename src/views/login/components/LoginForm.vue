<template>
  <el-tabs v-model="loginType" class="login-tabs" @tab-change="handleTabChange">
    <el-tab-pane label="密码登录" name="password">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="passwordForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" @input="clearPasswordFieldError('username')" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @input="clearPasswordFieldError('password')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" @click="handlePasswordLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane label="邮箱登录" name="email">
      <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" class="login-form">
        <el-form-item prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入邮箱" prefix-icon="Message" size="large" @input="clearEmailFieldError('email')" />
        </el-form-item>
        <el-form-item prop="verificationCode">
          <div class="code-input">
            <el-input v-model="emailForm.verificationCode" placeholder="请输入验证码" prefix-icon="Key" size="large" @input="clearEmailFieldError('verificationCode')" />
            <el-button type="primary" size="large" :disabled="countdown > 0" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" @click="handleEmailLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginByEmail, loginByPassword, sendVerificationCode } from '@/api/user'
import { setAuthToken } from '@/utils/auth'

const router = useRouter()
const loginType = ref('password')
const countdown = ref(0)
const passwordFormRef = ref(null)
const emailFormRef = ref(null)

let timer = null

const passwordForm = reactive({
  username: '',
  password: ''
})

const emailForm = reactive({
  email: '',
  verificationCode: ''
})

const passwordRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
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

const clearPasswordFieldError = (field) => {
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate([field])
  }
}

const clearEmailFieldError = (field) => {
  if (emailFormRef.value) {
    emailFormRef.value.clearValidate([field])
  }
}

const handleTabChange = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
  if (emailFormRef.value) {
    emailFormRef.value.clearValidate()
  }
}

const saveTokenAndRedirect = (res) => {
  const token = res.data?.token || res.data
  if (!token) {
    ElMessage.error('登录状态异常')
    return
  }

  setAuthToken(token)
  ElMessage.success('登录成功')
  router.push('/home')
}

const handleSendCode = async () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  await sendVerificationCode(emailForm.email, 2)
  startCountdown()
}

const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await loginByPassword(passwordForm)
    saveTokenAndRedirect(res)
  })
}

const handleEmailLogin = async () => {
  if (!emailFormRef.value) return

  await emailFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await loginByEmail(emailForm)
    saveTokenAndRedirect(res)
  })
}
</script>
