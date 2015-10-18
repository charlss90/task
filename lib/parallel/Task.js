
'use strict';
var fork = require('child_process').fork;
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var cpus = require('os').cpus();
var util = require('util');


const WORK_FILE_PATH = path.resolve(appRoot, 'lib/parallel/work.js');


var validateList = function (list) {
  if (!(list) || !(list instanceof Array)) {
    throw new TypeError('Unexpected Argument:: object should be array');
  }

  if (list.length === 0) {
    throw new TypeError('Unexpected Argument:: list should be contain more elements');
  }
};


var validateConfig = function (config) {
  if (!config) {
    throw new TypeError('Unexpected Argument:: undefined config');
  }

  // if (config.sandbox) {
  //
  // }
};


var validateMethod = function (method) {
  if (!(method) || !util.isFunction(method)) {
    throw new TypeError('Unexpected Argument:: task should be a function');
  }
};


module.exports = function (list) {
  validateList(list);


  var sandbox = null;
  var tasks = cpus.length;
  var workers = [];
  var results = [];
  var workItemIndex = 0;
  var bus = new EventEmitter();


  var killChilds = function() {
    if (!workers) {
      return false;
    }

    workers.forEach((child) => {
      child.kill();
    });

    return true;
  };
  bus.on('finish', killChilds);


  var buildChilds = function (method) {
    for (var i = 0; i < tasks; i += 1) {
        let child = createFork();

        child.on('message', (childEvent) => {

          if (childEvent.type === 'result') {
            results.push(childEvent.data);
          }

          nextItem(child);

          if (isFinishTask()) {
            bus.emit('finish', results);
          }
        });

        child.send({type: 'method', data: (method).toString()});

        workers.push(child);
    }
  };


  var createFork = function () {
    if (!sandbox) {
      throw new TypeError('Unexpected Argument:: cannot createFork without sandbox');
    }

    return fork(WORK_FILE_PATH, {
      env: {
        sandbox: JSON.stringify(sandbox)
      }
    });
  };


  var nextItem = function (child) {
    if (workItemIndex < list.length && child) {
      child.send({
        type: 'item',
        data: JSON.stringify(getCurrentListItem())
      });
      workItemIndex += 1;
    }
  };


  var getCurrentListItem = function () {
    return list[workItemIndex];
  };


  var isFinishTask = function () {
      return results.length === list.length;
  };


  return {
    config: function(config) {
      validateConfig(config);

      if (config.sandbox) {
        sandbox = config.sandbox;
      }

      if (config.tasks) {
        tasks = config.tasks;
      }

      return this;
    },


    map: function (method) {
      validateMethod(method);

      buildChilds(method);
      workers.forEach(nextItem);

      return this;
    },


    then: function (resolve) {
      validateMethod(resolve);

      bus.on('finish', resolve);
      return this;
    },


    catch: function (reject) {
      validateMethod(reject);

      bus.on('error', reject);
      return this;
    },

    on: bus.on
  };
};
