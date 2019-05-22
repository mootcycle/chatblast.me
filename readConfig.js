/**
 * Reads in a JSON config file.
 **/

let debugMode = process.argv.indexOf('--debug') != -1;

const fs = require('fs');
const path = require('path');
const config = {};

/**
 * Does the work of reading a json config file.
 * @param {String} configPath The path to the json file to read.
 */
function readConfigFile(configPath) {
  configPath = path.resolve(configPath);
  let file;

  if (fs.existsSync(configPath)) {
    console.log('Loading values from: ' + path.resolve(configPath));
    try {
      file = JSON.parse(fs.readFileSync(configPath));
      for (const s in file) {
        if ({}.hasOwnProperty.call(file, s)) {
          config[s] = file[s];
        }
      }
    } catch (err) {
      console.log('Error parsing JSON: ' + err);
      process.exit();
    }
  } else {
    console.log('Config file not found: ' + configPath);
    process.exit();
  }
}

/**
 * Gets the path to the config file by checking the node arguments.
 * @return {String} The file path.
 */
function getPath() {
  if (debugMode || /test/.exec(process.env.NODE_ENV)) {
    return 'config-debug.json';
  } else {
    if (process.argv.indexOf('-c') != -1) {
      return process.argv[process.argv.indexOf('-c') + 1];
    }
    throw new Error('No config file specified with -c');
  }
}

/**
 * Forces debug mode to on.
 */
function forceDebug() {
  debugMode = true;
  readConfigFile(getPath());
}

readConfigFile(getPath());

exports.config = config;
exports.forceDebug = forceDebug;
