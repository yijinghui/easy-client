<template>
  <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" size="large" @input="clearFieldError('username')" />
    </el-form-item>
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
    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        prefix-icon="Lock"
        size="large"
        show-password
        @input="clearFieldError('password')"
      />
    </el-form-item>
    <el-form-item prop="repeatPassword">
      <el-input
        v-model="form.repeatPassword"
        type="password"
        placeholder="请再次输入密码"
        prefix-icon="Lock"
        size="large"
        show-password
        @input="clearFieldError('repeatPassword')"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="large" class="login-btn" @click="handleRegister">
        注册
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, sendVerificationCode } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const countdown = ref(0)
let timer = null

const form = reactive({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  repeatPassword: ''
})

const validateRepeatPassword = (_rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  repeatPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
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

  await sendVerificationCode(form.email, 1)
  startCountdown()
}

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    await register(form)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  })
}
</script>
