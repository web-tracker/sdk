describe("Test Environment", function () {
  var env;
  beforeEach(function () {
    env = new WebTracker.Environment;
  });
  it ("Environment can be detected", function () {
    var detected = env.detect();
    expect(detected).not.toBeNull();
    expect(detected.browser).not.toBeNull();
    expect(detected.browser._type).not.toBeNull();
    expect(detected.engine._type).not.toBeNull();
  });
  
});