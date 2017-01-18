var serialport=require("serialport");
var isJSON = require("is-json");
var config = require("./config/config");  

var serialPort = new serialport(config.serial.port, {
  baudRate: 9600, autoOpen: false, parser: serialport.parsers.readline('\n')
});
//serialPort.close() ;
console.log("created serialport");
var publishInterval = 5000; //publish interval in millisecs
var reconnectInterval = 10000; //publish interval in millisecs

var lastData; //last data recieved  from brew controller.

var PubNub = require("pubnub");


 
var pubnub = new PubNub(config.pubnub.keys);


var openPort = function(){
serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);

   // setTimeout(openPort,reconnectInterval);
  } else {
    console.log('open');
  }
});};

serialPort.on('error', function() {
      console.log('Cannot Connect - retrying');
     setTimeout(openPort,reconnectInterval);
    });

serialPort.on('close', function() {
      console.log('port closed.');
      setTimeout(openPort,reconnectInterval);
    });

 serialPort.on('data', function(data) {
      try {

      	console.log(data);
        if (JSON.parse(data).hasOwnProperty("beerTemp")){ 
          lastData = data;
        }
      } catch (e) {
            //Not JSON;
            console.log(e);
            return;
        }
    });    


  
/* ---------------------------------------------------------------------------
Publish Messages
--------------------------------------------------------------------------- */

  var publish = function () {
    if (isJSON(lastData)) //validate it's JSON before publish.
      pubnub.publish({ 
      channel   : config.pubnub.channel,
      message   : lastData,
      callback  : function(e) { console.log( "SUCCESS!", e ); },
      error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
      });
    setTimeout(publish,publishInterval);
    }
    
  openPort();
  publish();



