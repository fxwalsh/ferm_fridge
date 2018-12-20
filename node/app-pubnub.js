import Serialport from 'serialport'
import isJSON from 'is-json'
//import config from './config/config'
import bodyParser from 'body-parser'
import express from 'express'

//const serialPort = new Serialport("/dev/ttyACM0", {
//  baudRate: 9600, autoOpen: false
// parser: Serialport.parsers.readline('\n')
//})

const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/ttyACM0')

const serialPort = port.pipe(new Delimiter({ delimiter: '\n' }))


require('dotenv').config()

console.log('created serialport')

let lastData // last data recieved  from brew controller.
const PubNub = require('pubnub')
console.log(process.env.pubnub_publish)
const pubnub = new PubNub({
			publishKey: process.env.pubnub_publish,
			subscribeKey: process.env.pubnub_subscribe
			})



//const openPort = () => {
//  serialPort.open((error) => {
//    if (error) {
//      console.log('failed to open: ' + error)
//    } else {
//      console.log('open')
//    }
//  })
//}

serialPort.on('error', () => {
  console.log('Cannot Connect - retrying')
  setTimeout(openPort, process.env.connectperiod)
})

//serialPort.on('close', () => {
//  console.log('port closed.')
//  setTimeout(openPort, process.env.connectperiod)
//})

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
  serialPort.write(JSON.stringify(req.body), (error) => {
    if (error) {
      console.log('Error:' + error.message)
    } else {
      res.send(JSON.stringify(req.body))
    }
  })
})

app.listen(process.env.port, () => {
  console.log(`app listening`)
})

/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */

const publish = () => {
  if (lastData) {
	console.log("publishing") 
      pubnub.publish({
      channel: 'brew_data',
      message: JSON.stringify(lastData),
      callback: (e) => { console.log('SUCCESS!', e) },
      error: (e) => { console.log('FAILED! RETRY PUBLISH!', e) }
    })
   
  }
  setTimeout(publish, process.env.publishperiod)
}

//openPort()
publish()
