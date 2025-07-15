/**
 * TypeScript版本的简化入口文件
 * 用于测试和验证TypeScript重构
 */

import { Server } from './server/Server';
import { Logger } from './utils/Logger';
import type { ServerConfig } from './types';

const logger = new Logger('Main');

// 创建默认配置
const defaultConfig: ServerConfig = {
  port: 3000,
  host: 'localhost',
  dir: process.cwd(),
  open: true,
  compression: true,
  cache: {
    maxAge: 10,
    etag: true,
    lastModified: true,
  },
};

/**
 * 启动服务器
 */
async function start(): Promise<void> {
  try {
    logger.info('🚀 Starting TypeScript HTTP Server...');
    
    const server = new Server(defaultConfig);
    await server.start();
    
    logger.info('✅ Server started successfully!');
    logger.info(`📁 Serving directory: ${defaultConfig.dir}`);
    logger.info(`🌐 URL: http://${defaultConfig.host}:${defaultConfig.port}`);
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 如果直接运行这个文件
if (require.main === module) {
  start();
}

export { start, defaultConfig }; 