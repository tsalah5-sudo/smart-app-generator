const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

// إنشاء خادم HTTP
const server = http.createServer(app);

// ربط خادم الـ WebSocket بنفس خادم الـ HTTP
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.send('Khawarizmi WebSocket Broker is running successfully!');
});

wss.on('connection', (ws) => {
  console.log('New client connected (ESP32 or Web App)');

  // استقبال الرسالة من أي طرف وإعادة إرسالها لباقي الأجهزة المتصلة
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
  console.log(`Server is listening on port ${PORT}`);
});
