<template>
  <!-- cropper.js 需要挂在真实 img 上；容器 absolute 铺满 .preview-stage（见 global.css 的 position: relative） -->
  <div ref="boxEl" class="cropper-box">
    <img
      ref="imgEl"
      :key="src"
      :src="src"
      class="src-img"
      alt="预览"
      @load="onImgLoad"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 裁剪画布（cropper.js）：单图裁剪与批量裁剪共用。
 *
 * 只负责「画布 ↔ 裁剪区域」的双向同步，参数面板由 CropControls 负责：
 * - 外部改 region / ratio / position → 同步到画布
 * - 在画布上拖拽 / 缩放裁剪框 → 写回 region 并 emit change
 *
 * 定位基准（position）约束：居中方向的轴会被拉回居中，两个方向都居中时禁止移动裁剪框。
 */
import { onBeforeUnmount, ref, watch } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import {
  clampRegion,
  hAlignOf,
  vAlignOf,
  type CropMeta,
  type CropRegion,
  ratioValue
} from '@renderer/composables/useCropGeometry';

const props = withDefaults(
  defineProps<{
    /** 预览图地址（data URI / blob URL 均可，必须与原图同尺寸） */
    src: string;
    /** 裁剪区域（父级 reactive 对象，直接读写；单位为原图像素） */
    region: CropRegion;
    /** 当前参考图尺寸 */
    meta: CropMeta | null;
    /** 比例设置：free / 1:1 / 4:3 / 16:9 / 3:2 / 2:3，或自定义（"3:2"、"21:9"、"1.85"） */
    ratio?: string;
    /** 定位基准（nw / n / center ...） */
    position?: string;
    /** 初始区域：center = 居中 60%（单图），full = 整图（批量） */
    initial?: 'center' | 'full';
  }>(),
  { ratio: 'free', position: 'nw', initial: 'center' }
);

const emit = defineEmits<{ change: [] }>();

const RATIOS: Record<string, [number, number]> = {
  '1:1': [1, 1],
  '4:3': [4, 3],
  '16:9': [16, 9],
  '3:2': [3, 2],
  '2:3': [2, 3]
};

const imgEl = ref<HTMLImageElement | null>(null);
const boxEl = ref<HTMLElement | null>(null);

let cropper: Cropper | null = null;
let cropperReady = false;
let syncing = false;
let boxResizeObserver: ResizeObserver | null = null;
let initTimer: number | null = null;
let lastInitSize = { w: 0, h: 0 };
let refitAttempts = 0;

const hAlign = () => hAlignOf(props.position ?? 'nw');
const vAlign = () => vAlignOf(props.position ?? 'nw');

/** 等容器尺寸稳定后再初始化：否则 cropper 会按错误的中间尺寸缩放画布，导致裁剪框被钳死 */
function scheduleCropperInit(delay = 120) {
  if (initTimer) window.clearTimeout(initTimer);
  initTimer = window.setTimeout(() => {
    initTimer = null;
    if (!imgEl.value) return;
    if (cropper) {
      syncRegionFromCropper(); // 重建前保留当前裁剪区域
      cropper.destroy();
      cropper = null;
    }
    cropperReady = false;
    initCropper();
  }, delay);
}

/** 容器尺寸变化后重建 cropper，按新尺寸重新适配画布 */
function setupBoxObserver() {
  const el = boxEl.value;
  if (!el || typeof ResizeObserver === 'undefined') return;
  let lastW = 0;
  let lastH = 0;
  let first = true; // 首次回调仅记录尺寸
  boxResizeObserver?.disconnect();
  boxResizeObserver = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect;
    if (!r) return;
    const changed = Math.abs(r.width - lastW) > 1 || Math.abs(r.height - lastH) > 1;
    lastW = r.width;
    lastH = r.height;
    if (first) {
      first = false;
      return;
    }
    if (changed) scheduleCropperInit();
  });
  boxResizeObserver.observe(el);
}

/** 画布仍溢出容器且容器尺寸已变：按新尺寸重建（限次防死循环） */
function ensureCanvasFitted() {
  if (!cropper) return;
  const c = cropper.getCanvasData();
  const cont = cropper.getContainerData();
  const overflow = c.width > cont.width * 1.02 || c.height > cont.height * 1.02;
  if (!overflow) {
    refitAttempts = 0;
    return;
  }
  const el = boxEl.value;
  const cur = el
    ? { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }
    : lastInitSize;
  const containerChanged = Math.abs(cur.w - lastInitSize.w) > 1 || Math.abs(cur.h - lastInitSize.h) > 1;
  if (containerChanged && refitAttempts < 3) {
    refitAttempts++;
    scheduleCropperInit(60);
  }
}

/** 居中方向的轴拉回居中，返回是否发生修正 */
function enforceAnchors(): boolean {
  const m = props.meta;
  if (!m) return false;
  let changed = false;
  if (hAlign() === 'center') {
    const wantLeft = Math.round((m.width - props.region.width) / 2);
    if (props.region.left !== wantLeft) {
      props.region.left = wantLeft;
      changed = true;
    }
  }
  if (vAlign() === 'middle') {
    const wantTop = Math.round((m.height - props.region.height) / 2);
    if (props.region.top !== wantTop) {
      props.region.top = wantTop;
      changed = true;
    }
  }
  return changed;
}

