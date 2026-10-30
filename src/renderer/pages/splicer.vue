<template>
  <div class="tool">
    <!-- 左：拼接结果预览（长图可切换「适应 / 1:1」并滚动查看） -->
    <section class="preview-pane">
      <div v-if="!previewUrl" class="dropzone">
        <font-awesome-icon icon="bars-staggered" class="dz-icon" />
        <p>导入 2 张以上图片后显示拼接预览</p>
      </div>
      <template v-else>
        <!-- 滚轮=移动图片（横向拼接横移、纵向拼接纵移），缩放由下方滑块控制 -->
        <div
          ref="stageEl"
          class="preview-stage"
          :class="{ panning }"
          @wheel.prevent="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <img
            ref="imgEl"
            :src="previewUrl"
            class="preview-img"
            :style="imgStyle"
            alt="拼接预览"
            draggable="false"
            @load="onImgLoad"
          />
        </div>
        <div class="preview-bar">
          <span class="fname">{{ resultSize }}</span>
          <span class="zoom-val">{{ Math.round(displayScale * 100) }}%</span>
        </div>
        <fluent-slider
          class="zoom-slider"
          :value="scaleT"
          min="0"
          max="100"
          title="缩放（最小完整显示、最大铺满预览区）"
          @change="onScale"
        ></fluent-slider>
      </template>
    </section>

    <!-- 右：图片列表（可调序）+ 拼接设置 -->
    <aside class="controls-pane">
      <div class="controls-body">
        <!-- 图片列表：与批量工具左侧导入面板同款容器；高度固定，条目过多时列表内部滚动
             （控制区沿用全局可滚动布局，设置项多时不会被列表挤溢出） -->
        <div
          class="file-panel"
          :class="{ 'drop-active': dragging }"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
        >
          <div class="panel-head">
            <span class="panel-title">拼接图片</span>
            <span class="panel-count">{{ files.length }}</span>
          </div>
          <div class="panel-actions">
            <fluent-button appearance="primary" @click="chooseFiles">选择文件</fluent-button>
            <fluent-button appearance="neutral" @click="scanFolder">扫描文件夹</fluent-button>
          </div>
          <VueDraggable
            v-model="files"
            class="file-list"
            handle=".grip"
            :animation="220"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            ghost-class="is-ghost"
            chosen-class="is-chosen"
            drag-class="is-dragging"
            :force-fallback="true"
            :fallback-on-body="true"
            :fallback-tolerance="3"
          >
            <div v-if="!files.length" class="list-empty">尚未导入图片</div>
            <div v-for="(f, i) in files" :key="f.path" class="file-item">
              <!-- 拖拽手柄：内联 SVG，六点 grip，fill 继承手柄颜色 -->
              <span class="grip" title="按住拖动调整顺序">
                <svg class="grip-icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                  <circle cx="2.5" cy="3" r="1.3" />
                  <circle cx="7.5" cy="3" r="1.3" />
                  <circle cx="2.5" cy="8" r="1.3" />
                  <circle cx="7.5" cy="8" r="1.3" />
                  <circle cx="2.5" cy="13" r="1.3" />
                  <circle cx="7.5" cy="13" r="1.3" />
                </svg>
              </span>
              <span class="idx">{{ i + 1 }}</span>
              <span class="thumb">
                <img v-if="thumbs[f.path]" :src="thumbs[f.path]" alt="" draggable="false" />
                <font-awesome-icon v-else icon="images" class="thumb-ph" />
              </span>
              <span class="name" :title="f.path">{{ f.path.split(/[\\/]/).pop() }}</span>
              <button class="mini" :disabled="i === 0" title="上移" @click="move(i, -1)">↑</button>
              <button class="mini" :disabled="i === files.length - 1" title="下移" @click="move(i, 1)">
                ↓
              </button>
              <button class="mini danger" title="移除" @click="remove(i)">×</button>
            </div>
          </VueDraggable>
          <div v-if="files.length" class="panel-foot">
            <span class="foot-text">按住左侧手柄拖动可调整顺序</span>
            <button class="link-btn" @click="clearAll">清空</button>
          </div>
          <!-- 拖拽悬停提示：覆盖整个面板，明确「松手即追加导入」 -->
          <div v-if="dragging" class="drop-mask">松开鼠标即可导入</div>
        </div>

        <SettingsGroup title="拼接方式">
          <SettingsRow label="排列方向">
            <app-select class="ctl-md" :value="direction" @change="onDirection">
              <fluent-option value="vertical">纵向（上下拼接）</fluent-option>
              <fluent-option value="horizontal">横向（左右拼接）</fluent-option>
            </app-select>
          </SettingsRow>
          <!-- 开关为主项，具体取值（勾选后才出现）为子项 -->
          <SettingsCollapse label="添加边距">
            <template #control>
              <fluent-checkbox :checked="useMargin" @change="useMargin = evChk($event)"></fluent-checkbox>
            </template>
            <SettingsRow v-if="useMargin" label="边距宽度">
              <num-input
                class="ctl-num"
                :value="margin"
                min="0"
                max="500"
                @input="margin = evNum($event)"
              ><span slot="end">px</span></num-input>
            </SettingsRow>
          </SettingsCollapse>
          <SettingsCollapse label="添加底色">
            <template #control>
              <fluent-checkbox :checked="useBg" @change="useBg = evChk($event)"></fluent-checkbox>
            </template>
            <SettingsRow v-if="useBg" label="底色">
              <input class="color" type="color" :value="bgColor" @input="onColor" />
              <span class="row-val">{{ bgColor }}</span>
            </SettingsRow>
          </SettingsCollapse>
        </SettingsGroup>

        <SettingsGroup title="输出设置">
          <SettingsCollapse label="格式">
            <template #control>
              <app-select class="ctl-md" :value="out.format" @change="onFormat">
                <fluent-option value="png">PNG（无损）</fluent-option>
                <fluent-option value="jpeg">JPG（有损）</fluent-option>
                <fluent-option value="webp">WebP（有损）</fluent-option>
              </app-select>
            </template>
            <SettingsRow v-if="lossy" label="质量">
              <fluent-slider
                class="ctl-slider"
                :value="out.quality"
                :min="10"
                :max="100"
                :step="1"
                @change="out.quality = evNum($event)"
              ></fluent-slider>
              <span class="row-val">{{ out.quality }}</span>
            </SettingsRow>
          </SettingsCollapse>
        </SettingsGroup>

        <p v-if="overLimit" class="warn">{{ limitHint }}</p>

      </div>
      <!-- footer 必须位于 controls-body 内部，才能继承其右侧内边距（与水印工具一致） -->
      <div class="controls-footer">
        <fluent-button
          appearance="primary"
          class="save-btn"
          :disabled="files.length < 2 || processing || overLimit"
          @click="run"
        >
          {{ processing ? '处理中…' : '开始拼接' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { selectImageFiles, selectDirectory } from '@renderer/utils/filePicker';
import { scanImageDirectory, type BatchItem } from '@renderer/utils/directoryScanner';
import { relativePath } from '@renderer/utils/fileIO';
import { useDialog } from '@renderer/composables/useDialog';
import { evChk, evNum, evVal, useSingleTool } from '@renderer/composables/useSingleTool';
import { useFileDrop } from '@renderer/composables/useFileDrop';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import {
  createOutputOpts,
  isLossy,
  outExt,
  withOutput,
  type OutputOpts
} from '@renderer/composables/useOutputSettings';
import type { DefaultOutputFormat } from '@renderer/stores/settings';
import NumInput from '@renderer/components/NumInput.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { message } = useDialog();
/** 复用单图工具的保存流程：点击保存时选择目录，输出一张图片 */
const { inputPath, processing, runSave } = useSingleTool();

const files = ref<BatchItem[]>([]);
const direction = ref<'vertical' | 'horizontal'>('vertical');
const useMargin = ref(false);
const margin = ref(20);
const useBg = ref(false);
const bgColor = ref('#ffffff');

/** 列表项缩略图：path -> blob url */
const thumbs = ref<Record<string, string>>({});

const previewUrl = ref('');
const imgEl = ref<HTMLImageElement | null>(null);
const stageEl = ref<HTMLElement | null>(null);
const natural = reactive({ w: 0, h: 0 });
/** 预览区可视尺寸 */
const view = reactive({ w: 0, h: 0 });
/** 缩放：0=完整显示(contain)，100=铺满预览区(cover) */
const scaleT = ref(0);
/** 平移偏移（像素）。横向拼接只用 x、纵向拼接只用 y，另一轴恒为 0 以保持居中 */
const offset = reactive({ x: 0, y: 0 });
const panning = ref(false);
let panStart = { x: 0, y: 0, ox: 0, oy: 0 };
let previewTimer: number | undefined;
let lastUrl = '';
let ro: ResizeObserver | undefined;

/** 真实输出尺寸（预览图被等比缩小，故由主进程返回） */
const resultW = ref(0);
const resultH = ref(0);

const resultSize = computed(() => (resultW.value && resultH.value ? `拼接结果 ${resultW.value} × ${resultH.value}` : '拼接预览'));

/** libvips 像素上限：超过后无法输出，提前提示 */
const PIXEL_LIMIT = 268402689;
const overLimit = computed(() => resultW.value * resultH.value > PIXEL_LIMIT);
const limitHint = computed(() =>
  overLimit.value
    ? `输出约 ${Math.round((resultW.value * resultH.value) / 1e6)} 百万像素，超过上限 ${Math.floor(
        PIXEL_LIMIT / 1e6
      )} 百万像素，请减少图片数量或缩小图片`
    : ''
);

/** contain 缩放：完整显示 */
const fitScale = computed(() => {
  if (!natural.w || !natural.h || !view.w || !view.h) return 1;
  return Math.min(view.w / natural.w, view.h / natural.h);
});
/** cover 缩放：铺满预览区 */
const fillScale = computed(() => {
  if (!natural.w || !natural.h || !view.w || !view.h) return 1;
  return Math.max(view.w / natural.w, view.h / natural.h);
});
/** 相对 contain 的放大倍数（1 ~ cover/contain） */
const relScale = computed(() => {
  const base = fitScale.value || 1;
  return 1 + (fillScale.value / base - 1) * (scaleT.value / 100);
});
/** 相对原图的实际显示倍率（仅用于显示百分比） */
const displayScale = computed(() => fitScale.value * relScale.value);
/** 基础渲染尺寸 = contain 尺寸，再用 transform 放大，避免大图按原始像素渲染 */
const baseSize = computed(() => ({
  w: Math.round(natural.w * fitScale.value),
  h: Math.round(natural.h * fitScale.value)
}));
/** 各轴可平移的最大距离 */
const maxOffset = computed(() => ({
  x: Math.max(0, (baseSize.value.w * relScale.value - view.w) / 2),
  y: Math.max(0, (baseSize.value.h * relScale.value - view.h) / 2)
}));

const imgStyle = computed(() => ({
  width: `${baseSize.value.w}px`,
  height: `${baseSize.value.h}px`,
  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${relScale.value})`,
  transition: panning.value ? 'none' : 'transform 0.1s ease-out'
}));

/** 横向拼接：始终垂直居中，只允许左右移动；纵向拼接反之 */
function setOffset(nx: number, ny: number) {
  const m = maxOffset.value;
  const clamp = (v: number, lim: number) => Math.min(lim, Math.max(-lim, v));
  if (direction.value === 'horizontal') {
    offset.x = clamp(nx, m.x);
    offset.y = 0;
  } else {
    offset.x = 0;
    offset.y = clamp(ny, m.y);
  }
}

/** 滚轮=移动图片：横向拼接横移，纵向拼接纵移 */
function onWheel(e: WheelEvent) {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (direction.value === 'horizontal') setOffset(offset.x - d, 0);
  else setOffset(0, offset.y - d);
}

function onPointerDown(e: PointerEvent) {
  panning.value = true;
  panStart = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
}
function onPointerMove(e: PointerEvent) {
  if (!panning.value) return;
  setOffset(panStart.ox + (e.clientX - panStart.x), panStart.oy + (e.clientY - panStart.y));
}
function onPointerUp() {
  panning.value = false;
}

function onScale(e: Event) {
  scaleT.value = Number((e.target as HTMLInputElement).value);
  setOffset(offset.x, offset.y); // 缩放后重新夹紧偏移
}

/** 图片尺寸或预览区尺寸变化后，把偏移夹回合法范围 */
function measureView() {
  if (stageEl.value) {
    view.w = stageEl.value.clientWidth;
    view.h = stageEl.value.clientHeight;
  }
  setOffset(offset.x, offset.y);
}

function revoke(url: string) {
  if (url) URL.revokeObjectURL(url);
}

function dedupe(list: BatchItem[]): BatchItem[] {
  const seen = new Set<string>();
  return list.filter((it) => (seen.has(it.path) ? false : (seen.add(it.path), true)));
}

/** 拖拽导入：图片直接追加，文件夹按「扫描文件夹」的规则递归展开 */
const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop({
  onFiles(list) {
    files.value = dedupe([...files.value, ...list]);
  },
  onRejected(count) {
    message(`已忽略 ${count} 个非图片文件`, 'warning');
  }
});

async function chooseFiles() {
  const res = await selectImageFiles(true);
  if (!res) return;
  files.value = dedupe([...files.value, ...res.map((p) => ({ path: p, rel: p.split(/[\\/]/).pop() ?? p }))]);
}

async function scanFolder() {
  const d = await selectDirectory();
  if (!d) return;
  const r = await scanImageDirectory(d);
  const paths = [...r.fileList, ...r.errorList.map((e) => e.path)];
  if (!paths.length) return;
  files.value = dedupe([...files.value, ...paths.map((p) => ({ path: p, rel: relativePath(d, p) }))]);
}

/** 预览长边上限：避免几十张长图预览时生成/传输 GB 级图片（主进程还会限制总像素） */
const PREVIEW_MAX_DIMENSION = 10000;

/** 预览与导出共用的拼接参数（预览会等比缩小，导出走全尺寸） */
function appendExtra(preview = false) {
  return {
    images: files.value.map((f) => f.path),
    direction: direction.value,
    margin: useMargin.value ? margin.value : 0,
    background: useBg.value ? bgColor.value : '',
    ...(preview ? { maxDimension: PREVIEW_MAX_DIMENSION } : {})
  };
}

/** 调整拼接顺序（按钮方式） */
function move(i: number, delta: number) {
  const next = files.value.slice();
  const j = i + delta;
  if (j < 0 || j >= next.length) return;
  [next[i], next[j]] = [next[j], next[i]];
  files.value = next;
}

/** 为列表项生成缩略图（主进程 sharp 缩放，避免大图在列表里整张解码） */
async function ensureThumbs(list: { path: string }[]): Promise<void> {
  for (const it of list) {
    if (thumbs.value[it.path]) continue;
    try {
      const res = await window.api.image.process({
        op: 'resize',
        inputPath: it.path,
        options: { width: 96, fit: 'inside' }
      });
      if (res.buffer) {
        thumbs.value[it.path] = URL.createObjectURL(new Blob([res.buffer], { type: 'image/png' }));
      }
    } catch {
      /* 缩略图失败不影响列表与拼接 */
    }
  }
}

/** 清理已不在列表中的缩略图 */
function pruneThumbs(list: { path: string }[]): void {
  const keep = new Set(list.map((f) => f.path));
  const next: Record<string, string> = {};
  for (const [p, url] of Object.entries(thumbs.value)) {
    if (keep.has(p)) next[p] = url;
    else URL.revokeObjectURL(url);
  }
  thumbs.value = next;
}

function remove(i: number) {
  files.value = files.value.filter((_, idx) => idx !== i);
}

function clearAll() {
  files.value = [];
}

function onColor(e: Event) {
  bgColor.value = (e.target as HTMLInputElement).value;
}

/** 输出格式/质量：默认取设置页的「默认输出」（拼接无「保持原格式」概念，默认 PNG） */
const out: OutputOpts = createOutputOpts();
if (out.format === 'original') out.format = 'png';
const lossy = computed(() => isLossy(out.format));

function onFormat(e: Event) {
  out.format = (e.target as HTMLInputElement).value as DefaultOutputFormat;
}

function onDirection(e: Event) {
  direction.value = evVal(e) as 'vertical' | 'horizontal';
}

function onImgLoad() {
  if (imgEl.value) {
    natural.w = imgEl.value.naturalWidth;
    natural.h = imgEl.value.naturalHeight;
  }
  measureView();
}

/** 生成拼接预览（无 outputPath 时主进程返回 buffer） */
async function refresh() {
  if (files.value.length < 2) {
    revoke(previewUrl.value);
    previewUrl.value = '';
    return;
  }
  try {
    const res = await window.api.image.process({
      op: 'append',
      inputPath: files.value[0].path,
      extra: appendExtra(true)
    });
    // 预览是等比缩小的，这里显示真实输出尺寸
    resultW.value = res.width ?? 0;
    resultH.value = res.height ?? 0;
    if (res.buffer) {
      const url = URL.createObjectURL(new Blob([res.buffer], { type: 'image/png' }));
      revoke(lastUrl);
      lastUrl = url;
      previewUrl.value = url;
    }
  } catch {
    revoke(previewUrl.value);
    previewUrl.value = '';
  }
}

function schedulePreview(delay = 500) {
  if (previewTimer) window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(refresh, delay);
}

/** 预览区尺寸随窗口变化，需重新计算 contain/cover 与平移边界 */
watch(previewUrl, async () => {
  await nextTick();
  measureView();
  ro?.disconnect();
  if (stageEl.value) {
    ro = new ResizeObserver(() => measureView());
    ro.observe(stageEl.value);
  }
});

watch(
  files,
  (list) => {
    pruneThumbs(list);
    ensureThumbs(list);
  },
  { deep: true }
);

watch(
  [files, direction, useMargin, margin, useBg, bgColor],
  () => {
    // 供保存流程推导默认文件名/目录
    inputPath.value = files.value[0]?.path ?? '';
    schedulePreview();
  },
  { deep: true }
);

/** 单图输出：点击后选择保存位置，拼接为一张图片 */
async function run() {
  if (files.value.length < 2) {
    message('请至少导入 2 张图片', 'warning');
    return;
  }
  await runSave(
    (stem) => `${stem}_spliced${outExt(out.format, files.value[0].path)}`,
    async (outputPath) => {
      await window.api.image.process({
        op: 'append',
        inputPath: files.value[0].path,
        outputPath,
        options: withOutput({}, out),
        extra: appendExtra()
      });
    }
  );
}

onBeforeUnmount(() => {
  ro?.disconnect();
  for (const url of Object.values(thumbs.value)) URL.revokeObjectURL(url);
  if (previewTimer) window.clearTimeout(previewTimer);
  revoke(previewUrl.value);
  revoke(lastUrl);
});
</script>

<style scoped>
/* 图片列表：可拖动调节顺序，因此每项带序号 + 上移/下移。
   面板高度固定、列表内部滚动；控制区沿用全局的可滚动布局，设置项多时不会被挤出可视区 */
.file-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 340px;
  flex-shrink: 0;
  margin-bottom: calc(var(--design-unit) * 1px * 5.5);
  background: var(--colorNeutralBackground2);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
  padding: calc(var(--design-unit) * 1px * 3);
}
/* 拖拽悬停：整块导入区描边强调色 */
.file-panel.drop-active {
  outline: 2px dashed var(--accent-base-color);
  outline-offset: -2px;
}
.drop-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--colorNeutralBackground2) 82%, transparent);
  color: var(--neutral-foreground-rest);
  font-size: var(--fontSizeBase300);
  pointer-events: none;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(var(--design-unit) * 1px * 2.5);
}
.panel-title {
  font-size: var(--fontSizeBase300);
  font-weight: 600;
}
.panel-count {
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
  background: var(--colorNeutralBackground1Hover);
  border-radius: var(--borderRadiusMedium);
  padding: calc(var(--design-unit) * 1px * 0.5) calc(var(--design-unit) * 1px * 2);
}
.panel-actions {
  display: flex;
  gap: calc(var(--design-unit) * 1px * 2);
  margin-bottom: calc(var(--design-unit) * 1px * 3);
}
.panel-actions fluent-button {
  flex: 1;
}
.file-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 1px * 1.5);
  padding-right: calc(var(--design-unit) * 1px);
}
.list-empty {
  color: var(--app-fg-secondary);
  font-size: var(--fontSizeBase200);
  text-align: center;
  padding: calc(var(--design-unit) * 1px * 6) 0;
}
.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--design-unit) * 1px * 2);
  margin-top: calc(var(--design-unit) * 1px * 2.5);
  padding-top: calc(var(--design-unit) * 1px * 2.5);
  border-top: 1px solid var(--colorNeutralStroke1);
}
.foot-text {
  font-size: 11px;
  color: var(--app-fg-secondary);
}
.link-btn {
  border: 1px solid var(--colorNeutralStroke1);
  background: transparent;
  color: var(--accent-base-color);
  padding: calc(var(--design-unit) * 1px * 1) calc(var(--design-unit) * 1px * 2.5);
  border-radius: calc(var(--borderRadiusMedium) + var(--design-unit) * 1px / 2);
  cursor: pointer;
  font-size: var(--fontSizeBase200);
}
.link-btn:hover {
  background: var(--colorNeutralBackground1Hover);
}

.file-item {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 1.5 * 1px);
  min-height: calc(var(--design-unit) * 13 * 1px);
  padding: calc(var(--design-unit) * 1.5 * 1px) calc(var(--design-unit) * 2 * 1px);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: calc(var(--borderRadiusMedium) + var(--design-unit) * 1px / 2);
  background: var(--colorNeutralBackground1);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.file-item:hover {
  border-color: var(--accent-base-color);
}
/* 拖拽中的状态（vue-draggable-plus / SortableJS）：
   ghost=原位置占位，chosen=选中，dragging=跟随鼠标的元素 */
.file-item.is-ghost {
  opacity: 0.45;
  border-style: dashed;
  background: var(--colorNeutralBackground1Hover);
}
.file-item.is-chosen {
  cursor: grabbing;
}
.file-item.is-dragging {
  box-shadow: 0 calc(var(--design-unit) * 1px) calc(var(--design-unit) * 4 * 1px) rgba(0, 0, 0, 0.28);
  transform: scale(1.02);
  border-color: var(--accent-base-color);
}
.grip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 calc(var(--design-unit) * 0.5 * 1px);
  color: var(--app-fg-secondary);
  cursor: grab;
}
.grip-icon {
  display: block;
  width: 10px;
  height: 16px;
  fill: currentColor;
  pointer-events: none; /* 保证拖拽事件落在手柄容器上 */
}
.grip:hover {
  color: var(--colorNeutralForeground1);
}
.grip:active {
  cursor: grabbing;
}
.thumb {
  flex-shrink: 0;
  width: calc(var(--design-unit) * 10 * 1px);
  height: calc(var(--design-unit) * 10 * 1px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--borderRadiusMedium);
  background: var(--colorNeutralBackground1Hover);
}
.thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.thumb-ph {
  color: var(--app-fg-secondary);
  opacity: 0.6;
}
.color {
  width: 40px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: none;
  cursor: pointer;
}
.color-val {
  font-size: 11px;
  color: var(--app-fg-secondary);
}
/* 输出尺寸超限预警 */
.warn {
  flex-shrink: 0;
  margin-bottom: calc(var(--design-unit) * 2 * 1px);
  padding: calc(var(--design-unit) * 1.5 * 1px) calc(var(--design-unit) * 2 * 1px);
  border: 1px solid var(--accent-base-color);
  border-radius: var(--borderRadiusMedium);
  font-size: 11px;
  line-height: 1.5;
  color: var(--accent-base-color);
}
.idx {
  flex-shrink: 0;
  width: calc(var(--design-unit) * 5 * 1px);
  font-size: 11px;
  color: var(--app-fg-secondary);
  text-align: center;
}
.name {
  flex: 1;
  min-width: 0;
  font-size: var(--fontSizeBase200);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini {
  flex-shrink: 0;
  width: calc(var(--design-unit) * 5 * 1px);
  height: calc(var(--design-unit) * 5 * 1px);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: transparent;
  color: var(--colorNeutralForeground1);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}
.mini:disabled {
  opacity: 0.35;
  cursor: default;
}
.mini.danger:hover {
  color: var(--accent-base-color);
  border-color: var(--accent-base-color);
}
/* 预览区：滚轮/拖动平移，缩放由下方滑块控制（不出现滚动条） */
.preview-stage {
  position: relative;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}
.preview-stage.panning {
  cursor: grabbing;
}
/* 覆盖全局预览图的 contain 约束：这里用固定尺寸 + transform 控制显示 */
.preview-img {
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: none;
  max-height: none;
  object-fit: fill;
}
.zoom-slider {
  flex-shrink: 0;
  width: 100%;
  margin-top: calc(var(--design-unit) * 0.5 * 1px);
}
.zoom-ctl {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 1.5 * 1px);
  flex-shrink: 0;
}
.zoom-btn {
  border: 1px solid var(--colorNeutralStroke1);
  background: transparent;
  color: var(--colorNeutralForeground1);
  font-size: 12px;
  padding: calc(var(--design-unit) * 0.75 * 1px) calc(var(--design-unit) * 2 * 1px);
  border-radius: var(--borderRadiusMedium);
  cursor: pointer;
}
.zoom-btn.sel {
  border-color: var(--accent-base-color);
  color: var(--accent-base-color);
}
.zoom-val {
  font-size: 11px;
  color: var(--app-fg-secondary);
  min-width: 38px;
  text-align: right;
}
</style>
