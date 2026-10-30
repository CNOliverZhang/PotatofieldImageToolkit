import { ref } from 'vue';
import { IMAGE_EXTENSIONS } from '@renderer/utils/filePicker';
import { scanImageDirectory, type BatchItem } from '@renderer/utils/directoryScanner';
import { relativePath } from '@renderer/utils/fileIO';

/**
 * 拖拽导入：把系统拖进来的 File 解析成本地路径，并按需递归展开文件夹。
 *
 * 抽成 composable 的原因：单图预览区（ImagePicker）与批量导入区（BatchImportPanel）
 * 需要完全一致的行为——只有带文件才高亮、进入/离开要计数防抖、文件夹与图片一视同仁，
 * 各自实现一份迟早会跑偏。
 */

/** 取文件绝对路径：新版 Electron 移除了 File.path，统一用 preload 暴露的 webUtils */
export function filePathOf(file: File): string {
  try {
    // 兼容旧版本 Electron 仍带 path 的情况
    const legacy = (file as File & { path?: string }).path;
    if (legacy) return legacy;
    return window.api.fs.getPathOfFile(file) || '';
  } catch {
    return '';
  }
}

export function isImagePath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}

/** 单条拖拽结果：path 为绝对路径，rel 为相对来源根目录的位置（无根目录时取文件名） */
export type DroppedFile = BatchItem;

export interface UseFileDropOptions {
  /** 解析完成的图片（文件夹已递归展开） */
  onFiles: (files: DroppedFile[]) => void;
  /** 是否把拖入的文件夹递归展开为其中的图片，默认 true */
  folders?: boolean;
  /** 被忽略掉的非图片（数量 + 路径列表，用于提示具体格式） */
  onRejected?: (count: number, paths: string[]) => void;
}

export function useFileDrop(options: UseFileDropOptions) {
  const dragging = ref(false);
  /** 拖拽进入/离开的嵌套计数：避免划过子元素时误判为离开 */
  let depth = 0;

  function hasFiles(e: DragEvent): boolean {
    const types = e.dataTransfer?.types;
    return !!types && Array.prototype.includes.call(types, 'Files');
  }

  function onDragEnter(e: DragEvent) {
    if (!hasFiles(e)) return;
    depth++;
    dragging.value = true;
  }

  function onDragOver(e: DragEvent) {
    if (!hasFiles(e)) return;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    dragging.value = true;
  }

  function onDragLeave() {
    depth = Math.max(0, depth - 1);
    if (depth === 0) dragging.value = false;
  }

  async function onDrop(e: DragEvent) {
    depth = 0;
    dragging.value = false;

    const dropped = Array.from(e.dataTransfer?.files ?? []);
    const found: DroppedFile[] = [];
    const rejected: string[] = [];

    for (const file of dropped) {
      const path = filePathOf(file);
      if (!path) continue;

      // 文件夹：按「扫描文件夹」的规则递归取出其中的图片
      if (options.folders !== false) {
        const st = await window.api.fs.stat(path).catch(() => null);
        if (st?.isDirectory) {
          const r = await scanImageDirectory(path);
          rejected.push(...r.errorList.map((it) => it.path));
          for (const p of r.fileList) found.push({ path: p, rel: relativePath(path, p) });
          continue;
        }
      }

      if (isImagePath(path)) {
        found.push({ path, rel: path.split(/[\\/]/).pop() ?? path });
      } else {
        rejected.push(path);
      }
    }

    if (rejected.length) options.onRejected?.(rejected.length, rejected);
    if (found.length) options.onFiles(found);
  }

  return { dragging, onDragEnter, onDragOver, onDragLeave, onDrop };
}
