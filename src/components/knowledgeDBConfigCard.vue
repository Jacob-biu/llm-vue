<template>
  <div class="knowledge-db-config">
    <div class="header">
      <h3>配置</h3>
      <div class="tooltip">
        <span>😊在这里更新您的知识库详细信息</span>
      </div>
    </div>

    <div class="form-container">
      <div class="form-card">
        <form @submit.prevent="submitChange">
          <div class="form-item">
            <label for="label">名称</label>
            <input type="text" id="name" v-model="formTwo.label" required />
          </div>
          <div class="form-item">
            <label for="description">描述</label>
            <textarea id="description" v-model="formTwo.description" rows="4" required></textarea>
          </div>
          <div class="form-footer">
            <button type="submit" class="submit-btn">提交修改</button>
          </div>
        </form>
      </div>

      <div class="delete-container">
        <button class="delete-btn" @click="deleteKnowledgeDB">删除数据集</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "KnowledgeDBConfig",
  props: {
    activeButton: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      formTwo: {
        label: '',
        value: '',
        description: '',
      }
    };
  },
  watch: {
    activeButton(newVal) {
    // 如果 dataset 有变化，更新 formTwo
    this.formTwo.label = newVal.label;
    this.formTwo.value = newVal.value;
    this.formTwo.description = newVal.description;
  }
},
  methods: {
    submitChange() {
      // 这里将 formTwo 中的修改数据传回给父组件
      this.$emit('updateKnowledgeDB', { label: this.formTwo.label, value: this.formTwo.value, description: this.formTwo.description });
      // 这里是提交修改的逻辑
      console.log("提交修改：", this.formTwo);
      // 执行提交逻辑
    },
    deleteKnowledgeDB() {
      // 删除数据集的逻辑
      console.log("删除数据集");
      // 执行删除逻辑
    }
  }
};
</script>

<style scoped>
.knowledge-db-config {
  width: 50%;
  margin: 1% auto;
}

.header {
  text-align: left;
  margin-top: 2.5%;
  margin-bottom: 2.5%;
  display: flex;
  flex-direction: column;
}

.header h3 {
  margin-bottom: 1%;
}

.tooltip {
  font-size: 15px;
}

.form-container {
  margin-top: 1.5%;
}

.form-card {
  border: 1px solid #ccc;
  padding: 20px;
  margin-top: 2%;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-footer {
  margin-top: 15px;
}

.submit-btn {
  background-color: #409EFF;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #66b3ff;
}

.delete-container {
  margin-top: 1%;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #f79999;
}
</style>
