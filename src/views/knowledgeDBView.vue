<template>
  <div id="knowledgeDBView">
    <div id="topBar">
      <button class="back-button" @click="goBack">
        ⬅️
      </button>
      <span style="text-align: center; flex-grow: 1;">
        {{
          selectedDBItem.value === 'null'
            ? '未使用知识库'
            : (options.find(option => option.value === selectedDBItem.value)
              ? '当前知识库：' + options.find(option => option.value === selectedDBItem.value).label
              : '未找到匹配的选项')
        }}
      </span>
    </div>
    <div id="majorBar">
      <div id="leftBar">
        <div class="buttonContainer">
          <button id="createKnowledgeDB" @click="dialogVisible = true; handleCancel()">➕ 新建知识库</button>
        </div>
        <create-knowledge-base-dialog v-model="dialogVisible" @submit="handleOptionSubmit" />
        <div id="knowledgeDBHistory">
          <div v-for="(item, index) in buttonList" :key="index" class="DB_List">
            <button @click="handleClick(item)" class="DB_ListButton"
              :class="{ active: activeButton.value === item.value }">
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
      <div id="rightBox">
        <!-- 右侧表单内容 -->
        <div v-show="isRightBox" class="right-box-content">
          <div class="tab-container">
            <button class="tab-button" @click="changeCardStateOne">
              <span>知识库</span>
            </button>
            <button class="tab-button" @click="changeCardStateTwo">
              <span>配置</span>
            </button>
          </div>
          <div class="flex-card">
            <knowledgeDBContentCard v-show="isCardOne" ref="knowledgeCard" :dataset="dataset" />
            <knowledgeDBConfigCard v-show="isCardTwo" :activeButton="activeButton"
              @updateKnowledgeDB="handleUpdateKnowledgeDB" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import knowledgeDBContentCard from '../components/KnowledgeDBContentCard.vue';
import knowledgeDBConfigCard from '../components/knowledgeDBConfigCard.vue';
import CreateKnowledgeBaseDialog from '../components/CreateKnowledgeBaseDialog.vue';
import axios from 'axios';
import { mapState } from 'vuex';


export default {
  name: 'knowledgeDBView',
  components: {
    knowledgeDBContentCard,
    knowledgeDBConfigCard,
    CreateKnowledgeBaseDialog,
  },
  props: {
    knowledgeBaseList: {
      type: Array,
      required: true
    },
    // selectedItem: {
    //   type: Object,
    //   required: true
    // }
  },
  data() {
    return {
      isCardOne: false,
      isCardTwo: false,
      dataset: { label: '不使用知识库', value: 'null', description: '' },  //当前数据集信息（和button绑定）
      isLoading: false,
      isDisabled: false,
      searchQuery: '',
      options: this.knowledgeBaseList,
      // [ // 下拉框的选项，模拟接口返回的值，包含显示的标签和实际的值
      //   { label: '不使用知识库', value: 'null', description: '' },
      //   { label: 'DB', value: 'DB', description: 'DB' },

      //   // { label: 'DB2', value: 'DB2' , description: 'DB2'},
      //   // { label: 'DB3', value: 'DB3' , description: 'DB3'},
      // ],
      // selectedOption: { label: '不使用知识库', value: 'null', description: '' }, // 当前选中的选项
      // 按钮数据数组
      buttonList: [],
      isRightBox: false,
      dialogVisible: false, // 控制对话框的显示与隐藏
      datasetTemp: { label: '不使用知识库', value: 'null', description: '' },
      form: {
        label: '',
        value: '',
        description: '',
      },
      formTwo: {
        label: '',
        value: '',
        description: '',
      },
      activeButton: { label: '不使用知识库', value: 'null', description: '' },
    };
  },
  // watch: {
  //   selectedItem(newItem) {
  //     this.selectedOption = newItem;
  //   },
  // },
  computed: {
    ...mapState(['selectedDBItem']),
  },

  methods: {
    changeCardStateOne() {
      this.isCardOne = true;
      this.isCardTwo = false;
    },
    changeCardStateTwo() {
      this.isCardOne = false;
      this.isCardTwo = true;
    },
    showDialog() {
      this.dialogVisible = true; // 点击按钮时显示对话框
    },
    initButtonList() {
      this.buttonList = this.knowledgeBaseList
        .filter(option => option.value !== 'null')  // 排除 value 为 'null' 的项
        .map(option => ({
          label: option.label,  // 显示名称
          value: option.value,  // 选项值
          description: option.description  // 选项描述
        }));
    },
    // 点击事件的处理函数
    handleClick(item) {
      this.activeButton = item;
      this.dataset = this.activeButton;
      this.isRightBox = true;
      this.isCardOne = true;
      this.isCardTwo = false;
      this.datasetTemp.label = item.label;
      this.datasetTemp.value = item.value;
      this.datasetTemp.description = item.description;
      this.formTwo.label = item.label;
      this.formTwo.description = item.description;
      this.formTwo.value = item.value;
      console.log(`Clicked on ${item.label}`);
      if (this.$refs.knowledgeCard) {
        this.$nextTick(() => {
          this.$refs.knowledgeCard.fetchFiles();
        });
      } else {
        console.log('未能找到子组件实例');
      }
    },
    handleOptionSubmit(option) {
      this.options.push(option);  // 将接收到的option添加到options数组
      this.$emit('updateKnowledgeBaseList', this.options);  // 通过事件将更新后的options传递给父组件
      this.initButtonList();  // 重新初始化按钮列表
      console.log('新增的知识库选项：', option);
    },
    goBack() {
      this.$router.go(-1); // 或者 this.$router.back();
    },
    handleUpdateKnowledgeDB(updatedData) {
      // 更新 activeButton 的信息
      this.activeButton.label = updatedData.label;
      this.activeButton.description = updatedData.description;

      // 更新 options 中对应的项
      const index = this.options.findIndex(option => option.value === this.activeButton.value);
      if (index !== -1) {
        this.options[index].label = updatedData.label;  // 更新名称
        this.options[index].description = updatedData.description;  // 更新描述
      }

      this.initButtonList();  // 重新初始化按钮列表


      // 将更新后的 options 通过事件传递给父组件
      this.$emit('updateKnowledgeBaseList', this.options);
      console.log("接收到更新数据并更新 options：", updatedData);
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
            this.options.push(newFolder);
          }
        });

        // 将更新后的 options 通过事件传递给父组件
        this.$emit('updateKnowledgeBaseList', this.options);
        this.initButtonList();  // 重新初始化按钮列表
      } catch (error) {
        console.error("Error fetching folders:", error); // 错误处理
      }
    },

  },
  mounted() {
    this.$nextTick(() => {
      this.initButtonList();
      this.fetchFolders();
    });
  },
};
</script>

