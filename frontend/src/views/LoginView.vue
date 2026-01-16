<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">FreqTrade</h1>
      <p class="login-subtitle">加密货币交易机器人</p>
      
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="serverUrl">
          <el-input
            v-model="form.serverUrl"
            placeholder="服务器地址 (默认: http://127.0.0.1:8080)"
            size="large"
            :prefix-icon="Link"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            native-type="submit"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="auth-note">
        <el-icon><InfoFilled /></el-icon>
        <span>用户名和密码在 Freqtrade 的 config.json 中配置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { User, Lock, Link, InfoFilled } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const isLoading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: '',
  serverUrl: '',
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function handleLogin() {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const success = await authStore.login(form.username, form.password);
    if (success) {
      router.push('/');
    } else {
      error.value = '登录失败，请检查用户名和密码';
    }
  } catch (err) {
    error.value = '连接服务器失败';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.login-btn {
  width: 100%;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: rgba(248, 81, 73, 0.1);
  border-radius: 6px;
  color: var(--color-danger);
  text-align: center;
  font-size: 14px;
}

.auth-note {
  margin-top: 24px;
  padding: 12px;
  background-color: rgba(88, 166, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  
  .el-icon {
    color: var(--color-primary);
    font-size: 16px;
  }
}
</style>
