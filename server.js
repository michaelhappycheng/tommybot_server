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
var apiaiCall = require('./apiaicalls.js');

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
                recordMessageDataAnalytics(1);
                sendDots(sender);
                apiaiCall(text, sender);
            }
        }
        if (event.postback) {
            text = event.postback.payload;
            apiaiCall(text, sender);
        }
    }
    res.sendStatus(200);
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
}

function formatDateYY(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear().toString().substring(2, 4);

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
}

function sendMenuChoiceCard(senderID, diningHall) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Which meal do you want? (Mon - Fri)",
                "buttons": [{
                        "type": "postback",
                        "title": "Breakfast",
                        "payload": diningHall + " breakfast"
                    },
                    {
                        "type": "postback",
                        "title": "Lunch",
                        "payload": diningHall + " lunch"
                    },
                    {
                        "type": "postback",
                        "title": "Dinner",
                        "payload": diningHall + " dinner"
                    },
                ]
            }
        }
    }
    messageData2 = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Which meal do you want? (Weekend)",
                "buttons": [{
                        "type": "postback",
                        "title": "Brunch",
                        "payload": diningHall + " brunch"
                    },
                    {
                        "type": "postback",
                        "title": "Dinner",
                        "payload": diningHall + " dinner"
                    },
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
                id: senderID
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: senderID
            },
            message: messageData2,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendMenuCard(senderID, menu, mealPreferences, diningHall) {
    console.log(menu);
    if (menu[0].stations.length == 0) {
        sendTextMessage(senderID, "Sorry, that meal time is not available for today. Please select the proper option in the below menu.");
        sendMenuChoiceCard(senderID, diningHall);
    } else {
        if (mealPreferences != 'none') {
            sendTextMessage(senderID, "preferences for " + mealPreferences + " listed.");
        }
        for (var i = 0; i < menu[0].stations.length; i++) {

            var thisStationHasItems = false;
            var text = '';
            text += menu[0].stations[i].name + ' - ';
            for (var j = 0; j < menu[0].stations[i].options.length; j++) {
                if (mealPreferences != 'none') {
                    if (menu[0].stations[i].options[j].tags.indexOf(capitalizeFirstLetter(mealPreferences)) != -1) {
                        thisStationHasItems = true;
                        text += menu[0].stations[i].options[j].name;
                        if (j != menu[0].stations[i].options.length - 1) {
                            text += ', ';
                        }
                    }
                } else {
                    thisStationHasItems = true;
                    text += menu[0].stations[i].options[j].name;
                    if (j != menu[0].stations[i].options.length - 1) {
                        text += ', ';
                    }
                }
            }
            if (thisStationHasItems == true) {
                messageData = {
                    text: text
                }
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: token
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: senderID
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
            }
        }
    }
}

function sendBuildingCard(senderID, building, hyperlinkText) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": building.id + " | " + building.name,
                    "subtitle": building.address,
                    "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + hyperlinkText,
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://google.com/maps/dir//" + hyperlinkText,
                        "title": "Open in Google Maps"
                    }, {
                        "type": "web_url",
                        "url": "http://maps.apple.com/?q=" + hyperlinkText,
                        "title": "Open in Apple Maps"
                    }],
                }]
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
                id: senderID
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    messageData = {
        text: text
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
}

function getStarted(sender) {
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
}

