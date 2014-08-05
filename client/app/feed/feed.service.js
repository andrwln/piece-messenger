'use strict';

angular.module('pieceMessageApp')
  .factory('Feed',
    function ($firebase, FIREBASE_URL, User, Message, $http) {
      var ref = new Firebase(FIREBASE_URL + 'feed');
      var feed = $firebase(ref);
      var messages = Message.all;

      var Feed = {
        all: feed,
        find: function (messageId) {
          return feed.$child(messageId);
        },
        compile: function() {
          if (User.signedIn()) {
            var user = User.getCurrent();
            var messagesref = Message.messageRef;
            var contributors;
            messages.$on("loaded", function() {
              if(user.activeMessage == null) {
                alert('This message has already been completed.')
                return }
              else {
                var messageId = user.activeMessage;
                var keys = messages.$child(user.activeMessage).$child('body');
                messagesref.child(messageId).child('participants').once("value", function(snap) {
                  contributors = snap.val();
                })
                var keysIndex = keys.$getIndex();
                var compiled = [];
                for (var i = 0; i < keysIndex.length; i++) {
                  compiled.push(keys[keysIndex[i]].content);
                }
                var compiledMsg = compiled.join(' ');
                var feedObj = {
                  message: compiledMsg,
                  id: messageId,
                  contributors: contributors
                };
                $http.post('/twilio/sendSMS', feedObj).success(function(sms) {
                  console.log(sms);
                });
                feed.$add(feedObj);
                var userIndex = User.all.$getIndex();
                var users = User.all;
                for (var j = 0; j < userIndex.length; j++) {
                  if (users.$child(userIndex[j]).activeMessage == messageId) {
                    users.$child(userIndex[j]).$remove('activeMessage')
                    }
                  }
                }
              })
          }
        }
    };
    return Feed;
  });