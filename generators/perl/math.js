

'use strict';

goog.provide('Blockly.PERL.math');

goog.require('Blockly.PERL');


Blockly.PERL['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  if (code == Infinity) {
    code = 'inf';
  } else if (code == -Infinity) {
    code = '-inf';
  }
  return [code, Blockly.PERL.ORDER_ATOMIC];
};

Blockly.PERL['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.PERL.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.PERL.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.PERL.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.PERL.ORDER_DIVISION],
    'POWER': [' ** ', Blockly.PERL.ORDER_POWER]  
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.PERL.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.PERL.valueToCode(block, 'B', order) || '0';
  var code;
  
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.PERL['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.PERL.valueToCode(block, 'NUM',
        Blockly.PERL.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.PERL.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.PERL.valueToCode(block, 'NUM',
        Blockly.PERL.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.PERL.valueToCode(block, 'NUM',
        Blockly.PERL.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'log(' + arg + ')';
      break;
    case 'EXP':
      code = 'exp(' + arg + ')';
      break;
    case 'POW10':
      code = '10 ** ' + arg + ')';
      break;
    case 'ROUND':
      code = 'round(' + arg + ')'; // use Math::Round;
      break;
    case 'ROUNDUP':
      code = 'ceil(' + arg + ')'; // use POSIX;
      break;
    case 'ROUNDDOWN':
      code = 'floor(' + arg + ')'; // use POSIX;
      break;
    case 'SIN':
      code = 'sin(' + arg + ' / 180 * pi)'; // use Math::Trig;
      break;
    case 'COS':
      code = 'cos(' + arg + ' / 180 * pi)'; // use Math::Trig;
      break;
    case 'TAN':
      code = 'tan(' + arg + ' / 180 * pi)'; // use Math::Trig;
      break;
  }
  if (code) {
    return [code, Blockly.PERL.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'log(' + arg + ') / log(10)';
      break;
    case 'ASIN':
      code = 'asin(' + arg + ') / pi * 180'; // use Math::Trig;
      break;
    case 'ACOS':
      code = 'acos(' + arg + ') / pi * 180'; // use Math::Trig;
      break;
    case 'ATAN':
      code = 'atan(' + arg + ') / pi * 180'; // use Math::Trig;
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.PERL.ORDER_DIVISION];
};

Blockly.PERL['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['pi', Blockly.PERL.ORDER_ATOMIC],
    'E': ['exp(1)', Blockly.PERL.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + sqrt(5)) / 2', Blockly.PERL.ORDER_DIVISION],
    'SQRT2': ['sqrt(2)', Blockly.PERL.ORDER_ATOMIC],
    'SQRT1_2': ['sqrt(1/2)', Blockly.PERL.ORDER_ATOMIC],
    'INFINITY': ['inf', Blockly.PERL.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.PERL['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.PERL.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.PERL.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.PERL.provideFunction_(
        'math_isPrime',
        [ 'sub ' + Blockly.PERL.FUNCTION_NAME_PLACEHOLDER_ + ' {',
          '  # https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  my $n = shift;',
          '  if ($n == 2 || $n == 3) {',
          '    return true;',
          '  }',
          '  # False if n is NaN, negative, or not whole.',
          '  # And false if n is divisible by 2 or 3.',
          '  # use Scalar::Util qw(looks_like_number);',
          '  # We are consciously considering 1 to be a prime !!!',
          '  if (!looks_like_number($n) || $_n< 1 || $n % 1 != 0 || $n % 2 == 0 ||' +
          ' $n % 3 == 0) {',
          '    return 0;',
          '  }',
          '  # Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for (my $x = 6; $x <= sqrt($n) + 1; $x += 6) {',
          '    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {',
          '      return 0;',
          '    }',
          '  }',
          '  return 1;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = 'isint(' + number_to_check + ')'; // use Scalar::Util::Numeric qw(isint);
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.PERL.valueToCode(block, 'DIVISOR',
          Blockly.PERL.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.PERL.ORDER_EQUALITY];
};

Blockly.PERL['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.PERL.valueToCode(block, 'DELTA',
      Blockly.PERL.ORDER_ADDITION) || '0';
  var varName = Blockly.PERL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.PERL['math_round'] = Blockly.PERL['math_single'];
// Trigonometry functions have a single operand.
Blockly.PERL['math_trig'] = Blockly.PERL['math_single'];

Blockly.PERL['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.PERL.valueToCode(block, 'LIST',
          Blockly.PERL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'eval join \', ' + list + '';
      break;
    case 'MIN':
      list = Blockly.PERL.valueToCode(block, 'LIST', // use List::Util qw( min max );
          Blockly.PERL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.PERL.valueToCode(block, 'LIST', // use List::Util qw( min max );
          Blockly.PERL.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.PERL.ORDER_FUNCTION_CALL];
};

Blockly.PERL['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.PERL.valueToCode(block, 'DIVIDEND',
      Blockly.PERL.ORDER_MODULUS) || '0';
  var argument1 = Blockly.PERL.valueToCode(block, 'DIVISOR',
      Blockly.PERL.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.PERL.ORDER_MODULUS];
};

Blockly.PERL['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.PERL.valueToCode(block, 'VALUE',
      Blockly.PERL.ORDER_COMMA) || '0';
  var argument1 = Blockly.PERL.valueToCode(block, 'LOW',
      Blockly.PERL.ORDER_COMMA) || '0';
  var argument2 = Blockly.PERL.valueToCode(block, 'HIGH',
      Blockly.PERL.ORDER_COMMA) || 'inf';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.PERL.ORDER_FUNCTION_CALL];
};

Blockly.PERL['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.PERL.valueToCode(block, 'FROM',
      Blockly.PERL.ORDER_COMMA) || '0';
  var argument1 = Blockly.PERL.valueToCode(block, 'TO',
      Blockly.PERL.ORDER_COMMA) || '0';
  var code = argument0 + ' + int(rand(' + argument1 + ' - ' + argument0 + '))';
  return [code, Blockly.PERL.ORDER_FUNCTION_CALL];
};

Blockly.PERL['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['rand()', Blockly.PERL.ORDER_FUNCTION_CALL];
};
