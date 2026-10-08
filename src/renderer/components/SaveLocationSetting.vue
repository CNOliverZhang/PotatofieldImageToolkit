<template>
  <!--
    「保存位置」主项 + 子项：与水印工具「位置基准」同款折叠卡。
    本组件不再自带 SettingsGroup 标题，由使用方把它放进自己的「输出设置」分组。
  -->
  <SettingsCollapse label="保存位置" :desc="modelValue || '未设置'">
    <template #control>
      <fluent-button appearance="neutral" @click="choose">选择文件夹</fluent-button>
    </template>

    <SettingsRow v-if="settings.recentSaveDirs.length" label="常用位置" desc="选中后立即作为保存位置">
      <app-select
        ref="selectEl"
        class="loc-select"
        :title="modelValue"
        :value="modelValue"
        @change="apply(evVal($event))"
      >
        <fluent-option v-for="d in settings.recentSaveDirs" :key="d" :value="d" :title="d">
          {{ d }}
        </fluent-option>
      </app-select>
    </SettingsRow>

    <SettingsRow v-if="keepRelative !== undefined" label="保持相对目录" desc="按导入时的目录结构整体保存">
      <fluent-switch
        :checked="props.keepRelative ?? false"
        @change="emit('update:keepRelative', evChk($event))"
      ></fluent-switch>
    </SettingsRow>
  </SettingsCollapse>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useSettingsStore } from '@renderer/stores/settings';
import { selectDirectory } from '@renderer/utils/filePicker';
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const settings = useSettingsStore();
const props = defineProps<{ modelValue: string; keepRelative?: boolean; addSuffix?: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [string];
  'update:keepRelative': [boolean];
  'update:addSuffix': [boolean];
}>();

function evChk(e: Event): boolean {
  return (e.target as unknown as { checked: boolean }).checked;
}

// 「常用位置」选中即生效，不再有「待应用」的中间态；下拉框回显当前保存位置
const selectEl = ref<(HTMLElement & { value: string }) | null>(null);

function evVal(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

// fluent-dropdown 的 value 需在 option 渲染完成后由 DOM 赋值，纯属性绑定会因时序丢失
async function syncSelect() {
  await nextTick();
  if (selectEl.value && selectEl.value.value !== props.modelValue) {
    selectEl.value.value = props.modelValue;
  }
}

// 当前保存位置或常用位置列表变动时，把下拉框回显拉回当前保存位置
watch([() => settings.recentSaveDirs, () => props.modelValue], syncSelect, { immediate: true });

async function choose() {
  const dir = await selectDirectory();
  if (!dir) return;
  emit('update:modelValue', dir);
  settings.addRecentSaveDir(dir);
}

/** 选中常用位置即应用为当前保存位置 */
function apply(dir: string) {
  if (!dir || dir === props.modelValue) return;
  emit('update:modelValue', dir);
}
</script>

<style scoped>
.loc-select {
  flex: 1;
  min-width: 0;
}
/* v2 的 select 有 ::part(control/selected-value/listbox) 可覆盖内部结构；
   v3 的 dropdown 未暴露这些 part，长路径截断改由容器限制宽度 +
   下拉列表自身的弹出定位处理（若实测仍有撑破，再考虑回到自绘下拉） */
.loc-select {
  overflow: hidden;
}
.loc-keep {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--design-unit) * 1px * 2);
  margin-top: calc(var(--design-unit) * 1px * 3);
  margin-bottom: calc(var(--design-unit) * 1px * 3);
}
.loc-keep-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.loc-keep-label {
  font-size: var(--fontSizeBase200);
  color: var(--colorNeutralForeground1);
}
.loc-keep-hint {
  font-size: var(--fontSizeBase100);
  color: var(--app-fg-secondary);
}
</style>
