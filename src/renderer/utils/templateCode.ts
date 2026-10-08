import CryptoJS from 'crypto-js';

/**
 * 模板码：把一组参数编码成一段可复制分享的文本。
 *
 * 沿用老版本的做法（对称加密 + 定长串），用于「把我的水印参数发给别人」这类场景。
 * 注意：这是**方便分享**的编码，不是安全机制 —— 密钥在客户端源码里，
 * 任何人都能解码，不要用它传递敏感信息，也不要依赖它做校验。
 */
const SECRET = 'potatofield-image-toolkit-template';

export function encodeTemplate(obj: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(obj), SECRET).toString();
}

export function decodeTemplate<T = unknown>(code: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(code, SECRET);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
