<template>
  <!--
    PNG 输出模式：与 JPG/WebP 的「质量」滑块互斥。
    'original' 的批量任务可能混入 PNG，所以这时也要显示（主进程只会对 PNG 应用）。
  -->
  <SettingsRow
    v-if="format === 'png' || format === 'original'"
    label="压缩模式"
    desc="仅对 PNG 生效"
  >
    <app-select class="ctl-md" :value="modelValue" @change="onChange">
      <fluent-option value="lossless">无损</fluent-option>
      <fluent-option value="recommended">推荐</fluent-option>
      <fluent-option value="smaller">更小</fluent-option>
    </app-select>
  </SettingsRow>
</template>

<script setup lang="ts">
import type { PngMode } from "@shared/types";
import AppSelect from "@renderer/components/AppSelect.vue";
import SettingsRow from "@renderer/components/settings/SettingsRow.vue";

defineProps<{ modelValue: PngMode; format: string }>();
const emit = defineEmits<{ "update:modelValue": [PngMode] }>();

function onChange(e: Event): void {
  emit("update:modelValue", (e.target as HTMLInputElement).value as PngMode);
}
</script>
