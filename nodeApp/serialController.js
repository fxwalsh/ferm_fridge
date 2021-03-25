import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-readline'



const port = new SerialPort('COM9', { baudRate: 9600 })
const serialPort = port.pipe(new Delimiter({ delimiter: '\n' }))

export const lastData = {data:"", time:""} // last data recieved  from brew controller.

serialPort.on('error', () => {
    console.log('Cannot Connect - retrying')
    setTimeout(openPort, process.env.connectperiod)
  })

// Read the port data
serialPort.on("open", () => {
  console.log('serial port open');
});


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
      let jsonString = `{"setPoint":${value}}\n\n`
      port.write(jsonString, (error) => {
         if (error) {
                   console.log('Error:' + error.message)
    } else {
      console.log(`SetPoint updated to ${jsonString}`)
    }
  })
  }