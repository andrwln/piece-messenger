'use strict';

angular.module('pieceMessageApp')
  .factory('Feed',
    function ($firebase, FIREBASE_URL, User, Message) {
    var ref = new Firebase(FIREBASE_URL + 'feed');
    var messages = $firebase(ref);
    // console.log(Message.all.$child('body'))

    var Feed = {
      all: messages,
      compile: function() {
        if (User.signedIn()) {

        }
      },
      create: function(message) {
        console.log(User.signedIn());
        if (User.signedIn()) {
          var participants = message.participants;

          return messages.$add(message).then(function (ref) {
            var user = User.getCurrent();
            User.all.$child(user.username).$update({activeMessage: ref.name()});
            for(var i = 0; i < participants.length; i++) {
              console.log(participants[i].name)
              User.all.$child(participants[i].name).$update({activeMessage: ref.name()})
            }
          })
        }
      }
      // add: function(message) {
      //   if (User.signedIn()) {
      //     var user = User.getCurrent();
      //     console.log(user.activeMessage);
      //     var body = messages.$child(user.activeMessage).$child('body')
      //     console.log(body);
      //     body.$add(message);
      //   }
      // },
      // find: function(messageId) {
      //   return messages.$child(messageId);
      // }
    };

    return Feed;
  });