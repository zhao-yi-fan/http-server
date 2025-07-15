/**
 * 文件服务类
 * 处理所有文件系统相关操作
 */

import { promises as fs, createReadStream, type Stats } from 'fs';
import { join } from 'path';
import { type IncomingMessage, type ServerResponse } from 'http';
import mime from 'mime';

import type { DirectoryItem } from '@/types';

export class FileService {
  /**
   * 检查文件或目录是否存在
   */
  public async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件统计信息
   */
  public async stat(path: string): Promise<Stats> {
    return fs.stat(path);
  }

  /**
   * 读取目录内容
   */
  public async readDirectory(dirPath: string): Promise<DirectoryItem[]> {
    const entries = await fs.readdir(dirPath);
    const items: DirectoryItem[] = [];

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await this.stat(fullPath);
      
      items.push({
        name: entry,
        path: entry,
        isDirectory: stats.isDirectory(),
        size: stats.isFile() ? stats.size : undefined,
        mtime: stats.mtime,
      });
    }

    // 排序：目录在前，然后按名称排序
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * 发送文件内容
   */
  public async sendFile(
    filePath: string,
    _req: IncomingMessage,
    res: ServerResponse,
    range?: { start: number; end: number } | null
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = range
        ? createReadStream(filePath, { start: range.start, end: range.end })
        : createReadStream(filePath);

      stream.on('error', reject);
      stream.on('end', resolve);
      
      stream.pipe(res);
    });
  }

  /**
   * 获取文件MIME类型
   */
  public getMimeType(filePath: string): string {
    return mime.getType(filePath) || 'application/octet-stream';
  }
} 