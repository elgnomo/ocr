'use strict';

function createCommonjsModule(fn, module) {
  return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
  : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
  var core = module.exports = {
    version: '2.6.5' };

  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});
var _core_1 = _core.version;

var _isObject = function _isObject(it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function _anObject(it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function _fails(exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', {
    get: function get() {
      return 7;
    } }).
  a != 7;
});

var document$1 = _global.document; // typeof document.createElement is 'object' in old IE

var is = _isObject(document$1) && _isObject(document$1.createElement);

var _domCreate = function _domCreate(it) {
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', {
    get: function get() {
      return 7;
    } }).
  a != 7;
});

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string

var _toPrimitive = function _toPrimitive(it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;
var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var _objectDp = {
  f: f };


var _propertyDesc = function _propertyDesc(bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value };

};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;

var _has = function _has(it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();

var _uid = function _uid(key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _library = false;

var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});
  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode: 'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)' });

});

var _functionToString = _shared('native-function-to-string', Function.toString);

var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');
  var TO_STRING = 'toString';
  var TPL = ('' + _functionToString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return _functionToString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));

    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || _functionToString.call(this);
  });
});

var _aFunction = function _aFunction(it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

var _ctx = function _ctx(fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };}


  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function $export(type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;

  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined; // export native or passed

    out = (own ? target : source)[key]; // bind timers to global for call from export context

    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out; // extend global

    if (target) _redefine(target, key, out, type & $export.U); // export

    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};

_global.core = _core; // type bitmap

$export.F = 1; // forced

$export.G = 2; // global

$export.S = 4; // static

$export.P = 8; // proto

$export.B = 16; // bind

$export.W = 32; // wrap

$export.U = 64; // safe

$export.R = 128; // real proto method for `library`

var _export = $export;

var toString = {}.toString;

var _cof = function _cof(it) {
  return toString.call(it).slice(8, -1);
};

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;

var _toInteger = function _toInteger(it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

var min = Math.min;

var _toLength = function _toLength(it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');
  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
});

var IS_CONCAT_SPREADABLE = _wks('isConcatSpreadable');

function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? _ctx(mapper, thisArg, 3) : false;
  var element, spreadable;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
      spreadable = false;

      if (_isObject(element)) {
        spreadable = element[IS_CONCAT_SPREADABLE];
        spreadable = spreadable !== undefined ? !!spreadable : _isArray(element);
      }

      if (spreadable && depth > 0) {
        targetIndex = flattenIntoArray(target, original, element, _toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1fffffffffffff) throw TypeError();
        target[targetIndex] = element;
      }

      targetIndex++;
    }

    sourceIndex++;
  }

  return targetIndex;
}

var _flattenIntoArray = flattenIntoArray;

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function _defined(it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

var _toObject = function _toObject(it) {
  return Object(_defined(it));
};

var SPECIES = _wks('species');

var _arraySpeciesConstructor = function _arraySpeciesConstructor(original) {
  var C;

  if (_isArray(original)) {
    C = original.constructor; // cross-realm fallback

    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;

    if (_isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  }

  return C === undefined ? Array : C;
};

var _arraySpeciesCreate = function _arraySpeciesCreate(original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

var UNSCOPABLES = _wks('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});

var _addToUnscopables = function _addToUnscopables(key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

_export(_export.P, 'Array', {
  flatMap: function flatMap(callbackfn
  /* , thisArg */)
  {
    var O = _toObject(this);
    var sourceLen, A;
    _aFunction(callbackfn);
    sourceLen = _toLength(O.length);
    A = _arraySpeciesCreate(O, 0);
    _flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
    return A;
  } });

_addToUnscopables('flatMap');

var _iterCall = function _iterCall(iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

var _iterators = {};

var ITERATOR = _wks('iterator');
var ArrayProto$1 = Array.prototype;

var _isArrayIter = function _isArrayIter(it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR] === it);
};

var _createProperty = function _createProperty(object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));else object[index] = value;
};

var TAG = _wks('toStringTag'); // ES3 wrong here

var ARG = _cof(function () {
  return arguments;
}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

var tryGet = function tryGet(it, key) {
  try {
    return it[key];
  } catch (e) {
    /* empty */
  }
};

var _classof = function _classof(it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
  : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T // builtinTag case
  : ARG ? _cof(O) // ES3 arguments fallback
  : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var ITERATOR$1 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$1] || it['@@iterator'] || _iterators[_classof(it)];
};

var ITERATOR$2 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$2]();

  riter['return'] = function () {
    SAFE_CLOSING = true;
  }; // eslint-disable-next-line no-throw-literal


  Array.from(riter, function () {
    throw 2;
  });
} catch (e) {
  /* empty */
}

var _iterDetect = function _iterDetect(exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;

  try {
    var arr = [7];
    var iter = arr[ITERATOR$2]();

    iter.next = function () {
      return {
        done: safe = true };

    };

    arr[ITERATOR$2] = function () {
      return iter;
    };

    exec(arr);
  } catch (e) {
    /* empty */
  }

  return safe;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) {
  Array.from(iter);
}), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike
  /* , mapfn = undefined, thisArg = undefined */)
  {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);

      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }

    result.length = index;
    return result;
  } });


// eslint-disable-next-line no-prototype-builtins

var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

var _toIobject = function _toIobject(it) {
  return _iobject(_defined(it));
};

var max = Math.max;
var min$1 = Math.min;

var _toAbsoluteIndex = function _toAbsoluteIndex(index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// true  -> Array#includes

var _arrayIncludes = function _arrayIncludes(IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      }
    }
    return !IS_INCLUDES && -1;
  };
};

var $includes = _arrayIncludes(true);
_export(_export.P, 'Array', {
  includes: function includes(el
  /* , fromIndex = 0 */)
  {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  } });

_addToUnscopables('includes');

var _strictMethod = function _strictMethod(method, arg) {
  return !!method && _fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () {
      /* empty */
    }, 1) : method.call(null);
  });
};

var $sort = [].sort;
var test = [1, 2, 3];
_export(_export.P + _export.F * (_fails(function () {
  // IE8-
  test.sort(undefined);
}) || !_fails(function () {
  // V8 bug
  test.sort(null); // Old WebKit
}) || !_strictMethod($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined ? $sort.call(_toObject(this)) : $sort.call(_toObject(this), _aFunction(comparefn));
  } });


var SPECIES$1 = _wks('species');

var _setSpecies = function _setSpecies(KEY) {
  var C = _global[KEY];
  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
    configurable: true,
    get: function get() {
      return this;
    } });

};

_setSpecies('Array');

_export(_export.P + _export.F * _fails(function () {
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({
    toISOString: function toISOString() {
      return 1;
    } }) !==
  1;
}), 'Date', {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = _toObject(this);
    var pv = _toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  } });


var NUMBER = 'number';

var _dateToPrimitive = function _dateToPrimitive(hint) {
  if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
  return _toPrimitive(_anObject(this), hint != NUMBER);
};

var TO_PRIMITIVE = _wks('toPrimitive');
var proto = Date.prototype;
if (!(TO_PRIMITIVE in proto)) _hide(proto, TO_PRIMITIVE, _dateToPrimitive);

var shared = _shared('keys');

var _sharedKey = function _sharedKey(key) {
  return shared[key] || (shared[key] = _uid(key));
};

var IE_PROTO = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO)) return O[IE_PROTO];

  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }

  return O instanceof Object ? ObjectProto : null;
};

var HAS_INSTANCE = _wks('hasInstance');
var FunctionProto = Function.prototype; // 19.2.3.6 Function.prototype[@@hasInstance](V)

if (!(HAS_INSTANCE in FunctionProto)) _objectDp.f(FunctionProto, HAS_INSTANCE, {
  value: function value(O) {
    if (typeof this != 'function' || !_isObject(O)) return false;
    if (!_isObject(this.prototype)) return O instanceof this; // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:

    while (O = _objectGpo(O)) {
      if (this.prototype === O) return true;
    }

    return false;
  } });


var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO$1 = _sharedKey('IE_PROTO');

var _objectKeysInternal = function _objectKeysInternal(object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) {
    if (key != IE_PROTO$1) _has(O, key) && result.push(key);
  } // Don't enum bug & hidden keys


  while (names.length > i) {
    if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
  }

  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');

var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;

  while (length > i) {
    _objectDp.f(O, P = keys[i++], Properties[P]);
  }

  return O;
};

var document$2 = _global.document;

var _html = document$2 && document$2.documentElement;

var IE_PROTO$2 = _sharedKey('IE_PROTO');

var Empty = function Empty() {
  /* empty */
};

var PROTOTYPE$1 = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

var _createDict = function createDict() {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);

  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  _createDict = iframeDocument.F;

  while (i--) {
    delete _createDict[PROTOTYPE$1][_enumBugKeys[i]];
  }

  return _createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;

  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null; // add "__proto__" for Object.getPrototypeOf polyfill

    result[IE_PROTO$2] = O;
  } else result = _createDict();

  return Properties === undefined ? result : _objectDps(result, Properties);
};

var _redefineAll = function _redefineAll(target, src, safe) {
  for (var key in src) {
    _redefine(target, key, src[key], safe);
  }

  return target;
};

var _anInstance = function _anInstance(it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
    throw TypeError(name + ': incorrect invocation!');
  }

  return it;
};

var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};

  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () {
      return iterable;
    } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!'); // fast case for arrays with default iterator

    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };

  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
});

var def = _objectDp.f;
var TAG$1 = _wks('toStringTag');

var _setToStringTag = function _setToStringTag(it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, {
    configurable: true,
    value: tag });

};

var IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

_hide(IteratorPrototype, _wks('iterator'), function () {
  return this;
});

var _iterCreate = function _iterCreate(Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, {
    next: _propertyDesc(1, next) });

  _setToStringTag(Constructor, NAME + ' Iterator');
};

var ITERATOR$3 = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`

var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function returnThis() {
  return this;
};

var _iterDefine = function _iterDefine(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);

  var getMethod = function getMethod(kind) {
    if (!BUGGY && kind in proto) return proto[kind];

    switch (kind) {
      case KEYS:
        return function keys() {
          return new Constructor(this, kind);
        };

      case VALUES:
        return function values() {
          return new Constructor(this, kind);
        };}


    return function entries() {
      return new Constructor(this, kind);
    };
  };

  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR$3] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype; // Fix native

  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));

    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true); // fix for some old engines

      if (typeof IteratorPrototype[ITERATOR$3] != 'function') _hide(IteratorPrototype, ITERATOR$3, returnThis);
    }
  } // fix Array#{values, @@iterator}.name in V8 / FF


  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;

    $default = function values() {
      return $native.call(this);
    };
  } // Define iterator


  if (BUGGY || VALUES_BUG || !proto[ITERATOR$3]) {
    _hide(proto, ITERATOR$3, $default);
  } // Plug for library


  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;

  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries };

    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }

  return methods;
};

var _iterStep = function _iterStep(done, value) {
  return {
    value: value,
    done: !!done };

};

var _meta = createCommonjsModule(function (module) {
  var META = _uid('meta');
  var setDesc = _objectDp.f;
  var id = 0;

  var isExtensible = Object.isExtensible || function () {
    return true;
  };

  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });

  var setMeta = function setMeta(it) {
    setDesc(it, META, {
      value: {
        i: 'O' + ++id,
        // object ID
        w: {} // weak collections IDs
      } });


  };

  var fastKey = function fastKey(it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

      if (!create) return 'E'; // add missing metadata

      setMeta(it); // return object ID
    }

    return it[META].i;
  };

  var getWeak = function getWeak(it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true; // not necessary to add metadata

      if (!create) return false; // add missing metadata

      setMeta(it); // return hash weak collections IDs
    }

    return it[META].w;
  }; // add metadata on freeze-family methods calling


  var onFreeze = function onFreeze(it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };

  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze };

});
var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var _validateCollection = function _validateCollection(it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$1 = _objectDp.f;
var fastKey = _meta.fastKey;
var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function getEntry(that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index]; // frozen object case

  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type

      that._i = _objectCreate(null); // index

      that._f = undefined; // first entry

      that._l = undefined; // last entry

      that[SIZE] = 0; // size

      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }

        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function _delete(key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);

        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        }

        return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn
      /* , that = undefined */)
      {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;

        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this); // revert to the last existing entry

          while (entry && entry.r) {
            entry = entry.p;
          }
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      } });

    if (_descriptors) dP$1(C.prototype, 'size', {
      get: function get() {
        return _validateCollection(this, NAME)[SIZE];
      } });

    return C;
  },
  def: function def(that, key, value) {
    var entry = getEntry(that, key);
    var prev, index; // change existing entry

    if (entry) {
      entry.v = value; // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true),
        // <- index
        k: key,
        // <- key
        v: value,
        // <- value
        p: prev = that._l,
        // <- previous entry
        n: undefined,
        // <- next entry
        r: false // <- removed
      };

      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++; // add to index

      if (index !== 'F') that._i[index] = entry;
    }

    return that;
  },
  getEntry: getEntry,
  setStrong: function setStrong(C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target

      this._k = kind; // kind

      this._l = undefined; // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l; // revert to the last existing entry

      while (entry && entry.r) {
        entry = entry.p;
      } // get next entry


      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      } // return step by kind


      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

    _setSpecies(NAME);
  } };


var f$1 = {}.propertyIsEnumerable;
var _objectPie = {
  f: f$1 };


var gOPD = Object.getOwnPropertyDescriptor;
var f$2 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) {
    /* empty */
  }
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};
var _objectGopd = {
  f: f$2 };


/* eslint-disable no-proto */

var check = function check(O, proto) {
  _anObject(O);
  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};

var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
  function (test, buggy, set) {
    try {
      set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
      set(test, []);
      buggy = !(test instanceof Array);
    } catch (e) {
      buggy = true;
    }

    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  }({}, false) : undefined),
  check: check };


var setPrototypeOf = _setProto.set;

var _inheritIfRequired = function _inheritIfRequired(that, target, C) {
  var S = target.constructor;
  var P;

  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  }

  return that;
};

var _collection = function _collection(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};

  var fixMethod = function fixMethod(KEY) {
    var fn = proto[KEY];
    _redefine(proto, KEY, KEY == 'delete' ? function (a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'has' ? function has(a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'get' ? function get(a) {
      return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'add' ? function add(a) {
      fn.call(this, a === 0 ? 0 : a);
      return this;
    } : function set(a, b) {
      fn.call(this, a === 0 ? 0 : a, b);
      return this;
    });
  };

  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance = new C(); // early implementations not supports chaining

    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false

    var THROWS_ON_PRIMITIVES = _fails(function () {
      instance.has(1);
    }); // most early implementations doesn't supports iterables, most modern - not close it correctly

    var ACCEPT_ITERABLES = _iterDetect(function (iter) {
      new C(iter);
    }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same

    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;

      while (index--) {
        $instance[ADDER](index, index);
      }

      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  _setToStringTag(C, NAME);
  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);
  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
  return C;
};

var MAP = 'Map'; // 23.1 Map Objects

var es6_map = _collection(MAP, function (get) {
  return function Map() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
  } },
_collectionStrong, true);

var f$3 = Object.getOwnPropertySymbols;
var _objectGops = {
  f: f$3 };


var $assign = Object.assign; // should work with symbols and should have deterministic property order (V8 bug)

var _objectAssign = !$assign || _fails(function () {
  var A = {};
  var B = {}; // eslint-disable-next-line no-undef

  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) {
    B[k] = k;
  });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) {
  // eslint-disable-line no-unused-vars
  var T = _toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = _objectGops.f;
  var isEnum = _objectPie.f;

  while (aLen > index) {
    var S = _iobject(arguments[index++]);
    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;

    while (length > j) {
      if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    }
  }

  return T;
} : $assign;

_export(_export.S + _export.F, 'Object', {
  assign: _objectAssign });


var isEnum = _objectPie.f;

var _objectToArray = function _objectToArray(isEntries) {
  return function (it) {
    var O = _toIobject(it);
    var keys = _objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;

    while (length > i) {
      if (isEnum.call(O, key = keys[i++])) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      }
    }

    return result;
  };
};

var $entries = _objectToArray(true);
_export(_export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  } });


var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return _objectKeysInternal(O, hiddenKeys);
};

var _objectGopn = {
  f: f$4 };


var Reflect$1 = _global.Reflect;

var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
  var keys = _objectGopn.f(_anObject(it));
  var getSymbols = _objectGops.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

_export(_export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = _toIobject(object);
    var getDesc = _objectGopd.f;
    var keys = _ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;

    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) _createProperty(result, key, desc);
    }

    return result;
  } });


var test$1 = {};
test$1[_wks('toStringTag')] = 'z';

if (test$1 + '' != '[object z]') {
  _redefine(Object.prototype, 'toString', function toString() {
    return '[object ' + _classof(this) + ']';
  }, true);
}

var $values = _objectToArray(false);
_export(_export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  } });


var SPECIES$2 = _wks('species');

var _speciesConstructor = function _speciesConstructor(O, D) {
  var C = _anObject(O).constructor;
  var S;
  return C === undefined || (S = _anObject(C)[SPECIES$2]) == undefined ? D : _aFunction(S);
};

// fast apply, http://jsperf.lnkit.com/fast-apply/5
var _invoke = function _invoke(fn, args, that) {
  var un = that === undefined;

  switch (args.length) {
    case 0:
      return un ? fn() : fn.call(that);

    case 1:
      return un ? fn(args[0]) : fn.call(that, args[0]);

    case 2:
      return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);

    case 3:
      return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);

    case 4:
      return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);}


  return fn.apply(that, args);
};

var process$1 = _global.process;
var setTask = _global.setImmediate;
var clearTask = _global.clearImmediate;
var MessageChannel = _global.MessageChannel;
var Dispatch = _global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function run() {
  var id = +this; // eslint-disable-next-line no-prototype-builtins

  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var listener = function listener(event) {
  run.call(event.data);
}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;

    while (arguments.length > i) {
      args.push(arguments[i++]);
    }

    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };

    defer(counter);
    return counter;
  };

  clearTask = function clearImmediate(id) {
    delete queue[id];
  }; // Node.js 0.8-


  if (_cof(process$1) == 'process') {
    defer = function defer(id) {
      process$1.nextTick(_ctx(run, id, 1));
    }; // Sphere (JS game engine) Dispatch API

  } else if (Dispatch && Dispatch.now) {
    defer = function defer(id) {
      Dispatch.now(_ctx(run, id, 1));
    }; // Browsers with MessageChannel, includes WebWorkers

  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = _ctx(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
    defer = function defer(id) {
      _global.postMessage(id + '', '*');
    };

    _global.addEventListener('message', listener, false); // IE8-
  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
    defer = function defer(id) {
      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
        _html.removeChild(this);
        run.call(id);
      };
    }; // Rest old browsers

  } else {
    defer = function defer(id) {
      setTimeout(_ctx(run, id, 1), 0);
    };
  }
}

var _task = {
  set: setTask,
  clear: clearTask };


var macrotask = _task.set;
var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
var process$2 = _global.process;
var Promise$1 = _global.Promise;
var isNode = _cof(process$2) == 'process';

var _microtask = function _microtask() {
  var head, last, notify;

  var flush = function flush() {
    var parent, fn;
    if (isNode && (parent = process$2.domain)) parent.exit();

    while (head) {
      fn = head.fn;
      head = head.next;

      try {
        fn();
      } catch (e) {
        if (head) notify();else last = undefined;
        throw e;
      }
    }

    last = undefined;
    if (parent) parent.enter();
  }; // Node.js


  if (isNode) {
    notify = function notify() {
      process$2.nextTick(flush);
    }; // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339

  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, {
      characterData: true });
    // eslint-disable-line no-new

    notify = function notify() {
      node.data = toggle = !toggle;
    }; // environments with maybe non-completely correct, but existent Promise

  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise$1.resolve(undefined);

    notify = function notify() {
      promise.then(flush);
    }; // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout

  } else {
    notify = function notify() {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(_global, flush);
    };
  }

  return function (fn) {
    var task = {
      fn: fn,
      next: undefined };

    if (last) last.next = task;

    if (!head) {
      head = task;
      notify();
    }

    last = task;
  };
};

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = _aFunction(resolve);
  this.reject = _aFunction(reject);
}

var f$5 = function f(C) {
  return new PromiseCapability(C);
};

var _newPromiseCapability = {
  f: f$5 };


var _perform = function _perform(exec) {
  try {
    return {
      e: false,
      v: exec() };

  } catch (e) {
    return {
      e: true,
      v: e };

  }
};

var navigator = _global.navigator;

var _userAgent = navigator && navigator.userAgent || '';

var _promiseResolve = function _promiseResolve(C, x) {
  _anObject(C);
  if (_isObject(x) && x.constructor === C) return x;
  var promiseCapability = _newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var task = _task.set;
var microtask = _microtask();
var PROMISE = 'Promise';
var TypeError$1 = _global.TypeError;
var process$3 = _global.process;
var versions = process$3 && process$3.versions;
var v8 = versions && versions.v8 || '';
var $Promise = _global[PROMISE];
var isNode$1 = _classof(process$3) == 'process';

var empty = function empty() {
  /* empty */
};

var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;
var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);

    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
      exec(empty, empty);
    }; // unhandled rejections tracking support, NodeJS Promise without it fails @@species test


    return (isNode$1 || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // we can't detect it synchronously, so just check versions
    && v8.indexOf('6.6') !== 0 && _userAgent.indexOf('Chrome/66') === -1;
  } catch (e) {
    /* empty */
  }
}(); // helpers

var isThenable = function isThenable(it) {
  var then;
  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify = function notify(promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;

    var run = function run(reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;

      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }

          if (handler === true) result = value;else {
            if (domain) domain.enter();
            result = handler(value); // may throw

            if (domain) {
              domain.exit();
              exited = true;
            }
          }

          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };

    while (chain.length > i) {
      run(chain[i++]);
    } // variable length - can't use forEach


    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};

var onUnhandled = function onUnhandled(promise) {
  task.call(_global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;

    if (unhandled) {
      result = _perform(function () {
        if (isNode$1) {
          process$3.emit('unhandledRejection', value, promise);
        } else if (handler = _global.onunhandledrejection) {
          handler({
            promise: promise,
            reason: value });

        } else if ((console = _global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
    }

    promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};

var isUnhandled = function isUnhandled(promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};

var onHandleUnhandled = function onHandleUnhandled(promise) {
  task.call(_global, function () {
    var handler;

    if (isNode$1) {
      process$3.emit('rejectionHandled', promise);
    } else if (handler = _global.onrejectionhandled) {
      handler({
        promise: promise,
        reason: promise._v });

    }
  });
};

var $reject = function $reject(value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap

  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};

var $resolve = function $resolve(value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap

  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");

    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = {
          _w: promise,
          _d: false };
        // wrap

        try {
          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({
      _w: promise,
      _d: false },
    e); // wrap
  }
}; // constructor polyfill


if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    _anInstance(this, $Promise, PROMISE, '_h');
    _aFunction(executor);
    Internal.call(this);

    try {
      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  }; // eslint-disable-next-line no-unused-vars


  Internal = function Promise(executor) {
    this._c = []; // <- awaiting reactions

    this._a = undefined; // <- checked in isUnhandled reactions

    this._s = 0; // <- state

    this._d = false; // <- done

    this._v = undefined; // <- value

    this._h = 0; // <- rejection state, 0 - default, 1 - handled, 2 - unhandled

    this._n = false; // <- notify
  };

  Internal.prototype = _redefineAll($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode$1 ? process$3.domain : undefined;

      this._c.push(reaction);

      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function _catch(onRejected) {
      return this.then(undefined, onRejected);
    } });


  OwnPromiseCapability = function OwnPromiseCapability() {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = _ctx($resolve, promise, 1);
    this.reject = _ctx($reject, promise, 1);
  };

  _newPromiseCapability.f = newPromiseCapability = function newPromiseCapability(C) {
    return C === $Promise || C === Wrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, {
  Promise: $Promise });

_setToStringTag($Promise, PROMISE);
_setSpecies(PROMISE);
Wrapper = _core[PROMISE]; // statics

_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  } });

_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return _promiseResolve(this, x);
  } });

_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = _perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      _forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = _perform(function () {
      _forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  } });


_export(_export.P + _export.R, 'Promise', {
  'finally': function _finally(onFinally) {
    var C = _speciesConstructor(this, _core.Promise || _global.Promise);
    var isFunction = typeof onFinally == 'function';
    return this.then(isFunction ? function (x) {
      return _promiseResolve(C, onFinally()).then(function () {
        return x;
      });
    } : onFinally, isFunction ? function (e) {
      return _promiseResolve(C, onFinally()).then(function () {
        throw e;
      });
    } : onFinally);
  } });


var rApply = (_global.Reflect || {}).apply;
var fApply = Function.apply; // MS Edge argumentsList argument is optional

_export(_export.S + _export.F * !_fails(function () {
  rApply(function () {
    /* empty */
  });
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = _aFunction(target);
    var L = _anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  } });


var arraySlice = [].slice;
var factories = {};

var construct = function construct(F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) {
      n[i] = 'a[' + i + ']';
    } // eslint-disable-next-line no-new-func


    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  }

  return factories[len](F, args);
};

var _bind = Function.bind || function bind(that
/* , ...args */)
{
  var fn = _aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);

  var bound = function bound()
  /* args... */
  {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
  };

  if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

var rConstruct = (_global.Reflect || {}).construct; // MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it

var NEW_TARGET_BUG = _fails(function () {
  function F() {
    /* empty */
  }

  return !(rConstruct(function () {
    /* empty */
  }, [], F) instanceof F);
});
var ARGS_BUG = !_fails(function () {
  rConstruct(function () {
    /* empty */
  });
});
_export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args
  /* , newTarget */)
  {
    _aFunction(Target);
    _anObject(args);
    var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);

    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0:
          return new Target();

        case 1:
          return new Target(args[0]);

        case 2:
          return new Target(args[0], args[1]);

        case 3:
          return new Target(args[0], args[1], args[2]);

        case 4:
          return new Target(args[0], args[1], args[2], args[3]);}
      // w/o altered newTarget, lot of arguments case


      var $args = [null];
      $args.push.apply($args, args);
      return new (_bind.apply(Target, $args))();
    } // with altered newTarget, not support built-in constructors


    var proto = newTarget.prototype;
    var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return _isObject(result) ? result : instance;
  } });


// MS Edge has broken Reflect.defineProperty - throwing instead of returning false

_export(_export.S + _export.F * _fails(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(_objectDp.f({}, 1, {
    value: 1 }),
  1, {
    value: 2 });

}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    _anObject(target);
    propertyKey = _toPrimitive(propertyKey, true);
    _anObject(attributes);

    try {
      _objectDp.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  } });


var gOPD$1 = _objectGopd.f;
_export(_export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD$1(_anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  } });


function get(target, propertyKey
/* , receiver */)
{
  var receiver = arguments.length < 3 ? target : arguments[2];
  var desc, proto;
  if (_anObject(target) === receiver) return target[propertyKey];
  if (desc = _objectGopd.f(target, propertyKey)) return _has(desc, 'value') ? desc.value : desc.get !== undefined ? desc.get.call(receiver) : undefined;
  if (_isObject(proto = _objectGpo(target))) return get(proto, propertyKey, receiver);
}

_export(_export.S, 'Reflect', {
  get: get });


_export(_export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return _objectGopd.f(_anObject(target), propertyKey);
  } });


_export(_export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target) {
    return _objectGpo(_anObject(target));
  } });


_export(_export.S, 'Reflect', {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  } });


var $isExtensible = Object.isExtensible;
_export(_export.S, 'Reflect', {
  isExtensible: function isExtensible(target) {
    _anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  } });


_export(_export.S, 'Reflect', {
  ownKeys: _ownKeys });


var $preventExtensions = Object.preventExtensions;
_export(_export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target) {
    _anObject(target);

    try {
      if ($preventExtensions) $preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  } });


function set(target, propertyKey, V
/* , receiver */)
{
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDesc = _objectGopd.f(_anObject(target), propertyKey);
  var existingDescriptor, proto;

  if (!ownDesc) {
    if (_isObject(proto = _objectGpo(target))) {
      return set(proto, propertyKey, V, receiver);
    }

    ownDesc = _propertyDesc(0);
  }

  if (_has(ownDesc, 'value')) {
    if (ownDesc.writable === false || !_isObject(receiver)) return false;

    if (existingDescriptor = _objectGopd.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      _objectDp.f(receiver, propertyKey, existingDescriptor);
    } else _objectDp.f(receiver, propertyKey, _propertyDesc(0, V));

    return true;
  }

  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

_export(_export.S, 'Reflect', {
  set: set });


if (_setProto) _export(_export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    _setProto.check(target, proto);

    try {
      _setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  } });


var MATCH = _wks('match');

var _isRegexp = function _isRegexp(it) {
  var isRegExp;
  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
};

var _flags = function _flags() {
  var that = _anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var dP$2 = _objectDp.f;
var gOPN = _objectGopn.f;
var $RegExp = _global.RegExp;
var Base = $RegExp;
var proto$1 = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g; // "new" creates a new object, old webkit buggy here

var CORRECT_NEW = new $RegExp(re1) !== re1;

if (_descriptors && (!CORRECT_NEW || _fails(function () {
  re2[_wks('match')] = false; // RegExp constructor can alter flags and IsRegExp works correct with @@match

  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = _isRegexp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p : _inheritIfRequired(CORRECT_NEW ? new Base(piRE && !fiU ? p.source : p, f) : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f), tiRE ? this : proto$1, $RegExp);
  };

  var proxy = function proxy(key) {
    key in $RegExp || dP$2($RegExp, key, {
      configurable: true,
      get: function get() {
        return Base[key];
      },
      set: function set(it) {
        Base[key] = it;
      } });

  };

  for (var keys = gOPN(Base), i = 0; keys.length > i;) {
    proxy(keys[i++]);
  }

  proto$1.constructor = $RegExp;
  $RegExp.prototype = proto$1;
  _redefine(_global, 'RegExp', $RegExp);
}

_setSpecies('RegExp');

// false -> String#codePointAt

var _stringAt = function _stringAt(TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var at = _stringAt(true); // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex

var _advanceStringIndex = function _advanceStringIndex(S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

var builtinExec = RegExp.prototype.exec; // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec

var _regexpExecAbstract = function _regexpExecAbstract(R, S) {
  var exec = R.exec;

  if (typeof exec === 'function') {
    var result = exec.call(R, S);

    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }

    return result;
  }

  if (_classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }

  return builtinExec.call(R, S);
};

var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.

var nativeReplace = String.prototype.replace;
var patchedExec = nativeExec;
var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = function () {
  var re1 = /a/,
  re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
}(); // nonparticipating capturing group, copied from es5-shim's String#split patch.


var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
    }

    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];
    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }

    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

var _regexpExec = patchedExec;

_export({
  target: 'RegExp',
  proto: true,
  forced: _regexpExec !== /./.exec },
{
  exec: _regexpExec });


var SPECIES$3 = _wks('species');
var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;

  re.exec = function () {
    var result = [];
    result.groups = {
      a: '7' };

    return result;
  };

  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;

  re.exec = function () {
    return originalExec.apply(this, arguments);
  };

  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
}();

var _fixReWks = function _fixReWks(KEY, length, exec) {
  var SYMBOL = _wks(KEY);
  var DELEGATES_TO_SYMBOL = !_fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};

    O[SYMBOL] = function () {
      return 7;
    };

    return ''[KEY](O) != 7;
  });
  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    re.exec = function () {
      execCalled = true;
      return null;
    };

    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};

      re.constructor[SPECIES$3] = function () {
        return re;
      };
    }

    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(_defined, SYMBOL, ''[KEY], function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === _regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return {
            done: true,
            value: nativeRegExpMethod.call(regexp, str, arg2) };

        }

        return {
          done: true,
          value: nativeMethod.call(str, regexp, arg2) };

      }

      return {
        done: false };

    });
    var strfn = fns[0];
    var rxfn = fns[1];
    _redefine(String.prototype, KEY, strfn);
    _hide(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
    ? function (string, arg) {
      return rxfn.call(string, this, arg);
    } // 21.2.5.6 RegExp.prototype[@@match](string)
    // 21.2.5.9 RegExp.prototype[@@search](string)
    : function (string) {
      return rxfn.call(string, this);
    });
  }
};

_fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [// `String.prototype.match` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.match
  function match(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, // `RegExp.prototype[@@match]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
  function (regexp) {
    var res = maybeCallNative($match, regexp, this);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    if (!rx.global) return _regexpExecAbstract(rx, S);
    var fullUnicode = rx.unicode;
    rx.lastIndex = 0;
    var A = [];
    var n = 0;
    var result;

    while ((result = _regexpExecAbstract(rx, S)) !== null) {
      var matchStr = String(result[0]);
      A[n] = matchStr;
      if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
      n++;
    }

    return n === 0 ? null : A;
  }];
});

