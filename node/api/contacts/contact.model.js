'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema = new Schema({
  name: String,
  address: String,
  age: { type: Number, min: 0, max: 120 },
  email: String,
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema);