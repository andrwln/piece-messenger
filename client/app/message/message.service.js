'use strict';

angular.module('pieceMessageApp')
  .factory('Message',
  function ($firebase, FIREBASE_URL, User, $rootScope) {
    var ref = new Firebase(FIREBASE_URL + 'messages');
    var messages = $firebase(ref);

    var Message = {
      all: messages,
      messageRef: ref,
      getCurrent: function() {
        var user = User.getCurrent();
        console.log(user);
        var result;

        if(typeof user.activeMessage !== 'undefined') {
          ref.child(user.activeMessage).child("aggregate").on("value", function(snap) {
            if (snap.val() !== null) {
              result = snap.val().join(' ');
            }
            // $scope. -- only thing to look out for when just using firebase instead of angularfire is to call $scope.$apply() if you ever declare anything in $scope.
            // $scope.$apply();
          });
        }
        return result;
        // messages.$child(user.activeMessage).$child("aggregate").$on("value", function(snap) {
        //   console.log("EVENT", snap);
        //   debugger;
        //   // console.log("VALUE", snap.val());
        // });

        // return messages.$child(user.activeMessage).aggregate.join(' ');
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
        console.log(current);
        user.$child('turn').$set(false);
        ref.child(current).on("value", function(snap) {
          participants = snap.val().participants;
          console.log(participants);
          for (var i = 0; i < participants.length; i++) {
            console.log(participants[i].name);
            console.log(user.username);
            if(participants[i].name == user.username) {
              if(i+1 < participants.length) {
                var name = participants[i+1].name;
                User.usersRef.child(name).child('turn').set(true);
                console.log(User.usersRef)
              }
              else {
                var name = participants[0].name;
                User.usersRef.child(name).child('turn').set(true);
              }
            }
          }
        })
      },
      find: function(messageId) {
        return messages.$child(messageId);
      }
    };

    return Message;
  });
