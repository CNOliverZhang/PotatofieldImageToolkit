<template>
  <div class="tool">
    <ImagePicker
      :src="previewUrl"
      :name="inputName"
      icon="grip"
      hint="选择一张图片开始分割，或将图片拖到这里"
      @pick="onPick"
      @drop="onDrop"
    >
      <!-- 整图预览 + 分割网格：预览必须是完整图片（不能只裁第一块），
           上面的线才是「会切成几行几列」的示意 -->
      <template #stage>
        <div class="slice-stage">
          <img :src="previewUrl" class="slice-img" alt="预览" />
          <span class="slice-grid" :style="gridStyle"></span>
        </div>
      </template>
    </ImagePicker>
    <aside class="controls-pane">
      <div class="controls-body">
        <SettingsGroup title="分割网格">
          <SettingsRow label="行数">
            <num-input class="ctl-num" :value="rows" min="1" max="50" @input="rows = evNum($event)"><span slot="end">行</span></num-input>
          </SettingsRow>
          <SettingsRow label="列数">
            <num-input class="ctl-num" :value="cols" min="1" max="50" @input="cols = evNum($event)"><span slot="end">列</span></num-input>
          </SettingsRow>
          <SettingsRow
            v-if="meta"
            label="分割结果"
            :desc="`原图 ${meta.width} × ${meta.height}，将分为 ${rows} × ${cols} 块`"
          />
        </SettingsGroup>
        <SettingsGroup title="输出设置">
          <SettingsRow label="格式">
            <app-select class="ctl-md" :value="out.format" @change="onFormat">
              <fluent-option value="original">保持原格式</fluent-option>
              <fluent-option value="png">PNG（无损）</fluent-option>
              <fluent-option value="jpeg">JPG（有损）</fluent-option>
              <fluent-option value="webp">WebP（有损）</fluent-option>
            </app-select>
          </SettingsRow>
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
        </SettingsGroup>
      </div>
      <!-- footer 必须位于 controls-body 内部，才能继承其右侧内边距（与水印工具一致） -->
      <div class="controls-footer">
        <fluent-button appearance="primary" class="save-btn" :disabled="processing || !inputPath" @click="onSave">
          {{ processing ? `处理中 ${progress}…` : '分割并保存' }}
        </fluent-button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSingleTool, evNum, extOf } from '@renderer/composables/useSingleTool';
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
import { selectDirectory } from '@renderer/utils/filePicker';
import { buildOutputPath } from '@renderer/utils/fileIO';
import { useDialog } from '@renderer/composables/useDialog';
import NumInput from '@renderer/components/NumInput.vue';
import AppSelect from '@renderer/components/AppSelect.vue';

const { message } = useDialog();
const { inputPath, inputName, previewUrl, processing, pickImage, setImage, schedulePreview } =
  useSingleTool();

interface Meta {
  width: number;
  height: number;
}
const meta = ref<Meta | null>(null);
const rows = ref(2);
const cols = ref(2);
const progress = ref(0);

/** 输出格式/质量：默认取设置页的「默认输出」 */
const out: OutputOpts = createOutputOpts();
const lossy = computed(() => isLossy(out.format));

function onFormat(e: Event) {
  out.format = (e.target as HTMLInputElement).value as DefaultOutputFormat;
}

async function fetchMeta(): Promise<void> {
  if (!inputPath.value) return;
  const res = await window.api.image.process({ op: 'metadata', inputPath: inputPath.value });
  const m = res.info as unknown as Meta;
  meta.value = { width: m.width || 0, height: m.height || 0 };
}

function tileRegions() {
  if (!meta.value) return [];
  const iw = meta.value.width;
  const ih = meta.value.height;
  const tw = Math.floor(iw / cols.value);
  const th = Math.floor(ih / rows.value);
  const out: { ri: number; ci: number; left: number; top: number; width: number; height: number }[] = [];
  for (let ri = 0; ri < rows.value; ri++) {
    for (let ci = 0; ci < cols.value; ci++) {
      const left = ci * tw;
      const top = ri * th;
      const width = ci === cols.value - 1 ? iw - left : tw;
      const height = ri === rows.value - 1 ? ih - top : th;
      out.push({ ri: ri + 1, ci: ci + 1, left, top, width, height });
    }
  }
  return out;
}

/**
 * 预览：展示**完整图片**（旧实现裁了第一块当预览，看起来像「只显示第一行第一列」），
 * 分割方式由覆盖在上面的网格线示意；真正导出时仍按 tileRegions() 逐块裁剪。
 */
async function refresh(): Promise<ArrayBuffer | undefined> {
  if (!inputPath.value) return undefined;
  const res = await window.api.image.process({
    op: 'resize',
    inputPath: inputPath.value,
    options: { width: 1600, height: 1600, fit: 'inside' }
  });
  return res.buffer;
}

/** 网格线：按行/列数在整图上画线（外框 + 内部各条） */
const gridStyle = computed(() => ({
  backgroundImage: [
    `repeating-linear-gradient(to right, var(--accent-base-color) 0 1px, transparent 1px calc(100% / ${cols.value}))`,
    `repeating-linear-gradient(to bottom, var(--accent-base-color) 0 1px, transparent 1px calc(100% / ${rows.value}))`
  ].join(',')
}));

/** 载入当前图片：读尺寸 + 刷新预览（选择图片与拖入图片共用） */
async function loadInput() {
  await fetchMeta();
  schedulePreview(refresh);
}

async function onPick() {
  if (await pickImage()) await loadInput();
}

async function onDrop(path: string) {
  if (setImage(path)) await loadInput();
}

async function onSave() {
  if (!inputPath.value || !meta.value) {
    message('请先选择图片', 'warning');
    return;
  }
  const dir = await selectDirectory();
  if (!dir) return;
  const base = inputPath.value.split(/[\\/]/).pop() || 'image';
  const dot = base.lastIndexOf('.');
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const tiles = tileRegions();
  processing.value = true;
  progress.value = 0;
  try {
    for (const t of tiles) {
      const name = `${stem}_r${t.ri}c${t.ci}${outExt(out.format, inputPath.value)}`;
      const outputPath = buildOutputPath(dir, name);
      await window.api.image.process({
        op: 'extract',
        inputPath: inputPath.value,
        outputPath,
        options: withOutput(
          { left: t.left, top: t.top, width: t.width, height: t.height },
          out
        )
      });
      progress.value++;
    }
    message(`分割完成，共 ${tiles.length} 块`, 'success');
    try {
      window.api.shell.showItemInFolder(buildOutputPath(dir, `${stem}_r1c1${extOf(inputPath.value)}`));
    } catch {
      /* ignore */
    }
  } catch (err) {
    message('处理失败：' + (err as Error).message, 'error');
  } finally {
    processing.value = false;
  }
}
</script>

<style scoped>
.batch-tool .import-panel {
  height: auto;
  max-height: 340px;
}
/* 分割预览：整图 + 覆盖其上的网格线。
   用 grid 把图片和网格放在同一个网格单元里，网格层自动贴合图片实际尺寸
   （图片是 object-fit: contain，直接绝对定位会超出图片边界） */
.slice-stage {
  display: grid;
  max-width: 100%;
  max-height: 100%;
}
.slice-stage > * {
  grid-area: 1 / 1;
}
.slice-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
.slice-grid {
  /* 外框（右边与下边的线由 outline 补上，重复渐变画不到末端） */
  outline: 1px solid var(--accent-base-color);
  outline-offset: -1px;
  pointer-events: none;
  opacity: 0.9;
}
</style>
