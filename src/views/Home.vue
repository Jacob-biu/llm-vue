<template>
  <div v-show="showWelcomeOrDialog" class="displayedText">
    <p>{{ displayedText }}</p>
  </div>
  <div id="chatbox" v-show="!showWelcomeOrDialog" :style="{ height: chatboxHeight + 'px' }">
    <div id="chatlog">

    </div>
  </div>
  <div class="homeContainer" :style="{ height: containerHeight + 'px' }">
    <div class="file-upload-container">
      <label for="file-upload" class="file-label"></label>
      <input type="file" id="file-upload" class="file-input" />
    </div>
    <div class="input-container">
      <textarea class="text-input" placeholder='给"gpt"写点什么吧...' v-model="inputData" ref="textInput"
        :style="{ height: textAreaHeight + 'px' }" @input="adjustHeight">
      </textarea>
    </div>
    <div class="send-container">
      <button class="send-btn" @click="sendData"></button>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 引入你喜欢的代码高亮样式
import katex from 'katex';
import 'katex/dist/katex.min.css'; // 必须引入 KaTeX 的 CSS

export default {
  name: 'HomePage',
  data() {
    return {
      inputData: '', // 输入框内容
      lineHeight: 24, // 每行高度，单位：px
      maxLines: 10, // 最大行数
      baseHeight: 24 + 16, // 输入框最小高度（1 行高度 + 上下内边距），单位：px
      textAreaHeight: 24 + 16, // 动态计算的输入框高度，初始化为 1 行
      containerHeight: 24 + 16, // 同步容器高度
      padding: 8, // 输入框的上下内边距
      fullText: "有什么可以帮忙的？", // 要显示的完整文本
      displayedText: "", // 用于逐字显示的文本
      index: 0, // 当前显示到的字符位置
      typingSpeed: 100, // 每个字符打字的速度，单位毫秒
      showWelcomeOrDialog: true, // 是否显示欢迎文本
      wholeMessage: '', // 完整的消息
      //对话历史
      history: [],
      API_URL: "http://localhost:8009/v1/chat/completions",
      gif: { url: require('../assets/loading.gif') },
    };
  },
  mounted() {
    this.pageHeight = window.innerHeight; // 初始化页面高度
    this.startTyping();
  },
  computed: {
    // Calculate the height of chatbox dynamically based on page height and containerHeight
    chatboxHeight() {
      return this.pageHeight - this.containerHeight- 50;
    }
  },
  methods: {
    startTyping() {
      // 定时器逐个显示字符
      const typingInterval = setInterval(() => {
        this.displayedText += this.fullText[this.index];
        this.index++;

        // 当所有字符都显示完时清除定时器
        if (this.index === this.fullText.length) {
          clearInterval(typingInterval);
        }
      }, this.typingSpeed);
    },
    adjustHeight() {  //通过使用一个临时的div来计算文本的行数，然后根据行数调整输入框的高度
      const textInput = this.$refs.textInput;
      // 创建一个临时的div来计算文本的行数
      const tempDiv = document.createElement('div');
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.style.whiteSpace = 'pre-wrap'; // 保持文本格式
      tempDiv.style.wordWrap = 'break-word'; // 自动换行
      tempDiv.style.width = `${textInput.clientWidth}px`; // 设置宽度为文本框的宽度
      tempDiv.style.fontSize = '18px'; // 设置字体大小
      tempDiv.style.lineHeight = `${this.lineHeight}px`; // 设置行高
      tempDiv.innerText = textInput.value; // 设置内容

      document.body.appendChild(tempDiv); // 将临时元素添加到页面中
      const lineCount = Math.max(Math.floor(tempDiv.scrollHeight / this.lineHeight), 1); // 计算行数
      document.body.removeChild(tempDiv); // 移除临时元素

      const calculatedHeight = Math.min(
        this.maxLines * this.lineHeight + 2 * this.padding,
        lineCount * this.lineHeight + 2 * this.padding
      );
      this.textAreaHeight = Math.max(calculatedHeight, this.baseHeight); // 确保高度不小于最小高度
      this.containerHeight = this.textAreaHeight; // 更新容器高度
    },
    sendMessage() {
      if (this.inputData.trim() === '') {
        // alert('请输入内容后再发送！');
        return;
      }
      this.showWelcomeOrDialog = false;
      // 清空文本框
      this.inputData = '';
      this.textAreaHeight = this.baseHeight;
      this.containerHeight = this.baseHeight;
    },

    async displayMessage(message, sender) {
      //sender == user
      let messContainerUser = document.createElement('div');
      messContainerUser.style.justifyContent = 'flex-end'; // 子元素靠右对齐
      messContainerUser.style.display = 'flex';
      messContainerUser.style.right = '0';
      messContainerUser.style.width = '100%';
      document.getElementById('chatlog').appendChild(messContainerUser);


      let messageElementUser = document.createElement('div');
      messageElementUser.className = 'message' + sender;
      messageElementUser.textContent = message;
      messageElementUser.style.marginLeft = '10%';
      messageElementUser.style.wordWrap = 'break-word';
      messageElementUser.style.overflowX = 'hidden';
      messageElementUser.style.whiteSpace = 'pre-wrap';
      messageElementUser.style.maxWidth = 'calc(80%)';
      messageElementUser.style.borderRadius = '10px';
      messageElementUser.style.backgroundColor = 'rgb(136,213,185)';
      messageElementUser.style.paddingLeft = '20px';
      messageElementUser.style.paddingRight = '20px';
      messageElementUser.style.paddingTop = '10px';
      messageElementUser.style.paddingBottom = '10px';
      messageElementUser.style.marginTop = '5px';
      messageElementUser.style.marginBottom = '5px';
      messageElementUser.style.textAlign = 'left';
      messageElementUser.style.fontSize = '20px';
      messageElementUser.style.fontFamily = 'Lisu,SimSun,KaiTi_GB2312,Songti SC,Avenir,Helvetica,Arial, sans-serif';


      let userProfileImage = document.createElement('div');
      userProfileImage.style.borderRadius = '50%';
      userProfileImage.style.width = '25px';
      userProfileImage.style.height = '25px';
      userProfileImage.style.marginLeft = '10px';
      userProfileImage.style.marginTop = '13px';
      userProfileImage.style.backgroundImage = "url('/assets/profile_user.svg')";
      userProfileImage.style.backgroundSize = 'contain'; // 使用 contain 以保持长宽比
      userProfileImage.style.backgroundPosition = 'center';
      userProfileImage.style.backgroundRepeat = 'no-repeat'; // 防止图片重复

      messContainerUser.appendChild(messageElementUser);
      messContainerUser.appendChild(userProfileImage);
      document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
    },

    async sendData() {
      // 配置marked，使其与highlight.js集成
      marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function (code, lang) {
          if (hljs.getLanguage(lang)) {
            return hljs.highlight(lang, code).value;
          } else {
            return hljs.highlightAuto(code).value;
          }
        },
        pedantic: false,
        gfm: true, // 开启gfm
        breaks: false,
        sanitize: false,
        smartLists: true,
        tables: true,
        smartypants: false,
        math: function (text, math) {
          // 使用katex渲染数学公式
          katex.render(math, document.createElement('div'), {
            displayMode: true
          });
          return text;
        }
      });

      if (this.inputData.trim() !== "") {
        this.showWelcomeOrDialog = false;
        let usermessage = this.inputData;
        this.displayMessage(usermessage, 'user'); //展示用户问题
        this.inputData = ''; // 清空输入框
        this.containerHeight = this.baseHeight; // 重置输入框高度

        // 创建一个新的img元素，用于加载动画
        var img = document.createElement('img');
        img.style.width = "100px";
        img.style.height = "auto";
        // 设置img的src属性
        img.src = this.gif.url;
        // 将img元素添加到div中
        document.getElementById('chatlog').appendChild(img);
        document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;

        if (!this.history) {
          this.history.push({ role: "system", content: "you are a helpful assistant" });
        }

        if (this.history.length >= 10) {
          this.history.shift();
        }

        // 更新对话历史
        this.history.push({ "role": "user", "content": usermessage });
        // 构建请求数据
        var data = {
          "model": "qwen2-7b",
          "messages": this.history,
          "temperature": 0.8,
          "top_p": 0.95,
          "repetition_penalty": 1.1,
          "stream": true,
        };

        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        console.log(response.ok);

        let messContainerSystem = document.createElement('div');
        messContainerSystem.style.justifyContent = 'flex-start'; // 子元素靠右对齐
        messContainerSystem.style.display = 'flex';
        messContainerSystem.style.left = '0';
        messContainerSystem.style.width = '100%';
        document.getElementById('chatlog').appendChild(messContainerSystem);

        let systemProfileImage = document.createElement('div');
        systemProfileImage.style.borderRadius = '50%';
        systemProfileImage.style.width = '25px';
        systemProfileImage.style.height = '25px';
        systemProfileImage.style.marginRight = '10px';
        systemProfileImage.style.marginTop = '13px';
        systemProfileImage.style.backgroundImage = "url('/assets/LLMs.svg')";
        systemProfileImage.style.backgroundSize = 'contain'; // 使用 contain 以保持长宽比
        systemProfileImage.style.backgroundPosition = 'center';
        systemProfileImage.style.backgroundRepeat = 'no-repeat'; // 防止图片重复
        messContainerSystem.appendChild(systemProfileImage);

        let messageElementSystem = document.createElement('div');
        messageElementSystem.id = usermessage;
        messageElementSystem.innerHTML = '';
        messageElementSystem.className = 'messagesystem';
        messageElementSystem.style.marginRight = '10%';
        messageElementSystem.style.maxWidth = 'calc(80%)';
        messageElementSystem.style.backgroundColor = 'rgb(136,213,185)';
        messageElementSystem.style.borderRadius = '10px';
        messageElementSystem.style.paddingLeft = '20px';
        messageElementSystem.style.paddingRight = '20px';
        messageElementSystem.style.paddingTop = '10px';
        messageElementSystem.style.paddingBottom = '10px';
        messageElementSystem.style.marginTop = '5px';
        messageElementSystem.style.marginBottom = '5px';
        messageElementSystem.style.textAlign = 'left';
        messageElementSystem.style.fontSize = '20px';
        messageElementSystem.style.fontFamily = 'Lisu,SimSun,KaiTi_GB2312,Songti SC,Avenir,Helvetica,Arial, sans-serif';

        messContainerSystem.appendChild(messageElementSystem);
        document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;

        if (response.ok) {
          document.getElementById('chatlog').removeChild(img);

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {  //eslint-disable-line no-constant-condition
            const { done, value } = await reader.read();
            if (done) {
              this.wholeMessage = '';
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Split buffer by lines
            const lines = buffer.split('\n');

            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            // Process each line
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('data: ')) {
                const dataStr = trimmedLine.slice('data: '.length);
                if (dataStr !== '[DONE]') {
                  try {
                    const jsonData = JSON.parse(dataStr);
                    if (jsonData.choices && jsonData.choices.length > 0) {
                      const delta = jsonData.choices[0].delta || {};
                      const content = delta.content || '';
                      if (content) {
                        this.wholeMessage += content;
                        let handledMessage = '';
                        let latexMessage = '';
                        latexMessage = this.renderMath(this.wholeMessage);
                        handledMessage = marked(latexMessage);
                        messageElementSystem.innerHTML = handledMessage;


                        // 高亮代码块
                        document.querySelectorAll('pre code').forEach(function (block) {
                          // 添加语言标签，确保只添加一次
                          if (!block.hasAttribute('data-language-tagged')) {
                            // 通过类名获取语言
                            const language = block.className.replace('language-', '');

                            // 创建一个新的 div 元素来显示语言名称
                            const header = document.createElement('div');
                            header.className = 'code-header';
                            header.innerText = language.toUpperCase(); // 将语言名称转换为大写

                            // 在 pre 元素的顶部插入这个 div 元素
                            block.parentNode.insertBefore(header, block.parentNode.firstChild);
                            // 标记代码块为已添加语言标签
                            block.setAttribute('data-language-tagged', 'true');
                          }

                          if (!block.hasAttribute('line-number-tagged')) {
                            //为行插入行号
                            const lines = block.innerHTML.split('\n');
                            // 移除最后一个空行
                            if (lines[lines.length - 1].trim() === '') {
                              lines.pop();
                            }
                            let numberedLines = '';

                            lines.forEach((line, index) => {
                              numberedLines += `<span class="line-number">${index + 1}  </span>${line}\n`;
                            });

                            block.innerHTML = numberedLines;
                            block.setAttribute('line-number-tagged', 'true');
                          }
                          //高亮代码
                          hljs.highlightBlock(block);
                        });
                        document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
                        console.log(content);
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing JSON:', error);
                  }
                }
              }
            }
          }
          this.history.push({ 'role': 'assistant', 'content': this.wholeMessage })
          // this.returnMessage = '';
        }
      }
    },
    renderMath(text) {
      // 匹配并处理块级公式，例如 $$...$$ 或 \[...\]
      text = text.replace(/(\$\$|\\\[)([\s\S]+?)(\$\$|\\\])/g, function (_, delimiter, math) {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
      });

      // 匹配并处理行内公式，例如 $...$ 或 \(...\)
      text = text.replace(/(\$|\\\()(.+?)(\$|\\\))/g, function (_, delimiter, math) {
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      });

      return text;
    },
  }
};
</script>

