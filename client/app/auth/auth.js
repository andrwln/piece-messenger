'use strict';

angular.module('pieceMessageApp')
  .constant('FIREBASE_URL', 'https://snailmails.firebaseIO.com/')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/messagecont', {
        templateUrl: 'app/main/messagecont.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'app/auth/auth.html',
        controller: 'AuthCtrl'
      });
  });
