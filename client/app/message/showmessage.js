'use strict';

angular.module('pieceMessageApp')
  .controller('ShowMsgCtrl', function($scope, $routeParams, Feed) {
    $scope.message = Feed.find($routeParams.messageId);

});