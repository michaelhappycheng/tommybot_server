/*
MODULES NECESSARY FOR EXPORT
*/
// Node.js module imports
var express = require('express');
var bodyParser = require('body-parser');
var apiai = require('apiai');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// authenticating into Facebook and API.AI
var token = (process.env.facebookToken || "hello");
var apiaiApp = apiai(process.env.apiaiToken || "hello");

// connect to database
var url = (process.env.MONGODB_URI);

/*
MISCELLANEOUS FUNCTIONS USED FOR TOMMY BOT
*/

module.exports = {

capitalizeFirstLetter: function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
},

formatDate: function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
},

formatDateYY: function formatDateYY(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear().toString().substring(2, 4);

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
},

getStarted: function getStarted(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Welcome! Below are a few of my chatbot services. Feel free to use this menu or type freehand. For more of my capabilities, click the menu on the bottom left!",
                "buttons": [{
                        "type": "postback",
                        "title": "Directions",
                        "payload": "What can you tell me about directions?"
                    },
                    {
                        "type": "postback",
                        "title": "Events",
                        "payload": "What can you tell me about school events?"
                    },
                    {
                        "type": "postback",
                        "title": "Dining",
                        "payload": "What can you tell me about dining hall menus?"
                    }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
},

sendDots: function sendDots(sender) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            sender_action: "typing_on",
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
},

recordMessageDataAnalytics: function recordMessageDataAnalytics(number) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        var dataAnalytics = db.collection('dataAnalytics'); //finds the collection

        // this way we can get PST time and date
        var clientDate = new Date();
        utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
        var d = new Date(utc + (3600000 * -8));
        var dd = d.getDate();
        var mm = d.getMonth() + 1;
        var yyyy = d.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        var todayStringFormat = mm + '/' + dd + '/' + yyyy;

        // finds and modifies the proper code
        dataAnalytics.findAndModify({
            "date": todayStringFormat
        }, {
            rating: 1
        }, {
            "$inc": {
                "numberOfMessages": number
            }
        }, {
            upsert: true
        }, function(err, doc) {
            console.log('find and modified  ' + doc);
        });

        db.close();
    });
}

}
