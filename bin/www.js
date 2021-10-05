#! /usr/bin/env node

// 需要在命令行下解析用户执行的参数
let package = require('../package.json')
let commander = require('commander')
let parser = { // 默认值
  port: 3000,
  host: 'localhost',
  dir: process.cwd() // 默认为当前cmd的工作目录
}
commander.on('--help',function(){
  console.log('\r\nExample:');
    console.log('  zyf-server -p 3000 -o localhost');
})

let args = commander
  .version(package.version)
  .option('-p,--port <v>', 'server port')
  .option('-o,--host <v>', 'server hostname')
  .option('-d,--dir <v>', 'server directory')
  .parse(process.argv); // 要解析的对象

parser = { ...parser, ...args }; // 合并默认属性和配置后的属性

let Server = require('../server')
let server = new Server(parser);
server.start(); // 启动一个服务

