<template>
  <div id="app">
    <div class="directory-header">
      <el-tag type="info" size="medium">
        <i class="el-icon-folder"></i> 目录浏览
      </el-tag>
      <span class="directory-count">{{ dirs.length }} 项</span>
    </div>
    
    <div class="directory-content">
      <table class="file-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>大小</th>
            <th>修改时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dirs" :key="item.name">
            <td>
              <a :href="item.path" class="file-link">
                <i :class="getFileIcon(item)" class="file-icon"></i>
                <span class="file-name">{{ item.name }}</span>
              </a>
            </td>
            <td>
              <span v-if="!item.isDirectory">{{ formatFileSize(item.size) }}</span>
              <span v-else class="directory-indicator">—</span>
            </td>
            <td>{{ formatDate(item.mtime) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Tag } from "element-ui";

export default {
  name: 'DirectoryListing',
  components: { 
    [Tag.name]: Tag
  },
  props: {
    dirs: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    getFileIcon(item) {
      if (item.isDirectory) {
        return 'el-icon-folder';
      }
      
      const ext = item.name.split('.').pop()?.toLowerCase();
      const iconMap = {
        'js': 'el-icon-document',
        'ts': 'el-icon-document', 
        'vue': 'el-icon-document',
        'html': 'el-icon-document',
        'css': 'el-icon-document',
        'json': 'el-icon-document',
        'md': 'el-icon-reading',
        'txt': 'el-icon-document-checked',
        'pdf': 'el-icon-tickets',
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'svg': 'el-icon-picture-outline',
        'zip': 'el-icon-collection',
        'gz': 'el-icon-collection',
        'tar': 'el-icon-collection',
        'yml': 'el-icon-setting',
        'yaml': 'el-icon-setting',
        'config': 'el-icon-setting',
        'lock': 'el-icon-lock'
      };
      
      return iconMap[ext] || 'el-icon-document';
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '—';
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN');
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'normalize.css';

$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$info-color: #909399;

.directory-header {
  padding: 20px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.directory-count {
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

.directory-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;

  th {
    background: #fafafa;
    color: #606266;
    font-weight: 600;
    padding: 16px 20px;
    text-align: left;
    border-bottom: 2px solid #ebeef5;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
    color: #606266;
    transition: background-color 0.2s ease;
  }

  tbody tr {
    cursor: pointer;
    
    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child td {
      border-bottom: none;
    }
  }
}

.file-link {
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover .file-name {
    color: #66b1ff;
  }
}

.file-name {
  text-decoration: underline;
  color: $primary-color;
  font-weight: 500;
  transition: color 0.2s ease;
}

.file-icon {
  font-size: 18px;
  margin-right: 10px;
  vertical-align: middle;
  transition: transform 0.2s ease;

  .file-link:hover & {
    transform: scale(1.1);
  }
}

.el-icon-folder {
  color: $primary-color;
}

.el-icon-document, 
.el-icon-document-checked {
  color: $info-color;
}

.el-icon-picture,
.el-icon-picture-outline {
  color: $success-color;
}

.el-icon-reading,
.el-icon-tickets {
  color: $warning-color;
}

.el-icon-setting,
.el-icon-collection,
.el-icon-lock {
  color: $danger-color;
}

.directory-indicator {
  color: #c0c4cc;
  font-style: italic;
}
</style>
