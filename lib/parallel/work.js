'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var vm = require('vm');


var env = process.env || {};


var bus = new EventEmitter();
var method = null;
var sandbox = {};


if (env.sandbox) {
    sandbox = JSON.parse(env.sandbox);
    Object.keys(sandbox).forEach((k) => {
      if (typeof sandbox[k] === 'object') {
        if (sandbox[k].type === 'require') {
          sandbox[k] = require(sandbox[k].packageName || k);
        }
      }
    });
}


bus.on('itemRequest', (item) => {
  if (!method) {
    throw new Error('Inconsistent Clousure:: method is not defined');
  }

  sandbox.item = JSON.parse(item);
  var context = vm.createContext(sandbox);
  var script = new vm.Script(`var action = ${method}; action(item);`);
  let result = script.runInContext(context);

  process.send({type: 'result', data: result});
});

process.on('message', (processEvent) => {

  if (processEvent.type === 'method') {
    method = processEvent.data;
  } else if (processEvent.type === 'item') {
    bus.emit('itemRequest', processEvent.data);
  }
});
