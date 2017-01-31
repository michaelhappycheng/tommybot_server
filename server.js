// Node.js module imports
var express = require('express');
var bodyParser = require('body-parser');
var apiai = require('apiai');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Setting port to default 5000 if there are no assigned ports
app.set('port', (process.env.PORT || 5000));

//authenticating into Facebook and API.AI
var token = (process.env.facebookToken);
var apiaiApp = apiai(process.env.apiaiToken);

// Testing whether requiring another file works
var attempt = require('./apiaicalls.js');
console.log(attempt);
var attempt2 = require('./externalfunctions.js');

//connect to database
var url = (process.env.MONGODB_URI);

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function(req, res) {
    res.send('Hello world, I am a chat bot');
});

// for facebook verification
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.facebookSecret) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post('/webhook/', function(req, res) {
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            if (sender != 306268366415607) { // ignores messages sent by Tommy
                attempt2.recordMessageDataAnalytics(1);
                attempt2.sendDots(sender);
                attempt.apiaiCall(text, sender);
            }
        }
        if (event.postback) {
            text = event.postback.payload;
            attempt.apiaiCall(text, sender);
        }
    }
    res.sendStatus(200);
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})
