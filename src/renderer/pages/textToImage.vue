<template>
  <div class="rte-page">
    <font-awesome-icon icon="paragraph" class="icon" />
    <h2>洋芋田富文本编辑器</h2>
    <p>「文字转图片」已独立为「洋芋田富文本编辑器」。{{ installed ? '点下方按钮直接打开它。' : '请前往下载。' }}</p>
    <fluent-button appearance="primary" @click="open">
      {{ installed ? '打开富文本编辑器' : '前往下载' }}
    </fluent-button>
    <p class="hint">
      {{ installed ? '将唤起本机已安装的洋芋田富文本编辑器' : `将在默认浏览器中打开 ${SITE_URL}` }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useDialog } from "@renderer/composables/useDialog";

const SITE_URL = "https://potatofield.cn/richtexteditor";
const { message } = useDialog();

/** 本机是否有富文本编辑器（有协议或已安装应用）—— 决定按钮文案 */
const installed = ref(false);

onMounted(async () => {
  try {
    installed.value = await window.api.app.hasRichTextEditor();
  } catch {
    installed.value = false;
  }
});

/**
 * 打开富文本编辑器，三级降级：
 * 1. 注册了 URL 协议 → 协议唤起（兼容将来注册协议的版本）
 * 2. 没协议但装了应用 → 直接启动本地程序
 * 3. 都没有 → 打开下载页（原逻辑）
 */
async function open(): Promise<void> {
  try {
    const res = await window.api.app.openRichTextEditor();
    if (res.ok) return; // protocol / app 已唤起
    await window.api.shell.openExternal(SITE_URL);
    message("未检测到富文本编辑器，已打开下载页", "info");
  } catch {
    try {
      await window.api.shell.openExternal(SITE_URL);
    } catch {
      /* 浏览器也打不开就只能让用户手动访问了 */
    }
    message("唤起失败，已打开下载页：" + SITE_URL, "error");
  }
}
</script>

<style scoped>
.rte-page {
  /* 撑满内容区并垂直居中（内容区由 .content 提供确定高度与内边距） */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--design-unit) * 5 * 1px);
  color: var(--app-fg-secondary);
}
.icon {
  font-size: 40px;
  color: var(--accent-base-color);
  margin-bottom: calc(var(--design-unit) * 3 * 1px);
}
h2 {
  margin: 0 0 calc(var(--design-unit) * 2 * 1px);
  font-size: var(--fontSizeBase400);
  color: var(--colorNeutralForeground1);
}
p {
  margin: 0 0 calc(var(--design-unit) * 3 * 1px);
  font-size: var(--fontSizeBase200);
}
.hint {
  margin-top: calc(var(--design-unit) * 3 * 1px);
  font-size: 12px;
}
</style>
