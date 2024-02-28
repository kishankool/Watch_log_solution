const express = require('express');
const fs = require('fs');

const app = express();

const logFilePath = 'app.log'; // Update this with the actual path to your log file
let clients = [];


app.use(express.static('public'));

// Function to stream updates to connected clients
const streamLogFile = (res) => {
    const stream = fs.createReadStream(logFilePath);
    
    stream.on('data', (chunk) => {
        res.write(chunk);
    });
    stream.on('end', () => {
        res.end();
    });
    stream.on('error', (err) => {
        console.error('Error reading log file:', err);
        res.end();
    });
};

// Function to append log message to the log file
const appendToLogFile = (message) => {
    fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) {
            console.error('Error appending to log file:', err);
        }
    });
};

// Route to handle client connections
app.get('/log', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Stream updates to client
    streamLogFile(res);

    // Add client to the list
    clients.push(res);

    // Log client connection
    appendToLogFile('Client connected');

    // Remove client when connection closes
    res.on('close', () => {
        clients = clients.filter(client => client !== res);
        // Log client disconnection
        appendToLogFile('Client disconnected');
    });
});

// Watch for changes in log file and notify clients
fs.watchFile(logFilePath, (curr, prev) => {
    if (curr.size !== prev.size) {
        // Notify all connected clients about changes
        clients.forEach(client => {
            client.write('\n'); // Add a separator
            streamLogFile(client);
        });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
