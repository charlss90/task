'use strict';
var assert = require('assert');
var task = require('../../lib/parallel');

describe('task Should', () => {

  it('a + b should be 3', ()  => {
    var a = 1, b = 2;
    var result = a + b;
    assert.equal(result, 3, '');
  });

  describe('#call task', () => {

    it('throw error when call task given an invalid list', () => {
      // Act & Assert
      assert.throws(() => {
        task();
      }, 'task throw a error when call without list');
    });


    it('throw error when call task given an invalid list object', () => {
      // Arrange
      let invalidList= {};

      // Assert & Act
      assert.throws(() => {
        task(invalidList);
      }, 'task throw a error when call with list object');
    });
  });

});
