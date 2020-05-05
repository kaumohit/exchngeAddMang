require('dotenv').config();
require('winston-daily-rotate-file');
require('./config/db');	/* Establishing MongoDB Connection */
require('./cronController'); /* Smart Contract Cron Job */
const config = require('./config/appConfig');	/* ENV CONFIGS */
const express = require('express');
const expressValidator = require('express-validator/');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
let client = redis.createClient();
const winston = require('winston');
const expressWinston = require("express-winston");
const http = require('http');
const debug = require('debug')('APP');
const routes = require('./routes/routes');
client.on("connect", () => {
  debug(`Connected to Redis-Server`);
  client.set('addressGenerationStatus', 'false');
  client.set('ERC20DrainCronStatus','false');
});
// require('./testGA');	/* Establishing MongoDB Connection */



client.on("error", (err) => {
  try {
    debug('\nRedis Client Disconnected\n', `REDIS ERROR: ${err}`);
    client = redis.createClient();
  } catch (err){
    
  }
  
});

// Initializing express app
const app = express();
// Adds helmet middleware
app.use(helmet());
app.disable('etag');
//Rate Limit for API
app.enable('trust proxy');  // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc
// app.use(cors({
//   origin: 'https://reneum-admin.tokenasia.com/',
//   optionsSuccessStatus: 200 
// }));
//Body Parser Configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ // to support JSON-encoded bodies
  limit: '2mb'
}));

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  limit: '2mb',
  extended: true
}));
//Using Express Validator
app.use(expressValidator());


const normalizePort = (val) => {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
//Error handler
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      winston.error(bind + ' requires elevated privileges');
      debug(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      winston.error(bind + ' is already in use');
      debug(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};
//Setting port.
const port = normalizePort(config.PORT || '3001');
const host = config.HOST || '127.0.0.1';
app.set('port', port);
app.set('host', host);
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(
  expressWinston.logger({
    expressFormat: true,
    transports: [
      new winston.transports.DailyRotateFile({
        dirname: "./logs",
        filename: "LEX-LOG-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "1g",
        maxFiles: "1d",
        eol: `\r\n\r\n************************************ ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()} (Local-Time) *********************************************\r\n\r\n`
      })
    ]
  })
)

app.use('/', routes);

const server = http.createServer(app);
server.listen(port, host);
server.on('error', onError);
server.on('listening', () => {
  // winston.info(`Server started on ${new Date()}`);
  // winston.info(`Server is running @ http://${server.address().address}:${server.address().port}`);
  debug(`Server started on: ${new Date()} & Running @ http://${server.address().address}:${server.address().port}`);
});