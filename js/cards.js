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
CARDS FUNCTIONS USED FOR TOMMY BOT
*/

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

module.exports = {

sendMenuChoiceCard: function sendMenuChoiceCard(senderID, diningHall) {
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
},

sendBuildingCard: function sendBuildingCard(senderID, building, hyperlinkText) {
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
},

sendMenuCard: function sendMenuCard(senderID, menu, mealPreferences, diningHall) {
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
                    if (menu[0].stations[i].options[j].tags.indexOf(misc.capitalizeFirstLetter(mealPreferences)) != -1) {
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
},

sendEventsChoiceCard: function sendEventsChoiceCard(senderID, calendarName) {
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
},

sendEventsCard: function sendEventsCard(sender, eventStats) {

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
},

sendHeadlinesCard: function sendHeadlinesCard(sender, eventStats) {

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

}
