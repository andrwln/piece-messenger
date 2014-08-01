'use strict';

describe('Service: feed', function () {

  // load the service's module
  beforeEach(module('pieceMessageApp'));

  // instantiate service
  var feed;
  beforeEach(inject(function (_feed_) {
    feed = _feed_;
  }));

  it('should do something', function () {
    expect(!!feed).toBe(true);
  });

});
