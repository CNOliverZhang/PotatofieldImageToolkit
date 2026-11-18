import { reactive } from 'vue';
import type { ImageFormat, ImageProcessOptions, PngMode } from '@shared/types';
import { useSettingsStore, type DefaultOutputFormat } from '@renderer/stores/settings';

/** 工具的「输出设置」：格式 + 质量。默认值来自设置页的「默认输出」 */
export interface OutputOpts {
  format: DefaultOutputFormat;
  quality: number;
  /** PNG 模式；与 quality 独立，老用户持久化数据里没有该字段时回落到推荐档 */
  pngMode: PngMode;
}

export function createOutputOpts(): OutputOpts {
  const s = useSettingsStore();
  return reactive({
    format: s.defaultOutput.format,
    quality: s.defaultOutput.quality,
    pngMode: s.defaultOutput.pngMode ?? 'recommended'
  });
}

/**
 * 是否需要显示/传递「质量」：
 * - jpeg / webp：直接有损编码
 * - original：批量里可能混有 JPG/WebP，保持原格式时它们仍按质量编码；PNG 会忽略该参数
 */
export function needsQuality(format: string): boolean {
  return format === 'original' || format === 'jpeg' || format === 'webp';
}

/** 传给主进程的输出格式：保持原格式时不传，由 sharp 按原图输出 */
export function outFormat(o: OutputOpts): ImageFormat | undefined {
  return o.format === 'original' ? undefined : (o.format as ImageFormat);
}

/** 传给主进程的质量：JPG/WebP 生效；original 对混格式的批量任务也需要带上，PNG 侧会忽略 */
export function outQuality(format: string, quality: number): number | undefined {
  return needsQuality(format) ? quality : undefined;
}

/** 输出文件扩展名：保持原格式时沿用输入文件的扩展名 */
export function outExt(format: string, inputPath: string): string {
  if (format === 'original') {
    const base = inputPath.split(/[\\/]/).pop() ?? '';
    const i = base.lastIndexOf('.');
    return i > 0 ? base.slice(i) : '.png';
  }
  return format === 'jpeg' ? '.jpg' : `.${format}`;
}

/** 组装到 ImageProcessOptions 里 */
export function withOutput(base: ImageProcessOptions, o: OutputOpts): ImageProcessOptions {
  const format = outFormat(o);
  const quality = outQuality(o.format, o.quality);
  if (format) base.format = format;
  if (quality !== undefined) base.quality = quality;
  // 'original' 的批量任务里可能混有 PNG，模式始终带上；主进程只在目标确为 PNG 时使用
  if (o.format === 'png' || o.format === 'original') base.pngMode = o.pngMode;
  return base;
}
