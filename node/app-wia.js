import Serialport from 'serialport'
import isJSON from 'is-json'
//import config from './config/config'
import bodyParser from 'body-parser'
import express from 'express'

const serialPort = new Serialport("/dev/ttyACM0", {
  baudRate: 9600, autoOpen: false, parser: Serialport.parsers.readline('\n')
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
  setTimeout(openPort, 10000)
})

serialPort.on('close', () => {
  console.log('port closed.')
  setTimeout(openPort, 10000)
})

serialPort.on('data', (data) => {
    console.log(data)
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

app.listen(8080, () => {
  console.log(`app listening on port 8080`)
})

/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */

const publish = () => {
    console.log("publishing")
  //if (isJSON(lastData)) { // validate it's JSON before publish.
    console.log(lastData.beerTemp)
    wia.events.publish({
        name: 'beer-temp',
        data: lastData.beerTemp
    });

   
  //}
  setTimeout(publish, 10000)
}

openPort()
publish()



//const wia = require('wia')('d_sk_Qm7syTMQNmMiuhDCdE1yoO2p');
