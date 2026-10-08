<template>
  <div class="batch-tool">
    <BatchImportPanel
      v-model="files"
      v-model:selected="selected"
      class="import-col"
    />

    <section class="preview-pane">
      <div v-if="!selected" class="dropzone">
        <font-awesome-icon icon="crop" class="dz-icon" />
        <p>从左侧导入图片，点击列表项预览裁剪效果</p>
      </div>
      <template v-else>
        <!-- 与单图裁剪同一套 cropper 画布：可直接拖拽/缩放裁剪框（不再只有参数面板） -->
        <div class="preview-stage">
          <CropCanvas
            v-if="selectedUrl"
            :src="selectedUrl"
            :region="region"
            :meta="selectedMeta"
            :ratio="ratio"
            :position="position"
            initial="full"
          />
        </div>
        <div class="preview-bar">
          <span class="fname">{{ selectedName }}</span>
        </div>
      </template>
    </section>

    <aside class="controls-pane">
      <div class="controls-body">
        <!-- 裁剪参数：与单图裁剪共用同一组件；批量同样带 cropper 画布（use-canvas） -->
        <CropControls
          :region="region"
          :meta="selectedMeta"
          use-canvas
          v-model:unit="unit"
          v-model:ratio="ratio"
          v-model:position="position"
        />
        <p class="hint">
          区域以当前选中图为基准；尺寸不同的图片按「{{
            unit === "px" ? "固定像素并裁剪到图片范围内" : "百分比等比换算"
          }}」处理。
        </p>

        <!-- 输出设置：与单图裁剪一致 -->
        <SettingsGroup title="输出设置">
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
          />
          <OutputNameSetting
            v-model:add-suffix="addSuffix"
            v-model:custom-suffix="customSuffix"
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
          @click="run"
        >
          开始批量处理 ({{ files.length }})
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onBeforeUnmount } from "vue";
import type { BatchItem } from "@renderer/utils/directoryScanner";
import { useDialog } from "@renderer/composables/useDialog";
import { useSettingsStore } from "@renderer/stores/settings";
import { evNum } from "@renderer/composables/useSingleTool";
import {
  createOutputOpts,
  isLossy,
  outExt,
  withOutput,
  type OutputOpts,
} from "@renderer/composables/useOutputSettings";
import {
  clampRegionToImage,
  scaleRegionToImage,
  type CropMeta,
} from "@renderer/composables/useCropGeometry";
import { useBatchRunner } from "@renderer/composables/useBatchRunner";
import BatchImportPanel from "@renderer/components/BatchImportPanel.vue";
import CropCanvas from "@renderer/components/CropCanvas.vue";
import CropControls from "@renderer/components/CropControls.vue";
import SettingsGroup from "@renderer/components/settings/SettingsGroup.vue";
import SettingsRow from "@renderer/components/settings/SettingsRow.vue";
import SettingsCollapse from "@renderer/components/settings/SettingsCollapse.vue";
import SaveLocationSetting from "@renderer/components/SaveLocationSetting.vue";
import OutputNameSetting from "@renderer/components/OutputNameSetting.vue";
import AppSelect from "@renderer/components/AppSelect.vue";

const { message } = useDialog();
const settings = useSettingsStore();

const files = ref<BatchItem[]>([]);
const selected = ref("");
const saveDir = ref(
  settings.defaultSaveDirectory || settings.recentSaveDirs[0] || "",
);
const keepRelative = ref(false);
/** 输出文件名是否加后缀（_cropped）：关闭后输出名与原文件同名，可能覆盖原图 */
const addSuffix = ref(true);
/** 自定义后缀：留空则用默认后缀 _cropped */
const customSuffix = ref('');
/** 选中图的原图地址（data URI）：cropper.js 需要真实尺寸的图片才能给出正确的裁剪坐标 */
const selectedUrl = ref("");

const region = reactive({ left: 0, top: 0, width: 0, height: 0 });
const unit = ref<"px" | "ratio">("px");
const ratio = ref("free");
/** 与单图一致：默认左上角基准 */
const position = ref("nw");

/** 输出格式/质量：默认取设置页「默认输出」 */
const out: OutputOpts = createOutputOpts();
const lossy = computed(() => isLossy(out.format));
function onFormat(e: Event) {
  out.format = (e.target as HTMLInputElement).value as OutputOpts["format"];
}

