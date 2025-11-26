import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock SSE endpoint for chat completion
app.get('/api/chat', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { message } = req.query;
  console.log(`Received message: ${message}`);

  // Mock AI response content
  const mockResponses: string[] = [
    "Hello! How can I help you today?",
    "I'm a mock AI assistant powered by SSE (Server-Sent Events).",
    "This is a demonstration of how to implement streaming responses in a React application.",
    "You can see that my responses are delivered in real-time, one chunk at a time.",
    "Feel free to ask me any questions, and I'll respond with a simulated streaming experience.",
    "To test the streaming functionality, you can send different messages and see how I respond.",
    "You can also test the stop functionality by clicking the 'Stop Generating' button.",
    "This will abort the SSE connection and stop the streaming response.",
    "Thank you for testing this streaming chat application!"
  ];

  // Select a random response based on message length
  const responseIndex = Math.floor(Math.random() * mockResponses.length);
  const response = mockResponses[responseIndex];
  
  // Split response into chunks for streaming
  const chunks = response.split(' ');
  let chunkIndex = 0;

  // Send initial response chunk
  const sendChunk = () => {
    if (chunkIndex < chunks.length) {
      const chunk = chunks[chunkIndex];
      const data = {
        id: Date.now(),
        content: chunk + (chunkIndex < chunks.length - 1 ? ' ' : ''),
        finish_reason: null
      };
      
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      chunkIndex++;
      
      // Random delay between 50-200ms to simulate natural typing
      const delay = Math.floor(Math.random() * 150) + 50;
      setTimeout(sendChunk, delay);
    } else {
      // Send final message with finish reason
      const finalData = {
        id: Date.now(),
        content: '',
        finish_reason: 'stop'
      };
      res.write(`data: ${JSON.stringify(finalData)}\n\n`);
      res.write('event: end\n\n');
      res.end();
    }
  };

  // Start sending chunks after a small initial delay
  setTimeout(sendChunk, 300);

  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
    res.end();
  });
});

// Mock error endpoint for testing error handling
app.get('/api/chat/error', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send an error message after a delay
  setTimeout(() => {
    const errorData = {
      error: {
        message: 'Internal Server Error',
        code: 500
      }
    };
    res.write(`data: ${JSON.stringify(errorData)}\n\n`);
    res.end();
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Mock SSE server running on http://localhost:${PORT}`);
});
