'use strict';

angular.module('pieceMessageApp')
  .factory('Feed',
    function ($firebase, FIREBASE_URL, User, Message) {
      var ref = new Firebase(FIREBASE_URL + 'feed');
      var feed = $firebase(ref);
      var messages = Message.all;

      var Feed = {
        all: feed,
        compile: function() {
          if (User.signedIn()) {
            var user = User.getCurrent();
            messages.$on("loaded", function() {
              if(user.activeMessage == null) {
                alert('This message has already been completed.')
                return }
              else {
                var messageId = user.activeMessage;
                var keys = messages.$child(user.activeMessage).$child('body');
                var keysIndex = keys.$getIndex();
                var compiled = [];
                for (var i = 0; i < keysIndex.length; i++) {
                  compiled.push(keys[keysIndex[i]].content);
                  console.log(compiled);
                }
                var compiledMsg = compiled.join(' ');
                var feedObj = {
                  message: compiledMsg,
                  id: messageId,
                };
                console.log(compiledMsg, feedObj);
                feed.$add(feedObj);

                console.log(User.all.$getIndex());
                var userIndex = User.all.$getIndex();
                var users = User.all;
                for (var j = 0; j < userIndex.length; j++) {
                  if (users.$child(userIndex[j]).activeMessage == messageId) {
                    users.$child(userIndex[j]).$remove('activeMessage')
                    }
                  console.log(users)
                  }
                }
              })
          }
        }
        // showFeed: function() {
        //   var user = User.getCurrent();
        //   messages.$on("loaded", function () {
        //     console.log(user);
        //     // var messageId = user.activeMessage;
        //     var keys = feed.$getIndex();
        //     for (var k = 0; k < keys.length; k++) {
        //       if(feed.$child(keys[k]) == messageId) {
        //         return feed.$child(keys[k]).message;
        //       }
        //     }
        //   })
        // }
    };
    return Feed;
  });