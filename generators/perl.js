
'use strict';

goog.provide('Blockly.PERL');

goog.require('Blockly.Generator');


/**
 * PERL code generator.
 * @type {!Blockly.Generator}
 */
Blockly.PERL = new Blockly.Generator('PERL');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.PERL.addReservedWords(
        // we have chosen not to populate this list here
        // as a variable e.g. $if is easily distinguished
        // from the 'if'-construct etc.
        // 
        'SANDRA_WAS_HERE');

/**
 * Order of operation ENUMs. 
 * TODO: ADJUST THIS FOR PERL !
 */
Blockly.PERL.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.PERL.ORDER_CLONE = 1;          // clone
Blockly.PERL.ORDER_NEW = 1;            // new
Blockly.PERL.ORDER_MEMBER = 2;         // ()
Blockly.PERL.ORDER_FUNCTION_CALL = 2;  // ()
Blockly.PERL.ORDER_INCREMENT = 3;      // ++
Blockly.PERL.ORDER_DECREMENT = 3;      // --
Blockly.PERL.ORDER_LOGICAL_NOT = 4;    // !
Blockly.PERL.ORDER_BITWISE_NOT = 4;    // ~
Blockly.PERL.ORDER_UNARY_PLUS = 4;     // +
Blockly.PERL.ORDER_UNARY_NEGATION = 4; // -
Blockly.PERL.ORDER_POWER = 5;          // **
Blockly.PERL.ORDER_MODULUS = 5;        // %
Blockly.PERL.ORDER_MULTIPLICATION = 7; // *
Blockly.PERL.ORDER_DIVISION = 7;       // /
Blockly.PERL.ORDER_ADDITION = 7;       // +
Blockly.PERL.ORDER_SUBTRACTION = 7;    // -
Blockly.PERL.ORDER_BITWISE_SHIFT = 8;  // << >> >>>
Blockly.PERL.ORDER_RELATIONAL = 9;     // < <= > >=
Blockly.PERL.ORDER_IN = 9;             // in
Blockly.PERL.ORDER_INSTANCEOF = 9;     // instanceof
Blockly.PERL.ORDER_EQUALITY = 10;      // == != === !==
Blockly.PERL.ORDER_BITWISE_AND = 11;   // &
Blockly.PERL.ORDER_BITWISE_XOR = 12;   // ^
Blockly.PERL.ORDER_BITWISE_OR = 13;    // |
Blockly.PERL.ORDER_CONDITIONAL = 14;   // ?:
Blockly.PERL.ORDER_ASSIGNMENT = 15;    // = += -= *= /= %= <<= >>= ...
Blockly.PERL.ORDER_LOGICAL_AND = 16;   // &&
Blockly.PERL.ORDER_LOGICAL_OR = 17;    // ||
Blockly.PERL.ORDER_COMMA = 18;         // ,
Blockly.PERL.ORDER_NONE = 99;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.PERL.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.PERL.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.PERL.functionNames_ = Object.create(null);

  if (!Blockly.PERL.variableDB_) {
    Blockly.PERL.variableDB_ =
        new Blockly.Names(Blockly.PERL.RESERVED_WORDS_, '$');
  } else {
    Blockly.PERL.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars[i] = 'my ' + Blockly.PERL.variableDB_.getName(variables[i],
        Blockly.Variables.NAME_TYPE) + ';';
  }
  Blockly.PERL.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.PERL.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.PERL.definitions_) {
    definitions.push(Blockly.PERL.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.PERL.definitions_;
  delete Blockly.PERL.functionNames_;
  Blockly.PERL.variableDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.PERL.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped PERL string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} PERL string.
 * @private
 */
Blockly.PERL.quote_ = function(string) {
  return '"' + string + '"';
};

/**
 * Common tasks for generating PERL from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The PERL code created for this block.
 * @return {string} PERL code with comments and subsequent blocks added.
 * @private
 */
Blockly.PERL.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.PERL.prefixLines(comment, '# ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.PERL.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.PERL.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.PERL.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
