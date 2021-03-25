var BlynkLib = require('blynk-library');
 
var blynk = new BlynkLib.Blynk('vRDBUIYOYCuRVmf_XIbAmV6TFbIENPyZ');
var v1 = new blynk.VirtualPin(1);
var v9 = new blynk.VirtualPin(9);
 
v1.on('write', function(param) {
  console.log('V1:', param);
});
 
v9.on('read', function() {
  v9.write(new Date().getSeconds());
});