const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
// 第三方模块
const mime = require('mime');
const ejs = require('ejs');
const chalk = require('chalk');
const debug = require('debug')('dev');

const stat = promisify(fs.stat);
const access = promisify(fs.access);
const readdir = promisify(fs.readdir);
let template = fs.readFileSync(path.join(__dirname, './template.html'), 'utf8');

class Server {
  constructor(config) {
    this.config = config;
    this.template = template;
  }
  async handleRequest (req, res) {
    let { dir } = this.config; // cmd的工作目录
    let { pathname } = url.parse(req.url);
    let realPath = decodeURIComponent(path.join(dir, pathname));
    try {
      let statObj = await stat(realPath);
      if (statObj.isDirectory()) {
        let indexHtml = path.join(realPath, 'index.html');
        try {
          statObj = await stat(indexHtml);
          this.sendFile(req, res, indexHtml, statObj);
        } catch (e) { // 如果文件夹中没有index.html，则显示目录信息
          let dirs = await readdir(realPath);
          dirs = dirs.map(item => {
            let stats = fs.statSync(path.join(realPath, item));
            let p = path.join(pathname, item);
            // 如果是文件夹，必须写成'dir/'的形式，即最后必须有个'/'
            // 如果不的话，输入localhost:3000/dir，假设dir里有index.html,且页面里引用了img/pic.png
            // 那么就会去localhost:3000/img/pic.png找图片，图片就会不存在
            // 如果写成'localhost:3000/dir/'的话，就会去'localhost:3000/dir/img/pic.png'找图片，一切正常
            if (stats.isDirectory()) {
              p = p + '/';
            }
            return { name: item, path: p };
          });
          let renderStr = ejs.render(this.template, { dirs });
          res.setHeader('Content-Type', 'text/html; charset=utf8');
          res.end(renderStr);
        }
      } else {
        this.sendFile(req, res, realPath, statObj);
      }
    } catch (e) {
      debug(e);
      this.sendError(req, res);
    }
  }
  sendFile (req, res, realPath, statObj) {
    // 实现缓存
    if (this.cache(req, res, statObj)) {
      res.statusCode = 304;
      return res.end();
    }
    // 实现压缩和范围请求
    let gzip = this.gzip(req, res);
    let { start, end } = this.range(req, res, statObj);
    res.setHeader('Content-Type', mime.getType(realPath) + ';charset=utf8');
    if (gzip) {
      fs.createReadStream(realPath, { start, end }).pipe(gzip).pipe(res);
    } else {
      fs.createReadStream(realPath, { start, end }).pipe(res);
    }
  }
  range (req, res, statObj) {
    let range = req.headers.range;
    if (range) {
      let [, start, end] = range.match(/bytes=(\d*)-(\d*)/);
      start = start ? Number(start) : 0;
      end = end ? Number(end) : statObj.size - 1;
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${statObj.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      return { start, end };
    } else {
      return { start: 0, end: statObj.size - 1 };
    }
  }
  gzip (req, res) {
    let gzip = req.headers['accept-encoding'];
    if (gzip) {
      if (gzip.match(/\bgzip\b/)) {
        res.setHeader('Content-Encoding', 'gzip');
        return zlib.createGzip();
      } else if (gzip.match(/\bdeflate\b/)) {
        res.setHeader('Content-Encoding', 'deflate');
        return zlib.createDeflate();
      }
    } else {
      return false;
    }
  }
  cache (req, res, statObj) {
    // 强制缓存
    res.setHeader('Cache-Control', 'max-age=10');
    res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString());
    // 对比缓存
    let serverCtime = statObj.ctime.toGMTString();
    res.setHeader('Last-Modified', serverCtime);
    let clientCtime = req.headers['if-modified-since'];
    return serverCtime === clientCtime;
  }
  sendError (req, res) {
    res.statusCode = 404;
    res.end('Not Found');
  }
  start () {
    let server = http.createServer(this.handleRequest.bind(this));
    server.on('error', err => {
      if (err.errno === 'EADDRINUSE') {
        console.log(chalk.red(` Error: `) + `listen EADDRINUSE :::${this.config.port}`);
      }
    });
    server.listen(this.config.port, () => {
      console.log(`Server start: http://${this.config.host}:${chalk.green(this.config.port)}`);
    });
  }
}

module.exports = Server;