

'use strict';

goog.provide('Blockly.PERL.texts');

goog.require('Blockly.PERL');


Blockly.PERL['text'] = function(block) {
  // Text value.
  var code = Blockly.PERL.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.PERL.ORDER_ATOMIC];
};

Blockly.PERL['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.PERL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.PERL.valueToCode(block, 'TEXT',
      Blockly.PERL.ORDER_NONE) || '\'\'';
  return varName + ' .= ' + argument0 + ';\n';
};

Blockly.PERL['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.PERL.valueToCode(block, 'TEXT',
      Blockly.PERL.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ');\n';
};

