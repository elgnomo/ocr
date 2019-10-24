//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function () {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
  typeof global == 'object' && global.global === global && global ||
  this ||
  {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
  slice = ArrayProto.slice,
  toString = ObjProto.toString,
  hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
  nativeKeys = Object.keys,
  nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function () {};

  // Create a safe reference to the Underscore object for use below.
  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function (func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1:return function (value) {
          return func.call(context, value);
        };
      // The 2-argument case is omitted because we’re not using it.
      case 3:return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };}

    return function () {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function (value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function (value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function (func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function () {
      var length = Math.max(arguments.length - startIndex, 0),
      rest = Array(length),
      index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0:return func.call(this, rest);
        case 1:return func.call(this, arguments[0], rest);
        case 2:return func.call(this, arguments[0], arguments[1], rest);}

      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function (prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function (key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function (obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  };

  var deepGet = function (obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function (collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function (obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
    length = (keys || obj).length,
    results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function (dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function (obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
      length = (keys || obj).length,
      index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function (obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function (obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function (value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function (obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
    length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
    length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function (obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function (context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function (obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function (obj, iteratee, context) {
    var result = -Infinity,lastComputed = -Infinity,
    value,computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function (obj, iteratee, context) {
    var result = Infinity,lastComputed = Infinity,
    value,computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function (v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function (obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function (obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function (value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list) };

    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function (behavior, partition) {
    return function (obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function (value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function (result, value, key) {
    if (has(result, key)) result[key].push(value);else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function (result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function (result, value, key) {
    if (has(result, key)) result[key]++;else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function (obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function (result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function (array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function (array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function (input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0,len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function (array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
      computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function (arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function (array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function (array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function (array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function (list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function (dir) {
    return function (array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function (array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0,high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function (dir, predicateFind, sortedIndex) {
    return function (array, item, idx) {
      var i = 0,length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function (array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0,length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function (func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function (callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function (func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function () {
      var position = 0,length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function (obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function (func, hasher) {
    var memoize = function (key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function (func, wait, args) {
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function (func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function () {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function () {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function (context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function (args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function (predicate) {
    return function () {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function () {
    var args = arguments;
    var start = args.length - 1;
    return function () {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function (times, func) {
    var memo;
    return function () {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function (obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function (obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function (obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
    length = keys.length,
    results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function (obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function (keysFunc, defaults) {
    return function (obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
        keys = keysFunc(source),
        l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function (obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj),key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function (value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function (obj, keys) {
    var result = {},iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function (obj, keys) {
    var iteratee = keys[0],context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function (value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function (prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function (object, attrs) {
    var keys = _.keys(attrs),length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function (a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function (a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);}


    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor,bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
      _.isFunction(bCtor) && bCtor instanceof bCtor) &&
      'constructor' in a && 'constructor' in b) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function (a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function (obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function (obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function (obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function (obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function (obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function (obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function (value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function (value) {
    return function () {
      return value;
    };
  };

  _.noop = function () {};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function (path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function (obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function (obj) {
    if (obj == null) {
      return function () {};
    }
    return function (path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function (attrs) {
    attrs = _.extendOwn({}, attrs);
    return function (obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function (n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function () {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;' };

  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function (map) {
    var escaper = function (match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function (obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g };


  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029' };


  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function (match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function (text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source].
    join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function (data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function (obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function (instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function () {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function () {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function () {
      return _;
    });
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVuZGVyc2NvcmUuanMiXSwibmFtZXMiOlsicm9vdCIsInNlbGYiLCJnbG9iYWwiLCJwcmV2aW91c1VuZGVyc2NvcmUiLCJfIiwiQXJyYXlQcm90byIsIkFycmF5IiwicHJvdG90eXBlIiwiT2JqUHJvdG8iLCJPYmplY3QiLCJTeW1ib2xQcm90byIsIlN5bWJvbCIsInB1c2giLCJzbGljZSIsInRvU3RyaW5nIiwiaGFzT3duUHJvcGVydHkiLCJuYXRpdmVJc0FycmF5IiwiaXNBcnJheSIsIm5hdGl2ZUtleXMiLCJrZXlzIiwibmF0aXZlQ3JlYXRlIiwiY3JlYXRlIiwiQ3RvciIsIm9iaiIsIl93cmFwcGVkIiwiZXhwb3J0cyIsIm5vZGVUeXBlIiwibW9kdWxlIiwiVkVSU0lPTiIsIm9wdGltaXplQ2IiLCJmdW5jIiwiY29udGV4dCIsImFyZ0NvdW50IiwidmFsdWUiLCJjYWxsIiwiaW5kZXgiLCJjb2xsZWN0aW9uIiwiYWNjdW11bGF0b3IiLCJhcHBseSIsImFyZ3VtZW50cyIsImJ1aWx0aW5JdGVyYXRlZSIsImNiIiwiaXRlcmF0ZWUiLCJpZGVudGl0eSIsImlzRnVuY3Rpb24iLCJpc09iamVjdCIsIm1hdGNoZXIiLCJwcm9wZXJ0eSIsIkluZmluaXR5IiwicmVzdEFyZ3VtZW50cyIsInN0YXJ0SW5kZXgiLCJsZW5ndGgiLCJNYXRoIiwibWF4IiwicmVzdCIsImFyZ3MiLCJiYXNlQ3JlYXRlIiwicmVzdWx0Iiwic2hhbGxvd1Byb3BlcnR5Iiwia2V5IiwiaGFzIiwicGF0aCIsImRlZXBHZXQiLCJpIiwiTUFYX0FSUkFZX0lOREVYIiwicG93IiwiZ2V0TGVuZ3RoIiwiaXNBcnJheUxpa2UiLCJlYWNoIiwiZm9yRWFjaCIsIm1hcCIsImNvbGxlY3QiLCJyZXN1bHRzIiwiY3VycmVudEtleSIsImNyZWF0ZVJlZHVjZSIsImRpciIsInJlZHVjZXIiLCJtZW1vIiwiaW5pdGlhbCIsInJlZHVjZSIsImZvbGRsIiwiaW5qZWN0IiwicmVkdWNlUmlnaHQiLCJmb2xkciIsImZpbmQiLCJkZXRlY3QiLCJwcmVkaWNhdGUiLCJrZXlGaW5kZXIiLCJmaW5kSW5kZXgiLCJmaW5kS2V5IiwiZmlsdGVyIiwic2VsZWN0IiwibGlzdCIsInJlamVjdCIsIm5lZ2F0ZSIsImV2ZXJ5IiwiYWxsIiwic29tZSIsImFueSIsImNvbnRhaW5zIiwiaW5jbHVkZXMiLCJpbmNsdWRlIiwiaXRlbSIsImZyb21JbmRleCIsImd1YXJkIiwidmFsdWVzIiwiaW5kZXhPZiIsImludm9rZSIsImNvbnRleHRQYXRoIiwibWV0aG9kIiwicGx1Y2siLCJ3aGVyZSIsImF0dHJzIiwiZmluZFdoZXJlIiwibGFzdENvbXB1dGVkIiwiY29tcHV0ZWQiLCJ2IiwibWluIiwic2h1ZmZsZSIsInNhbXBsZSIsIm4iLCJyYW5kb20iLCJjbG9uZSIsImxhc3QiLCJyYW5kIiwidGVtcCIsInNvcnRCeSIsImNyaXRlcmlhIiwic29ydCIsImxlZnQiLCJyaWdodCIsImEiLCJiIiwiZ3JvdXAiLCJiZWhhdmlvciIsInBhcnRpdGlvbiIsImdyb3VwQnkiLCJpbmRleEJ5IiwiY291bnRCeSIsInJlU3RyU3ltYm9sIiwidG9BcnJheSIsImlzU3RyaW5nIiwibWF0Y2giLCJzaXplIiwicGFzcyIsImZpcnN0IiwiaGVhZCIsInRha2UiLCJhcnJheSIsInRhaWwiLCJkcm9wIiwiY29tcGFjdCIsIkJvb2xlYW4iLCJmbGF0dGVuIiwiaW5wdXQiLCJzaGFsbG93Iiwic3RyaWN0Iiwib3V0cHV0IiwiaWR4IiwiaXNBcmd1bWVudHMiLCJqIiwibGVuIiwid2l0aG91dCIsIm90aGVyQXJyYXlzIiwiZGlmZmVyZW5jZSIsInVuaXEiLCJ1bmlxdWUiLCJpc1NvcnRlZCIsImlzQm9vbGVhbiIsInNlZW4iLCJ1bmlvbiIsImFycmF5cyIsImludGVyc2VjdGlvbiIsImFyZ3NMZW5ndGgiLCJ1bnppcCIsInppcCIsIm9iamVjdCIsImNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyIiwiZmluZExhc3RJbmRleCIsInNvcnRlZEluZGV4IiwibG93IiwiaGlnaCIsIm1pZCIsImZsb29yIiwiY3JlYXRlSW5kZXhGaW5kZXIiLCJwcmVkaWNhdGVGaW5kIiwiaXNOYU4iLCJsYXN0SW5kZXhPZiIsInJhbmdlIiwic3RhcnQiLCJzdG9wIiwic3RlcCIsImNlaWwiLCJjaHVuayIsImNvdW50IiwiZXhlY3V0ZUJvdW5kIiwic291cmNlRnVuYyIsImJvdW5kRnVuYyIsImNhbGxpbmdDb250ZXh0IiwiYmluZCIsIlR5cGVFcnJvciIsImJvdW5kIiwiY2FsbEFyZ3MiLCJjb25jYXQiLCJwYXJ0aWFsIiwiYm91bmRBcmdzIiwicGxhY2Vob2xkZXIiLCJwb3NpdGlvbiIsImJpbmRBbGwiLCJFcnJvciIsIm1lbW9pemUiLCJoYXNoZXIiLCJjYWNoZSIsImFkZHJlc3MiLCJkZWxheSIsIndhaXQiLCJzZXRUaW1lb3V0IiwiZGVmZXIiLCJ0aHJvdHRsZSIsIm9wdGlvbnMiLCJ0aW1lb3V0IiwicHJldmlvdXMiLCJsYXRlciIsImxlYWRpbmciLCJub3ciLCJ0aHJvdHRsZWQiLCJyZW1haW5pbmciLCJjbGVhclRpbWVvdXQiLCJ0cmFpbGluZyIsImNhbmNlbCIsImRlYm91bmNlIiwiaW1tZWRpYXRlIiwiZGVib3VuY2VkIiwiY2FsbE5vdyIsIndyYXAiLCJ3cmFwcGVyIiwiY29tcG9zZSIsImFmdGVyIiwidGltZXMiLCJiZWZvcmUiLCJvbmNlIiwiaGFzRW51bUJ1ZyIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwibm9uRW51bWVyYWJsZVByb3BzIiwiY29sbGVjdE5vbkVudW1Qcm9wcyIsIm5vbkVudW1JZHgiLCJjb25zdHJ1Y3RvciIsInByb3RvIiwicHJvcCIsImFsbEtleXMiLCJtYXBPYmplY3QiLCJwYWlycyIsImludmVydCIsImZ1bmN0aW9ucyIsIm1ldGhvZHMiLCJuYW1lcyIsImNyZWF0ZUFzc2lnbmVyIiwia2V5c0Z1bmMiLCJkZWZhdWx0cyIsInNvdXJjZSIsImwiLCJleHRlbmQiLCJleHRlbmRPd24iLCJhc3NpZ24iLCJrZXlJbk9iaiIsInBpY2siLCJvbWl0IiwiU3RyaW5nIiwicHJvcHMiLCJ0YXAiLCJpbnRlcmNlcHRvciIsImlzTWF0Y2giLCJlcSIsImRlZXBFcSIsImFTdGFjayIsImJTdGFjayIsInR5cGUiLCJjbGFzc05hbWUiLCJ2YWx1ZU9mIiwiYXJlQXJyYXlzIiwiYUN0b3IiLCJiQ3RvciIsInBvcCIsImlzRXF1YWwiLCJpc0VtcHR5IiwiaXNFbGVtZW50IiwibmFtZSIsIm5vZGVsaXN0IiwiZG9jdW1lbnQiLCJjaGlsZE5vZGVzIiwiSW50OEFycmF5IiwiaXNGaW5pdGUiLCJpc1N5bWJvbCIsInBhcnNlRmxvYXQiLCJpc051bWJlciIsImlzTnVsbCIsImlzVW5kZWZpbmVkIiwibm9Db25mbGljdCIsImNvbnN0YW50Iiwibm9vcCIsInByb3BlcnR5T2YiLCJtYXRjaGVzIiwiYWNjdW0iLCJEYXRlIiwiZ2V0VGltZSIsImVzY2FwZU1hcCIsInVuZXNjYXBlTWFwIiwiY3JlYXRlRXNjYXBlciIsImVzY2FwZXIiLCJqb2luIiwidGVzdFJlZ2V4cCIsIlJlZ0V4cCIsInJlcGxhY2VSZWdleHAiLCJzdHJpbmciLCJ0ZXN0IiwicmVwbGFjZSIsImVzY2FwZSIsInVuZXNjYXBlIiwiZmFsbGJhY2siLCJpZENvdW50ZXIiLCJ1bmlxdWVJZCIsInByZWZpeCIsImlkIiwidGVtcGxhdGVTZXR0aW5ncyIsImV2YWx1YXRlIiwiaW50ZXJwb2xhdGUiLCJub01hdGNoIiwiZXNjYXBlcyIsImVzY2FwZVJlZ0V4cCIsImVzY2FwZUNoYXIiLCJ0ZW1wbGF0ZSIsInRleHQiLCJzZXR0aW5ncyIsIm9sZFNldHRpbmdzIiwib2Zmc2V0IiwidmFyaWFibGUiLCJyZW5kZXIiLCJGdW5jdGlvbiIsImUiLCJkYXRhIiwiYXJndW1lbnQiLCJjaGFpbiIsImluc3RhbmNlIiwiX2NoYWluIiwiY2hhaW5SZXN1bHQiLCJtaXhpbiIsInRvSlNPTiIsImRlZmluZSIsImFtZCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUMsYUFBVzs7QUFFVjtBQUNBOztBQUVB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LElBQUQsQ0FBdkI7QUFDQTFSLElBQUFBLENBQUMsQ0FBQ0csU0FBRixDQUFZdVIsSUFBWixJQUFvQixZQUFXO0FBQzdCLGFBQU8wRCxXQUFXLENBQUMsSUFBRCxFQUFPM08sTUFBTSxDQUFDdkUsS0FBUCxDQUFhLEtBQUtkLFFBQWxCLEVBQTRCZSxTQUE1QixDQUFQLENBQWxCO0FBQ0QsS0FGRDtBQUdELEdBTEQ7O0FBT0E7QUFDQW5DLEVBQUFBLENBQUMsQ0FBQ0csU0FBRixDQUFZMEIsS0FBWixHQUFvQixZQUFXO0FBQzdCLFdBQU8sS0FBS1QsUUFBWjtBQUNELEdBRkQ7O0FBSUE7QUFDQTtBQUNBcEIsRUFBQUEsQ0FBQyxDQUFDRyxTQUFGLENBQVkrUSxPQUFaLEdBQXNCbFIsQ0FBQyxDQUFDRyxTQUFGLENBQVltVixNQUFaLEdBQXFCdFYsQ0FBQyxDQUFDRyxTQUFGLENBQVkwQixLQUF2RDs7QUFFQTdCLEVBQUFBLENBQUMsQ0FBQ0csU0FBRixDQUFZTyxRQUFaLEdBQXVCLFlBQVc7QUFDaEMsV0FBTzZQLE1BQU0sQ0FBQyxLQUFLblAsUUFBTixDQUFiO0FBQ0QsR0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUksT0FBT21VLE1BQVAsSUFBaUIsVUFBakIsSUFBK0JBLE1BQU0sQ0FBQ0MsR0FBMUMsRUFBK0M7QUFDN0NELElBQUFBLE1BQU0sQ0FBQyxZQUFELEVBQWUsRUFBZixFQUFtQixZQUFXO0FBQ2xDLGFBQU92VixDQUFQO0FBQ0QsS0FGSyxDQUFOO0FBR0Q7QUFDRixDQXRwREEsR0FBRCIsInNvdXJjZXNDb250ZW50IjpbIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuOS4xXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE4IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzIHx8XG4gICAgICAgICAgICB7fTtcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBTeW1ib2xQcm90byA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnID8gU3ltYm9sLnByb3RvdHlwZSA6IG51bGw7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoLFxuICAgICAgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgICAgdG9TdHJpbmcgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXksXG4gICAgICBuYXRpdmVLZXlzID0gT2JqZWN0LmtleXMsXG4gICAgICBuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4gIC8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGVpciBvbGQgbW9kdWxlIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICAvLyAoYG5vZGVUeXBlYCBpcyBjaGVja2VkIHRvIGVuc3VyZSB0aGF0IGBtb2R1bGVgXG4gIC8vIGFuZCBgZXhwb3J0c2AgYXJlIG5vdCBIVE1MIGVsZW1lbnRzLilcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmICFleHBvcnRzLm5vZGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS45LjEnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgb3B0aW1pemVDYiA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvLyBUaGUgMi1hcmd1bWVudCBjYXNlIGlzIG9taXR0ZWQgYmVjYXVzZSB3ZeKAmXJlIG5vdCB1c2luZyBpdC5cbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBidWlsdGluSXRlcmF0ZWU7XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gZWFjaFxuICAvLyBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyIGBpZGVudGl0eWAsXG4gIC8vIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoXy5pdGVyYXRlZSAhPT0gYnVpbHRpbkl0ZXJhdGVlKSByZXR1cm4gXy5pdGVyYXRlZSh2YWx1ZSwgY29udGV4dCk7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gb3B0aW1pemVDYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiAhXy5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIEV4dGVybmFsIHdyYXBwZXIgZm9yIG91ciBjYWxsYmFjayBnZW5lcmF0b3IuIFVzZXJzIG1heSBjdXN0b21pemVcbiAgLy8gYF8uaXRlcmF0ZWVgIGlmIHRoZXkgd2FudCBhZGRpdGlvbmFsIHByZWRpY2F0ZS9pdGVyYXRlZSBzaG9ydGhhbmQgc3R5bGVzLlxuICAvLyBUaGlzIGFic3RyYWN0aW9uIGhpZGVzIHRoZSBpbnRlcm5hbC1vbmx5IGFyZ0NvdW50IGFyZ3VtZW50LlxuICBfLml0ZXJhdGVlID0gYnVpbHRpbkl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY2IodmFsdWUsIGNvbnRleHQsIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBTb21lIGZ1bmN0aW9ucyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cywgb3IgYSBmZXcgZXhwZWN0ZWRcbiAgLy8gYXJndW1lbnRzIGF0IHRoZSBiZWdpbm5pbmcgYW5kIHRoZW4gYSB2YXJpYWJsZSBudW1iZXIgb2YgdmFsdWVzIHRvIG9wZXJhdGVcbiAgLy8gb24uIFRoaXMgaGVscGVyIGFjY3VtdWxhdGVzIGFsbCByZW1haW5pbmcgYXJndW1lbnRzIHBhc3QgdGhlIGZ1bmN0aW9u4oCZc1xuICAvLyBhcmd1bWVudCBsZW5ndGggKG9yIGFuIGV4cGxpY2l0IGBzdGFydEluZGV4YCksIGludG8gYW4gYXJyYXkgdGhhdCBiZWNvbWVzXG4gIC8vIHRoZSBsYXN0IGFyZ3VtZW50LiBTaW1pbGFyIHRvIEVTNuKAmXMgXCJyZXN0IHBhcmFtZXRlclwiLlxuICB2YXIgcmVzdEFyZ3VtZW50cyA9IGZ1bmN0aW9uKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKSxcbiAgICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKSxcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpcywgcmVzdCk7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sIHJlc3QpO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgIGFyZ3NbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgIH1cbiAgICAgIGFyZ3Nbc3RhcnRJbmRleF0gPSByZXN0O1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBhbm90aGVyLlxuICB2YXIgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XG4gICAgaWYgKG5hdGl2ZUNyZWF0ZSkgcmV0dXJuIG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcbiAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgc2hhbGxvd1Byb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICB2YXIgaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwYXRoKTtcbiAgfVxuXG4gIHZhciBkZWVwR2V0ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGxlbmd0aCA/IG9iaiA6IHZvaWQgMDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZm9yIGNvbGxlY3Rpb24gbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGNvbGxlY3Rpb25cbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdC5cbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBzaGFsbG93UHJvcGVydHkoJ2xlbmd0aCcpO1xuICB2YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbiAgdmFyIGNyZWF0ZVJlZHVjZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIC8vIFdyYXAgY29kZSB0aGF0IHJlYXNzaWducyBhcmd1bWVudCB2YXJpYWJsZXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvbiB0aGFuXG4gICAgLy8gdGhlIG9uZSB0aGF0IGFjY2Vzc2VzIGBhcmd1bWVudHMubGVuZ3RoYCB0byBhdm9pZCBhIHBlcmYgaGl0LiAoIzE5OTEpXG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBpbml0aWFsKSB7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xuICAgICAgICBpbmRleCArPSBkaXI7XG4gICAgICB9XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+PSAzO1xuICAgICAgcmV0dXJuIHJlZHVjZXIob2JqLCBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KSwgbWVtbywgaW5pdGlhbCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gY3JlYXRlUmVkdWNlKDEpO1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGNyZWF0ZVJlZHVjZSgtMSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGtleUZpbmRlciA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmZpbmRJbmRleCA6IF8uZmluZEtleTtcbiAgICB2YXIga2V5ID0ga2V5RmluZGVyKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBpZiAoa2V5ICE9PSB2b2lkIDAgJiYga2V5ICE9PSAtMSkgcmV0dXJuIG9ialtrZXldO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gaXRlbSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlc2AgYW5kIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIGl0ZW0sIGZyb21JbmRleCwgZ3VhcmQpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggIT0gJ251bWJlcicgfHwgZ3VhcmQpIGZyb21JbmRleCA9IDA7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKG9iaiwgcGF0aCwgYXJncykge1xuICAgIHZhciBjb250ZXh0UGF0aCwgZnVuYztcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBhdGgpKSB7XG4gICAgICBmdW5jID0gcGF0aDtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShwYXRoKSkge1xuICAgICAgY29udGV4dFBhdGggPSBwYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgIHBhdGggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgIHZhciBtZXRob2QgPSBmdW5jO1xuICAgICAgaWYgKCFtZXRob2QpIHtcbiAgICAgICAgaWYgKGNvbnRleHRQYXRoICYmIGNvbnRleHRQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRleHQgPSBkZWVwR2V0KGNvbnRleHQsIGNvbnRleHRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGV4dCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgICBtZXRob2QgPSBjb250ZXh0W3BhdGhdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldGhvZCA9PSBudWxsID8gbWV0aG9kIDogbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsIHx8IHR5cGVvZiBpdGVyYXRlZSA9PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2JqWzBdICE9ICdvYmplY3QnICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2LCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHYsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2O1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCB8fCB0eXBlb2YgaXRlcmF0ZWUgPT0gJ251bWJlcicgJiYgdHlwZW9mIG9ialswXSAhPSAnb2JqZWN0JyAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odiwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2LCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5zYW1wbGUob2JqLCBJbmZpbml0eSk7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24gdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgdmFyIHNhbXBsZSA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmNsb25lKG9iaikgOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoc2FtcGxlKTtcbiAgICBuID0gTWF0aC5tYXgoTWF0aC5taW4obiwgbGVuZ3RoKSwgMCk7XG4gICAgdmFyIGxhc3QgPSBsZW5ndGggLSAxO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBuOyBpbmRleCsrKSB7XG4gICAgICB2YXIgcmFuZCA9IF8ucmFuZG9tKGluZGV4LCBsYXN0KTtcbiAgICAgIHZhciB0ZW1wID0gc2FtcGxlW2luZGV4XTtcbiAgICAgIHNhbXBsZVtpbmRleF0gPSBzYW1wbGVbcmFuZF07XG4gICAgICBzYW1wbGVbcmFuZF0gPSB0ZW1wO1xuICAgIH1cbiAgICByZXR1cm4gc2FtcGxlLnNsaWNlKDAsIG4pO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4KyssXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwga2V5LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IsIHBhcnRpdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gcGFydGl0aW9uID8gW1tdLCBbXV0gOiB7fTtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChoYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgdmFyIHJlU3RyU3ltYm9sID0gL1teXFx1ZDgwMC1cXHVkZmZmXXxbXFx1ZDgwMC1cXHVkYmZmXVtcXHVkYzAwLVxcdWRmZmZdfFtcXHVkODAwLVxcdWRmZmZdL2c7XG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChfLmlzU3RyaW5nKG9iaikpIHtcbiAgICAgIC8vIEtlZXAgc3Vycm9nYXRlIHBhaXIgY2hhcmFjdGVycyB0b2dldGhlclxuICAgICAgcmV0dXJuIG9iai5tYXRjaChyZVN0clN5bWJvbCk7XG4gICAgfVxuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iaikgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIHBhc3MpIHtcbiAgICByZXN1bHRbcGFzcyA/IDAgOiAxXS5wdXNoKHZhbHVlKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsIHx8IGFycmF5Lmxlbmd0aCA8IDEpIHJldHVybiBuID09IG51bGwgPyB2b2lkIDAgOiBbXTtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCB8fCBhcnJheS5sZW5ndGggPCAxKSByZXR1cm4gbiA9PSBudWxsID8gdm9pZCAwIDogW107XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBfLnJlc3QoYXJyYXksIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIG4pKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBCb29sZWFuKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgb3V0cHV0ID0gb3V0cHV0IHx8IFtdO1xuICAgIHZhciBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgLy8gRmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3QuXG4gICAgICAgIGlmIChzaGFsbG93KSB7XG4gICAgICAgICAgdmFyIGogPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKGogPCBsZW4pIG91dHB1dFtpZHgrK10gPSB2YWx1ZVtqKytdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KTtcbiAgICAgICAgICBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5LCBvdGhlckFycmF5cykge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIG90aGVyQXJyYXlzKTtcbiAgfSk7XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBUaGUgZmFzdGVyIGFsZ29yaXRobSB3aWxsIG5vdCB3b3JrIHdpdGggYW4gaXRlcmF0ZWUgaWYgdGhlIGl0ZXJhdGVlXG4gIC8vIGlzIG5vdCBhIG9uZS10by1vbmUgZnVuY3Rpb24sIHNvIHByb3ZpZGluZyBhbiBpdGVyYXRlZSB3aWxsIGRpc2FibGVcbiAgLy8gdGhlIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQgJiYgIWl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghXy5jb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcnJheXMpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJyYXlzLCB0cnVlLCB0cnVlKSk7XG4gIH0pO1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgdmFyIGo7XG4gICAgICBmb3IgKGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oYXJyYXksIHJlc3QpIHtcbiAgICByZXN0ID0gZmxhdHRlbihyZXN0LCB0cnVlLCB0cnVlKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbiAgLy8gZWFjaCBhcnJheSdzIGVsZW1lbnRzIG9uIHNoYXJlZCBpbmRpY2VzLlxuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgXy5tYXgoYXJyYXksIGdldExlbmd0aCkubGVuZ3RoIHx8IDA7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gcmVzdEFyZ3VtZW50cyhfLnVuemlwKTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuIFBhc3NpbmcgYnkgcGFpcnMgaXMgdGhlIHJldmVyc2Ugb2YgXy5wYWlycy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGluZGV4IG9uIGFuIGFycmF5LWxpa2UgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kSW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigxKTtcbiAgXy5maW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVuZ3RoID0gaWR4ID49IDAgPyBNYXRoLm1pbihpZHggKyAxLCBsZW5ndGgpIDogaWR4ICsgbGVuZ3RoICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzb3J0ZWRJbmRleCAmJiBpZHggJiYgbGVuZ3RoKSB7XG4gICAgICAgIGlkeCA9IHNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XG4gICAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgXy5pc05hTik7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCA/IGlkeCArIGkgOiAtMTtcbiAgICAgIH1cbiAgICAgIGZvciAoaWR4ID0gZGlyID4gMCA/IGkgOiBsZW5ndGggLSAxOyBpZHggPj0gMCAmJiBpZHggPCBsZW5ndGg7IGlkeCArPSBkaXIpIHtcbiAgICAgICAgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBpZiAoIXN0ZXApIHtcbiAgICAgIHN0ZXAgPSBzdG9wIDwgc3RhcnQgPyAtMSA6IDE7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBDaHVuayBhIHNpbmdsZSBhcnJheSBpbnRvIG11bHRpcGxlIGFycmF5cywgZWFjaCBjb250YWluaW5nIGBjb3VudGAgb3IgZmV3ZXJcbiAgLy8gaXRlbXMuXG4gIF8uY2h1bmsgPSBmdW5jdGlvbihhcnJheSwgY291bnQpIHtcbiAgICBpZiAoY291bnQgPT0gbnVsbCB8fCBjb3VudCA8IDEpIHJldHVybiBbXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHNsaWNlLmNhbGwoYXJyYXksIGksIGkgKz0gY291bnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHMuXG4gIHZhciBleGVjdXRlQm91bmQgPSBmdW5jdGlvbihzb3VyY2VGdW5jLCBib3VuZEZ1bmMsIGNvbnRleHQsIGNhbGxpbmdDb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB2YXIgc2VsZiA9IGJhc2VDcmVhdGUoc291cmNlRnVuYy5wcm90b3R5cGUpO1xuICAgIHZhciByZXN1bHQgPSBzb3VyY2VGdW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgdmFyIGJvdW5kID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihjYWxsQXJncykge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoY2FsbEFyZ3MpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyIGJ5IGRlZmF1bHQsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmVcbiAgLy8gcHJlLWZpbGxlZC4gU2V0IGBfLnBhcnRpYWwucGxhY2Vob2xkZXJgIGZvciBhIGN1c3RvbSBwbGFjZWhvbGRlciBhcmd1bWVudC5cbiAgXy5wYXJ0aWFsID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihmdW5jLCBib3VuZEFyZ3MpIHtcbiAgICB2YXIgcGxhY2Vob2xkZXIgPSBfLnBhcnRpYWwucGxhY2Vob2xkZXI7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBwbGFjZWhvbGRlciA/IGFyZ3VtZW50c1twb3NpdGlvbisrXSA6IGJvdW5kQXJnc1tpXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgdGhpcywgdGhpcywgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIF8ucGFydGlhbC5wbGFjZWhvbGRlciA9IF87XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICB2YXIgaW5kZXggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAoaW5kZXggPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICB9KTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gJycgKyAoaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXkpO1xuICAgICAgaWYgKCFoYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oZnVuYywgd2FpdCwgYXJncykge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH0pO1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gXy5wYXJ0aWFsKF8uZGVsYXksIF8sIDEpO1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGltZW91dCwgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcblxuICAgIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBwcmV2aW91cyA9IDA7XG4gICAgICB0aW1lb3V0ID0gY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhyb3R0bGVkO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBhcmdzKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGlmIChhcmdzKSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG5cbiAgICB2YXIgZGVib3VuY2VkID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAodGltZW91dCkgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICB2YXIgY2FsbE5vdyA9ICF0aW1lb3V0O1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IF8uZGVsYXkobGF0ZXIsIHdhaXQsIHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgZGVib3VuY2VkLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWJvdW5jZWQ7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBvbiBhbmQgYWZ0ZXIgdGhlIE50aCBjYWxsLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCB1cCB0byAoYnV0IG5vdCBpbmNsdWRpbmcpIHRoZSBOdGggY2FsbC5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICBfLnJlc3RBcmd1bWVudHMgPSByZXN0QXJndW1lbnRzO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEtleXMgaW4gSUUgPCA5IHRoYXQgd29uJ3QgYmUgaXRlcmF0ZWQgYnkgYGZvciBrZXkgaW4gLi4uYCBhbmQgdGh1cyBtaXNzZWQuXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgdmFyIGNvbGxlY3ROb25FbnVtUHJvcHMgPSBmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgbm9uRW51bUlkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGg7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICAgIHZhciBwcm90byA9IF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlIHx8IE9ialByb3RvO1xuXG4gICAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gICAgdmFyIHByb3AgPSAnY29uc3RydWN0b3InO1xuICAgIGlmIChoYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgLlxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKGhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdC5cbiAgLy8gSW4gY29udHJhc3QgdG8gXy5tYXAgaXQgcmV0dXJucyBhbiBvYmplY3QuXG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0ge307XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICAvLyBUaGUgb3Bwb3NpdGUgb2YgXy5vYmplY3QuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgLlxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFzc2lnbmVyIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIGRlZmF1bHRzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAoZGVmYXVsdHMpIG9iaiA9IE9iamVjdChvYmopO1xuICAgICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdLFxuICAgICAgICAgICAga2V5cyA9IGtleXNGdW5jKHNvdXJjZSksXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKCFkZWZhdWx0cyB8fCBvYmpba2V5XSA9PT0gdm9pZCAwKSBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzKTtcblxuICAvLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKS5cbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXG4gIF8uZXh0ZW5kT3duID0gXy5hc3NpZ24gPSBjcmVhdGVBc3NpZ25lcihfLmtleXMpO1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcGljayBoZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGBvYmpgIGhhcyBrZXkgYGtleWAuXG4gIHZhciBrZXlJbk9iaiA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgIHJldHVybiBrZXkgaW4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBpdGVyYXRlZSA9IGtleXNbMF07XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpZiAoa2V5cy5sZW5ndGggPiAxKSBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGtleXNbMV0pO1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGtleUluT2JqO1xuICAgICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICAgIG9iaiA9IE9iamVjdChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgaXRlcmF0ZWUgPSBrZXlzWzBdLCBjb250ZXh0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDEpIGNvbnRleHQgPSBrZXlzWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlzID0gXy5tYXAoZmxhdHRlbihrZXlzLCBmYWxzZSwgZmFsc2UpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfSk7XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cywgdHJ1ZSk7XG5cbiAgLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuICAvLyBJZiBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXJlIHByb3ZpZGVkIHRoZW4gdGhleSB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICAvLyBjcmVhdGVkIG9iamVjdC5cbiAgXy5jcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHByb3BzKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICBpZiAocHJvcHMpIF8uZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMoYXR0cnMpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxLCBkZWVwRXE7XG4gIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgb25seSBlcXVhbCB0byBpdHNlbGYgKHN0cmljdCBjb21wYXJpc29uKS5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgaWYgKGEgIT09IGEpIHJldHVybiBiICE9PSBiO1xuICAgIC8vIEV4aGF1c3QgcHJpbWl0aXZlIGNoZWNrc1xuICAgIHZhciB0eXBlID0gdHlwZW9mIGE7XG4gICAgaWYgKHR5cGUgIT09ICdmdW5jdGlvbicgJiYgdHlwZSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVlcEVxKGEsIGIsIGFTdGFjaywgYlN0YWNrKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICBkZWVwRXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU4uXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBTeW1ib2xdJzpcbiAgICAgICAgcmV0dXJuIFN5bWJvbFByb3RvLnZhbHVlT2YuY2FsbChhKSA9PT0gU3ltYm9sUHJvdG8udmFsdWVPZi5jYWxsKGIpO1xuICAgIH1cblxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChhcmVBcnJheXMpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICBpZiAoXy5rZXlzKGIpLmxlbmd0aCAhPT0gbGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKCEoaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IsIGlzTWFwLCBpc1dlYWtNYXAsIGlzU2V0LCBpc1dlYWtTZXQuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJywgJ1N5bWJvbCcsICdNYXAnLCAnV2Vha01hcCcsICdTZXQnLCAnV2Vha1NldCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxuICAvLyBJRSAxMSAoIzE2MjEpLCBTYWZhcmkgOCAoIzE5MjkpLCBhbmQgUGhhbnRvbUpTICgjMjIzNikuXG4gIHZhciBub2RlbGlzdCA9IHJvb3QuZG9jdW1lbnQgJiYgcm9vdC5kb2N1bWVudC5jaGlsZE5vZGVzO1xuICBpZiAodHlwZW9mIC8uLyAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiBJbnQ4QXJyYXkgIT0gJ29iamVjdCcgJiYgdHlwZW9mIG5vZGVsaXN0ICE9ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhXy5pc1N5bWJvbChvYmopICYmIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gP1xuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBpc05hTihvYmopO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBoYXMob2JqLCBwYXRoKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBwYXRoW2ldO1xuICAgICAgaWYgKG9iaiA9PSBudWxsIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmogPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuICEhbGVuZ3RoO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gcGFzc2VkIGFuIG9iamVjdCwgd2lsbCB0cmF2ZXJzZSB0aGF0IG9iamVjdOKAmXNcbiAgLy8gcHJvcGVydGllcyBkb3duIHRoZSBnaXZlbiBgcGF0aGAsIHNwZWNpZmllZCBhcyBhbiBhcnJheSBvZiBrZXlzIG9yIGluZGV4ZXMuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBkZWVwR2V0KG9iaiwgcGF0aCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgIHJldHVybiAhXy5pc0FycmF5KHBhdGgpID8gb2JqW3BhdGhdIDogZGVlcEdldChvYmosIHBhdGgpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkLlxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIFRyYXZlcnNlcyB0aGUgY2hpbGRyZW4gb2YgYG9iamAgYWxvbmcgYHBhdGhgLiBJZiBhIGNoaWxkIGlzIGEgZnVuY3Rpb24sIGl0XG4gIC8vIGlzIGludm9rZWQgd2l0aCBpdHMgcGFyZW50IGFzIGNvbnRleHQuIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBmaW5hbFxuICAvLyBjaGlsZCwgb3IgYGZhbGxiYWNrYCBpZiBhbnkgY2hpbGQgaXMgdW5kZWZpbmVkLlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iaiwgcGF0aCwgZmFsbGJhY2spIHtcbiAgICBpZiAoIV8uaXNBcnJheShwYXRoKSkgcGF0aCA9IFtwYXRoXTtcbiAgICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiBfLmlzRnVuY3Rpb24oZmFsbGJhY2spID8gZmFsbGJhY2suY2FsbChvYmopIDogZmFsbGJhY2s7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwcm9wID0gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpbcGF0aFtpXV07XG4gICAgICBpZiAocHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHByb3AgPSBmYWxsYmFjaztcbiAgICAgICAgaSA9IGxlbmd0aDsgLy8gRW5zdXJlIHdlIGRvbid0IGNvbnRpbnVlIGl0ZXJhdGluZy5cbiAgICAgIH1cbiAgICAgIG9iaiA9IF8uaXNGdW5jdGlvbihwcm9wKSA/IHByb3AuY2FsbChvYmopIDogcHJvcDtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGU6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6IFwiJ1wiLFxuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICdcXHInOiAncicsXG4gICAgJ1xcbic6ICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZVJlZ0V4cCA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZVJlZ0V4cCwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2Zmc2V0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHZhciByZW5kZXI7XG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgY2hhaW5SZXN1bHQgPSBmdW5jdGlvbihpbnN0YW5jZSwgb2JqKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBfO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cbiAgXy5wcm90b3R5cGUudmFsdWVPZiA9IF8ucHJvdG90eXBlLnRvSlNPTiA9IF8ucHJvdG90eXBlLnZhbHVlO1xuXG4gIF8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLl93cmFwcGVkKTtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSgpKTtcbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL3VzZXIwMDEvRG9jdW1lbnRzL0FwcGNlbGVyYXRvcl9TdHVkaW9fV29ya3NwYWNlL29jci9SZXNvdXJjZXMvYW5kcm9pZC9hbGxveSJ9
