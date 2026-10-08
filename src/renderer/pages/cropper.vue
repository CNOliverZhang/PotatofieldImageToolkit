<template>
  <div class="tool">
    <ImagePicker
      :src="originalUrl"
      :name="inputName"
      icon="crop"
      hint="选择一张图片开始裁剪，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    >
      <!-- cropper 画布：单图与批量共用同一个组件（见 components/CropCanvas.vue） -->
      <template #stage>
        <CropCanvas
          v-if="originalUrl"
          :src="originalUrl"
          :region="region"
          :meta="meta"
          :ratio="ratio"
          :position="position"
          initial="center"
        />
      </template>
    </ImagePicker>
    <aside class="controls-pane">
      <div class="batch-entry">
        <fluent-button appearance="neutral" @click="goBatch">
          <font-awesome-icon icon="layer-group" /> 批量裁剪
        </fluent-button>
      </div>
      <div class="controls-body">
        <!-- 裁剪参数：与批量裁剪共用同一组件（单图额外带 cropper.js 画布） -->
        <CropControls
          :region="region"
          :meta="meta"
          use-canvas
          v-model:unit="unit"
          v-model:ratio="ratio"
          v-model:position="position"
        />
        <!-- 输出设置（与水印工具一致） -->
        <SettingsGroup title="输出设置">
          <SettingsRow label="格式">
            <app-select class="ctl-md" :value="format" @change="onFormat">
              <fluent-option value="original">保持原格式</fluent-option>
              <fluent-option value="png">PNG（无损）</fluent-option>
              <fluent-option value="jpeg">JPG（有损）</fluent-option>
              <fluent-option value="webp">WebP（有损）</fluent-option>
            </app-select>
          </SettingsRow>
          <SettingsRow v-if="format === 'jpeg' || format === 'webp'" label="质量">
            <fluent-slider
              class="ctl-slider"
              :value="quality"
              :min="10"
              :max="100"
              :step="1"
              @change="onQuality"
            ></fluent-slider>
            <span class="row-val">{{ quality }}%</span>
          </SettingsRow>
        </SettingsGroup>
      </div>
      <!-- footer 必须位于 controls-body 内部，才能继承其右侧内边距（与水印工具一致） -->
      <div class="controls-footer">
        <fluent-button appearance="primary" class="save-btn" :disabled="processing || !inputPath" @click="onSave">
          {{ processing ? '处理中…' : '保存图片' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useSingleTool, evNum, evVal, extOf } from '@renderer/composables/useSingleTool';
import { clampRegion } from '@renderer/composables/useCropGeometry';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import CropCanvas from '@renderer/components/CropCanvas.vue';
import CropControls from '@renderer/components/CropControls.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { inputPath, inputName, processing, pickImage, setImage, runSave } = useSingleTool();

interface Meta {
  width: number;
  height: number;
}
type RegionKey = 'left' | 'top' | 'width' | 'height';

const meta = ref<Meta | null>(null);
const ratio = ref('free');
const position = ref('nw'); // 默认左上角基准：两轴都可自由拖动（避免初始即锁死）
const unit = ref<'px' | 'ratio'>('px');
const region = reactive({ left: 0, top: 0, width: 0, height: 0 });
const format = ref<'original' | 'png' | 'jpeg' | 'webp'>('original');
const quality = ref(90);

const originalUrl = ref('');


function mimeOf(path: string): string {
  const ext = extOf(path).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.bmp') return 'image/bmp';
  return 'image/png';
}

async function fetchMeta(): Promise<void> {
  if (!inputPath.value) return;
  const res = await window.api.image.process({ op: 'metadata', inputPath: inputPath.value });
  const m = res.info as unknown as Meta;
  meta.value = { width: m.width || 0, height: m.height || 0 };
}

function onFormat(e: Event) {
  format.value = evVal(e) as 'original' | 'png' | 'jpeg' | 'webp';
}
function onQuality(e: Event) {
  quality.value = evNum(e);
}

/** 输出扩展名：跟随所选格式 */
function outExt(): string {
  if (format.value === 'original') return extOf(inputPath.value);
  return format.value === 'jpeg' ? '.jpg' : format.value === 'webp' ? '.webp' : '.png';
}

/** 初始裁剪区域与锚点约束都由 CropCanvas 负责（它 watch region / position / meta） */
function buildOptions() {
  return {
    left: region.left,
    top: region.top,
    width: region.width,
    height: region.height,
    format: format.value === 'original' ? undefined : format.value,
    quality: format.value === 'jpeg' || format.value === 'webp' ? quality.value : undefined
  };
}

/** 载入当前图片：读尺寸 + 生成画布用的 data URI（选择图片与拖入图片共用） */
async function loadInput() {
  await fetchMeta();
  // 画布按原图尺寸挂载（cropper.js 需要真实图片），初始区域由 CropCanvas 给出
  const b64 = await window.api.fs.readFileBase64(inputPath.value);
  originalUrl.value = `data:${mimeOf(inputPath.value)};base64,${b64}`;
}

async function onPick() {
  if (await pickImage()) await loadInput();
}

async function onDrop(path: string) {
  if (setImage(path)) await loadInput();
}

async function onSave() {
  clampRegion(region, meta.value);
  await runSave(
    (stem) => `${stem}_cropped${outExt()}`,
    async (outputPath) => {
      await window.api.image.process({
        op: 'extract',
        inputPath: inputPath.value,
        outputPath,
        options: buildOptions()
      });
    }
  );
}

const goBatch = () => window.api.window.open({
  route: '/cropper/batch',
  key: 'batch-cropper',
  width: 1280,
  height: 820,
  minWidth: 1024,
  minHeight: 680
});


</script>

<style scoped>
/* 画布样式随 CropCanvas 组件带走（含 .cropper-box / .src-img） */
.hint {
  margin: calc(var(--design-unit) * 1px * 2) 0 0;
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
}
/* 定位基准九宫格（与水印工具一致） */
.pos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(var(--design-unit) * 1px * 1.5);
  width: 132px;
  margin-bottom: calc(var(--design-unit) * 1px * 2.5);
}
.pos-cell {
  aspect-ratio: 1;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: calc(var(--borderRadiusMedium) + var(--design-unit) * 1px / 2);
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.12s ease;
}
.pos-cell::after {
  content: '';
  position: absolute;
  width: calc(var(--design-unit) * 1px * 1.75);
  height: calc(var(--design-unit) * 1px * 1.75);
  border-radius: 50%;
  background: var(--app-fg-secondary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.4;
}
.pos-cell.active {
  border-color: var(--accent-base-color);
  background: var(--accent-base-color);
}
.pos-cell.active::after {
  background: #fff;
  opacity: 0.95;
}
</style>
