

#include <ArduinoJson.h>
#include <DallasTemperature.h>
#include <OneWire.h>
#include "EEPROMio.h"
#include "globals.h"
#include <elapsedMillis.h>

elapsedMillis timeElapsed;

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
  digitalWrite(fridgeRelay, HIGH);
  pinMode(heatRelay, OUTPUT);
  digitalWrite(heatRelay, HIGH);

  initSerialPort();
  fridgeState = IDLE;
  actuatorState = IDLE;
  timeElapsed=0;
}

void loop() {

  if (Serial.available() > 0)
  {
    char str[200]; 
    Serial.readBytesUntil('\n',str,200);
    updateSettings(str);
  }


  sensors.requestTemperatures();
  beerTemp = sensors.getTempC(beerThermometer);
  fridgeTemp = sensors.getTempC(fridgeThermometer);
 
  previousState = fridgeState;
  if ((beerTemp < (SetPoint - Hysteresis)) && (fridgeTemp < MaxChamberTemp)) {
    fridgeState = HEAT;
  } else if (beerTemp > (SetPoint + Hysteresis)) {
    fridgeState = COOL;
  } else {
    fridgeState = IDLE;
  }
  if (previousState!=fridgeState){
    lastStateChange = millis();
  }
  
  if ((millis() - lastStateChange) > stateChangeDelay) {
    if (actuatorState!=fridgeState){
         updateRelays();
         times[previousActuatorState]=times[previousActuatorState]+(timeElapsed/1000);
         timeElapsed=0;
    }
  }
  writeState();
  delay(1000);
}

void updateRelays() {
  previousActuatorState = actuatorState;
  actuatorState = fridgeState;
  switch (actuatorState) {
    default:
    case IDLE:
      digitalWrite(fridgeRelay, HIGH);
      digitalWrite(heatRelay, HIGH);
      break;
    case HEAT:
      digitalWrite(fridgeRelay, HIGH);
      digitalWrite(heatRelay, LOW);
      break;
    case COOL:
      digitalWrite(fridgeRelay, LOW);
      digitalWrite(heatRelay, HIGH);
      break;
  }
}

void updateSettings(char json[]) {
  Serial.println(json);
  boolean settingsChanged = false;
  StaticJsonDocument<200> root;

  deserializeJson(root,json);
  double tempSetPoint  = root["setPoint"];
  if (tempSetPoint >MinChamberTemp && tempSetPoint<MaxChamberTemp){
    SetPoint = tempSetPoint; 
    settingsChanged = true;
  }

  if (settingsChanged){
    writeEEPROM();
  }
}

void writeState() {
  StaticJsonDocument<200> root;

 // JsonDocument root = jsonBuffer.createObject();
  root["beerTemp"] = beerTemp;
  root["fridgeTemp"] = fridgeTemp;
  root["setPoint"] = SetPoint;
  switch (actuatorState) {
    default:
      root["state"] = "DUNNO";
      break;
    case IDLE:
      root["state"] = "IDLE";
      break;
    case HEAT:
      root["state"] = "HEATING";
      break;
    case COOL:
      root["state"] = "COOLING";
      break;
  }
 unsigned long tempTime=timeElapsed/1000;
 root["timeElapsed"] = tempTime;
  JsonArray currentTimes = root.createNestedArray("times");
  currentTimes.add(times[0]);  // 6 is the number of decimals to print
  currentTimes.add(times[1]);
  currentTimes.add(times[2]);

  serializeJson(root,Serial);
  Serial.println();
}

void initSerialPort() {
  Serial.begin(9600);
}

void readEEProm() {
  // read settings from EEPROM
  Serial.println("Reading from EEPROM");
  EEPROMRead(1, &Active, BYTE);
  EEPROMRead(2, &SetPoint, DOUBLE);
  EEPROMRead(6, &Hysteresis, DOUBLE);
  EEPROMRead(10, &MaxChamberTemp, DOUBLE);
  EEPROMRead(14, &MinChamberTemp, DOUBLE);
}

void writeEEPROM() {  // write current settings to EEPROM
  Serial.println("Writing EEPROM");
  EEPROMWrite(1, (byte)(Active), BYTE);
  EEPROMWrite(2, SetPoint, DOUBLE);
  EEPROMWrite(6, Hysteresis, DOUBLE);
  EEPROMWrite(10, MaxChamberTemp, DOUBLE);
  EEPROMWrite(14, MinChamberTemp, DOUBLE);
}

void writePresetsEEPROM() {      // save defaults to eeprom
  Serial.println("Reading Presets from EEPROM");
  EEPROMWrite(1, (byte)1, BYTE);    // default programState (main PID manual, heat PID manual, deg F, no file operations)
  EEPROMWrite(2, (double)20.00, DOUBLE);       // default main Setpoint
  EEPROMWrite(6, (double)0.5, DOUBLE);
  EEPROMWrite(10, (double)30, DOUBLE);
  EEPROMWrite(14, (double)5, DOUBLE);
}
