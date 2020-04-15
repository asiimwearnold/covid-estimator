const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const o2x = require('object-to-xml');
const fs = require('fs');
const path = require('path');

const estimator = require('./estimator');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(
  morgan(':method :url :status :response-time ms', {
    stream: {
      write: (str) => {
        const methodToStatus = str.split(' ').slice(0, 3).join(' ');
        let time = Math.trunc(Number(str.split(' ')[3]));
        if (time < 10) time = `0${time.toString()}`;
        const logStr = `${methodToStatus} ${time}${str.split(' ')[4]}`;
        accessLogStream.write(logStr);
      }
    }
  })
);

app.post(['/api/v1/on-covid-19', '/api/v1/on-covid-19/json'], (req, res) => res
  .status(200)
  .type('application/json')
  .send({ status: 'success', ...estimator(req.body) }));

app.post('/api/v1/on-covid-19/xml', (req, res) => res
  .status(200)
  .type('application/xml')
  .send(
    o2x({
      '?xml version="1.0" encoding="utf-8"?': null,
      response: estimator(req.body)
    })
  ));

app.get('api/v1/on-covid-19/logs', (req, res) => fs.readFile(
  path.join(__dirname, '../access.log'), 'utf8', (err, data) => res
    .type('text/plain').status(200).send(data)
));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server process running on port ${PORT}`));
