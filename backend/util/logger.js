const fs = require('fs');

const writeLogEntry = (message, adminUsername, date, time) => {
  const logEntry = `[${date} ${time}] Admin ${adminUsername}: ${message}`;
  const logFilePath = './logs/log.txt';
  const logData = `${logEntry}\n`;

  // Write the log entry to the file
  fs.appendFile(logFilePath, logData, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
};

module.exports = {
  writeLogEntry,
};
