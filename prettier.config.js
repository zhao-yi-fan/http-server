/** @type {import('prettier').Config} */
export default {
  // 基础配置
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JavaScript/TypeScript
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // 换行符
  endOfLine: 'lf',
  
  // 其他格式
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  
  // 文件覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always'
      }
    }
  ]
}; 