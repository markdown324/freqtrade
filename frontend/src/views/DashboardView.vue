<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总收益</div>
        <div class="stat-value" :class="totalProfit >= 0 ? 'text-profit' : 'text-loss'">
          {{ formatProfit(totalProfit) }} {{ stakeCurrency }}
        </div>
        <div class="stat-sub">{{ formatPercent(totalProfitPercent) }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">胜率</div>
        <div class="stat-value">{{ formatPercent(winRate) }}</div>
        <div class="stat-sub">{{ winningTrades }}/{{ totalTrades }} 交易</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">当前持仓</div>
        <div class="stat-value">{{ openTradesCount }}</div>
        <div class="stat-sub">活跃交易</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-label">账户余额</div>
        <div class="stat-value">{{ formatNumber(totalBalance) }}</div>
        <div class="stat-sub">{{ stakeCurrency }}</div>
      </div>
    </div>
    
    <!-- Bot Controls -->
    <div class="controls-section">
      <el-button 
        type="success" 
        :disabled="botState === 'running'"
        @click="handleStart"
      >
        启动交易
      </el-button>
      <el-button 
        type="danger" 
        :disabled="botState !== 'running'"
        @click="handleStop"
      >
        停止交易
      </el-button>
    </div>
    
    <!-- Open Trades -->
    <div class="section">
      <h3 class="section-title">当前持仓</h3>
      <el-table 
        :data="openTrades" 
        style="width: 100%"
        :empty-text="isLoading ? '加载中...' : '暂无持仓'"
      >
        <el-table-column prop="pair" label="交易对" width="120" />
        <el-table-column prop="stake_amount" label="投入金额" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.stake_amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="open_rate" label="开仓价" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.open_rate, 6) }}
          </template>
        </el-table-column>
        <el-table-column prop="current_rate" label="当前价" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.current_rate, 6) }}
          </template>
        </el-table-column>
        <el-table-column label="收益" width="140">
          <template #default="{ row }">
            <span :class="row.profit_pct >= 0 ? 'text-profit' : 'text-loss'">
              {{ formatPercent(row.profit_pct) }}
              ({{ formatProfit(row.profit_abs) }})
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="danger" 
              text
              @click="handleForceExit(row.trade_id)"
            >
              平仓
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useTradeStore } from '@/stores/tradeStore';
import { useConfigStore } from '@/stores/configStore';
import { forceExit } from '@/api/trades';

const tradeStore = useTradeStore();
const configStore = useConfigStore();

// Computed
const openTrades = computed(() => tradeStore.openTrades);
const openTradesCount = computed(() => tradeStore.openTradesCount);
const totalProfit = computed(() => tradeStore.totalProfit);
const totalProfitPercent = computed(() => tradeStore.totalProfitPercent);
const winRate = computed(() => tradeStore.winRate);
const totalBalance = computed(() => tradeStore.totalBalance);
const stakeCurrency = computed(() => configStore.stakeCurrency);
const botState = computed(() => configStore.botState);
const isLoading = computed(() => tradeStore.isLoading);

const winningTrades = computed(() => tradeStore.profit?.winning_trades ?? 0);
const totalTrades = computed(() => tradeStore.profit?.trade_count ?? 0);

// Formatters
function formatNumber(value: number, decimals = 2): string {
  return value?.toFixed(decimals) ?? '0.00';
}

function formatPercent(value: number): string {
  return `${(value ?? 0).toFixed(2)}%`;
}

function formatProfit(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value)}`;
}

// Actions
async function handleStart() {
  const success = await tradeStore.start();
  if (success) {
    ElMessage.success('交易已启动');
    configStore.fetchConfig();
  } else {
    ElMessage.error('启动失败');
  }
}

async function handleStop() {
  const success = await tradeStore.stop();
  if (success) {
    ElMessage.success('交易已停止');
    configStore.fetchConfig();
  } else {
    ElMessage.error('停止失败');
  }
}

async function handleForceExit(tradeId: number) {
  try {
    await ElMessageBox.confirm('确定要强制平仓吗？', '确认平仓', {
      type: 'warning',
    });
    
    await forceExit(tradeId);
    ElMessage.success('平仓指令已发送');
    tradeStore.fetchOpenTrades();
  } catch {
    // User cancelled
  }
}

// Lifecycle
onMounted(() => {
  tradeStore.fetchAll();
});
</script>

<style scoped lang="scss">
.dashboard {
  max-width: 1400px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  
  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .stat-sub {
    font-size: 12px;
    color: var(--text-muted);
  }
}

.controls-section {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
