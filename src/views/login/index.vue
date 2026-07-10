<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>Easy Music</h2>
        <p>{{ pageConfig.subtitle }}</p>
      </div>

      <component :is="pageConfig.component" />

      <div class="login-footer">
        <template v-if="route.name === 'login'">
          <router-link to="/reset" class="link">忘记密码？</router-link>
          <span class="divider">|</span>
          <router-link to="/register" class="link">立即注册</router-link>
          <span class="divider">|</span>
        </template>
        <router-link v-else to="/login" class="link">返回登录</router-link>
        <span v-if="route.name !== 'login'" class="divider">|</span>
        <router-link to="/home" class="link">返回主页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import ResetForm from './components/ResetForm.vue'

const route = useRoute()

const pageMap = {
  login: { subtitle: '欢迎回来', component: LoginForm },
  register: { subtitle: '创建你的账号', component: RegisterForm },
  reset: { subtitle: '重置密码', component: ResetForm }
}

const pageConfig = computed(() => pageMap[route.name] || pageMap.login)
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  user-select: none;
  -webkit-user-select: none;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  user-select: none;
  -webkit-user-select: none;
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

:deep(.login-tabs) {
  margin-bottom: 20px;
}

:deep(.login-form) {
  margin-top: 20px;
}

:deep(.code-input) {
  display: flex;
  gap: 12px;
}

:deep(.code-input .el-input) {
  flex: 1;
}

:deep(.code-input .el-button) {
  border-radius: 6px;
  font-weight: 500;
  background: #f5f7fa;
  border: 1px solid #d9d9d9;
  color: #666;
  transition: all 0.2s ease;
}

:deep(.code-input .el-button:hover:not(:disabled)) {
  background: #e8f0fe;
  border-color: #409eff;
  color: #409eff;
}

:deep(.code-input .el-button:disabled) {
  background: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #999 !important;
  cursor: not-allowed;
}

:deep(.login-btn) {
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

:deep(.login-btn:hover) {
  background: #66b1ff;
  border-color: #66b1ff;
}

:deep(.login-btn:active) {
  background: #3088e6;
  border-color: #3088e6;
}

:deep(.login-form .el-input__inner),
:deep(.login-form .el-textarea__inner) {
  user-select: text;
  -webkit-user-select: text;
}


</style>