var max$1 = Math.max;
var min$2 = Math.min;
var floor$1 = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function maybeToString(it) {
  return it === undefined ? it : String(it);
}; // @@replace logic


_fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [// `String.prototype.replace` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
  function replace(searchValue, replaceValue) {
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
  }, // `RegExp.prototype[@@replace]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
  function (regexp, replaceValue) {
    var res = maybeCallNative($replace, regexp, this, replaceValue);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var functionalReplace = typeof replaceValue === 'function';
    if (!functionalReplace) replaceValue = String(replaceValue);
    var global = rx.global;

    if (global) {
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
    }

    var results = [];

    while (true) {
      var result = _regexpExecAbstract(rx, S);
      if (result === null) break;
      results.push(result);
      if (!global) break;
      var matchStr = String(result[0]);
      if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
    }

    var accumulatedResult = '';
    var nextSourcePosition = 0;

    for (var i = 0; i < results.length; i++) {
      result = results[i];
      var matched = String(result[0]);
      var position = max$1(min$2(_toInteger(result.index), S.length), 0);
      var captures = []; // NOTE: This is equivalent to
      //   captures = result.slice(1).map(maybeToString)
      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

      for (var j = 1; j < result.length; j++) {
        captures.push(maybeToString(result[j]));
      }

      var namedCaptures = result.groups;

      if (functionalReplace) {
        var replacerArgs = [matched].concat(captures, position, S);
        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
        var replacement = String(replaceValue.apply(undefined, replacerArgs));
      } else {
        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
      }

      if (position >= nextSourcePosition) {
        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
        nextSourcePosition = position + matched.length;
      }
    }

    return accumulatedResult + S.slice(nextSourcePosition);
  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

    if (namedCaptures !== undefined) {
      namedCaptures = _toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }

    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;

      switch (ch.charAt(0)) {
        case '$':
          return '$';

        case '&':
          return matched;

        case '`':
          return str.slice(0, position);

        case "'":
          return str.slice(tailPos);

        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;

        default:
          // \d\d?
          var n = +ch;
          if (n === 0) return match;

          if (n > m) {
            var f = floor$1(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }

          capture = captures[n - 1];}


      return capture === undefined ? '' : capture;
    });
  }
});

var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX$1 = 'lastIndex';
var MAX_UINT32 = 0xffffffff; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

var SUPPORTS_Y = !_fails(function () {
  RegExp(MAX_UINT32, 'y');
}); // @@split logic

_fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;

  if ('abbc'[$SPLIT](/(b)*/)[1] == 'c' || 'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 || 'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 || '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 || '.'[$SPLIT](/()()/)[LENGTH] > 1 || ''[$SPLIT](/.?/)[LENGTH]) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function internalSplit(separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return []; // If `separator` is not a regex, use native split

      if (!_isRegexp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0; // Make `global` and avoid `lastIndex` issues by working with a copy

      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;

      while (match = _regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX$1];

        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }

        if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
      }

      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));

      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    }; // Chakra, V8

  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function internalSplit(separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [// `String.prototype.split` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.split
  function split(separator, limit) {
    var O = defined(this);
    var splitter = separator == undefined ? undefined : separator[SPLIT];
    return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
  }, // `RegExp.prototype[@@split]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
  //
  // NOTE: This cannot be properly polyfilled in engines that don't support
  // the 'y' flag.
  function (regexp, limit) {
    var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var C = _speciesConstructor(rx, RegExp);
    var unicodeMatching = rx.unicode;
    var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
    // simulate the 'y' flag.

    var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
    var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
    if (lim === 0) return [];
    if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
    var p = 0;
    var q = 0;
    var A = [];

    while (q < S.length) {
      splitter.lastIndex = SUPPORTS_Y ? q : 0;
      var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
      var e;

      if (z === null || (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
        q = _advanceStringIndex(S, q, unicodeMatching);
      } else {
        A.push(S.slice(p, q));
        if (A.length === lim) return A;

        for (var i = 1; i <= z.length - 1; i++) {
          A.push(z[i]);
          if (A.length === lim) return A;
        }

        q = p = e;
      }
    }

    A.push(S.slice(p));
    return A;
  }];
});

// 7.2.9 SameValue(x, y)
var _sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

_fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
  return [// `String.prototype.search` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.search
  function search(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, // `RegExp.prototype[@@search]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
  function (regexp) {
    var res = maybeCallNative($search, regexp, this);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var previousLastIndex = rx.lastIndex;
    if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
    var result = _regexpExecAbstract(rx, S);
    if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
    return result === null ? -1 : result.index;
  }];
});

if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _flags });


var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function define(fn) {
  _redefine(RegExp.prototype, TO_STRING, fn, true);
}; // 21.2.5.14 RegExp.prototype.toString()


if (_fails(function () {
  return $toString.call({
    source: 'a',
    flags: 'b' }) !=
  '/a/b';
})) {
  define(function toString() {
    var R = _anObject(this);
    return '/'.concat(R.source, '/', 'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
  }); // FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

var SET = 'Set'; // 23.2 Set Objects

var es6_set = _collection(SET, function (get) {
  return function Set() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  } },
_collectionStrong);

var f$6 = _wks;
var _wksExt = {
  f: f$6 };


var defineProperty = _objectDp.f;

var _wksDefine = function _wksDefine(name) {
  var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, {
    value: _wksExt.f(name) });

};

var _enumKeys = function _enumKeys(it) {
  var result = _objectKeys(it);
  var getSymbols = _objectGops.f;

  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = _objectPie.f;
    var i = 0;
    var key;

    while (symbols.length > i) {
      if (isEnum.call(it, key = symbols[i++])) result.push(key);
    }
  }

  return result;
};

var gOPN$1 = _objectGopn.f;
var toString$1 = {}.toString;
var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function getWindowNames(it) {
  try {
    return gOPN$1(it);
  } catch (e) {
    return windowNames.slice();
  }
};

var f$7 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
};

var _objectGopnExt = {
  f: f$7 };


var META = _meta.KEY;
var gOPD$2 = _objectGopd.f;
var dP$3 = _objectDp.f;
var gOPN$2 = _objectGopnExt.f;
var $Symbol = _global.Symbol;
var $JSON = _global.JSON;

var _stringify = $JSON && $JSON.stringify;

var PROTOTYPE$2 = 'prototype';
var HIDDEN = _wks('_hidden');
var TO_PRIMITIVE$1 = _wks('toPrimitive');
var isEnum$1 = {}.propertyIsEnumerable;
var SymbolRegistry = _shared('symbol-registry');
var AllSymbols = _shared('symbols');
var OPSymbols = _shared('op-symbols');
var ObjectProto$1 = Object[PROTOTYPE$2];
var USE_NATIVE$1 = typeof $Symbol == 'function';
var QObject = _global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

var setSymbolDesc = _descriptors && _fails(function () {
  return _objectCreate(dP$3({}, 'a', {
    get: function get() {
      return dP$3(this, 'a', {
        value: 7 }).
      a;
    } })).
  a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD$2(ObjectProto$1, key);
  if (protoDesc) delete ObjectProto$1[key];
  dP$3(it, key, D);
  if (protoDesc && it !== ObjectProto$1) dP$3(ObjectProto$1, key, protoDesc);
} : dP$3;

var wrap = function wrap(tag) {
  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);

  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
  _anObject(it);
  key = _toPrimitive(key, true);
  _anObject(D);

  if (_has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!_has(it, HIDDEN)) dP$3(it, HIDDEN, _propertyDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _objectCreate(D, {
        enumerable: _propertyDesc(0, false) });

    }

    return setSymbolDesc(it, key, D);
  }

  return dP$3(it, key, D);
};

var $defineProperties = function defineProperties(it, P) {
  _anObject(it);
  var keys = _enumKeys(P = _toIobject(P));
  var i = 0;
  var l = keys.length;
  var key;

  while (l > i) {
    $defineProperty(it, key = keys[i++], P[key]);
  }

  return it;
};

var $create = function create(it, P) {
  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
};

var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum$1.call(this, key = _toPrimitive(key, true));
  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = _toIobject(it);
  key = _toPrimitive(key, true);
  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
  var D = gOPD$2(it, key);
  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};

var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN$2(_toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  }

  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto$1;
  var names = gOPN$2(IS_OP ? OPSymbols : _toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
  }

  return result;
}; // 19.4.1.1 Symbol([description])


if (!USE_NATIVE$1) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);

    var $set = function $set(value) {
      if (this === ObjectProto$1) $set.call(OPSymbols, value);
      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, _propertyDesc(1, value));
    };

    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, {
      configurable: true,
      set: $set });

    return wrap(tag);
  };

  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
    return this._k;
  });
  _objectGopd.f = $getOwnPropertyDescriptor;
  _objectDp.f = $defineProperty;
  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
  _objectPie.f = $propertyIsEnumerable;
  _objectGops.f = $getOwnPropertySymbols;

  if (_descriptors && !_library) {
    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  _wksExt.f = function (name) {
    return wrap(_wks(name));
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE$1, {
  Symbol: $Symbol });


for (var es6Symbols = // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
  _wks(es6Symbols[j++]);
}

for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) {
  _wksDefine(wellKnownSymbols[k++]);
}

_export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function _for(key) {
    return _has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

    for (var key in SymbolRegistry) {
      if (SymbolRegistry[key] === sym) return key;
    }
  },
  useSetter: function useSetter() {
    setter = true;
  },
  useSimple: function useSimple() {
    setter = false;
  } });

_export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols });
// 24.3.2 JSON.stringify(value [, replacer [, space]])

$JSON && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
  var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols

  return _stringify([S]) != '[null]' || _stringify({
    a: S }) !=
  '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;

    while (arguments.length > i) {
      args.push(arguments[i++]);
    }

    $replacer = replacer = args[1];
    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

    if (!_isArray(replacer)) replacer = function replacer(key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  } });
// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

$Symbol[PROTOTYPE$2][TO_PRIMITIVE$1] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE$1, $Symbol[PROTOTYPE$2].valueOf); // 19.4.3.5 Symbol.prototype[@@toStringTag]

_setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

_setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

_setToStringTag(_global.JSON, 'JSON', true);

_wksDefine('asyncIterator');

var _stringRepeat = function repeat(count) {
  var str = String(_defined(this));
  var res = '';
  var n = _toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");

  for (; n > 0; (n >>>= 1) && (str += str)) {
    if (n & 1) res += str;
  }

  return res;
};

var _stringPad = function _stringPad(that, maxLength, fillString, left) {
  var S = String(_defined(that));
  var stringLength = S.length;
  var fillStr = fillString === undefined ? ' ' : String(fillString);
  var intMaxLength = _toLength(maxLength);
  if (intMaxLength <= stringLength || fillStr == '') return S;
  var fillLen = intMaxLength - stringLength;
  var stringFiller = _stringRepeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

// https://github.com/zloirock/core-js/issues/280


var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);
_export(_export.P + _export.F * WEBKIT_BUG, 'String', {
  padStart: function padStart(maxLength
  /* , fillString = ' ' */)
  {
    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  } });


// https://github.com/zloirock/core-js/issues/280


var WEBKIT_BUG$1 = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);
_export(_export.P + _export.F * WEBKIT_BUG$1, 'String', {
  padEnd: function padEnd(maxLength
  /* , fillString = ' ' */)
  {
    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  } });


var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var space = '[' + _stringWs + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function exporter(KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = _fails(function () {
    return !!_stringWs[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  _export(_export.P + _export.F * FORCE, 'String', exp);
}; // 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim


var trim = exporter.trim = function (string, TYPE) {
  string = String(_defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

var _stringTrim = exporter;

_stringTrim('trimLeft', function ($trim) {
  return function trimLeft() {
    return $trim(this, 1);
  };
}, 'trimStart');

_stringTrim('trimRight', function ($trim) {
  return function trimRight() {
    return $trim(this, 2);
  };
}, 'trimEnd');

var TYPED = _uid('typed_array');
var VIEW = _uid('view');
var ABV = !!(_global.ArrayBuffer && _global.DataView);
var CONSTR = ABV;
var i$1 = 0;
var l = 9;
var Typed;
var TypedArrayConstructors = 'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'.split(',');

while (i$1 < l) {
  if (Typed = _global[TypedArrayConstructors[i$1++]]) {
    _hide(Typed.prototype, TYPED, true);
    _hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

var _typed = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW };


var _toIndex = function _toIndex(it) {
  if (it === undefined) return 0;
  var number = _toInteger(it);
  var length = _toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

var _arrayFill = function fill(value
/* , start = 0, end = @length */)
{
  var O = _toObject(this);
  var length = _toLength(O.length);
  var aLen = arguments.length;
  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);

  while (endPos > index) {
    O[index++] = value;
  }

  return O;
};

var _typedBuffer = createCommonjsModule(function (module, exports) {

  var gOPN = _objectGopn.f;
  var dP = _objectDp.f;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length!';
  var WRONG_INDEX = 'Wrong index!';
  var $ArrayBuffer = _global[ARRAY_BUFFER];
  var $DataView = _global[DATA_VIEW];
  var Math = _global.Math;
  var RangeError = _global.RangeError; // eslint-disable-next-line no-shadow-restricted-names

  var Infinity = _global.Infinity;
  var BaseBuffer = $ArrayBuffer;
  var abs = Math.abs;
  var pow = Math.pow;
  var floor = Math.floor;
  var log = Math.log;
  var LN2 = Math.LN2;
  var BUFFER = 'buffer';
  var BYTE_LENGTH = 'byteLength';
  var BYTE_OFFSET = 'byteOffset';
  var $BUFFER = _descriptors ? '_b' : BUFFER;
  var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
  var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET; // IEEE754 conversions based on https://github.com/feross/ieee754

  function packIEEE754(value, mLen, nBytes) {
    var buffer = new Array(nBytes);
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var i = 0;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    var e, m, c;
    value = abs(value); // eslint-disable-next-line no-self-compare

    if (value != value || value === Infinity) {
      // eslint-disable-next-line no-self-compare
      m = value != value ? 1 : 0;
      e = eMax;
    } else {
      e = floor(log(value) / LN2);

      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }

      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }

      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8) {
    }

    e = e << mLen | m;
    eLen += mLen;

    for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8) {
    }

    buffer[--i] |= s * 128;
    return buffer;
  }

  function unpackIEEE754(buffer, mLen, nBytes) {
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = eLen - 7;
    var i = nBytes - 1;
    var s = buffer[i--];
    var e = s & 127;
    var m;
    s >>= 7;

    for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8) {
    }

    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;

    for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8) {
    }

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    }

    return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function unpackI32(bytes) {
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }

  function packI8(it) {
    return [it & 0xff];
  }

  function packI16(it) {
    return [it & 0xff, it >> 8 & 0xff];
  }

  function packI32(it) {
    return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
  }

  function packF64(it) {
    return packIEEE754(it, 52, 8);
  }

  function packF32(it) {
    return packIEEE754(it, 23, 4);
  }

  function addGetter(C, key, internal) {
    dP(C[PROTOTYPE], key, {
      get: function get() {
        return this[internal];
      } });

  }

  function get(view, bytes, index, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = store.slice(start, start + bytes);
    return isLittleEndian ? pack : pack.reverse();
  }

  function set(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = conversion(+value);

    for (var i = 0; i < bytes; i++) {
      store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
    }
  }

  if (!_typed.ABV) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = _toIndex(length);
      this._b = _arrayFill.call(new Array(byteLength), 0);
      this[$LENGTH] = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      _anInstance(this, $DataView, DATA_VIEW);
      _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = buffer[$LENGTH];
      var offset = _toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
      byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
      this[$BUFFER] = buffer;
      this[$OFFSET] = offset;
      this[$LENGTH] = byteLength;
    };

    if (_descriptors) {
      addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
      addGetter($DataView, BUFFER, '_b');
      addGetter($DataView, BYTE_LENGTH, '_l');
      addGetter($DataView, BYTE_OFFSET, '_o');
    }

    _redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset
      /* , littleEndian */)
      {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset
      /* , littleEndian */)
      {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset
      /* , littleEndian */)
      {
        return unpackI32(get(this, 4, byteOffset, arguments[1]));
      },
      getUint32: function getUint32(byteOffset
      /* , littleEndian */)
      {
        return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset
      /* , littleEndian */)
      {
        return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
      },
      getFloat64: function getFloat64(byteOffset
      /* , littleEndian */)
      {
        return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
      },
      setInt8: function setInt8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setInt16: function setInt16(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value
      /* , littleEndian */)
      {
        set(this, 8, byteOffset, packF64, value, arguments[2]);
      } });

  } else {
    if (!_fails(function () {
      $ArrayBuffer(1);
    }) || !_fails(function () {
      new $ArrayBuffer(-1); // eslint-disable-line no-new
    }) || _fails(function () {
      new $ArrayBuffer(); // eslint-disable-line no-new

      new $ArrayBuffer(1.5); // eslint-disable-line no-new

      new $ArrayBuffer(NaN); // eslint-disable-line no-new

      return $ArrayBuffer.name != ARRAY_BUFFER;
    })) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer);
        return new BaseBuffer(_toIndex(length));
      };

      var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];

      for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
        if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
      }

      ArrayBufferProto.constructor = $ArrayBuffer;
    } // iOS Safari 7.x bug


    var view = new $DataView(new $ArrayBuffer(2));
    var $setInt8 = $DataView[PROTOTYPE].setInt8;
    view.setInt8(0, 2147483648);
    view.setInt8(1, 2147483649);
    if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
      setInt8: function setInt8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      } },
    true);
  }

  _setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  _setToStringTag($DataView, DATA_VIEW);
  _hide($DataView[PROTOTYPE], _typed.VIEW, true);
  exports[ARRAY_BUFFER] = $ArrayBuffer;
  exports[DATA_VIEW] = $DataView;
});

var ArrayBuffer = _global.ArrayBuffer;
var $ArrayBuffer = _typedBuffer.ArrayBuffer;
var $DataView = _typedBuffer.DataView;
var $isView = _typed.ABV && ArrayBuffer.isView;
var $slice = $ArrayBuffer.prototype.slice;
var VIEW$1 = _typed.VIEW;
var ARRAY_BUFFER = 'ArrayBuffer';
_export(_export.G + _export.W + _export.F * (ArrayBuffer !== $ArrayBuffer), {
  ArrayBuffer: $ArrayBuffer });

_export(_export.S + _export.F * !_typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return $isView && $isView(it) || _isObject(it) && VIEW$1 in it;
  } });

_export(_export.P + _export.U + _export.F * _fails(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if ($slice !== undefined && end === undefined) return $slice.call(_anObject(this), start); // FF fix

    var len = _anObject(this).byteLength;
    var first = _toAbsoluteIndex(start, len);
    var fin = _toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (_speciesConstructor(this, $ArrayBuffer))(_toLength(fin - first));
    var viewS = new $DataView(this);
    var viewT = new $DataView(result);
    var index = 0;

    while (first < fin) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    }

    return result;
  } });

_setSpecies(ARRAY_BUFFER);

// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex

var _arrayMethods = function _arrayMethods(TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;

    for (; length > index; index++) {
      if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);

        if (TYPE) {
          if (IS_MAP) result[index] = res; // map
          else if (res) switch (TYPE) {
              case 3:
                return true;
              // some

              case 5:
                return val;
              // find

              case 6:
                return index;
              // findIndex

              case 2:
                result.push(val);
              // filter
            } else if (IS_EVERY) return false; // every
        }
      }
    }

    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()


var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target

  this._i = 0; // next index

  this._k = kind; // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;

  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }

  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)

_iterators.Arguments = _iterators.Array;
_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var _arrayCopyWithin = [].copyWithin || function copyWithin(target
/* = 0 */,
start
/* = 0, end = @length */)
{
  var O = _toObject(this);
  var len = _toLength(O.length);
  var to = _toAbsoluteIndex(target, len);
  var from = _toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;

  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }

  while (count-- > 0) {
    if (from in O) O[to] = O[from];else delete O[to];
    to += inc;
    from += inc;
  }

  return O;
};

