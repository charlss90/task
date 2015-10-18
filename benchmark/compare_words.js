var Task = require('../.').Task;
var util = require('util');
var fs = require('fs');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var moment = require('moment');

var bus = new EventEmitter();


fs.readFile('./data/categories.json', {encoding: 'utf8'}, (err, data) => {
  if (err) throw err;
  try {
    var categories = JSON.parse(data);
    benchmark(categories);
  } catch (err) {
    console.log(err);
  }
});


function benchmark(categories) {
  util.log('Start tasks');
  util.log(moment().format('MMMM Do YYYY, h:mm:ss:ms a'))
  withTask(categories);
}


function withTask(categories) {

  Task(categories).config({
    sandbox: {
      natural: {type: 'require'}
    },
    tasks: 4
  }).map((x) => {
    var word = x.name;
    return x.hints.map(h => natural.DiceCoefficient(h, word));
  }).then((result) => {
    util.log('Finish process');
    // console.log(result.length);
    util.log(moment().format('MMMM Do YYYY, h:mm:ss:ms a'));

  }).catch((err) => {console.log(err);});
}


function traditionalMap(category) {
  var natural = require('natural');

  var total = category.hints.map((x) => {
    return natural.DiceCoefficient(x, category.name)
  });
  // console.log(total.length);
}
