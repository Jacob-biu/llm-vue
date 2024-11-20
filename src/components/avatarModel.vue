<template>
  <div class="menu" ref="menu">
    <ul>
      <li @click="handleClick('myGPT')">我的 GPT</li>
      <li @click="handleClick('customChatGPT')">自定义 ChatGPT</li>
      <li @click="handleClick('knowledgeDB')">知识库设置</li>
      <li @click="handleClick('knowledgePre')">知识库预览</li>
      <li @click="handleClick('settings')">设置</li>
      <li @click="handleClick('upgrade')">升级套餐</li>
      <li @click="handleClick('logout')">注销</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AvatarModel',
  props: {
    selectedItem: {
      type: Object,
      required: true,
      default: () => ({ label: '请选择', value: '', description: '' }),
    },
  },
  mounted() {
    // 在组件挂载时，添加事件监听器
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // 在组件销毁时，移除事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    handleClick(option) {
      console.log(`点击了: ${option}`);
      // 在这里可以根据选项做不同的操作
      switch (option) {
        case 'myGPT':
          // 跳转到我的 GPT 页面或执行相关操作
          console.log('跳转到我的 GPT 页面');
          break;
        case 'customChatGPT':
          // 跳转到自定义 ChatGPT 页面或执行相关操作
          console.log('跳转到自定义 ChatGPT 页面');
          break;
        case 'knowledgeDB':

          // 路由跳转
          // this.$router.push('/knowledgeDBView');
          this.$router.push({ name: 'knowledgeDBView', state: { selectedItem: this.selectedItem } });
          // 跳转到知识库页面或执行相关操作
          console.log('跳转到知识库页面');
          break;
        case 'knowledgePre':
          // this.$router.go('/knowledgeDBPreview');
          // 跳转到知识库预览页面或执行相关操作
          console.log('跳转到知识库预览页面');
          break;
        case 'settings':
          // 跳转到设置页面或执行相关操作
          console.log('进入设置');
          break;
        case 'upgrade':
          // 跳转到升级页面或执行相关操作
          console.log('进入升级页面');
          break;
        case 'logout':
          // 执行注销操作
          console.log('执行注销操作');
          break;
        default:
          console.log('未知选项');
      }
      this.$emit('closeMenu'); // 向父组件发送关闭菜单的事件
    },
    handleClickOutside(event) {
      const menu = this.$refs.menu;
      const button = document.querySelector('.circle-button');
      console.log('Menu:', menu);
      console.log('Clicked target:', event.target);
      // 如果点击的是按钮或者菜单内的元素，不关闭菜单
      if (menu && menu.contains(event.target) || button && button.contains(event.target)) {
        return;
      }
      // 否则，关闭菜单
      this.$emit('closeMenu');
    },
  }
}
</script>

<style scoped>
.menu {
  background-color: rgba(255, 255, 255, 0.7);
  /* 半透明背景 */
  border: 1px solid #ccc;
  border-radius: 10px;
  /* 圆角 */
  width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  /* 减弱毛玻璃效果，减少性能开销 */
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  /* 每个选项的圆角 */
  transition: background-color 0.1s ease, color 0.1s ease;
  /* 减少过渡时间 */
}

li:hover {
  background-color: #007bff;
  color: white;
}
</style>