var _typedArray = createCommonjsModule(function (module) {

  if (_descriptors) {
    var LIBRARY = _library;
    var global = _global;
    var fails = _fails;
    var $export = _export;
    var $typed = _typed;
    var $buffer = _typedBuffer;
    var ctx = _ctx;
    var anInstance = _anInstance;
    var propertyDesc = _propertyDesc;
    var hide = _hide;
    var redefineAll = _redefineAll;
    var toInteger = _toInteger;
    var toLength = _toLength;
    var toIndex = _toIndex;
    var toAbsoluteIndex = _toAbsoluteIndex;
    var toPrimitive = _toPrimitive;
    var has = _has;
    var classof = _classof;
    var isObject = _isObject;
    var toObject = _toObject;
    var isArrayIter = _isArrayIter;
    var create = _objectCreate;
    var getPrototypeOf = _objectGpo;
    var gOPN = _objectGopn.f;
    var getIterFn = core_getIteratorMethod;
    var uid = _uid;
    var wks = _wks;
    var createArrayMethod = _arrayMethods;
    var createArrayIncludes = _arrayIncludes;
    var speciesConstructor = _speciesConstructor;
    var ArrayIterators = es6_array_iterator;
    var Iterators = _iterators;
    var $iterDetect = _iterDetect;
    var setSpecies = _setSpecies;
    var arrayFill = _arrayFill;
    var arrayCopyWithin = _arrayCopyWithin;
    var $DP = _objectDp;
    var $GOPD = _objectGopd;
    var dP = $DP.f;
    var gOPD = $GOPD.f;
    var RangeError = global.RangeError;
    var TypeError = global.TypeError;
    var Uint8Array = global.Uint8Array;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var PROTOTYPE = 'prototype';
    var ArrayProto = Array[PROTOTYPE];
    var $ArrayBuffer = $buffer.ArrayBuffer;
    var $DataView = $buffer.DataView;
    var arrayForEach = createArrayMethod(0);
    var arrayFilter = createArrayMethod(2);
    var arraySome = createArrayMethod(3);
    var arrayEvery = createArrayMethod(4);
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var arrayIncludes = createArrayIncludes(true);
    var arrayIndexOf = createArrayIncludes(false);
    var arrayValues = ArrayIterators.values;
    var arrayKeys = ArrayIterators.keys;
    var arrayEntries = ArrayIterators.entries;
    var arrayLastIndexOf = ArrayProto.lastIndexOf;
    var arrayReduce = ArrayProto.reduce;
    var arrayReduceRight = ArrayProto.reduceRight;
    var arrayJoin = ArrayProto.join;
    var arraySort = ArrayProto.sort;
    var arraySlice = ArrayProto.slice;
    var arrayToString = ArrayProto.toString;
    var arrayToLocaleString = ArrayProto.toLocaleString;
    var ITERATOR = wks('iterator');
    var TAG = wks('toStringTag');
    var TYPED_CONSTRUCTOR = uid('typed_constructor');
    var DEF_CONSTRUCTOR = uid('def_constructor');
    var ALL_CONSTRUCTORS = $typed.CONSTR;
    var TYPED_ARRAY = $typed.TYPED;
    var VIEW = $typed.VIEW;
    var WRONG_LENGTH = 'Wrong length!';
    var $map = createArrayMethod(1, function (O, length) {
      return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
    });
    var LITTLE_ENDIAN = fails(function () {
      // eslint-disable-next-line no-undef
      return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    });
    var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
      new Uint8Array(1).set({});
    });

    var toOffset = function toOffset(it, BYTES) {
      var offset = toInteger(it);
      if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
      return offset;
    };

    var validate = function validate(it) {
      if (isObject(it) && TYPED_ARRAY in it) return it;
      throw TypeError(it + ' is not a typed array!');
    };

    var allocate = function allocate(C, length) {
      if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
        throw TypeError('It is not a typed array constructor!');
      }

      return new C(length);
    };

    var speciesFromList = function speciesFromList(O, list) {
      return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
    };

    var fromList = function fromList(C, list) {
      var index = 0;
      var length = list.length;
      var result = allocate(C, length);

      while (length > index) {
        result[index] = list[index++];
      }

      return result;
    };

    var addGetter = function addGetter(it, key, internal) {
      dP(it, key, {
        get: function get() {
          return this._d[internal];
        } });

    };

    var $from = function from(source
    /* , mapfn, thisArg */)
    {
      var O = toObject(source);
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iterFn = getIterFn(O);
      var i, length, values, result, step, iterator;

      if (iterFn != undefined && !isArrayIter(iterFn)) {
        for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
          values.push(step.value);
        }

        O = values;
      }

      if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);

      for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }

      return result;
    };

    var $of = function of()
    /* ...items */
    {
      var index = 0;
      var length = arguments.length;
      var result = allocate(this, length);

      while (length > index) {
        result[index] = arguments[index++];
      }

      return result;
    }; // iOS Safari 6.x fails here


    var TO_LOCALE_BUG = !!Uint8Array && fails(function () {
      arrayToLocaleString.call(new Uint8Array(1));
    });

    var $toLocaleString = function toLocaleString() {
      return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
    };

    var proto = {
      copyWithin: function copyWithin(target, start
      /* , end */)
      {
        return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
      },
      every: function every(callbackfn
      /* , thisArg */)
      {
        return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      fill: function fill(value
      /* , start, end */)
      {
        // eslint-disable-line no-unused-vars
        return arrayFill.apply(validate(this), arguments);
      },
      filter: function filter(callbackfn
      /* , thisArg */)
      {
        return speciesFromList(this, arrayFilter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined));
      },
      find: function find(predicate
      /* , thisArg */)
      {
        return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      findIndex: function findIndex(predicate
      /* , thisArg */)
      {
        return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      forEach: function forEach(callbackfn
      /* , thisArg */)
      {
        arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      indexOf: function indexOf(searchElement
      /* , fromIndex */)
      {
        return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      includes: function includes(searchElement
      /* , fromIndex */)
      {
        return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      join: function join(separator) {
        // eslint-disable-line no-unused-vars
        return arrayJoin.apply(validate(this), arguments);
      },
      lastIndexOf: function lastIndexOf(searchElement
      /* , fromIndex */)
      {
        // eslint-disable-line no-unused-vars
        return arrayLastIndexOf.apply(validate(this), arguments);
      },
      map: function map(mapfn
      /* , thisArg */)
      {
        return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      reduce: function reduce(callbackfn
      /* , initialValue */)
      {
        // eslint-disable-line no-unused-vars
        return arrayReduce.apply(validate(this), arguments);
      },
      reduceRight: function reduceRight(callbackfn
      /* , initialValue */)
      {
        // eslint-disable-line no-unused-vars
        return arrayReduceRight.apply(validate(this), arguments);
      },
      reverse: function reverse() {
        var that = this;
        var length = validate(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;

        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        }

        return that;
      },
      some: function some(callbackfn
      /* , thisArg */)
      {
        return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      sort: function sort(comparefn) {
        return arraySort.call(validate(this), comparefn);
      },
      subarray: function subarray(begin, end) {
        var O = validate(this);
        var length = O.length;
        var $begin = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(O.buffer, O.byteOffset + $begin * O.BYTES_PER_ELEMENT, toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin));
      } };


    var $slice = function slice(start, end) {
      return speciesFromList(this, arraySlice.call(validate(this), start, end));
    };

    var $set = function set(arrayLike
    /* , offset */)
    {
      validate(this);
      var offset = toOffset(arguments[1], 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError(WRONG_LENGTH);

      while (index < len) {
        this[offset + index] = src[index++];
      }
    };

    var $iterators = {
      entries: function entries() {
        return arrayEntries.call(validate(this));
      },
      keys: function keys() {
        return arrayKeys.call(validate(this));
      },
      values: function values() {
        return arrayValues.call(validate(this));
      } };


    var isTAIndex = function isTAIndex(target, key) {
      return isObject(target) && target[TYPED_ARRAY] && typeof key != 'symbol' && key in target && String(+key) == String(key);
    };

    var $getDesc = function getOwnPropertyDescriptor(target, key) {
      return isTAIndex(target, key = toPrimitive(key, true)) ? propertyDesc(2, target[key]) : gOPD(target, key);
    };

    var $setDesc = function defineProperty(target, key, desc) {
      if (isTAIndex(target, key = toPrimitive(key, true)) && isObject(desc) && has(desc, 'value') && !has(desc, 'get') && !has(desc, 'set') // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable && (!has(desc, 'writable') || desc.writable) && (!has(desc, 'enumerable') || desc.enumerable)) {
        target[key] = desc.value;
        return target;
      }

      return dP(target, key, desc);
    };

    if (!ALL_CONSTRUCTORS) {
      $GOPD.f = $getDesc;
      $DP.f = $setDesc;
    }

    $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
      getOwnPropertyDescriptor: $getDesc,
      defineProperty: $setDesc });


    if (fails(function () {
      arrayToString.call({});
    })) {
      arrayToString = arrayToLocaleString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var $TypedArrayPrototype$ = redefineAll({}, proto);
    redefineAll($TypedArrayPrototype$, $iterators);
    hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
    redefineAll($TypedArrayPrototype$, {
      slice: $slice,
      set: $set,
      constructor: function constructor() {
        /* noop */
      },
      toString: arrayToString,
      toLocaleString: $toLocaleString });

    addGetter($TypedArrayPrototype$, 'buffer', 'b');
    addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
    addGetter($TypedArrayPrototype$, 'byteLength', 'l');
    addGetter($TypedArrayPrototype$, 'length', 'e');
    dP($TypedArrayPrototype$, TAG, {
      get: function get() {
        return this[TYPED_ARRAY];
      } });
    // eslint-disable-next-line max-statements

    module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
      CLAMPED = !!CLAMPED;
      var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + KEY;
      var SETTER = 'set' + KEY;
      var TypedArray = global[NAME];
      var Base = TypedArray || {};
      var TAC = TypedArray && getPrototypeOf(TypedArray);
      var FORCED = !TypedArray || !$typed.ABV;
      var O = {};
      var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];

      var getter = function getter(that, index) {
        var data = that._d;
        return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
      };

      var setter = function setter(that, index, value) {
        var data = that._d;
        if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
        data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
      };

      var addElement = function addElement(that, index) {
        dP(that, index, {
          get: function get() {
            return getter(this, index);
          },
          set: function set(value) {
            return setter(this, index, value);
          },
          enumerable: true });

      };

      if (FORCED) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME, '_d');
          var index = 0;
          var offset = 0;
          var buffer, byteLength, length, klass;

          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new $ArrayBuffer(byteLength);
          } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            buffer = data;
            offset = toOffset($offset, BYTES);
            var $len = data.byteLength;

            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - offset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
            }

            length = byteLength / BYTES;
          } else if (TYPED_ARRAY in data) {
            return fromList(TypedArray, data);
          } else {
            return $from.call(TypedArray, data);
          }

          hide(that, '_d', {
            b: buffer,
            o: offset,
            l: byteLength,
            e: length,
            v: new $DataView(buffer) });


          while (index < length) {
            addElement(that, index++);
          }
        });
        TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
        hide(TypedArrayPrototype, 'constructor', TypedArray);
      } else if (!fails(function () {
        TypedArray(1);
      }) || !fails(function () {
        new TypedArray(-1); // eslint-disable-line no-new
      }) || !$iterDetect(function (iter) {
        new TypedArray(); // eslint-disable-line no-new

        new TypedArray(null); // eslint-disable-line no-new

        new TypedArray(1.5); // eslint-disable-line no-new

        new TypedArray(iter); // eslint-disable-line no-new
      }, true)) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME);
          var klass; // `ws` module bug, temporarily remove validation length for Uint8Array
          // https://github.com/websockets/ws/pull/645

          if (!isObject(data)) return new Base(toIndex(data));

          if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            return $length !== undefined ? new Base(data, toOffset($offset, BYTES), $length) : $offset !== undefined ? new Base(data, toOffset($offset, BYTES)) : new Base(data);
          }

          if (TYPED_ARRAY in data) return fromList(TypedArray, data);
          return $from.call(TypedArray, data);
        });
        arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
          if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
        });
        TypedArray[PROTOTYPE] = TypedArrayPrototype;
        if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
      }

      var $nativeIterator = TypedArrayPrototype[ITERATOR];
      var CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
      var $iterator = $iterators.values;
      hide(TypedArray, TYPED_CONSTRUCTOR, true);
      hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
      hide(TypedArrayPrototype, VIEW, true);
      hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

      if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
        dP(TypedArrayPrototype, TAG, {
          get: function get() {
            return NAME;
          } });

      }

      O[NAME] = TypedArray;
      $export($export.G + $export.W + $export.F * (TypedArray != Base), O);
      $export($export.S, NAME, {
        BYTES_PER_ELEMENT: BYTES });

      $export($export.S + $export.F * fails(function () {
        Base.of.call(TypedArray, 1);
      }), NAME, {
        from: $from,
        of: $of });

      if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);
      $export($export.P, NAME, proto);
      setSpecies(NAME);
      $export($export.P + $export.F * FORCED_SET, NAME, {
        set: $set });

      $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);
      if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;
      $export($export.P + $export.F * fails(function () {
        new TypedArray(1).slice();
      }), NAME, {
        slice: $slice });

      $export($export.P + $export.F * (fails(function () {
        return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
      }) || !fails(function () {
        TypedArrayPrototype.toLocaleString.call([1, 2]);
      })), NAME, {
        toLocaleString: $toLocaleString });

      Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
      if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
    };
  } else module.exports = function () {
    /* empty */
  };
});

_typedArray('Int8', 1, function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint8', 1, function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

_typedArray('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint16', 2, function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Int32', 4, function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint32', 4, function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Float32', 4, function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var runtime = createCommonjsModule(function (module) {
  /**
                                                       * Copyright (c) 2014-present, Facebook, Inc.
                                                       *
                                                       * This source code is licensed under the MIT license found in the
                                                       * LICENSE file in the root directory of this source tree.
                                                       */
  !function (global) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.

    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    var runtime = global.regeneratorRuntime;

    if (runtime) {
      {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      } // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.


      return;
    } // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.


    runtime = global.regeneratorRuntime = module.exports;

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.

      generator._invoke = makeInvokeMethod(innerFn, self, context);
      return generator;
    }

    runtime.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.

    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg) };

      } catch (err) {
        return {
          type: "throw",
          arg: err };

      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.

    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.

    function Generator() {}

    function GeneratorFunction() {}

    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.


    var IteratorPrototype = {};

    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.

    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    runtime.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;

        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }

      genFun.prototype = Object.create(Gp);
      return genFun;
    }; // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.


    runtime.awrap = function (arg) {
      return {
        __await: arg };

    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);

        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;

          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            resolve(result);
          }, reject);
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      } // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).


      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };

    runtime.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.

    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          } // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);

          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done };

          } else if (record.type === "throw") {
            state = GenStateCompleted; // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.

            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    } // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.


    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];

      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          if (delegate.iterator.return) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.

        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      } // The delegate iterator is finished, so forget it and continue with
      // the outer generator.


      context.delegate = null;
      return ContinueSentinel;
    } // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.


    defineIteratorMethods(Gp);
    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0] };


      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{
        tryLoc: "root" }];

      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function (object) {
      var keys = [];

      for (var key in object) {
        keys.push(key);
      }

      keys.reverse(); // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.

      return function next() {
        while (keys.length) {
          var key = keys.pop();

          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        } // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.


        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];

        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
          next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;
            return next;
          };

          return next.next = next;
        }
      } // Return an iterator with no values.


      return {
        next: doneResult };

    }

    runtime.values = values;

    function doneResult() {
      return {
        value: undefined$1,
        done: true };

    }

    Context.prototype = {
      constructor: Context,
      reset: function reset(skipTempReset) {
        this.prev = 0;
        this.next = 0; // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.

        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function stop() {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;

        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },
      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;

        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },
      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },
      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;

            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }

            return thrown;
          }
        } // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.


        throw new Error("illegal catch attempt");
      },
      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc };


        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      } };

  }( // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  function () {
    return this;
  }() || Function("return this")());
});

/**
     * Appcelerator Titanium Mobile
     * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
     * Licensed under the terms of the Apache Public License
     * Please see the LICENSE included with this distribution for details.
     */
// Add a toJSON() method to all Error objects needed to output non-enumerable properties.
// The JSON.stringify() will automatically call this method if it exists to provide custom output.
// Notes:
// - In V8, all Error properties are not enumerable. We need this or else stringify() will return "{}".
// - In JavaScriptCore, only the "stack" property is not enumerable. We want to reveal this.
if (typeof Error.prototype.toJSON !== 'function') {
  Error.prototype.toJSON = function () {
    var properties = {};
    Object.getOwnPropertyNames(this).forEach(function (name) {
      properties[name] = this[name];
    }, this);
    return properties;
  };
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2019 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   */
if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
  var buffer = Ti.createBuffer({
    value: '' });

  var blob = buffer.toBlob();

  blob.constructor.prototype.toString = function () {
    return this.text;
  };
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2019 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   */
var colorset;
var osVersion; // As Android passes a new instance of Ti.UI to every JS file we can't just
// Ti.UI within this file, we must call kroll.binding to get the Titanium
// namespace that is passed in with require and that deal with the .UI
// namespace that is on that directly.

var uiModule = Ti.UI;

if (Ti.Android) {
  uiModule = kroll.binding('Titanium').Titanium.UI;
}

uiModule.SEMANTIC_COLOR_TYPE_LIGHT = 'light';
uiModule.SEMANTIC_COLOR_TYPE_DARK = 'dark'; // We need to track this manually with a getter/setter
// due to the same reasons we use uiModule instead of Ti.UI

var currentColorType = uiModule.SEMANTIC_COLOR_TYPE_LIGHT;
Object.defineProperty(uiModule, 'semanticColorType', {
  get: function get() {
    return currentColorType;
  },
  set: function set(colorType) {
    currentColorType = colorType;
  } });


uiModule.fetchSemanticColor = function fetchSemanticColor(colorName) {
  if (!osVersion) {
    osVersion = parseInt(Ti.Platform.version.split('.')[0]);
  }

  if (Ti.App.iOS && osVersion >= 13) {
    return Ti.UI.iOS.fetchSemanticColor(colorName);
  } else {
    if (!colorset) {
      try {
        colorset = require('/semantic.colors.json'); // eslint-disable-line import/no-absolute-path
      } catch (error) {
        console.error('Failed to require colors file at /semantic.colors.json');
        return;
      }
    }

    try {
      return colorset[colorName][uiModule.semanticColorType].color || colorset[colorName][uiModule.semanticColorType];
    } catch (error) {
      console.log("Failed to lookup color for ".concat(colorName));
    }
  }
};

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
    args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true } });


  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true } });


    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/**
   * @param {EventEmitter} emitter the EventEmitter instance to use to register for it's events
   * @param {string} eventName the name of the event to register for
   * @param {function} listener the listener callback/function to invoke when the event is emitted
   * @param {boolean} prepend whether to prepend or append the listener
   * @returns {EventEmitter}
   */
function _addListener(emitter, eventName, listener, prepend) {
  if (!emitter._eventsToListeners) {
    // no events/listeners registered
    emitter._eventsToListeners = {}; // initialize it
  } // if there's someone listening to 'newListener' events, emit that **before** we add the listener (to avoid infinite recursion)


  if (emitter._eventsToListeners.newListener) {
    emitter.emit('newListener', eventName, listener);
  }

  var eventListeners = emitter._eventsToListeners[eventName] || [];

  if (prepend) {
    eventListeners.unshift(listener);
  } else {
    eventListeners.push(listener);
  }

  emitter._eventsToListeners[eventName] = eventListeners; // Check max listeners and spit out warning if >

  var max = emitter.getMaxListeners();
  var length = eventListeners.length;

  if (max > 0 && length > max) {
    var w = new Error("Possible EventEmitter memory leak detected. ".concat(length, " ").concat(eventName, " listeners added. Use emitter.setMaxListeners() to increase limit"));
    w.name = 'MaxListenersExceededWarning';
    w.emitter = emitter;
    w.type = eventName;
    w.count = length;
    process.emitWarning(w);
  }

  return emitter;
}

function onceWrap(emitter, eventName, listener) {
  function wrapper() {
    this.emitter.removeListener(this.eventName, this.wrappedFunc); // remove ourselves

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.listener.apply(this.emitter, args); // then forward the event callback
  } // we have to use bind with a custom 'this', because events fire with 'this' pointing at the emitter


  var wrapperThis = {
    emitter,
    eventName,
    listener };

  var bound = wrapper.bind(wrapperThis); // bind to force "this" to refer to our custom object tracking the wrapper/emitter/listener

  bound.listener = listener; // have to add listener property for "unwrapping"

  wrapperThis.wrappedFunc = bound;
  return bound;
} // many consumers make use of this via util.inherits, which does not chain constructor calls!
// so we need to be aware that _eventsToListeners maye be null/undefined on instances, and check in methods before accessing it


var EventEmitter =
/*#__PURE__*/
function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this._eventsToListeners = {};
    this._maxListeners = undefined;
  }

  _createClass(EventEmitter, [{
    key: "addListener",
    value: function addListener(eventName, listener) {
      return _addListener(this, eventName, listener, false);
    } },
  {
    key: "on",
    value: function on(eventName, listener) {
      return this.addListener(eventName, listener);
    } },
  {
    key: "prependListener",
    value: function prependListener(eventName, listener) {
      return _addListener(this, eventName, listener, true);
    } },
  {
    key: "once",
    value: function once(eventName, listener) {
      this.on(eventName, onceWrap(this, eventName, listener));
    } },
  {
    key: "prependOnceListener",
    value: function prependOnceListener(eventName, listener) {
      this.prependListener(eventName, onceWrap(this, eventName, listener));
    } },
  {
    key: "removeListener",
    value: function removeListener(eventName, listener) {
      if (!this._eventsToListeners) {
        // no events/listeners registered
        return this;
      }

      var eventListeners = this._eventsToListeners[eventName] || [];
      var length = eventListeners.length;
      var foundIndex = -1;
      var unwrappedListener; // Need to search LIFO, and need to handle wrapped functions (once wrappers)

      for (var i = length - 1; i >= 0; i--) {
        if (eventListeners[i] === listener || eventListeners[i].listener === listener) {
          foundIndex = i;
          unwrappedListener = eventListeners[i].listener;
          break;
        }
      }

      if (foundIndex !== -1) {
        if (length === 1) {
          // length was 1 and we want to remove last entry, so delete the event type from our listener mapping now!
          delete this._eventsToListeners[eventName];
        } else {
          // we had 2+ listeners, so store array without this given listener
          eventListeners.splice(foundIndex, 1); // modifies in place, no need to assign to this.listeners[eventName]
        } // Don't emit if there's no listeners for 'removeListener' type!


        if (this._eventsToListeners.removeListener) {
          this.emit('removeListener', eventName, unwrappedListener || listener);
        }
      }

      return this;
    } },
  {
    key: "off",
    value: function off(eventName, listener) {
      return this.removeListener(eventName, listener);
    } },
  {
    key: "emit",
    value: function emit(eventName) {
      if (!this._eventsToListeners) {
        // no events/listeners registered
        return false;
      }

      var eventListeners = this._eventsToListeners[eventName] || [];

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = eventListeners.slice()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var listener = _step.value;
          // must operate on copy because listeners ,ay get remove as side-effect of calling
          listener.call.apply(listener, [this].concat(args));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return eventListeners.length !== 0;
    } },
  {
    key: "listenerCount",
    value: function listenerCount(eventName) {
      if (!this._eventsToListeners) {
        // no events/listeners registered
        return 0;
      }

      var eventListeners = this._eventsToListeners[eventName] || [];
      return eventListeners.length;
    } },
  {
    key: "eventNames",
    value: function eventNames() {
      return Object.getOwnPropertyNames(this._eventsToListeners || {});
    } },
  {
    key: "listeners",
    value: function listeners(eventName) {
      if (!this._eventsToListeners) {
        // no events/listeners registered
        return [];
      } // Need to "unwrap" once wrappers!


      var raw = this._eventsToListeners[eventName] || [];
      return raw.map(function (l) {
        return l.listener || l;
      }); // here we unwrap the once wrapper if there is one or fall back to listener function
    } },
  {
    key: "rawListeners",
    value: function rawListeners(eventName) {
      if (!this._eventsToListeners) {
        // no events/listeners registered
        return [];
      }

      return (this._eventsToListeners[eventName] || []).slice(0); // return a copy
    } },
  {
    key: "getMaxListeners",
    value: function getMaxListeners() {
      return this._maxListeners || EventEmitter.defaultMaxListeners;
    } },
  {
    key: "setMaxListeners",
    value: function setMaxListeners(n) {
      this._maxListeners = n; // TODO: Type check n, make sure >= 0 (o equals no limit)

      return this;
    } },
  {
    key: "removeAllListeners",
    value: function removeAllListeners(eventName) {
      var _this = this;

      if (!this._eventsToListeners) {
        // no events/listeners registered
        this._eventsToListeners = {}; // initialize it
      }

      if (!this._eventsToListeners.removeListener) {
        // no need to emit! we can just wipe!
        if (eventName === undefined) {
          // remove every type!
          this._eventsToListeners = {};
        } else {
          // remove specific type
          delete this._eventsToListeners[eventName];
        }

        return this;
      } // yuck, we'll have to emit 'removeListener' events as we go


      if (eventName === undefined) {
        // Remove all types (but do 'removeListener' last!)
        var names = Object.keys(this._eventsToListeners).filter(function (name) {
          return name !== 'removeListener';
        });
        names.forEach(function (name) {
          return _this.removeAllListeners(name);
        });
        this.removeAllListeners('removeListener');
        this._eventsToListeners = {};
      } else {
        // remove listeners for one type, back to front (Last-in, first-out, except where prepend f-ed it up)
        var listeners = this._eventsToListeners[eventName] || [];

        for (var i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(eventName, listeners[i]);
        }
      }

      return this;
    } }]);


  return EventEmitter;
}();
EventEmitter.defaultMaxListeners = 10;

EventEmitter.listenerCount = function (emitter, eventName) {
  return emitter.listenerCount(eventName);
};

EventEmitter.EventEmitter = EventEmitter;

/**
                                           * @param  {*} arg passed in argument value
                                           * @param  {string} name name of the argument
                                           * @param  {string} typename i.e. 'string', 'Function' (value is compared to typeof after lowercasing)
                                           * @return {void}
                                           * @throws {TypeError}
                                           */
function assertArgumentType(arg, name, typename) {
  var type = typeof arg;

  if (type !== typename.toLowerCase()) {
    throw new TypeError("The \"".concat(name, "\" argument must be of type ").concat(typename, ". Received type ").concat(type));
  }
}

var startTime = Date.now();
/**
                             * This function 'standardizes' the reported architectures to the equivalents reported by Node.js
                             * node values: 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.
                             * iOS values: "arm64", "armv7", "x86_64", "i386", "Unknown"
                             * Android values: "armeabi", "armeabi-v7a", "arm64-v8a", "x86", "x86_64", "mips", "mips64", "unknown"
                             * Windows values: "x64", "ia64", "ARM", "x86", "unknown"
                             * @param {string} original original architecture reported by Ti.Platform
                             * @returns {string}
                             */

function standardizeArch(original) {
  switch (original) {
    // coerce 'armv7', 'armeabi', 'armeabi-v7a', 'ARM' -> 'arm'
    // 'armeabi' is a dead ABI for Android, removed in NDK r17
    case 'armv7':
    case 'armeabi':
    case 'armeabi-v7a':
    case 'ARM':
      return 'arm';
    // coerce 'arm64-v8a' -> 'arm64'

    case 'arm64-v8a':
      return 'arm64';
    // coerce 'i386', 'x86' -> 'ia32'

    case 'i386':
    case 'x86':
      return 'ia32';
    // coerce 'x86_64', 'ia64', 'x64' -> 'x64'

    case 'x86_64':
    case 'ia64':
      return 'x64';
    // coerce 'mips64' -> 'mips' // 'mips' and 'mips64' are dead ABIs for Android, removed in NDK r17

    case 'mips64':
      return 'mips';
    // coerce 'Unknown' -> 'unknown'

    case 'Unknown':
      return 'unknown';

    default:
      return original;}

}

var process$4 = new EventEmitter();

process$4.abort = function () {}; // TODO: Do we have equivalent of forcibly killing the process? We have restart, but I think we just want a no-op stub here


process$4.arch = standardizeArch(Ti.Platform.architecture);
process$4.argv = []; // TODO: What makes sense here? path to titanium cli for first arg? path to ti.main/app.js for second?

Object.defineProperty(process$4, 'argv0', {
  value: '',
  // TODO: Path to .app on iOS?
  writable: false,
  enumerable: true,
  configurable: false });


process$4.binding = function () {
  throw new Error('process.binding is unsupported and not user-facing API');
};

process$4.channel = undefined;

process$4.chdir = function () {
  throw new Error('process.chdir is unsupported');
};

process$4.config = {};
process$4.connected = false;

process$4.cpuUsage = function () {
  // FIXME: Can we look at OS.cpus to get this data?
  return {
    user: 0,
    system: 0 };

};

process$4.cwd = function () {
  return __dirname;
};

Object.defineProperty(process$4, 'debugPort', {
  get: function get() {
    var value = 0; // default to 0

    try {
      if (Ti.Platform.osname === 'android') {
        var assets = kroll.binding('assets');
        var json = assets.readAsset('deploy.json');

        if (json) {
          var deployData = JSON.parse(json);

          if (deployData.debuggerPort !== -1) {
            // -1 means not set (not in debug mode)
            value = deployData.debuggerPort;
          }
        }
      } else if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
        // iOS is 27753 as of ios < 11.3 for simulators
        // for 11.3+ it uses a unix socket
        // for devices, it uses usbmuxd
        value = 27753; // TODO: Can we only return this for simulator < 11.3?
      }
    } catch (error) {} // ignore
    // overwrite this getter with static value


    Object.defineProperty(this, 'debugPort', {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true });

    return value;
  },
  enumerable: true,
  configurable: true });


process$4.disconnect = function () {}; // no-op


process$4.dlopen = function () {
  throw new Error('process.dlopen is not supported');
};

process$4.emitWarning = function (warning, options, code, ctor) {
  // eslint-disable-line no-unused-vars
  var type;
  var detail;

  if (typeof options === 'string') {
    type = options;
  } else if (typeof options === 'object') {
    type = options.type;
    code = options.code;
    detail = options.detail;
  }

  if (typeof warning === 'string') {
    // TODO: make use of `ctor` arg for limiting stack traces? Can only really be used on V8
    // set stack trace limit to 0, then call Error.captureStackTrace(warning, ctor);
    warning = new Error(warning);
    warning.name = type || 'Warning';

    if (code !== undefined) {
      warning.code = code;
    }

    if (detail !== undefined) {
      warning.detail = detail;
    }
  } // TODO: Throw TypeError if not an instanceof Error at this point!


  var isDeprecation = warning.name === 'DeprecationWarning';

  if (isDeprecation && process$4.noDeprecation) {
    return; // ignore
  }

  if (isDeprecation && process$4.throwDeprecation) {
    throw warning;
  }

  this.emit('warning', warning);
};

function loadEnvJson() {
  try {
    var jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '_env_.json');

    if (jsonFile.exists()) {
      return JSON.parse(jsonFile.read().text);
    }
  } catch (error) {
    Ti.API.error("Failed to read \"_env_.json\". Reason: ".concat(error.message));
  }

  return {};
}

Object.defineProperty(process$4, 'env', {
  get: function get() {
    delete this.env;
    return this.env = loadEnvJson();
  },
  enumerable: true,
  configurable: true });

process$4.execArgv = [];
process$4.execPath = ''; // FIXME: What makes sense here? Path to titanium CLI here?

process$4.exit = function () {
  throw new Error('process.exit is not supported');
};

process$4.exitCode = undefined;
process$4.noDeprecation = false;
process$4.pid = 0; // FIXME: Should we try and adopt 'windowsphone'/'windowsstore' to 'win32'?
// FIXME: Should we try and adopt 'ipad'/'iphone' to 'darwin'? or 'ios'?

process$4.platform = Ti.Platform.osname;
process$4.ppid = 0; // TODO: Add release property (Object)
// TODO: Can we expose stdout/stderr/stdin natively?

