#!/usr/bin/env node

/**
 * CLI入口文件
 * 基于TypeScript重写的命令行工具
 */

import { Command } from 'commander';
import chalk from 'chalk';

import { Server } from '@/server/Server';
import { Logger } from '@/utils/Logger';
import type { ServerConfig, CliOptions } from '@/types';

const logger = new Logger('CLI');
const packageJson = require('../../../package.json');

/**
 * 创建默认配置
 */
function createDefaultConfig(): ServerConfig {
  return {
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
}

/**
 * 解析CLI选项并转换为服务器配置
 */
function parseOptions(options: CliOptions): ServerConfig {
  const config = createDefaultConfig();

  if (options.port) {
    const port = parseInt(options.port, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      logger.error('Invalid port number. Must be between 1 and 65535.');
      process.exit(1);
    }
    config.port = port;
  }

  if (options.host) {
    config.host = options.host;
  }

  if (options.dir) {
    config.dir = options.dir;
  }

  if (options.open !== undefined) {
    config.open = options.open;
  }

  return config;
}

/**
 * 启动服务器
 */
async function startServer(config: ServerConfig): Promise<void> {
  try {
    const server = new Server(config);
    await server.start();

    // 优雅退出处理
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  console.log(chalk.cyan('🚀 ZYF Server - Modern HTTP Static File Server'));
  console.log(chalk.gray(`Version: ${packageJson.version}`));
  console.log('');
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const program = new Command();

  program
    .name('zyf-server')
    .description('A modern HTTP static file server with Vue SSR directory listing')
    .version(packageJson.version)
    .option('-p, --port <port>', 'server port', '3000')
    .option('-h, --host <host>', 'server hostname', 'localhost')
    .option('-d, --dir <dir>', 'server directory (absolute path or relative path)', process.cwd())
    .option('--no-open', 'do not open browser automatically')
    .helpOption('--help', 'display help for command');

  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ zyf-server -p 3000 -h localhost');
    console.log('  $ zyf-server -d ./public --no-open');
    console.log('  $ zyf-server -p 8080 -d /var/www');
  });

  program.parse();
  const options = program.opts() as CliOptions;

  showWelcome();

  const config = parseOptions(options);
  await startServer(config);
}

// 启动应用
if (require.main === module) {
  main().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main, startServer, parseOptions }; 