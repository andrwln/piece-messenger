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
        },
        upVote: function (postId) {
          if (User.signedIn()) {
            var user = User.getCurrent();
            var post = feed.$child(postId);

            post.$child('upvotes').$child(user.username).$set(user.username).then(function () {
                user.$child('upvotes').$child(postId).$set(postId);
                post.$child('downvotes').$remove(user.username);
                user.$child('downvotes').$remove(postId);

                post.$child('score').$transaction(function (score) {
                  if (!score) {
                    return 1;
                  }

                  return score + 1;
                });
              });
          }
        },
        downVote: function (postId) {
          if (User.signedIn()) {
            var user = User.getCurrent();
            var post = feed.$child(postId);

            post.$child('downvotes').$child(user.username).$set(user.username).then(function () {
                user.$child('downvotes').$child(postId).$set(postId);
                post.$child('upvotes').$remove(user.username);
                user.$child('upvotes').$remove(postId);

                post.$child('score').$transaction(function (score) {
                  if (score === undefined || score === null) {
                    return -1;
                  }

                  return score - 1;
                });
              });
          }
        },
        clearVote: function (postId, upVoted) {
          if (User.signedIn()) {
            var user = User.getCurrent();
            var username = user.username;
            var post = feed.$child(postId);

            post.$child('upvotes').$remove(username);
            post.$child('downvotes').$remove(username);
            user.$child('upvotes').$remove(postId);
            user.$child('downvotes').$remove(postId);
            post.$child('score').$transaction(function (score) {
              if (upVoted) {
                return score - 1;
              } else {
                return score + 1;
              }
            });
          }
        },
        upVoted: function (post) {
          if (User.signedIn() && post.upvotes) {
            return post.upvotes.hasOwnProperty(User.getCurrent().username);
          }
        },
        downVoted: function (post) {
          if (User.signedIn() && post.downvotes) {
            return post.downvotes.hasOwnProperty(User.getCurrent().username);
          }
        }
    };
    return Feed;
  });