process$4.stderr = {
  isTTY: false,
  writable: true,
  write: function write(chunk, encoding, callback) {
    console.error(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$4.stdout = {
  isTTY: false,
  writable: true,
  write: function write(chunk, encoding, callback) {
    console.log(chunk);

    if (callback) {
      callback();
    }

    return true;
  } };

process$4.title = Ti.App.name;
process$4.throwDeprecation = false;
process$4.traceDeprecation = false;

process$4.umask = function () {
  return 0;
}; // just always return 0


process$4.uptime = function () {
  var diffMs = Date.now() - startTime;
  return diffMs / 1000.0; // convert to "seconds" with fractions
};

process$4.version = Ti.version;
process$4.versions = {
  modules: '',
  // TODO: Report module api version (for current platform!)
  v8: '',
  // TODO: report android's v8 version (if on Android!)
  jsc: '' // TODO: report javascriptcore version for iOS/WIndows?
  // TODO: Report ios/Android/Windows platform versions?
};

global.process = process$4; // handle spitting out warnings

var WARNING_PREFIX = "(titanium:".concat(process$4.pid, ") ");
process$4.on('warning', function (warning) {
  var isDeprecation = warning.name === 'DeprecationWarning'; // if we're not doing deprecations, ignore!

  if (isDeprecation && process$4.noDeprecation) {
    return;
  } // TODO: Check process.traceDeprecation and if set, include stack trace in message!


  var msg = WARNING_PREFIX;

  if (warning.code !== undefined) {
    msg += "[".concat(warning.code, "] ");
  }

  if (warning.toString) {
    msg += warning.toString();
  }

  if (warning.detail) {
    msg += "\n".concat(warning.detail);
  }

  console.error(msg);
});
var uncaughtExceptionCallback = null;

process$4.hasUncaughtExceptionCaptureCallback = function () {
  return uncaughtExceptionCallback !== null;
};

process$4.setUncaughtExceptionCaptureCallback = function (fn) {
  if (fn === null) {
    uncaughtExceptionCallback = null;
    return;
  }

  assertArgumentType(fn, 'fn', 'function');

  if (uncaughtExceptionCallback !== null) {
    throw new Error('`process.setUncaughtExceptionCaptureCallback()` was called while a capture callback was already active');
  }

  uncaughtExceptionCallback = fn;
};

Ti.App.addEventListener('uncaughtException', function (event) {
  // Create an Error instance that wraps the data from the event
  // ideally we'd just forward along the original Error!
  var error = new Error(event.message);
  error.stack = event.backtrace;
  error.fileName = event.sourceName;
  error.lineNumber = event.line;
  error.columnNumber = event.lineOffset;

  if (process$4.hasUncaughtExceptionCaptureCallback()) {
    return uncaughtExceptionCallback(error);
  } // otherwise forward the event!


  process$4.emit('uncaughtException', error);
});
// JS engine should be able to optimize easier

var CallbackWithArgs =
/*#__PURE__*/
function () {
  function CallbackWithArgs(func, args) {
    _classCallCheck(this, CallbackWithArgs);

    this.func = func;
    this.args = args;
  }

  _createClass(CallbackWithArgs, [{
    key: "run",
    value: function run() {
      if (this.args) {
        this.func.apply(null, this.args);
      } else {
        this.fun();
      }
    } }]);


  return CallbackWithArgs;
}(); // nextTick vs setImmediate should be handled in a semi-smart way
// Basically nextTick needs to drain the full queue (and can cause infinite loops if nextTick callback calls nextTick!)
// Then we should go through the "immediate" queue
// http://plafer.github.io/2015/09/08/nextTick-vs-setImmediate/


var tickQueue = [];
var immediateQueue = [];
var drainingTickQueue = false;
var drainQueuesTimeout = null;
/**
                                * Iteratively runs all "ticks" until there are no more.
                                * This can cause infinite recursion if a tick schedules another forever.
                                */

function drainTickQueue() {
  if (drainingTickQueue) {
    return;
  }

  drainingTickQueue = true;

  while (tickQueue.length) {
    var tick = tickQueue.shift();
    tick.run();
  }

  drainingTickQueue = false;
}

function drainQueues() {
  // drain the full tick queue first...
  drainTickQueue(); // tick queue should be empty!

  var immediatesRemaining = processImmediateQueue();

  if (immediatesRemaining !== 0) {
    // re-schedule draining our queues, as we have at least one more "immediate" to handle
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  } else {
    drainQueuesTimeout = null;
  }
}
/**
   * Attempts to process "immediates" (in a much more leisurely way than ticks)
   * We give a 100ms window to run them in before re-scheduling the timeout to process them again.
   * If any ticks are added during invocation of immediate, we drain the tick queue fully before
   * proceeding to next immediate (if we still have time in our window).
   * @returns {number} number of remaining immediates to be processed
   */


function processImmediateQueue() {
  var immediateDeadline = Date.now() + 100; // give us up to 100ms to process immediates

  while (immediateQueue.length && Date.now() < immediateDeadline) {
    var immediate = immediateQueue.shift();
    immediate.run();

    if (tickQueue.length > 0) {
      // they added a tick! drain the tick queue before we do anything else (this *may* eat up our deadline/window to process any more immediates)
      drainTickQueue();
    }
  }

  return immediateQueue.length;
}

process$4.nextTick = function (callback) {
  assertArgumentType(callback, 'callback', 'function');

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  tickQueue.push(new CallbackWithArgs(callback, args));

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }
};

global.setImmediate = function (callback) {
  assertArgumentType(callback, 'callback', 'function');

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  var immediate = new CallbackWithArgs(callback, args);
  immediateQueue.push(immediate);

  if (!drainQueuesTimeout) {
    drainQueuesTimeout = setTimeout(drainQueues, 0);
  }

  return immediate;
};

global.clearImmediate = function (immediate) {
  var index = immediateQueue.indexOf(immediate);

  if (index !== -1) {
    immediateQueue.splice(index, 1);
  }
};

var isWin32 = Ti.Platform.osname === 'windowsphone' || Ti.Platform.osname === 'windowsstore';
var FORWARD_SLASH = 47; // '/'

var BACKWARD_SLASH = 92; // '\\'

/**
 * Is this [a-zA-Z]?
 * @param  {number}  charCode value from String.charCodeAt()
 * @return {Boolean}          [description]
 */

function isWindowsDeviceName(charCode) {
  return charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122;
}
/**
   * [isAbsolute description]
   * @param  {boolean} isPosix whether this impl is for POSIX or not
   * @param  {string} filepath   input file path
   * @return {Boolean}          [description]
   */


function _isAbsolute(isPosix, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var length = filepath.length; // empty string special case

  if (length === 0) {
    return false;
  }

  var firstChar = filepath.charCodeAt(0);

  if (firstChar === FORWARD_SLASH) {
    return true;
  } // we already did our checks for posix


  if (isPosix) {
    return false;
  } // win32 from here on out


  if (firstChar === BACKWARD_SLASH) {
    return true;
  }

  if (length > 2 && isWindowsDeviceName(firstChar) && filepath.charAt(1) === ':') {
    var thirdChar = filepath.charAt(2);
    return thirdChar === '/' || thirdChar === '\\';
  }

  return false;
}
/**
   * [dirname description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @return {string}            [description]
   */


function _dirname(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var length = filepath.length;

  if (length === 0) {
    return '.';
  } // ignore trailing separator


  var fromIndex = length - 1;
  var hadTrailing = filepath.endsWith(separator);

  if (hadTrailing) {
    fromIndex--;
  }

  var foundIndex = filepath.lastIndexOf(separator, fromIndex); // no separators

  if (foundIndex === -1) {
    // handle special case of root windows paths
    if (length >= 2 && separator === '\\' && filepath.charAt(1) === ':') {
      var firstChar = filepath.charCodeAt(0);

      if (isWindowsDeviceName(firstChar)) {
        return filepath; // it's a root windows path
      }
    }

    return '.';
  } // only found root separator


  if (foundIndex === 0) {
    return separator; // if it was '/', return that
  } // Handle special case of '//something'


  if (foundIndex === 1 && separator === '/' && filepath.charAt(0) === '/') {
    return '//';
  }

  return filepath.slice(0, foundIndex);
}
/**
   * [extname description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @return {string}            [description]
   */


function _extname(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var index = filepath.lastIndexOf('.');

  if (index === -1 || index === 0) {
    return '';
  } // ignore trailing separator


  var endIndex = filepath.length;

  if (filepath.endsWith(separator)) {
    endIndex--;
  }

  return filepath.slice(index, endIndex);
}

function lastIndexWin32Separator(filepath, index) {
  for (var i = index; i >= 0; i--) {
    var char = filepath.charCodeAt(i);

    if (char === BACKWARD_SLASH || char === FORWARD_SLASH) {
      return i;
    }
  }

  return -1;
}
/**
   * [basename description]
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath   input file path
   * @param  {string} [ext]      file extension to drop if it exists
   * @return {string}            [description]
   */


function _basename(separator, filepath, ext) {
  assertArgumentType(filepath, 'path', 'string');

  if (ext !== undefined) {
    assertArgumentType(ext, 'ext', 'string');
  }

  var length = filepath.length;

  if (length === 0) {
    return '';
  }

  var isPosix = separator === '/';
  var endIndex = length; // drop trailing separator (if there is one)

  var lastCharCode = filepath.charCodeAt(length - 1);

  if (lastCharCode === FORWARD_SLASH || !isPosix && lastCharCode === BACKWARD_SLASH) {
    endIndex--;
  } // Find last occurence of separator


  var lastIndex = -1;

  if (isPosix) {
    lastIndex = filepath.lastIndexOf(separator, endIndex - 1);
  } else {
    // On win32, handle *either* separator!
    lastIndex = lastIndexWin32Separator(filepath, endIndex - 1); // handle special case of root path like 'C:' or 'C:\\'

    if ((lastIndex === 2 || lastIndex === -1) && filepath.charAt(1) === ':' && isWindowsDeviceName(filepath.charCodeAt(0))) {
      return '';
    }
  } // Take from last occurrence of separator to end of string (or beginning to end if not found)


  var base = filepath.slice(lastIndex + 1, endIndex); // drop trailing extension (if specified)

  if (ext === undefined) {
    return base;
  }

  return base.endsWith(ext) ? base.slice(0, base.length - ext.length) : base;
}
/**
   * The `path.normalize()` method normalizes the given path, resolving '..' and '.' segments.
   *
   * When multiple, sequential path segment separation characters are found (e.g.
   * / on POSIX and either \ or / on Windows), they are replaced by a single
   * instance of the platform-specific path segment separator (/ on POSIX and \
   * on Windows). Trailing separators are preserved.
   *
   * If the path is a zero-length string, '.' is returned, representing the
   * current working directory.
   *
   * @param  {string} separator  platform-specific file separator
   * @param  {string} filepath  input file path
   * @return {string} [description]
   */


function _normalize(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');

  if (filepath.length === 0) {
    return '.';
  } // Windows can handle '/' or '\\' and both should be turned into separator


  var isWindows = separator === '\\';

  if (isWindows) {
    filepath = filepath.replace(/\//g, separator);
  }

  var hadLeading = filepath.startsWith(separator); // On Windows, need to handle UNC paths (\\host-name\\resource\\dir) special to retain leading double backslash

  var isUNC = hadLeading && isWindows && filepath.length > 2 && filepath.charAt(1) === '\\';
  var hadTrailing = filepath.endsWith(separator);
  var parts = filepath.split(separator);
  var result = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var segment = _step.value;

      if (segment.length !== 0 && segment !== '.') {
        if (segment === '..') {
          result.pop(); // FIXME: What if this goes above root? Should we throw an error?
        } else {
          result.push(segment);
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var normalized = hadLeading ? separator : '';
  normalized += result.join(separator);

  if (hadTrailing) {
    normalized += separator;
  }

  if (isUNC) {
    normalized = '\\' + normalized;
  }

  return normalized;
}
/**
   * [assertSegment description]
   * @param  {*} segment [description]
   * @return {void}         [description]
   */


function assertSegment(segment) {
  if (typeof segment !== 'string') {
    throw new TypeError("Path must be a string. Received ".concat(segment));
  }
}
/**
   * The `path.join()` method joins all given path segments together using the
   * platform-specific separator as a delimiter, then normalizes the resulting path.
   * Zero-length path segments are ignored. If the joined path string is a zero-
   * length string then '.' will be returned, representing the current working directory.
   * @param  {string} separator platform-specific file separator
   * @param  {string[]} paths [description]
   * @return {string}       The joined filepath
   */


function _join(separator, paths) {
  var result = []; // naive impl: just join all the paths with separator

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var segment = _step2.value;
      assertSegment(segment);

      if (segment.length !== 0) {
        result.push(segment);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return _normalize(separator, result.join(separator));
}
/**
   * The `path.resolve()` method resolves a sequence of paths or path segments into an absolute path.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {string[]} paths [description]
   * @return {string}       [description]
   */


function _resolve(separator, paths) {
  var resolved = '';
  var hitRoot = false;
  var isPosix = separator === '/'; // go from right to left until we hit absolute path/root

  for (var i = paths.length - 1; i >= 0; i--) {
    var segment = paths[i];
    assertSegment(segment);

    if (segment.length === 0) {
      continue; // skip empty
    }

    resolved = segment + separator + resolved; // prepend new segment

    if (_isAbsolute(isPosix, segment)) {
      // have we backed into an absolute path?
      hitRoot = true;
      break;
    }
  } // if we didn't hit root, prepend cwd


  if (!hitRoot) {
    resolved = process.cwd() + separator + resolved;
  }

  var normalized = _normalize(separator, resolved);

  if (normalized.charAt(normalized.length - 1) === separator) {
    // FIXME: Handle UNC paths on Windows as well, so we don't trim trailing separator on something like '\\\\host-name\\resource\\'
    // Don't remove trailing separator if this is root path on windows!
    if (!isPosix && normalized.length === 3 && normalized.charAt(1) === ':' && isWindowsDeviceName(normalized.charCodeAt(0))) {
      return normalized;
    } // otherwise trim trailing separator


    return normalized.slice(0, normalized.length - 1);
  }

  return normalized;
}
/**
   * The `path.relative()` method returns the relative path `from` from to `to` based
   * on the current working directory. If from and to each resolve to the same
   * path (after calling `path.resolve()` on each), a zero-length string is returned.
   *
   * If a zero-length string is passed as `from` or `to`, the current working directory
   * will be used instead of the zero-length strings.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {string} from [description]
   * @param  {string} to   [description]
   * @return {string}      [description]
   */


function _relative(separator, from, to) {
  assertArgumentType(from, 'from', 'string');
  assertArgumentType(to, 'to', 'string');

  if (from === to) {
    return '';
  }

  from = _resolve(separator, [from]);
  to = _resolve(separator, [to]);

  if (from === to) {
    return '';
  } // we now have two absolute paths,
  // lets "go up" from `from` until we reach common base dir of `to`
  // const originalFrom = from;


  var upCount = 0;
  var remainingPath = '';

  while (true) {
    if (to.startsWith(from)) {
      // match! record rest...?
      remainingPath = to.slice(from.length);
      break;
    } // FIXME: Break/throw if we hit bad edge case of no common root!


    from = _dirname(separator, from);
    upCount++;
  } // remove leading separator from remainingPath if there is any


  if (remainingPath.length > 0) {
    remainingPath = remainingPath.slice(1);
  }

  return ('..' + separator).repeat(upCount) + remainingPath;
}
/**
   * The `path.parse()` method returns an object whose properties represent
   * significant elements of the path. Trailing directory separators are ignored,
   * see `path.sep`.
   *
   * The returned object will have the following properties:
   *
   * - dir <string>
   * - root <string>
   * - base <string>
   * - name <string>
   * - ext <string>
   * @param  {string} separator platform-specific file separator
   * @param  {string} filepath [description]
   * @return {object}
   */


function _parse(separator, filepath) {
  assertArgumentType(filepath, 'path', 'string');
  var result = {
    root: '',
    dir: '',
    base: '',
    ext: '',
    name: '' };

  var length = filepath.length;

  if (length === 0) {
    return result;
  } // Cheat and just call our other methods for dirname/basename/extname?


  result.base = _basename(separator, filepath);
  result.ext = _extname(separator, result.base);
  var baseLength = result.base.length;
  result.name = result.base.slice(0, baseLength - result.ext.length);
  var toSubtract = baseLength === 0 ? 0 : baseLength + 1;
  result.dir = filepath.slice(0, filepath.length - toSubtract); // drop trailing separator!

  var firstCharCode = filepath.charCodeAt(0); // both win32 and POSIX return '/' root

  if (firstCharCode === FORWARD_SLASH) {
    result.root = '/';
    return result;
  } // we're done with POSIX...


  if (separator === '/') {
    return result;
  } // for win32...


  if (firstCharCode === BACKWARD_SLASH) {
    // FIXME: Handle UNC paths like '\\\\host-name\\resource\\file_path'
    // need to retain '\\\\host-name\\resource\\' as root in that case!
    result.root = '\\';
    return result;
  } // check for C: style root


  if (length > 1 && isWindowsDeviceName(firstCharCode) && filepath.charAt(1) === ':') {
    if (length > 2) {
      // is it like C:\\?
      var thirdCharCode = filepath.charCodeAt(2);

      if (thirdCharCode === FORWARD_SLASH || thirdCharCode === BACKWARD_SLASH) {
        result.root = filepath.slice(0, 3);
        return result;
      }
    } // nope, just C:, no trailing separator


    result.root = filepath.slice(0, 2);
  }

  return result;
}
/**
   * The `path.format()` method returns a path string from an object. This is the
   * opposite of `path.parse()`.
   *
   * @param  {string} separator platform-specific file separator
   * @param  {object} pathObject object of format returned by `path.parse()`
   * @param  {string} pathObject.dir directory name
   * @param  {string} pathObject.root file root dir, ignored if `pathObject.dir` is provided
   * @param  {string} pathObject.base file basename
   * @param  {string} pathObject.name basename minus extension, ignored if `pathObject.base` exists
   * @param  {string} pathObject.ext file extension, ignored if `pathObject.base` exists
   * @return {string}
   */


function _format(separator, pathObject) {
  assertArgumentType(pathObject, 'pathObject', 'object');
  var base = pathObject.base || "".concat(pathObject.name || '').concat(pathObject.ext || ''); // append base to root if `dir` wasn't specified, or if
  // dir is the root

  if (!pathObject.dir || pathObject.dir === pathObject.root) {
    return "".concat(pathObject.root || '').concat(base);
  } // combine dir + / + base


  return "".concat(pathObject.dir).concat(separator).concat(base);
}
/**
   * On Windows systems only, returns an equivalent namespace-prefixed path for
   * the given path. If path is not a string, path will be returned without modifications.
   * See https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#namespaces
   * @param  {string} filepath [description]
   * @return {string}          [description]
   */


function toNamespacedPath(filepath) {
  if (typeof filepath !== 'string') {
    return filepath;
  }

  if (filepath.length === 0) {
    return '';
  }

  var resolvedPath = _resolve('\\', [filepath]);

  var length = resolvedPath.length;

  if (length < 2) {
    // need '\\\\' or 'C:' minimum
    return filepath;
  }

  var firstCharCode = resolvedPath.charCodeAt(0); // if start with '\\\\', prefix with UNC root, drop the slashes

  if (firstCharCode === BACKWARD_SLASH && resolvedPath.charAt(1) === '\\') {
    // return as-is if it's an aready long path ('\\\\?\\' or '\\\\.\\' prefix)
    if (length >= 3) {
      var thirdChar = resolvedPath.charAt(2);

      if (thirdChar === '?' || thirdChar === '.') {
        return filepath;
      }
    }

    return '\\\\?\\UNC\\' + resolvedPath.slice(2);
  } else if (isWindowsDeviceName(firstCharCode) && resolvedPath.charAt(1) === ':') {
    return '\\\\?\\' + resolvedPath;
  }

  return filepath;
}

var Win32Path = {
  sep: '\\',
  delimiter: ';',
  basename: function basename(filepath, ext) {
    return _basename(this.sep, filepath, ext);
  },
  normalize: function normalize(filepath) {
    return _normalize(this.sep, filepath);
  },
  join: function join() {
    for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) {
      paths[_key] = arguments[_key];
    }

    return _join(this.sep, paths);
  },
  extname: function extname(filepath) {
    return _extname(this.sep, filepath);
  },
  dirname: function dirname(filepath) {
    return _dirname(this.sep, filepath);
  },
  isAbsolute: function isAbsolute(filepath) {
    return _isAbsolute(false, filepath);
  },
  relative: function relative(from, to) {
    return _relative(this.sep, from, to);
  },
  resolve: function resolve() {
    for (var _len2 = arguments.length, paths = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      paths[_key2] = arguments[_key2];
    }

    return _resolve(this.sep, paths);
  },
  parse: function parse(filepath) {
    return _parse(this.sep, filepath);
  },
  format: function format(pathObject) {
    return _format(this.sep, pathObject);
  },
  toNamespacedPath: toNamespacedPath };

var PosixPath = {
  sep: '/',
  delimiter: ':',
  basename: function basename(filepath, ext) {
    return _basename(this.sep, filepath, ext);
  },
  normalize: function normalize(filepath) {
    return _normalize(this.sep, filepath);
  },
  join: function join() {
    for (var _len3 = arguments.length, paths = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      paths[_key3] = arguments[_key3];
    }

    return _join(this.sep, paths);
  },
  extname: function extname(filepath) {
    return _extname(this.sep, filepath);
  },
  dirname: function dirname(filepath) {
    return _dirname(this.sep, filepath);
  },
  isAbsolute: function isAbsolute(filepath) {
    return _isAbsolute(true, filepath);
  },
  relative: function relative(from, to) {
    return _relative(this.sep, from, to);
  },
  resolve: function resolve() {
    for (var _len4 = arguments.length, paths = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      paths[_key4] = arguments[_key4];
    }

    return _resolve(this.sep, paths);
  },
  parse: function parse(filepath) {
    return _parse(this.sep, filepath);
  },
  format: function format(pathObject) {
    return _format(this.sep, pathObject);
  },
  toNamespacedPath: function toNamespacedPath(filepath) {
    return filepath; // no-op
  } };

var path = isWin32 ? Win32Path : PosixPath;
path.win32 = Win32Path;
path.posix = PosixPath;

var isAndroid = Ti.Platform.osname === 'android';
var isIOS = !isAndroid && (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad');
var isWin32$1 = !isAndroid && !isIOS && Ti.Platform.name === 'windows';
var PosixConstants = {
  UV_UDP_REUSEADDR: 4,
  dlopen: {},
  errno: {
    E2BIG: 7,
    EACCES: 13,
    EADDRINUSE: 48,
    EADDRNOTAVAIL: 49,
    EAFNOSUPPORT: 47,
    EAGAIN: 35,
    EALREADY: 37,
    EBADF: 9,
    EBADMSG: 94,
    EBUSY: 16,
    ECANCELED: 89,
    ECHILD: 10,
    ECONNABORTED: 53,
    ECONNREFUSED: 61,
    ECONNRESET: 54,
    EDEADLK: 11,
    EDESTADDRREQ: 39,
    EDOM: 33,
    EDQUOT: 69,
    EEXIST: 17,
    EFAULT: 14,
    EFBIG: 27,
    EHOSTUNREACH: 65,
    EIDRM: 90,
    EILSEQ: 92,
    EINPROGRESS: 36,
    EINTR: 4,
    EINVAL: 22,
    EIO: 5,
    EISCONN: 56,
    EISDIR: 21,
    ELOOP: 62,
    EMFILE: 24,
    EMLINK: 31,
    EMSGSIZE: 40,
    EMULTIHOP: 95,
    ENAMETOOLONG: 63,
    ENETDOWN: 50,
    ENETRESET: 52,
    ENETUNREACH: 51,
    ENFILE: 23,
    ENOBUFS: 55,
    ENODATA: 96,
    ENODEV: 19,
    ENOENT: 2,
    ENOEXEC: 8,
    ENOLCK: 77,
    ENOLINK: 97,
    ENOMEM: 12,
    ENOMSG: 91,
    ENOPROTOOPT: 42,
    ENOSPC: 28,
    ENOSR: 98,
    ENOSTR: 99,
    ENOSYS: 78,
    ENOTCONN: 57,
    ENOTDIR: 20,
    ENOTEMPTY: 66,
    ENOTSOCK: 38,
    ENOTSUP: 45,
    ENOTTY: 25,
    ENXIO: 6,
    EOPNOTSUPP: 102,
    EOVERFLOW: 84,
    EPERM: 1,
    EPIPE: 32,
    EPROTO: 100,
    EPROTONOSUPPORT: 43,
    EPROTOTYPE: 41,
    ERANGE: 34,
    EROFS: 30,
    ESPIPE: 29,
    ESRCH: 3,
    ESTALE: 70,
    ETIME: 101,
    ETIMEDOUT: 60,
    ETXTBSY: 26,
    EWOULDBLOCK: 35,
    EXDEV: 18 },

  signals: {
    SIGHUP: 1,
    SIGINT: 2,
    SIGQUIT: 3,
    SIGILL: 4,
    SIGTRAP: 5,
    SIGABRT: 6,
    SIGIOT: 6,
    SIGBUS: 10,
    SIGFPE: 8,
    SIGKILL: 9,
    SIGUSR1: 30,
    SIGSEGV: 11,
    SIGUSR2: 31,
    SIGPIPE: 13,
    SIGALRM: 14,
    SIGTERM: 15,
    SIGCHLD: 20,
    SIGCONT: 19,
    SIGSTOP: 17,
    SIGTSTP: 18,
    SIGTTIN: 21,
    SIGTTOU: 22,
    SIGURG: 16,
    SIGXCPU: 24,
    SIGXFSZ: 25,
    SIGVTALRM: 26,
    SIGPROF: 27,
    SIGWINCH: 28,
    SIGIO: 23,
    SIGINFO: 29,
    SIGSYS: 12 },

  priority: {
    PRIORITY_LOW: 19,
    PRIORITY_BELOW_NORMAL: 10,
    PRIORITY_NORMAL: 0,
    PRIORITY_ABOVE_NORMAL: -7,
    PRIORITY_HIGH: -14,
    PRIORITY_HIGHEST: -20 } };

// default implementations

var OS = {
  EOL: '\n',
  arch: function arch() {
    return process.arch;
  },
  constants: PosixConstants,
  cpus: function cpus() {
    var count = Ti.Platform.processorCount;
    var array = [];

    for (var i = 0; i < count; i++) {
      array.push({
        model: 'unknown',
        speed: 0,
        times: {
          user: 0,
          nice: 0,
          sys: 0,
          idle: 0,
          irq: 0 } });


    }

    return array;
  },
  endianness: function endianness() {
    // TODO: Cache the value!
    var result = Ti.Codec.getNativeByteOrder();

    if (result === Ti.Codec.LITTLE_ENDIAN) {
      return 'LE';
    }

    return 'BE';
  },
  freemem: function freemem() {
    return Ti.Platform.availableMemory;
  },
  getPriority: function getPriority() {
    return 0;
  },
  // fake it
  homedir: function homedir() {
    return Ti.Filesystem.applicationDataDirectory;
  },
  // fake it
  hostname: function hostname() {
    return Ti.Platform.address;
  },
  // fake it
  loadavg: function loadavg() {
    return [0, 0, 0];
  },
  // fake it
  networkInterfaces: function networkInterfaces() {},
  // FIXME: What do we do here? We might be able to piece some of this together using Ti.Platform.netmask, Ti.Platform.address
  platform: function platform() {
    return process.platform;
  },
  release: function release() {
    return Ti.Platform.version;
  },
  setPriority: function setPriority() {},
  // no-op, fake it

  /**
   * The `os.tmpdir()` method returns a string specifying the operating system's default directory for temporary files.
   * @return {string} [description]
   */
  tmpdir: function tmpdir() {
    return Ti.Filesystem.tempDirectory;
  },

  /**
      * The `os.totalmem()` method returns the total amount of system memory in bytes as an integer.
      * @return {integer} [description]
      */
  totalmem: function totalmem() {
    return Ti.Platform.totalMemory;
  },
  type: function type() {
    return 'Unknown';
  },
  // overridden per-platform at bottom

  /**
   * The `os.uptime()` method returns the system uptime in number of seconds.
   * @return {integer} [description]
   */
  uptime: function uptime() {
    return Ti.Platform.uptime;
  },
  userInfo: function userInfo() {
    // fake it!
    return {
      uid: -1,
      guid: -1,
      username: Ti.Platform.username,
      homedir: Ti.Filesystem.applicationDataDirectory,
      shell: null };

  } };
// On specific platforms, override implementations because we don't have them
// yet and need to fake it, or to hack them
// I'm also doing this in blocks to assign implementations that don't need to consult platform
// type at runtime (hopefully speeding up execution at runtime)

if (isIOS) {
  OS.type = function () {
    return 'Darwin';
  }; // Now a giant hack for looking up CPU info for OS.cpus() on iOS
  // https://www.theiphonewiki.com/wiki/List_of_iPhones


  var AppleMap = {
    // iPhone 11 Pro Max
    'iPhone12,5': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone 11 Pro
    'iPhone12,3': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone 11
    'iPhone12,1': ['Apple A13 Bionic @ 2.66 GHz', 2660],
    // iPhone XR
    'iPhone11,8': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone XS Max
    'iPhone11,6': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    'iPhone11,4': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone XS
    'iPhone11,2': ['Apple A12 Bionic @ 2.49 GHz', 2490],
    // iPhone X
    'iPhone10,6': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,3': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 8 Plus
    'iPhone10,5': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,2': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 8
    'iPhone10,4': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    'iPhone10,1': ['Apple A11 Bionic @ 2.39 GHz', 2390],
    // iPhone 7 Plus
    'iPhone9,4': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    'iPhone9,2': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    // iPhone 7
    'iPhone9,3': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    'iPhone9,1': ['Apple A10 Fusion @ 2.34 GHz', 2340],
    // iPhone SE
    'iPhone8,4': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6s Plus
    'iPhone8,2': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6s
    'iPhone8,1': ['Apple A9 Twister @ 1.85 GHz', 1850],
    // iPhone 6 Plus
    'iPhone7,1': ['Apple A8 Typhoon @ 1.38 GHz', 1380],
    // iPhone 6
    'iPhone7,2': ['Apple A8 Typhoon @ 1.38 GHz', 1380],
    // iPhone 5s
    'iPhone6,2': ['Apple A7 Cyclone @ 1.3 GHz', 1300],
    'iPhone6,1': ['Apple A7 Cyclone @ 1.3 GHz', 1300],
    // iPhone 5c
    'iPhone5,4': ['Apple A6 Swift @ 1.2 GHz', 1200],
    'iPhone5,3': ['Apple A6 Swift @ 1.2 GHz', 1200],
    // iPhone 5
    'iPhone5,1': ['Apple A6 Swift @ 1.2 GHz', 1200],
    'iPhone5,2': ['Apple A6 Swift @ 1.2 GHz', 1200],
    // iPhone 4s
    'iPhone4,1': ['Apple A5 @ 800 MHz', 800],
    // iPhone 4
    'iPhone3,3': ['Apple A4 @ 800 MHz', 800],
    'iPhone3,2': ['Apple A4 @ 800 MHz', 800],
    'iPhone3,1': ['Apple A4 @ 800 MHz', 800],
    // iPhone 3GS
    'iPhone2,1': ['Samsung S5L8920 @ 620 MHz', 620],
    // iPhone 3G
    'iPhone1,2': ['Samsung S5L8900 @ 412 MHz', 412],
    // iPhone
    'iPhone1,1': ['Samsung S5L8900 @ 412 MHz', 412],
    // ////// iPads
    // https://www.theiphonewiki.com/wiki/List_of_iPads
    // https://en.wikipedia.org/wiki/IPad
    // iPad Pro (12.9" 3rd gen)
    'iPad8,8': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,7': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,6': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,5': ['Apple A12X @ 2.49 GHz', 2490],
    // iPad Pro (11")
    'iPad8,4': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,3': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,2': ['Apple A12X @ 2.49 GHz', 2490],
    'iPad8,1': ['Apple A12X @ 2.49 GHz', 2490],
    // iPad (6th gen)
    'iPad7,6': ['Apple A10 @ 2.31 GHz', 2310],
    // FIXME: Wikipedia says 2.34 GHz
    'iPad7,5': ['Apple A10 @ 2.31 GHz', 2310],
    // iPad Pro (10.5")
    'iPad7,4': ['Apple A10X @ 2.38 GHz', 2380],
    'iPad7,3': ['Apple A10X @ 2.38 GHz', 2380],
    // iPad Pro (12.9" 2nd gen)
    'iPad7,2': ['Apple A10X @ 2.38 GHz', 2380],
    'iPad7,1': ['Apple A10X @ 2.38 GHz', 2380],
    // iPad (5th gen)
    'iPad6,12': ['Apple A9 @ 1.85 GHz', 1850],
    'iPad6,11': ['Apple A9 @ 1.85 GHz', 1850],
    // iPad Pro (12.9" 1st gen)
    'iPad6,8': ['Apple A9X @ 2.24 GHz', 2240],
    'iPad6,7': ['Apple A9X @ 2.24 GHz', 2240],
    // iPad Pro (9.7")
    'iPad6,4': ['Apple A9X @ 2.16 GHz', 2160],
    'iPad6,3': ['Apple A9X @ 2.16 GHz', 2160],
    // iPad Air 2
    'iPad5,4': ['Apple A8X @ 1.5 GHz', 1500],
    'iPad5,3': ['Apple A8X @ 1.5 GHz', 1500],
    // iPad Mini 4
    'iPad5,2': ['Apple A8 @ 1.49 GHz', 1490],
    'iPad5,1': ['Apple A8 @ 1.49 GHz', 1490],
    // iPad Mini 3
    'iPad4,9': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,8': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,7': ['Apple A7 @ 1.3 GHz', 1300],
    // iPad Mini 2
    'iPad4,6': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,5': ['Apple A7 @ 1.3 GHz', 1300],
    'iPad4,4': ['Apple A7 @ 1.3 GHz', 1300],
    // iPad Air 2
    'iPad4,3': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    'iPad4,2': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    'iPad4,1': ['Apple A7 Rev A @ 1.4 GHz', 1400],
    // iPad (4th gen)
    'iPad3,6': ['Apple A6X @ 1.4 GHz', 1400],
    'iPad3,5': ['Apple A6X @ 1.4 GHz', 1400],
    'iPad3,4': ['Apple A6X @ 1.4 GHz', 1400],
    // iPad (3rd gen)
    'iPad3,3': ['Apple A5X @ 1 GHz', 1000],
    'iPad3,2': ['Apple A5X @ 1 GHz', 1000],
    'iPad3,1': ['Apple A5X @ 1 GHz', 1000],
    // iPad Mini
    'iPad2,7': ['Apple A5 Rev A @ 1 GHz', 1000],
    'iPad2,6': ['Apple A5 Rev A @ 1 GHz', 1000],
    'iPad2,5': ['Apple A5 Rev A @ 1 GHz', 1000],
    // iPad 2
    'iPad2,4': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,3': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,2': ['Apple A5 @ 1 GHz', 1000],
    'iPad2,1': ['Apple A5 @ 1 GHz', 1000],
    // iPad
    'iPad1,1': ['Apple A4 @ 1 GHz', 1000] };

  /**
                                              * [cpuModel description]
                                              * @param  {string} model [description]
                                              * @return {array}       [description]
                                              */

  var cpuModelAndSpeed = function cpuModelAndSpeed(model) {
    var trimmed = model.replace(' (Simulator)', '').trim();
    return AppleMap[trimmed] || ['Unknown', 0];
  }; // override cpus impl


  OS.cpus = function () {
    // TODO: Cache the result!
    var count = Ti.Platform.processorCount;
    var modelAndSpeed = cpuModelAndSpeed(Ti.Platform.model);
    var array = [];

    for (var i = 0; i < count; i++) {
      array.push({
        model: modelAndSpeed[0],
        speed: modelAndSpeed[1],
        times: {} });

    }

    return array;
  };
} else if (isWin32$1) {
  OS.uptime = function () {
    return 0;
  }; // FIXME: Implement!


  OS.totalmem = function () {
    return Number.MAX_VALUE;
  }; // FIXME: Implement!


  OS.EOL = '\r\n';

  OS.type = function () {
    return 'Windows_NT';
  };

  OS.constants = {
    UV_UDP_REUSEADDR: 4,
    dlopen: {},
    errno: {
      E2BIG: 7,
      EACCES: 13,
      EADDRINUSE: 100,
      EADDRNOTAVAIL: 101,
      EAFNOSUPPORT: 102,
      EAGAIN: 11,
      EALREADY: 103,
      EBADF: 9,
      EBADMSG: 104,
      EBUSY: 16,
      ECANCELED: 105,
      ECHILD: 10,
      ECONNABORTED: 106,
      ECONNREFUSED: 107,
      ECONNRESET: 108,
      EDEADLK: 36,
      EDESTADDRREQ: 109,
      EDOM: 33,
      EEXIST: 17,
      EFAULT: 14,
      EFBIG: 27,
      EHOSTUNREACH: 110,
      EIDRM: 111,
      EILSEQ: 42,
      EINPROGRESS: 112,
      EINTR: 4,
      EINVAL: 22,
      EIO: 5,
      EISCONN: 113,
      EISDIR: 21,
      ELOOP: 114,
      EMFILE: 24,
      EMLINK: 31,
      EMSGSIZE: 115,
      ENAMETOOLONG: 38,
      ENETDOWN: 116,
      ENETRESET: 117,
      ENETUNREACH: 118,
      ENFILE: 23,
      ENOBUFS: 119,
      ENODATA: 120,
      ENODEV: 19,
      ENOENT: 2,
      ENOEXEC: 8,
      ENOLCK: 39,
      ENOLINK: 121,
      ENOMEM: 12,
      ENOMSG: 122,
      ENOPROTOOPT: 123,
      ENOSPC: 28,
      ENOSR: 124,
      ENOSTR: 125,
      ENOSYS: 40,
      ENOTCONN: 126,
      ENOTDIR: 20,
      ENOTEMPTY: 41,
      ENOTSOCK: 128,
      ENOTSUP: 129,
      ENOTTY: 25,
      ENXIO: 6,
      EOPNOTSUPP: 130,
      EOVERFLOW: 132,
      EPERM: 1,
      EPIPE: 32,
      EPROTO: 134,
      EPROTONOSUPPORT: 135,
      EPROTOTYPE: 136,
      ERANGE: 34,
      EROFS: 30,
      ESPIPE: 29,
      ESRCH: 3,
      ETIME: 137,
      ETIMEDOUT: 138,
      ETXTBSY: 139,
      EWOULDBLOCK: 140,
      EXDEV: 18,
      WSAEINTR: 10004,
      WSAEBADF: 10009,
      WSAEACCES: 10013,
      WSAEFAULT: 10014,
      WSAEINVAL: 10022,
      WSAEMFILE: 10024,
      WSAEWOULDBLOCK: 10035,
      WSAEINPROGRESS: 10036,
      WSAEALREADY: 10037,
      WSAENOTSOCK: 10038,
      WSAEDESTADDRREQ: 10039,
      WSAEMSGSIZE: 10040,
      WSAEPROTOTYPE: 10041,
      WSAENOPROTOOPT: 10042,
      WSAEPROTONOSUPPORT: 10043,
      WSAESOCKTNOSUPPORT: 10044,
      WSAEOPNOTSUPP: 10045,
      WSAEPFNOSUPPORT: 10046,
      WSAEAFNOSUPPORT: 10047,
      WSAEADDRINUSE: 10048,
      WSAEADDRNOTAVAIL: 10049,
      WSAENETDOWN: 10050,
      WSAENETUNREACH: 10051,
      WSAENETRESET: 10052,
      WSAECONNABORTED: 10053,
      WSAECONNRESET: 10054,
      WSAENOBUFS: 10055,
      WSAEISCONN: 10056,
      WSAENOTCONN: 10057,
      WSAESHUTDOWN: 10058,
      WSAETOOMANYREFS: 10059,
      WSAETIMEDOUT: 10060,
      WSAECONNREFUSED: 10061,
      WSAELOOP: 10062,
      WSAENAMETOOLONG: 10063,
      WSAEHOSTDOWN: 10064,
      WSAEHOSTUNREACH: 10065,
      WSAENOTEMPTY: 10066,
      WSAEPROCLIM: 10067,
      WSAEUSERS: 10068,
      WSAEDQUOT: 10069,
      WSAESTALE: 10070,
      WSAEREMOTE: 10071,
      WSASYSNOTREADY: 10091,
      WSAVERNOTSUPPORTED: 10092,
      WSANOTINITIALISED: 10093,
      WSAEDISCON: 10101,
      WSAENOMORE: 10102,
      WSAECANCELLED: 10103,
      WSAEINVALIDPROCTABLE: 10104,
      WSAEINVALIDPROVIDER: 10105,
      WSAEPROVIDERFAILEDINIT: 10106,
      WSASYSCALLFAILURE: 10107,
      WSASERVICE_NOT_FOUND: 10108,
      WSATYPE_NOT_FOUND: 10109,
      WSA_E_NO_MORE: 10110,
      WSA_E_CANCELLED: 10111,
      WSAEREFUSED: 10112 },

    signals: {
      SIGHUP: 1,
      SIGINT: 2,
      SIGILL: 4,
      SIGABRT: 22,
      SIGFPE: 8,
      SIGKILL: 9,
      SIGSEGV: 11,
      SIGTERM: 15,
      SIGBREAK: 21,
      SIGWINCH: 28 },

    priority: {
      PRIORITY_LOW: 19,
      PRIORITY_BELOW_NORMAL: 10,
      PRIORITY_NORMAL: 0,
      PRIORITY_ABOVE_NORMAL: -7,
      PRIORITY_HIGH: -14,
      PRIORITY_HIGHEST: -20 } };


} else if (isAndroid) {
  OS.cpus = function () {
    return Ti.Platform.cpus();
  };

  OS.type = function () {
    return 'Linux';
  };
}

var tty = {
  isatty: function isatty() {
    return false;
  },
  ReadStream: function ReadStream() {
    throw new Error('tty.ReadStream is not implemented');
  },
  WriteStream: function WriteStream() {
    throw new Error('tty.WriteStream is not implemented');
  } };


var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var util = {
  // So node actually calls into native code for these checks, but I think for shim compatability this is good enough
  // There's overhead for doing the native checks, and it'd require a native module to achieve.
  types: {
    // TODO: We're missing a lot of the methods hanging off this namespace!
    isNumberObject: function isNumberObject(value) {
      return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Number]';
    },
    isStringObject: function isStringObject(value) {
      return typeof value === 'object' && Object.prototype.toString.call(value) === '[object String]';
    },
    isBooleanObject: function isBooleanObject(value) {
      return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Boolean]';
    },
    // isBigIntObject: value => {
    // 	return Object.prototype.toString.call(value) === '[object BigInt]';
    // },
    isSymbolObject: function isSymbolObject(value) {
      return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Symbol]';
    },
    isBoxedPrimitive: function isBoxedPrimitive(value) {
      if (typeof value !== 'object') {
        return false;
      }

      return this.isNumberObject(value) || this.isStringObject(value) || this.isBooleanObject(value) // || this.isBigIntObject(value)
      || this.isSymbolObject(value);
    },
    isNativeError: function isNativeError(value) {
      // if not an instance of an Error, definitely not a native error
      if (!(value instanceof Error)) {
        return false;
      }

      if (!value || !value.constructor) {
        return false;
      }

      return ['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError'].includes(value.constructor.name);
    },
    isPromise: function isPromise(value) {
      var valueType = typeof value;
      return (valueType === 'object' || valueType === 'function') && value.then && typeof value.then === 'function';
    },
    isSet: function isSet(value) {
      return value instanceof Set;
    },
    isMap: function isMap(value) {
      return value instanceof Map;
    },
    isDate: function isDate(value) {
      return value instanceof Date;
    },
    isRegexp: function isRegexp(value) {
      return value instanceof RegExp || Object.prototype.toString.call(value) === '[object RegExp]';
    } },

  isArray: function isArray(value) {
    return Array.isArray(value);
  },
  isBoolean: function isBoolean(value) {
    return typeof value === 'boolean';
  },
  isFunction: function isFunction(value) {
    return typeof value === 'function';
  },
  isNull: function isNull(value) {
    return value === null;
  },
  isNullOrUndefined: function isNullOrUndefined(value) {
    return value === undefined || value === null;
  },
  isNumber: function isNumber(value) {
    return typeof value === 'number';
  },
  isObject: function isObject(value) {
    return value !== null && typeof value === 'object';
  },
  isPrimitive: function isPrimitive(value) {
    return typeof value !== 'object' && typeof value !== 'function' || value === null;
  },
  isString: function isString(value) {
    return typeof value === 'string';
  },
  isSymbol: function isSymbol(value) {
    return typeof value === 'symbol';
  },
  isUndefined: function isUndefined(value) {
    return value === undefined;
  },
  log: function log(string) {
    var date = new Date();
    var time = "".concat(date.getHours().toString().padStart(2, '0'), ":").concat(date.getMinutes().toString().padStart(2, '0'), ":").concat(date.getSeconds().toString().padStart(2, '0')); // Produces output like: "21 Feb 10:04:23 - message"

    console.log("".concat(date.getDate(), " ").concat(MONTHS[date.getMonth()], " ").concat(time, " - ").concat(string));
  },
  print: function print() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return console.log(args.join(''));
  },
  // FIXME: Shouldn't add trailing newline like console.log does!
  puts: function puts() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return console.log(args.join('\n'));
  },
  error: function error() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return console.error(args.join('\n'));
  },
  debug: function debug(string) {
    return console.error("DEBUG: ".concat(string));
  } };


