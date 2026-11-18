import { pushToast, openDialog, type DialogAction, type DialogDetails } from './ui';

export function useDialog() {
  return {
    message: (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') =>
      pushToast(msg, type),
    alert: (message: string, title = '提示') => openDialog('alert', message, title),
    confirm: (message: string, title = '确认') => openDialog('confirm', message, title),
    /** 多选一：返回被点击动作的 value；details 可在正文下方展示可滚动的结构化列表 */
    choose: async (
      message: string,
      title = '请选择',
      actions: DialogAction[],
      details?: DialogDetails
    ): Promise<string> =>
      (await openDialog('choose', message, title, actions, undefined, details)) as string,
    /** 输入文本：返回输入内容，取消返回 null（Electron 下 window.prompt 不可用，必须走这里） */
    prompt: async (
      message: string,
      title = '输入',
      defaultValue = '',
      placeholder = ''
    ): Promise<string | null> =>
      (await openDialog('prompt', message, title, undefined, { value: defaultValue, placeholder })) as
        | string
        | null
  };
}
