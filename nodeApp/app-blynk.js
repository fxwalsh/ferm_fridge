import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import Blynk from 'blynk-library'
import bodyParser from 'body-parser'
import express from 'express'



//const Delimiter = require('@serialport/parser-delimiter')
//const port = new SerialPort('/dev/ttyACM0')
//const serialPort = port.pipe(new Delimiter({ delimiter: '\n' }))

require('dotenv').config()

import {lastData, setTarget} from './serialController'

console.log('created serialport')

//let lastData // last data recieved  from brew controller.
const blynk = new Blynk.Blynk(process.env.blynkkey)

const BlinkGauge = new blynk.VirtualPin(2)

//serialPort.on('error', () => {
//  console.log('Cannot Connect - retrying')
//  setTimeout(openPort, process.env.connectperiod)
//})

//serialPort.on('data', (data) => {
//  try {
//    if (JSON.parse(data).hasOwnProperty('beerTemp')) {
//      lastData = JSON.parse(data)
//    }
//  } catch (e) { // Not JSON;
//    console.log('data returned from controller:' + data)
//  }
//})

const app = express()
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

//app.post('/', (req, res) => {
//  serialPort.write(JSON.stringify(req.body), (error) => {
//    if (error) {
//      console.log('Error:' + error.message)
//    } else {
//      res.send(JSON.stringify(req.body))
//    }
//  })
//})

app.listen(process.env.port, () => {
  console.log(`app listening`)
})

/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */
var v3 = new blynk.VirtualPin(3);

v3.on('write', function(param) {
  console.log('V3:', param);
  setTarget(param[0])
});

const publish = () => {
    console.log('publishing')
  if (lastData.data) { 
    console.log(lastData.data.beerTemp)
    blynk.virtualWrite(2, lastData.data.beerTemp)
    blynk.virtualWrite(1, lastData.data.state)
    blynk.virtualWrite(4, lastData.data.fridgeTemp)
  }
  setTimeout(publish, 60000)
}

//openPort()
publish()
