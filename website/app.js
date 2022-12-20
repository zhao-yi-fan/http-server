import Vue from 'vue'
import App from './App.vue'
export default (context) => {
  const { dirs } = context
  // 创建vue实例
  return new Promise((resolve, reject) => {
    const app = new Vue({
      render: (h) => h(App,{
        dirs
      })
    })
    resolve(app)
  })
}