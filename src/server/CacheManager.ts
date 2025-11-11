/**
 * 缓存管理器
 * 处理HTTP缓存策略
 */

import { type IncomingMessage, type ServerResponse } from 'http';
import { type Stats } from 'fs';
import type { CacheConfig } from '@/types';

export class CacheManager {
  private readonly config: CacheConfig;

  constructor(config?: CacheConfig) {
    this.config = {
      maxAge: config?.maxAge ?? 10,
      etag: config?.etag ?? true,
      lastModified: config?.lastModified ?? true,
    };
  }

  /**
   * 检查资源是否未修改
   */
  public isNotModified(req: IncomingMessage, stats: Stats): boolean {
    if (!this.config.lastModified) return false;

    const serverTime = stats.ctime.toUTCString();
    const clientTime = req.headers['if-modified-since'];

    return serverTime === clientTime;
  }

  /**
   * 设置缓存相关头部
   */
  public setHeaders(res: ServerResponse, stats: Stats): void {
    // 强制缓存
    res.setHeader('Cache-Control', `max-age=${this.config.maxAge}`);
    res.setHeader(
      'Expires',
      new Date(Date.now() + this.config.maxAge * 1000).toUTCString()
    );

    // 对比缓存 - Last-Modified
    if (this.config.lastModified) {
      res.setHeader('Last-Modified', stats.ctime.toUTCString());
    }

    // 对比缓存 - ETag
    if (this.config.etag) {
      const etag = this.generateETag(stats);
      res.setHeader('ETag', etag);
    }
  }

  /**
   * 生成ETag
   */
  private generateETag(stats: Stats): string {
    const mtime = stats.mtime.getTime().toString(16);
    const size = stats.size.toString(16);
    return `"${size}-${mtime}"`;
  }
} 