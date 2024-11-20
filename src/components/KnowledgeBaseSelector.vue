<template>
  <div class="custom-select">
    <div class="custom-select-header" @click="toggleDropdown">
      <span v-if="selectedItem">{{ selectedItem.label }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <i class="arrow" :class="{ 'up': isDropdownOpen, 'down': !isDropdownOpen }"></i>
    </div>
    <div v-if="isDropdownOpen" class="custom-select-dropdown">
      <div v-for="item in options" :key="item.label" class="custom-select-option"
        :class="{ 'active': item.value === selectedItem.value }" @click="selectOption(item)">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CustomSelect",
  props: {
    options: {
      type: Array,
      required: true,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    selectedItem: {
      type: Object,
      required: true,
      default: () => ({ label: "请选择", value: "" , description: ""}),
    },
  },
  data() {
    return {
      isDropdownOpen: false,
    };
  },
  mounted() {
    // 在组件挂载后添加点击事件监听器
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // 在组件销毁前移除事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectOption(item) {
      this.$emit("update:selectedItem", item); // 发送选中的项
      this.isDropdownOpen = false;
    },
    handleClickOutside(event) {
      const dropdown = this.$el; // 获取当前组件的根元素
      if (!dropdown.contains(event.target)) {
        this.isDropdownOpen = false; // 点击下拉框外部时关闭下拉框
      }
    },
  },
};
</script>

<style scoped>
.custom-select {
  position: relative;
  width: auto;
  /* 自适应宽度 */
  min-width: 10ch;
  /* 最小宽度为5个字符的宽度 */
  background-color: transparent;
  /* 背景色透明 */
  border: none;
  /* 无边框 */
  border-radius: 10px;
  transition: box-shadow 0.3s ease-in-out;
  /* 增加过渡效果 */
  font-family: 'Times New Roman', 'LiSu', 'SimSun', 'KaiTi_GB2312', 'Songti SC', 'Avenir', 'Helvetica', 'Arial', sans-serif;
  font-size: 20px;
}

.custom-select:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 增加阴影效果 */
}

.custom-select-header:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* header悬停时也增加阴影 */
}

.custom-select-header .arrow:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 箭头悬停时增加阴影 */
}

.custom-select-header {
  display: flex;
  justify-content: space-between;
  /* 左右对齐 */
  align-items: center;
  padding: 8px;
  background-color: transparent;
  /* 背景色透明 */
  border: none;
  /* 无边框 */
  cursor: pointer;
  width: 100%;
  /* 让header宽度为100% */
  border-radius: 10px;
  /* 保证下拉框头部也有圆角 */
  font-family: 'Times New Roman', 'LiSu', 'SimSun', 'KaiTi_GB2312', 'Songti SC', 'Avenir', 'Helvetica', 'Arial', sans-serif;
}

.custom-select-header .placeholder {
  color: #aaa;
}

.custom-select-header span {
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 隐藏超出部分 */
  display: inline-block;
  max-width: 90%;
  /* 确保文本不超出宽度，留给箭头的空间 */
}
.custom-select-header .selected {
  font-weight: bold; /* 选中的项加粗 */
}

.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: transparent;
  /* 下拉框背景色透明 */
  border: none;
  /* 无边框 */
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 10px;
  /* 设置圆角 */
  padding: 5px 5px;
  /* 增加上下左右的padding */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 增加阴影效果 */
  transition: box-shadow 0.3s ease-in-out;
  /* 增加阴影过渡效果 */

}

.custom-select-option {
  padding: 8px;
  cursor: pointer;
  white-space: nowrap;
  /* 禁止换行 */
  overflow: visible;
  /* 不隐藏超出部分 */
  font-family: 'Times New Roman', 'LiSu', 'SimSun', 'KaiTi_GB2312', 'Songti SC', 'Avenir', 'Helvetica', 'Arial', sans-serif;
}

.custom-select-option:hover,
.custom-select-option.active {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* 增加阴影效果 */
  background-color: #2A77C6;
  color: white;
  border-radius: 10px;
  /* 设置圆角 */
}

.arrow {
  width: 8px;
  height: 8px;
  border-left: 2px solid #333;
  border-bottom: 2px solid #333;
  transform: rotate(45deg);
  /* 默认状态为下箭头 */
  margin-left: 10%;
  transition: transform 0.3s ease-in-out;
  /* 添加旋转动画 */
}

.arrow.up {
  transform: rotate(-45deg);
  /* 上箭头 */
}

.arrow.down {
  transform: rotate(45deg);
  /* 下箭头 */
}
</style>