<style scoped>
#knowledgeDBView {
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;
  width: 80%;
  height: 80%;
}

#topBar {
  display: flex;
  justify-content: space-between;
  /* 让返回按钮和标题分开布局 */
  justify-content: center;
  align-items: center;
  width: 60%;
  height: 10%;
  border-top-left-radius: 10px;
  /* 左上角弧度 */
  border-top-right-radius: 10px;
  /* 右上角弧度 */
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid black;
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

#majorBar {
  display: flex;
  height: 90%;
  justify-content: space-between;
  /* 确保子元素之间有间距 */
  width: 60%;
  border-bottom-right-radius: 10px;
}

#leftBar {
  flex: 1;
  height: 81.65%;
  min-height: 0;
  /* 防止元素被撑高，确保其能根据父容器调整高度 */
  background-color: #fff;
  border-right: #409eff 2px solid;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 10px;
  /* 左上角弧度 */
}

.buttonContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid black;
}

#createKnowledgeDB {
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

/* 悬停时改变背景色和增加阴影 */
#createKnowledgeDB:hover {
  background: linear-gradient(135deg, #66ccff, #409eff);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  /* 增加阴影 */
  transform: scale(1.05);
  /* 鼠标悬停时放大按钮 */
}

/* 按钮点击时的动画效果 */
#createKnowledgeDB:active {
  transform: scale(1.02);
  /* 按下时轻微缩小 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  /* 点击时的阴影 */
}

/* 按钮文本内的图标和文本 */
#createKnowledgeDB span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* 图标和文本之间的间距 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  #createKnowledgeDB {
    padding: 8px 16px;
    /* 小屏幕时减少内边距 */
    font-size: calc(2vw + 10px);
    /* 调整字体大小 */
  }
}


#rightBox {
  flex: 5;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* 确保内容从上到下排列 */
  align-items: center;
  height: 81.65%;
  background-color: #fff;
  border-bottom-right-radius: 10px;
  /* 左上角弧度 */
}

.tab-container {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  height: 50px;
  box-sizing: border-box;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 2px solid black;
}

.box-card {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  margin-top: 10px;
  min-height: 0;
  /* 防止元素被撑高 */
}

.tab-button {
  background-color: transparent;
  border: 1px solid transparent;
  padding: 8px 18px;
  margin-right: 6px;
  margin-left: 6px;
  font-size: 10px;
  cursor: pointer;
  text-align: center;
  border-radius: 10px;
  position: relative;
  z-index: 1;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.tab-button:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

.tab-button.active {
  background-color: #fff;
  color: #409eff;
  border-bottom: 3px solid #409eff;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

#rightBox {
  flex: 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 81.65%;
  width: 100%;
  /* 限制父容器宽度 */
  max-width: 100%;
  /* 防止横向溢出 */
  background-color: #fff;
}

.right-box-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-bottom-right-radius: 10px;
}


.flex-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* 确保子组件宽度不超过父容器 */
  height: 90%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  justify-items: center;
  align-items: center;
  border-bottom-right-radius: 10px;
}


/* 响应式优化 */
@media (max-width: 768px) {
  #majorBar {
    flex-direction: column;
    align-items: center;
    /* 居中对齐 */
  }

  #leftBar,
  #rightBox {
    width: 100%;
    /* 确保在小屏幕下它们仍然是100%的宽度 */
    margin-right: 0;
    /* 去掉右侧间距 */
    margin-bottom: 10px;
    /* 在小屏幕下添加底部间距 */
  }

  .tab-container {
    flex-direction: column;
    padding: 10px;
  }

  .tab-button {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .right-box-content {
    margin: 1%;
  }
}

.knowledgeDBContentCard {
  flex-grow: 1;
  margin-bottom: 20px;
  /* 为了分隔上下两个卡片 */
  border-bottom-right-radius: 10px;
}

.knowledgeDBConfigCard {
  flex-grow: 1;
}

#knowledgeDBHistory {
  width: 100%;
  height: auto;
  overflow-y: auto;
  padding-bottom: 15px;
  /* 添加垂直滚动条 */
  flex-grow: 1;
  /* 使这个区域占据剩余空间 */

}

.DB_ListButton {
  width: 70%;
  height: 40px;
  background-color: white;
  border-radius: 10px;
  border: none;
}

.DB_ListButton:hover {
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.24), 0 8.5px 12.5px 0 rgba(0, 0, 0, 0.19);
}

.DB_ListButton.active {
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.24), 0 8.5px 12.5px 0 rgba(0, 0, 0, 0.19);
}

.DB_List {
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-top: 10px;
  overflow-y: scroll;
  height: 50px;
  display: flex;
  justify-content: center;
}
</style>
