const Vue = require('vue')

module.exports = ({ dirs }) => {
  console.log(dirs, 'dirs==');
  // 创建vue实例
  const vm = new Vue({
    template: `<ul>
    <li v-for="(item) in dirs"><a :href="item.path">{{item.name}}</a></li>
    </ul>`,
    data () {
      return {
        dirs
      }
    },
  })
  return vm
}