<template>
  <div class="tool">
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="file-zipper"
      hint="选择一张图片开始压缩，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    />
    <aside class="controls-pane">
      <div class="batch-entry">
        <fluent-button appearance="neutral" @click="goBatch">
          <font-awesome-icon icon="layer-group" /> 批量压缩
        </fluent-button>
      </div>
      <div class="controls-body">
        <SettingsGroup title="压缩设置">
          <!-- 格式为主项，质量为其子项（与水印工具「位置基准」同款折叠卡） -->
          <SettingsCollapse label="输出格式">
            <template #control>
              <app-select class="ctl-md" :value="opts.format" @change="opts.format = evVal($event) as ImageFormat | 'original'">
                <fluent-option value="original">保持原格式</fluent-option>
                <fluent-option value="png">PNG（无损）</fluent-option>
                <fluent-option value="jpeg">JPG（有损）</fluent-option>
                <fluent-option value="webp">WebP（有损）</fluent-option>
              </app-select>
            </template>
            <SettingsRow v-if="lossy" label="质量">
              <fluent-slider
                class="ctl-slider"
                :value="opts.quality"
                :min="10"
                :max="100"
                :step="1"
                @change="opts.quality = evNum($event)"
              ></fluent-slider>
              <span class="row-val">{{ opts.quality }}</span>
            </SettingsRow>
          </SettingsCollapse>
        </SettingsGroup>
      </div>
      <!-- footer 必须位于 controls-body 内部，才能继承其右侧内边距（与水印工具一致） -->
      <div class="controls-footer">
        <fluent-button appearance="primary" class="save-btn" :disabled="processing || !inputPath" @click="onSave">
          {{ processing ? '处理中…' : '保存图片' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { ImageFormat, ImageProcessOptions } from '@shared/types';
import { useSingleTool, evVal, evNum, extOf } from '@renderer/composables/useSingleTool';
import { createOutputOpts, isLossy, outExt, withOutput } from '@renderer/composables/useOutputSettings';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { inputPath, inputName, previewUrl, processing, pickImage, setImage, schedulePreview, runSave } =
  useSingleTool();

/** 输出格式/质量：默认取设置页「默认输出」（与其它工具一致） */
const opts = createOutputOpts();
const lossy = computed(() => isLossy(opts.format));

function buildOptions(): ImageProcessOptions {
  // 压缩参数即输出设置；PNG 无损时质量不生效，由 withOutput 处理
  return withOutput({}, opts);
}

async function refresh(): Promise<ArrayBuffer | undefined> {
  if (!inputPath.value) return undefined;
  const res = await window.api.image.process({
    op: 'compress',
    inputPath: inputPath.value,
    options: buildOptions()
  });
  return res.buffer;
}

async function onPick() {
  if (await pickImage()) schedulePreview(refresh);
}

/** 拖入图片：与选择图片走同一套加载流程 */
async function onDrop(path: string) {
  if (setImage(path)) schedulePreview(refresh);
}

async function onSave() {
  await runSave(
    (stem) =>
      opts.format === 'original' ? `${stem}${extOf(inputPath.value)}` : `${stem}_compressed${outExt(opts.format, inputPath.value)}`,
    async (outputPath) => {
      await window.api.image.process({
        op: 'compress',
        inputPath: inputPath.value,
        outputPath,
        options: buildOptions()
      });
    }
  );
}

const goBatch = () => window.api.window.open({
  route: '/compress/batch',
  key: 'batch-compress',
  width: 1280,
  height: 820,
  minWidth: 1024,
  minHeight: 680
});

watch(opts, () => schedulePreview(refresh), { deep: true });
</script>