const selectedMeta = ref<CropMeta | null>(null);

const selectedName = computed(() =>
  selected.value ? selected.value.split(/[\\/]/).pop() : "",
);

/** 载入选中图到画布：先取尺寸，再取主进程按 EXIF 摆正后的预览图（与单图裁剪一致） */
async function loadSelected() {
  const path = selected.value;
  if (!path) {
    selectedUrl.value = "";
    return;
  }
  await fetchSelectedMeta();
  const w = selectedMeta.value?.width ?? 0;
  const h = selectedMeta.value?.height ?? 0;
  if (!w || !h) return;
  try {
    // 尺寸保持原图显示尺寸（不缩放），裁剪坐标才能 1:1 对应输出
    const res = await window.api.image.process({
      op: "resize",
      inputPath: path,
      options: { width: w, height: h, fit: "fill" },
    });
    if (res.buffer) {
      if (selectedUrl.value) URL.revokeObjectURL(selectedUrl.value);
      selectedUrl.value = URL.createObjectURL(
        new Blob([res.buffer], { type: "image/png" }),
      );
    }
  } catch {
    selectedUrl.value = "";
    message("图片读取失败", "error");
  }
}

/** 把裁剪区域适配到目标图：像素模式钳到图内，比例模式按百分比换算 */
function fitTo(path: string, iw: number, ih: number) {
  return unit.value === "ratio"
    ? scaleRegionToImage(region, selectedMeta.value, iw, ih)
    : clampRegionToImage(region, iw, ih);
}

async function fetchSelectedMeta() {
  if (!selected.value) {
    selectedMeta.value = null;
    return;
  }
  try {
    const res = await window.api.image.process({
      op: "metadata",
      inputPath: selected.value,
    });
    const m = res.info as unknown as CropMeta;
    selectedMeta.value = { width: m.width || 0, height: m.height || 0 };
    // 首次拿到尺寸时给一个「整图」的初始区域（与单图的居中 60% 接近，批量取整图更可控）
    if (!region.width || !region.height) {
      region.left = 0;
      region.top = 0;
      region.width = selectedMeta.value.width;
      region.height = selectedMeta.value.height;
    }
  } catch {
    selectedMeta.value = null;
  }
}

// 切换选中项：重新载入画布（区域沿用当前值，由 CropCanvas 同步到画布）
watch(selected, () => void loadSelected(), { immediate: true });

/** 批量执行：统一走 useBatchRunner（覆盖策略 / 取消 / 进度 / 打开输出文件） */
const { processing, progress, run, cancel } = useBatchRunner({
  files,
  saveDir,
  keepRelative,
  addSuffix,
  customSuffix,
  op: "extract",
  suffix: "_cropped",
  extOf: (item) =>
    out.format === "original" ? undefined : outExt(out.format, item.path),
  prepare: async (item) => {
    const res = await window.api.image.process({
      op: "metadata",
      inputPath: item.path,
    });
    const m = res.info as unknown as CropMeta;
    const iw = m.width || 0;
    const ih = m.height || 0;
    // 区域按当前单位适配到这张图；图片太小裁不出则跳过
    const r = fitTo(item.path, iw, ih);
    if (!r) return { skip: `图片尺寸 ${iw}×${ih} 小于裁剪区域，已跳过` };
    return { options: { ...r, ...withOutput({}, out) } };
  },
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
  background-color: var(--colorNeutralBackground1);
  background-image:
    linear-gradient(45deg, var(--colorNeutralBackground3) 25%, transparent 25%),
    linear-gradient(
      -45deg,
      var(--colorNeutralBackground3) 25%,
      transparent 25%
    ),
    linear-gradient(45deg, transparent 75%, var(--colorNeutralBackground3) 75%),
    linear-gradient(-45deg, transparent 75%, var(--colorNeutralBackground3) 75%);
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
/* footer 渐隐遮罩由 global.css 的 .controls-footer::before 统一提供 */
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
.hint {
  margin: 0 0 calc(var(--design-unit) * 1px * 3);
  font-size: 11px;
  line-height: 1.5;
  color: var(--app-fg-secondary);
}
</style>
