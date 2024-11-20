<!-- components/knowledgeDBContentCard.vue -->
<template>
  <div class="box-card">
    <div class="clearfix">
      <h3 style="margin-left: 10px;">知识库 {{ dataset.label }}</h3>
      <el-tooltip class="item" effect="dark" content="解析成功后才能问答哦。" placement="top">
        <span>😊解析成功后才能问答哦。</span>
      </el-tooltip>
    </div>

    <div class="custom-row">
      <div class="col-left">
        <div class="dropdown" :class="{ 'disabled': isDisabled }">
          <button class="dropdown-btn" :disabled="isDisabled">
            批量 <i class="el-icon-arrow-down el-icon--right"></i>
          </button>
          <div class="dropdown-menu" :class="{ 'disabled': isDisabled }">
            <div class="dropdown-item" @click="handleEnable" :disabled="isDisabled">
              <i class="el-icon-check">启用</i>
            </div>
            <div class="dropdown-item" @click="handleCancelEnable" :disabled="isDisabled">
              <i class="el-icon-close">取消</i>
            </div>
            <div class="dropdown-item" @click="handleDeleteDataset" :disabled="isDisabled">
              <i class="el-icon-delete">删除</i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-right">
        <input v-model="searchQuery" class="search-input" placeholder="搜索文件" @input="filteredDatasets" />
        <button class="primary-btn" @click="triggerFileSelect">新增文件</button>
        <input type="file" ref="fileInput" @change="handleFileChange" accept=".jpg,.png,.txt,.pdf,.docx"
          class="file-input" />
      </div>
    </div>
    <div class="divider"></div>

    <div class="table-container">
      <table :key="datasetsFile.length" class="custom-table">
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" /></th>
            <th>名称</th>
            <th>上传日期</th>
            <th>启用</th>
            <th>解析状态</th>
            <th>动作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dataset, index) in filteredDatasets" :key="index">
            <td><input type="checkbox" v-model="dataset.selected" /></td>
            <td>{{ dataset.name }}</td>
            <td>{{ dataset.uploadDate }}</td>
            <td>
              <input type="checkbox" v-model="dataset.enabled" @change="handleEnabledChange(dataset)" />
            </td>
            <td>
              <div v-if="!dataset.enabled" class="text-danger">未解析</div>
              <div v-else>
                <div v-if="dataset.progress < 100">
                  <progress :value="dataset.progress" max="100"></progress>
                </div>
                <div v-else class="text-success">已解析</div>
              </div>
            </td>
            <td>
              <button @click="deleteAction(dataset)">删除</button>
              <button @click="downloadAction(dataset)">下载</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import moment from 'moment';

