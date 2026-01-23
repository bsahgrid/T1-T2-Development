const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the root directory with proper MIME types
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html in your browser`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.log(`\nTo fix this, run one of these commands:`);
    console.log(`  lsof -ti:${PORT} | xargs kill -9`);
    console.log(`  or`);
    console.log(`  pkill -f "node server.js"`);
    console.log(`\nThen run: npm start\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
