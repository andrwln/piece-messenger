'use strict';

describe('Service: message', function () {

  // load the service's module
  beforeEach(module('pieceMessageApp'));

  // instantiate service
  var message;
  beforeEach(inject(function (_message_) {
    message = _message_;
  }));

  it('should do something', function () {
    expect(!!message).toBe(true);
  });

});