export default {
  name: 'knowledgeDBContentCard',
  props: {
    dataset: {
      type: Object,
      required: true,
      default: () => ({ label: '知识库', value: '', description: '' }),
    },
  },
  data() {
    return {
      searchQuery: '',  // 搜索关键字
      datasetsFile: [], // 文件列表
      isLoading: false, // 是否正在加载
    };
  },
  computed: {
    // 根据搜索框输入内容过滤表格数据
    filteredDatasets() {
      // 如果没有输入内容，直接返回所有数据
      if (!this.searchQuery) {
        return this.datasetsFile;
      }

      // 根据 name 字段进行过滤，判断是否包含搜索框输入的内容
      return this.datasetsFile.filter(item => {
        return item.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    },
    isDisabled() {
      return this.datasetsFile.length === 0;
    },
    // 计算全选框的选中状态
    isAllSelected() {
      return this.datasetsFile.every(dataset => dataset.selected); // 判断是否所有行都已选中
    }
  },
  methods: {
    toggleSelectAll(event) {
      const isSelected = event.target.checked; // 获取全选框的状态
      this.datasetsFile.forEach(dataset => {
        dataset.selected = isSelected; // 设置每一行的选中状态
      });
    },
    // 启用选中的表格元素
    handleEnable() {
      const selectedDatasets = this.datasetsFile.filter(dataset => dataset.selected);
      if (selectedDatasets.length === 0) {
        ElMessage.warning('没有选中文件');
        return;
      }
      selectedDatasets.forEach(dataset => {
        dataset.enabled = true; // 将选中的表格元素的启用状态设置为 true
      });
      ElMessage.success('选中的文件已启用');
    },

    // 取消启用选中的表格元素
    handleCancelEnable() {
      const selectedDatasets = this.datasetsFile.filter(dataset => dataset.selected);
      if (selectedDatasets.length === 0) {
        ElMessage.warning('没有选中文件');
        return;
      }
      selectedDatasets.forEach(dataset => {
        dataset.enabled = false; // 将选中的表格元素的启用状态设置为 false
      });
      ElMessage.success('选中的文件已禁用');
    },
    // 批量删除操作
    async handleDeleteDataset() {
      const selectedDatasets = this.datasetsFile.filter(dataset => dataset.selected);
      if (selectedDatasets.length === 0) {
        ElMessage.warning('没有选中文件');
        return;
      }
      try {
        // 确认用户是否真的想删除
        const confirm = await this.$confirm('确认删除已选中的文件吗？', '警告', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        });

        // 用户确认删除
        if (confirm) {
          for (const row of selectedDatasets) {
            await this.deleteAction(row);  // 调用deleteAction删除每个已选中的文件
          }
          ElMessage.success('选中文件删除成功');
        }
      } catch (error) {
        ElMessage.error('删除操作被取消或发生错误');
        console.error('删除失败:', error);
      }
    },


    // 触发文件选择框
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    // 处理文件选择
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // 校验文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          ElMessage.error('不支持的文件类型，请上传 JPG、PNG、PDF、TXT 或 DOCX 格式的文件');
          // 清除文件选择框中的文件
          this.$refs.fileInput.value = '';
          return;
        }
        this.uploadFile(file);
      }
    },
    // 上传文件
    async uploadFile(file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetName", this.dataset.label);

      try {
        const response = await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("文件上传成功", response);
        console.log(response.data.file_path); // 文件路径

        ElMessage.success('文件上传成功！');
        this.fetchFiles();
      } catch (error) {
        console.error("文件上传失败", error);
        ElMessage.error('文件上传失败！');
      }
    },

    async fetchFiles() {
      console.log('获取文件列表');
      this.isLoading = true; // 开始加载状态

      try {
        const response = await axios.get('http://localhost:5000/files', {
          params: {
            datasetName: this.dataset.label,
          },
        });
        // 获取后端返回的新文件列表，并异步获取每个文件的状态
        const newFiles = await Promise.all(response.data.map(async (file) => {
          const status = false; // 使用 queryFileStatus 返回的值
          return {
            ...file,
            name: file.name,
            uploadDate: moment(file.uploadDate * 1000).format('YYYY-MM-DD HH:mm:ss'),
            enabled: status, // 使用 queryFileStatus 返回的值
            progress: status ? 100 : 0, // 初始化进度
            parseStatus: status ? '已解析' : '准备解析', // 初始化解析状态
          };
        }));

        // 保留前端现有文件的状态，并添加缺失的文件
        const updatedFiles = [...this.datasetsFile];

        newFiles.forEach(newFile => {
          const existingFile = updatedFiles.find(file => file.name === newFile.name);
          if (!existingFile) {
            // 添加缺失的文件
            updatedFiles.push(newFile);
          }
        });

        // 删除 newFiles 中不存在的文件
        this.datasetsFile = updatedFiles.filter(file => newFiles.some(newFile => newFile.name === file.name));
        ElMessage.success('文件列表刷新成功');

        // 手动触发表格重新渲染
        this.$nextTick(() => {
          this.searchQuery = ''; // 重置搜索框，触发 filteredDatasets 计算
        });
      } catch (error) {
        console.error('获取文件列表失败:', error);
        ElMessage.error('文件列表刷新失败: ' + error.message);
        // ElMessage.error( 'PDF上传成功！');
      }
      finally {
        this.isLoading = false; // 加载完毕后关闭加载状态
        this.startProgress(); // 启动进度条更新
      }
    },
    startProgress() {
      this.datasetsFile.forEach(file => {
        if (file.progress < 100) {
          const interval = setInterval(() => {
            if (file.progress < 100) {
              file.progress += Math.floor(Math.random() * 10) + 1;
            } else {
              clearInterval(interval);
              file.parseStatus = '已解析';
            }
          }, 500);
        }
      });
    },

    handleEnabledChange(row) {
      // 检查启用复选框的状态
      if (row.enabled) {
        // 启用操作，进行相应的状态更新（例如，向后端发送请求）
        console.log(`启用文件：${row.name}`);
        // 你可以在这里发送请求更新文件的启用状态
      } else {
        // 取消启用操作，进行状态更新（例如，向后端发送请求）
        console.log(`取消启用文件：${row.name}`);
        // 你可以在这里发送请求更新文件的禁用状态
      }
    },
    // 删除操作
    async deleteAction(row) {
      // 动态显示文件名
      this.$confirm(`确认删除文件 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          // 发送删除请求到后端
          const response = await axios.delete(`http://localhost:5000/delete/${this.dataset.label}/${row.name}`);

          if (response.status === 200) {
            ElMessage.success(`文件 "${row.name}" 删除成功`);
            // 从 datasetsFile 中删除该文件
            this.datasetsFile = this.datasetsFile.filter(dataset => dataset.name !== row.name);
          }
        } catch (error) {
          ElMessage.error(`文件 "${row.name}" 删除失败: ` + error.message);
          console.error('删除文件失败:', error);
        }
      }).catch(() => {
        console.log('取消删除');
      });
    },
    async downloadAction(row) {
      try {
        const response = await axios.get(`http://localhost:5000/download/${this.dataset.label}/${row.name}`, {
          responseType: 'blob',  // 以 blob 格式接收文件
        });

        // 创建临时的下载链接
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', row.name);  // 设置下载的文件名
        document.body.appendChild(link);
        link.click();  // 触发下载
        document.body.removeChild(link);  // 下载后移除临时链接

        ElMessage.success('文件下载成功');
      } catch (error) {
        ElMessage.error('文件下载失败: ' + error.message);
        console.error('下载文件失败:', error);
      }
    },
  },
};
</script>

