
Error.stackTraceLimit = 0;

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import { generateEmbedScript } from './src/utils/embedScript.js';
import { mockChatService } from './dist/mockChatService.js';

// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_HOST = process.env.API_HOST;
const MY_API_KEY = process.env.MY_API_KEY;
const USE_MOCK = process.env.USE_MOCK === 'true';

console.log('USE_MOCK', USE_MOCK);
console.log('API_HOST', API_HOST);
console.log('MY_API_KEY', MY_API_KEY);

/* (!API_HOST && !USE_MOCK) {
  console.error('API_HOST is not set in environment variables and USE_MOCK is false');
  process.exit(1);
}

if (!MY_API_KEY && !USE_MOCK) {
  console.error('MY_API_KEY is not set in environment variables and USE_MOCK is false');
  process.exit(1);
}*/


const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['http://localhost:3001', 'http://localhost:8080'],
  }),
);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/web.js', (req, res) => {
  const origin = req.headers.origin;

  // In development mode, allow all origins
  if (process.env.NODE_ENV !== 'production') {

    
  res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
        });
    return res.sendFile(path.join(__dirname, 'dist', 'web.js'));
  }

  //TODO Not PLanned for now
  if(origin.includes('localhost')) {
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return res.sendFile(path.join(__dirname, 'dist', 'web.js'));
  }

  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });

  res.sendFile(path.join(__dirname, 'dist', 'web.js'));
});


const proxyEndpoints = {
  startChat: {
    method: 'POST',
    path: '/api/v1/start-chat/:identifier',
    target: '/api/v1/start-chat',
  },
  continueChat: {
    method: 'POST',
    path: '/api/v1/continue-chat/:identifier',
    target: '/api/v1/continue-chat',
  },
  files: {
    method: 'GET',
    path: '/api/v1/get-upload-file',
    target: '/api/v1/get-upload-file',
  },
  attachments: {
    method: 'POST',
    path: '/api/v1/attachments/:identifier/:chatId',
    target: '/api/v1/attachments',
  },
};

const handleProxy = async (req, res, targetPath) => {
  try {
    const identifier = req.params.identifier;
    if (!identifier) {
      return res.status(400).json({ error: 'Bad Request: Missing identifier' });
    }

    // Use mock service if enabled
    if (USE_MOCK) {

      if (targetPath === '/api/v1/start-chat') {
        const { sessionId, currentNodeId, token } = req.body;

        const result = await mockChatService.startChat(identifier, sessionId, currentNodeId, token);
        return res.json(result);
      }

      if (targetPath === '/api/v1/continue-chat') {
        const { sessionId, currentNodeId, token, chatSessionId, chatToken, userInput } = req.body;
        const result = await mockChatService.continueChat(
          identifier,
          sessionId,
          currentNodeId,
          token,
          chatSessionId,
          chatToken,
          userInput
        );
        return res.json(result);
      }
    }

    // If not using mock, proxy to actual API
    const url = `${API_HOST}${targetPath}/${identifier}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MY_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: `Proxy error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

Object.values(proxyEndpoints).forEach(({ method, path, target }) => {
  app[method.toLowerCase()](path, (req, res) => {
    console.log(`${method} ${path}`);
    return handleProxy(req, res, target);
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/v1/attachments/:identifier/:chatId', upload.array('files'), async (req, res) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) {
      return res.status(400).json({ error: 'Bad Request' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Bad Request' });
    }

    const form = new FormData();
    req.files.forEach((file) => {
      form.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const chatflow = req.chatflow;
    const targetUrl = `${API_HOST}/api/v1/attachments/${chatflow.chatflowId}/${chatId}`;

    const response = await axios.post(targetUrl, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${MY_API_KEY}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  if (!addr || typeof addr === 'string') return;

  const baseUrl =
    process.env.BASE_URL || process.env.NODE_ENV === 'production'
      ? `https://${process.env.HOST || 'localhost'}`
      : `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${addr.port}`;

  generateEmbedScript(baseUrl);
});
