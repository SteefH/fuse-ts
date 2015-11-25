var path = require('path'); 
require('ts-node').register({
  disableWarnings: true,
  project: path.resolve(__dirname, '..', 'tsconfig.json')
});

// require('better-require')();