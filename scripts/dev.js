var watch = require('node-watch');
var path = require('path');
var util = require('util');
var TEST_DIR = path.resolve(__dirname, '..', 'test');
var SRC_DIR = path.resolve(__dirname, '..', 'fuse');

var child_process = require('child_process');

function runIt() {
  console.log('Started at ' + Date().toString());
  var commands = [
    "rm -rf build coverage",
    "node_modules/.bin/tsc --project " + __dirname,
    "node_modules/.bin/istanbul cover --report text --report html --print detail -i 'build/**/*.js' --include-all-sources node_modules/.bin/_mocha -- build/test/index.js"
  ];
  try {
    child_process.execSync(commands.join(" && "), { stdio: [0, 1, 2]});
  } catch(e) {

  }
  console.log('Ended at ' + Date().toString());
}

runIt();
watch([TEST_DIR, SRC_DIR], function () {
  console.log();
  runIt();
});
