import Vue from 'vue';
import App from './App.vue';

export default context => {
  const { dirs } = context;

  // 创建vue实例
  return new Promise(resolve => {
    const app = new Vue({
      render: h =>
        h(App, {
          props: { dirs }, // ✅ 正确的props传递方式
        }),
    });
    resolve(app);
  });
};
