import { ref, onBeforeUnmount } from 'vue';
import { selectImageFiles, selectDirectory } from '@renderer/utils/filePicker';
import { useDialog } from '@renderer/composables/useDialog';
import { buildOutputPath } from '@renderer/utils/fileIO';
import { resolveOutputConflicts } from '@renderer/composables/useOutputConflict';

/**
 * 单图工具通用逻辑：选择图片、预览（防抖）、保存目录选择。
 * 各工具页仅需提供「预览计算函数」与「保存执行函数」。
 */
export function useSingleTool() {
  const { message } = useDialog();
  const inputPath = ref('');
  const inputName = ref('');
  const previewUrl = ref('');
  const processing = ref(false);
  let previewTimer: number | undefined;

  function clearPreview() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = '';
    }
  }

  /** 直接指定图片（拖放导入等场景）：与 pickImage 走同一套状态更新 */
  function setImage(path: string): boolean {
    if (!path) return false;
    inputPath.value = path;
    inputName.value = path.split(/[\\/]/).pop() || '';
    return true;
  }

  async function pickImage(): Promise<boolean> {
    const files = await selectImageFiles(false);
    if (!files || !files.length) return false;
    return setImage(files[0]);
  }

  function setPreviewBuffer(buf: ArrayBuffer) {
    const blob = new Blob([buf], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const previous = previewUrl.value;
    // 先换上新的再释放旧的：避免中间出现一帧空 src（表现为闪一下占位框/裂图）
    previewUrl.value = url;
    if (previous) URL.revokeObjectURL(previous);
  }

  function schedulePreview(fn: () => Promise<ArrayBuffer | undefined>) {
    if (previewTimer) window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(async () => {
      if (!inputPath.value) return;
      try {
        const buf = await fn();
        if (buf) setPreviewBuffer(buf);
      } catch (err) {
        message('预览失败：' + (err as Error).message, 'error');
      }
    }, 220);
  }

  async function runSave(
    buildName: (stem: string) => string,
    runFn: (outputPath: string) => Promise<void>
  ) {
    if (!inputPath.value) {
      message('请先选择图片', 'warning');
      return;
    }
    const dir = await selectDirectory();
    if (!dir) return;
    const base = inputPath.value.split(/[\\/]/).pop() || 'image';
    const dot = base.lastIndexOf('.');
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const name = buildName(stem);
    const outputPath = buildOutputPath(dir, name);

    // 同名冲突处理（与批量工具共用）：自动重命名 / 覆盖 / 取消
    // 若输出正好等于输入（如压缩保持原格式且存到原目录），由主进程用临时文件原子替换
    const { outs, cancelled } = await resolveOutputConflicts([outputPath], [inputPath.value]);
    if (cancelled) return;
    const finalPath = outs[0];

    processing.value = true;
    try {
      await runFn(finalPath);
      message('已保存：' + (finalPath.split(/[\\/]/).pop() || name), 'success');
      try {
        window.api.shell.showItemInFolder(finalPath);
      } catch {
        /* 忽略：某些平台可能不支持 */
      }
    } catch (err) {
      message('处理失败：' + (err as Error).message, 'error');
    } finally {
      processing.value = false;
    }
  }

  onBeforeUnmount(() => {
    clearPreview();
    if (previewTimer) window.clearTimeout(previewTimer);
  });

  return { inputPath, inputName, previewUrl, processing, pickImage, setImage, schedulePreview, runSave };
}

export function evVal(e: Event): string {
  return (e.target as HTMLInputElement).value;
}
export function evNum(e: Event): number {
  return Number((e.target as HTMLInputElement).value);
}
export function evChk(e: Event): boolean {
  return (e.target as HTMLInputElement).checked;
}

/** 取文件路径的扩展名（含点，如 .png），无扩展名时回退为 .png */
export function extOf(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot > 0 ? path.slice(dot) : '.png';
}
