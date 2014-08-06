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
              result = snap.val().join(' ');
            }
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
            var messageId = user.activeMessage;
            var currmessage = messages.$child(user.activeMessage)
            var aggregate = currmessage.aggregate
            console.log(aggregate)
            aggregate.push(message.content);
            // aggregate = aggregate.join(' ')
            currmessage.$child('aggregate').$set(aggregate);
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

        console.log(user.$child('turn'));
        // ref is message ref
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


            // if(participants[i].name == user.username) {
              // if(i+1 < participants.length) {
              //   console.log('less than length is getting called')
              //   callCount++;
              //   console.log(callCount);
              //   var name = participants[i+1].name;
              //   console.log(name);
              //   user.$child('turn').$set(false).then(function () {
              //       User.usersRef.child(name).child('turn').set(true);
              //       console.log(user.$child('turn'));
              //       console.log(User.usersRef.child(name).child('turn'));
              //   })
              // }
              // else {
              //   var name = participants[0].name;
              //   console.log(name);
              //   console.log(user);
              //   user.$child('turn').$set(false).then(function () {
              //     console.log(user.$child('turn'));
              //       User.usersRef.child(name).child('turn').set(true);

              //       console.log(User.usersRef.child(name).child('turn'));
              //     })
              // }
            // }
        })
      },
      find: function(messageId) {
        return messages.$child(messageId);
      }
    };

    return Message;
  });