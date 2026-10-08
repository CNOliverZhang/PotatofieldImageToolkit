<template>
  <div class="batch-tool">
    <BatchImportPanel
      v-model="files"
      v-model:selected="selected"
      class="import-col"
    />

    <section class="preview-pane">
      <div v-if="!selected" class="dropzone">
        <font-awesome-icon icon="images" class="dz-icon" />
        <p>从左侧导入图片，点击列表项预览</p>
      </div>
      <template v-else>
        <div class="preview-stage">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            class="preview-img"
            alt="预览"
          />
        </div>
        <div class="preview-bar">
          <span class="fname">{{ selectedName }}</span>
        </div>
      </template>
    </section>

    <aside class="controls-pane">
      <div class="controls-body">
        <SettingsGroup :title="`${config[tool].title}设置`">
          <template v-if="tool === 'resizer'">
            <SettingsRow label="宽度" desc="填 0 等比缩放">
              <num-input
                class="ctl-num"
                :value="opts.width"
                min="0"
                @input="opts.width = evNum($event)"
                ><span slot="end">px</span></num-input
              >
            </SettingsRow>
            <SettingsRow label="高度" desc="填 0 等比缩放">
              <num-input
                class="ctl-num"
                :value="opts.height"
                min="0"
                @input="opts.height = evNum($event)"
                ><span slot="end">px</span></num-input
              >
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
                <fluent-option value="outside">外延（outside）</fluent-option>
              </app-select>
            </SettingsRow>
          </template>

          <template v-else-if="tool === 'compress'">
            <!-- 格式为主项，质量为子项；保存位置也是主项（子项：常用位置/保持相对目录） -->
            <SettingsCollapse label="格式">
              <template #control>
                <app-select
                  class="ctl-md"
                  :value="out.format"
                  @change="onFormat"
                >
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
            <SaveLocationSetting
              v-model="saveDir"
              v-model:keepRelative="keepRelative"
              v-model:add-suffix="addSuffix"
            />
          </template>

          <template v-else-if="tool === 'convert'">
            <SettingsCollapse label="目标格式">
              <template #control>
                <app-select
                  class="ctl-md"
                  :value="out.format"
                  @change="onFormat"
                >
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
            <SaveLocationSetting
              v-model="saveDir"
              v-model:keepRelative="keepRelative"
              v-model:add-suffix="addSuffix"
            />
          </template>
        </SettingsGroup>

        <!-- 输出设置：与单图工具一致（压缩/转换的格式与质量本身就是输出设置，不再重复显示）；
             保存位置（主项 + 子项）并入输出设置组 -->
        <SettingsGroup v-if="tool === 'resizer'" title="输出设置">
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
          <SaveLocationSetting
            v-model="saveDir"
            v-model:keepRelative="keepRelative"
            v-model:add-suffix="addSuffix"
          />
        </SettingsGroup>
      </div>
      <div class="controls-footer">
        <fluent-button
          v-if="processing"
          appearance="neutral"
          class="save-btn"
          @click="cancel"
        >
          取消（已完成 {{ progress.done }}/{{ progress.total }}）
        </fluent-button>
        <fluent-button
          v-else
          appearance="primary"
          class="save-btn"
          :disabled="!files.length || invalidSize"
          @click="start"
        >
          开始批量处理 ({{ files.length }})
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount, computed } from "vue";
import type { ImageProcessOptions } from "@shared/types";
import type { BatchItem } from "@renderer/utils/directoryScanner";
import { useDialog } from "@renderer/composables/useDialog";
import {
  createOutputOpts,
  isLossy,
  outExt,
  withOutput,
  type OutputOpts,
} from "@renderer/composables/useOutputSettings";
import { useBatchRunner } from "@renderer/composables/useBatchRunner";
import { useSettingsStore } from "@renderer/stores/settings";
import BatchImportPanel from "@renderer/components/BatchImportPanel.vue";
import SaveLocationSetting from "@renderer/components/SaveLocationSetting.vue";
import SettingsGroup from "@renderer/components/settings/SettingsGroup.vue";
import SettingsRow from "@renderer/components/settings/SettingsRow.vue";
import SettingsCollapse from "@renderer/components/settings/SettingsCollapse.vue";
import NumInput from "@renderer/components/NumInput.vue";
import AppSelect from "@renderer/components/AppSelect.vue";

type ToolKey = "resizer" | "compress" | "convert";

const props = defineProps<{ tool: ToolKey }>();

const config: Record<
  ToolKey,
  { title: string; op: "resize" | "compress" | "convert"; suffix: string }
> = {
  resizer: { title: "尺寸调整", op: "resize", suffix: "_resized" },
  compress: { title: "压缩", op: "compress", suffix: "_compressed" },
  convert: { title: "格式转换", op: "convert", suffix: "_converted" },
};

const { message } = useDialog();
const settings = useSettingsStore();

const files = ref<BatchItem[]>([]);
const keepRelative = ref(false);
/** 输出文件名是否加后缀（如 _compressed）：关闭后输出名与原文件同名，可能覆盖原图 */
const addSuffix = ref(true);
const selected = ref("");
const saveDir = ref(
  settings.defaultSaveDirectory || settings.recentSaveDirs[0] || "",
);
const previewUrl = ref("");
const opts = reactive({
  width: 800,
  height: 0,
  fit: "inside" as ImageProcessOptions["fit"],
});
/** 输出格式/质量：默认取设置页「默认输出」（convert 无「保持原格式」，回退为 png） */
const out: OutputOpts = createOutputOpts();
if (props.tool === "convert" && out.format === "original") out.format = "png";
const lossy = computed(() => isLossy(out.format));