util.isBuffer = function () {
  return false;
}; // FIXME: Check for Ti.Buffer? for node/browserify buffer?


util.isDate = function (value) {
  return util.types.isDate(value);
};

util.isError = function (value) {
  return util.types.isNativeError(value);
};

util.isRegexp = function (value) {
  return util.types.isRegexp(value);
};

function getConstructor(obj) {
  if (obj.constructor) {
    return obj.constructor.name;
  }

  return 'Object';
}

var defaultInspectOptions = {
  showHidden: false,
  depth: 2,
  colors: false,
  customInspect: true,
  showProxy: false,
  maxArrayLength: 100,
  breakLength: 60,
  compact: true,
  sorted: false,
  getters: false };


function formatArray(array, options) {
  var maxLength = Math.max(0, options.maxArrayLength);
  var arrayLength = array.length;
  var values = [];
  var consecutiveEmpties = 0;
  var i = 0; // for sparse arrays, consecutive empties count as a "single item" in terms of maxArrayLength

  for (; i < arrayLength; i++) {
    // don't go past end of array...
    var value = array[i];

    if (value === undefined) {
      // sparse array!
      consecutiveEmpties++;
      continue;
    } // non-empty index currently...


    if (consecutiveEmpties > 0) {
      // were we collecting consecutive empty indices as a single gap?
      values.push("<".concat(consecutiveEmpties, " empty item").concat(consecutiveEmpties > 1 ? 's' : '', ">"));
      consecutiveEmpties = 0; // reset our count

      if (values.length >= maxLength) {
        // don't show more than options.maxArrayLength "values"
        break;
      }
    } // push the current index value


    values.push(util.inspect(value, options));

    if (values.length >= maxLength) {
      // don't show more than options.maxArrayLength "values"
      i++; // so our "remaining" count is correct

      break;
    }
  }

  var remaining = arrayLength - i;

  if (remaining > 0) {
    // did we stop before the end of the array (due to options.maxArrayLength)?
    values.push("... ".concat(remaining, " more item").concat(remaining > 1 ? 's' : ''));
  } else if (consecutiveEmpties > 0) {
    // did the sparse array gaps run to the end of the array?
    values.push("<".concat(consecutiveEmpties, " empty item").concat(consecutiveEmpties > 1 ? 's' : '', ">"));
  }

  return values;
}
/**
   * @param {*} obj JS value or object to inspect
   * @param {object} [options] options for output
   * @param {Integer} [options.breakLength=60] length at which to break properties into individual lines
   * @param {boolean} [options.showHidden=false] whether to include hidden properties (non-enumerable)
   * @param {boolean} [options.sorted=false] whether to sort the property listings per-object
   * @param {boolean} [options.compact=true] if set to `false`, uses luxurious amount of spacing and newlines
   * @param {Integer} [options.depth=2] depth to recurse into objects
   * @returns {string}
   */


util.inspect = function (obj) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var mergedOptions = Object.assign({}, defaultInspectOptions, options); // increase our recursion counter to avoid going past depth

  if (mergedOptions.recursionCount === undefined) {
    mergedOptions.recursionCount = -1;
  }

  mergedOptions.recursionCount++;

  if (mergedOptions.indentLevel === undefined) {
    mergedOptions.indentLevel = 0;
  }

  try {
    var objType = typeof obj;

    if (objType === 'object' || objType === 'function') {
      if (obj === null) {
        return 'null';
      } // Guard against circular references


      mergedOptions.memo = mergedOptions.memo || [];

      if (mergedOptions.memo.includes(obj)) {
        return '[Circular]';
      }

      try {
        mergedOptions.memo.push(obj); // popped off in a finally block, so we only worry about circular references, not sibling references

        var constructorName = getConstructor(obj); // if the constructor name is not 'Object', pre-pend it!

        var prefix = '';

        if (constructorName !== 'Object') {
          prefix = "".concat(constructorName, " ");
        } // now grab the type tag if it has one!


        var tag = obj[Symbol.toStringTag];

        if (tag && tag !== constructorName) {
          prefix = "".concat(prefix, "[").concat(tag, "] ");
        } // what braces do we use to enclose the values/properties?


        var open = '{';
        var close = '}';
        var header = ''; // for special cases like Function where we pre-pend header info

        var values = []; // collect the values/properties we list!

        var isArray = Array.isArray(obj);

        if (isArray) {
          if (prefix === 'Array ') {
            prefix = ''; // wipe "normal" Array prefixes
          }

          open = '[';
          close = ']';
          // use array braces
          values.push.apply(values, _toConsumableArray(formatArray(obj, mergedOptions)));
        } else if (util.types.isMap(obj)) {
          if (obj.size > 0) {
            values.push.apply(values, _toConsumableArray(Array.from(obj).map(function (entry) {
              return "".concat(util.inspect(entry[0], mergedOptions), " => ").concat(util.inspect(entry[1], mergedOptions));
            })));
          }
        } else if (util.types.isSet(obj)) {
          if (obj.size > 0) {
            values.push.apply(values, _toConsumableArray(Array.from(obj).map(function (o) {
              return util.inspect(o, mergedOptions);
            })));
          }
        } else if (util.types.isRegexp(obj)) {
          // don't do prefix or any of that crap! TODO: Can we just call Regexp.prototype.toString.call()?
          return "/".concat(obj.source, "/").concat(obj.flags);
        } else if (util.isFunction(obj)) {
          if (prefix === 'Function ') {
            prefix = ''; // wipe "normal" Function prefixes
          } // Functions are special and we must use a "header"
          // if no values/properties, just print the "header"
          // if any, stick "header" inside braces before property/value listing


          if (obj.name) {
            header = "[Function: ".concat(obj.name, "]");
          } else {
            header = '[Function]';
          }
        } // If we've gone past our depth, just do a quickie result here, like '[Object]'


        if (mergedOptions.recursionCount > mergedOptions.depth) {
          return header || "[".concat(constructorName || tag || 'Object', "]");
        } // handle properties


        var properties = []; // if showing hidden, get all own properties, otherwise just enumerable

        var ownProperties = mergedOptions.showHidden ? Object.getOwnPropertyNames(obj) : Object.keys(obj); // FIXME: On V8/Android we are not getting 'arguments' and 'caller' properties!
        // This may be because in newer specs/strict mode they shouldn't be accessible?

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ownProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var propName = _step.value;

            if (isArray && propName.match(/^\d+$/)) {
              // skip Array's index properties
              continue;
            }

            var propDesc = Object.getOwnPropertyDescriptor(obj, propName) || {
              value: obj[propName],
              enumerable: true };
            // fall back to faking a descriptor

            var key = propDesc.enumerable ? propName : "[".concat(propName, "]"); // If not enumerable, wrap name in []!

            if (propDesc.value !== undefined) {
              mergedOptions.indentLevel += 3; // Node uses 3 spaces for arrays/Objects?

              var space = ' ';

              var _value2 = util.inspect(propDesc.value, mergedOptions); // if value is breaking, break between key and top-level value


              if (_value2.length > mergedOptions.breakLength) {
                space = "\n".concat(' '.repeat(mergedOptions.indentLevel));
              }

              mergedOptions.indentLevel -= 3;
              properties.push("".concat(key, ":").concat(space).concat(_value2));
            } else if (propDesc.get !== undefined) {
              // TODO: Handle when options.getters === true, need to actually attempt to get and show value!
              if (propDesc.set !== undefined) {
                properties.push("".concat(key, ": [Getter/Setter]"));
              } else {
                properties.push("".concat(key, ": [Getter]"));
              }
            } else if (propDesc.set !== undefined) {
              properties.push("".concat(key, ": [Setter]"));
            } else {
              // weird case of a property defined with an explicit undefined value
              properties.push("".concat(key, ": undefined"));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (properties.length !== 0) {
          // TODO: Handle custom sorting option!
          if (mergedOptions.sorted) {
            properties.sort();
          }

          values.push.apply(values, properties);
        }

        var value = '';

        if (values.length === 0) {
          if (header.length > 0) {
            value = header; // i.e. '[Function: name]'
          } else {
            value = "".concat(open).concat(close); // no spaces, i.e. '{}' or '[]'
          }
        } else {
          var str = '';

          if (header.length > 0) {
            // i.e. '{ [Function] a: 1, b: 2 }'
            str = "".concat(header, " ");
          } // Handle breaking them by breakLength here!


          var length = 0;

          for (var _i = 0, _values = values; _i < _values.length; _i++) {
            var _value = _values[_i];
            length += _value.length + 1; // Node seems to add one for comma, but not more for spaces?

            if (length > mergedOptions.breakLength) {
              // break early if length > breakLength!
              break;
            }
          }

          if (length > mergedOptions.breakLength) {
            var indent = ' '.repeat(mergedOptions.indentLevel); // break them up!

            str += values.join(",\n".concat(indent, "  "));
          } else {
            str += values.join(', ');
          }

          value = "".concat(open, " ").concat(str, " ").concat(close); // spaces between braces and values/properties
        }

        return "".concat(prefix).concat(value);
      } finally {
        mergedOptions.memo.pop(obj);
      }
    } // only special case is -0


    if (objType === 'string') {
      return "'".concat(obj, "'");
    } else if (objType === 'number' && Object.is(obj, -0)) {
      // can't check for -0 using ===
      return '-0';
    } else if (util.isSymbol(obj)) {
      return obj.toString();
    } // TODO: Handle BigInt?


    return "".concat(obj);
  } finally {
    mergedOptions.recursionCount--;
  }
};
/**
    * Retruns result of `JSON.stringify()` if possible, falling back to `'[Circular]'` if that throws.
    * @param {*} value The value/object to stringify
    * @returns {string}
    */


function stringify(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    if (e instanceof TypeError && (e.message.includes('circular') || e.message.includes('cyclic'))) {
      // "Converting circular structure to JSON"
      // JSC gives: "JSON.stringify cannot serialize cyclic structures."
      // TODO: Maybe force a circular reference object through and sniff the JS engine's message generated to match against?
      return '[Circular]';
    }

    throw e;
  }
}

util.format = function () {
  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  var firstArg = args[0];

  if (typeof firstArg === 'string') {
    // normal usage!
    if (args.length === 1) {
      return firstArg;
    } // TODO: ok, we really do have to look at the string to find the % specifiers
    // Do we loop over the args.length and find next index of '%', match what type it is and replace?


    var lastIndex = 0;
    var str = '';
    var i = 1; // start at second argument

    for (i; i < args.length;) {
      var curArg = args[i];
      var foundIndex = firstArg.indexOf('%', lastIndex);

      if (foundIndex === -1) {
        // No more placeholders left, so break and at bottom we'll append rest of string
        break;
      } // grab segment of string and append to str


      str += firstArg.slice(lastIndex, foundIndex); // now look at next char to see how to replace

      var nextChar = firstArg.charAt(foundIndex + 1);

      switch (nextChar) {
        case 's':
          // string
          str += String(curArg);
          i++; // consume argument

          break;

        case 'd':
          // Number
          if (util.isSymbol(curArg) || util.types.isSymbolObject(curArg)) {
            str += 'NaN';
          } else {
            str += Number(curArg);
          }

          i++; // consume argument

          break;

        case 'i':
          // Integer
          if (util.isSymbol(curArg) || util.types.isSymbolObject(curArg)) {
            str += 'NaN';
          } else {
            str += parseInt(curArg);
          }

          i++; // consume argument

          break;

        case 'f':
          // Float
          if (util.isSymbol(curArg) || util.types.isSymbolObject(curArg)) {
            str += 'NaN';
          } else {
            str += parseFloat(curArg);
          }

          i++; // consume argument

          break;

        case 'j':
          // JSON
          str += stringify(curArg);
          i++; // consume argument

          break;

        case 'o':
          // Object w/showHidden and showProxy
          str += util.inspect(curArg, {
            showHidden: true,
            showProxy: true,
            depth: 4 });

          i++; // consume argument

          break;

        case 'O':
          // Object w/o options
          str += util.inspect(curArg, {});
          i++; // consume argument

          break;

        case '%':
          // escaped %
          str += '%'; // Don't consume argument here!

          break;}


      lastIndex = foundIndex + 2;
    } // If we haven't reached end of string, append rest of it with no replacements!


    str += firstArg.slice(lastIndex, firstArg.length); // If we have args remaining, need to...
    // loop over rest of args and coerce to Strings and concat joined by spaces.
    // Unless typeof === 'object' or 'symbol', then do util.inspect() on them

    if (i < args.length) {
      str += " ".concat(args.slice(i).map(function (a) {
        var aType = typeof a;

        switch (aType) {
          case 'object':
          case 'symbol':
            return util.inspect(a);

          default:
            return String(a);}

      }).join(' '));
    }

    return str;
  } // first arg wasn't string, so we loop over args and call util.inspect on each


  return args.map(function (a) {
    return util.inspect(a);
  }).join(' ');
};
/**
    * @param {Function} constructor subclass
    * @param {Function} superConstructor base class
    * @returns {void}
    */


