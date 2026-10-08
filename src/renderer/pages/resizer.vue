<template>
  <div class="tool">
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="maximize"
      hint="选择一张图片开始调整尺寸，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    />
    <aside class="controls-pane">
      <div class="batch-entry">
        <fluent-button appearance="neutral" @click="goBatch">
          <font-awesome-icon icon="layer-group" /> 批量调整尺寸
        </fluent-button>
      </div>
      <div class="controls-body">
        <SettingsGroup title="尺寸设置">
          <SettingsRow label="宽度" desc="填 0 等比缩放">
            <num-input class="ctl-num" :value="opts.width" min="0" @input="opts.width = evNum($event)"><span slot="end">px</span></num-input>
          </SettingsRow>
          <SettingsRow label="高度" desc="填 0 等比缩放">
            <num-input class="ctl-num" :value="opts.height" min="0" @input="opts.height = evNum($event)"><span slot="end">px</span></num-input>
          </SettingsRow>
          <SettingsRow label="适配方式">
            <app-select
              class="ctl-lg"
              :value="opts.fit"
              @change="opts.fit = evVal($event) as ImageProcessOptions['fit']"
            >
              <fluent-option value="inside">等比缩放（inside）</fluent-option>
              <fluent-option value="cover">裁剪填充（cover）</fluent-option>
              <fluent-option value="fill">拉伸（fill）</fluent-option>
              <fluent-option value="contain">包含（contain）</fluent-option>
              <fluent-option value="outside">外部（outside）</fluent-option>
            </app-select>
          </SettingsRow>
        </SettingsGroup>
        <SettingsGroup title="输出设置">
          <!-- 格式为主项，质量为其子项（与水印工具「位置基准」同款折叠卡） -->
          <SettingsCollapse label="格式">
            <template #control>
              <app-select class="ctl-md" :value="out.format" @change="onFormat">
                <fluent-option value="original">保持原格式</fluent-option>
                <fluent-option value="png">PNG（无损）</fluent-option>
                <fluent-option value="jpeg">JPG（有损）</fluent-option>
                <fluent-option value="webp">WebP（有损）</fluent-option>
              </app-select>
            </template>
            <SettingsRow v-if="lossy" label="质量">
              <fluent-slider
                class="ctl-slider"
                :value="out.quality"
                :min="10"
                :max="100"
                :step="1"
                @change="out.quality = evNum($event)"
              ></fluent-slider>
              <span class="row-val">{{ out.quality }}</span>
            </SettingsRow>
          </SettingsCollapse>
        </SettingsGroup>
      </div>
      <!-- footer 必须位于 controls-body 内部，才能继承其右侧内边距（与水印工具一致） -->
      <div class="controls-footer">
        <fluent-button appearance="primary" class="save-btn" :disabled="processing || !inputPath || invalidSize" @click="onSave">
          {{ processing ? '处理中…' : '保存图片' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { ImageProcessOptions } from '@shared/types';
import { useSingleTool, evVal, evNum } from '@renderer/composables/useSingleTool';
import { useDialog } from '@renderer/composables/useDialog';
import {
  createOutputOpts,
  isLossy,
  outExt,
  withOutput,
  type OutputOpts
} from '@renderer/composables/useOutputSettings';
import type { DefaultOutputFormat } from '@renderer/stores/settings';
import ImagePicker from '@renderer/components/ImagePicker.vue';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import SettingsCollapse from '@renderer/components/settings/SettingsCollapse.vue';
import NumInput from '@renderer/components/NumInput.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { inputPath, inputName, previewUrl, processing, pickImage, setImage, schedulePreview, runSave } =
  useSingleTool();
const { message } = useDialog();

const opts = reactive({
  width: 800,
  height: 0,
  fit: 'inside' as ImageProcessOptions['fit']
});

/** 输出格式/质量：默认取设置页的「默认输出」 */
const out: OutputOpts = createOutputOpts();
const lossy = computed(() => isLossy(out.format));

function onFormat(e: Event) {
  out.format = (e.target as HTMLInputElement).value as DefaultOutputFormat;
}

function buildOptions(): ImageProcessOptions {
  const o: ImageProcessOptions = { fit: opts.fit };
  if (opts.width > 0) o.width = opts.width;
  if (opts.height > 0) o.height = opts.height;
  return withOutput(o, out);
}

/** 宽高都为 0 时无法缩放（0 = 等比，但两个都等比就什么都没定） */
const invalidSize = computed(() => opts.width <= 0 && opts.height <= 0);

async function refresh(): Promise<ArrayBuffer | undefined> {
  if (!inputPath.value || invalidSize.value) return undefined;
  const res = await window.api.image.process({
    op: 'resize',
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
  if (invalidSize.value) {
    message('宽度和高度不能都为 0，请至少填写一项', 'warning');
    return;
  }
  await runSave(
    (stem) => `${stem}_resized${outExt(out.format, inputPath.value)}`,
    async (outputPath) => {
      await window.api.image.process({
        op: 'resize',
        inputPath: inputPath.value,
        outputPath,
        options: buildOptions()
      });
    }
  );
}

const goBatch = () => window.api.window.open({
  route: '/resizer/batch',
  key: 'batch-resizer',
  width: 1280,
  height: 820,
  minWidth: 1024,
  minHeight: 680
});

watch(opts, () => schedulePreview(refresh), { deep: true });
</script>
