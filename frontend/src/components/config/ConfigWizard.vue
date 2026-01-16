<template>
  <el-dialog
    v-model="visible"
    title="新建配置"
    width="800px"
    :close-on-click-modal="false"
    @closed="resetWizard"
  >
    <div class="wizard-container">
      <!-- Mode Toggle -->
      <div class="wizard-mode">
        <el-button-group>
          <el-button 
            :type="wizardMode === 'quick' ? 'primary' : 'default'"
            @click="wizardMode = 'quick'"
          >
            快速配置
          </el-button>
          <el-button 
            :type="wizardMode === 'full' ? 'primary' : 'default'"
            @click="wizardMode = 'full'"
          >
            完整配置
          </el-button>
          <el-button 
            :type="wizardMode === 'import' ? 'primary' : 'default'"
            @click="wizardMode = 'import'"
          >
            导入 JSON
          </el-button>
        </el-button-group>
      </div>

      <!-- Import Mode -->
      <div v-if="wizardMode === 'import'" class="import-section">
        <el-upload
          class="upload-area"
          drag
          accept=".json"
          :auto-upload="false"
          :show-file-list="false"
          @change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">拖拽 JSON 文件到此处，或 <em>点击上传</em></div>
        </el-upload>
        
        <el-input
          v-model="importJson"
          type="textarea"
          :rows="12"
          placeholder="或直接粘贴 JSON 配置内容"
          class="json-input"
        />
        
        <div class="import-actions">
          <el-button type="primary" @click="parseImportedJson">解析并导入</el-button>
        </div>
      </div>

      <!-- Wizard Steps -->
      <template v-else>
        <!-- Progress -->
        <el-steps 
          :active="currentStep" 
          finish-status="success"
          class="wizard-steps"
        >
          <el-step 
            v-for="section in visibleSections" 
            :key="section.id" 
            :title="section.title"
          />
        </el-steps>

        <!-- Config Name -->
        <div v-if="currentStep === 0" class="config-name-section">
          <el-form-item label="配置名称" required>
            <el-input v-model="configName" placeholder="例如: Binance USDT 策略" />
          </el-form-item>
        </div>

        <!-- Current Section -->
        <div class="section-content">
          <div class="section-header">
            <h3>{{ currentSection?.title }}</h3>
            <p v-if="currentSection?.description" class="section-desc">
              {{ currentSection.description }}
            </p>
          </div>

          <el-form label-position="top" class="config-form">
            <template v-for="field in currentFields" :key="field.key">
              <el-form-item 
                v-if="isFieldVisible(field)"
                :label="field.label"
                :required="field.required"
              >
                <!-- Boolean -->
                <el-switch
                  v-if="field.type === 'boolean'"
                  v-model="configValues[field.key]"
                />
                
                <!-- Select -->
                <el-select
                  v-else-if="field.type === 'select'"
                  v-model="configValues[field.key]"
                  :placeholder="field.placeholder"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                
                <!-- Number -->
                <el-input-number
                  v-else-if="field.type === 'number'"
                  v-model="configValues[field.key]"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  style="width: 100%"
                />
                
                <!-- Password -->
                <el-input
                  v-else-if="field.type === 'password'"
                  v-model="configValues[field.key]"
                  type="password"
                  show-password
                  :placeholder="field.placeholder"
                />
                
                <!-- Text -->
                <el-input
                  v-else
                  v-model="configValues[field.key]"
                  :placeholder="field.placeholder"
                />
                
                <div v-if="field.description" class="field-desc">
                  {{ field.description }}
                </div>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        
        <template v-if="wizardMode !== 'import'">
          <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
          
          <el-button 
            v-if="currentStep < visibleSections.length - 1" 
            type="primary" 
            @click="nextStep"
          >
            下一步
          </el-button>
          
          <el-button 
            v-if="currentStep === visibleSections.length - 1" 
            type="success" 
            @click="saveConfig"
          >
            完成
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { 
  CONFIG_SECTIONS, 
  generateDefaultConfig, 
  setNestedValue, 
  getNestedValue,
  type ConfigField,
  type ConfigSection 
} from '@/utils/configSchema';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', name: string, config: Record<string, unknown>): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Wizard state
const wizardMode = ref<'quick' | 'full' | 'import'>('quick');
const currentStep = ref(0);
const configName = ref('');
const configValues = ref<Record<string, unknown>>({});
const importJson = ref('');

// Initialize with defaults
watch(visible, (val) => {
  if (val) {
    initializeDefaults();
  }
});

function initializeDefaults() {
  const defaults = generateDefaultConfig();
  configValues.value = {};
  
  // Flatten nested values for form binding
  for (const section of CONFIG_SECTIONS) {
    for (const field of section.fields) {
      const value = getNestedValue(defaults, field.key);
      if (value !== undefined) {
        configValues.value[field.key] = value;
      } else if (field.default !== undefined) {
        configValues.value[field.key] = field.default;
      }
    }
  }
}

// Visible sections based on mode
const visibleSections = computed<ConfigSection[]>(() => {
  if (wizardMode.value === 'quick') {
    // Quick mode: only required sections
    return CONFIG_SECTIONS.filter(s => ['mode', 'exchange', 'trading'].includes(s.id));
  }
  return CONFIG_SECTIONS;
});

const currentSection = computed(() => visibleSections.value[currentStep.value]);

const currentFields = computed(() => currentSection.value?.fields || []);

// Check if field should be visible based on dependencies
function isFieldVisible(field: ConfigField): boolean {
  if (!field.dependsOn) return true;
  return configValues.value[field.dependsOn.field] === field.dependsOn.value;
}

// Navigation
function nextStep() {
  if (currentStep.value === 0 && !configName.value.trim()) {
    ElMessage.warning('请输入配置名称');
    return;
  }
  
  if (currentStep.value < visibleSections.value.length - 1) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

// Build final config object
function buildConfig(): Record<string, unknown> {
  const config = generateDefaultConfig();
  
  // Apply user values
  for (const [key, value] of Object.entries(configValues.value)) {
    if (value !== undefined && value !== '') {
      setNestedValue(config, key, value);
    }
  }
  
  return config;
}

// Save
function saveConfig() {
  if (!configName.value.trim()) {
    ElMessage.warning('请输入配置名称');
    currentStep.value = 0;
    return;
  }
  
  const config = buildConfig();
  emit('save', configName.value, config);
  visible.value = false;
}

// JSON Import
function handleFileChange(uploadFile: { raw: File }) {
  const file = uploadFile.raw;
  const reader = new FileReader();
  reader.onload = (e) => {
    importJson.value = e.target?.result as string;
  };
  reader.readAsText(file);
}

function parseImportedJson() {
  try {
    const parsed = JSON.parse(importJson.value);
    
    // Extract name from bot_name or ask user
    configName.value = parsed.bot_name || '导入的配置';
    
    // Map values to form
    for (const section of CONFIG_SECTIONS) {
      for (const field of section.fields) {
        const value = getNestedValue(parsed, field.key);
        if (value !== undefined) {
          configValues.value[field.key] = value;
        }
      }
    }
    
    // Switch to full mode for review
    wizardMode.value = 'full';
    currentStep.value = 0;
    ElMessage.success('配置导入成功，请检查并确认');
  } catch (err) {
    ElMessage.error('JSON 格式错误，请检查');
  }
}

// Reset
function resetWizard() {
  currentStep.value = 0;
  configName.value = '';
  configValues.value = {};
  importJson.value = '';
  wizardMode.value = 'quick';
}
</script>

<style scoped lang="scss">
.wizard-container {
  min-height: 400px;
}

.wizard-mode {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.wizard-steps {
  margin-bottom: 24px;
}

.config-name-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
}

.section-content {
  padding: 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.section-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .section-desc {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.config-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.field-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.import-section {
  .upload-area {
    width: 100%;
    margin-bottom: 16px;
    
    :deep(.el-upload-dragger) {
      background-color: var(--bg-tertiary);
      border-color: var(--border-color);
    }
  }
  
  .json-input {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 13px;
  }
  
  .import-actions {
    margin-top: 16px;
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
