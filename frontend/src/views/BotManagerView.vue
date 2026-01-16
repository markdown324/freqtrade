<template>
  <div class="bot-manager">
    <h2 class="page-title">Bot 管理</h2>
    
    <el-tabs v-model="activeTab" class="manager-tabs">
      <!-- Bot Credentials Tab -->
      <el-tab-pane label="Bot 连接" name="credentials">
        <div class="section-header">
          <h3>已保存的 Bot</h3>
          <el-button type="primary" @click="showAddBotDialog = true">
            <el-icon><Plus /></el-icon>
            添加 Bot
          </el-button>
        </div>
        
        <div class="bot-list">
          <div 
            v-for="bot in userStore.botCredentials" 
            :key="bot.id" 
            class="bot-card"
            :class="{ active: bot.id === userStore.activeBotId }"
          >
            <div class="bot-info">
              <div class="bot-name">{{ bot.name }}</div>
              <div class="bot-url">{{ bot.url }}</div>
              <div class="bot-meta">用户: {{ bot.username }}</div>
            </div>
            <div class="bot-actions">
              <el-button 
                v-if="bot.id !== userStore.activeBotId"
                type="primary" 
                size="small"
                @click="selectBot(bot.id)"
              >
                连接
              </el-button>
              <el-tag v-else type="success" size="small">已连接</el-tag>
              <el-button 
                type="info" 
                size="small" 
                text
                @click="editBot(bot)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                text
                @click="deleteBot(bot.id)"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="userStore.botCredentials.length === 0" description="暂无保存的 Bot" />
        </div>
      </el-tab-pane>
      
      <!-- Config Files Tab -->
      <el-tab-pane label="配置文件" name="configs">
        <div class="section-header">
          <h3>配置文件管理</h3>
          <el-button type="primary" @click="showConfigWizard = true">
            <el-icon><Plus /></el-icon>
            新建配置
          </el-button>
        </div>
        
        <div class="config-list">
          <div 
            v-for="config in userStore.botConfigs" 
            :key="config.id" 
            class="config-card"
          >
            <div class="config-info">
              <div class="config-name">{{ config.name }}</div>
              <div class="config-meta">
                创建于 {{ formatDate(config.createdAt) }}
              </div>
            </div>
            <div class="config-actions">
              <el-button 
                type="primary" 
                size="small" 
                text
                @click="editConfig(config)"
              >
                编辑
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                text
                @click="userStore.downloadConfig(config)"
              >
                下载
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                text
                @click="deleteConfig(config.id)"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="userStore.botConfigs.length === 0" description="暂无配置文件" />
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- Add/Edit Bot Dialog -->
    <el-dialog 
      v-model="showAddBotDialog" 
      :title="editingBot ? '编辑 Bot' : '添加 Bot'"
      width="480px"
    >
      <el-form 
        ref="botFormRef" 
        :model="botForm" 
        :rules="botRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="botForm.name" placeholder="例如: 主账户" />
        </el-form-item>
        <el-form-item label="URL" prop="url">
          <el-input v-model="botForm.url" placeholder="http://127.0.0.1:8080" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="botForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="botForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddBotDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBot">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- Config Wizard -->
    <ConfigWizard 
      v-model="showConfigWizard"
      @save="handleWizardSave"
    />
    
    <!-- Edit Config Dialog (JSON only) -->
    <el-dialog 
      v-model="showEditConfigDialog" 
      title="编辑配置"
      width="800px"
    >
      <el-form 
        ref="configFormRef" 
        :model="configForm" 
        :rules="configRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="configForm.name" placeholder="配置文件名称" />
        </el-form-item>
        <el-form-item label="配置" prop="configJson">
          <el-input 
            v-model="configForm.configJson" 
            type="textarea" 
            :rows="15"
            placeholder="JSON 配置内容"
            class="config-editor"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="updateConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import type { BotCredential, BotConfig } from '@/utils/storage';
import ConfigWizard from '@/components/config/ConfigWizard.vue';
import dayjs from 'dayjs';

const userStore = useUserStore();

const activeTab = ref('credentials');

// Bot Credential Form
const showAddBotDialog = ref(false);
const botFormRef = ref<FormInstance>();
const editingBot = ref<BotCredential | null>(null);

