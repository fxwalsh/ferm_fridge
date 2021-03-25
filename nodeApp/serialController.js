import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'



const port = new SerialPort('/dev/ttyACM0')
const serialPort = port.pipe(new Delimiter({ delimiter: '\n' }))

export const lastData = {data:"", time:""} // last data recieved  from brew controller.

serialPort.on('error', () => {
    console.log('Cannot Connect - retrying')
    setTimeout(openPort, process.env.connectperiod)
  })


  serialPort.on('data', (data) => {
    try {
      if (JSON.parse(data).hasOwnProperty('beerTemp')) {
        lastData.data = JSON.parse(data)
        lastData.time = new Date()
        console.log('data returned from controller:' + data)
      }
    } catch (e) { // Not JSON;
      console.log('ERROR data returned from controller:' + data)
    }
  })

  export const setTarget = function(value){
      let jsonString = `{"setPoint":${value}} \n`
      serialPort.write(jsonString, (error) => {
         if (error) {
                   console.log('Error:' + error.message)
    } else {
      console.log(`SetPoint updated to ${jsonString}`)
    }
  })
  }