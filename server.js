// Node.js module imports
var express = require('express');
var bodyParser = require('body-parser');
var apiai = require('apiai');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient, assert = require('assert');

// Setting port to default 5000 if there are no assigned ports
app.set('port', (process.env.PORT || 5000));

//authenticating into Facebook and API.AI
var token = (process.env.facebookToken);
var apiaiApp = apiai(process.env.apiaiToken);

//connect to database
var url = (process.env.MONGODB_URI);

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot');
});

// for facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.facebookSecret) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post('/webhook/', function (req, res) {
    
    messaging_events = req.body.entry[0].messaging;

    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;

        if (event.message && event.message.text) {
            text = event.message.text;

            if (event.message.quick_reply) {
                text = event.message.quick_reply.payload;
                apiaiCall(text, sender);
            }
            else {
                sendDots(sender);
                apiaiCall(text, sender);
                if (sender != 306268366415607) { // ignores messages sent by Tommy
                recordMessageDataAnalytics(1);
            }
        } 
        else if (event.postback) {
            text = event.postback.payload;
            apiaiCall(text, sender);
            }   
        }
    res.sendStatus(200);
    
    }
})

function apiaiCall(text, sender) {
    var request = apiaiApp.textRequest(text, {sessionId: process.env.apiaiSessionId}); //sends text request to api.ai

    request.on('response', function(response) {
        {
        if (response.result.fulfillment.speech != "") {
            sendTextMessage(sender, response.result.fulfillment.speech);
        }
        else if (response.result.action == "getStarted") {
          getStarted(sender);
        }
        else if (response.result.action == "getMenu") {
            if (response.result.parameters.dininghall != '') {
                if (response.result.parameters.mealtype == '') {
                    // sends back FB card for user to select meal time
                    sendMenuChoiceCard(sender, response.result.resolvedQuery);
                }
                else if (response.result.parameters.mealtype == 'breakfast') {
                    MongoClient.connect(url, function(err, db) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    var dininghalls = db.collection('dininghalls'); //finding building
                    dininghalls.find({'name': response.result.parameters.dininghall, 'mealtype': "Breakfast"}).toArray(function(err, returnedMenu) {
                        console.log(returnedMenu);
                        assert.equal(err, null);
                        assert.equal(1, returnedMenu.length);
                        if (response.result.parameters.mealpreferences != '') {
                          sendMenuCard(sender, returnedMenu, response.result.parameters.mealpreferences, response.result.parameters.dininghall);
                        }
                        else {
                          sendMenuCard(sender, returnedMenu, 'none', response.result.parameters.dininghall);
                        }
                        });
                    db.close();
                    });
                }
                else if (response.result.parameters.mealtype == 'brunch') {
                    MongoClient.connect(url, function(err, db) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    var dininghalls = db.collection('dininghalls'); //finding building
                    dininghalls.find({'name': response.result.parameters.dininghall, 'mealtype': "Brunch"}).toArray(function(err, returnedMenu) {
                        console.log(returnedMenu);
                        assert.equal(err, null);
                        assert.equal(1, returnedMenu.length);
                        if (response.result.parameters.mealpreferences != '') {
                          sendMenuCard(sender, returnedMenu, response.result.parameters.mealpreferences, response.result.parameters.dininghall);
                        }
                        else {
                          sendMenuCard(sender, returnedMenu, 'none', response.result.parameters.dininghall);
                        }
                        });
                    db.close();
                    });
                }
                else if (response.result.parameters.mealtype == 'lunch') {
                    MongoClient.connect(url, function(err, db) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    var dininghalls = db.collection('dininghalls'); //finding building
                    dininghalls.find({'name': response.result.parameters.dininghall, 'mealtype': "Lunch"}).toArray(function(err, returnedMenu) {
                        console.log(returnedMenu);
                        assert.equal(err, null);
                        assert.equal(1, returnedMenu.length);
                        if (response.result.parameters.mealpreferences != '') {
                          sendMenuCard(sender, returnedMenu, response.result.parameters.mealpreferences, response.result.parameters.dininghall);
                        }
                        else {
                          sendMenuCard(sender, returnedMenu, 'none', response.result.parameters.dininghall);
                        }
                        });
                    db.close();
                    });
                }
                else if (response.result.parameters.mealtype == 'dinner') {
                    MongoClient.connect(url, function(err, db) {
                    assert.equal(null, err);
                    console.log("Connected correctly to server");
                    var dininghalls = db.collection('dininghalls'); //finding building
                    dininghalls.find({'name': response.result.parameters.dininghall, 'mealtype': "Dinner"}).toArray(function(err, returnedMenu) {
                        console.log(returnedMenu);
                        assert.equal(err, null);
                        assert.equal(1, returnedMenu.length);
                        if (response.result.parameters.mealpreferences != '') {
                          sendMenuCard(sender, returnedMenu, response.result.parameters.mealpreferences, response.result.parameters.dininghall);
                        }
                        else {
                          sendMenuCard(sender, returnedMenu, 'none', response.result.parameters.dininghall);
                        }
                        });
                    db.close();
                    });
                }
            }
            else {
                sendTextMessage(sender, "Can you rewrite the question with a specified dining hall? It's easier to send a message with a more concise question! You can pick from EVK, Parkside, and Cafe 84.");
            }
        }
        else if (response.result.action == "getLocation") {
            if (response.result.parameters.building != ''){
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                console.log("Connected correctly to server");
                var buildings = db.collection('buildings'); //finding building
                buildings.find({'id': response.result.parameters.building}).toArray(function(err, returnedBuilding) {
                    var hyperlinkBuildingAddress = returnedBuilding[0].address.replace(/ /g, "%20"); //reformats text for hyperlink
                    sendBuildingCard(sender, returnedBuilding[0], hyperlinkBuildingAddress);
                    sendTextMessage(sender, "Mobile users - open the navigation in browser for more optimal performance.");
                });
                db.close();
            });
            }
            else {
            sendTextMessage(sender, "Sorry, I couldn't understand that - can you be more specific or try your building's 3-letter code? For a full list of buildings at USC visit - http://fmsmaps4.usc.edu/usc/php/bl_list_no.php");
            }
        }
        else if (response.result.action == "getAcademicEvent") {
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                console.log("Connected correctly to server");
                var calender = db.collection('academicCalender'); //find dates
                calender.find({'id': response.result.parameters.eventtype}).toArray(function(err, returnedEvent) {
                    if (returnedEvent.length != 0) {
                        sendTextMessage(sender, returnedEvent[0].value + "!" );
                    }
                    else {
                        sendTextMessage(sender, "I could not find that event! You can try rephrasing your question, or visit this site for a schedule of classes - http://classes.usc.edu/term-20171/calendar/ - and this site for an overall academic schedule - http://academics.usc.edu/calendar/")
                    }
                });
                db.close();
            });
        }
        else if (response.result.action == "getHours") {
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                console.log("Connected correctly to server");
                var hours = db.collection('buildingHours'); // find stored building hours
                hours.find({'Building': response.result.parameters.buildingHours}).toArray(function(err, returnedEvent) {

                    var clientDate = new Date();
                    utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
                    var d = new Date(utc + (3600000*-8)); // this way we can get PST time
                    var n = d.getDay();

                    if (response.result.parameters['date-period'] != '') {
                      var temp = response.result.parameters['date-period'].toLowerCase();
                      if (temp == 'tomorrow') {
                        n=n+1;
                      }
                      else if (temp == 'sunday') {
                        n = 0;
                      }
                      else if (temp == 'monday') {
                        n = 1;
                      }
                      else if (temp == 'tuesday') {
                        n = 2;
                      }
                      else if (temp == 'wednesday') {
                        n = 3;
                      }
                      else if (temp == 'thursday') {
                        n = 4;
                      }
                      else if (temp == 'friday') {
                        n = 5;
                      }
                      else if (temp == 'saturday') {
                        n = 6;
                      }
                    }

                    if (returnedEvent.length != 0) {

                        if (n == 0) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Sunday are " + returnedEvent[0].Sunday + "!" );
                        }
                        else if (n == 1) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Monday are " + returnedEvent[0].Monday + "!" );
                        }
                        else if (n == 2) {
                           sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Tuesday are " + returnedEvent[0].Tuesday + "!" );
                        }
                        else if (n == 3) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Wednesday are " + returnedEvent[0].Wednesday + "!" );
                        }
                        else if (n == 4) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Thursday are " + returnedEvent[0].Thursday + "!" );
                        }
                        else if (n == 5) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Friday are " + returnedEvent[0].Friday + "!" );
                        }
                        else if (n == 6) {
                            sendTextMessage(sender, response.result.parameters.buildingHours + "'s hours Saturday are " + returnedEvent[0].Saturday + "!" );
                        }
                    }
                    else {
                        sendTextMessage(sender, "Hmm, I don't have the hours of that building, could you try rewriting the building please?");
                    }
                });
                db.close();
            });
        }
        else if (response.result.action == "getGeneral") {
          if (response.result.parameters.generalCategories == 'directions') {
            sendLocationQuickRepliesMessage(sender, 'What building can I direct you to? Choose one of the more popular buildings below or ask by yourself with "Where is ___?" I understand 3 letter codes best.');
          }
          else if (response.result.parameters.generalCategories == 'hours') {
            sendHoursQuickRepliesMessage(sender, 'What building can I get you hours for? Choose one of the more popular options below or ask by yourself with "hours for _____?"');
          }
          else if (response.result.parameters.generalCategories == 'dining') {
            sendDiningQuickRepliesMessage(sender, 'Pick from the options below for which dining hall menu you want!');
          }
          else if (response.result.parameters.generalCategories == 'events') {
            // sendTextMessage(sender, "Sorry, the events functionality is currently not ready due to a recently found major bug. We are working on it!");
            sendEventQuickRepliesMessage(sender, 'Pick from the options below for what type of event you want!');
          }
        }
        else {
            sendTextMessage(sender, "Sorry, I couldn't understand that. Can you try rephrasing the question? Keep in mind I am in open beta.")
        }
        }
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sendMenuChoiceCard(senderID, diningHall) {
    messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Which meal do you want? (Mon - Fri)",
        "buttons":[
          {
            "type":"postback",
            "title":"Breakfast",
            "payload": diningHall + " breakfast"
          },
          {
            "type":"postback",
            "title":"Lunch",
            "payload": diningHall + " lunch"
          },
          {
            "type":"postback",
            "title":"Dinner",
            "payload": diningHall + " dinner"
          },
        ]
      }
    }
  }
  messageData2 = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Which meal do you want? (Weekend)",
        "buttons":[
          {
            "type":"postback",
            "title":"Brunch",
            "payload": diningHall + " brunch"
          },
          {
            "type":"postback",
            "title":"Dinner",
            "payload": diningHall + " dinner"
          },
        ]
      }
    }
  }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:senderID},
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
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:senderID},
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
    if (mealPreferences != 'none') {
      sendTextMessage(senderID, "preferences for " + mealPreferences + " listed.");
    }
    if (menu[0].stations.length == 0) {
      sendTextMessage(senderID, "Sorry, that meal time is not available for today. Please select the proper option in the below menu.");
      sendMenuChoiceCard(senderID, diningHall);
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
              if (j != menu[0].stations[i].options.length-1) {
              text += ', ';
              }
            }
          }
          else {
            thisStationHasItems = true;
            text += menu[0].stations[i].options[j].name;
            if (j != menu[0].stations[i].options.length-1) {
            text += ', ';
          }
            }
        }
        if (thisStationHasItems == true) {
        messageData = {
                text:text
            }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token:token},
            method: 'POST',
            json: {
                recipient: {id:senderID},
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
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:senderID},
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
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
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
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"Welcome! Below are a few ways you can use my chatbot services. Feel free to use this menu and type freehand! For more of my capabilities, type 'help'.",
        "buttons":[
          {
            "type":"postback",
            "title":"Directions",
            "payload":"What can you tell me about directions?"
          },
          {
            "type":"postback",
            "title":"Hours",
            "payload":"What can you tell me about building hours?"
          },
          {
            "type":"postback",
            "title":"Dining",
            "payload":"What can you tell me about dining hall menus?"
          }
        ]
      }
    }
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
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
      "quick_replies":[
        {
          "content_type":"text",
          "title":"VKC",
          "payload":"Where is VKC?"
        },
        {
          "content_type":"text",
          "title":"TCC",
          "payload":"Where is TCC?"
        },
        {
          "content_type":"text",
          "title":"THH",
          "payload":"Where is THH?"
        },
        {
          "content_type":"text",
          "title":"WPH",
          "payload":"Where is WPH?"
        },
        {
          "content_type":"text",
          "title":"RTH",
          "payload":"Where is RTH?"
        },
        {
          "content_type":"text",
          "title":"ADM",
          "payload":"Where is ADM?"
        },
        {
          "content_type":"text",
          "title":"SGM",
          "payload":"Where is SGM?"
        }
      ]
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
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
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Leavey hours",
          "payload":"Leavey hours"
        },
        {
          "content_type":"text",
          "title":"EVK hours",
          "payload":"EVK hours"
        },
        {
          "content_type":"text",
          "title":"Parkside hours",
          "payload":"Parkside hours"
        },
        {
          "content_type":"text",
          "title":"Cafe 84 hours",
          "payload":"Cafe 84 hours"
        },
        {
          "content_type":"text",
          "title":"Doheny hours",
          "payload":"Doheny hours"
        }
      ]
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
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
      "quick_replies":[
        {
          "content_type":"text",
          "title":"EVK menu",
          "payload":"EVK menu"
        },
        {
          "content_type":"text",
          "title":"Parkside menu",
          "payload":"Parkside menu"
        },
        {
          "content_type":"text",
          "title":"Cafe 84 menu",
          "payload":"Cafe 84 menu"
        }
      ]
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
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
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Academics",
          "payload":"ACADEMIC_EVENTS"
        },
        {
          "content_type":"text",
          "title":"Sports",
          "payload":"SPORT_EVENTS"
        },
        {
          "content_type":"text",
          "title":"Viterbi",
          "payload":"VITERBI_EVENTS"
        },
        {
          "content_type":"text",
          "title":"Dornsife",
          "payload":"DORNSIFE_EVENTS"
        },
        {
          "content_type":"text",
          "title":"Miscellaneous",
          "payload":"MISCELLANEOUS_EVENTS"
        }
      ]
  }
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
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

function sendDots(sender) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
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
    mongoose.connection.db.collection(collec, function (err, collection) {
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
      var d = new Date(utc + (3600000*-8));
      var dd = d.getDate();
      var mm = d.getMonth() + 1;
      var yyyy = d.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      var todayStringFormat = mm + '/' + dd + '/' + yyyy;

      // finds and modifies the proper code
      dataAnalytics.findAndModify({ "date" : todayStringFormat },{ rating: 1 },{ "$inc":{ "numberOfMessages" : number }},{ upsert: true }, function(err, doc){
        console.log('find and modified  ' +doc);
      });

      db.close();
  });
}

// Spin up the server
app.listen(app.get('port'),  function() {
    console.log('running on port', app.get('port'));
})
