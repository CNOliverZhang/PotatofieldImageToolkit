<template>
  <!--
    输出文件名设置（批量工具共用）：
    主项「添加后缀名」决定是否给输出文件加后缀（关闭则与原文件同名，可能覆盖原图），
    子项「自定义后缀名」可覆盖各工具的默认后缀（_compressed / _resized / ...）。
  -->
  <SettingsCollapse label="添加后缀名" desc="输出文件添加后缀名以避免覆盖原文件">
    <template #control>
      <fluent-switch
        :checked="props.addSuffix ?? true"
        @change="emit('update:addSuffix', evChk($event))"
      ></fluent-switch>
    </template>
    <SettingsRow label="自定义后缀名" desc="如不设置，则采用默认后缀名">
      <fluent-text-input
        class="suffix-input"
        :value="props.customSuffix ?? ''"
        :disabled="props.addSuffix === false"
        placeholder="留空则用默认后缀"
        maxlength="30"
        @input="emit('update:customSuffix', evVal($event))"
      ></fluent-text-input>
    </SettingsRow>
  </SettingsCollapse>
</template>

<script setup lang="ts">
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';

const props = defineProps<{ addSuffix?: boolean; customSuffix?: string }>();
const emit = defineEmits<{
  'update:addSuffix': [boolean];
  'update:customSuffix': [string];
}>();

function evChk(e: Event): boolean {
  return (e.target as unknown as { checked: boolean }).checked;
}
function evVal(e: Event): string {
  return (e.target as HTMLInputElement).value;
}
</script>

<style scoped>
.suffix-input {
  width: 160px;
}
</style>
