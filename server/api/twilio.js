'use strict';
// var client = require('twilio')(accountSid, authToken);



var accountSid = 'AC067078ffce15cb005adb698e78ff4e84';
var authToken = "d3688d4a39156b784f268b94fd7635ea";

var client = require('twilio')(accountSid, authToken);

// Function to send automated SMS
exports.sendSMS = function(req, res) {

  var message = req.body.message;

  // console.log('sms message ', message);

  //require the Twilio module and create a REST client
  // var client = require('twilio')(accountSid, authToken);

  client.messages.create({
    to: "+16264977166",
    from: "+16262437222",
    body: message
  }, function(err, message) {

    if(err) {
      console.log(err);
      res.send(400);
    } else {
      res.send(200);
    }


  });

};