
'use strict';

goog.provide('Blockly.PERL.variables');

goog.require('Blockly.PERL');


Blockly.PERL['variables_get'] = function(block) {
    // Variable getter.
    var code = Blockly.PERL.variableDB_.getName(block.getFieldValue('VAR'),
        Blockly.Variables.NAME_TYPE);
    return [code, Blockly.PERL.ORDER_ATOMIC];
};

Blockly.PERL['variables_set'] = function(block) {
    // Variable setter.
    var argument0 = Blockly.PERL.valueToCode(block, 'VALUE',
            Blockly.PERL.ORDER_ASSIGNMENT) || '0';
    var varName = Blockly.PERL.variableDB_.getName(
        block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
    return varName + ' = ' + argument0 + ';\n';
};
