<template>
  <div
    class="import-panel"
    :class="{ 'drop-active': dragging }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="import-head">
      <span class="import-title">导入图片</span>
      <span class="import-count">{{ modelValue.length }}</span>
    </div>
    <div class="import-actions">
      <fluent-button appearance="primary" @click="chooseFiles">选择文件</fluent-button>
      <fluent-button appearance="neutral" @click="scanFolder">扫描文件夹</fluent-button>
    </div>
    <div class="import-list">
      <div v-if="!modelValue.length" class="import-empty">尚未导入图片，可将图片或文件夹拖到这里</div>
      <div
        v-for="item in modelValue"
        :key="item.path"
        :class="['import-item', { active: item.path === selected }]"
        @click="select(item.path)"
      >
        <span class="item-name" :title="item.path">{{ item.path.split(/[\\/]/).pop() }}</span>
        <button class="item-remove" @click.stop="remove(item.path)" title="移除">×</button>
      </div>
    </div>
    <div class="import-foot" v-if="modelValue.length">
      <span class="foot-text">已选：{{ selected ? selected.split(/[\\/]/).pop() : '无' }}</span>
      <button class="link-btn" @click="clear">清空</button>
    </div>
    <!-- 拖拽悬停提示：覆盖整个面板，明确「松手即追加导入」 -->
    <div v-if="dragging" class="drop-mask">松开鼠标即可导入</div>
  </div>
</template>

<script setup lang="ts">
import { selectImageFiles, selectDirectory } from '@renderer/utils/filePicker';
import { scanImageDirectory, type BatchItem } from '@renderer/utils/directoryScanner';
import { relativePath } from '@renderer/utils/fileIO';
import { useDialog } from '@renderer/composables/useDialog';
import { useFileDrop } from '@renderer/composables/useFileDrop';

const props = defineProps<{ modelValue: BatchItem[]; selected: string }>();
const emit = defineEmits<{ 'update:modelValue': [BatchItem[]]; 'update:selected': [string] }>();

const { message } = useDialog();

/** 拖拽导入：图片直接追加，文件夹按「扫描文件夹」的规则递归展开 */
const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useFileDrop({
  onFiles(files) {
    emit('update:modelValue', dedupe([...props.modelValue, ...files]));
  },
  onRejected(count) {
    message(`已忽略 ${count} 个非图片文件`, 'warning');
  }
});

function dedupe(list: BatchItem[]): BatchItem[] {
  const seen = new Set<string>();
  return list.filter((it) => (seen.has(it.path) ? false : (seen.add(it.path), true)));
}

async function chooseFiles() {
  const res = await selectImageFiles(true);
  if (!res) return;
  // 选择文件没有共同根目录，rel 仅取文件名
  const items: BatchItem[] = res.map((p) => ({ path: p, rel: p.split(/[\\/]/).pop() ?? p }));
  emit('update:modelValue', dedupe([...props.modelValue, ...items]));
}

async function scanFolder() {
  const dir = await selectDirectory();
  if (!dir) return;
  const r = await scanImageDirectory(dir);
  // 无法读取的文件直接跳过并提示，避免混入列表后到处理阶段才逐张报错
  if (r.errorList.length) {
    message(`已跳过 ${r.errorList.length} 个无法读取的文件`, 'warning');
  }
  if (!r.fileList.length) return;
  // 扫描文件夹：记录每个文件相对源根目录的位置，供「保持相对目录」使用
  const items: BatchItem[] = r.fileList.map((p) => ({ path: p, rel: relativePath(dir, p) }));
  emit('update:modelValue', dedupe([...props.modelValue, ...items]));
}

function remove(p: string) {
  emit('update:modelValue', props.modelValue.filter((x) => x.path !== p));
  if (props.selected === p) emit('update:selected', '');
}

function clear() {
  emit('update:modelValue', []);
  emit('update:selected', '');
}

function select(p: string) {
  emit('update:selected', p);
}
</script>

<style scoped>
.import-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--colorNeutralBackground2);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
  padding: calc(var(--design-unit) * 1px * 3);
}
.import-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(var(--design-unit) * 1px * 2.5);
}
.import-title {
  font-size: var(--fontSizeBase300);
  font-weight: 600;
}
.import-count {
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
  background: var(--colorNeutralBackground1Hover);
  border-radius: var(--borderRadiusMedium);
  padding: calc(var(--design-unit) * 1px * 0.5) calc(var(--design-unit) * 1px * 2);
}
.import-actions {
  display: flex;
  gap: calc(var(--design-unit) * 1px * 2);
  margin-bottom: calc(var(--design-unit) * 1px * 3);
}
.import-actions fluent-button {
  flex: 1;
}
.import-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 1px * 1.5);
  padding-right: calc(var(--design-unit) * 1px);
}
.import-empty {
  color: var(--app-fg-secondary);
  font-size: var(--fontSizeBase200);
  text-align: center;
  padding: calc(var(--design-unit) * 1px * 6) 0;
}
.import-item {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 1px * 2);
  padding: calc(var(--design-unit) * 1px * 2) calc(var(--design-unit) * 1px * 2.5);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: calc(var(--borderRadiusMedium) + var(--design-unit) * 1px / 2);
  cursor: pointer;
  background: var(--colorNeutralBackground1);
  transition: border-color 0.12s ease;
}
.import-item:hover {
  border-color: var(--accent-base-color);
}
.import-item.active {
  border-color: var(--accent-base-color);
  background: var(--colorNeutralBackground1Hover);
}
.item-name {
  flex: 1;
  min-width: 0;
  font-size: var(--fontSizeBase200);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-remove {
  border: none;
  background: transparent;
  color: var(--app-fg-secondary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.item-remove:hover {
  color: var(--accent-base-color);
}
.import-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--design-unit) * 1px * 2);
  margin-top: calc(var(--design-unit) * 1px * 2.5);
  padding-top: calc(var(--design-unit) * 1px * 2.5);
  border-top: 1px solid var(--colorNeutralStroke1);
}
.foot-text {
  flex: 1;
  min-width: 0;
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
/* 拖拽悬停：整块导入区描边强调色 */
.import-panel.drop-active {
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
  border-radius: var(--borderRadiusXLarge);
  background: color-mix(in srgb, var(--colorNeutralBackground2) 82%, transparent);
  color: var(--neutral-foreground-rest);
  font-size: var(--fontSizeBase300);
  pointer-events: none;
}
</style>
