const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

// صفحة الترحيب وفحص الحالة
app.get('/', (req, res) => {
  res.send('Khawarizmi WebSocket Broker is running successfully!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// إنشاء خادم HTTP موحد
const server = http.createServer(app);

// ربط خادم الـ WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected (ESP32 or Web App)');

  // استقبال الرسائل وإعادة توجيهها لباقي الأجهزة المتصلة
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket Broker running on port ${PORT}`);
});
