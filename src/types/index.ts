/**
 * 核心类型定义文件
 * 定义整个项目的类型系统
 */

import type { IncomingMessage, ServerResponse } from 'http';
import type { Stats } from 'fs';

// ================================
// 配置相关类型
// ================================

/** 服务器配置接口 */
export interface ServerConfig {
  /** 服务器端口 */
  port: number;
  /** 服务器主机名 */
  host: string;
  /** 服务器根目录 */
  dir: string;
  /** 是否自动打开浏览器 */
  open?: boolean;
  /** 是否启用压缩 */
  compression?: boolean;
  /** 缓存设置 */
  cache?: CacheConfig;
}

/** 缓存配置接口 */
export interface CacheConfig {
  /** 强制缓存时间（秒） */
  maxAge: number;
  /** 是否启用ETag */
  etag: boolean;
  /** 是否启用Last-Modified */
  lastModified: boolean;
}

// ================================
// 文件系统相关类型
// ================================

/** 目录项信息 */
export interface DirectoryItem {
  /** 文件/目录名称 */
  name: string;
  /** 访问路径 */
  path: string;
  /** 是否为目录 */
  isDirectory: boolean;
  /** 文件大小（仅文件） */
  size?: number | undefined;
  /** 修改时间 */
  mtime?: Date | undefined;
}

/** 文件范围请求 */
export interface FileRange {
  /** 开始位置 */
  start: number;
  /** 结束位置 */
  end: number;
  /** 文件总大小 */
  total: number;
}

// ================================
// HTTP相关类型
// ================================

/** HTTP请求处理器类型 */
export type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void> | void;

/** HTTP中间件类型 */
export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => Promise<void> | void;

/** 错误处理器类型 */
export type ErrorHandler = (
  error: Error,
  req: IncomingMessage,
  res: ServerResponse
) => void;

// ================================
// 服务相关接口
// ================================

/** 文件服务接口 */
export interface FileService {
  /** 检查文件是否存在 */
  exists(path: string): Promise<boolean>;
  /** 获取文件统计信息 */
  stat(path: string): Promise<Stats>;
  /** 读取目录内容 */
  readDirectory(path: string): Promise<DirectoryItem[]>;
  /** 发送文件 */
  sendFile(path: string, req: IncomingMessage, res: ServerResponse): Promise<void>;
}

/** 模板引擎接口 */
export interface TemplateEngine {
  /** 渲染模板 */
  render(template: string, data: Record<string, unknown>): Promise<string>;
  /** 渲染Vue SSR */
  renderVueSSR(context: Record<string, unknown>): Promise<string>;
}

/** 压缩服务接口 */
export interface CompressionService {
  /** 检查是否支持压缩 */
  isSupported(req: IncomingMessage): boolean;
  /** 获取压缩流 */
  createCompressionStream(encoding: string): NodeJS.ReadWriteStream;
}

// ================================
// CLI相关类型
// ================================

/** CLI命令选项 */
export interface CliOptions {
  port?: string;
  host?: string;
  dir?: string;
  open?: boolean;
  help?: boolean;
  version?: boolean;
}

/** CLI命令接口 */
export interface CliCommand {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description: string;
  /** 执行命令 */
  execute(options: CliOptions): Promise<void> | void;
}

// ================================
// Vue SSR相关类型
// ================================

/** Vue SSR上下文 */
export interface VueSSRContext {
  /** 目录列表数据 */
  dirs?: DirectoryItem[];
  /** 请求URL */
  url?: string;
  /** 其他上下文数据 */
  [key: string]: unknown;
}

// ================================
// 工具类型
// ================================

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 可选属性 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** 函数返回类型的Promise包装 */
export type Promisify<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : never;

// ================================
// 常量类型
// ================================

/** HTTP状态码 */
export const enum HttpStatus {
  OK = 200,
  PARTIAL_CONTENT = 206,
  NOT_MODIFIED = 304,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

/** MIME类型常量 */
export const enum MimeType {
  HTML = 'text/html',
  CSS = 'text/css',
  JS = 'application/javascript',
  JSON = 'application/json',
  TEXT = 'text/plain'
}

/** 压缩编码 */
export const enum CompressionEncoding {
  GZIP = 'gzip',
  DEFLATE = 'deflate',
  BROTLI = 'br'
} 