/** 两轴都居中时禁止移动裁剪框（避免拖拽后被拉回的抖动） */
function updateMovable() {
  if (!cropper) return;
  const fixed = hAlign() === 'center' && vAlign() === 'middle';
  // cropperjs v1 的类型定义里没有 options，运行期可用
  (cropper as unknown as { options: { cropBoxMovable: boolean } }).options.cropBoxMovable = !fixed;
}

function applyAspect() {
  if (!cropper) return;
  // 预设表里没有就按自定义比例解析（如 3:2、21:9、1.85）
  const r = RATIOS[props.ratio ?? 'free'];
  const v = r ? r[0] / r[1] : ratioValue(props.ratio ?? '');
  cropper.setAspectRatio(v ?? NaN);
}

/** region → 画布 */
function applyRegionToCropper() {
  if (!cropper || !cropperReady || syncing) return;
  syncing = true;
  cropper.setData({
    x: props.region.left,
    y: props.region.top,
    width: props.region.width,
    height: props.region.height
  });
  syncing = false;
}

/** 画布 → region */
function syncRegionFromCropper() {
  if (!cropper || syncing) return;
  // getData(true) 返回原始图像坐标系（与 sharp extract 一致）
  const d = cropper.getData(true);
  syncing = true;
  props.region.left = Math.round(d.x);
  props.region.top = Math.round(d.y);
  props.region.width = Math.round(d.width);
  props.region.height = Math.round(d.height);
  const corrected = enforceAnchors();
  syncing = false;
  if (corrected) applyRegionToCropper();
}

/** 初始区域：单图居中 60%，批量用整图 */
function initRegion() {
  const m = props.meta;
  if (!m) return;
  if (props.initial === 'full') {
    props.region.left = 0;
    props.region.top = 0;
    props.region.width = m.width;
    props.region.height = m.height;
  } else {
    const w = Math.max(1, Math.round(m.width * 0.6));
    const h = Math.max(1, Math.round(m.height * 0.6));
    props.region.left = Math.round((m.width - w) / 2);
    props.region.top = Math.round((m.height - h) / 2);
    props.region.width = w;
    props.region.height = h;
  }
  clampRegion(props.region, m);
  applyRegionToCropper();
}

function initCropper() {
  if (!imgEl.value || cropper) return;
  setupBoxObserver();
  const b = boxEl.value;
  lastInitSize = b
    ? { w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) }
    : { w: 0, h: 0 };
  cropper = new Cropper(imgEl.value, {
    viewMode: 1, // 裁剪框不允许超出画布
    dragMode: 'none', // 禁止在画布上拖拽（不平移图片、不新建框），只允许调整裁剪框
    autoCrop: true,
    autoCropArea: 0.6, // 仅决定初始视觉占比，最终由 ready 里的 initRegion 覆盖
    background: true,
    guides: true,
    center: true,
    highlight: false,
    movable: false,
    zoomable: false,
    zoomOnWheel: false,
    zoomOnTouch: false,
    scalable: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    responsive: true,
    restore: true,
    ready() {
      cropperReady = true;
      updateMovable();
      applyAspect();
      // 重建时保留已有区域；仅首次初始化用默认区域
      if (props.region.width > 0 && props.region.height > 0) applyRegionToCropper();
      else initRegion();
      ensureCanvasFitted();
    },
    crop() {
      if (syncing) return;
      syncRegionFromCropper();
      emit('change');
    }
  });
}

function onImgLoad() {
  if (!imgEl.value) return;
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropperReady = false;
  scheduleCropperInit();
}

/** 换图（批量里切换选中项）时重置适配计数 */
watch(
  () => props.src,
  () => {
    refitAttempts = 0;
  }
);
watch(() => props.ratio, applyAspect);
watch(
  () => props.position,
  () => {
    updateMovable();
    if (enforceAnchors()) applyRegionToCropper();
  }
);
// 参数面板改了区域 → 同步到画布
watch(
  () => [props.region.left, props.region.top, props.region.width, props.region.height],
  () => {
    if (syncing) return;
    applyRegionToCropper();
  }
);
// 参考图尺寸就绪且还没有区域时给一个初始值
watch(
  () => props.meta,
  (m) => {
    if (!m) return;
    if (!props.region.width || !props.region.height) initRegion();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (initTimer) {
    window.clearTimeout(initTimer);
    initTimer = null;
  }
  boxResizeObserver?.disconnect();
  boxResizeObserver = null;
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});

defineExpose({
  /** 供父级「使用整图」等快捷操作后强制刷新画布 */
  refresh: applyRegionToCropper
});
</script>

<style scoped>
.cropper-box {
  position: absolute;
  inset: 0;
}
.src-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
</style>
