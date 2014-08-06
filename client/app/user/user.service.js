'use strict';

angular.module('pieceMessageApp')
  .factory('User', function ($firebase, FIREBASE_URL, Auth, $rootScope) {
  var ref = new Firebase(FIREBASE_URL + 'users');

  var users = $firebase(ref);

  function setCurrentUser (username) {
    $rootScope.currentUser = User.findByUsername(username);
  }

  var User = {
    create: function (authUser, username) {
      users[username] = {
        md5_hash: authUser.md5_hash,
        username: username,
        $priority: authUser.uid,
        turn: false
      }
      users.$save(username).then(function () {
        console.log(users);
        setCurrentUser(username);
      });
    },
    usersRef: ref,
    findByUsername: function (username) {
      if (username) {
        return users.$child(username);
      }
    },
    getCurrent: function () {
      return $rootScope.currentUser;
    },
    signedIn: function () {
      return $rootScope.currentUser !== undefined;
    },
    all: users
  };


  $rootScope.$on('$firebaseSimpleLogin:login', function (e, authUser) {
    console.log("Logging in event", authUser.uid);
    var query = $firebase(ref.startAt(authUser.uid).endAt(authUser.uid));

    query.$on('loaded', function () {
      console.log('setting current user event', query.$getIndex())
      setCurrentUser(query.$getIndex()[0]);
      console.log(query.$getIndex());
    });
  });

  $rootScope.$on('$firebaseSimpleLogin:logout', function() {
    delete $rootScope.currentUser;
  });
  return User;
  });