<style>
/* 样式可以根据需要定制 */
.displayedText p {
  font-size: 24px;
  font-family: Arial, sans-serif;
}
.displayedText{
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  font-size: 24px;
  font-family: Arial, sans-serif;
  margin-bottom: 3%;
}

/* 你可以根据需要自定义样式 */
.hljs {
  background: #f5f5f5; /* 浅灰背景，保护眼睛 */
  color: #333; /* 默认文字颜色 */
  font-family: "Fira Code", Consolas, "Courier New", monospace; /* 编程友好的字体 */
  font-size: 16px; /* 调整字体大小，便于阅读 */
  line-height: 1.5; /* 增加行距 */
  padding: 15px; /* 内间距增加可读性 */
  border: 1px solid #ddd; /* 边框使代码块更突出 */
  border-radius: 8px; /* 圆角样式更现代 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}


/* 确保代码文本颜色高亮 */
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #333;
  /* 设置文本颜色 */
}

#chatbox {
  border: none;
  border-radius: 10px;
  padding: 2.5px;
  width: 60%;
  min-height: 40vh;
  /* 设置最小高度为页面的40% */
  height: auto;
  overflow-y: auto;
  /* 开启垂直滚动 */
  background: transparent;
}

#chatbox::-webkit-scrollbar {
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

