<template>
  <div class="tpl-lib">
    <!-- 左侧：可用的模板类型。复用主窗口同款侧边栏（tablist + Logo），
         差别只在：品牌文字是「模板列表」，底部没有「设置」 -->
    <AppSidebar
      brand="模板列表"
      :items="sidebarItems"
      :active-id="activeType"
      @change="(id) => emit('update:activeType', id)"
    />

    <!-- 右侧：模板卡片（样式对齐字体管理的字体族卡） -->
    <section class="lib-main">
      <header class="lib-head">
        <span class="lib-title">{{ activeLabel }}</span>
        <span v-if="items.length" class="lib-count">{{ items.length }} 个</span>
        <fluent-button class="lib-new" appearance="primary" @click="emit('create')">
          <font-awesome-icon icon="plus" /> 新建模板
        </fluent-button>
      </header>

      <p v-if="!items.length" class="lib-empty">
        还没有{{ activeLabel }}。点「新建模板」从空白开始，或在工具中调好参数后点「存为模板」。
      </p>

      <div v-else class="lib-list">
        <article v-for="item in items" :key="item.id" class="tpl-card">
          <span class="card-thumb">
            <img v-if="thumb(item)" :src="thumb(item)" alt="" />
            <font-awesome-icon v-else :icon="activeIcon" class="thumb-ph" />
          </span>
          <span class="card-text">
            <span class="card-name">
              {{ item.name }}
              <span v-if="item.legacy" class="card-tag">旧版</span>
            </span>
            <span class="card-sub">{{ describe(item) }}</span>
          </span>
          <!-- 分体按钮：主操作「应用」+「更多」下的三个子项 -->
          <!-- 「应用」与「更多」是两个独立的按钮（不连体）；
               「更多」用 menu-button，并在文字与 chevron 之间补一条分割线（见样式） -->
          <div class="card-actions">
            <fluent-button appearance="primary" @click="emit('apply', item)">应用</fluent-button>
            <fluent-menu>
              <fluent-menu-button slot="trigger" class="more-btn">更多</fluent-menu-button>
              <fluent-menu-list>
                <fluent-menu-item @click="emit('edit', item)">编辑</fluent-menu-item>
                <fluent-menu-item @click="emit('rename', item)">重命名</fluent-menu-item>
                <!--
                  「分享模板」入口暂时隐藏（交互方案待定）。
                  原因：模板码只编码参数，不含图片素材 —— 图片水印模板分享出去对方用不了。
                  功能代码已就绪：`utils/templateCode.ts` + 本组件的 `share` 事件 + 使用方的 share 处理，
                  方案定下来后在上面补一行菜单项即可恢复：
                  <fluent-menu-item @click="emit('share', item)">分享模板</fluent-menu-item>
                -->
                <fluent-menu-item @click="emit('remove', item)">删除</fluent-menu-item>
              </fluent-menu-list>
            </fluent-menu>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 通用模板库页面（独立窗口形态）。
 *
 * 与「模板类型」解耦：左侧类型侧栏、右侧卡片都是通用的，
 * 各工具只需提供 类型清单 / 当前类型的模板 / 摘要与缩略图适配，
 * 事件（新建·应用·编辑·重命名·删除）交由使用方按自己的参数处理。
 */
import { computed } from 'vue';
import type { TemplateItem } from '@shared/types';
import AppSidebar from '@renderer/components/AppSidebar.vue';

export interface TemplateType {
  key: string;
  label: string;
  /** font-awesome solid 图标名 */
  icon: string;
}

const props = withDefaults(
  defineProps<{
    types: TemplateType[];
    activeType: string;
    items: TemplateItem[];
    /** 卡片摘要：由使用方按自己的参数渲染 */
    describe: (item: TemplateItem) => string;
    /** 卡片缩略图（图片水印等）；无则返回空串，显示图标 */
    thumb?: (item: TemplateItem) => string;
  }>(),
  {
    // 给个默认实现，模板里就能直接调用（可选 prop 直接调用会报「可能为未定义」）
    thumb: () => ''
  }
);

const emit = defineEmits<{
  'update:activeType': [key: string];
  create: [];
  apply: [item: TemplateItem];
  edit: [item: TemplateItem];
  rename: [item: TemplateItem];
  /** 分享（复制模板码）；无对应能力的使用方可以不监听 */
  share: [item: TemplateItem];
  remove: [item: TemplateItem];
}>();

/** 侧边栏项：类型清单 → SidebarItem */
const sidebarItems = computed(() =>
  props.types.map((t) => ({ id: t.key, label: t.label, icon: t.icon }))
);

const activeLabel = computed(
  () => props.types.find((t) => t.key === props.activeType)?.label ?? '模板'
);
const activeIcon = computed(
  () => props.types.find((t) => t.key === props.activeType)?.icon ?? 'bookmark'
);

</script>

<style scoped>
/* 侧边栏要顶到窗口左缘与窗口顶部：抵消内容区的左/上内边距（与字体管理的右侧滚动区同一手法），
   顶部留白交给侧边栏自身的 brand padding（含 --titlebar-inset），与主窗口完全一致。
   负 margin 同时把盒子右缘拉回内容区右缘，不会产生横向溢出 */
