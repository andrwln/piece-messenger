'use strict';

angular.module('pieceMessageApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase'
])
  .constant('FIREBASE_URL', 'https://snailmails.firebaseIO.com/')
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        template:'app/main/main.html',
        controller: 'MainCtrl'
      })
      .when('/register', {
        templateUrl: 'app/auth/register.html',
        controller: 'AuthCtrl'
      })
      .when('/messages/:messageId', {
        templateUrl: 'app/message/showmessage.html',
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });