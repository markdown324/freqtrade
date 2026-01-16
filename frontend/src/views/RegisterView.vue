<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">FreqTrade</h1>
      <p class="register-subtitle">创建新账户</p>
      
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        @submit.prevent="handleRegister"
        class="register-form"
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
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            native-type="submit"
            class="register-btn"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="login-link">
        已有账户？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const isLoading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少 3 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

async function handleRegister() {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const result = await userStore.register(form.username, form.password);
    if (result.success) {
      ElMessage.success('注册成功，请登录');
      router.push('/login');
    } else {
      error.value = result.error || '注册失败';
    }
  } catch (err) {
    error.value = '注册失败';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
}

.register-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.register-btn {
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

.login-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  
  a {
    color: var(--color-primary);
  }
}
</style>
