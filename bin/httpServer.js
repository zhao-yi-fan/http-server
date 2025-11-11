#!/usr/bin/env node

/**
 * zyf-server CLI 入口文件
 * 现代化的 HTTP 静态文件服务器，支持 Vue SSR 目录列表
 */

/* eslint-env node */
/* eslint-disable no-undef */

'use strict';

const packageInfo = require('../package.json');
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');

// 创建 Commander 程序
const program = new Command();

// 默认配置
const defaultConfig = {
  port: 3000,
  host: 'localhost',
  dir: process.cwd(), // 当前工作目录
};

// 配置命令行选项
program
  .name('zyf-server')
  .description('现代化的 HTTP 静态文件服务器，支持 Vue SSR 目录列表')
  .version(packageInfo.version)
  .option('-p, --port <number>', '服务器端口号', '3000')
  .option('-H, --host <string>', '服务器主机名', 'localhost')
  .option('-d, --dir <string>', '服务器目录 (绝对路径或相对路径)', process.cwd())
  .helpOption('-h, --help', '显示帮助信息')
  .addHelpText('after', `
${chalk.yellow('示例:')}
  $ zyf-server                          # 使用默认配置启动
  $ zyf-server -p 8080                  # 指定端口
  $ zyf-server -p 3000 -H 0.0.0.0      # 指定端口和主机
  $ zyf-server -d ./public              # 指定目录

${chalk.cyan('更多信息:')} https://github.com/zhao-yi-fan/http-server
`);

// 解析命令行参数
program.parse();

const options = program.opts();

// 验证端口号
const port = parseInt(options.port);
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(chalk.red('错误:'), '端口号必须是 1-65535 之间的数字');
  process.exit(1);
}

// 验证目录
const targetDir = path.resolve(options.dir || defaultConfig.dir);

// 合并配置
const config = {
  ...defaultConfig,
  port: port,
  host: options.host || defaultConfig.host,
  dir: targetDir,
};

// 启动服务器
async function startServer() {
  try {
    // 动态导入编译后的 TypeScript 模块
    const { Server } = require('../dist/src/server/Server');
    
    console.log(chalk.blue('🚀 启动 zyf-server...'));
    console.log(chalk.gray('配置信息:'));
    console.log(chalk.gray(`  端口: ${config.port}`));
    console.log(chalk.gray(`  主机: ${config.host}`));
    console.log(chalk.gray(`  目录: ${config.dir}`));
    console.log('');

    const server = new Server(config);
    await server.start();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error(chalk.red('错误:'), '找不到编译后的服务器文件。请先运行:', chalk.yellow('npm run build'));
    } else {
      console.error(chalk.red('启动服务器失败:'), error.message);
    }
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n正在关闭服务器...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n正在关闭服务器...'));
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error(chalk.red('未捕获的异常:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('未处理的 Promise 拒绝:'), reason);
  process.exit(1);
});

// 启动应用
startServer();

