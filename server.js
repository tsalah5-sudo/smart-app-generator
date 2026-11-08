const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/generator', require('./routes/generator'));
app.use('/api/database', require('./routes/database'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/login', require('./routes/login'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('Khawarizmi WebSocket Broker & Smart App Generator is running successfully!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// إنشاء خادم HTTP موحد يدعم الـ Express والـ WebSockets معاً
const server = http.createServer(app);

// ربط خادم الـ WebSocket بخادم الـ HTTP
const wss = new WebSocket.Server({ server });

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
  console.log(`🚀 Server is listening and running on port ${PORT}`);
});
