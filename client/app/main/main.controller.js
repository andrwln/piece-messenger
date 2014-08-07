'use strict';

angular.module('pieceMessageApp')
  .controller('MainCtrl', function ($rootScope, $scope, Message, Auth, User, Feed, $location) {
    $scope.messages = Message.all;
    $scope.message = {title: '', content: []};
    $scope.feed = Feed.all;
    $scope.hideAggregate = false;
    var userArr = [];

    $rootScope.$watch("currentUser", function(newval, oldval) {
        if (newval) {
          $scope.checkView = function() {
            var user = User.getCurrent();
            return user.turn;
          }
          $scope.checkActive = function() {
            var user = User.getCurrent();
            if(typeof user.activeMessage !== 'undefined' && !user.turn) {
              return true;
            }
            else {
              return false;
            }
          }
          $scope.activeView = function() {
            var user = User.getCurrent();
            return user.activeMessage;
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
                for (var i = 0; i < participants.length; i++) {
                users.child(participants[i].name).child('turn').once("value", function(snap) {
                  active = snap.val();
                  if (active === true) {
                    newactive = participants[i].name;
                  }
                })
              }
              })
              return newactive;
            }
        }
      }
    })

    $scope.startMessage = function() {
      console.log($scope.participants);

      if($scope.participants.length === 0 || typeof $scope.participants[0].name === 'undefined') {
        alert('Please add participants to the message!');
        return;
      };
      if ($scope.message.content.length === 0) {
        alert('Start the message with a couple words!');
        return;
      }
      var user = User.getCurrent();
      var nameOccurance = 0;
      for (var i = 0; i < $scope.participants.length; i++) {
        for(var j = 0; j < $scope.participants.length; j++) {

          if ($scope.participants[i].name === $scope.participants[j].name) {
            nameOccurance++;
          }
        }
          if (nameOccurance > 1) {
            alert($scope.participants[i].name + ' is included twice. Each user can only be included once in the message.')
            return
          }
          else {
            nameOccurance = 0;
          }
      }
       if (typeof user.activeMessage === 'undefined') {
        var message = {
          title: $scope.message.title,
          body: [{user: user.md5_hash, content: $scope.message.content}],
          participants: $scope.participants,
          recipient: $scope.recipient,
          aggregate: [$scope.message.content]
        }
        message.participants.push({name: user.username});
        Message.create(message).then(function() {
          Message.next();
          $scope.message = {title: '', content: []};
        });
      }
      else {
        alert('You are already active in an existing message!')
      }
    };
    $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        $scope.continueMessage = function() {
          console.log($scope.message.content.length);
          if($scope.message.content.length === 0) {
            alert('Enter an addition to the message or complete the message without adding a submission.')
          }
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

    $scope.showAggregate = function() {
      $scope.hideAggregate = true;
      $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        if (User.signedIn()) {
          Message.getCurrent();
          $rootScope.$watch("aggregate", function(newval, oldval) {
            if(newval) {
              $scope.currFeed = newval;
              }
            })
          }
        }
      })
    }

    $rootScope.$watch("currentUser", function(newval, oldval) {
      if(newval) {
        if (User.signedIn()) {
          // Message.getCurrent();
          // $rootScope.$watch("aggregate", function(newval, oldval) {
          //   if(newval) {
          //     console.log(newval);
          //     $scope.currFeed = newval;
          //   }
          // })

          $scope.allUsers = function() {
            var availableUsers = []
            var userObj;
            var user = User.getCurrent();
            User.usersRef.once("value", function(snap) {
                userObj = snap.val();
                for(var key in userObj) {
                  if (typeof userObj[key].activeMessage === 'undefined' && userObj[key].username !== user.username) {
                    availableUsers.push(userObj[key].username);
                    $scope.availableUsers = availableUsers;
                  }
                }
              });
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
      console.log($scope.participants);
      if ($scope.participants.length > 0) {
        $scope.showRemove = true;
      }
    };

    $scope.removeParticipant = function() {
      $scope.participants.pop();
      if ($scope.participants.length === 0) {
        $scope.showRemove = false;
      }
    }

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
      });

    $rootScope.$watch('currentUser', function(newval, oldval) {
      if (newval) {

        $scope.addAndComplete = function() {
          var user = User.getCurrent();
          user.$child('turn').$set(false);
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