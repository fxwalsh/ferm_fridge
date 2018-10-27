import Serialport from 'serialport'
import isJSON from 'is-json'
import config from './config/config'
import bodyParser from 'body-parser'
import express from 'express'

const serialPort = new Serialport(config.serial.port, {
  baudRate: config.serial.baud, autoOpen: false, parser: Serialport.parsers.readline('\n')
})

console.log('created serialport')

let lastData // last data recieved  from brew controller.
const wia = require('wia')('d_sk_Qm7syTMQNmMiuhDCdE1yoO2p');

const openPort = () => {
  serialPort.open((error) => {
    if (error) {
      console.log('failed to open: ' + error)
    } else {
      console.log('open')
    }
  })
}

serialPort.on('error', () => {
  console.log('Cannot Connect - retrying')
  setTimeout(openPort, config.serial.reconnectInterval)
})

serialPort.on('close', () => {
  console.log('port closed.')
  setTimeout(openPort, config.serial.reconnectInterval)
})

serialPort.on('data', (data) => {
  try {
    if (JSON.parse(data).hasOwnProperty('beerTemp')) {
      lastData = data
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

app.listen(config.port, () => {
  console.log(`app listening on port ${config.port}`)
})

/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */

const publish = () => {
  if (isJSON(lastData)) { // validate it's JSON before publish.
    console.log(lastData)
    wia.events.publish({
        name: 'beer-temp',
        data: lastData.beerTemp
    });

    setTimeout(publish, config.serial.publishInterval)
  }
}

openPort()
publish()



//const wia = require('wia')('d_sk_Qm7syTMQNmMiuhDCdE1yoO2p');
