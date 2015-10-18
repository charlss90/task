'use strict';
var path = require('path');

global.appRoot = path.resolve(__dirname);

exports.Task = require('./lib/parallel/Task');
