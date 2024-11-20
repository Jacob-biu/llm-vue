<template>
  <ParticleCanvas class="backgroundParticleCanvas" />

  <div id="app">
    <!-- 页面容器 -->
    <div class="container">
      <!-- 左侧抽屉部分 -->
      <div :class="['left-panel', { open: isDrawerOpen }]">
        <!-- 上部分：按钮 -->
        <div class="top-panel">
          <div class="button-container_drawer-toggle_left">
            <button class="drawer-toggle" id="drawer-toggle-left" @click="toggleDrawer"></button>
          </div>
          <div class="button-container_refresh-button_left" v-if="!isRefreshButtonVisible">
            <button class="refresh-button" id="refresh-button-left" @click="refreshPage"></button>
          </div>
        </div>
        <!-- 下部分：抽屉内容 -->
        <div v-if="isDrawerOpen" class="drawer-content">
          <h2>Left Panel</h2>
          <p>This is the content of the drawer.</p>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="right-panel">
        <header>
          <!-- 右侧页眉分成三个div，比例为1:3:1 -->
          <div class="header-left">
            <!-- 左侧部分内容靠左 -->
            <div class="button-container_drawer-toggle_right">
              <button class="drawer-toggle" id="drawer-toggle-right" @click="toggleDrawer"
                :class="['right-toggle', { visible: !isDrawerOpen, hidden: isDrawerOpen }]">
              </button>
            </div>

            <div class="button-container_refresh-button_right" v-if="isRefreshButtonVisible">
              <button class="refresh-button" id="refresh-button-right" @click="refreshPage"></button>
            </div>

            <div class="CustomSelect">
              <CustomSelect :options="knowledgeBaseList" :selectedItem="selectedItem"
                @update:selectedItem="onSelectedValueChange" placeholder="请选择一个选项" />
            </div>
          </div>
          <div class="header-center">
            <!-- 中间部分内容居中 -->
            <!-- <h1>Right Panel Header</h1> -->
          </div>
          <div class="header-right">
            <button class="circle-button" @click="toggleMenu"></button>
            <div v-if="menuVisible" class="menu-container">
              <AvatarModel @closeMenu="closeMenu" />
            </div>
          </div>
        </header>
        <main>
          <router-view :knowledgeBaseList="knowledgeBaseList" @updateKnowledgeBaseList="updateKnowledgeBaseList"></router-view>
        </main>
        <footer>
          <p>GPT 也可能会犯错。请核查重要信息。</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import ParticleCanvas from './components/ParticlesBackground.vue';
import CustomSelect from './components/KnowledgeBaseSelector.vue';
import AvatarModel from './components/avatarModel.vue';
import { mapState, mapActions } from 'vuex';
import axios from 'axios';


