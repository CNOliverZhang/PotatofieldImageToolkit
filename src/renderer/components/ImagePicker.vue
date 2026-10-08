<template>
  <!-- 统一的图片选择/预览区：未选图时占位、选图后在同一个框内预览并带「重新选择」。
       支持把图片直接拖进来（拖到未选图的占位框、或拖到已选图的预览区均可替换）。
       样式复用 global.css 的 .preview-pane / .dropzone / .preview-stage / .preview-bar。
       需要自定义预览主体时用 #stage 插槽（如裁剪工具要挂 cropper.js），
       需要在底部信息条下方追加内容时用默认插槽（如 EXIF 的元数据表）。 -->
  <section
    class="preview-pane"
    :class="{ 'drop-active': dragging }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div v-if="!src" class="dropzone" @click="emit('pick')">
      <font-awesome-icon :icon="icon" class="dz-icon" />
      <p>{{ dragging ? '松开鼠标即可打开' : hint }}</p>
      <fluent-button appearance="primary" @click.stop="emit('pick')">选择图片</fluent-button>
    </div>
    <template v-else>
      <div class="preview-stage">
        <slot name="stage">
          <img :src="src" class="preview-img" alt="预览" @load="onLoad" />
        </slot>
      </div>
      <div class="preview-bar">
        <span class="fname">{{ name }}</span>
        <fluent-button appearance="neutral" @click="emit('pick')">重新选择</fluent-button>
      </div>
      <slot />
    </template>
    <!-- 拖拽悬停提示：覆盖整个预览区（含已选图状态），明确「松手即替换」 -->
    <div v-if="dragging && src" class="drop-mask">松开鼠标以替换为该图片</div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IMAGE_EXTENSIONS } from '@renderer/utils/filePicker';
import { useDialog } from '@renderer/composables/useDialog';

withDefaults(
  defineProps<{
    /** 预览图地址（为空则显示占位框） */
    src?: string;
    /** 底部显示的文件名 */
    name?: string;
    /** 占位提示文案 */
    hint?: string;
    /** 占位图标（font-awesome 名称） */
    icon?: string;
  }>(),
  { icon: 'image' }
);

const emit = defineEmits<{
  pick: [];
  /** 拖入图片：回传本地文件路径（Electron 的 File.path） */
  drop: [string];
  /** 图片加载完成，回传 img 元素（供色彩提取等需要直接读像素的场景使用） */
  load: [HTMLImageElement];
}>();

const { message } = useDialog();
const dragging = ref(false);
/** 拖拽进入/离开的嵌套计数：避免划过子元素时误判为离开 */
let depth = 0;

function hasFiles(e: DragEvent): boolean {
  const types = e.dataTransfer?.types;
  return !!types && Array.prototype.includes.call(types, 'Files');
}

function onDragEnter(e: DragEvent) {
  if (!hasFiles(e)) return;
  depth++;
  dragging.value = true;
}

function onDragOver(e: DragEvent) {
  if (!hasFiles(e)) return;
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  dragging.value = true;
}

function onDragLeave() {
  depth = Math.max(0, depth - 1);
  if (depth === 0) dragging.value = false;
}

/** 取文件绝对路径：新版 Electron 移除了 File.path，统一用 preload 暴露的 webUtils */
function pathOfFile(file: File): string {
  try {
    // 兼容旧版本 Electron 仍带 path 的情况
    const legacy = (file as File & { path?: string }).path;
    if (legacy) return legacy;
    return window.api.fs.getPathOfFile(file) || '';
  } catch {
    return '';
  }
}

function onDrop(e: DragEvent) {
  depth = 0;
  dragging.value = false;
  const file = Array.from(e.dataTransfer?.files ?? [])[0];
  const path = file ? pathOfFile(file) : '';
  if (!path) return;
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    message(`不支持的文件格式：${ext || '未知'}`, 'warning');
    return;
  }
  emit('drop', path);
}

function onLoad(e: Event) {
  emit('load', e.target as HTMLImageElement);
}
</script>

<style scoped>
.preview-pane {
  position: relative;
}
/* 拖拽悬停：整块预览区描边强调色 */
.preview-pane.drop-active {
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
  border-radius: calc(var(--layer-corner-radius) * 1px);
  background: color-mix(in srgb, var(--app-card) 78%, transparent);
  color: var(--neutral-foreground-rest);
  font-size: var(--type-ramp-base-font-size);
  pointer-events: none;
}
</style>
