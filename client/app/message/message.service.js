'use strict';

angular.module('pieceMessageApp')
  .factory('Message',
  function ($firebase, FIREBASE_URL, User) {
    var ref = new Firebase(FIREBASE_URL + 'messages');
    var messages = $firebase(ref);
    // messages.$on("loaded", function() {
    //   var keys = messages.$child('-JTE5DXZkKz5WpmKsEuJ').$child('body');
    //   var keysIndex = messages.$child('-JTE5DXZkKz5WpmKsEuJ').$child('body').$getIndex();
    //   console.log(keysIndex);
    //   var compiled = [];
    //   for(var i = 0; i < keysIndex.length; i++) {
    //     console.log(keys[keysIndex[i]].content);
    //     compiled.push(keys[keysIndex[i]].content);

    //     console.log(compiled);
    //   }
    //   var compiledMsg = compiled.join(' ');
    //   console.log(compiledMsg);
    // })

    var Message = {
      all: messages,
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
      },
      add: function(message) {
        if (User.signedIn()) {
          var user = User.getCurrent();
          console.log(user.activeMessage);
          var body = messages.$child(user.activeMessage).$child('body')
          console.log(body);
          body.$add(message);
        }
      },
      find: function(messageId) {
        return messages.$child(messageId);
      }
    };

    return Message;
  });
