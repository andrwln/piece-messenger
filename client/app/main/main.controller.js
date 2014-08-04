'use strict';

angular.module('pieceMessageApp')
  .controller('MainCtrl', function ($rootScope, $scope, Message, Auth, User, Feed) {
    $scope.messages = Message.all;
    $scope.message = {title: '', content: []};
    $scope.feed = Feed.all;
    var userIndex = 0;
    var userArr = [];

    $rootScope.$watch("currentUser", function(newval, oldval) {
        if (newval) {
          $scope.checkView = function() {
            var user = User.getCurrent();
            console.log(user);
            return user.turn;
          }
      }
    })

    $scope.startMessage = function() {
      var user = User.getCurrent();
      console.log(user);
      var message = {
        title: $scope.message.title,
        body: [{user: user.md5_hash, content: $scope.message.content}],
        participants: $scope.participants,
        recipients: $scope.recipients,
        aggregate: [$scope.message.content]
      }
      message.participants.push({name: user.username});
      Message.create(message).then(function() {
        Message.next();
        $scope.message = {title: '', content: []};
      });
    };

    $scope.continueMessage = function() {
      var user = User.getCurrent();
      var message = {
        user: user.md5_hash,
        content: $scope.message.content
      }
      Message.add(message);
      Message.next();
    };

    $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        console.log("USER", newval);
        console.log(Message.getCurrent())
        $scope.currFeed = Message.getCurrent();

        $scope.allUsers = function() {
          var availableUsers = []
          var userObj;
          var user = User.getCurrent();
          console.log(user);
          User.usersRef.on("value", function(snap) {
              userObj = snap.val();
              for(var key in userObj) {
                if (typeof userObj[key].activeMessage === 'undefined' && userObj[key].username !== user.username) {
                  availableUsers.push(userObj[key].username);
                }
              }
            })
          $scope.availableUsers = availableUsers;
          return availableUsers;
        }
      }
    });

    $scope.logout = function() {
      Auth.logout();
    };

    $scope.participants = [];
    $scope.recipients = [];

    $scope.addRecipient = function() {
      $scope.recipients.push({});
    };

    $scope.addParticipant = function() {
      $scope.participants.push({});
    };

    $scope.completeMsg = function() {
      console.log('submitting message')
      Feed.compile();
    }

  });