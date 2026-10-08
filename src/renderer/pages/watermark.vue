<template>
  <div class="watermark-tool">
    <!-- 预览区（统一组件：未选图为占位框，选图后预览 + 「重新选择」） -->
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="stamp"
      hint="选择一张图片开始添加水印，或将图片拖到这里"
      @pick="pickImage"
      @drop="onDrop"
    />

    <!-- 参数面板：顶部入口固定，中部独立滚动，底部按钮固定（内容不从头/尾按钮底下穿过） -->
    <aside class="controls-pane">
      <div class="batch-entry">
        <fluent-button appearance="neutral" class="entry-btn" @click="openBatch">
          <font-awesome-icon icon="layer-group" /> 批量处理
        </fluent-button>
        <fluent-button appearance="neutral" class="entry-btn" @click="openTemplates">
          <font-awesome-icon icon="bookmark" /> 模板管理
        </fluent-button>
      </div>
      <div class="controls-body">
        <SettingsGroup title="模板">
          <SettingsRow label="选择模板">
            <!-- 模板可能有很多，用带搜索的选择器（与字体选择器同款） -->
            <FontSelect
              class="ctl-lg"
              :model-value="selectedTemplateId"
              :options="templateOptions"
              :font-preview="false"
              placeholder="选择模板"
              search-placeholder="搜索模板"
              @update:model-value="onPickTemplate"
            />
          </SettingsRow>
          <SettingsRow label="当前参数" desc="把下列参数保存为新模板">
            <fluent-button appearance="neutral" size="small" @click="saveAsTemplate">存为模板</fluent-button>
          </SettingsRow>
        </SettingsGroup>
        <WatermarkControls v-model="params" />
      </div>
      <div class="controls-footer">
        <fluent-button appearance="primary" class="save-btn" :disabled="processing || !inputPath" @click="save">
          {{ processing ? '处理中…' : '保存水印图片' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue';
import type { WatermarkParams } from '@shared/types';
import { selectImageFiles } from '@renderer/utils/filePicker';
import { useDialog } from '@renderer/composables/useDialog';
import { useSingleTool } from '@renderer/composables/useSingleTool';
import { useSettingsStore } from '@renderer/stores/settings';
import { defaultWatermarkParams } from '@renderer/consts/watermarkDefaults';
import WatermarkControls from '@renderer/components/WatermarkControls.vue';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import FontSelect from '@renderer/components/FontSelect.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';

const { message, prompt } = useDialog();
/** 与其它单图工具一致：保存时再选目录 */
const { inputPath, inputName, previewUrl, processing, setImage, runSave } = useSingleTool();

let previewTimer: number | undefined;

const params = reactive<WatermarkParams>(defaultWatermarkParams());

// 来自模板窗口的应用/编辑：载入模板参数（载入后即清空，避免下次误入）。
// 用 watch 而非 onMounted —— 主窗口已在本页时再次应用模板也要生效
const settings = useSettingsStore();
const templates = computed(() => settings.templates.watermark ?? []);
/** 当前选中的模板（仅用于回显，编辑参数后不强制解除） */
const selectedTemplateId = ref('');

watch(
  () => settings.toolParams('watermarkPending') as { params?: Record<string, unknown>; templateId?: string } | null,
  (pending) => {
    if (pending?.params) {
      void applyTemplateParams(pending.params as Partial<WatermarkParams>);
      selectedTemplateId.value = pending.templateId ?? '';
      settings.setToolParams('watermarkPending', {});
    }
  },
  { immediate: true, deep: true }
);

/** 载入模板参数：图片水印存的是素材文件名，要先解析成绝对路径才能渲染/处理 */
async function applyTemplateParams(raw: Partial<WatermarkParams>): Promise<void> {
  const next = { ...raw } as WatermarkParams;
  if (next.type === 'image' && next.watermarkPath && !/[\\/]/.test(next.watermarkPath)) {
    const full = await window.api.template.resolveAsset(next.watermarkPath);
    if (!full) {
      message('该模板的水印图片已丢失，请重新选择水印图片', 'warning');
      next.watermarkPath = '';
    } else {
      next.watermarkPath = full;
    }
  }
  Object.assign(params, next);
}

/** 选择器选项：首项为「不使用模板」，其余按模板名 */
const templateOptions = computed(() => [
  { value: '', label: '不使用模板' },
  ...templates.value.map((t) => ({ value: t.id, label: t.name }))
]);

async function onPickTemplate(id: string): Promise<void> {
  selectedTemplateId.value = id;
  if (!id) return;
  const item = templates.value.find((t) => t.id === id);
  if (!item) return;
  // 纯对象：Pinia 的响应式 Proxy 无法跨 IPC 使用
  await applyTemplateParams(JSON.parse(JSON.stringify(item.params)) as Partial<WatermarkParams>);
}

/** 存为模板：图片水印先把图存为素材，模板只记文件名 */
async function saveAsTemplate(): Promise<void> {
  if (params.type === 'image' && !params.watermarkPath) {
    message('请先选择水印图片', 'warning');
    return;
  }
  const name = await prompt('为新模板输入名称', '存为模板', '我的水印');
  if (name === null) return;
  const title = name.trim() || '我的水印';
  const plain = JSON.parse(JSON.stringify(params)) as WatermarkParams;
  if (plain.type === 'image' && plain.watermarkPath) {
    const saved = await window.api.template.saveAsset(plain.watermarkPath);
    if (!saved) {
      message('水印图片保存失败，请重新选择水印图片', 'error');
      return;
    }
    plain.watermarkPath = saved.fileName;
    // 存完继续用当前绝对路径预览，不影响画面
  }
  const item = await settings.addTemplate('watermark', title, plain);
  if (item) selectedTemplateId.value = item.id;
  message(`已存为模板「${title}」`, 'success');
}

async function pickImage() {
  const files = await selectImageFiles(false);
  if (!files || !files.length) return;
  setImage(files[0]);
  updatePreview();
}

/** 拖入图片：与选择图片走同一套加载流程 */
async function onDrop(path: string) {
  setImage(path);
  updatePreview();
}

function schedulePreview() {
  if (previewTimer) window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updatePreview, 220);
}

async function updatePreview() {
  if (!inputPath.value) return;
  if (params.type === 'image' && !params.watermarkPath) return;
  try {
    const res = await window.api.image.process({
      op: 'watermark',
      inputPath: inputPath.value,
      extra: { ...params } as unknown as Record<string, unknown>
    });
    if (res.buffer) {
      const blob = new Blob([res.buffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = url;
    }
  } catch (err) {
    message('预览失败：' + (err as Error).message, 'error');
  }
}

function extFor(fmt: WatermarkParams['format']): string {
  if (fmt === 'original') {
    const dot = inputPath.value.lastIndexOf('.');
    return dot > 0 ? inputPath.value.slice(dot) : '.png';
  }
  return fmt === 'jpeg' ? '.jpg' : fmt === 'webp' ? '.webp' : '.png';
}

async function save() {
  if (params.type === 'image' && !params.watermarkPath) {
    message('请先选择水印图片', 'warning');
    return;
  }
  // 与其它单图工具一致：走 runSave（先选目录再处理，提示与错误处理统一）
  await runSave(
    (stem) => stem + '_watermarked' + extFor(params.format),
    async (outputPath) => {
      await window.api.image.process({
        op: 'watermark',
        inputPath: inputPath.value,
        outputPath,
        options: {
          format: params.format === 'original' ? undefined : params.format,
          quality: params.quality
        },
        extra: { ...params } as unknown as Record<string, unknown>
      });
    }
  );
}

function openTemplates() {
  window.api.window.open({ route: '/watermark/templates', key: '/watermark/templates' });
}

function openBatch() {
  window.api.window.open({
    route: '/watermark/batch',
    key: 'batch-watermark',
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680
  });
}

watch(params, schedulePreview, { deep: true });

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  if (previewTimer) window.clearTimeout(previewTimer);
});
</script>

<style scoped>
.watermark-tool {
  display: flex;
  gap: calc(var(--design-unit) * 1px * 6);
  height: 100%;
  min-height: 0;
  /* 底部不再抵扣：与其它页面统一为内容区下边距 */
}
.preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--colorNeutralBackground1Hover);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
  overflow: hidden;
}
.dropzone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--design-unit) * 1px * 3.5);
  color: var(--app-fg-secondary);
}
.dz-icon {
  font-size: calc(var(--design-unit) * 1px * 11.5);
  opacity: 0.5;
}
.preview-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--design-unit) * 1px);
  background-color: var(--colorNeutralBackground1);
  background-image: linear-gradient(45deg, var(--colorNeutralBackground3) 25%, transparent 25%),
    linear-gradient(-45deg, var(--colorNeutralBackground3) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--colorNeutralBackground3) 75%),
    linear-gradient(-45deg, transparent 75%, var(--colorNeutralBackground3) 75%);
  background-size: calc(var(--design-unit) * 1px * 5) calc(var(--design-unit) * 1px * 5);
  background-position: 0 0, 0 calc(var(--design-unit) * 1px * 2.5),
    calc(var(--design-unit) * 1px * 2.5) calc(var(--design-unit) * 1px * -2.5),
    calc(var(--design-unit) * 1px * -2.5) 0;
}
.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 calc(var(--design-unit) * 1px * 0.5) calc(var(--design-unit) * 1px * 3) rgba(0, 0, 0, 0.18);
}
.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--design-unit) * 1px * 3);
  padding: calc(var(--design-unit) * 1px * 2.5) calc(var(--design-unit) * 1px * 3.5);
  border-top: 1px solid var(--colorNeutralStroke1);
  background: var(--colorNeutralBackground2);
}
.fname {
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.controls-pane {
  width: 340px;
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-right: calc(-1 * var(--content-pad-x));
}
.controls-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: block;
  gap: 0;
}
/* .batch-entry 顶部渐变与 .controls-footer::before 渐隐由 global.css 统一提供 */
/* 两个入口各占一半：覆盖 global.css 里「单按钮占满一行」的默认宽度 */
.batch-entry {
  display: flex;
  gap: var(--spacingHorizontalM, 12px);
}
.entry-btn {
  flex: 1;
  min-width: 0;
}
.batch-entry fluent-button {
  width: 100%;
}
.save-btn {
  width: 100%;
}
</style>
