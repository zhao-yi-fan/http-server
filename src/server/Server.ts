/**
 * HTTP静态文件服务器核心类
 * 采用现代化的TypeScript面向对象设计
 */

import { createServer, type Server as HttpServer, type IncomingMessage, type ServerResponse } from 'http';
import { join } from 'path';
import chalk from 'chalk';
import open from 'open';

import type { 
  ServerConfig, 
  DeepReadonly 
} from '@/types';

import { FileService } from './FileService';
import { TemplateEngine } from './TemplateEngine';
// import { CompressionService } from './CompressionService';
import { CacheManager } from './CacheManager';
import { Logger } from '@/utils/Logger';

/**
 * HTTP静态文件服务器
 */
export class Server {
  private readonly httpServer: HttpServer;
  private readonly config: DeepReadonly<ServerConfig>;
  private readonly fileService: FileService;
  private readonly templateEngine: TemplateEngine;
  // private readonly _compressionService: CompressionService;
  private readonly cacheManager: CacheManager;
  private readonly logger: Logger;

  /**
   * 构造函数
   * @param config 服务器配置
   */
  constructor(config: ServerConfig) {
    this.config = Object.freeze({ ...config });
    this.logger = new Logger('Server');
    
    // 初始化服务
    this.fileService = new FileService();
    this.templateEngine = new TemplateEngine();
    // this._compressionService = new CompressionService();
    this.cacheManager = new CacheManager(this.config.cache);
    
    // 创建HTTP服务器
    this.httpServer = createServer(this.handleRequest.bind(this));
    this.setupErrorHandlers();
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.config.port, this.config.host, () => {
        const url = `http://${this.config.host}:${chalk.green(this.config.port)}`;
        this.logger.info(`Server started: ${url}`);
        
        // 自动打开浏览器
        if (this.config.open) {
          this.openBrowser(url);
        }
        
        resolve();
      });

      this.httpServer.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          const message = `Port ${this.config.port} is already in use`;
          this.logger.error(message);
          reject(new Error(message));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * 停止服务器
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        this.logger.info('Server stopped');
        resolve();
      });
    });
  }

  /**
   * 处理HTTP请求
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      await this.processRequest(req, res);
    } catch (error) {
      this.handleError(error as Error, req, res);
    }
  }

  /**
   * 处理请求逻辑
   */
  private async processRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const fullPath = join(this.config.dir, pathname);

    this.logger.debug(`${req.method} ${pathname}`);

    // 检查文件是否存在
    const exists = await this.fileService.exists(fullPath);
    if (!exists) {
      this.sendNotFound(res);
      return;
    }

    const stats = await this.fileService.stat(fullPath);

    if (stats.isDirectory()) {
      await this.handleDirectory(fullPath, pathname, req, res);
    } else {
      await this.handleFile(fullPath, req, res, stats);
    }
  }

  /**
   * 处理目录请求
   */
  private async handleDirectory(
    fullPath: string, 
    pathname: string, 
    req: IncomingMessage, 
    res: ServerResponse
  ): Promise<void> {
    // 尝试查找index.html
    const indexPath = join(fullPath, 'index.html');
    const hasIndex = await this.fileService.exists(indexPath);

    if (hasIndex) {
      const indexStats = await this.fileService.stat(indexPath);
      await this.handleFile(indexPath, req, res, indexStats);
    } else {
      await this.renderDirectoryListing(fullPath, pathname, req, res);
    }
  }

  /**
   * 处理文件请求
   */
  private async handleFile(
    filePath: string,
    req: IncomingMessage,
    res: ServerResponse,
    stats: any
  ): Promise<void> {
    // 检查缓存
    if (this.cacheManager.isNotModified(req, stats)) {
      res.statusCode = 304;
      res.end();
      return;
    }

    // 设置缓存头
    this.cacheManager.setHeaders(res, stats);

    // 处理Range请求
    const range = this.parseRangeHeader(req.headers.range, stats.size);
    
    if (range) {
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stats.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', range.end - range.start + 1);
    } else {
      res.setHeader('Content-Length', stats.size);
    }

    // 设置MIME类型
    const mimeType = this.fileService.getMimeType(filePath);
    res.setHeader('Content-Type', `${mimeType}; charset=utf-8`);

    // 发送文件
    await this.fileService.sendFile(filePath, req, res, range);
  }

  /**
   * 渲染目录列表
   */
  private async renderDirectoryListing(
    dirPath: string,
    pathname: string,
    _req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const items = await this.fileService.readDirectory(dirPath);
    
    // 格式化目录项
    const dirs = items.map(item => ({
      name: item.name,
      path: join(pathname, item.name) + (item.isDirectory ? '/' : ''),
      isDirectory: item.isDirectory,
      size: item.size,
      mtime: item.mtime
    }));

    // 使用Vue SSR渲染
    const html = await this.templateEngine.renderVueSSR({ dirs });
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  }

  /**
   * 解析Range头
   */
  private parseRangeHeader(rangeHeader: string | undefined, fileSize: number) {
    if (!rangeHeader) return null;

    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (!match) return null;

    const start = match[1] ? parseInt(match[1], 10) : 0;
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    return { start, end };
  }

  /**
   * 发送404错误
   */
  private sendNotFound(res: ServerResponse): void {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('404 Not Found');
  }

  /**
   * 错误处理
   */
  private handleError(error: Error, _req: IncomingMessage, res: ServerResponse): void {
    this.logger.error('Request error:', error);
    
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('500 Internal Server Error');
    }
  }

  /**
   * 设置错误处理器
   */
  private setupErrorHandlers(): void {
    this.httpServer.on('clientError', (err, socket) => {
      this.logger.error('Client error:', err);
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

  /**
   * 打开浏览器
   */
  private async openBrowser(url: string): Promise<void> {
    try {
      await open(url, { app: { name: 'google chrome' } });
    } catch (error) {
      this.logger.warn('Failed to open browser:', error);
    }
  }

  /**
   * 获取服务器配置
   */
  public getConfig(): DeepReadonly<ServerConfig> {
    return this.config;
  }

  /**
   * 获取服务器状态
   */
  public isListening(): boolean {
    return this.httpServer.listening;
  }
} 