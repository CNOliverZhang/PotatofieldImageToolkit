import { app, shell } from 'electron';
import { execFile } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * 唤起「洋芋田富文本编辑器」（本应用的兄弟产品）。
 *
 * 三级策略，依次降级：
 * 1. **协议**：它注册了 URL scheme 就用协议唤起（最理想，跨平台一致、还能传参）
 * 2. **本地应用**：没协议就找已安装的可执行文件 / .app，直接启动
 * 3. **都没有**：返回 none，由渲染层打开下载页
 *
 * 协议名与富文本编辑器约定为 `potatofield-richtext-editor`（它注册后无需改动这里）。
 */
const COMPANION_PROTOCOL = 'potatofield-richtext-editor';

export type CompanionMethod = 'protocol' | 'app' | 'none';

export interface CompanionResult {
  ok: boolean;
  method: CompanionMethod;
  /** 实际使用的协议或路径，便于排查 */
  detail?: string;
}

/** 协议：是否被某个应用接管（Windows 走注册表、macOS 走 LaunchServices） */
function protocolHandler(): string | null {
  try {
    return app.getApplicationNameForProtocol(`${COMPANION_PROTOCOL}://`) ? COMPANION_PROTOCOL : null;
  } catch {
    // 某些平台/版本会抛错，当作没有处理者
    return null;
  }
}

/** Windows：从卸载项里找安装目录（匹配逻辑放 PowerShell 内，避免我们解析中文乱码） */
async function installedDirWin32(): Promise<string | null> {
  const script =
    "Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*', " +
    "'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*', " +
    "'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' " +
    "-ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match '富文本|RichText|richtext' } | " +
    'ForEach-Object { if ($_.InstallLocation) { $_.InstallLocation }; if ($_.UninstallString) { $_.UninstallString } }';
  try {
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', script],
      { timeout: 8000, windowsHide: true }
    );
    for (const raw of stdout.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      // UninstallString 形如："C:\Program Files\xxx\Uninstall yyy.exe" /allusers
      const quoted = line.match(/^"?([A-Za-z]:\\[^"]+\.exe)"?/i)?.[1];
      const dir = quoted ? dirname(quoted) : line;
      if (dir && existsSync(dir)) return dir;
    }
  } catch {
    /* PowerShell 不可用/超时：返回 null 走下载页 */
  }
  return null;
}

/** macOS：在常见位置找 .app（名称匹配；不依赖 Spotlight 索引） */
function installedAppDarwin(): string | null {
  const home = process.env.HOME ?? '';
  const roots = ['/Applications', join(home, 'Applications'), '/System/Applications'];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    try {
      for (const entry of readdirSync(root)) {
        if (!entry.endsWith('.app')) continue;
        if (/富文本|richtext/i.test(entry)) return join(root, entry);
      }
    } catch {
      /* 目录不可读则跳过 */
    }
  }
  return null;
}

/** 找到本地已安装的富文本编辑器（可执行文件路径或 .app 路径） */
export async function findRichTextEditor(): Promise<string | null> {
  if (process.platform === 'win32') {
    const dir = await installedDirWin32();
    if (!dir) return null;
    try {
      // exe 名是本地化的（如「洋芋田富文本编辑器.exe」），不能硬编码：
      // 取目录下第一个非卸载程序的 exe
      const exe = readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith('.exe'))
        .filter((f) => !/uninstall|卸载/i.test(f))[0];
      return exe ? join(dir, exe) : null;
    } catch {
      return null;
    }
  }
  if (process.platform === 'darwin') return installedAppDarwin();
  return null;
}

/** 富文本编辑器是否可用（有协议或有本地应用）—— 供界面决定按钮文案 */
export async function hasRichTextEditor(): Promise<boolean> {
  if (protocolHandler()) return true;
  return (await findRichTextEditor()) !== null;
}

/** 依次尝试：协议 → 本地应用；都不行返回 none（由调用方打开下载页） */
export async function openRichTextEditor(): Promise<CompanionResult> {
  const scheme = protocolHandler();
  if (scheme) {
    const url = `${scheme}://open?from=imagetoolkit`;
    await shell.openExternal(url);
    return { ok: true, method: 'protocol', detail: url };
  }

  const target = await findRichTextEditor();
  if (target) {
    // 返回空串表示成功启动
    const err = await shell.openPath(target);
    return err ? { ok: false, method: 'app', detail: err } : { ok: true, method: 'app', detail: target };
  }

  return { ok: false, method: 'none' };
}
