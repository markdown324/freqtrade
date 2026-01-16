<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">FreqTrade</h1>
    </div>
    
    <el-menu
      :default-active="currentRoute"
      class="sidebar-menu"
      :collapse="isCollapsed"
      router
    >
      <el-menu-item index="/">
        <el-icon><DataLine /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      
      <el-menu-item index="/trades">
        <el-icon><List /></el-icon>
        <template #title>交易管理</template>
      </el-menu-item>
      
      <el-menu-item index="/backtest">
        <el-icon><TrendCharts /></el-icon>
        <template #title>回测分析</template>
      </el-menu-item>
      
      <el-menu-item index="/strategies">
        <el-icon><Document /></el-icon>
        <template #title>策略管理</template>
      </el-menu-item>
      
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
    
    <div class="sidebar-footer">
      <el-button 
        text 
        @click="isCollapsed = !isCollapsed"
        class="collapse-btn"
      >
        <el-icon>
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  DataLine, 
  List, 
  TrendCharts, 
  Document, 
  Setting,
  Fold,
  Expand
} from '@element-plus/icons-vue';

const route = useRoute();
const isCollapsed = ref(false);

const currentRoute = computed(() => route.path);
</script>

<style scoped lang="scss">
.sidebar {
  width: 220px;
  height: 100vh;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  
  &:has(.el-menu--collapse) {
    width: 64px;
  }
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  
  .el-menu-item {
    color: var(--text-secondary);
    
    &:hover {
      background-color: var(--bg-tertiary);
    }
    
    &.is-active {
      color: var(--color-primary);
      background-color: rgba(88, 166, 255, 0.1);
    }
  }
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.collapse-btn {
  width: 100%;
  color: var(--text-secondary);
}
</style>