export default {
  name: "App",
  data() {
    return {
      isDrawerOpen: false, // 控制抽屉开关的状态
      isRefreshButtonVisible: true, // 控制 refresh-button 是否显示
      // 存储选中的知识库
      selectedKnowledgeBase: 'null',
      // 知识库列表
      knowledgeBaseList: [
        { label: 'Qwen-7b', value: 'null', description: '' },  // 默认值为空
        // { label: '知识库1', value: 'kb1', description: '' },
        // { label: '知识库2', value: 'kb2', description: '' },
        // 其他知识库...
      ],
      selectedItem: { label: 'Qwen-7b', value: 'null', description: '' },
      menuVisible: false,  // 控制菜单显示/隐藏
    };
  },
  components: {
    ParticleCanvas,
    CustomSelect,
    AvatarModel,
  },
  computed: {
    ...mapState(['selectedDBItem']),
  },
  mounted() {
    this.fetchFolders();  // 获取文件夹数据
    // 在组件挂载后添加点击事件监听器
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // 在组件销毁前移除事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    ...mapActions(['updateSelectedDBItem']),

    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen; // 切换抽屉状态
      this.isRefreshButtonVisible = !this.isRefreshButtonVisible; // 切换右侧的 refresh-button 显示
    },
    refreshPage() {
      if (this.$route.path === '/') {
        this.$router.go(0);  // 刷新当前页面
      } else {
        // 否则跳转到主页
        this.$router.push({ path: '/' });
      }
    },
    // 当选中的值变化时输出新的值
    onSelectedValueChange(item) {
      this.selectedItem = item;
      this.updateSelectedDBItem(item);  // 更新 store 中的 selectedItem
      console.log("选中的值是:", this.selectedItem.label); // 输出选中的值
      console.log("选中的项是:", this.selectedItem); // 输出选中的值
    },
    toggleMenu() {
      this.menuVisible = !this.menuVisible;  // 切换菜单显示状态
    },
    // 关闭菜单的方法
    closeMenu() {
      this.menuVisible = false;
    },
    updateKnowledgeBaseList(updatedList) {
      this.knowledgeBaseList = updatedList;  // 更新 knowledgeBaseList
    },

    async fetchFolders() {
      try {
        const response = await axios.get('http://localhost:5000/list_folders');

        // 将获取到的文件夹数据
        const newFolders = response.data.map(folder => ({
          label: folder.label,
          value: folder.value,
          description: folder.description || '' // 处理空描述的情况
        }));

        // 遍历 newFolders，检查哪些 folder 不在 knowledgeBaseList 中
        newFolders.forEach(newFolder => {
          // 判断 knowledgeBaseList 中是否已经包含该 folder
          const isExist = this.knowledgeBaseList.some(existingFolder => existingFolder.value === newFolder.value);

          // 如果不在，则将该文件夹添加到 knowledgeBaseList 中
          if (!isExist) {
            this.knowledgeBaseList.push(newFolder);
          }
        });

        console.log("文件夹数据:", this.knowledgeBaseList); // 输出文件夹数据
      } catch (error) {
        console.error("Error fetching folders:", error); // 错误处理
      }
    },
  },
};
</script>

<style>
/* 保证页面的 html 和 body 高度为 100% */
html,
body {
  height: 100%;
  margin: 0;
  /* 去除默认的边距 */
  overflow: hidden;
  /* 禁用滚动条 */
}

#app {
  font-family: 'Times New Roman', 'LiSu', 'SimSun', 'KaiTi_GB2312', 'Songti SC', 'Avenir', 'Helvetica', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*display: flex;*/
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  position: relative;
}

/* 样式设置：语言标签 */
.code-header {
  background-color: #333;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  font-family: monospace;
  border-bottom: 1px solid #555;
  border-radius: 3px 3px 0 0;
  display: inline-block;
  margin-bottom: -1px;
  /* 防止与代码块产生间距 */
}

/* 让代码块的顶部和语言标签对齐 */
pre {
  position: relative;
  margin-top: 0;
}

pre code {
  padding-top: 20px;
  /* 为了确保语言标注不会遮挡代码 */
  display: block;
  overflow-x: auto;
}

pre code::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-button {
  display: none;
}

::-webkit-scrollbar-track {
  background-color: rgba(70, 166, 255, 0.1);
  display: none;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(70, 166, 255, 0.4);
  border: 2px solid transparent;
  border-radius: 6px;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

h1,
h2,
h3,
h4,
h5,
h6,
strong,
p,
pre,
ol,
ul {
  margin: 0;
}

#background {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-image: url('./assets/blue-grey-bg.webp');
  background-position: center;
  filter: blur(3px);
  position: fixed;
  z-index: -2;
}

.backgroundParticleCanvas {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: fixed;
  z-index: -1;
}

/* 布局容器 */
.container {
  display: flex;
  height: 100vh;
  /* 保证容器占满整个视口 */
  overflow: hidden;
  /* 禁用容器内的滚动条 */
  border-radius: 20px;
  /* 设置整体圆角 */
}

