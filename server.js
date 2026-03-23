const express = require('express');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');

const app = express();

// servir le frontend
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  // envoyer output vers frontend
  shell.on('data', (data) => {
    ws.send(data);
  });

  // recevoir input depuis frontend
  ws.on('message', (msg) => {
    shell.write(msg);
  });

  ws.on('close', () => {
    shell.kill();
    console.log('Client disconnected');
  });
});