#chatlog {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  list-style-type: none;
  padding: 0;
  margin-right: 15px;
  margin-left: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  overflow-y: auto;
}

.homeContainer {
  width: 60%;
  height: auto;
  display: flex;
  align-items: flex-start;
  /* 从顶部对齐 */
  gap: 10px;
  /* 按钮和输入框之间的间距 */
  overflow: hidden;
  /* 防止滚动 */
  transition: height 0.2s;
  /* 平滑过渡 */
  border-radius: 30px;
  padding: 10px;
  background-color: #fff;
}

.file-upload-container,
.send-container {
  border-radius: 5px;
  height: 100%;
  /* 设置父容器高度为100% */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* 按钮固定到底部 */
}

.input-container {
  flex-grow: 1;
  /* 动态填充剩余空间 */
  display: flex;
}

.file-input {
  display: none;
}

.file-label {
  width: 40px;
  height: 40px;
  background-image: url('../assets/attachment.svg');
  /* 设置文件上传按钮背景图 */
  background-size: cover;
  /* 保证背景图适应 */
  background-position: center;
  /* 居中 */
  border-radius: 20%;
  /* 圆角 */
  cursor: pointer;
  display: inline-block;
}

.file-label:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.file-label:active {
  transform: scale(0.95);
}

.send-btn {
  width: 40px;
  height: 40px;
  background-image: url('../assets/button_gray_plane.svg');
  /* 设置发送按钮背景图 */
  background-color: transparent;
  background-size: cover;
  /* 保证背景图适应 */
  background-position: center;
  /* 居中 */
  border-radius: 50%;
  /* 圆角 */
  border: none;
  cursor: pointer;
}

.send-btn:hover {
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.24), 0 12px 16px 0 rgba(0, 0, 0, 0.19);
}

.send-btn:active {
  transform: scale(0.95);
}

.text-input {
  width: 100%;
  /* 占满父容器宽度 */
  resize: none;
  /* 禁止手动调整大小 */
  padding: 8px;
  /* 上下左右内边距 */
  overflow-y: auto;
  /* 超过 10 行时显示滚动条 */
  line-height: 24px;
  /* 每行高度 */
  font-size: 20px;
  /* 调大字号 */
  border: none;
  /* 去除边框 */
  outline: none;
  /* 聚焦时去除默认的边框样式 */
  border-radius: 10px;
  /* 添加圆角 */
  background-color: transparent;
  /* 可选：设置背景色 */
  /*box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);*/
  /* 添加内阴影，提升质感 */
  box-sizing: border-box;
  /* 包含 padding */
}

.text-input::placeholder {
  color: #888;
}

::-webkit-scrollbar {
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
</style>
