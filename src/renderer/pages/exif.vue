<template>
  <div class="tool">
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="circle-info"
      hint="选择一张图片读取 EXIF / 元数据，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    />
    <!-- 右栏整列不滚动：读取前是虚线占位框（同色彩提取工具），读取后元数据在带边框底色的容器内滚动 -->
    <aside class="controls-pane">
      <div class="controls-body">
        <div v-if="!inputPath" class="placeholder">选择图片后显示文件与拍摄信息</div>
        <div v-else class="meta-card">
          <div class="meta-head">
            <span class="meta-title">元数据</span>
            <span v-if="totalCount" class="meta-count">{{ totalCount }} 项</span>
          </div>
          <div class="meta-scroll">
            <template v-if="sections.length">
              <div v-for="s in sections" :key="s.title" class="meta-block">
                <div class="meta-block-title">{{ s.title }}</div>
                <div class="meta-row" v-for="e in s.entries" :key="s.title + e.label">
                  <span class="meta-key">{{ e.label }}</span>
                  <span class="meta-val">{{ e.value }}</span>
                </div>
              </div>
            </template>
            <p v-else class="meta-empty">读取中…</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MetaSection } from '@shared/types';
import { useSingleTool } from '@renderer/composables/useSingleTool';
import ImagePicker from '@renderer/components/ImagePicker.vue';

const { inputPath, inputName, previewUrl, pickImage, setImage, schedulePreview } = useSingleTool();

const sections = ref<MetaSection[]>([]);
const totalCount = computed(() =>
  sections.value.reduce((n, s) => n + s.entries.length, 0)
);

/** 读取元数据并生成预览图（选择图片与拖入图片共用） */
function loadMeta() {
  schedulePreview(async () => {
    sections.value = [];
    const res = await window.api.image.process({ op: 'metadata', inputPath: inputPath.value });
    // 只展示主进程筛好的「摄影 / 设计关注」字段
    sections.value = res.meta?.sections ?? [];
    // 本工具不产生处理结果，但仍需一张可显示的预览图：
    // 不能 file:// 直读（渲染进程加载 file 子资源会被拦 → 裂图），
    // 由主进程缩放后回传 buffer 转 blob（与模板缩略图同一套做法）
    const preview = await window.api.image.process({
      op: 'resize',
      inputPath: inputPath.value,
      options: { width: 1600, height: 1600, fit: 'inside' }
    });
    return preview.buffer;
  });
}

async function onPick() {
  if (await pickImage()) loadMeta();
}

async function onDrop(path: string) {
  if (setImage(path)) loadMeta();
}
</script>

<style scoped>
/* 右栏整列不可滚动：占位框/元数据容器撑起剩余高度，滚动发生在容器内部 */
.controls-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
/* 读取前：虚线框占位（与色彩提取工具一致） */
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
/* 读取后：带边框和底色的容器，元数据在内部滚动 */
.meta-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
  background: var(--app-card);
  overflow: hidden;
}
.meta-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 2 * 1px);
  padding: calc(var(--design-unit) * 2 * 1px) calc(var(--design-unit) * 3 * 1px);
  border-bottom: 1px solid var(--colorNeutralStroke2);
}
.meta-title {
  font-size: var(--fontSizeBase200);
  font-weight: 600;
}
.meta-count {
  font-size: var(--fontSizeBase100);
  color: var(--app-fg-secondary);
}
.meta-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: calc(var(--design-unit) * 1.5 * 1px) calc(var(--design-unit) * 2.5 * 1px);
}
.meta-block + .meta-block {
  margin-top: calc(var(--design-unit) * 2 * 1px);
  border-top: 1px solid var(--colorNeutralStroke2);
  padding-top: calc(var(--design-unit) * 2 * 1px);
}
.meta-block-title {
  margin-bottom: calc(var(--design-unit) * 1 * 1px);
  font-size: var(--fontSizeBase100);
  font-weight: 600;
  color: var(--app-fg-secondary);
}
.meta-row {
  display: flex;
  gap: calc(var(--design-unit) * 2 * 1px);
  padding: calc(var(--design-unit) * 0.75 * 1px) 0;
  font-size: var(--fontSizeBase200);
}
.meta-key {
  flex: 0 0 45%;
  min-width: 0;
  color: var(--app-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-val {
  flex: 1;
  min-width: 0;
  color: var(--colorNeutralForeground1);
  word-break: break-all;
}
.meta-empty {
  margin: 0;
  padding: calc(var(--design-unit) * 2 * 1px) 0;
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
}
</style>
