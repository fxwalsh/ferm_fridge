/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /contacts              ->  index
 * POST    /contacts            ->  create
 * GET     /contacts/:id          ->  show
 * PUT     /contacts/:id          ->  update
 * DELETE  /contacts/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Contact = require('./contact.model');


var pubnub = require("../../config/pubnub.js")

// Get list of contacts
exports.index = function(req, res) {
	      // Connect to the db
   Contact.find(function (err, contacts) {
    if(err) { return handleError(res, err); }
    return res.json(200, contacts);
  });

} ;

// Creates a new contact in datastore.
exports.create = function(req, res) {
  Contact.create(req.body, function(err, contact) {
    if(err) { return handleError(res, err); }
    return res.json(201, contact);
  });
};

// Updates an existing contact in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Contact.findById(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if(!contact) { return res.send(404); }
    var updated = _.merge(contact, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, contact);
    });
  });
};

// delete an existing contact in datastore.
exports.delete = function(req, res) {
	Contact.findById(req.params.id, function (err, contact) {
    if(err) { return handleError(res, err); }
    if(!contact) { return res.send(404); }
    contact.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
};