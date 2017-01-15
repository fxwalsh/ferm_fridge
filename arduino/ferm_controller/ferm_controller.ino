#include <DallasTemperature.h>

#include <OneWire.h>

#include <EEPROMio.h>
#include "globals.h"

void setup() {

  EEPROMRead(1, &Active, BYTE);  // address 1 should be either 0 or 1. Otherwise do presets
  
  if (Active > (byte)1) {  // EEPROM not right  
    writePresetsEEPROM();  // if version # is outdated, write presets
  }
  
  readEEProm();

  sensors.begin();
  if (!sensors.getAddress(fridgeThermometer, 0)) Serial.println("Unable to find address for Fridge Thermometer"); 
  if (!sensors.getAddress(beerThermometer, 1)) Serial.println("Unable to find address for Beer Thermometer"); 
  

   pinMode(fridgeRelay, OUTPUT);  // configure relay pins and write default HIGH (relay open)
    digitalWrite(fridgeRelay, LOW);
  pinMode(heatRelay, OUTPUT);
    digitalWrite(heatRelay, LOW);

  initSerialPort();
  fridgeState=IDLE;
}

void loop() {

  readSerial();
  
  float beerTemp = sensors.getTempC(beerThermometer);
  float fridgeTemp = sensors.getTempC(fridgeThermometer);

  if (beerTemp < SetPoint-Hysteresis){
      fridgeState = HEAT;
  }else if (beerTemp > (SetPoint+Hysteresis)){ 
      fridgeState = COOL;
  }else{
      fridgeState = IDLE;
  }

  updateRelays();
  writeState();
}

void updateRelays(){
  switch (fridgeState) {  
    default:
    case IDLE:
    break;
    case HEAT:
    break;
    case COOL:
    break;
  }
      
  
}

void readSerial(){
  
}

void writeState(){
  
}

void initSerialPort(){
  Serial.begin(9600);
}

void readEEProm(){
 // read settings from EEPROM
  EEPROMRead(1, &Active, BYTE);
  EEPROMRead(2, &SetPoint, DOUBLE);
  EEPROMRead(6, &Hysteresis, DOUBLE);
  EEPROMRead(10, &MaxChamberTemp, DOUBLE);
  EEPROMRead(14, &MinChamberTemp, DOUBLE); 
}

void writeEEPROM() {  // write current settings to EEPROM
  
  EEPROMWrite(1, (byte)(Active), BYTE);
  EEPROMWrite(2, SetPoint, DOUBLE);
  EEPROMWrite(6, Hysteresis, DOUBLE);
  EEPROMWrite(10,MaxChamberTemp, DOUBLE);
  EEPROMWrite(14, MinChamberTemp, DOUBLE);
}

void writePresetsEEPROM() {      // save defaults to eeprom
  EEPROMWrite(1, (byte)1, BYTE);    // default programState (main PID manual, heat PID manual, deg F, no file operations)
  EEPROMWrite(2, (double)20.00, DOUBLE);       // default main Setpoint
  EEPROMWrite(6, (double)0.5, DOUBLE);      
  EEPROMWrite(10, (double)30, DOUBLE);      
  EEPROMWrite(14, (double)5, DOUBLE);     
}

