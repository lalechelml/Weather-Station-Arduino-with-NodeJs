const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var path = require('path');

const axios = require('axios');
const toXML = require('to-xml').toXML;

const arduinoData = {};
let apiData = {};

let dataResponse = {};

app.use(express.static(__dirname + '/'));

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({ path: 'COM9', baudRate: 9600 }, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

//.setEncoding('utf8');
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Switches the port into "flowing mode"

// Pipe the data into another stream (like a parser or standard out)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/json', function (req, res) {
  res.json(dataResponse);
});

app.get('/xml', function (req, res) {
  const data = {
    xml: {
      '@css': 'script',
      javascript: {
        html: 'css',
        dataResponse,
      },
    },
  };
  const xml = toXML(data, null, 2);
  res.header('Content-Type', 'application/xml');
  res.status(200).send(xml);
});

parser.on('data', function (data) {
  arduinoData.humidity = data.split(',')[0];
  arduinoData.temperatureC = data.split(',')[1];
  arduinoData.temperatureF = data.split(',')[2];
  arduinoData.temperatureC2 = data.split(',')[3];

  arduinoData.pressure = data.split(',')[4];
  arduinoData.altitude = data.split(',')[5];
  arduinoData.weather = data.split(',')[6];

  console.log('Received data from port: ', arduinoData);

  onSearch('Abancay');

  dataResponse = {
    ...arduinoData,
    length: apiData.length,
    wind: apiData.length,
    img: apiData.img,
    name: apiData.name,
    latitude: apiData.latitude,
    country: apiData.country,
    weatherDescription: apiData.weather,
  };

  io.emit('data', dataResponse);
});

//Whenever someone connects this gets executed
io.on('connection', function (socket) {
  console.log('A user connected');

  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
});

function onSearch(city) {
  const apiKey = '4ae2636d8dfbdc3044bede63951a019b';

  axios
    .get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    )
    .then(({ data: recurso }) => {
      if (recurso.main !== undefined) {
        const cityData = {
          min: Math.round(recurso.main.temp_min),
          max: Math.round(recurso.main.temp_max),
          img: recurso.weather[0].icon,
          id: recurso.id,
          wind: recurso.wind.speed,
          temp: recurso.main.temp,
          name: recurso.name,
          weather: recurso.weather[0].main,
          clouds: recurso.clouds.all,
          latitude: recurso.coord.lat,
          length: recurso.coord.lon,
          country: recurso.sys.country,
          humidity: recurso.main.humidity,
          pressure: recurso.main.pressure,
        };
        apiData = cityData;
      } else {
        console.log('Ciudad no encontrada');
      }
    });
}

http.listen(3000, function () {
  console.log('listening on *:3000');
});
