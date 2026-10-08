import { onBeforeUnmount, reactive, ref, watch, type Ref } from 'vue';
import type { ImageProcessOp, ImageProcessOptions } from '@shared/types';
import type { BatchItem } from '@renderer/utils/directoryScanner';
import { resolveBatchOutputPath, ensureDir } from '@renderer/utils/fileIO';
import { useDialog } from '@renderer/composables/useDialog';
import { resolveOutputConflicts } from '@renderer/composables/useOutputConflict';

/** 同名文件的处理策略（冲突处理已抽取到 useOutputConflict，此处仅作转发） */
export type ConflictStrategy = 'overwrite' | 'rename';

/** 每张图的执行参数：options/extra 二选一或都给；skip 非空则跳过该文件 */
export interface BatchTask {
  options?: ImageProcessOptions;
  extra?: Record<string, unknown>;
  skip?: string;
}

export interface BatchRunnerConfig {
  files: Ref<BatchItem[]>;
  saveDir: Ref<string>;
  keepRelative: Ref<boolean>;
  op: ImageProcessOp;
  /** 文件名后缀，如 '_resized'；由「添加后缀名」开关决定是否实际附加 */
  suffix: string;
  /** 是否在输出文件名上加后缀（默认开）；关闭时输出名与原文件同名 */
  addSuffix?: Ref<boolean>;
  /** 自定义后缀（留空则用 cfg.suffix 这个各工具的默认后缀） */
  customSuffix?: Ref<string>;
  /** 输出扩展名（含点）；不传则沿用原扩展名 */
  extOf?: (item: BatchItem) => string | undefined;
  /** 逐张生成执行参数（可异步，如裁剪需要读图片尺寸） */
  prepare: (item: BatchItem) => BatchTask | Promise<BatchTask>;
  /** 运行前校验，返回错误文案则拦截 */
  validate?: () => string | null;
}

/**
 * 批量处理统一执行器。
 *
 * 统一了原先散落在 BatchTool / WatermarkBatchView / cropper-batch 三处的 run()：
 * - 输出路径一律由 resolveBatchOutputPath 计算（含「保持相对目录」）
 * - 开始前检测同名文件，让用户选择「覆盖 / 自动重命名 / 取消」
 * - 串行执行、可中途取消（已完成的保留，不回滚）
 * - 单张失败提示后继续，结束后打开第一个成功输出的文件
 */
export function useBatchRunner(cfg: BatchRunnerConfig) {
  const { message, choose } = useDialog();
  const processing = ref(false);
  const cancelled = ref(false);
  const progress = reactive({ done: 0, total: 0 });

  function outPath(item: BatchItem): string {
    const useSuffix = cfg.addSuffix?.value !== false; // 未传时视为开启
    // 自定义后缀为空时回落到各工具的默认后缀（_compressed / _resized / ...）
    const custom = (cfg.customSuffix?.value ?? '').trim();
    return resolveBatchOutputPath(cfg.saveDir.value, item, {
      suffix: useSuffix ? custom || cfg.suffix : '',
      ext: cfg.extOf?.(item),
      keepStructure: cfg.keepRelative.value
    });
  }

  function cancel(): void {
    cancelled.value = true;
  }

  /**
   * 关闭窗口 / 托盘退出时的确认：批处理进行中不能默默中断。
   * 三选一：中断并关闭（取消剩余任务后关窗）、最小化到托盘（窗口隐藏，任务继续跑）、取消（什么都不做）。
   */
  async function confirmClose(): Promise<void> {
    if (!processing.value) return;
    const action = await choose(
      `批量处理正在进行中（已完成 ${progress.done}/${progress.total}）。\n\n中断后已处理完成的文件会保留，未开始的不再处理。`,
      '批量处理进行中',
      [
        { label: '中断并关闭', value: 'abort' },
        { label: '最小化到托盘', value: 'tray' },
        { label: '取消', value: 'cancel' }
      ]
    );
    if (action === 'abort') {
      cancel();
      window.api.window.closeNow();
    } else if (action === 'tray') {
      window.api.window.hide();
    }
  }

  // 处理状态同步给主进程：主进程据此拦截窗口关闭与退出
  watch(processing, (busy) => window.api.window.setBusy(busy), { immediate: true });
  const offConfirmClose = window.api.window.onConfirmClose(() => void confirmClose());
  onBeforeUnmount(() => {
    offConfirmClose();
    window.api.window.setBusy(false);
  });

  async function run(): Promise<void> {
    const files = cfg.files.value;
    if (!files.length) {
      message('请先导入图片', 'warning');
      return;
    }
    if (!cfg.saveDir.value) {
      message('请先设置保存位置', 'warning');
      return;
    }
    const invalid = cfg.validate?.();
    if (invalid) {
      message(invalid, 'warning');
      return;
    }

    // 1) 预计算输出路径，并统一处理同名冲突（与单图工具共用同一套逻辑）
    const planned = files.map((item) => outPath(item));
    const { outs, cancelled: aborted } = await resolveOutputConflicts(
      planned,
      files.map((item) => item.path)
    );
    if (aborted) return;

    // 3) 串行执行，可取消
    processing.value = true;
    cancelled.value = false;
    progress.done = 0;
    progress.total = files.length;
    let ok = 0;
    let skipped = 0;
    let firstOut = '';

    for (let i = 0; i < files.length; i++) {
      if (cancelled.value) break;
      const item = files[i];
      const out = outs[i];
      try {
        const task = await cfg.prepare(item);
        if (task.skip) {
          skipped++;
          message(`跳过 ${name(item)}：${task.skip}`, 'warning');
        } else {
          if (cfg.keepRelative.value && item.rel.includes('/')) {
            await ensureDir(out.slice(0, out.lastIndexOf('/')));
          }
          await window.api.image.process({
            op: cfg.op,
            inputPath: item.path,
            outputPath: out,
            options: task.options,
            extra: task.extra
          });
          ok++;
          if (!firstOut) firstOut = out;
        }
      } catch (e) {
        message(`失败 ${name(item)}：${(e as Error).message}`, 'error');
      }
      progress.done++;
    }

    processing.value = false;

    // 4) 结束提示（已完成的文件不回滚）
    const total = files.length;
    if (cancelled.value) {
      message(
        `已取消：已完成 ${ok}/${total} 张` + (skipped ? `，跳过 ${skipped} 张` : ''),
        'warning'
      );
    } else {
      message(
        `批量处理完成：${ok}/${total} 张成功` + (skipped ? `，${skipped} 张跳过` : ''),
        ok > 0 ? 'success' : 'warning'
      );
    }
    if (firstOut) {
      try {
        window.api.shell.showItemInFolder(firstOut);
      } catch {
        /* 忽略：某些平台可能不支持 */
      }
    }
  }

  return { processing, cancelled, progress, run, cancel };
}

function name(item: BatchItem): string {
  return item.path.split(/[\\/]/).pop() || 'image';
}
