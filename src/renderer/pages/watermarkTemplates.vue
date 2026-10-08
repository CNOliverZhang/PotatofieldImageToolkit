<template>
  <TemplateLibrary
    v-model:active-type="activeType"
    :types="templateTypes"
    :items="items"
    :describe="describe"
    :thumb="thumb"
    @create="openEditor()"
    @apply="apply"
    @edit="openEditor"
    @rename="rename"
    @share="share"
    @remove="remove"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { TemplateItem, WatermarkParams } from '@shared/types';
import { useSettingsStore } from '@renderer/stores/settings';
import { useDialog } from '@renderer/composables/useDialog';
import { templateTypes } from '@renderer/consts/templates';
import { encodeTemplate } from '@renderer/utils/templateCode';
import TemplateLibrary from '@renderer/components/template/TemplateLibrary.vue';

/**
 * 水印模板库（独立窗口）。
 * 列表布局、卡片与操作由通用组件 TemplateLibrary 提供，
 * 这里只提供水印特有的：摘要文案、图片水印缩略图、以及四个操作的落地逻辑。
 */
const settings = useSettingsStore();
const { alert, confirm, message, prompt } = useDialog();

const activeType = ref(templateTypes[0].key);
const items = computed(() => settings.templates.watermark ?? []);
const thumbs = ref<Record<string, string>>({});

/** 图片水印的缩略图：素材文件名 → 绝对路径 → 主进程缩放后转 blob URL */
function thumb(item: TemplateItem): string {
  const p = item.params as Partial<WatermarkParams>;
  return p.type === 'image' && p.watermarkPath ? thumbs.value[p.watermarkPath] ?? '' : '';
}

/** 位置短名 */
const GRAVITY_TEXT: Record<string, string> = {
  nw: '左上', n: '上', ne: '右上',
  w: '左', center: '居中', e: '右',
  sw: '左下', s: '下', se: '右下'
};

/** 卡片摘要：类型 · 位置 · 大小 · 不透明度（+ 文字水印的字体） */
function describe(item: TemplateItem): string {
  const p = item.params as Partial<WatermarkParams>;
  const parts: string[] = [p.type === 'image' ? '图片' : '文字'];
  parts.push(GRAVITY_TEXT[p.gravity ?? 'se'] ?? '右下');
  parts.push(p.type === 'image' ? `大小 ${Math.round((p.scale ?? 0) * 100)}%` : `宽度 ${Math.round(p.sizePct ?? 0)}%`);
  parts.push(`不透明度 ${Math.round((p.opacity ?? 1) * 100)}%`);
  if (p.type !== 'image' && p.fontFamily) parts.push(p.fontFamily);
  return parts.join(' · ');
}

/** 应用：载入到水印工具并停留在该页 */
function apply(item: TemplateItem): void {
  // 必须传纯对象：Pinia 的响应式 Proxy 无法被 IPC 结构化克隆（会报 could not be cloned）
  void window.api.template.apply({
    params: JSON.parse(JSON.stringify(item.params)) as Record<string, unknown>,
    templateId: item.id
  });
  message('已在水印工具中应用该模板', 'success');
}

/**
 * 编辑 / 新建：开独立编辑窗口。
 * 参数暂存在主进程（跨窗口共享 localStorage 有延迟，会丢数据），
 * 窗口 key 带模板 id，避免复用已打开窗口时把新参数丢掉。
 */
async function openEditor(item?: TemplateItem): Promise<void> {
  await window.api.template.setEditing({
    tool: 'watermark',
    id: item?.id ?? '',
    name: item?.name ?? '',
    params: item ? (JSON.parse(JSON.stringify(item.params)) as Record<string, unknown>) : null
  });
  window.api.window.open({
    route: '/watermark/templates/edit',
    key: `watermark-template-editor-${item?.id ?? 'new'}`,
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620
  });
}

async function rename(item: TemplateItem): Promise<void> {
  // Electron 下 window.prompt 不可用，统一走自绘输入对话框
  const name = await prompt('输入新的模板名称', '重命名模板', item.name);
  if (name === null) return;
  if (!name.trim()) {
    message('模板名称不能为空', 'warning');
    return;
  }
  await settings.updateTemplate('watermark', item.id, { name: name.trim() });
}

/** 分享：把参数编码成模板码复制到剪贴板，对方用「从模板码导入」即可还原同样参数 */
async function share(item: TemplateItem): Promise<void> {
  const code = encodeTemplate(JSON.parse(JSON.stringify(item.params)));
  try {
    await navigator.clipboard.writeText(code);
    message(`已复制「${item.name}」的模板码`, 'success');
  } catch {
    // 剪贴板不可用时退化为展示，至少能手动复制
    await alert(code, `模板码 · ${item.name}`);
  }
}

async function remove(item: TemplateItem): Promise<void> {
  const ok = await confirm(`确定删除模板「${item.name}」吗？删除后不可恢复。`, '删除模板');
  if (!ok) return;
  const p = item.params as Partial<WatermarkParams>;
  await settings.removeTemplate('watermark', item.id);
  // 素材清理：没有其它模板引用同一张图时才删
  if (p.type === 'image' && p.watermarkPath) {
    const stillUsed = (settings.templates.watermark ?? []).some(
      (t) => (t.params as Partial<WatermarkParams>).watermarkPath === p.watermarkPath
    );
    if (!stillUsed) await window.api.template.removeAsset(p.watermarkPath);
  }
}

/**
 * 图片水印缩略图：素材文件名 → 绝对路径，再由主进程缩放成 96px 转 blob URL。
 * 不用 file:// 直读：渲染进程加载 file 子资源会被拦（表现为裂图），
 * 且大图在列表里整张解码也不划算 —— 与拼图列表的缩略图做法保持一致。
 */
async function loadThumbs(): Promise<void> {
  for (const item of items.value) {
    const p = item.params as Partial<WatermarkParams>;
    if (p.type !== 'image' || !p.watermarkPath || thumbs.value[p.watermarkPath]) continue;
    const full = await window.api.template.resolveAsset(p.watermarkPath);
    if (!full) continue;
    try {
      const res = await window.api.image.process({
        op: 'resize',
        inputPath: full,
        options: { width: 96, fit: 'inside' }
      });
      if (res.buffer) {
        thumbs.value[p.watermarkPath] = URL.createObjectURL(
          new Blob([res.buffer], { type: 'image/png' })
        );
      }
    } catch {
      /* 缩略图失败不影响列表与模板使用 */
    }
  }
}

onMounted(async () => {
  // 模板库由主进程持有，先拉一次
  await settings.loadTemplates();
  // 首次运行：导入旧版本（3.x）模板
  if (!settings.legacyImported) {
    const legacy = await window.api.template.importLegacy();
    for (const item of legacy) {
      await settings.addTemplate('watermark', item.name, item.params, true);
    }
    await settings.markLegacyImported();
    if (legacy.length) await alert(`已从旧版本导入 ${legacy.length} 个水印模板。`, '导入完成');
  }
  await loadThumbs();
});

// 编辑窗口保存后模板库经广播更新，缩略图需要跟着补
watch(items, () => void loadThumbs());

onBeforeUnmount(() => {
  for (const url of Object.values(thumbs.value)) URL.revokeObjectURL(url);
});
</script>