/* 左侧抽屉部分 */
.left-panel {
  background-color: transparent;
  position: relative;
  width: 0px;
  transition: width 0.3s ease;
  overflow: hidden;
  /* 确保圆角不会影响相邻部分 */
  border: none;
  border-top-left-radius: 20px;
  /* 左上角圆角 */
  border-bottom-left-radius: 20px;
  /* 左下角圆角 */
  padding-top: 5px;
}

/* 左侧抽屉展开时的样式 */
.left-panel.open {
  width: 250px;
  background-color: rgba(0, 0, 0, 0.05);
  border-right: 2px solid rgba(0, 0, 0, 0.1);
}

/* 上部按钮部分 */
.top-panel {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5px;
  padding-right: 5px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

/* 确保 refresh-button-container 在 top-panel 中靠右 */
.top-panel .refresh-button-container {
  margin-left: auto;
}

/* 抽屉按钮 */
.drawer-toggle {
  background-color: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease;
  z-index: 10;
  background-image: url('./assets/windmill.svg');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
}

.drawer-toggle:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
}

.left-panel.open .drawer-toggle {
  transform: rotate(180deg);
}

/* 刷新按钮样式 */
.refresh-button {
  background-color: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease;
  background-image: url('./assets/penNote.svg');
  /* 设置刷新图标 */
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  /* 圆形按钮 */
}

.refresh-button:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
}

/* 抽屉内容 */
.drawer-content {
  padding: 20px;
  color: black;
}

/* 右侧内容部分 */
.right-panel {
  flex: 1;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  border: none;
  border-top-right-radius: 20px;
  /* 右上角圆角 */
  border-bottom-right-radius: 20px;
  /* 右下角圆角 */
  padding-top: 5px;
}

/* 右侧页眉样式，分为左右三部分，比例为1:3:1 */
.right-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background-color: transparent;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  border-top-right-radius: 20px;
  /* 保持右上角圆角 */
}

/* 左侧部分：按钮 */
.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  /* 使得伪元素定位相对该元素 */
}

/* 中间部分：标题 */
.header-center {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧部分：保持空白 */
.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 10px;
  padding-right: 10px;
}

/* 圆形按钮样式 */
.circle-button {
  width: 40px;
  /* 按钮大小 */
  height: 40px;
  /* 按钮大小 */
  border: none;
  border-radius: 50%;
  /* 圆形 */
  background-image: url('./assets/avatar.svg');
  /* 设置背景图 */
  background-size: 100% 100%;
  /* 强制让图片填充整个按钮 */
  background-position: center;
  /* 背景图居中 */
  background-repeat: no-repeat;
  /* 确保背景图片不重复 */
  cursor: pointer;
  /* 鼠标悬停时显示为可点击 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  /* 确保按钮的定位为父元素的相对定位 */
}

.circle-button:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
  /* 鼠标悬停时的阴影效果 */
}

.menu-container {
  position: absolute;
  top: 60px;
  /* 让菜单出现在按钮下方，60px可以根据需要调整 */
  right: 0;
  z-index: 1000;
  /* 确保菜单浮动在其他元素之上 */
  backdrop-filter: blur(10px);
  /* 毛玻璃效果 */
  border-radius: 10px;
  /* 圆角 */
  padding: 10px;
}

.right-panel main {
  flex: 1;
  display: flex;
  /* 启用 flexbox 布局 */
  justify-content: center;
  justify-items: center;
  /* 水平居中 */
  align-items: center;
  align-content: center;
  /* 垂直居中 */
  padding: 10px;
  overflow-y: auto;
  flex-direction: column;
}

.right-panel footer {
  background-color: transparent;
  padding: 10px;
  text-align: center;
  border: none;
  font: 1em sans-serif;
}

/* 右侧按钮缓慢显示样式 */
.right-toggle {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease, transform 0.3s ease;
}

.right-toggle.visible {
  opacity: 1;
  visibility: visible;
  transform: rotate(180deg);
}

/* 当按钮需要隐藏时，使用 .hidden 类 */
.hidden {
  display: none;
}

