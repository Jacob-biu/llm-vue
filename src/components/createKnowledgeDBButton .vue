<template>
  <button id="createKnowledgeDB" @click="handleClick">
    <span><i class="el-icon-plus"></i> 新建知识库</span>
  </button>
</template>

<script>
export default {
  name: "createKnowledgeDBButton",
  methods: {
    handleClick() {
      // 触发父组件的事件或逻辑
      this.$emit("open-dialog"); // 发出事件，通知父组件打开对话框
    }
  }
};
</script>

<style scoped>
#createKnowledgeDB {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: calc(1vw + 12px);
  background: linear-gradient(135deg, #409eff, #66ccff);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

#createKnowledgeDB:hover {
  background: linear-gradient(135deg, #66ccff, #409eff);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

#createKnowledgeDB:active {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

#createKnowledgeDB span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #createKnowledgeDB {
    padding: 8px 16px;
    font-size: calc(2vw + 10px);
  }
}
</style>