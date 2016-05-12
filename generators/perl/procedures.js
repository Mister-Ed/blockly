

'use strict';

goog.provide('Blockly.PERL.procedures');

goog.require('Blockly.PERL');

Blockly.PERL['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is assigned.
  var globals = Blockly.Variables.allVariables(block);
  for (var i = globals.length - 1; i >= 0; i--) {
      var varName = globals[i];
      if (block.arguments_.indexOf(varName) == -1) {
          globals[i] = Blockly.PERL.variableDB_.getName(varName,
              Blockly.Variables.NAME_TYPE);
      } else {
          // This variable is actually a parameter name.  Do not include it in
          // the list of globals, thus allowing it be of local scope.
          globals.splice(i, 1);
      }
  }
  globals = globals.length ? '  global ' + globals.join(', ') + ';\n' : '';

  var funcName = Blockly.PERL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.PERL.statementToCode(block, 'STACK');
  if (Blockly.PERL.STATEMENT_PREFIX) {
    branch = Blockly.PERL.prefixLines(
        Blockly.PERL.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.PERL.INDENT) + branch;
  }
  if (Blockly.PERL.INFINITE_LOOP_TRAP) {
    branch = Blockly.PERL.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.PERL.valueToCode(block, 'RETURN',
      Blockly.PERL.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = '  ' + Blockly.PERL.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE) + ' = shift;\n';
  }
  var code = 'sub ' + funcName + ' {\n' +
      args.join('') + branch + returnValue + '}';
  code = Blockly.PERL.scrub_(block, code);
  Blockly.PERL.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.PERL['procedures_defnoreturn'] =
    Blockly.PERL['procedures_defreturn'];

Blockly.PERL['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.PERL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.PERL.valueToCode(block, 'ARG' + x,
        Blockly.PERL.ORDER_COMMA) || '';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.PERL.ORDER_FUNCTION_CALL];
};

Blockly.PERL['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.PERL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.PERL.valueToCode(block, 'ARG' + x,
        Blockly.PERL.ORDER_COMMA) || '';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.PERL['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.PERL.valueToCode(block, 'CONDITION',
      Blockly.PERL.ORDER_NONE) || 0 ;
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.PERL.valueToCode(block, 'VALUE',
        Blockly.PERL.ORDER_NONE) || '';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
