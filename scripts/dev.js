var watch = require('node-watch');
var path = require('path');

var TEST_DIR = path.resolve(__dirname, '..', 'test');
var SRC_DIR = path.resolve(__dirname, '..', 'fuse');
var child_process = require('child_process');

function runIt() {
  console.log(Date(), "running");
  var command = "rm -rf build coverage && node_modules/.bin/tsc && node_modules/.bin/istanbul cover --report text --print detail -i 'build/**/*.js' --include-all-sources node_modules/.bin/_mocha -- build/test/index.js"; 
  try {

    child_process.execSync(command, {
      stdio: [
        0, // use parents stdin for child
        1, // pipe child's stdout to parent
        2 // direct child's stderr to a file
      ]
    });
  } catch(e) {

  }
}

runIt();
watch([TEST_DIR, SRC_DIR], function () {
  runIt();
});