function sendLocationQuickRepliesMessage(sender, text) {

    messageData = {
        "text": text,
        "quick_replies": [{
                "content_type": "text",
                "title": "VKC",
                "payload": "Where is VKC?"
            },
            {
                "content_type": "text",
                "title": "TCC",
                "payload": "Where is TCC?"
            },
            {
                "content_type": "text",
                "title": "THH",
                "payload": "Where is THH?"
            },
            {
                "content_type": "text",
                "title": "WPH",
                "payload": "Where is WPH?"
            },
            {
                "content_type": "text",
                "title": "RTH",
                "payload": "Where is RTH?"
            },
            {
                "content_type": "text",
                "title": "ADM",
                "payload": "Where is ADM?"
            },
            {
                "content_type": "text",
                "title": "SGM",
                "payload": "Where is SGM?"
            }
        ]
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
}

function sendHoursQuickRepliesMessage(sender, text) {
    messageData = {
        "text": text,
        "quick_replies": [{
                "content_type": "text",
                "title": "Leavey hours",
                "payload": "Leavey hours"
            },
            {
                "content_type": "text",
                "title": "EVK hours",
                "payload": "EVK hours"
            },
            {
                "content_type": "text",
                "title": "Parkside hours",
                "payload": "Parkside hours"
            },
            {
                "content_type": "text",
                "title": "Cafe 84 hours",
                "payload": "Cafe 84 hours"
            },
            {
                "content_type": "text",
                "title": "Doheny hours",
                "payload": "Doheny hours"
            }
        ]
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
}

function sendDiningQuickRepliesMessage(sender, text) {
    messageData = {
        "text": text,
        "quick_replies": [{
                "content_type": "text",
                "title": "EVK menu",
                "payload": "EVK menu"
            },
            {
                "content_type": "text",
                "title": "Parkside menu",
                "payload": "Parkside menu"
            },
            {
                "content_type": "text",
                "title": "Cafe 84 menu",
                "payload": "Cafe 84 menu"
            }
        ]
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
}

function sendEventQuickRepliesMessage(sender, text) {
    messageData = {
        "text": text,
        "quick_replies": [{
                "content_type": "text",
                "title": "Visions & Voices Events",
                "payload": "V&V_EVENTS"
            },
            {
                "content_type": "text",
                "title": "Viterbi Events",
                "payload": "VITERBI_EVENTS"
            },
            {
                "content_type": "text",
                "title": "Dornsife Events",
                "payload": "DORNSIFE_EVENTS"
            },
            {
                "content_type": "text",
                "title": "Sports Events",
                "payload": "SPORT_EVENTS"
            },
            {
                "content_type": "text",
                "title": "Miscellaneous Events",
                "payload": "MISCELLANEOUS_EVENTS"
            }
        ]
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
}

function sendDTQuickRepliesMessage(sender, text) {

    messageData = {
        "text": text,
        "quick_replies": [{
                "content_type": "text",
                "title": "News",
                "payload": "DT News"
            },
            {
                "content_type": "text",
                "title": "Sports",
                "payload": "DT Sports"
            },
            {
                "content_type": "text",
                "title": "Lifestyle",
                "payload": "DT Lifestyle"
            },
            {
                "content_type": "text",
                "title": "Opinion",
                "payload": "DT Opinion"
            }
        ]
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
}

function sendEventsChoiceCard(senderID, calendarName) {
    console.log('eventschoice!!! BUG' + calendarName);
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "What period of events?",
                "buttons": [{
                        "type": "postback",
                        "title": "Today",
                        "payload": calendarName + " today"
                    },
                    {
                        "type": "postback",
                        "title": "Tomorrow",
                        "payload": calendarName + " tomorrow"
                    },
                    {
                        "type": "postback",
                        "title": "This Week",
                        "payload": calendarName + " week"
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
                id: senderID
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendEventsCard(sender, eventStats) {

    if (!eventStats || eventStats.length == 0) {
        sendTextMessage(sender, "Sorry, there no events for that calandar for that specified section of time.");
    } else {
        eventCarousel = [];

        for (var i = 0; i < eventStats.length; i++) {
            eventTitle = eventStats[i].title
            eventDate = eventStats[i].date
            eventTime = eventStats[i].time
            eventLocation = eventStats[i].location
            eventLink = eventStats[i].link

            eventCarousel.push(
                eventJSON = {
                    "title": eventTitle,
                    "subtitle": eventDate + "\n" + eventTime + "\n" + eventLocation,
                    "default_action": {
                        "type": "web_url",
                        "url": eventLink,
                        "messenger_extensions": false,
                        "webview_height_ratio": "compact",
                    },
                    "buttons": [{
                        "type": "web_url",
                        "url": eventLink,
                        "title": "More Info"
                    }]
                });
        }

        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": eventCarousel
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
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

function sendHeadlinesCard(sender, eventStats) {

    if (!eventStats || eventStats.length == 0) {
        sendTextMessage(sender, "Sorry, there no events for that calandar for that specified section of time.");
    } else {
        eventCarousel = [];

        for (var i = 0; i < eventStats.length; i++) {
            eventTitle = eventStats[i].title
            eventDate = eventStats[i].date
            eventLink = eventStats[i].link

            eventCarousel.push(
                eventJSON = {
                    "title": eventTitle,
                    "subtitle": eventDate,
                    "default_action": {
                        "type": "web_url",
                        "url": eventLink,
                        "messenger_extensions": false,
                        "webview_height_ratio": "compact",
                    },
                    "buttons": [{
                        "type": "web_url",
                        "url": eventLink,
                        "title": "Read Article"
                    }]
                });
        }

        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": eventCarousel
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
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

function sendDots(sender) {
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
}

function find(collec, query, callback) {
    mongoose.connection.db.collection(collec, function(err, collection) {
        collection.find(query).toArray(callback);
    });
}

function recordMessageDataAnalytics(number) {
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

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})
