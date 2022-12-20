<template>
  <div id="app">
    <el-tag>目录</el-tag>
    <ul>
      <li v-for="item in list">
        <a :href="item.path">{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { Tag } from "element-ui";

export default {
  components: { [Tag.name]: Tag },
  data() {
    return {
      list: [],
    };
  },
  created() {
    this.list = this.$vnode.data.dirs;
  },
};
</script>
<style lang="css" scoped>
@import 'element-ui/lib/theme-chalk/tag.css';
</style>
