/** 裁剪区域的几何换算：单图（cropper.js 画布）与批量（无画布）共用 */

export interface CropRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CropMeta {
  width: number;
  height: number;
}

export type HAlign = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';

/** 定位基准九宫格（与水印工具一致） */
export const CROP_POSITIONS: { g: string; label: string }[] = [
  { g: 'nw', label: '左上' },
  { g: 'n', label: '上' },
  { g: 'ne', label: '右上' },
  { g: 'w', label: '左' },
  { g: 'center', label: '居中' },
  { g: 'e', label: '右' },
  { g: 'sw', label: '左下' },
  { g: 's', label: '下' },
  { g: 'se', label: '右下' }
];

export const CROP_RATIOS: Record<string, [number, number]> = {
  '1:1': [1, 1],
  '4:3': [4, 3],
  '16:9': [16, 9],
  '3:2': [3, 2],
  '2:3': [2, 3]
};

export function hAlignOf(position: string): HAlign {
  if (position === 'nw' || position === 'w' || position === 'sw') return 'left';
  if (position === 'ne' || position === 'e' || position === 'se') return 'right';
  return 'center';
}

export function vAlignOf(position: string): VAlign {
  if (position === 'nw' || position === 'n' || position === 'ne') return 'top';
  if (position === 'sw' || position === 's' || position === 'se') return 'bottom';
  return 'middle';
}

/** 钳制裁剪区域：不越界、尺寸至少 1px */
export function clampRegion(region: CropRegion, meta: CropMeta | null): void {
  if (!meta) return;
  const iw = Math.max(1, Math.round(meta.width));
  const ih = Math.max(1, Math.round(meta.height));
  region.width = Math.min(Math.max(1, Math.round(region.width)), iw);
  region.height = Math.min(Math.max(1, Math.round(region.height)), ih);
  region.left = Math.min(Math.max(0, Math.round(region.left)), iw - region.width);
  region.top = Math.min(Math.max(0, Math.round(region.top)), ih - region.height);
}

/**
 * 解析宽高比：支持 `3:2`、`3：2`（全角冒号）、`1.5`（纯数值=宽/高）。
 * 非法输入返回 null（调用方应忽略，保持当前区域不变）。
 */
export function parseRatio(input: string): [number, number] | null {
  const s = String(input ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    return a > 0 && b > 0 ? [a, b] : null;
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? [n, 1] : null;
}

/** 比例字符串 → 宽高比数值（预设表里没有就按 parseRatio 解析，支持自定义比例） */
export function ratioValue(ratio: string): number | null {
  const preset = CROP_RATIOS[ratio];
  if (preset) return preset[0] / preset[1];
  const parsed = parseRatio(ratio);
  return parsed ? parsed[0] / parsed[1] : null;
}

/**
 * 无画布时按「比例设置 + 定位基准」计算裁剪区域（批量裁剪用）。
 * 取图片内满足比例的最大矩形，再按基准摆放。
 */
export function applyRatioPreset(
  region: CropRegion,
  meta: CropMeta | null,
  ratio: string,
  position: string
): void {
  if (!meta || ratio === 'free') return;
  // 预设表里没有就按自定义比例解析（如 3:2、21:9、1.85）
  const parsed = CROP_RATIOS[ratio] ?? parseRatio(ratio);
  if (!parsed) return;
  const [rw, rh] = parsed;
  const iw = meta.width;
  const ih = meta.height;
  let w = iw;
  let h = (iw * rh) / rw;
  if (h > ih) {
    h = ih;
    w = (ih * rw) / rh;
  }
  const hA = hAlignOf(position);
  const vA = vAlignOf(position);
  region.left = Math.round(hA === 'left' ? 0 : hA === 'right' ? iw - w : (iw - w) / 2);
  region.top = Math.round(vA === 'top' ? 0 : vA === 'bottom' ? ih - h : (ih - h) / 2);
  region.width = Math.round(w);
  region.height = Math.round(h);
  clampRegion(region, meta);
}

/** 百分比换算（除数为 0 时返回 0） */
export function pctOf(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.round((value / total) * 100));
}

/** 把区域按百分比换算到目标图（比例模式：构图随图片尺寸等比变化） */
export function scaleRegionToImage(
  region: CropRegion,
  meta: CropMeta | null,
  imageWidth: number,
  imageHeight: number
): CropRegion | null {
  if (!meta || !meta.width || !meta.height || imageWidth < 1 || imageHeight < 1) return null;
  const w = Math.max(1, Math.round((region.width / meta.width) * imageWidth));
  const h = Math.max(1, Math.round((region.height / meta.height) * imageHeight));
  const left = Math.round((region.left / meta.width) * imageWidth);
  const top = Math.round((region.top / meta.height) * imageHeight);
  return clampToImage({ left, top, width: w, height: h }, imageWidth, imageHeight);
}

/** 固定像素区域适配到目标图：尺寸按图片裁剪、位置钳到边界内（不报错、不越界） */
export function clampRegionToImage(
  region: CropRegion,
  imageWidth: number,
  imageHeight: number
): CropRegion | null {
  return clampToImage(region, imageWidth, imageHeight);
}

/** 图片太小（裁不出 1px）时返回 null，由调用方跳过该文件 */
function clampToImage(
  region: CropRegion,
  imageWidth: number,
  imageHeight: number
): CropRegion | null {
  if (imageWidth < 1 || imageHeight < 1) return null;
  const w = Math.min(Math.max(1, Math.round(region.width)), imageWidth);
  const h = Math.min(Math.max(1, Math.round(region.height)), imageHeight);
  const left = Math.min(Math.max(0, Math.round(region.left)), imageWidth - w);
  const top = Math.min(Math.max(0, Math.round(region.top)), imageHeight - h);
  if (w < 1 || h < 1) return null;
  return { left, top, width: w, height: h };
}
