#ifndef GLOBALS_H
#define GLOBALS_H

#include <OneWire.h>
#include <DallasTemperature.h>

const byte onewireData = A4;  // one-wire data
const byte fridgeRelay = 6;       // relay 1 (fridge compressor)
const byte heatRelay = 2;       // relay 2 (heating element)



// arrays to hold device addresses
DeviceAddress fridgeThermometer, beerThermometer;

enum state {  
  IDLE,
  COOL,
  HEAT,
};

state fridgeState, previousState;
state actuatorState, previousActuatorState;

unsigned long lastStateChange = 0;  // Last time state changed
unsigned long stateChangeDelay = 10000;

unsigned long times[] = {0,0,0};

 
float beerTemp;
float fridgeTemp;

byte Active;
double SetPoint, Hysteresis, MaxChamberTemp, MinChamberTemp;  // SP, PV, CO, tuning params for main PID
unsigned long maxHeatTime;

// Data wire is plugged into port 2 on the Arduino

//#define TEMPERATURE_PRECISION 9

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(onewireData);

// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

#endif