.button-container_refresh-button_left,
.button-container_drawer-toggle_left,
.button-container_refresh-button_right,
.button-container_drawer-toggle_right {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* 鼠标悬停时显示提示 */
.button-container_drawer-toggle_right:hover::after {
  content: "打开边栏";
  position: absolute;
  bottom: -50px;
  /* 提示框距离按钮下方50px */
  left: 40px
    /* 提示框距离按钮左侧40px */
  ;
  transform: translateX(-50%);
  /* 使得提示框水平居中 */
  background-color: #4CAF50;
  /* 背景色，类似聊天气泡 */
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  /* 圆角效果 */
  font-size: 14px;
  white-space: nowrap;
  /* 防止文字换行 */
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 阴影效果，给气泡浮动感 */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 使用伪元素添加气泡箭头 */
.button-container_drawer-toggle_right:hover::before {
  content: "";
  position: absolute;
  bottom: -15px;
  /* 箭头距离气泡的底部 */
  left: 20px;
  transform: translateX(-50%) rotate(180deg);
  /* 水平居中并旋转箭头 */
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #4CAF50;
  /* 箭头颜色，与气泡颜色相同 */
}

/* 鼠标悬停时显示提示 */
.button-container_drawer-toggle_left:hover::after {
  content: "关闭边栏";
  position: absolute;
  top: 12px;
  /* 提示框距离按钮下方50px */
  left: 102px
    /* 提示框距离按钮左侧40px */
  ;
  transform: translateX(-50%);
  /* 使得提示框水平居中 */
  background-color: #4CAF50;
  /* 背景色，类似聊天气泡 */
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  /* 圆角效果 */
  font-size: 14px;
  white-space: nowrap;
  /* 防止文字换行 */
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 阴影效果，给气泡浮动感 */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 使用伪元素添加气泡箭头 */
.button-container_drawer-toggle_left:hover::before {
  content: "";
  position: absolute;
  left: 55px;
  /* 箭头距离气泡的底部 */
  top: 25px;
  transform: translateX(-50%) rotate(90deg);
  /* 水平居中并旋转箭头 */
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #4CAF50;
  /* 箭头颜色，与气泡颜色相同 */
}

/* 鼠标悬停时显示提示（左侧刷新按钮） */
.button-container_refresh-button_left:hover::after {
  content: "新聊天";
  position: absolute;
  top: 12px;
  /* 提示框距离按钮上方12px */
  left: 150px;
  /* 提示框距离按钮左侧102px */
  transform: translateX(-50%);
  /* 使得提示框水平居中 */
  background-color: #4CAF50;
  /* 背景色，类似聊天气泡 */
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  /* 圆角效果 */
  font-size: 14px;
  white-space: nowrap;
  /* 防止文字换行 */
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 阴影效果，给气泡浮动感 */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 鼠标悬停时显示提示（右侧刷新按钮） */
.button-container_refresh-button_right:hover::after {
  content: "新聊天";
  position: absolute;
  bottom: -50px;
  /* 提示框距离按钮下方50px */
  left: 80px;
  /* 提示框距离按钮左侧40px */
  transform: translateX(-50%);
  /* 使得提示框水平居中 */
  background-color: #4CAF50;
  /* 背景色，类似聊天气泡 */
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  /* 圆角效果 */
  font-size: 14px;
  white-space: nowrap;
  /* 防止文字换行 */
  opacity: 1;
  visibility: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 阴影效果，给气泡浮动感 */
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 使用伪元素添加气泡箭头（右侧刷新按钮） */
.button-container_refresh-button_right:hover::before {
  content: "";
  position: absolute;
  bottom: -15px;
  /* 箭头距离气泡的底部 */
  left: 60px;
  transform: translateX(-50%) rotate(180deg);
  /* 水平居中并旋转箭头 */
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #4CAF50;
  /* 箭头颜色，与气泡颜色相同 */
}

.CustomSelect {
  margin-left: 10px;
}
</style>
