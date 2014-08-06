'use strict';

angular.module('pieceMessageApp')
  .factory('Message',
  function ($firebase, FIREBASE_URL, User, $rootScope) {
    console.log(User.all);
    var ref = new Firebase(FIREBASE_URL + 'messages');
    var messages = $firebase(ref);

    var Message = {
      all: messages,
      messageRef: ref,
      checkTurn: function() {
        var user = User.getCurrent();
        var message = user.activeMessage;
        var messages = ref;
        var users = User.usersRef;
        var participants;
        var active;
        var newactive;
        messages.child(message).child('participants').on("value", function(snap) {
          participants = snap.val();
          console.log(participants)
        })
        for (var i = 0; i < participants.length; i++) {
          users.child(participants[i].name).child('turn').once("value", function(snap) {
            active = snap.val();
            console.log(active);
            if (active === true) {
              newactive = participants[i].name;
            }
          })
        }
        console.log(newactive);
        return newactive;
      },
      getCurrent: function() {
        var user = User.getCurrent();
        var result;
        if(typeof user.activeMessage !== 'undefined') {
          ref.child(user.activeMessage).child("aggregate").once("value", function(snap) {
              result = snap.val().join(' ');
              console.log(result);
          });
        }
        return result;
      },
      create: function(message) {
        var user = User.getCurrent();
        console.log(User.signedIn());
        if (User.signedIn()) {
          var participants = message.participants;

          return messages.$add(message).then(function (ref) {

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
          console.log(user);
          var body = messages.$child(user.activeMessage).$child('body')
          console.log(body);
          body.$add(message).then(function(ref) {
            if (typeof user.activeMessage !== 'undefined') {
              var messageId = user.activeMessage;
              var currmessage = messages.$child(user.activeMessage);
              var aggregate = currmessage.aggregate;
              console.log(aggregate)
              aggregate.push(message.content);
              currmessage.$child('aggregate').$set(aggregate);
            };
          });
        }
      },
      next: function() {
        console.log('next message function called')
        var participants;
        var user = User.getCurrent();
        var current = user.activeMessage;
        var callCount = 0;

        console.log(user.$child('turn'));
        ref.child(current).once("value", function(snap) {
          participants = snap.val().participants;
          console.log(participants);
          var currentUserIndex;
          for (var i = 0; i < participants.length; i++) {
            if(participants[i].name === user.username) {
              currentUserIndex = i;
            }
            User.usersRef.child(participants[i].name).child('turn').set(false);
          }
          var nextUserIndex = (currentUserIndex+1) % participants.length;
          User.usersRef.child(participants[nextUserIndex].name).child('turn').set(true);
        })
      },
      find: function(messageId) {
        return messages.$child(messageId);
      }
    };

    return Message;
  });
