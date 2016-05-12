var rollup       = require('rollup');
var hypothetical = require('..');


function resolve(promise, expected) {
  return promise.then(function(bundle) {
    var code = bundle.generate().code;
    var object = {};
    (new Function('object', code))(object);
    for(var key in expected) {
      if(!(key in object)) {
        throw Error("Expected object to have key \""+key+"\"!");
      }
      var ok = JSON.stringify(object[key]), ek = JSON.stringify(expected[key]);
      if(ok !== ek)  {
        throw Error("Expected object."+key+" to be "+ek+", not "+ok+"!");
      }
    }
    for(var key in object) {
      if(!(key in expected)) {
        throw Error("Didn't expect object to have key \""+key+"\"!");
      }
    }
  });
}

function reject(promise, message) {
  return promise.then(function() {
    throw Error("Promise was resolved when it should have been rejected!");
  }, function(reason) {
    if(message && reason.message.indexOf(message) === -1) {
      throw Error("Rejection message \""+reason.message+"\" does not contain \""+message+"\"!");
    }
  });
}


it("should let nothing through if no options are passed", function() {
  return reject(rollup.rollup({
    entry: './test/fixtures/a.js',
    plugins: [hypothetical()]
  }), "does not exist in the hypothetical file system");
});

it("should be able to simulate an entry file", function() {
  return resolve(rollup.rollup({
    entry: './x.js',
    plugins: [hypothetical({ files: { './x.js': 'object.key = false;' } })]
  }), { key: false });
});

it("should be able to simulate an entry file where one already exists", function() {
  return resolve(rollup.rollup({
    entry: './test/fixtures/a.js',
    plugins: [hypothetical({ files: { './test/fixtures/a.js': 'object.key = false;' } })]
  }), { key: false });
});

it("should handle an entry point that appears to be external", function() {
  return resolve(rollup.rollup({
    entry: 'x.js',
    plugins: [hypothetical({ files: { './x.js': 'object.key = false;' } })]
  }), { key: false });
});

it("should handle absolute paths", function() {
  return resolve(rollup.rollup({
    entry: '/x.js',
    plugins: [hypothetical({ files: { '/x.js': 'object.key = false;' } })]
  }), { key: false });
});
