<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>Easy Music</h2>
        <p>欢迎回来</p>
      </div>
      
      <el-tabs v-model="loginType" class="login-tabs">
        <!-- 密码登录 -->
        <el-tab-pane label="密码登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 邮箱登录 -->
        <el-tab-pane label="邮箱登录" name="email">
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            class="login-form"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱"
                prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="verificationCode">
              <div class="code-input">
                <el-input
                  v-model="emailForm.verificationCode"
                  placeholder="请输入验证码"
                  prefix-icon="Key"
                  size="large"
                />
                <el-button
                  type="primary"
                  size="large"
                  :disabled="countdown > 0"
                  @click="handleSendCode(2)"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handleEmailLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="login-footer">
        <router-link to="/reset" class="link">忘记密码？</router-link>
        <span class="divider">|</span>
        <router-link to="/register" class="link">立即注册</router-link>
        <span class="divider">|</span>
        <span class="link" @click="router.push('/home')">返回主页</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginByPassword, loginByEmail, sendVerificationCode } from '@/api/user'
import { setAuthToken } from '@/utils/auth'

const router = useRouter()
const loginType = ref('password')
const loading = ref(false)
const countdown = ref(0)
const passwordFormRef = ref(null)
const emailFormRef = ref(null)

// 密码登录表单
const passwordForm = reactive({
  username: '',
  password: ''
})

// 邮箱登录表单
const emailForm = reactive({
  email: '',
  verificationCode: ''
})

// 密码登录校验规则
const passwordRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 邮箱登录校验规则
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

// 发送验证码
const handleSendCode = async (optionType) => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  
  try {
    await sendVerificationCode(emailForm.email, optionType)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

// 密码登录
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginByPassword(passwordForm)
        console.log('登录响应:', res)
        // 根据后端返回结构获取token，假设token直接返回在data中
        const token = res.data?.token || res.data
        if (token) {
          setAuthToken(token)
          ElMessage.success('登录成功')
          router.push('/home')
        } else {
          ElMessage.error('登录失败，未获取到token')
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 邮箱登录
const handleEmailLogin = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginByEmail(emailForm)
        console.log('登录响应:', res)
        // 根据后端返回结构获取token，假设token直接返回在data中
        const token = res.data?.token || res.data
        if (token) {
          setAuthToken(token)
          ElMessage.success('登录成功')
          router.push('/home')
        } else {
          ElMessage.error('登录失败，未获取到token')
        }
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 32px;
  color: #409eff;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.login-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.login-tabs {
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.code-input {
  display: flex;
  gap: 10px;
}

.code-input {
  display: flex;
  gap: 12px;
}

.code-input .el-input {
  flex: 1;
}

.code-input .el-button {
  border-radius: 6px;
  font-weight: 500;
  background: #f5f7fa;
  border: 1px solid #d9d9d9;
  color: #666;
  transition: all 0.2s ease;
}

.code-input .el-button:hover:not(:disabled) {
  background: #e8f0fe;
  border-color: #409eff;
  color: #409eff;
}

.code-input .el-button:disabled {
  background: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #999 !important;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 6px;
  font-weight: 500;
  background: #409eff;
  border: 1px solid #409eff;
  color: white;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.login-btn:active {
  background: #3088e6;
  border-color: #3088e6;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s;
}

.link:hover {
  color: #66b1ff;
}

.divider {
  margin: 0 10px;
  color: #dcdfe6;
}
</style>
