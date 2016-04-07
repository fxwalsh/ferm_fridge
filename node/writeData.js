'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose');
var config = require('./config/');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var BrewData = require('./brewdata.model');

var pubnub = require("pubnub")(config.pubnub);

function subscribe(channel) {
    pubnub.subscribe({
        'channel' : channel,
        'connect' : function(c) {
            console.log('CONNECTED to ' + c);
        },
        'disconnect' : function(c) {
            console.log('DISCONNECTED to ' + c);
        },
        'reconnect' : function(c) {
            console.log('RECONNECTED to ' + c);
        },
        'error' : function(e) {
            console.log('ERROR  ' + JSON.stringify(r));
        },
        'callback' : function(m,a,subscribed_channel,c,real_channel) {
           // console.log(JSON.stringify(m));
            BrewData.create(JSON.parse(m), function(err, brewdata) {
    if(err) { return err; }
    console.log(brewdata);;
  });
        }
    })
};

subscribe("brew_data");