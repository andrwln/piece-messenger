'use strict';

angular.module('pieceMessageApp')
  .controller('MainCtrl', function ($rootScope, $scope, Message, Auth, User, Feed, $location) {
    $scope.messages = Message.all;
    $scope.message = {title: '', content: []};
    $scope.feed = Feed.all;
    var userArr = [];

    $rootScope.$watch("currentUser", function(newval, oldval) {
        if (newval) {
          $scope.checkView = function() {
            var user = User.getCurrent();
            return user.turn;
          }
      }
    })

    $rootScope.$watch("currentUser", function(newval, oldval) {
        if (newval) {
          $scope.checkTurn = function () {
            var user = User.getCurrent();
            if (typeof user.activeMessage === 'undefined') {
              $location.path('/');
            }
            else {
              var message = user.activeMessage;
              var messages = Message.messageRef;
              var users = User.usersRef;
              var participants;
              var active;
              var newactive;
              messages.child(message).child('participants').once("value", function(snap) {
                participants = snap.val();
              })
              for (var i = 0; i < participants.length; i++) {
                users.child(participants[i].name).child('turn').once("value", function(snap) {
                  active = snap.val();
                  if (active === true) {
                    newactive = participants[i].name;
                  }
                })
              }
              return newactive;
            }
        }
      }
    })

    $scope.startMessage = function() {
      var user = User.getCurrent();
      if (typeof user.activeMessage === 'undefined') {
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
          $location.path('/messagecont/')
        });
      }
      else {
        alert('You are already active in an existing message!')
      }
    };
    $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        $scope.continueMessage = function() {
          var user = User.getCurrent();
          var message = {
            user: user.md5_hash,
            content: $scope.message.content
          }
          Message.add(message);
          Message.next();
        };
      }
    })


    $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        if (User.signedIn()) {
          $scope.currFeed = Message.getCurrent();

          $scope.allUsers = function() {
            var availableUsers = []
            var userObj;
            var user = User.getCurrent();
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
        $scope.$watch("allUsers", function(newval, oldval) {
          if (newval) {
            $scope.allUsers();
          }
        })
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

    $rootScope.$watch('currentUser', function(newval, oldval) {
      if (newval) {

        $scope.completeMsg = function() {
          var user = User.getCurrent();
          user.$child('turn').$set(false);
          console.log('submitting message')
          Feed.compile();
          $location.path('/');
          }
        }
      })

  });