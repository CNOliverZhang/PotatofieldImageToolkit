import { useDialog } from '@renderer/composables/useDialog';
import { fileExists } from '@renderer/utils/fileIO';

/** 同名冲突的处理策略 */
export type ConflictStrategy = 'overwrite' | 'rename';

export interface ConflictResult {
  /** 最终输出路径（与 planned 一一对应）；取消时为空数组 */
  outs: string[];
  cancelled: boolean;
}

/** 路径同一性比较：忽略分隔符差异与大小写（Windows 路径不区分大小写） */
export function samePath(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
  return norm(a) === norm(b);
}

/** 生成不冲突路径：a.png → a_1.png → a_2.png（每一步都复核磁盘） */
export async function uniquePath(path: string, taken: Set<string>): Promise<string> {
  const slash = path.lastIndexOf('/');
  const dir = slash > 0 ? path.slice(0, slash + 1) : '';
  const base = slash > 0 ? path.slice(slash + 1) : path;
  const dot = base.lastIndexOf('.');
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : '';
  let n = 1;
  let candidate = `${dir}${stem}_${n}${ext}`;
  while (taken.has(candidate) || (await fileExists(candidate))) {
    taken.add(candidate);
    n++;
    candidate = `${dir}${stem}_${n}${ext}`;
  }
  taken.add(candidate);
  return candidate;
}

/**
 * 输出文件冲突处理（单图与批量共用，避免两套逻辑分叉）。
 *
 * 1) 预检哪些输出文件已存在
 * 2) 有冲突才弹窗三选一：自动重命名 / 覆盖 / 取消
 * 3) 「覆盖」若正好指向输入文件自身（用户选择覆盖原图），
 *    由主进程用「临时文件 + 原子替换」安全完成（sharp 不允许读写同一个文件）
 *
 * @param planned 计划输出路径
 * @param inputs  对应的输入路径（用于识别「覆盖原图」并给出更明确的提示）
 */
export async function resolveOutputConflicts(
  planned: string[],
  inputs: string[]
): Promise<ConflictResult> {
  const taken = new Set<string>();
  for (const p of planned) {
    if (await fileExists(p)) taken.add(p);
  }
  if (!taken.size) return { outs: planned.slice(), cancelled: false };

  const selfCount = planned.filter((p, i) => taken.has(p) && inputs[i] && samePath(p, inputs[i])).length;
  const text = selfCount
    ? `有 ${taken.size} 个输出文件已存在（其中 ${selfCount} 个是原图本身，共 ${planned.length} 个）。\n` +
      `选择「自动重命名」会在文件名后加 _1、_2 依次避让；选择「覆盖」会用处理结果替换原文件（原图不可恢复）。`
    : `有 ${taken.size} 个输出文件已存在（共 ${planned.length} 个）。\n` +
      `选择「自动重命名」会在文件名后加 _1、_2 依次避让；选择「覆盖」会替换原有文件。`;

  const { choose } = useDialog();
  const choice = await choose(text, '输出文件已存在', [
    { label: '自动重命名', value: 'rename', appearance: 'accent' },
    { label: '覆盖', value: 'overwrite' },
    { label: '取消', value: 'cancel' }
  ]);
  if (!choice || choice === 'cancel') return { outs: [], cancelled: true };
  if ((choice as ConflictStrategy) === 'overwrite') return { outs: planned.slice(), cancelled: false };

  const outs: string[] = [];
  for (const p of planned) {
    outs.push(taken.has(p) ? await uniquePath(p, taken) : p);
  }
  return { outs, cancelled: false };
}
