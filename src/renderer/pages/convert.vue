<template>
  <div class="tool">
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="repeat"
      hint="选择一张图片开始格式转换，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    />
    <aside class="controls-pane">
      <div class="batch-entry">
        <fluent-button appearance="neutral" @click="goBatch">
          <font-awesome-icon icon="layer-group" /> 批量转换
        </fluent-button>
      </div>
      <div class="controls-body">
        <SettingsGroup title="转换设置">
          <!-- 格式为主项，质量为其子项（与水印工具「位置基准」同款折叠卡） -->
          <SettingsCollapse label="目标格式">
            <template #control>
              <app-select class="ctl-md" :value="opts.format" @change="onFormat">
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
import type { ImageFormat } from '@shared/types';
import { useSingleTool, evVal, evNum, extOf } from '@renderer/composables/useSingleTool';
import { createOutputOpts, isLossy, outExt, outQuality } from '@renderer/composables/useOutputSettings';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { inputPath, inputName, previewUrl, processing, pickImage, setImage, schedulePreview, runSave } =
  useSingleTool();

/** 格式转换没有「保持原格式」，默认 png；质量沿用设置页「默认输出」 */
const opts = createOutputOpts();
if (opts.format === 'original') opts.format = 'png';

const lossy = computed(() => isLossy(opts.format));
/** 传给主进程的格式（DefaultOutputFormat → ImageFormat） */
const format = computed(() => opts.format as ImageFormat);

function onFormat(e: Event) {
  opts.format = evVal(e) as typeof opts.format;
}

async function refresh(): Promise<ArrayBuffer | undefined> {
  if (!inputPath.value) return undefined;
  const res = await window.api.image.process({
    op: 'convert',
    inputPath: inputPath.value,
    options: { format: format.value, quality: outQuality(opts.format, opts.quality) }
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
    (stem) => `${stem}_converted${outExt(format.value, inputPath.value)}`,
    async (outputPath) => {
      await window.api.image.process({
        op: 'convert',
        inputPath: inputPath.value,
        outputPath,
        options: { format: format.value, quality: outQuality(opts.format, opts.quality) }
      });
    }
  );
}

const goBatch = () => window.api.window.open({
  route: '/convert/batch',
  key: 'batch-convert',
  width: 1280,
  height: 820,
  minWidth: 1024,
  minHeight: 680
});

watch(opts, () => schedulePreview(refresh), { deep: true });
</script>
