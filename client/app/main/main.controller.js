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
          console.log(Message.checkTurn());
          $scope.checkTurn = Message.checkTurn();
            if (typeof user.activeMessage === 'undefined') {
              $location.path('/');
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
          console.log(Message.getCurrent());
          $scope.allUsers = function() {
            var availableUsers = []
            var userObj;
            var user = User.getCurrent();
            User.usersRef.once("value", function(snap) {
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
          // user.$child('turn').$set(false);
          console.log('submitting message')
          Feed.compile();
          $location.path('/');
          }
        }
      });

    $rootScope.$watch('currentUser', function(newval, oldval) {
      if (newval) {

        $scope.addAndComplete = function() {
          var user = User.getCurrent();
          // user.$child('turn').$set(false);
          console.log('submitting message')
          var message = {
            user: user.md5_hash,
            content: $scope.message.content
          }
          Message.add(message);
          Feed.compile();
          $location.path('/');
          }
        }
      });

    $scope.upVotePost = function (postId, upVoted) {
      if (upVoted) {
        Feed.clearVote(postId, upVoted);
      } else {
        Feed.upVote(postId);
      }
    };

    $scope.downVotePost = function (postId, downVoted) {
      if (downVoted) {
        Feed.clearVote(postId, !downVoted);
      } else {
        Feed.downVote(postId);
      }
    };

    $scope.upVoted = function (post) {
      return Feed.upVoted(post);
    };

    $scope.downVoted = function (post) {
      return Feed.downVoted(post);
    };

  });