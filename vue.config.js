const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: [
      'all', // 允许所有主机头
      'localhost', // 允许本地请求
      '.ngrok.io', // 如果知道ngrok的域名，可以指定ngrok的域名
    ],
    host: '0.0.0.0',  // 确保 Webpack 监听所有网络接口
    port: 8080,       // 根据你的实际端口号调整
    webSocketServer:false, 
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src'),
      }
    }
  }
})