<style scoped>
/* knowledgeDBContentCard 组件样式 */
.box-card {
  width: 99%;
  /* 让卡片宽度为父容器宽度的 100% */
  max-width: 99%;
  /* 限制最大宽度，避免横向扩展 */
  /* 高度自适应内容 */
  overflow: hidden;
  /* 防止内容溢出 */
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
}

.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 10px;
}

.custom-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.col-left,
.col-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.col-left {
  flex: 1;
}

.col-right {
  flex: 1;
  justify-content: flex-end;
}

.dropdown {
  width: max-content;
  position: relative;
  display: inline-block;
  margin-left: 10px;
}

/* 下拉菜单按钮样式 */
.dropdown-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  /* 按钮内边距 */
  font-size: calc(0.1vw + 10px);
  /* 自适应字体大小 */
  background: linear-gradient(135deg, #409eff, #66ccff);
  /* 渐变背景色 */
  color: white;
  /* 文字颜色 */
  border: none;
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  cursor: pointer;
  transition: all 0.3s ease;
  /* 过渡动画 */
  outline: none;
}

.dropdown-btn:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 下拉菜单的悬停效果 */
.dropdown-btn:hover {
  background: linear-gradient(135deg, #66ccff, #409eff);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  /* 增加阴影 */
  transform: scale(1.05);
  /* 鼠标悬停时放大按钮 */
}

/* 下拉菜单点击时的效果 */
.dropdown-btn:active {
  transform: scale(1.02);
  /* 按下时轻微缩小 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  /* 点击时的阴影 */
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 下拉菜单项 */
.dropdown-item {
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  /* 图标和文本之间的间距 */
  transition: background-color 0.3s ease;
  width: max-content;
}

/* 悬停时下拉菜单项的效果 */
.dropdown-item:hover {
  background-color: #f4f4f4;
}

/* 禁用状态的下拉菜单项 */
.dropdown-item:disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 下拉菜单显示时 */
.dropdown:hover .dropdown-menu {
  display: block;
}

/* 禁用下拉菜单时 */
.dropdown.disabled .dropdown-btn,
.dropdown.disabled .dropdown-item {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #ccc;
}



.search-input {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 2px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  /* 按钮内边距 */
  font-size: calc(0.1vw + 10px);
  /* 自适应字体大小 */
  background: linear-gradient(135deg, #409eff, #66ccff);
  /* 渐变背景色 */
  color: white;
  /* 文字颜色 */
  border: none;
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  cursor: pointer;
  transition: all 0.3s ease;
  /* 过渡动画 */
  outline: none;
  margin-right: 10px;
}

.primary-btn:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #66ccff, #409eff);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  /* 增加阴影 */
  transform: scale(1.05);
  /* 鼠标悬停时放大按钮 */
}

/* 按钮点击时的动画效果 */
.primary-btn:active {
  transform: scale(1.02);
  /* 按下时轻微缩小 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  /* 点击时的阴影 */
}

/* 按钮文本内的图标和文本 */
.primary-btn span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* 图标和文本之间的间距 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  #primary-btn {
    padding: 8px 16px;
    /* 小屏幕时减少内边距 */
    font-size: calc(2vw + 10px);
    /* 调整字体大小 */
  }
}

.file-input {
  display: none;
}

.divider {
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.table-container {
  flex-grow: 1;
  /* 使 table-container 占据剩余空间 */
  max-height: 90%;
  overflow-y: auto;
  /* 超出内容时启用垂直滚动条 */
}

.custom-table {
  width: 100%;
  overflow: auto;
  border-collapse: collapse;
}


.custom-table th,
.custom-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.custom-table th {
  background-color: #f4f4f4;
}

.custom-table input[type="checkbox"] {
  cursor: pointer;
}

.text-danger {
  color: red;
}

.text-success {
  color: green;
}
</style>
