<template>
  <!-- 与其他工具页同一套布局类（.tool + .controls-pane），保证左右分栏宽度一致 -->
  <div class="tool">
    <!-- 左：统一图片选择/预览组件（含「重新选择」） -->
    <ImagePicker
      :src="previewUrl"
      :name="fileName"
      icon="palette"
      hint="选择一张图片以提取主要色彩，或将图片拖到这里"
      @pick="selectImage"
      @drop="onDrop"
      @load="onImgLoad"
    />

    <!-- 右：控制面板 -->
    <aside class="controls-pane">
      <div class="controls-body palette-body">
      <div class="side-head">
        <SettingsGroup title="提取设置">
          <SettingsRow label="色彩数量" desc="点击色卡可复制色值">
            <app-select class="ctl-md" :value="String(count)" @change="onCount">
              <fluent-option v-for="n in 10" :key="n" :value="String(n)">{{ n }}</fluent-option>
            </app-select>
          </SettingsRow>
        </SettingsGroup>
      </div>

      <!-- 色卡：按数量自适应网格，占满剩余高度，页面不产生滚动 -->
      <div
        v-if="colors.length"
        class="swatches"
        :style="{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }"
      >
        <div
          v-for="(c, i) in colors"
          :key="i"
          class="swatch"
          :style="{ background: c }"
          :title="c"
          @click="copy(c)"
        >
          <span class="hex">{{ c }}</span>
        </div>
      </div>
        <div v-else class="placeholder">
          {{ imagePath ? '提取中…' : '选择图片后自动提取主要色彩' }}
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import ColorThief from 'colorthief';
import { selectImageFiles } from '@renderer/utils/filePicker';
import { useDialog } from '@renderer/composables/useDialog';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const dialog = useDialog();
const imgRef = ref<HTMLImageElement | null>(null);
const imagePath = ref('');
const colors = ref<string[]>([]);
const count = ref(8);
const imgLoaded = ref(false);

/**
 * 预览图：不能直接用 file:// 直读 —— 渲染进程加载 file 子资源会被拦（表现为裂图），
 * 而且 file:// 贴图会让 canvas 被污染，ColorThief 取不到像素。
 * 这里与模板缩略图同一套做法：主进程缩放后回传 buffer，转成 blob URL。
 */
const previewUrl = ref('');

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
}

async function loadPreview(path: string): Promise<void> {
  try {
    const res = await window.api.image.process({
      op: 'resize',
      inputPath: path,
      options: { width: 1200, height: 1200, fit: 'inside' }
    });
    if (!res.buffer) return;
    const url = URL.createObjectURL(new Blob([res.buffer], { type: 'image/png' }));
    clearPreview();
    previewUrl.value = url;
  } catch {
    dialog.message('图片读取失败，请换一张图片', 'error');
  }
}
const fileName = computed(() => imagePath.value.split(/[\\/]/).pop() ?? '');
/** 列数随数量变化，保证网格始终填满且不溢出 */
const gridCols = computed(() => (count.value <= 1 ? 1 : count.value <= 4 ? 2 : count.value <= 9 ? 3 : 4));

function toHex(c: [number, number, number]): string {
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** 载入图片（选择图片与拖入图片共用） */
async function useFile(path: string) {
  imagePath.value = path;
  colors.value = [];
  imgLoaded.value = false;
  await loadPreview(path);
}

async function selectImage() {
  const files = await selectImageFiles(false);
  if (!files || !files.length) return;
  await useFile(files[0]);
}

async function onDrop(path: string) {
  await useFile(path);
}

/** 预览图加载完成：拿到 img 元素供 ColorThief 读取像素 */
function onImgLoad(el: HTMLImageElement) {
  imgRef.value = el ?? null;
  imgLoaded.value = true;
  extract();
}

function extract() {
  if (!imgRef.value || !imgLoaded.value) return;
  try {
    const thief = new ColorThief();
    if (count.value === 1) {
      // 单色时取主色，getPalette 在数量为 1 时行为不稳定
      colors.value = [toHex(thief.getColor(imgRef.value) as [number, number, number])];
      return;
    }
    const palette = thief.getPalette(imgRef.value, count.value) as [number, number, number][];
    colors.value = palette.map(toHex);
  } catch {
    dialog.message('提取失败，请换一张图片', 'error');
  }
}

function onCount(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  if (!v) return;
  count.value = v;
  if (imgLoaded.value) extract(); // 已加载过图片时立即按新数量重新提取
}

watch(count, () => {
  if (imgLoaded.value) extract();
});

function copy(color: string) {
  navigator.clipboard?.writeText(color);
  dialog.message(`已复制 ${color}`, 'success');
}

onBeforeUnmount(clearPreview);
</script>

<style scoped>
/* 右栏：沿用全局 controls-body（宽度/间距与其它工具页一致），但整页不滚动 */
.palette-body {
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 3 * 1px);
  overflow: hidden;
}
.side-head {
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 2 * 1px);
  flex-shrink: 0;
}
/* 分组下方色卡区域撑满剩余高度，故去掉 SettingsGroup 自带的外边距 */
.side-head :deep(.settings-group) {
  margin-bottom: 0;
}
.swatches {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-auto-rows: 1fr;
  gap: calc(var(--design-unit) * 2.5 * 1px);
}
.swatch {
  min-height: 0;
  min-width: 0;
  border-radius: var(--borderRadiusXLarge);
  border: 1px solid var(--colorNeutralStroke1);
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: calc(var(--design-unit) * 1.5 * 1px);
  overflow: hidden;
  transition: transform 0.12s ease;
}
.swatch:hover {
  transform: translateY(calc(var(--design-unit) * -0.5 * 1px));
}
.hex {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.72);
  padding: 1px calc(var(--design-unit) * 1 * 1px);
  border-radius: var(--borderRadiusMedium);
  color: #333;
}
.placeholder {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--app-fg-secondary);
  border: 1px dashed var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
}
</style>