function onFormat(e: Event) {
  out.format = (e.target as HTMLInputElement).value as OutputOpts["format"];
}

let previewTimer: number | undefined;

const selectedName = computed(() =>
  selected.value ? selected.value.split(/[\\/]/).pop() : "",
);

function evVal(e: Event): string {
  return (e.target as HTMLInputElement).value;
}
function evNum(e: Event): number {
  return Number((e.target as HTMLInputElement).value);
}

function buildOptions(): ImageProcessOptions {
  const o: ImageProcessOptions = {};
  if (props.tool === "resizer") {
    if (opts.width) o.width = opts.width;
    if (opts.height) o.height = opts.height;
    o.fit = opts.fit;
  }
  // 压缩与转换的参数就是输出设置本身
  return withOutput(o, out);
}

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
}

async function updatePreview() {
  const path = selected.value;
  if (!path) {
    clearPreview();
    return;
  }
  try {
    const res = await window.api.image.process({
      op: config[props.tool].op,
      inputPath: path,
      options: buildOptions(),
    });
    if (res.buffer) {
      const blob = new Blob([res.buffer], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      clearPreview();
      previewUrl.value = url;
    }
  } catch (err) {
    message("预览失败：" + (err as Error).message, "error");
  }
}

function schedulePreview() {
  if (previewTimer) window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updatePreview, 220);
}

watch([opts, out, selected], schedulePreview, { deep: true });

/** 批量执行：统一走 useBatchRunner（覆盖策略 / 取消 / 进度 / 打开输出文件） */
const { processing, progress, run, cancel } = useBatchRunner({
  files,
  saveDir,
  keepRelative,
  addSuffix,
  op: config[props.tool].op,
  suffix: config[props.tool].suffix,
  extOf: (item) =>
    out.format === "original" ? undefined : outExt(out.format, item.path),
  prepare: () => ({ options: buildOptions() }),
});

/** 尺寸调整：宽高都为 0 时无法缩放（0 = 等比，但两个都等比就什么都没定） */
const invalidSize = computed(
  () => props.tool === "resizer" && opts.width <= 0 && opts.height <= 0,
);

function start() {
  if (invalidSize.value) {
    message("宽度和高度不能都为 0，请至少填写一项", "warning");
    return;
  }
  void run();
}

onBeforeUnmount(() => {
  clearPreview();
  if (previewTimer) window.clearTimeout(previewTimer);
});
</script>

<style scoped>
.batch-tool {
  display: flex;
  flex-direction: row;
  gap: calc(var(--design-unit) * 1px * 3);
  height: 100%;
  min-height: 0;
  /* 底部不再抵扣：与其它页面统一为内容区下边距 */
  overflow: hidden;
}
.import-col {
  width: calc(var(--design-unit) * 1px * 70);
  flex-shrink: 0;
}
.preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--colorNeutralBackground1Hover);
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusXLarge);
  overflow: hidden;
}
.dropzone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--design-unit) * 1px * 3.5);
  color: var(--app-fg-secondary);
}
.dz-icon {
  font-size: calc(var(--design-unit) * 1px * 11.5);
  opacity: 0.5;
}
.preview-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--design-unit) * 1px);
  background-color: var(--checker-base);
  background-image:
    linear-gradient(45deg, var(--checker-cell) 25%, transparent 25%),
    linear-gradient(-45deg, var(--checker-cell) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--checker-cell) 75%),
    linear-gradient(-45deg, transparent 75%, var(--checker-cell) 75%);
  background-size: calc(var(--design-unit) * 1px * 5)
    calc(var(--design-unit) * 1px * 5);
  background-position:
    0 0,
    0 calc(var(--design-unit) * 1px * 2.5),
    calc(var(--design-unit) * 1px * 2.5) calc(var(--design-unit) * 1px * -2.5),
    calc(var(--design-unit) * 1px * -2.5) 0;
}
.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 calc(var(--design-unit) * 1px * 0.5)
    calc(var(--design-unit) * 1px * 3) rgba(0, 0, 0, 0.18);
}
.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--design-unit) * 1px * 3);
  padding: calc(var(--design-unit) * 1px * 2.5)
    calc(var(--design-unit) * 1px * 3.5);
  border-top: 1px solid var(--colorNeutralStroke1);
  background: var(--colorNeutralBackground2);
}
.fname {
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.controls-pane {
  width: 340px;
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-right: calc(-1 * var(--content-pad-x));
}
.controls-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.group {
  margin-bottom: calc(var(--design-unit) * 1px * 5.5);
}
.group-title {
  display: block;
  font-size: var(--fontSizeBase200);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--app-fg-secondary);
  margin-bottom: calc(var(--design-unit) * 1px * 2.5);
}
.field {
  display: block;
  margin-bottom: calc(var(--design-unit) * 1px * 3.5);
}
.field.row {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 1px * 3);
}
.field-label {
  display: block;
  font-size: var(--fontSizeBase200);
  margin-bottom: calc(var(--design-unit) * 1px * 1.5);
  color: var(--colorNeutralForeground1);
}
.field-label em {
  font-style: normal;
  color: var(--app-fg-secondary);
  font-weight: 500;
}
/* footer 已移出滚动区（.controls-pane 的固定子项），样式统一走 global.css */
.save-btn {
  width: 100%;
}
.q-val {
  width: 36px;
  flex-shrink: 0;
  text-align: right;
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
}
</style>