util.inherits = function (constructor, superConstructor) {
  assertArgumentType(constructor, 'constructor', 'Function');
  assertArgumentType(superConstructor, 'superConstructor', 'Function');
  assertArgumentType(superConstructor.prototype, 'superConstructor.prototype', 'Object');
  Object.defineProperty(constructor, 'super_', {
    value: superConstructor });

  Object.setPrototypeOf(constructor.prototype, superConstructor.prototype);
};
/**
    * @param {Function} original original function to wrap which is expected to have a final callback argument
    * @returns {Function} function that returns a Promise
    */


util.promisify = function (original) {
  assertArgumentType(original, 'original', 'Function');

  function wrapped() {
    var _this = this;

    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return new Promise(function (resolve, reject) {
      original.call.apply(original, [_this].concat(args, [function (err, result) {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      }]));
    });
  } // TODO: Copy properties from original to wrapped
  // TODO: hook prototype chain up from wrapped to original
  // TODO: Support custom promisify hooks


  return wrapped;
};
/**
    * @param {Function} original original function to convert from async/Promise return value to a callback style
    * @returns {Function} wrapped function
    */


util.callbackify = function (original) {
  assertArgumentType(original, 'original', 'Function');

  function wrapped() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    var callback = args.pop();
    var promise = original.apply(this, args);
    promise.then(function (result) {
      // eslint-disable-line promise/always-return
      callback(null, result); // eslint-disable-line promise/no-callback-in-promise
    }).catch(function (err) {
      if (!err) {
        var wrappedError = new Error('Promise was rejected with falsy value');
        wrappedError.reason = err;
        err = wrappedError;
      }

      callback(err); // eslint-disable-line promise/no-callback-in-promise
    });
  }

  return wrapped;
};
/**
    * @param {Function} func function to deprecate/wrap
    * @param {string} string message to give when deprecation warning is emitted
    * @param {string} code deprecation code to use to group warnings
    * @returns {Function} wrapped function
    */


util.deprecate = function (func, string, code) {
  // eslint-disable-line no-unused-vars
  if (process.noDeprecation) {
    return func; // skip the wrapping!
  } // TODO: Support `code` argument by tracking a map of codes we've warned about


  function wrapped() {
    var warned = false;

    if (!warned) {
      process.emitWarning(string, 'DeprecationWarning');
      warned = true;
    }

    for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    return func.apply(this, args);
  }

  return wrapped;
}; // TODO: Support debuglog? What is our equivalent of process.env('NODE_DEBUG')?


var noop = function noop() {};

util.debuglog = function () {
  return noop;
};

var DEFAULT_MESSAGES = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  deepEqual: 'Expected values to be loosely deep-equal:',
  equal: 'Expected values to be loosely equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notEqual: 'Expected "actual" to be loosely unequal to:' };
// Fake enums to use internally

var COMPARE_TYPE = {
  Object: 0,
  Map: 1,
  Set: 2 };

var STRICTNESS = {
  Strict: 0,
  Loose: 1 };


var AssertionError =
/*#__PURE__*/
function (_Error) {
  _inherits(AssertionError, _Error);

  function AssertionError(options) {
    var _this;

    _classCallCheck(this, AssertionError);

    var actual = options.actual,
    expected = options.expected,
    message = options.message,
    operator = options.operator;

    if (!message) {
      // FIXME: Generate the rest of the message with diff of actual/expected!
      message = "".concat(DEFAULT_MESSAGES[operator], "\n\n");
    }

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AssertionError).call(this, message));
    _this.actual = actual;
    _this.expected = expected;
    _this.operator = operator;
    _this.generatedMessage = !message;
    _this.name = 'AssertionError [ERR_ASSERTION]';
    _this.code = 'ERR_ASSERTION';
    return _this;
  }

  return AssertionError;
}(_wrapNativeSuper(Error)); // TODO: Can we define AssertStrict and AssertLoose as subclasses of a base Assert class
// that class holds impls for shared methods, subclasses override specific
// comparisons used (Object.is vs ===)?


var assert = function assert(value, message) {
  return assert.ok(value, message);
};

assert.AssertionError = AssertionError;

assert.ok = function () {
  var value = arguments.length <= 0 ? undefined : arguments[0];

  if (value) {
    return;
  }

  var message = arguments.length <= 1 ? undefined : arguments[1];
  var generatedMessage = false; // Check if value (1st arg) was not supplied!
  // Have to use ugly hack on args definition to do so

  if (arguments.length === 0) {
    message = 'No value argument passed to `assert.ok()`';
    generatedMessage = true;
  } else if (message == null) {
    // eslint-disable-line no-eq-null,eqeqeq
    // TODO: generate rest of the message. Node actually reads the input file! The hacked browserify does not do this
    // It treates ok failing like `value == true` failing
    message = 'The expression evaluated to a falsy value:\n\n';
    generatedMessage = true;
  } else if (message instanceof Error) {
    throw message;
  }

  var err = new AssertionError({
    actual: value,
    expected: true,
    message,
    operator: '==' });

  err.generatedMessage = generatedMessage;
  throw err;
};

function throwError(obj) {
  // If message is an Error object, throw that instead!
  if (obj.message instanceof Error) {
    throw obj.message;
  }

  throw new AssertionError(obj);
}

assert.equal = function (actual, expected, message) {
  if (actual == expected) {
    // eslint-disable-line eqeqeq
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'equal' });

};

assert.strictEqual = function (actual, expected, message) {
  if (Object.is(actual, expected)) {
    // provides SameValue comparison for us
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'strictEqual' });

};

assert.notEqual = function (actual, expected, message) {
  if (actual != expected) {
    // eslint-disable-line eqeqeq
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'notEqual' });

};

assert.notStrictEqual = function (actual, expected, message) {
  if (!Object.is(actual, expected)) {
    // provides SameValue comparison for us
    return;
  }

  throwError({
    actual,
    expected,
    message,
    operator: 'notStrictEqual' });

};

var isPrimitive = function isPrimitive(value) {
  return typeof value !== 'object' && typeof value !== 'function' || value === null;
};
/**
    * @param {Map} actual map we are comparing
    * @param {Map} expected map we're comparing against
    * @param {STRICTNESS.Loose|strictness.Strict} strictness how to compare
    * @param {object} references memoized references to objects in the deepEqual hierarchy
    * @returns {boolean}
    */


function compareMaps(actual, expected, strictness, references) {
  var looseChecks = new Set(); // keep track of objects we need to test more extensively than using #get()/#has()

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = actual[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
      key = _step$value[0],
      value = _step$value[1];

      if (typeof key === 'object' && key !== null) {
        // non-null object. We need to do our own checking, not use get()/has()
        looseChecks.add(key);
      } else {
        // handle "primitives"
        if (expected.has(key) && deepEqual(value, expected.get(key), strictness, references)) {
          // yay! a nice easy match - both key and value matched exactly - move on
          continue;
        }

        if (strictness === STRICTNESS.Strict) {
          // if we didn't match key/value perfectly in strict mode, fail right away
          return false;
        } // ok, so it didn't match key/value perfectly - but we're in loose mode, so fall back to try again


        looseChecks.add(key);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (looseChecks.size === 0) {
    // no loose ends to tie up, everything matched
    return true;
  } // only go through the second Map once!


  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = expected[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2),
      expectedKey = _step2$value[0],
      expectedValue = _step2$value[1];

      // if it's not a non-null object in strict mode, fail!
      // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
      // Note that this shouldn't ever happen since we should be returning false immediately above
      if (strictness === STRICTNESS.Strict && !(typeof expectedKey === 'object' && expectedKey !== null)) {
        return false;
      } // otherwise, test it // TODO: Wish we could use #find() like on an Array, but Set doesn't have it!


      var found = false;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = looseChecks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var key = _step3.value;

          // if both key and value matches
          if (deepEqual(key, expectedKey, strictness, references) && deepEqual(actual.get(key), expectedValue, strictness, references)) {
            found = true;
            looseChecks.delete(key); // remove from our looseChecks Set since we already matched it

            break;
          }
        } // if not found, we failed to match

      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (!found) {
        return false;
      }
    } // did we leave un-matched keys? if so, fail

  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return looseChecks.size === 0;
}
/**
   * @param {Set} actual map we are comparing
   * @param {Set} expected map we're comparing against
   * @param {strictness.Loose|strictness.Strict} strictness how to compare
   * @param {object} references memoized references to objects in the deepEqual hierarchy
   * @returns {boolean}
   */


function compareSets(actual, expected, strictness, references) {
  var looseChecks = new Set(); // keep track of values we need to test more extensively than using #has()

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = actual[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var value = _step4.value;

      if (typeof value === 'object' && value !== null) {
        // non-null object. We need to do our own checking, not use has()
        looseChecks.add(value);
      } else if (!expected.has(value)) {
        // FIXME: has does "same-value-zero" check, which is like Object.is except for -0/+0 being considered equal
        // so may need to special case that here, that'd have to be in an else below (since has will return true here)
        if (strictness === STRICTNESS.Strict) {
          // failed "same-value" match for primitive in strict mode, so fail right away
          return false;
        } // When doing loose check, we need to fall back to looser check than #has(), so we can't just return false immediately here
        // add to set of values to check more thoroughly


        looseChecks.add(value);
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  if (looseChecks.size === 0) {
    // no loose ends to tie up, everything matched
    return true;
  } // Try to whittle down the loose checks set to be empty...
  // only go through the second Set once!


  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = expected[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var expectedValue = _step5.value;

      // if it's not a non-null object in strict mode, fail!
      // (i.e. if it's a primitive that failed a match, don't fall back to more loosely match it)
      // Note that this shouldn't ever happen since we should be returning false immediately above
      if (strictness === STRICTNESS.Strict && !(typeof expectedValue === 'object' && expectedValue !== null)) {
        return false;
      }

      var found = false;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = looseChecks[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var object = _step6.value;

          if (deepEqual(object, expectedValue, strictness, references)) {
            found = true; // found a match!

            looseChecks.delete(object); // remove from our looseChecks Set since we matched it

            break;
          }
        } // if not found, we failed to match

      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      if (!found) {
        return false;
      }
    } // did we leave un-matched values? if so, fail

  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return looseChecks.size === 0;
}
/**
   * @param {*} actual value we are comparing
   * @param {*} expected values we're comparing against
   * @param {STRICTNESS.Strict|STRICTNESS.Loose} strictness how strict a comparison to do
   * @param {object} [references] optional object to keep track of circular references in the hierarchy
   * @param {Map<object,number>} [references.actual] mapping from objects visited (on `actual`) to their depth
   * @param {Map<object,number>} [references.expected] mapping from objects visited (on `expected`) to their depth
   * @param {number} [references.depth] The current depth of the hierarchy
   * @returns {boolean}
   */


function deepEqual(actual, expected, strictness, references) {
  // if primitives, compare using Object.is
  // This handles: null, undefined, number, string, boolean
  if (isPrimitive(actual) && isPrimitive(expected)) {
    if (strictness === STRICTNESS.Strict) {
      return Object.is(actual, expected);
    } else {
      return actual == expected; // eslint-disable-line eqeqeq
    }
  } // Now we have various objects/functions:
  // Date, Error, RegExp, Array, Map, Set, Object, Function, Arrow functions, WeakMap, DataView, ArrayBuffer, WeakSet, typed arrays
  // notably, this includes "boxed" primitives created by new Boolean(false), new String('value'), Symbol('whatever'), etc
  // Type tags of objects should be the same


  var actualTag = Object.prototype.toString.call(actual);
  var expectedTag = Object.prototype.toString.call(expected);

  if (actualTag !== expectedTag) {
    return false;
  } // [[Prototype]] of objects are compared using the Strict Equality Comparison.


  if (strictness === STRICTNESS.Strict) {
    // don't check prototype when doing "loose"
    var actualPrototype = Object.getPrototypeOf(actual);
    var expectedPrototype = Object.getPrototypeOf(expected);

    if (actualPrototype !== expectedPrototype) {
      return false;
    }
  }

  var comparison = COMPARE_TYPE.Object;

  if (util.types.isRegexp(actual)) {
    // RegExp source and flags should match
    if (!util.types.isRegexp(expected) || actual.flags !== expected.flags || actual.source !== expected.source) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isDate(actual)) {
    // Date's underlying time should match
    if (!util.types.isDate(expected) || actual.getTime() !== expected.getTime()) {
      return false;
    } // continue on to check properties...

  } else if (actual instanceof Error) {
    // Error's name and message must match
    if (!(expected instanceof Error) || actual.name !== expected.name || actual.message !== expected.message) {
      return false;
    } // continue on to check properties...

  } else if (Array.isArray(actual)) {
    // if array lengths differ, quick fail
    if (!Array.isArray(expected) || actual.length !== expected.length) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isBoxedPrimitive(actual)) {
    if (!util.types.isBoxedPrimitive(expected)) {
      return false;
    } // check that they're the same type of wrapped primitive and then call the relevant valueOf() for that type to compare them!


    if (util.types.isNumberObject(actual) && (!util.types.isNumberObject(expected) || !Object.is(Number.prototype.valueOf.call(actual), Number.prototype.valueOf.call(expected)))) {
      return false;
    } else if (util.types.isStringObject(actual) && (!util.types.isStringObject(expected) || String.prototype.valueOf.call(actual) !== String.prototype.valueOf.call(expected))) {
      return false;
    } else if (util.types.isBooleanObject(actual) && (!util.types.isBooleanObject(expected) || Boolean.prototype.valueOf.call(actual) !== Boolean.prototype.valueOf.call(expected))) {
      return false; // FIXME: Uncomment when we support BigInt cross-platform!
      // } else if (util.types.isBigIntObject(actual)
      // 	&& (!util.types.isBigIntObject(expected)
      // 		|| BigInt.prototype.valueOf.call(actual) !== BigInt.prototype.valueOf.call(expected))) {
      // 	return false;
    } else if (util.types.isSymbolObject(actual) && (!util.types.isSymbolObject(expected) || Symbol.prototype.valueOf.call(actual) !== Symbol.prototype.valueOf.call(expected))) {
      return false;
    } // continue on to check properties...

  } else if (util.types.isSet(actual)) {
    if (!util.types.isSet(expected) || actual.size !== expected.size) {
      return false;
    }

    comparison = COMPARE_TYPE.Set; // continue on to check properties...
  } else if (util.types.isMap(actual)) {
    if (!util.types.isMap(expected) || actual.size !== expected.size) {
      return false;
    }

    comparison = COMPARE_TYPE.Map; // continue on to check properties...
  } // Now iterate over properties and compare them!


  var actualKeys = Object.keys(actual); // for an array, this will return the indices that have values

  var expectedKeys = Object.keys(expected); // and it just magically works
  // Must have same number of properties

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  } // Are they the same keys? If one is missing, then no, fail right away


  if (!actualKeys.every(function (key) {
    return Object.prototype.hasOwnProperty.call(expected, key);
  })) {
    return false;
  } // Don't check own symbols when doing "loose"


  if (strictness === STRICTNESS.Strict) {
    var actualSymbols = Object.getOwnPropertySymbols(actual);
    var expectedSymbols = Object.getOwnPropertySymbols(expected); // Must have same number of symbols

    if (actualSymbols.length !== expectedSymbols.length) {
      return false;
    }

    if (actualSymbols.length > 0) {
      // Have to filter them down to enumerable symbols!
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = actualSymbols[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var key = _step7.value;
          var actualIsEnumerable = Object.prototype.propertyIsEnumerable.call(actual, key);
          var expectedIsEnumerable = Object.prototype.propertyIsEnumerable.call(expected, key);

          if (actualIsEnumerable !== expectedIsEnumerable) {
            return false; // they differ on whetehr symbol is enumerable, fail!
          } else if (actualIsEnumerable) {
            // it's enumerable, add to keys to check
            actualKeys.push(key);
            expectedKeys.push(key);
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  } // Avoid circular references!
  // Record map from objects to depth in the hierarchy


  if (references === undefined) {
    references = {
      actual: new Map(),
      expected: new Map(),
      depth: 0 };

  } else {
    // see if we've already recorded these objects.
    // if so, make sure they refer to same depth in object hierarchy
    var memoizedActual = references.actual.get(actual);

    if (memoizedActual !== undefined) {
      var memoizedExpected = references.expected.get(expected);

      if (memoizedExpected !== undefined) {
        return memoizedActual === memoizedExpected;
      }
    }

    references.depth++;
  } // store the object -> depth mapping


  references.actual.set(actual, references.depth);
  references.expected.set(expected, references.depth); // When comparing Maps/Sets, compare elements before custom properties

  var result = true;

  if (comparison === COMPARE_TYPE.Set) {
    result = compareSets(actual, expected, strictness, references);
  } else if (comparison === COMPARE_TYPE.Map) {
    result = compareMaps(actual, expected, strictness, references);
  }

  if (result) {
    // Now loop over keys and compare them to each other!
    for (var _i = 0, _actualKeys = actualKeys; _i < _actualKeys.length; _i++) {
      var _key = _actualKeys[_i];

      if (!deepEqual(actual[_key], expected[_key], strictness, references)) {
        result = false;
        break;
      }
    }
  } // wipe the object to depth mapping for these objects now


  references.actual.delete(actual);
  references.expected.delete(expected);
  return result;
}

assert.deepStrictEqual = function (actual, expected, message) {
  if (!deepEqual(actual, expected, STRICTNESS.Strict)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'deepStrictEqual' });

  }
};

assert.notDeepStrictEqual = function (actual, expected, message) {
  if (deepEqual(actual, expected, STRICTNESS.Strict)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'notDeepStrictEqual' });

  }
};

assert.deepEqual = function (actual, expected, message) {
  if (!deepEqual(actual, expected, STRICTNESS.Loose)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'deepEqual' });

  }
};

assert.notDeepEqual = function (actual, expected, message) {
  if (deepEqual(actual, expected, STRICTNESS.Loose)) {
    throwError({
      actual,
      expected,
      message,
      operator: 'notDeepEqual' });

  }
};

assert.fail = function () {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Failed';
  return throwError({
    message });

};

var NO_EXCEPTION = {};

function execute(fn) {
  assertArgumentType(fn, 'fn', 'Function');

  try {
    fn();
  } catch (e) {
    return e;
  }

  return NO_EXCEPTION;
}

function isPromiseLike(fn) {
  return util.types.isPromise(fn) || fn && typeof fn === 'object' && typeof fn.then === 'function';
}

function executePromise(_x) {
  return _executePromise.apply(this, arguments);
}

function _executePromise() {
  _executePromise = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(fn) {
    var promise, fnType;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            fnType = typeof fn;

            if (!(fnType === 'function')) {
              _context3.next = 7;
              break;
            }

            promise = fn();

            if (isPromiseLike(promise)) {
              _context3.next = 5;
              break;
            }

            throw new TypeError("Expected instanceof Promise to be returned from the \"fn\" function but got ".concat(typeof promise));

          case 5:
            _context3.next = 10;
            break;

          case 7:
            if (isPromiseLike(fn)) {
              _context3.next = 9;
              break;
            }

            throw new TypeError("The \"fn\" argument must be of type Function or Promise. Received type ".concat(fnType));

          case 9:
            promise = fn;

          case 10:
            _context3.prev = 10;
            _context3.next = 13;
            return promise;

          case 13:
            _context3.next = 18;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](10);
            return _context3.abrupt("return", _context3.t0);

          case 18:
            return _context3.abrupt("return", NO_EXCEPTION);

          case 19:
          case "end":
            return _context3.stop();}

      }
    }, _callee3, null, [[10, 15]]);
  }));
  return _executePromise.apply(this, arguments);
}

assert.throws = function (fn, error, message) {
  var actual = execute(fn);

  if (actual === NO_EXCEPTION) {
    // FIXME: append message if not null
    throwError({
      actual: undefined,
      expected: error,
      message: 'Missing expected exception.',
      operator: 'throws' });

    return;
  } // They didn't specify how to validate, so just roll with it


  if (!error) {
    return;
  }

  if (!checkError(actual, error, message)) {
    throw actual; // throw the Error it did generate
  }
};

