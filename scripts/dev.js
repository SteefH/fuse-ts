var watch = require('node-watch');
var path = require('path');
var util = require('util');
var TEST_DIR = path.resolve(__dirname, '..', 'test');
var SRC_DIR = path.resolve(__dirname, '..', 'fuse');
var child_process = require('child_process');

function runIt() {
  console.log('Started at ' + Date().toString());
  var command = "rm -rf dist coverage && node_modules/.bin/tsc && node_modules/.bin/istanbul cover --report text --report html --print detail -i 'dist/**/*.js' --include-all-sources node_modules/.bin/_mocha -- dist/test/index.js";
  try {
    child_process.execSync(command, { stdio: [0, 1, 2]});
  } catch(e) {

  }
  console.log('Ended at ' + Date().toString());
}

runIt();
watch([TEST_DIR, SRC_DIR], function () {
  console.log();
  runIt();
});
