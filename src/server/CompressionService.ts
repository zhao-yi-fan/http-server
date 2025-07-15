/**
 * 压缩服务
 * 处理HTTP响应压缩
 */

import { createGzip, createDeflate } from 'zlib';
import { type IncomingMessage } from 'http';
import { CompressionEncoding } from '@/types';

export class CompressionService {
  /**
   * 检查请求是否支持压缩
   */
  public isSupported(req: IncomingMessage): boolean {
    const acceptEncoding = req.headers['accept-encoding'];
    return Boolean(acceptEncoding);
  }

  /**
   * 获取最佳压缩格式
   */
  public getBestEncoding(req: IncomingMessage): CompressionEncoding | null {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (acceptEncoding.includes('gzip')) {
      return CompressionEncoding.GZIP;
    }
    
    if (acceptEncoding.includes('deflate')) {
      return CompressionEncoding.DEFLATE;
    }
    
    return null;
  }

  /**
   * 创建压缩流
   */
  public createCompressionStream(encoding: CompressionEncoding): NodeJS.ReadWriteStream {
    switch (encoding) {
      case CompressionEncoding.GZIP:
        return createGzip();
      case CompressionEncoding.DEFLATE:
        return createDeflate();
      default:
        throw new Error(`Unsupported compression encoding: ${encoding}`);
    }
  }
} 