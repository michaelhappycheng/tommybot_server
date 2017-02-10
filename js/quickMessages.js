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
MESSAGES FUNCTIONS USED FOR TOMMY BOT
*/

module.exports = {

  sendLocationQuickRepliesMessage: function sendLocationQuickRepliesMessage(sender, text) {

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
  },

  sendHoursQuickRepliesMessage: function sendHoursQuickRepliesMessage(sender, text) {
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
  },

  sendDiningQuickRepliesMessage: function sendDiningQuickRepliesMessage(sender, text) {
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
  },

  sendEventQuickRepliesMessage: function sendEventQuickRepliesMessage(sender, text) {
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
  },

  sendDTQuickRepliesMessage: function sendDTQuickRepliesMessage(sender, text) {

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
}
