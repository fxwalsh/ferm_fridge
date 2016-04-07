var serialport=require("serialport");
var isJSON = require("is-json");
var SerialPort = serialport.SerialPort;

var serialPort = new SerialPort("/dev/ttyACM0", {
	parser: serialport.parsers.readline("\n")
});
console.log("created serialport");
var publishInterval = 5000; //publish interval in millisecs
var reconnectInterval = 10000; //publish interval in millisecs

var lastData; //last data recieved  from brew controller.

var pubnub = require("./config/pubnub");


var openPort = function(){
serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);

    setTimeout(openPort,reconnectInterval);
  } else {
    console.log('open');
  }
});};

serialPort.on('error', function() {
      console.log('Cannot Connect - retrying');
    //  setTimeout(openPort,reconnectInterval);
    });

serialPort.on('close', function() {
      console.log('port closed.');
      setTimeout(openPort,reconnectInterval);
    });

        serialPort.on('data', function(data) {
      try {
        if (JSON.parse(data).hasOwnProperty("beer_temp")){ 
          lastData = data;
        }
      } catch (e) {
            //Not JSON;
            return;
        }
    });    


  
/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */

  var publish = function () {
    if (isJSON(lastData)) //validate it's JSON before publish.
      pubnub.publish({ 
      channel   : 'brew_data',
      message   : lastData,
      callback  : function(e) { console.log( "SUCCESS!", e ); },
      error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
      });
    setTimeout(publish,publishInterval);
    }
    
  openPort();
  publish();