const botForm = reactive({
  name: '',
  url: '',
  username: '',
  password: '',
});

const botRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入 URL', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

// Config Form
const showConfigWizard = ref(false);
const showEditConfigDialog = ref(false);
const configFormRef = ref<FormInstance>();
const editingConfig = ref<BotConfig | null>(null);

const configForm = reactive({
  name: '',
  configJson: '',
});

const configRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  configJson: [{ required: true, message: '请输入配置', trigger: 'blur' }],
};

// Handle wizard save
async function handleWizardSave(name: string, config: Record<string, unknown>) {
  try {
    await userStore.addBotConfig(name, config);
    ElMessage.success('配置创建成功');
  } catch (error) {
    ElMessage.error('保存失败');
  }
}

// Bot Credential Actions
function selectBot(id: string) {
  userStore.setActiveBot(id);
  ElMessage.success('已切换 Bot');
}

function editBot(bot: BotCredential) {
  editingBot.value = bot;
  botForm.name = bot.name;
  botForm.url = bot.url;
  botForm.username = bot.username;
  botForm.password = userStore.getBotPassword(bot);
  showAddBotDialog.value = true;
}

async function saveBot() {
  if (!botFormRef.value) return;
  
  const valid = await botFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  try {
    if (editingBot.value) {
      await userStore.updateBotCredential(editingBot.value.id, {
        name: botForm.name,
        url: botForm.url,
        username: botForm.username,
        password: botForm.password,
      });
      ElMessage.success('更新成功');
    } else {
      await userStore.addBotCredential(
        botForm.name,
        botForm.url,
        botForm.username,
        botForm.password
      );
      ElMessage.success('添加成功');
    }
    
    showAddBotDialog.value = false;
    resetBotForm();
  } catch (error) {
    ElMessage.error('保存失败');
  }
}

async function deleteBot(id: string) {
  try {
    await ElMessageBox.confirm('确定删除此 Bot？', '确认');
    await userStore.deleteBotCredential(id);
    ElMessage.success('删除成功');
  } catch {
    // User cancelled
  }
}

function resetBotForm() {
  editingBot.value = null;
  botForm.name = '';
  botForm.url = '';
  botForm.username = '';
  botForm.password = '';
}

// Config Actions
function editConfig(config: BotConfig) {
  editingConfig.value = config;
  configForm.name = config.name;
  configForm.configJson = JSON.stringify(config.config, null, 2);
  showEditConfigDialog.value = true;
}

async function updateConfig() {
  if (!configFormRef.value) return;
  
  const valid = await configFormRef.value.validate().catch(() => false);
  if (!valid) return;
  
  try {
    const parsedConfig = JSON.parse(configForm.configJson);
    
    if (editingConfig.value) {
      await userStore.updateBotConfig(editingConfig.value.id, configForm.name, parsedConfig);
      ElMessage.success('更新成功');
    }
    
    showEditConfigDialog.value = false;
    resetConfigForm();
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON 格式错误');
    } else {
      ElMessage.error('保存失败');
    }
  }
}

async function deleteConfig(id: string) {
  try {
    await ElMessageBox.confirm('确定删除此配置？', '确认');
    await userStore.deleteBotConfig(id);
    ElMessage.success('删除成功');
  } catch {
    // User cancelled
  }
}

function resetConfigForm() {
  editingConfig.value = null;
  configForm.name = '';
  configForm.configJson = '';
}

function formatDate(timestamp: number) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
}

// Watch for dialog close to reset forms
showAddBotDialog.value && resetBotForm();
showEditConfigDialog.value && resetConfigForm();
</script>

<style scoped lang="scss">
.bot-manager {
  max-width: 1200px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.manager-tabs {
  :deep(.el-tabs__content) {
    padding-top: 16px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
  }
}

.bot-list, .config-list {
  display: grid;
  gap: 16px;
}

.bot-card, .config-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  
  &.active {
    border-color: var(--color-success);
  }
}

.bot-info, .config-info {
  flex: 1;
}

.bot-name, .config-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.bot-url {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.bot-meta, .config-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.bot-actions, .config-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-editor {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}
</style>
