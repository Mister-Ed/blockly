

'use strict';

goog.provide('Blockly.PERL.lists');

goog.require('Blockly.PERL');


Blockly.PERL['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['()', Blockly.PERL.ORDER_ATOMIC];
};

Blockly.PERL['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.PERL.valueToCode(block, 'ADD' + n,
        Blockly.PERL.ORDER_COMMA) || '';
  }
  code = '(' + code.join(', ') + ')';
  return [code, Blockly.PERL.ORDER_ATOMIC];
};

Blockly.PERL['lists_length'] = function(block) {
  // array size 
  var argument0 = Blockly.PERL.valueToCode(block, 'VALUE',
      Blockly.PERL.ORDER_FUNCTION_CALL) || '\'\'';
  return ['scalar (' + argument0 + ');', Blockly.PERL.ORDER_FUNCTION_CALL];
};

Blockly.PERL['lists_isEmpty'] = function(block) {
  // is the array empty ?
  var argument0 = Blockly.PERL.valueToCode(block, 'VALUE',
      Blockly.PERL.ORDER_FUNCTION_CALL) || 'array()';
  return ['! ' + argument0 + ')', Blockly.PERL.ORDER_FUNCTION_CALL];
};

