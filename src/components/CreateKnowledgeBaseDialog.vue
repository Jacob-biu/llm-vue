<template>
  <el-dialog title="新建知识库" v-model="dialogVisible" @close="handleCancel" width="480px" :before-close="beforeClose">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="名称" prop="label">
        <el-input v-model="form.label"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4"></el-input>
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </template>

    <!-- 自定义关闭按钮 -->
    <el-button class="close-btn" @click="handleCancel"></el-button>
  </el-dialog>
</template>

<script>
export default {
  name: 'CreateKnowledgeBaseDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: this.modelValue,  // 默认值来自父组件的 v-model
      form: {
        label: '',
        description: '',
      },
      rules: {
        label: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
      },
    };
  },
  methods: {
    handleCancel() {
      this.dialogVisible = false;
      this.$emit('update:modelValue', this.dialogVisible); // 向父组件传递关闭事件
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          console.log('表单提交成功', this.form);
          const option = {
            label: this.form.label,
            value: this.form.label,
            description: this.form.description,
          };
          this.$emit('submit', option); // 向父组件发送数据
          // 在提交成功后清空表单
          this.resetForm();
          this.handleCancel();  // 提交成功后关闭对话框
        } else {
          console.log('表单验证失败');
        }
      });
    },
    resetForm() {
      // 清空表单字段
      this.form.label = '';
      this.form.description = '';
      // 或者使用 this.$refs.formRef.resetFields(); 来清空表单
      // this.$refs.formRef.resetFields();
    },
    beforeClose(done) {
      done();
    },
  },
  watch: {
    modelValue(newVal) {
      this.dialogVisible = newVal;
    },
  },
};
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
  z-index: 10;
}

.close-btn:hover {
  color: #f56c6c;
}
</style>
