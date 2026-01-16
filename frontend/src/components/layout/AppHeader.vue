<template>
  <header class="app-header">
    <div class="header-left">
      <span class="mode-badge" :class="tradingMode">
        {{ isDryRun ? '模拟交易' : '实盘交易' }}
      </span>
      <span class="bot-status" :class="botState">
        {{ botState === 'running' ? '运行中' : '已停止' }}
      </span>
    </div>
    
    <div class="header-right">
      <!-- Theme Toggle -->
      <el-button 
        circle 
        text 
        @click="configStore.toggleTheme()"
        class="theme-toggle"
      >
        <el-icon size="18">
          <Moon v-if="configStore.theme === 'dark'" />
          <Sunny v-else />
        </el-icon>
      </el-button>
      
      <!-- User Menu -->
      <el-dropdown trigger="click">
        <el-button text class="user-btn">
          <el-icon><User /></el-icon>
          <span class="username">{{ authStore.username }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="authStore.logout()">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { 
  Moon, 
  Sunny, 
  User, 
  ArrowDown, 
  SwitchButton 
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const configStore = useConfigStore();

const isDryRun = computed(() => configStore.isDryRun);
const tradingMode = computed(() => configStore.tradingMode);
const botState = computed(() => configStore.botState);

onMounted(() => {
  configStore.fetchConfig();
});
</script>

<style scoped lang="scss">
.app-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  
  &.dry_run {
    background-color: rgba(63, 185, 80, 0.15);
    color: var(--dry-run-color);
  }
  
  &.live {
    background-color: rgba(248, 81, 73, 0.15);
    color: var(--live-color);
  }
}

.bot-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  
  &.running {
    color: var(--color-success);
  }
  
  &.stopped {
    color: var(--text-muted);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  color: var(--text-secondary);
}

.user-btn {
  color: var(--text-primary);
  
  .username {
    margin-left: 8px;
  }
}
</style>
