/**
 * 模板引擎
 * 处理EJS模板和Vue SSR渲染
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import ejs from 'ejs';
import { createBundleRenderer } from 'vue-server-renderer';

import type { VueSSRContext } from '@/types';

export class TemplateEngine {
  private readonly ssrTemplate: string;
  private readonly ejsTemplate: string;
  private readonly vueRenderer: any;

  constructor() {
    // 读取模板文件
    this.ssrTemplate = readFileSync(
      join(__dirname, '../templates/template.ssr.html'),
      'utf8'
    );
    this.ejsTemplate = readFileSync(
      join(__dirname, '../templates/template.html'),
      'utf8'
    );

    // 读取Vue SSR bundle
    const serverBundle = readFileSync(
      join(__dirname, '../../../build/server.bundle.js'),
      'utf8'
    );

    // 创建Vue SSR渲染器
    this.vueRenderer = createBundleRenderer(serverBundle, {
      template: this.ssrTemplate,
    });
  }

  /**
   * 渲染EJS模板
   */
  public async render(
    template: string,
    data: Record<string, unknown>
  ): Promise<string> {
    return ejs.render(template, data);
  }

  /**
   * 渲染Vue SSR
   */
  public async renderVueSSR(context: VueSSRContext): Promise<string> {
    return new Promise((resolve, reject) => {
      this.vueRenderer.renderToString(context, (err: Error | null, html: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
  }

  /**
   * 渲染目录列表（使用EJS）
   */
  public async renderDirectoryListing(
    dirs: Array<{ name: string; path: string }>
  ): Promise<string> {
    return this.render(this.ejsTemplate, { dirs });
  }
} 