assert.rejects =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(asyncFn, error, message) {
    var actual;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return executePromise(asyncFn);

          case 2:
            actual = _context.sent;

            if (!(actual === NO_EXCEPTION)) {
              _context.next = 6;
              break;
            }

            // FIXME: append message if not null
            throwError({
              actual: undefined,
              expected: error,
              message: 'Missing expected exception.',
              operator: 'rejects' });

            return _context.abrupt("return");

          case 6:
            if (error) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return");

          case 8:
            if (checkError(actual, error, message)) {
              _context.next = 10;
              break;
            }

            throw actual;

          case 10:
          case "end":
            return _context.stop();}

      }
    }, _callee);
  }));

  return function (_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

assert.doesNotThrow = function (fn, error, message) {
  var actual = execute(fn); // no Error, just return

  if (actual === NO_EXCEPTION) {
    return;
  } // They didn't specify how to validate, so just re-throw


  if (!error) {
    throw actual;
  } // If error matches expected, throw an AssertionError


  if (checkError(actual, error)) {
    throwError({
      actual,
      expected: error,
      operator: 'doesNotThrow',
      message: "Got unwanted exception".concat(message ? ': ' + message : '.') });

    return;
  } // doesn't match, re-throw


  throw actual;
};

assert.doesNotReject =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(fn, error, message) {
    var actual;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return executePromise(fn);

          case 2:
            actual = _context2.sent;

            if (!(actual === NO_EXCEPTION)) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return");

          case 5:
            if (error) {
              _context2.next = 7;
              break;
            }

            throw actual;

          case 7:
            if (!checkError(actual, error)) {
              _context2.next = 10;
              break;
            }

            throwError({
              actual,
              expected: error,
              operator: 'doesNotThrow',
              message: "Got unwanted exception".concat(message ? ': ' + message : '.') });

            return _context2.abrupt("return");

          case 10:
            throw actual;

          case 11:
          case "end":
            return _context2.stop();}

      }
    }, _callee2);
  }));

  return function (_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();
/**
      * @param {Error} actual the actual Error generated by the wrapped function/block
      * @param {object|RegExp|Function|Error|Class} expected The value to test against the Error
      * @param {string} [message] custom message to append
      * @returns {boolean} true if the Error matches the expected value/object
      */


function checkError(actual, expected, message) {
  // What we do here depends on what `expected` is:
  // function - call it to validate
  // object - test properties against actual
  // Regexp - test against actual.toString()
  // Error type - check type matches
  // Error instance - compare properties
  if (typeof expected === 'object') {
    if (util.types.isRegexp(expected)) {
      return expected.test(actual); // does the error match the RegExp expression? if so, pass
    } // Test properties (`expected` is either a generic Object or an Error instance)


    var keys = Object.keys(expected); // If we're testing against an instance of an Error, we need to hack in name/message properties.

    if (expected instanceof Error) {
      keys.unshift('name', 'message'); // we want to compare name and message, but they're not set as enumerable on Error
    }

    for (var _i2 = 0, _keys = keys; _i2 < _keys.length; _i2++) {
      var key = _keys[_i2];

      if (!deepEqual(actual[key], expected[key], STRICTNESS.Strict)) {
        if (!message) {
          // generate a meaningful message! Cheat by treating like equality check of values
          // then steal the message it generated
          try {
            throwError({
              actual: actual[key],
              expected: expected[key],
              operator: 'deepStrictEqual' });

          } catch (err) {
            message = err.message;
          }
        }

        throwError({
          actual,
          expected,
          message,
          operator: 'throws' });

        return false;
      }
    }

    return true; // They all matched, pass!
  } else if (typeof expected === 'function') {
    // if `expected` is a "type" and actual is an instance of that type, then pass
    if (expected.prototype != null && actual instanceof expected) {
      // eslint-disable-line no-eq-null,eqeqeq
      return true;
    } // If `expected` is a subclass of Error but `actual` wasn't an instance of it (above), fail


    if (Object.prototype.isPrototypeOf.call(Error, expected)) {
      return false;
    } // ok, let's assume what's left is that `expected` was a validation function,
    // so call it with empty `this` and single argument of the actual error we received


    return expected.call({}, actual);
  }

  return false;
}

assert.ifError = function (value) {
  if (value === null || value === undefined) {
    return;
  }

  throwError({
    actual: value,
    expected: null,
    message: "ifError got unwanted exception: ".concat(value),
    operator: 'ifError' });

}; // Create "strict" copy which overrides "loose" methods to call strict equivalents


assert.strict = function (value, message) {
  return assert.ok(value, message);
}; // "Copy" methods from assert to assert.strict!


Object.assign(assert.strict, assert); // Override the "loose" methods to point to the strict ones

assert.strict.deepEqual = assert.deepStrictEqual;
assert.strict.notDeepEqual = assert.notDeepStrictEqual;
assert.strict.equal = assert.strictEqual;
assert.strict.notEqual = assert.notStrictEqual; // hang strict off itself

assert.strict.strict = assert.strict;

var kNodeModulesRE = /^(.*)[\\/]node_modules[\\/]/;
var getStructuredStack;

var StackTraceError =
/*#__PURE__*/
function (_Error) {
  _inherits(StackTraceError, _Error);

  function StackTraceError() {
    _classCallCheck(this, StackTraceError);

    return _possibleConstructorReturn(this, _getPrototypeOf(StackTraceError).apply(this, arguments));
  }

  return StackTraceError;
}(_wrapNativeSuper(Error));

StackTraceError.prepareStackTrace = function (err, trace) {
  return trace;
};

StackTraceError.stackTraceLimit = Infinity;
function isInsideNodeModules() {
  if (getStructuredStack === undefined) {
    getStructuredStack = function getStructuredStack() {
      return new StackTraceError().stack;
    };
  }

  var stack = getStructuredStack(); // stack is only an array on v8, try to convert manually if string

  if (typeof stack === 'string') {
    var stackFrames = [];
    var lines = stack.split(/\n/);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var line = _step.value;
        var lineInfo = line.match(/(.*)@(.*):(\d+):(\d+)/);

        if (lineInfo) {
          (function () {
            var filename = lineInfo[2].replace('file://', '');
            stackFrames.push({
              getFileName: function getFileName() {
                return filename;
              } });

          })();
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    stack = stackFrames;
  } // Iterate over all stack frames and look for the first one not coming
  // from inside Node.js itself:


  if (Array.isArray(stack)) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = stack[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var frame = _step2.value;
        var filename = frame.getFileName(); // If a filename does not start with / or contain \,
        // it's likely from Node.js core.

        if (!/^\/|\\/.test(filename)) {
          continue;
        }

        return kNodeModulesRE.test(filename);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  return false;
}

var TI_CODEC_MAP = new Map();
TI_CODEC_MAP.set('utf-8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf8', Ti.Codec.CHARSET_UTF8);
TI_CODEC_MAP.set('utf-16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('utf16le', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('ucs-2', Ti.Codec.CHARSET_UTF16LE);
TI_CODEC_MAP.set('latin1', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('binary', Ti.Codec.CHARSET_ISO_LATIN_1);
TI_CODEC_MAP.set('ascii', Ti.Codec.CHARSET_ASCII); // We have no equivalents of base64 or hex, so we convert them internally here

var VALID_ENCODINGS = ['hex', 'utf8', 'utf-8', 'ascii', 'latin1', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le']; // Used to cheat for read/writes of doubles

var doubleArray = new Float64Array(1);
var uint8DoubleArray = new Uint8Array(doubleArray.buffer); // Used to cheat to read/write floats

var floatArray = new Float32Array(1);
var uint8FloatArray = new Uint8Array(floatArray.buffer);

var Buffer =
/*#__PURE__*/
function () {
  /**
              * Constructs a new buffer.
              *
              * Primarily used internally in this module together with `newBuffer` to
              * create a new Buffer instance wrapping a Ti.Buffer.
              *
              * Also supports the deprecated Buffer() constructors which are safe
              * to use outside of this module.
              *
              * @param {integer[]|Buffer|integer|string|Ti.Buffer} arg
              * @param {string|integer} encodingOrOffset
              * @param {integer} length
              */
  function Buffer(arg, encodingOrOffset, length) {
    _classCallCheck(this, Buffer);

    if (typeof arg !== 'object' || arg.apiName !== 'Ti.Buffer') {
      showFlaggedDeprecation();

      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new TypeError("The \"string\" argument must be of type \"string\". Received type ".concat(typeof arg));
        }

        return Buffer.alloc(arg);
      }

      return Buffer.from(arg, encodingOrOffset, length);
    }

    var tiBuffer = arg;
    var start = encodingOrOffset;
    this._tiBuffer = tiBuffer;

    if (start === undefined) {
      start = 0;
    }

    this.byteOffset = start;

    if (length === undefined) {
      this.length = tiBuffer.length - this.byteOffset;
    } else {
      this.length = length;
    }

    this._isBuffer = true; // FIXME: Support .buffer property that holds an ArrayBuffer!
  }
  /**
     * 0 is returned if target is the same as buf
     * 1 is returned if target should come before buf when sorted.
     * -1 is returned if target should come after buf when sorted.
     * @param {Buffer} target Buffer to compare against
     * @param {integer} [targetStart=0] index to start in target
     * @param {integer} [targetEnd=target.length] index to end in target
     * @param {integer} [sourceStart=0] index to start in this Buffer
     * @param {integer} [sourceEnd=this.length] index to end in this Buffer
     * @returns {integer}
     */


  _createClass(Buffer, [{
    key: "compare",
    value: function compare(target, targetStart, targetEnd, sourceStart, sourceEnd) {
      if (!Buffer.isBuffer(target)) {
        throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. Received type ".concat(typeof buf1));
      }

      if (targetStart === undefined) {
        targetStart = 0;
      }

      if (sourceStart === undefined) {
        sourceStart = 0;
      }

      if (targetEnd === undefined) {
        targetEnd = target.length;
      }

      if (sourceEnd === undefined) {
        sourceEnd = this.length;
      } // ERR_OUT_OF_RANGE is thrown if targetStart < 0, sourceStart < 0, targetEnd > target.byteLength, or sourceEnd > source.byteLength


      if (targetStart < 0 || sourceStart < 0 || targetEnd > target.length || sourceEnd > this.length) {
        throw new RangeError('Index out of range'); // FIXME: set "code" to ERR_INDEX_OUT_OF_RANGE
      } // Use slices to make the loop easier


      var source = this.slice(sourceStart, sourceEnd);
      var sourceLength = source.length;
      var dest = target.slice(targetStart, targetEnd);
      var destLength = dest.length;
      var length = Math.min(sourceLength, destLength);

      for (var i = 0; i < length; i++) {
        var targetValue = getAdjustedIndex(dest, i);
        var sourceValue = getAdjustedIndex(source, i);

        if (targetValue !== sourceValue) {
          // No match! Return 1 or -1 based on what is greater!
          if (sourceValue < targetValue) {
            return -1;
          }

          return 1;
        }
      } // sort based on length!


      if (sourceLength < destLength) {
        return -1;
      }

      if (sourceLength > destLength) {
        return 1;
      }

      return 0;
    }
    /**
       * Copies from this to target
       * @param {Buffer} target destination we're copying into
       * @param {integer} [targetStart=0] start index to copy into in destination Buffer
       * @param {integer} [sourceStart=0] start index to copy from within `this`
       * @param {integer} [sourceEnd=this.length] end index to copy from within `this`
       * @returns {integer} number of bytes copied
       */ },

  {
    key: "copy",
    value: function copy(target, targetStart, sourceStart, sourceEnd) {
      if (targetStart === undefined) {
        targetStart = 0;
      }

      if (sourceStart === undefined) {
        sourceStart = 0;
      }

      if (sourceEnd === undefined) {
        sourceEnd = this.length;
      }

      if (sourceStart === sourceEnd) {
        return 0;
      }

      if (target.length === 0 || this.length === 0) {
        return 0;
      } // TODO: check for out of bounds?


      var length = sourceEnd - sourceStart; // Cap length to remaining bytes in target!

      var remaining = target.length - targetStart;

      if (length > remaining) {
        length = remaining;
      } // TODO: handle overlap when target === this!
      // TODO: Do we need to take target or this.byteOffset into account here?


      target._tiBuffer.copy(this._tiBuffer, targetStart, sourceStart, length);

      return length;
    }
    /**
       * Creates and returns an iterator of [index, byte] pairs from the contents of buf.
       * @returns {Iterator}
       */ },

  {
    key: "entries",
    value: function entries() {
      var buffer = this;
      var nextIndex = 0;
      var end = this.length;
      var entryIterator = {
        next: function next() {
          if (nextIndex < end) {
            var result = {
              value: [nextIndex, getAdjustedIndex(buffer, nextIndex)],
              done: false };

            nextIndex++;
            return result;
          }

          return {
            value: undefined,
            done: true };

        },
        [Symbol.iterator]: function () {
          return this;
        } };

      return entryIterator;
    } },
  {
    key: "equals",
    value: function equals(otherBuffer) {
      if (!Buffer.isBuffer(otherBuffer)) {
        throw new TypeError('argument must be a Buffer');
      }

      if (otherBuffer === this) {
        return true;
      }

      return this.compare(otherBuffer) === 0;
    }
    /**
       * @param {string|Buffer|UInt8Array|integer} value The value with which to fill `buf`.
       * @param {integer} [offset=0] Number of bytes to skip before starting to fill `buf`
       * @param {integer} [end] Where to stop filling buf (not inclusive). `buf.length` by default
       * @param {string} [encoding='utf8'] The encoding for `value` if `value` is a string.
       * @returns {this}
       */ },

  {
    key: "fill",
    value: function fill(value, offset, end, encoding) {
      var offsetType = typeof offset;

      if (offsetType === 'undefined') {
        // value supplied
        offset = 0;
        end = this.length;
        encoding = 'utf8';
      } else if (offsetType === 'string') {
        // value, encoding supplied
        encoding = offset;
        offset = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        // value, offset, encoding supplied
        encoding = end;
        end = this.length;
      }

      var valueType = typeof value;

      if (valueType === 'string') {
        var bufToFillWith = Buffer.from(value, encoding);
        var fillBufLength = bufToFillWith.length;

        if (fillBufLength === 0) {
          throw new Error('no valid fill data');
        } // If the buffer length === 1, we can just do this._tiBuffer.fill(value, offset, end);


        if (fillBufLength === 1) {
          this._tiBuffer.fill(bufToFillWith._tiBuffer[0], offset, end);

          return this;
        } // multiple byte fill!


        var length = end - offset;

        for (var i = 0; i < length; i++) {
          // TODO: Do we need to account for byteOffset here (on `this`, not on the buffer we just created)?
          var fillChar = bufToFillWith._tiBuffer[i % fillBufLength];
          this._tiBuffer[i + offset] = fillChar;
        }

        return this;
      } // if the value is a number (or a buffer with a single byte) we can use tiBuffer.fill();


      this._tiBuffer.fill(value, offset, end);

      return this;
    } },
  {
    key: "includes",
    value: function includes(value, byteOffset, encoding) {
      return this.indexOf(value, byteOffset, encoding) !== -1;
    }
    /**
       * @param {string|Buffer|integer} value What to search for
       * @param {integer} [byteOffset=0] Where to begin searching in buf. If negative, then offset is calculated from the end of buf
       * @param {string} [encoding='utf8'] If value is a string, this is the encoding used to determine the binary representation of the string that will be searched for in buf
       * @returns {integer} The index of the first occurrence of value in buf, or -1 if buf does not contain value.
       */ },

  {
    key: "indexOf",
    value: function indexOf(value, byteOffset, encoding) {
      if (this.length === 0) {
        // empty buffer? can't find anything!
        return -1;
      } // if byteOffset is undefined, make it 0


      if (typeof byteOffset === 'undefined') {
        byteOffset = 0;
      } else if (typeof byteOffset === 'string') {
        // if it's a string, that's actually encoding
        encoding = byteOffset;
        byteOffset = 0;
      } // if we don't have an encoding yet, use utf8


      if (typeof encoding !== 'string') {
        encoding = 'utf8';
      }

      if (byteOffset < 0) {
        // convert negative indices
        byteOffset = this.length + byteOffset;

        if (byteOffset < 0) {
          // still negative? start at 0
          byteOffset = 0;
        }
      } else if (byteOffset >= this.length) {
        return -1; // can't find past end of buffer!
      }

      if (typeof value === 'number') {
        value &= 0xFF; // clamp to 255
        // This is a simpler case, we have a single byte we need to search for
        // so just loop through and try to find it

        return _indexOf(this, value, byteOffset);
      } // coerce a string to a Buffer


      if (typeof value === 'string') {
        value = Buffer.from(value, encoding);
      } // value is now a Buffer...


      var matchLength = value.length;

      if (matchLength === 0) {
        return -1; // never find empty value!
      }

      if (matchLength === 1) {
        // simple case, match one byte!
        return _indexOf(this, value[0], byteOffset);
      }

      var currentIndex = byteOffset;
      var thisLength = this.length;

      if (matchLength > thisLength) {
        return -1; // can't match if the value is longer than this Buffer!
      } // FIXME: Can we rewrite this in a less funky way?
      // FIXME: Can stop earlier based on matchLength!


      firstMatch: while (currentIndex < thisLength) {
        // eslint-disable-line no-labels
        // match first byte!
        var firstByteMatch = _indexOf(this, value[0], currentIndex);

        if (firstByteMatch === -1) {
          // couldn't even match the very first byte, so no match overall!
          return -1;
        } // ok, we found the first byte, now we need to see if the next consecutive bytes match!


        for (var x = 1; x < matchLength; x++) {
          if (firstByteMatch + x >= thisLength) {
            currentIndex = firstByteMatch + 1; // move past our first match

            continue firstMatch; // eslint-disable-line no-labels
          }

          if (this[firstByteMatch + x] !== value[x]) {
            // didn't match!
            currentIndex = firstByteMatch + 1; // move past our first match

            continue firstMatch; // eslint-disable-line no-labels
          }
        }

        return firstByteMatch; // the rest matched, hurray!
      }

      return -1;
    } },
  {
    key: "keys",
    value: function keys() {
      var nextIndex = 0;
      var end = this.length;
      var myIterator = {
        next: function next() {
          if (nextIndex < end) {
            var result = {
              value: nextIndex,
              done: false };

            nextIndex++;
            return result;
          }

          return {
            value: undefined,
            done: true };

        },
        [Symbol.iterator]: function () {
          return this;
        } };

      return myIterator;
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 8
       * @returns {double} Reads a 64-bit double from buf at the specified offset with specified endian format
       */ },

  {
    key: "readDoubleBE",
    value: function readDoubleBE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 8); // Node cheats and uses a Float64Array and UInt8Array backed by the same buffer
      // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float64Array
      // FIXME: This assumes LE system byteOrder

      uint8DoubleArray[7] = this[offset++];
      uint8DoubleArray[6] = this[offset++];
      uint8DoubleArray[5] = this[offset++];
      uint8DoubleArray[4] = this[offset++];
      uint8DoubleArray[3] = this[offset++];
      uint8DoubleArray[2] = this[offset++];
      uint8DoubleArray[1] = this[offset++];
      uint8DoubleArray[0] = this[offset++];
      return doubleArray[0];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 8
       * @returns {double} Reads a 64-bit double from buf at the specified offset with specified endian format
       */ },

  {
    key: "readDoubleLE",
    value: function readDoubleLE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 8); // Node cheats and uses a Float64Array and UInt8Array backed by the same buffer
      // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float64Array
      // FIXME: This assumes LE system byteOrder

      uint8DoubleArray[0] = this[offset++];
      uint8DoubleArray[1] = this[offset++];
      uint8DoubleArray[2] = this[offset++];
      uint8DoubleArray[3] = this[offset++];
      uint8DoubleArray[4] = this[offset++];
      uint8DoubleArray[5] = this[offset++];
      uint8DoubleArray[6] = this[offset++];
      uint8DoubleArray[7] = this[offset++];
      return doubleArray[0];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4
       * @returns {float} Reads a 32-bit float from buf at the specified offset with specified endian format
       */ },

  {
    key: "readFloatBE",
    value: function readFloatBE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 4); // Node cheats and uses a Float32Array and UInt8Array backed by the same buffer
      // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float32Array
      // FIXME: This assumes LE system byteOrder

      uint8FloatArray[3] = this[offset++];
      uint8FloatArray[2] = this[offset++];
      uint8FloatArray[1] = this[offset++];
      uint8FloatArray[0] = this[offset++];
      return floatArray[0];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4
       * @returns {float} Reads a 32-bit float from buf at the specified offset with specified endian format
       */ },

  {
    key: "readFloatLE",
    value: function readFloatLE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 4); // Node cheats and uses a Float32Array and UInt8Array backed by the same buffer
      // so basically it reads in the bytes stuffing them into Uint8Array, then returns the value from the Float32Array
      // FIXME: This assumes LE system byteOrder

      uint8FloatArray[0] = this[offset++];
      uint8FloatArray[1] = this[offset++];
      uint8FloatArray[2] = this[offset++];
      uint8FloatArray[3] = this[offset++];
      return floatArray[0];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 1.
       * @returns {integer}
       */ },

  {
    key: "readInt8",
    value: function readInt8() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var unsignedValue = this.readUInt8(offset);
      return unsignedToSigned(unsignedValue, 1);
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "readInt16BE",
    value: function readInt16BE(offset) {
      var unsignedValue = this.readUInt16BE(offset);
      return unsignedToSigned(unsignedValue, 2);
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "readInt16LE",
    value: function readInt16LE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var unsignedValue = this.readUInt16LE(offset);
      return unsignedToSigned(unsignedValue, 2);
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "readInt32BE",
    value: function readInt32BE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var unsignedValue = this.readUInt32BE(offset);
      return unsignedToSigned(unsignedValue, 4);
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "readInt32LE",
    value: function readInt32LE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var unsignedValue = this.readUInt32LE(offset);
      return unsignedToSigned(unsignedValue, 4);
    }
    /**
       * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
       * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "readIntBE",
    value: function readIntBE(offset, byteLength) {
      var unsignedValue = this.readUIntBE(offset, byteLength);
      return unsignedToSigned(unsignedValue, byteLength);
    }
    /**
       * Reads byteLength number of bytes from buf at the specified offset and interprets the result as a two's complement signed value. Supports up to 48 bits of accuracy.
       * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength umber of bytes to read. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "readIntLE",
    value: function readIntLE(offset, byteLength) {
      var unsignedValue = this.readUIntLE(offset, byteLength);
      return unsignedToSigned(unsignedValue, byteLength);
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 1.
       * @returns {integer}
       */ },

  {
    key: "readUInt8",
    value: function readUInt8() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 1);
      return this[offset];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "readUInt16BE",
    value: function readUInt16BE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 2); // first byte shifted and OR'd with second byte

      return this[offset] << 8 | this[offset + 1];
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "readUInt16LE",
    value: function readUInt16LE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 2); // first byte OR'd with second byte shifted

      return this[offset] | this[offset + 1] << 8;
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "readUInt32BE",
    value: function readUInt32BE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 4);
      return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]); // rather than shifting by << 24, multiply the first byte and add it in so we don't retain the "sign bit"
      // (because bit-wise operators assume a 32-bit number)
    }
    /**
       * @param {integer} [offset=0] Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "readUInt32LE",
    value: function readUInt32LE() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      checkOffset(this, offset, 4);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000; // rather than shifting by << 24, multiply the last byte and add it in so we don't retain the "sign bit"
    }
    /**
       * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to read. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "readUIntBE",
    value: function readUIntBE(offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      var result = 0;
      var multiplier = 1; // we use a multipler for each byte
      // we're doing the same loop as #readUIntLE, just backwards!

      for (var i = byteLength - 1; i >= 0; i--) {
        result += getAdjustedIndex(this, offset + i) * multiplier;
        multiplier *= 0x100; // move multiplier to next byte
      }

      return result;
    }
    /**
       * @param {integer} offset Number of bytes to skip before starting to read. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to read. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "readUIntLE",
    value: function readUIntLE(offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      var result = 0;
      var multiplier = 1; // we use a multipler for each byte

      for (var i = 0; i < byteLength; i++) {
        result += getAdjustedIndex(this, offset + i) * multiplier;
        multiplier *= 0x100; // move multiplier to next byte
      }

      return result;
    }
    /**
       * @param {integer} [start=0] Where the new `Buffer` will start.
       * @param {integer} [end=this.length] Where the new Buffer will end (not inclusive). Default: `buf.length`.
       * @returns {Buffer}
       */ },

  {
    key: "slice",
    value: function slice(start, end) {
      var thisLength = this.length;

      if (typeof start === 'undefined') {
        start = 0;
      } else if (start < 0) {
        start = thisLength + start;

        if (start < 0) {
          // if this is still negative, use 0 (that matches Node)
          start = 0;
        }
      }

      if (typeof end === 'undefined') {
        end = thisLength;
      } else if (end < 0) {
        end = thisLength + end;
      } // Specifying end greater than buf.length will return the same result as that of end equal to buf.length.


      if (end > thisLength) {
        end = thisLength;
      } // What if end is less than start?


      var length = end - start;

      if (length <= 0) {
        length = 0; // return empty view of Buffer! retain byte offset, set length to 0
      } // Wrap the same Ti.Buffer object but specify the start/end to "crop" with


      return newBuffer(this._tiBuffer, this.byteOffset + start, length);
    }
    /**
       * @param {integer} [start=0] Where the new `Buffer` will start.
       * @param {integer} [end=this.length] Where the new Buffer will end (not inclusive). Default: `buf.length`.
       * @returns {Buffer}
       */ },

  {
    key: "subarray",
    value: function subarray(start, end) {
      return this.slice(start, end);
    }
    /**
       * Interprets buf as an array of unsigned 16-bit integers and swaps the byte order in-place.
       * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 2.
       * @returns {Buffer}
       */ },

  {
    key: "swap16",
    value: function swap16() {
      var length = this.length;

      if (length % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits');
      }

      for (var i = 0; i < length; i += 2) {
        var first = getAdjustedIndex(this, i);
        var second = getAdjustedIndex(this, i + 1);
        setAdjustedIndex(this, i, second);
        setAdjustedIndex(this, i + 1, first);
      }

      return this;
    }
    /**
       * Interprets buf as an array of unsigned 32-bit integers and swaps the byte order in-place.
       * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 4.
       * @returns {Buffer}
       */ },

  {
    key: "swap32",
    value: function swap32() {
      var length = this.length;

      if (length % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits');
      }

      for (var i = 0; i < length; i += 4) {
        var first = getAdjustedIndex(this, i);
        var second = getAdjustedIndex(this, i + 1);
        var third = getAdjustedIndex(this, i + 2);
        var fourth = getAdjustedIndex(this, i + 3);
        setAdjustedIndex(this, i, fourth);
        setAdjustedIndex(this, i + 1, third);
        setAdjustedIndex(this, i + 2, second);
        setAdjustedIndex(this, i + 3, first);
      }

      return this;
    }
    /**
       * Interprets buf as an array of unsigned 64-bit integers and swaps the byte order in-place.
       * Throws ERR_INVALID_BUFFER_SIZE if buf.length is not a multiple of 8.
       * @returns {Buffer}
       */ },

  {
    key: "swap64",
    value: function swap64() {
      var length = this.length;

      if (length % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits');
      }

      for (var i = 0; i < length; i += 8) {
        var first = getAdjustedIndex(this, i);
        var second = getAdjustedIndex(this, i + 1);
        var third = getAdjustedIndex(this, i + 2);
        var fourth = getAdjustedIndex(this, i + 3);
        var fifth = getAdjustedIndex(this, i + 4);
        var sixth = getAdjustedIndex(this, i + 5);
        var seventh = getAdjustedIndex(this, i + 6);
        var eighth = getAdjustedIndex(this, i + 7);
        setAdjustedIndex(this, i, eighth);
        setAdjustedIndex(this, i + 1, seventh);
        setAdjustedIndex(this, i + 2, sixth);
        setAdjustedIndex(this, i + 3, fifth);
        setAdjustedIndex(this, i + 4, fourth);
        setAdjustedIndex(this, i + 5, third);
        setAdjustedIndex(this, i + 6, second);
        setAdjustedIndex(this, i + 7, first);
      }

      return this;
    }
    /**
       * @returns {object}
       */ },

  {
    key: "toJSON",
    value: function toJSON() {
      return {
        type: 'Buffer',
        // Take advantage of slice working on "Array-like" objects (juts like `arguments`)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like_objects
        data: [].slice.call(this) };

    }
    /**
       * @param {string} [encoding='utf8'] The character encoding to use
       * @param {integer} [start=0] The byte offset to start decoding at
       * @param {integer} [end] The byte offset to stop decoding at (not inclusive). `buf.length` default
       * @returns {string}
       */ },

  {
    key: "toString",
    value: function toString(encoding, start, end) {
      // fast case of no args
      if (arguments.length === 0) {
        return this._tiBuffer.toString();
      }

      var length = this.length;

      if (start >= length) {
        return ''; // start is past end of buffer, return empty string
      }

      if (start < 0 || typeof start !== 'number') {
        start = 0;
      }

      if (end > length || typeof end !== 'number') {
        // no end specified, or past end of buffer, use length of buffer
        end = length;
      } // else keep end as passed in


      if (end <= start) {
        return ''; // if end is before start return empty string
      } // If start !== 0 and end !== length, maybe we should do a Buffer.subarray/slice over the range and call toString() on that?


      if (start !== 0 || end !== length) {
        return this.slice(start, end).toString(encoding);
      } // base case, start is 0, end is length


      if (encoding === undefined) {
        encoding = 'utf8';
      } else {
        encoding = encoding.toLowerCase(); // Throw if bad encoding!

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: ".concat(encoding));
        }
      }

      if (encoding === 'utf8' || encoding === 'utf-8') {
        // if this is the original underlying buffer just return it's toString() value
        if (this.byteOffset === 0 && this.length === this._tiBuffer.length) {
          return this._tiBuffer.toString(); // we return utf-8 by default natively
        } // if we're offset or cropping in nay way, clone the range and return that buffer's toString()


        return this._tiBuffer.clone(this.byteOffset, this.length).toString();
      }

      if (encoding === 'base64') {
        var blob; // if this is the original underlying buffer just return it's toString() value

        if (this.byteOffset === 0 && this.length === this._tiBuffer.length) {
          blob = Ti.Utils.base64encode(this._tiBuffer.toBlob());
        } else {
          // if we're offset or cropping in any way, clone the range and return that buffer's toString()
          blob = Ti.Utils.base64encode(this._tiBuffer.clone(this.byteOffset, this.length).toBlob());
        }

        return blob.toString();
      }

      if (encoding === 'hex') {
        var hexStr = '';

        for (var i = 0; i < length; i++) {
          // each one is a "byte"
          var hex = (getAdjustedIndex(this, i) & 0xff).toString(16);
          hex = hex.length === 1 ? '0' + hex : hex;
          hexStr += hex;
        }

        return hexStr;
      }

      if (encoding === 'latin1' || encoding === 'binary') {
        var latin1String = '';

        for (var _i = 0; _i < length; _i++) {
          // each one is a "byte"
          latin1String += String.fromCharCode(getAdjustedIndex(this, _i));
        }

        return latin1String;
      }

      if (encoding === 'ascii') {
        var ascii = '';

        for (var _i2 = 0; _i2 < length; _i2++) {
          // we store bytes (8-bit), but ascii is 7-bit. Node "masks" the last bit off, so let's do the same
          ascii += String.fromCharCode(getAdjustedIndex(this, _i2) & 0x7F);
        }

        return ascii;
      } // UCS2/UTF16


      return bufferToUTF16String(this._tiBuffer, this.byteOffset, this.length);
    }
    /**
       * Creates and returns an iterator for buf values (bytes)
       * @returns {Iterator}
       */ },

  {
    key: "values",
    value: function values() {
      var buffer = this;
      var nextIndex = 0;
      var end = this.length;
      var myIterator = {
        next: function next() {
          if (nextIndex < end) {
            var result = {
              value: getAdjustedIndex(buffer, nextIndex),
              done: false };

            nextIndex++;
            return result;
          }

          return {
            value: undefined,
            done: true };

        },
        [Symbol.iterator]: function () {
          return this;
        } };

      return myIterator;
    }
    /**
       * Called when buffer is used in a for..of loop. Delegates to #values()
       * @returns {Iterator}
       */ },

  {
    key: Symbol.iterator,
    value: function value() {
      return this.values();
    }
    /**
       * Writes string to buf at offset according to the character encoding in encoding.
       * The length parameter is the number of bytes to write. If buf did not contain enough space to
       * fit the entire string, only part of string will be written. However, partially encoded
       * characters will not be written.
       * @param {string} string String to write to `buf`.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write string
       * @param {integer} [length=buf.length - offset] Number of bytes to write
       * @param {string} [encoding='utf8'] The character encoding of string
       * @returns {integer}
       */ },

  {
    key: "write",
    value: function write(string, offset, length, encoding) {
      if (typeof offset === 'string') {
        encoding = offset;
        offset = 0;
        length = this.length;
      } else if (typeof length === 'string') {
        encoding = length;
        length = this.length - offset;
      } else {
        // we cap `length` at the length of our buffer
        var remaining = this.length - offset;

        if (length > remaining) {
          length = remaining;
        }
      }

      encoding = encoding || 'utf8'; // so we need to convert `remaining` bytes of our string into a byte array/buffer

      var src = Buffer.from(string, encoding); // FIXME: Can we let it know to only convert `remaining` bytes?
      // then stick that into our buffer starting at `offset`!

      return copyBuffer(src._tiBuffer, this._tiBuffer, offset, length);
    } },
  {
    key: "writeDoubleBE",
    value: function writeDoubleBE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 8);
      doubleArray[0] = value;
      setAdjustedIndex(this, offset++, uint8DoubleArray[7]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[6]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[5]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[4]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[3]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[2]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[1]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[0]);
      return offset; // at this point, we should have already added 8 to offset
    } },
  {
    key: "writeDoubleLE",
    value: function writeDoubleLE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 8);
      doubleArray[0] = value;
      setAdjustedIndex(this, offset++, uint8DoubleArray[0]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[1]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[2]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[3]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[4]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[5]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[6]);
      setAdjustedIndex(this, offset++, uint8DoubleArray[7]);
      return offset; // at this point, we should have already added 8 to offset
    } },
  {
    key: "writeFloatBE",
    value: function writeFloatBE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      floatArray[0] = value;
      setAdjustedIndex(this, offset++, uint8FloatArray[3]);
      setAdjustedIndex(this, offset++, uint8FloatArray[2]);
      setAdjustedIndex(this, offset++, uint8FloatArray[1]);
      setAdjustedIndex(this, offset++, uint8FloatArray[0]);
      return offset; // at this point, we should have already added 4 to offset
    } },
  {
    key: "writeFloatLE",
    value: function writeFloatLE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      floatArray[0] = value;
      setAdjustedIndex(this, offset++, uint8FloatArray[0]);
      setAdjustedIndex(this, offset++, uint8FloatArray[1]);
      setAdjustedIndex(this, offset++, uint8FloatArray[2]);
      setAdjustedIndex(this, offset++, uint8FloatArray[3]);
      return offset; // at this point, we should have already added 4 to offset
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 1.
       * @returns {integer}
       */ },

  {
    key: "writeInt8",
    value: function writeInt8(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 1);
      checkValue(value, -128, 127);

      if (value >= 0) {
        // just write it normally
        setAdjustedIndex(this, offset, value);
      } else {
        // convert from signed to 2's complement bits
        setAdjustedIndex(this, offset, 0xFF + value + 1); // max value, plus the negative number, add one
      }

      return offset + 1;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "writeInt16BE",
    value: function writeInt16BE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 2);
      checkValue(value, -32768, 32767);
      setAdjustedIndex(this, offset, value >>> 8); // just shift over a byte

      setAdjustedIndex(this, offset + 1, value & 0xFF); // mask to first byte

      return offset + 2;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "writeInt16LE",
    value: function writeInt16LE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 2);
      checkValue(value, -32768, 32767);
      setAdjustedIndex(this, offset, value & 0xFF);
      setAdjustedIndex(this, offset + 1, value >>> 8);
      return offset + 2;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "writeInt32BE",
    value: function writeInt32BE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      checkValue(value, -2147483648, 2147483647);
      setAdjustedIndex(this, offset, value >>> 24);
      setAdjustedIndex(this, offset + 1, value >>> 16);
      setAdjustedIndex(this, offset + 2, value >>> 8);
      setAdjustedIndex(this, offset + 3, value & 0xFF);
      return offset + 4;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "writeInt32LE",
    value: function writeInt32LE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      checkValue(value, -2147483648, 2147483647);
      setAdjustedIndex(this, offset, value & 0xFF);
      setAdjustedIndex(this, offset + 1, value >>> 8);
      setAdjustedIndex(this, offset + 2, value >>> 16);
      setAdjustedIndex(this, offset + 3, value >>> 24);
      return offset + 4;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "writeIntBE",
    value: function writeIntBE(value, offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      var minMaxBase = Math.pow(2, 8 * byteLength - 1);
      checkValue(value, -minMaxBase, minMaxBase - 1);

      if (value < 0) {
        value = minMaxBase * 2 + value;
      }

      var multiplier = 1;

      for (var i = byteLength - 1; i >= 0; i--) {
        var byteValue = value / multiplier & 0xFF;
        setAdjustedIndex(this, offset + i, byteValue);
        multiplier *= 0x100;
      }

      return offset + byteLength;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "writeIntLE",
    value: function writeIntLE(value, offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      var minMaxBase = Math.pow(2, 8 * byteLength - 1);
      checkValue(value, -minMaxBase, minMaxBase - 1);

      if (value < 0) {
        value = minMaxBase * 2 + value;
      }

      var multiplier = 1;

      for (var i = 0; i < byteLength; i++) {
        var byteValue = value / multiplier & 0xFF;
        setAdjustedIndex(this, offset + i, byteValue);
        multiplier *= 0X100;
      }

      return offset + byteLength;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 1.
       * @returns {integer}
       */ },

  {
    key: "writeUInt8",
    value: function writeUInt8(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 1);
      checkValue(value, 0, 255);
      setAdjustedIndex(this, offset, value);
      return offset + 1;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "writeUInt16BE",
    value: function writeUInt16BE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 2);
      checkValue(value, 0, 65535);
      setAdjustedIndex(this, offset, value >>> 8);
      setAdjustedIndex(this, offset + 1, value & 0xff);
      return offset + 2;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 2.
       * @returns {integer}
       */ },

  {
    key: "writeUInt16LE",
    value: function writeUInt16LE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 2);
      checkValue(value, 0, 65535);
      setAdjustedIndex(this, offset, value & 0xff);
      setAdjustedIndex(this, offset + 1, value >>> 8);
      return offset + 2;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "writeUInt32BE",
    value: function writeUInt32BE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      checkValue(value, 0, 4294967295);
      setAdjustedIndex(this, offset, value >>> 24);
      setAdjustedIndex(this, offset + 1, value >>> 16);
      setAdjustedIndex(this, offset + 2, value >>> 8);
      setAdjustedIndex(this, offset + 3, value & 0xff);
      return offset + 4;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} [offset=0] Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - 4.
       * @returns {integer}
       */ },

  {
    key: "writeUInt32LE",
    value: function writeUInt32LE(value) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      checkOffset(this, offset, 4);
      checkValue(value, 0, 4294967295);
      setAdjustedIndex(this, offset, value & 0xff);
      setAdjustedIndex(this, offset + 1, value >>> 8);
      setAdjustedIndex(this, offset + 2, value >>> 16);
      setAdjustedIndex(this, offset + 3, value >>> 24);
      return offset + 4;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "writeUIntBE",
    value: function writeUIntBE(value, offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      checkValue(value, 0, Math.pow(2, 8 * byteLength) - 1);
      var multiplier = 1;

      for (var i = byteLength - 1; i >= 0; i--) {
        var byteValue = value / multiplier & 0xFF;
        setAdjustedIndex(this, offset + i, byteValue);
        multiplier *= 0X100;
      }

      return offset + byteLength;
    }
    /**
       * @param {integer} value Number to be written to buf.
       * @param {integer} offset Number of bytes to skip before starting to write. Must satisfy 0 <= offset <= buf.length - byteLength.
       * @param {integer} byteLength Number of bytes to write. Must satisfy 0 < byteLength <= 6.
       * @returns {integer}
       */ },

  {
    key: "writeUIntLE",
    value: function writeUIntLE(value, offset, byteLength) {
      if (byteLength <= 0 || byteLength > 6) {
        throw new RangeError('Index out of range');
      }

      checkOffset(this, offset, byteLength);
      checkValue(value, 0, Math.pow(2, 8 * byteLength) - 1);
      var multiplier = 1;

      for (var i = 0; i < byteLength; i++) {
        var byteValue = value / multiplier & 0xFF;
        setAdjustedIndex(this, offset + i, byteValue);
        multiplier *= 0X100;
      }

      return offset + byteLength;
    } // TODO: Implement remaining instance methods:
    // buf.lastIndexOf(value[, byteOffset][, encoding])
    // buf.readBigInt64BE([offset])
    // buf.readBigInt64LE([offset])
    // buf.readBigUInt64BE([offset])
    // buf.readBigUInt64LE([offset])
    // buf.writeBigInt64BE(value[, offset])
    // buf.writeBigInt64LE(value[, offset])
    // buf.writeBigUInt64BE(value[, offset])
    // buf.writeBigUInt64LE(value[, offset])
  }],
  [{
    key: "allocUnsafe",
    value: function allocUnsafe(length) {
      return newBuffer(Ti.createBuffer({
        length }));

    } },
  {
    key: "allocUnsafeSlow",
    value: function allocUnsafeSlow(length) {
      return Buffer.allocUnsafe(length);
    } },
  {
    key: "alloc",
    value: function alloc(length) {
      var fill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'utf8';
      var buf = Buffer.allocUnsafe(length);
      buf.fill(fill, encoding);
      return buf;
    }
    /**
       * @param {string|Buffer|TypedArray|DataView|ArrayBuffer|SharedArrayBuffer} string original string
       * @param {string} [encoding='utf8'] encoding whose byte length we need to grab
       * @returns {integer}
       */ },

  {
    key: "byteLength",
    value: function byteLength(string) {
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';

      if (typeof string !== 'string') {
        if (Buffer.isBuffer(string)) {
          return string.length; // return Buffer's length
        }

        return string.byteLength; // TypedArray, ArrayBuffer, SharedArrayBuffer, DataView
      }

      var length = string.length;

      switch (encoding.toLowerCase()) {
        case 'utf8':
        case 'utf-8':
          return utf8ByteLength(string);

        case 'latin1':
        case 'binary':
        case 'ascii':
          return length;

        case 'ucs-2':
        case 'ucs2':
        case 'utf16le':
        case 'utf16-le':
          return 2 * length;

        case 'hex':
          return length / 2;

        case 'base64':
          // Subtract up to two padding chars from end of string!
          if (length > 1 && string.charAt(length - 1) === '=') {
            length--;
          }

          if (length > 1 && string.charAt(length - 1) === '=') {
            length--;
          }

          return Math.floor(length * 3 / 4);
        // drop fractional value
      }

      return utf8ByteLength(string);
    } },
  {
    key: "compare",
    value: function compare(buf1, buf2) {
      if (!Buffer.isBuffer(buf1)) {
        throw new TypeError("The \"buf1\" argument must be one of type Buffer or Uint8Array. Received type ".concat(typeof buf1));
      } // TODO: Wrap UInt8Array args in buffers?


      return buf1.compare(buf2);
    }
    /**
       * @param {Buffer[]|UInt8Array[]} list list of Buffers to concatenate
       * @param {integer} [totalLength] Total length of the Buffer instances in list when concatenated.
       * @returns {Buffer}
       */ },

  {
    key: "concat",
    value: function concat(list, totalLength) {
      if (!Array.isArray(list)) {
        throw new TypeError('list argument must be an Array');
      }

      if (list.length === 0) {
        return Buffer.alloc(0); // one empty Buffer!
      } // allocate one Buffer of `totalLength`? Cap at totalLength?


      if (totalLength === undefined) {
        totalLength = 0; // generate the total length from each buffer's length?

        for (var i = 0; i < list.length; i++) {
          totalLength += list[i].length;
        }
      }

      var result = Buffer.allocUnsafe(totalLength);
      var position = 0;

      for (var _i3 = 0; _i3 < list.length; _i3++) {
        var buf = list[_i3];
        buf.copy(result, position);
        position += buf.length;

        if (position >= totalLength) {
          break;
        }
      }

      return result;
    }
    /**
       * @param {integer[]|Buffer|string} value value we're wrapping
       * @param {string} [encoding='utf8'] The encoding of string.
       * @returns {Buffer}
       */ },

  {
    key: "from",
    value: function from(value) {
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf8';
      var valueType = typeof value;

      if (valueType === 'string') {
        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: ".concat(encoding));
        }

        encoding = encoding.toLowerCase();

        if (encoding === 'base64') {
          var blob = Ti.Utils.base64decode(value);
          var blobStream = Ti.Stream.createStream({
            source: blob,
            mode: Ti.Stream.MODE_READ });

          var buffer = Ti.Stream.readAll(blobStream);
          blobStream.close();
          return newBuffer(buffer);
        }

        if (encoding === 'hex') {
          return Buffer.from(stringToHexBytes(value));
        }

        return newBuffer(Ti.createBuffer({
          value: value,
          type: getTiCodecCharset(encoding) }));

      } else if (valueType === 'object') {
        if (Buffer.isBuffer(value)) {
          var length = value.length;

          var _buffer = Buffer.allocUnsafe(length);

          if (length === 0) {
            return _buffer;
          }

          value.copy(_buffer, 0, 0, length);
          return _buffer;
        }

        if (Array.isArray(value) || value instanceof Uint8Array) {
          var _length = value.length;

          if (_length === 0) {
            return Buffer.allocUnsafe(0);
          }

          var tiBuffer = Ti.createBuffer({
            length: _length });


          for (var i = 0; i < _length; i++) {
            tiBuffer[i] = value[i] & 0xFF; // mask to one byte
          }

          return newBuffer(tiBuffer);
        }

        if (value.apiName && value.apiName === 'Ti.Buffer') {
          return newBuffer(value);
        }
      }

      throw new TypeError('The \'value\' argument must be one of type: \'string\', \'Array\', \'Buffer\', \'Ti.Buffer\'');
    }
    /**
       * @param {string} encoding possible encoding name
       * @returns {boolean}
       */ },

  {
    key: "isEncoding",
    value: function isEncoding(encoding) {
      if (typeof encoding !== 'string') {
        return false;
      }

      return VALID_ENCODINGS.includes(encoding.toLowerCase());
    }
    /**
       * @param {*} obj possible Buffer instance
       * @returns {boolean}
       */ },

  {
    key: "isBuffer",
    value: function isBuffer(obj) {
      return obj !== null && obj !== undefined && obj._isBuffer === true;
    } }]);


  return Buffer;
}();