.tpl-lib {
  display: flex;
  height: 100%;
  min-height: 0;
  margin-left: calc(-1 * var(--content-pad-x));
}
.tpl-lib > .app-sidebar {
  margin-top: calc(-1 * var(--content-pad-top));
  /* 上移后补回高度，否则底部会伸出内容区造成纵向滚动 */
  height: calc(100% + var(--content-pad-top));
}
/* ---------- 右侧列表 ---------- */
.lib-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  /* 与侧边栏的间距 = 主窗口内容区左内边距（32px，同字体管理）；
     右边距不再在这里给：滚动区自己用负 margin 贴窗口右缘、再留回 32px（见 .lib-list） */
  padding-left: var(--content-pad-x);
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 2 * 1px);
}
.lib-head {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 2 * 1px);
  flex-shrink: 0;
}
/* 标题行与字体管理的工具栏（tablist）同高 44px，保证 header 与列表的间距一致；
   左侧加一条竖直强调条，呼应侧边导航/纵向 tablist 选中项的指示条样式 */
.lib-title {
  position: relative;
  display: flex;
  align-items: center;
  height: 44px;
  padding-left: calc(var(--design-unit) * 3 * 1px);
  font-size: var(--fontSizeBase400);
  font-weight: 600;
}
.lib-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: calc(var(--design-unit) * 1.5 * 1px);
  bottom: calc(var(--design-unit) * 1.5 * 1px);
  width: 3px;
  border-radius: calc(var(--design-unit) * 0.75 * 1px);
  background: var(--accent-base-color);
}
.lib-count {
  color: var(--app-fg-secondary);
  font-size: var(--fontSizeBase200);
}
.lib-new {
  margin-left: auto;
}
.lib-empty {
  color: var(--app-fg-secondary);
  padding: calc(var(--design-unit) * 6 * 1px) 0;
  font-size: 13px;
}
/* 仅列表滚动：滚动条贴窗口右缘，卡片右缘与头部按钮对齐（与字体管理一致）；
   底部延伸到窗口下缘，末尾间距由 padding-bottom 补回（与设置页/字体管理一致） */
.lib-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 1px); /* WinUI 设置卡间距 4px */
  margin-right: calc(-1 * var(--content-pad-x));
  padding-right: var(--content-pad-x);
  margin-bottom: calc(-1 * var(--content-pad-b));
  padding-bottom: var(--content-pad-b);
}
/* 滚动条已改为不占布局空间（见 global.css），无需再按滚动条宽度补偿右内边距 */
/* ---------- 模板卡片：对齐字体管理的字体族卡 ---------- */
.tpl-card {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 2.5 * 1px);
  /* 图标/缩略图 32 + 上下各 20 = 72px，与字体卡一致 */
  min-height: calc(var(--design-unit) * 18 * 1px);
  padding: calc(var(--design-unit) * 4.25 * 1px) calc(var(--design-unit) * 3 * 1px);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: var(--app-card);
  flex-shrink: 0;
  transition: background 0.12s ease;
}
.tpl-card:hover {
  background: var(--colorNeutralBackground1Hover);
}
html[data-theme='dark'] .tpl-card:hover {
  background: rgba(255, 255, 255, 0.06);
}
.card-thumb {
  flex-shrink: 0;
  width: calc(var(--design-unit) * 8 * 1px);
  height: calc(var(--design-unit) * 8 * 1px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--borderRadiusMedium);
  background: var(--colorNeutralBackground1Hover);
}
.card-thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.thumb-ph {
  color: var(--app-fg-secondary);
  opacity: 0.6;
  font-size: 15px;
}
.card-text {
  display: flex;
  flex-direction: column;
  gap: calc(var(--design-unit) * 0.5 * 1px);
  flex: 1;
  min-width: 0;
}
.card-name {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-tag {
  margin-left: calc(var(--design-unit) * 1px);
  padding: 0 calc(var(--design-unit) * 1.5 * 1px);
  border-radius: var(--borderRadiusSmall);
  background: var(--colorNeutralBackground1Hover);
  color: var(--app-fg-secondary);
  font-size: var(--fontSizeBase100);
  font-weight: 400;
}
.card-sub {
  font-size: 12px;
  line-height: 16px;
  color: var(--app-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 两个独立按钮：中间留 8px，不连体 */
.card-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 2 * 1px);
}
/* 「更多」：对齐 Fluent 分体按钮的次段样式 —— 文字 | 全高分割线 | chevron。
   分割线用宿主伪元素画（全高），::part(content) 只负责把文字推到左段居中 */
.more-btn {
  position: relative;
}
.more-btn::part(content) {
  margin-inline-end: calc(var(--design-unit) * 7 * 1px);
}
.more-btn::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: calc(var(--design-unit) * 7.5 * 1px);
  width: 1px;
  background: var(--colorNeutralStroke1);
}
</style>
