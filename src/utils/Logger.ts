/**
 * 简单的日志工具类
 */

import chalk from 'chalk';
import debug from 'debug';

export class Logger {
  private readonly debugger: debug.Debugger;
  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
    this.debugger = debug(`zyf-server:${namespace}`);
  }

  public info(message: string, ...args: unknown[]): void {
    console.log(chalk.blue(`[${this.namespace}]`), message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    console.warn(chalk.yellow(`[${this.namespace}] WARN:`), message, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    console.error(chalk.red(`[${this.namespace}] ERROR:`), message, ...args);
  }

  public debug(message: string, ...args: unknown[]): void {
    this.debugger(message, ...args);
  }
} 