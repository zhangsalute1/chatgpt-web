require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 从环境变量获取 API 配置
const API_KEY = process.env.OPENROUTER_API_KEY;
const API_ENDPOINT = process.env.OPENROUTER_ENDPOINT || 'https://openrouter.ai/api';

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// API 代理中间件
app.use('/api', createProxyMiddleware({
  target: API_ENDPOINT,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // 移除 /api 前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    // 在服务器端添加 Authorization 头
    if (API_KEY) {
      proxyReq.setHeader('Authorization', `Bearer ${API_KEY}`);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});