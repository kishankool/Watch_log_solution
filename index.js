const express = require('express');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (including the HTML file)
app.use(express.static('public'));

// Function to watch log file for changes and send updates to clients
function watchLogFile() {
  let filePosition = 0;

  // Watch for changes to the log file
  fs.watch('app.log', (eventType, filename) => {
    if (eventType === 'change') {
      // Read the updated content from the file position
      fs.stat('app.log', (err, stats) => {
        if (err) {
          console.error('Error reading log file stats:', err);
          return;
        }
        const fileSize = stats.size;
        const readStream = fs.createReadStream('app.log', {
          start: filePosition,
          end: fileSize,
        });

        readStream.on('data', (chunk) => {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(chunk.toString());
            }
          });
        });

        // Update the file position for the next read
        filePosition = fileSize;
      });
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Handle WebSocket messages here if needed

  // Send the initial contents of the log file to the client
  fs.readFile('app.log', 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return;
    }
    ws.send(data);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
  // Call watchLogFile() here if you haven't already
  watchLogFile();
});
