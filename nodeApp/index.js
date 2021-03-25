import Serialport from 'serialport'
import isJSON from 'is-json'
import bodyParser from 'body-parser'
import express from 'express'

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/ttyACM0')

const serialPort = port.pipe(new Delimiter({ delimiter: '\n' }))

require('dotenv').config()

console.log('created serialport')

let lastData

serialPort.on('error', () => {
  console.log('Cannot Connect - retrying')
  setTimeout(openPort, process.env.connectperiod)
})

serialPort.on('data', (data) => {
  try {
    if (JSON.parse(data).hasOwnProperty('beerTemp')) {
      lastData = JSON.parse(data)
    }
  } catch (e) { // Not JSON;
    console.log('data returned from controller:' + data)
  }
})

const app = express()
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.post('/', (req, res) => {
  console.log(JSON.stringify(req.body))
  serialPort.write("{\"setPoint\":30}", (error) => {
    if (error) {
      console.log('Error:' + error.message)
    } else {
      res.send(JSON.stringify(req.body))
    }
  })
})

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(lastData).end()
})

app.listen(process.env.port, () => {
  console.log(`app listening on port `+ process.env.port)
})