Buffer.poolSize = 8192;
var BufferModule = {
  Buffer,
  // TODO: Implement transcode()!
  transcode: function transcode(_source, _fromEncoding, _toEncoding) {},
  INSPECT_MAX_BYTES: 50,
  kMaxLength: 2147483647,
  kStringMaxLength: 1073741799,
  constants: {
    MAX_LENGTH: 2147483647,
    MAX_STRING_LENGTH: 1073741799 } };


/**
                                        * Searches a Buffer for the index of a single byte.
                                        * @param {Buffer} buffer buffer to search
                                        * @param {integer} singleByte byte we're looking for
                                        * @param {integer} offset start offset we search at
                                        * @returns {integer}
                                        */

function _indexOf(buffer, singleByte, offset) {
  var length = buffer.length;

  for (var i = offset; i < length; i++) {
    if (getAdjustedIndex(buffer, i) === singleByte) {
      return i;
    }
  }

  return -1;
}
/**
   * This function explicitly avoids bitwise operations because JS assumes 32-bit sequences for those.
   * It's possible we may be able to use them when byteLength < 4 if that's faster.
   *
   * @param {integer} unsignedValue value before converting back to signed
   * @param {integer} byteLength number of bytes
   * @returns {integer} the signed value that is represented by the unsigned value's bytes
   */


function unsignedToSigned(unsignedValue, byteLength) {
  var bitLength = byteLength * 8;
  var maxPositiveValue = Math.pow(2, bitLength - 1);

  if (unsignedValue < maxPositiveValue) {
    return unsignedValue;
  }

  var maxUnsignedValue = Math.pow(2, bitLength);
  unsignedValue -= maxUnsignedValue;
  return unsignedValue;
}
/**
   * @param {Ti.Buffer} src source Buffer we're copying from
   * @param {Ti.Buffer} dest destination Buffer we're copying into
   * @param {integer} offset start offset we're copying to in destination
   * @param {integer} length number of bytes to copy
   * @returns {integer} actual number of bytes copied
   */


function copyBuffer(src, dest, offset, length) {
  var srcLength = src.length;
  var destLength = dest.length;
  var i = 0;

  for (; i < length; i++) {
    var destIndex = i + offset; // are we trying to write past end of destination? Or read past end of source? Stop!

    if (destIndex >= destLength || i >= srcLength) {
      break;
    }

    dest[destIndex] = src[i];
  }

  return i;
}
/**
   * @param {string} string utf-8 string
   * @returns {integer}
   */


function utf8ByteLength(string) {
  // Just convert to a Ti.Buffer and let it tell us the length
  var buf = Ti.createBuffer({
    value: string,
    type: Ti.Codec.CHARSET_UTF8 });

  var length = buf.length;
  buf.release(); // release the buffer since we just needed the length

  return length;
}
/**
   * @param {string} encoding desired encoding name
   * @returns {integer} Ti.Codec constant that maps to the encoding
   */


function getTiCodecCharset(encoding) {
  return TI_CODEC_MAP.get(encoding);
}

function bufferToUTF16String(tiBuffer, start, length) {
  var out = '';
  var i = start;

  while (i < length) {
    // utf-16/ucs-2 is 2-bytes per character
    var byte1 = tiBuffer[i++];
    var byte2 = tiBuffer[i++];
    var code_unit = (byte2 << 8) + byte1; // we mash together the two bytes

    out += String.fromCodePoint(code_unit);
  }

  return out;
}
/**
   * loop over input, every 2 characters, parse as an int
   * basically each two characters are a "byte" or an 8-bit uint
   * we append them all together to form a single buffer holding all the values
   * @param {string} value string we're encoding in hex
   * @returns {integer[]} array of encoded bytes
   */


function stringToHexBytes(value) {
  var length = value.length / 2;
  var byteArray = [];

  for (var i = 0; i < length; i++) {
    var numericValue = parseInt(value.substr(i * 2, 2), 16);

    if (!Number.isNaN(numericValue)) {
      // drop bad hex characters
      byteArray.push(numericValue);
    }
  }

  return byteArray;
} // Use a Proxy to hack array style index accessors


var arrayIndexHandler = {
  get(target, propKey, receiver) {
    if (typeof propKey === 'string') {
      var num = Number(propKey);

      if (Number.isSafeInteger(num)) {
        return getAdjustedIndex(target, num);
      }
    }

    return Reflect.get(target, propKey, receiver);
  },

  set(target, propKey, value, receiver) {
    if (typeof propKey === 'string') {
      var num = Number(propKey);

      if (Number.isSafeInteger(num)) {
        return setAdjustedIndex(target, num, value);
      }
    }

    return Reflect.set(target, propKey, value, receiver);
  },

  has(target, key) {
    if (typeof key === 'string') {
      var num = Number(key);

      if (Number.isSafeInteger(num)) {
        // ensure it's a positive "safe" integer within the range of the buffer
        return num >= 0 && num < target._tiBuffer.length;
      }
    }

    return key in target;
  } };



function getAdjustedIndex(buf, index) {
  if (index < 0 || index >= buf._tiBuffer.length) {
    return undefined;
  }

  return buf._tiBuffer[index + buf.byteOffset];
}

function setAdjustedIndex(buf, index, value) {
  if (index >= 0 || index < buf._tiBuffer.length) {
    buf._tiBuffer[index + buf.byteOffset] = value;
  }

  return value;
}
/**
   * Wraps creation of a Buffer instance inside a Proxy so we can handle array index access
   * @param  {...any} args argunents ot Buffer constructor
   * @returns {Buffer} wrapped inside a Proxy
   */


function newBuffer() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new Proxy(_construct(Buffer, args), arrayIndexHandler); // eslint-disable-line security/detect-new-buffer
}
/**
   * Throws a RangeError if offset is out of bounds
   * @param {Buffer} buffer buffer we're operating on
   * @param {integer} offset user supplied offset
   * @param {integer} byteLength number of bytes needed in range
   * @throws {RangeError}
   */


function checkOffset(buffer, offset, byteLength) {
  var endOffset = buffer.length - byteLength;

  if (offset < 0 || offset > endOffset) {
    throw new RangeError("The value of \"offset\" is out of range. It must be >= 0 and <= ".concat(endOffset, ". Received ").concat(offset));
  }
}
/**
   * @param {integer} value user-supplied value
   * @param {integer} min minimum valid value
   * @param {integer} max maximum valid value
   * @throws {RangeError}
   */


function checkValue(value, min, max) {
  if (value < min || value > max) {
    throw new RangeError("The value of \"value\" is out of range. It must be >= ".concat(min, " and <= ").concat(max, ". Received ").concat(value));
  }
}

var bufferWarningAlreadyEmitted = false;
var nodeModulesCheckCounter = 0;
var bufferWarning = 'Buffer() is deprecated due to security and usability ' + 'issues. Please use the Buffer.alloc(), ' + 'Buffer.allocUnsafe(), or Buffer.from() methods instead.';

function showFlaggedDeprecation() {
  if (bufferWarningAlreadyEmitted || ++nodeModulesCheckCounter > 10000 || isInsideNodeModules()) {
    // We don't emit a warning, because we either:
    // - Already did so, or
    // - Already checked too many times whether a call is coming
    //   from node_modules and want to stop slowing down things, or
    // - The code is inside `node_modules`.
    return;
  }

  process.emitWarning(bufferWarning, 'DeprecationWarning', 'DEP0005');
  bufferWarningAlreadyEmitted = true;
}

/**
   * This file is used to hijack the standard require to allow for JS
   * implementations of "core" modules.
   *
   * You add a binding from the "core" module id to the under the hood JS
   * implementation. We then intercept require calls to handle requests for these modules
   * and lazily load the file.
   */

/**
       * Used by @function bindObjectToCoreModuleId
       * @type {map<string, object>}
       */
var bindings = new Map();
/**
                           * Used by @function redirectCoreModuleIdToPath
                           * @type {map<string, string>}
                           */

var redirects = new Map();
/**
                            * Does the request look like a typical core module? (no '.' or '/' characters)
                            * @param {string} path original require path/id
                            * @returns {boolean}
                            */

function isHijackableModuleId(path) {
  if (!path || path.length < 1) {
    return false;
  }

  var firstChar = path.charAt(0);
  return firstChar !== '.' && firstChar !== '/';
} // Hack require to point to this as a core module "binding"


var originalRequire = global.require; // This works for iOS as-is, and also intercepts the call on Android for ti.main.js (the first file executed)

global.require = function (moduleId) {
  if (bindings.has(moduleId)) {
    return bindings.get(moduleId);
  }

  if (redirects.has(moduleId)) {
    moduleId = redirects.get(moduleId);
  }

  return originalRequire(moduleId);
};

if (Ti.Platform.name === 'android') {
  // ... but we still need to hack it when requiring from other files for Android
  var originalModuleRequire = global.Module.prototype.require;

  global.Module.prototype.require = function (path, context) {
    if (bindings.has(path)) {
      return bindings.get(path);
    }

    if (redirects.has(path)) {
      path = redirects.get(path);
    }

    return originalModuleRequire.call(this, path, context);
  };
}
/**
   * Registers a binding from a short module id to an already loaded/constructed object/value to export for that core module id
   *
   * @param {string} moduleId the module id to "hijack"
   * @param {*} binding an already constructured value/object to return
   */


function register(moduleId, binding) {
  if (!isHijackableModuleId(moduleId)) {
    throw new Error("Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ".concat(moduleId, ")"));
  }

  if (redirects.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
    redirects.delete(moduleId);
  } else if (bindings.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
  }

  bindings.set(moduleId, binding);
}
/**
   * Registers a binding from a short module id to the full under the hood filepath if given a string.
   * This allows for lazy instantiation of the module on-demand
   *
   * @param {string} moduleId the module id to "hijack"
   * @param {string} filepath the full filepath to require under the hood.
   *                              This should be an already resolved absolute path,
   *                              as otherwise the context of the call could change what gets loaded!
   */

function redirect(moduleId, filepath) {
  if (!isHijackableModuleId(moduleId)) {
    throw new Error("Cannot register for relative/absolute file paths; no leading '.' or '/' allowed (was given ".concat(moduleId, ")"));
  }

  if (bindings.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
    bindings.delete(moduleId);
  } else if (redirects.has(moduleId)) {
    Ti.API.warn("Another binding has already registered for module id: '".concat(moduleId, "', it will be overwritten..."));
  }

  redirects.set(moduleId, filepath);
}
var binding = {
  register,
  redirect };

global.binding = binding;

// Load all the node compatible core modules
register('path', path);
register('os', OS);
register('tty', tty);
register('util', util);
register('assert', assert);
register('events', EventEmitter);
register('buffer', BufferModule); // Register require('buffer').Buffer as global

global.Buffer = BufferModule.Buffer;

/**
                                      * Appcelerator Titanium Mobile
                                      * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
                                      * Licensed under the terms of the Apache Public License
                                      * Please see the LICENSE included with this distribution for details.
                                      *
                                      * Description:
                                      * This script loads all JavaScript files ending with the name "*.bootstrap.js" and then executes them.
                                      * The main intention of this feature is to allow JavaScript files to kick-off functionality or
                                      * display UI to the end-user before the "app.js" gets loaded. This feature is the CommonJS
                                      * equivalent to Titanium's Android module onAppCreate() or iOS module load() features.
                                      *
                                      * Use-Cases:
                                      * - Automatically kick-off analytics functionality on app startup.
                                      * - Ensure "Google Play Services" is installed/updated on app startup on Android.
                                      */

/**
                                          * Attempts to load all bootstraps from a "bootstrap.json" file created by the app build system.
                                          * This is an optional feature and is the fastest method of acquiring boostraps configured for the app.
                                          * This JSON file, if provided, must be in the same directory as this script.
                                          * @returns {string[]}
                                          * Returns an array of require() compatible strings if bootstraps were successfully loaded from JSON.
                                          * Returns an empty array if JSON file was found, but no bootstraps were configured for the app.
                                          * Returns null if JSON file was not found.
                                          */
function fetchScriptsFromJson() {
  var JSON_FILE_NAME = 'bootstrap.json';

  try {
    var jsonFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "ti.internal/".concat(JSON_FILE_NAME));

    if (jsonFile.exists()) {
      var settings = JSON.parse(jsonFile.read().text);

      if (Array.isArray(settings.scripts)) {
        return settings.scripts;
      }

      return [];
    }
  } catch (error) {
    Ti.API.error("Failed to read \"".concat(JSON_FILE_NAME, "\". Reason: ").concat(error.message));
  }

  return null;
}
/**
   * Recursively searches the "Resources" directory for all "*.bootstrap.js" files.
   * @returns {Array.<string>}
   * Returns an array of require() compatible strings for each bootstrap found in the search.
   * Returns an empty array if no bootstrap files were found.
   */


function fetchScriptsFromResourcesDirectory() {
  var resourceDirectory = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory);
  var resourceDirectoryPathLength = resourceDirectory.nativePath.length;
  var bootstrapScripts = [];

  function loadFrom(file) {
    if (file) {
      if (file.isDirectory()) {
        // This is a directory. Recursively look for bootstrap files under it.
        var fileNameArray = file.getDirectoryListing();

        if (fileNameArray) {
          for (var index = 0; index < fileNameArray.length; index++) {
            loadFrom(Ti.Filesystem.getFile(file.nativePath, fileNameArray[index]));
          }
        }
      } else if (file.name.search(/.bootstrap.js$/) >= 0) {
        // This is a bootstrap file.
        // Convert its path to something loadable via require() and add it to the array.
        var bootstrapPath = file.nativePath;
        bootstrapPath = bootstrapPath.substr(resourceDirectoryPathLength, bootstrapPath.length - resourceDirectoryPathLength - '.js'.length);
        bootstrapScripts.push(bootstrapPath);
      }
    }
  }

  loadFrom(resourceDirectory);
  return bootstrapScripts;
}
/**
   * Non-blocking function which loads and executes all bootstrap scripts configured for the app.
   * @param {function} finished Callback to be invoked once all bootstraps have finished executing. Cannot be null.
   */


function loadAsync(finished) {
  // Acquire an array of all bootstrap scripts included with the app.
  // - For best performance, attempt to fetch scripts via an optional JSON file created by the build system.
  // - If JSON file not found (will return null), then search "Resources" directory for bootstrap files.
  var bootstrapScripts = fetchScriptsFromJson();

  if (!bootstrapScripts) {
    bootstrapScripts = fetchScriptsFromResourcesDirectory();
  } // Do not continue if no bootstraps were found.


  if (!bootstrapScripts || bootstrapScripts.length <= 0) {
    finished();
    return;
  } // Sort the bootstraps so that they'll be loaded in a consistent order between platforms.


  bootstrapScripts.sort(); // Loads all bootstrap scripts found.

  function loadBootstrapScripts(finished) {
    var bootstrapIndex = 0;

    function doLoad() {
      // Attempt to load all bootstrap scripts.
      while (bootstrapIndex < bootstrapScripts.length) {
        // Load the next bootstrap.
        var fileName = bootstrapScripts[bootstrapIndex];

        var bootstrap = require(fileName); // eslint-disable-line security/detect-non-literal-require
        // Invoke the bootstrap's execute() method if it has one. (This is optional.)
        // We must wait for the given callback to be invoked before loading the next script.
        // Note: This is expected to be used to display UI to the end-user.


        if (bootstrap.execute) {
          bootstrap.execute(onBootstrapExecutionFinished);
          return;
        } // We're done with the current bootstrap. Time to load the next one.


        bootstrapIndex++;
      } // Invoke given callback to inform caller that all loading is done.


      finished();
    }

    function onBootstrapExecutionFinished() {
      // Last bootstrap has finished execution. Time to load the next one.
      // Note: Add a tiny delay so whatever UI the last bootstrap loaded has time to close.
      bootstrapIndex++;
      setTimeout(function () {
        return doLoad();
      }, 1);
    }

    doLoad();
  } // We've finished loading/executing all bootstrap scripts.
  // Inform caller by invoking the callback given to loadAsync().


  loadBootstrapScripts(finished);
}

/**
   * Appcelerator Titanium Mobile
   * Copyright (c) 2018 by Axway, Inc. All Rights Reserved.
   * Licensed under the terms of the Apache Public License
   * Please see the LICENSE included with this distribution for details.
   *
   * This script is loaded on app startup on all platforms. It is used to do the following:
   * - Provide consistent startup behavior between platforms, such as logging Titanium version.
   * - Load Titanium's core JavaScript extensions shared by all platforms.
   * - Provide "*.bootstrap.js" script support. (Similar to native module onAppCreate()/load() support.)
   * - Load the app developer's main "app.js" script after doing all of the above.
   */
// Log the app name, app version, and Titanium version on startup.
Ti.API.info("".concat(Ti.App.name, " ").concat(Ti.App.version, " (Powered by Titanium ").concat(Ti.version, ".").concat(Ti.buildHash, ")")); // Attempt to load crash analytics module.
// NOTE: This should be the first module that loads on startup.

try {
  require('com.appcelerator.aca');
} catch (e) {} // Could not load module, silently ignore exception.
loadAsync(function () {
  // We've finished loading/executing all bootstrap scripts.
  // We can now proceed to run the main "app.js" script.
  require('./app'); // This event is to be fired after "app.js" execution. Reasons:
  // - Allow system to queue startup related events until "app.js" has had a chance to add listeners.
  // - For Alloy apps, we now know that Alloy has been initialized and its globals were added.


  Ti.App.fireEvent('started');
});