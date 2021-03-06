/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * LittleSmallscript
 * main
 */
(function () {
  'use strict';
  
  var Packrat, LittleParsers, BlockParser, ExpressionParser, StatementParser, LittleSmallscript,
  __extend = function (destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        destination[k] = source[k];
      }
    }
    return destination;
  },
  __each = function (obj, fn) {
    for (var key in obj)
      if (obj.hasOwnProperty(key))
        fn(obj[key], key);
    return;
  },
  __template = function (template, hashmap) {
    var dest_str = template;
    __each(hashmap, function (it, key) {
      dest_str = dest_str.replace(new RegExp('%'+key+'%', 'g'), it || "");
    });
    return dest_str;
  };
  
  try {
    Packrat = require("./packratparser").Packrat;
    LittleParsers = require('./littleparsers').LittleParsers;
    BlockParser = require('./blockparser').BlockParser;
    ExpressionParser = require('./expressionparser').ExpressionParser;
    StatementParser = require('./statementparser').StatementParser;
  } catch (err) {
    if ( ! (Packrat = window.Packrat)) throw "packratparser.js is required";
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
    if ( ! (BlockParser = window.BlockParser)) throw "blockparser.js is required";
    if ( ! (ExpressionParser = window.ExpressionParser)) throw "expressionparser.js is required";
    if ( ! (StatementParser = window.StatementParser)) throw "statementparser.js is required";
  }

  LittleSmallscript = (function () { 
    var LittleSmallscript;
    
    LittleSmallscript = function (input, compileOptions) {
      this.cache = {};
      this.input = input;
      this.options = compileOptions;
    };
    LittleSmallscript.prototype = new Packrat("");
    //mixin
    __extend(LittleSmallscript.prototype, LittleParsers.prototype);
    __extend(LittleSmallscript.prototype, BlockParser.prototype);
    __extend(LittleSmallscript.prototype, ExpressionParser.prototype);
    __extend(LittleSmallscript.prototype, StatementParser.prototype);
    
    LittleSmallscript.prototype.toJS = function () {
      var _this = this,
          wraptmpl = "(function () { 'use strict'; %statement% }).call(this);";
      return this.cacheDo("toJS", function () {
        var js;
        js = __template(wraptmpl, {statement: _this.statement()});
        if (this.index < this.input.length) {
          var newlines = this.input.substring(0, this.index).match(/\n/g) || [];
          throw {
            message: 'Parse error at line '+(newlines.length+1),
            partialjs: js
          }; //ToDo: line number and parser name
        }
        if ( ! (this.options && this.options.prettyprint)) return js;
        var beautifyOption = {
          indent_size : this.options.indent_size || 2,
          indent_char : this.options.indent_char || ' ',
          preserve_newlines : false,
          jslint_happy : this.options.jslint || true
        };
        try {
          return require('../lib/beautify.js').js_beautify(js, beautifyOption);
        } catch (err) {
          try {
            return window.js_beautify(js, beautifyOption);
          } catch (err) { throw "beautify.js is needed for pretty print"; }
        }
      });
    };
    
    return LittleSmallscript;
  })();
  
  try {
    exports.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  try {
    window.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  
}).call(this);
