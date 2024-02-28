const winston = require('winston');

// Configure Winston to log to app.log file
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Example logging statements
logger.info('This is an informational message.');
logger.warn('This is a warning message.');
logger.error('This is an error message.');
