'use strict';

angular.module('pieceMessageApp')
  .controller('MainCtrl', function ($scope, Message, Auth, User) {
    $scope.messages = Message.all;
    $scope.message = {title: '', content: []};

    $scope.startMessage = function() {
      var user = User.getCurrent();
      var message = {
        title: $scope.message.title,
        body: [{user: user.md5_hash, content: $scope.message.content}],
        participants: $scope.participants,
        recipients: $scope.recipients
      }
      Message.create(message).then(function() {
        // console.log($scope.messageObj);
        $scope.message = {title: '', content: []};
      });
    };

    $scope.continueMessage = function() {
      var user = User.getCurrent();
      var message = {
        user: user.md5_hash,
        content: $scope.message.content
      }
      Message.add(message)
      // .then(function() {
      //   $scope.message = {};
      // })
    };

    $scope.logout = function() {
      Auth.logout();
    };

    $scope.participants = [];
    $scope.recipients = [];

    $scope.addRecipient = function() {
      $scope.recipients.push({});
      console.log($scope.recipients);
    };

    $scope.addParticipant = function() {
      $scope.participants.push({});
      console.log($scope.participants);
    };

  });