<template>
  <div class="app-container">
    <!-- 侧边栏：显示文件树 -->
    <div class="sidebar">
      <div class="file-count-header">
        <button class="back-button" @click="goBack">
          ⬅️
        </button>
        <span style="text-align: center; flex-grow: 1;">全部文献 {{ totalFileCount }}</span>
      </div>
      <el-tree ref="tree" :data="fileTree" :props="defaultProps" node-key="id"
        :default-expanded-keys="defaultExpandedKeys" @node-click="handleNodeClick"
        @node-contextmenu="handleExpandToggle" :expand-on-click-node="true">
        <template #default="{ node, data }">
          <div class="tree-node" @click="handleExpandToggle(node)">
            <el-tooltip class="item" effect="dark" :content="data.name" placement="top">
              <span class="custom-node">
                {{ data.name }}
                <span v-if="data.children" class="file-count">({{ data.fileCount }})</span>
              </span>
            </el-tooltip>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 文件预览 -->
    <div class="file-preview">
      <div v-show="showSen">请选择文件打开</div>
      <VueOfficeDocx v-if="isDocx" :src="fileUrl" v-show="isDocxShow" class="docx-preview" />
      <iframe v-else-if="!isDocx && selectedFile" :src="fileUrl" frameborder="0" width="100%" height="100%"
        v-show="isShow"></iframe>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElTree, ElTooltip } from 'element-plus';
import VueOfficeDocx from '@vue-office/docx';

export default {
  name: 'knowledgeDBPreview',
  data() {
    return {
      fileTree: [], // 文件树数据
      selectedFile: null, // 当前选中的文件
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      totalFileCount: 0, // 文件总数
      showSen: true, // 是否显示选择文件提示
      isDocxShow: false, // 是否显示 docx 文件预览
      isDocx: false, // 是否为 docx 文件
      isShow: false, // 是否显示 iframe
    };
  },
  components: {
    ElTree,
    ElTooltip,
    VueOfficeDocx,
  },
  methods: {
    // 计算文件树中所有文件的总数
    calculateTotalFileCount(treeData) {
      let count = 0;
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          } else {
            count += 1;
          }
        });
      };
      traverse(treeData);
      return count;
    },
    // 递归计算每个文件夹下的文件数量
    calculateFileCounts(nodes) {
      nodes.forEach((node) => {
        node.fileCount = node.children ? this.calculateTotalFileCount(node.children) : 0;
        if (node.children) {
          this.calculateFileCounts(node.children);
        }
      });
    },
    // 获取文件树数据
    fetchFileTree() {
      axios
        .get('http://localhost:5000/allFiles')
        .then((response) => {
          this.fileTree = response.data;
          this.calculateFileCounts(this.fileTree);
          this.totalFileCount = this.calculateTotalFileCount(this.fileTree);
        })
        .catch((error) => {
          console.error('获取文件树失败:', error);
        });
    },
    // 点击文件夹节点展开/收起
    handleExpandToggle(node) {
      if (node.children && node.children.length > 0) {
        node.expanded ? node.collapse() : node.expand();
      }
    },
    // 处理文件节点点击事件
    handleNodeClick(node) {
      if (!node.children) {
        this.selectedFile = node.filePath;
        this.previewFile(node.filePath);
        this.showSen = false;
        if (this.isDocx) {
          this.isDocxShow = true;
        } else {
          this.isShow = true;
        }
      }
    },
    // 文件预览
    previewFile(filePath) {
      const fileExtension = filePath.split('.').pop().toLowerCase();
      this.isDocx = fileExtension === 'docx';
    },
    // 返回上一级
    goBack() {
      this.$router.go(-1); // 假设你使用的是 Vue Router
    },
  },
  created() {
    this.fetchFileTree();
  },
  computed: {
    fileUrl() {
      return this.selectedFile ? `http://localhost:5000/allFiles/${this.selectedFile}` : '';
    },
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  width: 20%;
  height: 100%;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-right: #409eff 2px solid;
}

.file-count-header {
  display: flex;
  justify-content: space-between;
  /* 让返回按钮和标题分开布局 */
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 10px;
}

.back-button {
  font-size: 20px;
  width: 40px;
  /* 按钮大小 */
  height: 40px;
  /* 按钮大小 */
  border: none;
  border-radius: 50%;
  /* 圆形 */
  background-size: 100% 100%;
  /* 强制让图片填充整个按钮 */
  background-position: center;
  cursor: pointer;
  /* 鼠标悬停时显示为可点击 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
}

.back-button:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
}


.file-preview {
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.custom-node {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}

.file-count {
  color: #999;
  margin-left: 5px;
  flex-shrink: 0;
}

.el-tooltip {
  max-width: 300px;
  word-wrap: break-word;
}

.docx-preview {
  width: 90%;
  height: 90%;
  overflow: auto;
  max-height: 200px;
}

.vue-office-docx.docx-preview {
  margin: 0;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}
</style>