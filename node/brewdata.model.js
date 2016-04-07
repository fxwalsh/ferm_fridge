'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BrewDataSchema = new Schema({
  beer_temp: Number,
  fridge_temp: Number,
  set_point: Number,
  fridge_state: Number,
  runningTime: Number
});

module.exports = mongoose.model('BrewData', BrewDataSchema);