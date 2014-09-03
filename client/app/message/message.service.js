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
      getCurrent: function() {

        var user = User.getCurrent();
        var result;
        if(typeof user.activeMessage !== 'undefined') {

          ref.child(user.activeMessage).child("aggregate").once("value", function(snap) {
            if (snap.val() !== null) {
              return $rootScope.aggregate = snap.val().join(' ');
            }
          });
        }
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
            var messageId = user.activeMessage;
            var currmessage = messages.$child(user.activeMessage)
            var aggregate = currmessage.aggregate
            console.log(aggregate.join(' '))
            $rootScope.aggregate = aggregate.join(' ');
            aggregate.push(message.content);
            // aggregate = aggregate.join(' ')
            currmessage.$child('aggregate').$set(aggregate);

            if(typeof user.activeMessage !== 'undefined') {

              ref.child(user.activeMessage).child("aggregate").once("value", function(snap) {
                if (snap.val() !== null) {
                  return $rootScope.aggregate = snap.val().join(' ');
                }
              });
            }
            // var keys = messages.$child(user.activeMessage).$child('body');
            // var keysIndex = keys.$getIndex();
            // var compiled = [];
            // for (var i = 0; i < keysIndex.length; i++) {
            //   compiled.push(keys[keysIndex[i]].content);
            //   console.log(compiled);
            // }
            // var compiledMsg = compiled.join(' ');
            // var feedObj = {
            //   message: compiledMsg,
            //   id: messageId,
            // };
            // console.log(feedObj);
            // return feedObj;
          });
        }
      },
      next: function() {
        console.log('next message function called')
        var participants;
        var user = User.getCurrent();
        var current = user.activeMessage;
        var callCount = 0;
        $rootScope.userTurns=0;

        ref.child(current).once("value", function(snap) {
          participants = snap.val().participants;
          var currentUserIndex;
          $rootScope.userTurns++;
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