export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif' | 'avif';

/**
 * PNG 输出的压缩模式。
 * - lossless：只优化 PNG 编码参数，像素完全不变
 * - recommended：调色板量化 q90，肉眼几乎无差别（默认）
 * - smaller：调色板量化 q80，可能出现轻微颗粒或半透明边缘瑕疵
 */
export type PngMode = 'lossless' | 'recommended' | 'smaller';

export interface ImageProcessOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: ImageFormat;
  quality?: number;
  /** PNG 输出模式；只影响目标格式为 PNG 的输出，JPEG/WebP 仍用 quality */
  pngMode?: PngMode;
  background?: string;
  /** 裁剪区域（op='extract'） */
  left?: number;
  top?: number;
  /** 拼接方向（op='append'） */
  dir?: 'vertical' | 'horizontal';
  /** 拼接边距（op='append'）：四周留白，图与图之间同宽 */
  margin?: number;
  /** 结果长边上限（op='append'）：用于预览时等比缩小，避免生成超大图 */
  maxDimension?: number;
}

export type ImageProcessOp =
  | 'resize'
  | 'convert'
  | 'compress'
  | 'metadata'
  | 'watermark'
  | 'append'
  | 'extract';

export interface ImageProcessPayload {
  op: ImageProcessOp;
  inputPath: string;
  outputPath?: string;
  options?: ImageProcessOptions;
  extra?: Record<string, unknown>;
}

export interface ImageProcessResult {
  outputPath?: string;
  info?: Record<string, unknown>;
  buffer?: ArrayBuffer;
  /** 结果图像的真实尺寸（拼接预览被等比缩小时，用于显示实际输出尺寸） */
  width?: number;
  height?: number;
  /** 读取元数据时返回的完整元数据（op='metadata'） */
  tags?: Record<string, unknown>;
  /** 读取元数据时返回的「精选」分组数据（op='metadata'） */
  meta?: ImageMeta;
  /** 输出文件的体积与最终采用的策略，供界面显示压缩结果 */
  outputStats?: {
    sourceBytes?: number;
    outputBytes: number;
    strategy: 'original' | 'lossless' | 'palette' | 'encoded';
  };
}

/** 元数据条目 */
export interface MetaEntry {
  label: string;
  value: string;
}

/** 元数据分组（标题 + 条目） */
export interface MetaSection {
  title: string;
  entries: MetaEntry[];
}

/**
 * 精选元数据：只保留摄影爱好者 / 设计师真正会看的字段。
 * 原始 EXIF 有几百项（含大量厂商私有标签），全量展示没有意义，
 * 因此由主进程解析后筛成这几组。
 */
export interface ImageMeta {
  sections: MetaSection[];
}

export interface SelectFileOptions {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  multiSelections?: boolean;
}

export interface UpdaterStatus {
  event: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error';
  data?: unknown;
}

/* ----------------------------- 水印工具 ----------------------------- */

export type WatermarkGravity = 'nw' | 'n' | 'ne' | 'w' | 'center' | 'e' | 'sw' | 's' | 'se';

export interface WatermarkParams {
  type: 'text' | 'image';
  /** 文本内容（type=text） */
  text: string;
  fontSize: number;
  color: string;
  /** 0..1 */
  opacity: number;
  bold: boolean;
  fontFamily: string;
  /** 文字字重（数值字符串，如 "400"/"700"/"900"）；缺省时导出按 bold 推断 */
  fontWeight?: string;
  /** 旋转角度（度） */
  rotation: number;
  gravity: WatermarkGravity;
  /** 位置单位：percent=相对（边距为百分比、大小为占图宽百分比）；pixel=绝对像素（边距为 px、字号为 px） */
  positionUnit?: 'percent' | 'pixel';
  /** 百分比模式下水印整体宽度占图片宽度的百分比（可 >100，表示水印比图片更宽） */
  sizePct?: number;
  /** 水平内边距，占图片宽度百分比（0..100），仅非平铺、百分比模式且定位含左/右时生效 */
  offsetX: number;
  /** 垂直内边距，占图片高度百分比（0..100），仅非平铺、百分比模式且定位含上/下时生效 */
  offsetY: number;
  /** 像素模式的水平内边距（px，可为负表示溢出到图外），仅非平铺且定位含左/右时生效 */
  offsetXPx?: number;
  /** 像素模式的垂直内边距（px，可为负表示溢出到图外），仅非平铺且定位含上/下时生效 */
  offsetYPx?: number;
  /** 是否平铺铺满整图 */
  tile: boolean;
  /** 平铺间距（px） */
  tileGap: number;
  /** 水印图片路径（type=image） */
  watermarkPath: string;
  /** 相对原图短边的缩放比例 0..1（type=image） */
  scale: number;
  format: 'original' | 'png' | 'jpeg' | 'webp';
  quality: number;
  /** PNG 输出模式；水印模板里的旧数据没有该字段，渲染层展示时回落到推荐档 */
  pngMode?: PngMode;
}

/** 模板归属的工具（未来可扩展；目前仅水印） */
export type TemplateToolKey = 'watermark';

/** 模板项：参数为对应工具的参数快照，按泛型区分类型 */
export interface TemplateItem<P = Record<string, unknown>> {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  params: P;
  /** 来自旧版本（3.x）导入的模板 */
  legacy?: boolean;
}

/** 跨窗口传递的「应用模板」载荷 */
export interface TemplateApplyPayload {
  /** 模板参数 */
  params: Record<string, unknown>;
  /** 来源模板 id（用于工具页回显当前选中的模板） */
  templateId?: string;
}

/**
 * 模板库数据：主进程 userData/templates.json 的结构。
 * 同时作为变更广播的载荷 —— 主进程是唯一数据源，收到即用，不存在「副本过期」问题。
 */
export interface TemplateStoreData {
  version: number;
  /** 是否已完成旧版本（3.x）模板导入（只跑一次） */
  legacyImported: boolean;
  templates: Record<TemplateToolKey, TemplateItem[]>;
}

/** 模板编辑窗口的入参（主进程暂存，窗口打开后取走） */
export interface TemplateEditPayload {
  tool: TemplateToolKey;
  /** 编辑已有模板的 id；新建为空串 */
  id: string;
  name: string;
  /** 新建时为 null，编辑页用默认参数 */
  params: Record<string, unknown> | null;
}
