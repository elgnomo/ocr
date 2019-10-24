/**
 * @class Alloy
 * Top-level module for Alloy functions.
 *
 * Alloy is an application framework built on top of the Titanium SDK designed to help rapidly
 * develop high quality applications and reduce maintenance.
 *
 * Alloy uses the model-view-controller architecture to separate the application into three
 * components:
 *
 *  * **Models** provide the data of the application. Alloy utilizes **Backbone Model and Collection**
 *     objects for this functionality.
 *
 *  * **Views** provide the UI components to interact with the application, written using **XML markup**
 *    and **Titanium Stylesheets (TSS)**, which abstracts the UI components of the Titanium API.
 *
 *  * **Controllers** provide the glue layer between the Model and View components as well as
 *    additional application logic using the **Alloy API** and **Titanium API**.
 *
 * The API documentation provided here is used with Alloy Controllers and Widget Controllers to
 * interact with the View and Model components of the application or widget.
 *
 * For guides on using Alloy, see
 * [Alloy Framework](http://docs.appcelerator.com/platform/latest/#!/guide/Alloy_Framework).
 */
var _ = require('/alloy/underscore')._,
Backbone = require('/alloy/backbone'),
CONST = require('/alloy/constants');

exports.version = '1.14.1';
exports._ = _;
exports.Backbone = Backbone;

var DEFAULT_WIDGET = 'widget';
var TI_VERSION = Ti.version;
var MW320_CHECK = false && TI_VERSION >= '3.2.0';
var IDENTITY_TRANSFORM = true ? Ti.version >= '8.0.0' ? Ti.UI.createMatrix2D() : Ti.UI.create2DMatrix() : undefined;
var RESET = {
  bottom: null,
  left: null,
  right: null,
  top: null,
  height: null,
  width: null,
  shadowColor: null,
  shadowOffset: null,
  backgroundImage: null,
  backgroundRepeat: null,
  center: null,
  layout: null,
  backgroundSelectedColor: null,
  backgroundSelectedImage: null,

  // non-null resets
  opacity: 1.0,
  touchEnabled: true,
  enabled: true,
  horizontalWrap: true,
  zIndex: 0,

  //##### DISPARITIES #####//

  // Setting to "null" on android works the first time. Leaves the color
  // on subsequent calls.
  backgroundColor: true ? 'transparent' : null,

  // creates a font slightly different (smaller) than default on iOS
  // https://jira.appcelerator.org/browse/TIMOB-14565
  font: null,

  // Throws an exception on Android if set to null. Works on other platforms.
  // https://jira.appcelerator.org/browse/TIMOB-14566
  visible: true,

  // Setting to "null" on android makes text transparent
  // https://jira.appcelerator.org/browse/TIMOB-14567
  color: true ? '#000' : null,

  // Android will leave artifact of previous transform unless the identity matrix is
  // manually reset.
  // https://jira.appcelerator.org/browse/TIMOB-14568
  //
  // Mobileweb does not respect matrix properties set in the constructor, despite the
  // documentation at docs.appcelerator.com indicating that it should.
  // https://jira.appcelerator.org/browse/TIMOB-14570
  transform: true ? IDENTITY_TRANSFORM : null,

  // Crashes if set to null on anything but Android
  // https://jira.appcelerator.org/browse/TIMOB-14571
  backgroundGradient: !true ? {} : null,

  // All supported platforms have varying behavior with border properties
  // https://jira.appcelerator.org/browse/TIMOB-14573
  borderColor: true ? null : 'transparent',

  // https://jira.appcelerator.org/browse/TIMOB-14575
  borderRadius: false ? 0 : null,

  // https://jira.appcelerator.org/browse/TIMOB-14574
  borderWidth: false ? 0 : null };


if (false) {
  RESET = _.extend(RESET, {
    backgroundLeftCap: 0,
    backgroundTopCap: 0 });

} else if (true) {
  RESET = _.extend(RESET, {
    backgroundDisabledColor: null,
    backgroundDisabledImage: null,
    backgroundFocusedColor: null,
    backgroundFocusedImage: null,
    focusable: false,
    keepScreenOn: false });

}

function ucfirst(text) {
  if (!text) {return text;}
  return text[0].toUpperCase() + text.substr(1);
}

function addNamespace(apiName) {
  return (CONST.IMPLICIT_NAMESPACES[apiName] || CONST.NAMESPACE_DEFAULT) +
  '.' + apiName;
}

exports.M = function (name, modelDesc, migrations) {
  var config = (modelDesc || {}).config || {};
  var adapter = config.adapter || {};
  var extendObj = {};
  var extendClass = {};
  var mod;

  if (adapter.type) {
    mod = require('/alloy/sync/' + adapter.type);
    extendObj.sync = function (method, model, opts) {
      return mod.sync(method, model, opts);
    };
  } else {
    extendObj.sync = function (method, model, opts) {
      Ti.API.warn('Execution of ' + method + '#sync() function on a model that does not support persistence');
      Ti.API.warn('model: ' + JSON.stringify(model.toJSON()));
    };
  }
  extendObj.defaults = config.defaults;

  // construct the model based on the current adapter type
  if (migrations) {extendClass.migrations = migrations;}

  // Run the pre model creation code, if any
  if (mod && _.isFunction(mod.beforeModelCreate)) {
    config = mod.beforeModelCreate(config, name) || config;
  }

  // Create the Model object
  var Model = Backbone.Model.extend(extendObj, extendClass);
  Model.prototype.config = config;

  // Extend the Model with extendModel(), if defined
  if (_.isFunction(modelDesc.extendModel)) {
    Model = modelDesc.extendModel(Model) || Model;
  }

  // Run the post model creation code, if any
  if (mod && _.isFunction(mod.afterModelCreate)) {
    mod.afterModelCreate(Model, name);
  }

  return Model;
};

exports.C = function (name, modelDesc, model) {
  var extendObj = { model: model };
  var config = (model ? model.prototype.config : {}) || {};
  var mod;

  if (config.adapter && config.adapter.type) {
    mod = require('/alloy/sync/' + config.adapter.type);
    extendObj.sync = function (method, model, opts) {
      return mod.sync(method, model, opts);
    };
  } else {
    extendObj.sync = function (method, model, opts) {
      Ti.API.warn('Execution of ' + method + '#sync() function on a collection that does not support persistence');
      Ti.API.warn('model: ' + JSON.stringify(model.toJSON()));
    };
  }

  var Collection = Backbone.Collection.extend(extendObj);
  Collection.prototype.config = config;

  // extend the collection object
  if (_.isFunction(modelDesc.extendCollection)) {
    Collection = modelDesc.extendCollection(Collection) || Collection;
  }

  // do any post collection creation code form the sync adapter
  if (mod && _.isFunction(mod.afterCollectionCreate)) {
    mod.afterCollectionCreate(Collection);
  }

  return Collection;
};

exports.UI = {};
exports.UI.create = function (controller, apiName, opts) {
  opts = opts || {};

  // Make sure we have a full api name
  var baseName, ns;
  var parts = apiName.split('.');
  if (parts.length === 1) {
    baseName = apiName;
    ns = opts.ns || CONST.IMPLICIT_NAMESPACES[baseName] || CONST.NAMESPACE_DEFAULT;
  } else if (parts.length > 1) {
    baseName = parts[parts.length - 1];
    ns = parts.slice(0, parts.length - 1).join('.');
  } else {
    throw 'Alloy.UI.create() failed: No API name was given in the second parameter';
  }
  opts.apiName = ns + '.' + baseName;
  baseName = baseName[0].toUpperCase() + baseName.substr(1);

  // generate the style object
  var style = exports.createStyle(controller, opts);

  // create the titanium proxy object
  return eval(ns)['create' + baseName](style);
};

exports.createStyle = function (controller, opts, defaults) {
  var classes, apiName;

  // If there's no opts, there's no reason to load the style module. Just
  // return an empty object.
  if (!opts) {return {};}

  // make opts.classes an array if it isn't already
  if (_.isArray(opts.classes)) {
    classes = opts.classes.slice(0);
  } else if (_.isString(opts.classes)) {
    classes = opts.classes.split(/\s+/);
  } else {
    classes = [];
  }

  // give opts.apiName a namespace if it doesn't have one already
  apiName = opts.apiName;
  if (apiName && apiName.indexOf('.') === -1) {
    apiName = addNamespace(apiName);
  }

  // TODO: check cached styles based on opts and controller

  // Load the runtime style for the given controller
  var styleArray;
  if (controller && _.isObject(controller)) {
    styleArray = require('/alloy/widgets/' + controller.widgetId +
    '/styles/' + controller.name);
  } else {
    styleArray = require('/alloy/styles/' + controller);
  }
  var styleFinal = {};

  // iterate through all styles
  var i, len;
  for (i = 0, len = styleArray.length; i < len; i++) {
    var style = styleArray[i];

    // give the apiName a namespace if necessary
    var styleApi = style.key;
    if (style.isApi && styleApi.indexOf('.') === -1) {
      styleApi = (CONST.IMPLICIT_NAMESPACES[styleApi] ||
      CONST.NAMESPACE_DEFAULT) + '.' + styleApi;
    }

    // does this style match the given opts?
    if (style.isId && opts.id && style.key === opts.id ||
    style.isClass && _.contains(classes, style.key)) {
      // do nothing here, keep on processing
    } else if (style.isApi) {
      if (style.key.indexOf('.') === -1) {
        style.key = addNamespace(style.key);
      }
      if (style.key !== apiName) {continue;}
    } else {
      // no matches, skip this style
      continue;
    }

    // can we clear out any form factor queries?
    if (style.queries && style.queries.formFactor &&
    !exports[style.queries.formFactor]) {
      continue;
    }

    // process runtime custom queries
    if (style.queries && style.queries.if && (
    style.queries.if.trim().toLowerCase() === 'false' ||
    style.queries.if.indexOf('Alloy.Globals') !== -1 &&
    exports.Globals[style.queries.if.split('.')[2]] === false)) {
      continue;
    }

    // Merge this style into the existing style object
    exports.deepExtend(true, styleFinal, style.style);
  }

  // TODO: cache the style based on the opts and controller

  // Merge remaining extra style properties from opts, if any
  var extraStyle = _.omit(opts, [
  CONST.CLASS_PROPERTY,
  CONST.APINAME_PROPERTY]);

  exports.deepExtend(true, styleFinal, extraStyle);
  styleFinal[CONST.CLASS_PROPERTY] = classes;
  styleFinal[CONST.APINAME_PROPERTY] = apiName;

  if (MW320_CHECK) {delete styleFinal[CONST.APINAME_PROPERTY];}

  return defaults ? _.defaults(styleFinal, defaults) : styleFinal;
};

function processStyle(controller, proxy, classes, opts, defaults) {
  opts = opts || {};
  opts.classes = classes;
  if (proxy.apiName) {opts.apiName = proxy.apiName;}
  if (proxy.id) {opts.id = proxy.id;}
  proxy.applyProperties(exports.createStyle(controller, opts, defaults));
  if (true) {proxy.classes = classes;}
}

exports.addClass = function (controller, proxy, classes, opts) {

  // make sure we actually have classes to add
  if (!classes) {
    if (opts) {
      if (MW320_CHECK) {delete opts.apiName;}
      proxy.applyProperties(opts);
    }
    return;
  } else {
    // create a union of the existing classes with the new one(s)
    var pClasses = proxy[CONST.CLASS_PROPERTY] || [];
    var beforeLen = pClasses.length;
    classes = _.isString(classes) ? classes.split(/\s+/) : classes;
    var newClasses = _.union(pClasses, classes || []);

    // make sure we actually added classes before processing styles
    if (beforeLen === newClasses.length) {
      if (opts) {
        if (MW320_CHECK) {delete opts.apiName;}
        proxy.applyProperties(opts);
      }
      return;
    } else {
      processStyle(controller, proxy, newClasses, opts);
    }
  }
};

exports.removeClass = function (controller, proxy, classes, opts) {
  classes = classes || [];
  var pClasses = proxy[CONST.CLASS_PROPERTY] || [];
  var beforeLen = pClasses.length;

  // make sure there's classes to remove before processing
  if (!beforeLen || !classes.length) {
    if (opts) {
      if (MW320_CHECK) {delete opts.apiName;}
      proxy.applyProperties(opts);
    }
    return;
  } else {
    // remove the given class(es)
    classes = _.isString(classes) ? classes.split(/\s+/) : classes;
    var newClasses = _.difference(pClasses, classes);

    // make sure there was actually a difference before processing
    if (beforeLen === newClasses.length) {
      if (opts) {
        if (MW320_CHECK) {delete opts.apiName;}
        proxy.applyProperties(opts);
      }
      return;
    } else {
      processStyle(controller, proxy, newClasses, opts, RESET);
    }
  }
};

exports.resetClass = function (controller, proxy, classes, opts) {
  classes = classes || [];
  classes = _.isString(classes) ? classes.split(/\s+/) : classes;
  processStyle(controller, proxy, classes, opts, RESET);
};

/**
       * @method createWidget
       * Factory method for instantiating a widget controller. Creates and returns an instance of the
       * named widget.
       * @param {String} id Id of widget to instantiate.
       * @param {String} [name="widget"] Name of the view within the widget to instantiate ('widget' by default)
       * @param {Object} [args] Arguments to pass to the widget.
       * @return {Alloy.Controller} Alloy widget controller object.
       */
exports.createWidget = function (id, name, args) {
  if (typeof name !== 'undefined' && name !== null &&
  _.isObject(name) && !_.isString(name)) {
    args = name;
    name = DEFAULT_WIDGET;
  }
  return new (require('/alloy/widgets/' + id + '/controllers/' + (name || DEFAULT_WIDGET)))(args);
};

/**
       * @method createController
       * Factory method for instantiating a controller. Creates and returns an instance of the
       * named controller.
       * @param {String} name Name of controller to instantiate.
       * @param {Object} [args] Arguments to pass to the controller.
       * @return {Alloy.Controller} Alloy controller object.
       */
exports.createController = function (name, args) {
  return new (require('/alloy/controllers/' + name))(args);
};

/**
       * @method createModel
       * Factory method for instantiating a Backbone Model object. Creates and returns an instance of the
       * named model.
       *
       * See [Backbone.Model](http://docs.appcelerator.com/backbone/0.9.2/#Model) in the Backbone.js documentation for
       * information on the methods and properties provided by the Model object.
       * @param {String} name Name of model to instantiate.
       * @param {Object} [args] Arguments to pass to the model.
       * @return {Backbone.Model} Backbone model object.
       */
exports.createModel = function (name, args) {
  return new (require('/alloy/models/' + ucfirst(name)).Model)(args);
};

/**
       * @method createCollection
       * Factory method for instantiating a Backbone collection of model objects. Creates and returns a
       * collection for holding the named type of model objects.
       *
       * See [Backbone.Collection](http://docs.appcelerator.com/backbone/0.9.2/#Collection) in the Backbone.js
       * documentation for  information on the methods and  properties provided by the
       * Collection object.
       * @param {String} name Name of model to hold in this collection.
       * @param {Object} [args] Arguments to pass to the collection.
       * @return {Backbone.Collection} Backbone collection object.
       */
exports.createCollection = function (name, args) {
  return new (require('/alloy/models/' + ucfirst(name)).Collection)(args);
};

function isTabletFallback() {
  return Math.min(
  Ti.Platform.displayCaps.platformHeight,
  Ti.Platform.displayCaps.platformWidth) >=
  700;
}

/**
     * @property {Boolean} isTablet
     * `true` if the current device is a tablet.
     *
     */
exports.isTablet = function () {
  if (false) {
    return "android" === 'ipad';
  } else if (true) {
    var psc = Ti.Platform.Android.physicalSizeCategory;
    return psc === Ti.Platform.Android.PHYSICAL_SIZE_CATEGORY_LARGE ||
    psc === Ti.Platform.Android.PHYSICAL_SIZE_CATEGORY_XLARGE;
  } else if (false) {
    return Math.min(
    Ti.Platform.displayCaps.platformHeight,
    Ti.Platform.displayCaps.platformWidth) >=
    400;
    // } else if (OS_BLACKBERRY) {
    // 	// Tablets not currently supported by BB TiSDK
    // 	// https://jira.appcelerator.org/browse/TIMOB-13225
    // 	return false;
  } else if (false) {
    // per http://www.extremetech.com/computing/139768-windows-8-smartphones-and-windows-phone-8-tablets
    // tablets should be >= 1024x768 and phones could be lower, though current phones are running at
    // the 1280x720 range and higher
    return Math.max(
    Ti.Platform.displayCaps.platformHeight,
    Ti.Platform.displayCaps.platformWidth) >=
    1024;
  } else {
    return isTabletFallback();
  }
}();

/**
           * @property {Boolean} isHandheld
           * `true` if the current device is a handheld device (not a tablet).
           *
           */
exports.isHandheld = !exports.isTablet;

/**
                                                                                 * @property {Object} Globals
                                                                                 * An object for storing globally accessible variables and functions.
                                                                                 * Alloy.Globals is accessible in any controller in your app:
                                                                                 *
                                                                                 *     Alloy.Globals.someGlobalObject = { key: 'value' };
                                                                                 *     Alloy.Globals.someGlobalFunction = function(){};
                                                                                 *
                                                                                 * Alloy.Globals can be accessed in other non-controller Javascript files
                                                                                 * like this:
                                                                                 *
                                                                                 *     var theObject = require('alloy').Globals.someGlobalObject;
                                                                                 *
                                                                                 */
exports.Globals = {};

/**
                                             * @property {Object} Models
                                             * An object for storing globally accessible Alloy models. Singleton models
                                             * created via markup will be stored on this object.
                                             *
                                             *     <Model src="myModel"/>
                                             *
                                             * The above markup would effectively generate the following code:
                                             *
                                             *     Alloy.Models.myModel = Alloy.createModel('MyModel');
                                             *
                                             * Alloy.Models.myModel would then be accessible in any controller in your app.
                                             *
                                             */
exports.Models = {};

/*
                                           * Creates a singleton instance of a Model based on the given model, or
                                           * returns an existing instance if one has already been created.
                                           * Documented in docs/apidoc/model.js for docs site.
                                           */
exports.Models.instance = function (name) {
  return exports.Models[name] || (exports.Models[name] = exports.createModel(name));
};

/**
       * @property {Object} Collections
       * An object for storing globally accessible Alloy collections. Singleton collections
       * created via markup will be stored on this object.
       *
       *     <Collection src="myModel"/>
       *
       * The above markup would effectively generate the following code:
       *
       *     Alloy.Collections.myModel = Alloy.createCollection('MyModel');
       *
       * Alloy.Collections.myModel would then be accessible in any controller in your app.
       *
       */
exports.Collections = {};

/*
                                                     * Creates a singleton instance of a Collection based on the given model, or
                                                     * returns an existing instance if one has already been created.
                                                     * Documented in docs/apidoc/collection.js for docs site.
                                                     */
exports.Collections.instance = function (name) {
  return exports.Collections[name] || (exports.Collections[name] = exports.createCollection(name));
};

/**
       * @property {Object} CFG
       * An object that stores Alloy configuration values as defined in your app's
       * app/config.json file. Here's what a typical config.json file might look
       * like in an Alloy app.
       *
       *     {
       *         "global": { "key": "defaultValue", "anotherKey": 12345 },
       *         "env:development": {},
       *         "env:test": {},
       *         "env:production": {},
       *         "os:ios": { "key": "iosValue" },
       *         "os:android": { "key": "androidValue" },
       *         "dependencies": {}
       *     }
       *
       * If this app was compiled for iOS, the Alloy.CFG would look like this:
       *
       *     Alloy.CFG = {
       *         "key": "iosValue",
       *         "anotherKey": 12345
       *     }
       *
       * Alloy.CFG is accessible in any controller in your app, and can be accessed
       * in other non-controller Javascript files like this:
       *
       *     var theKey = require('alloy').CFG.key;
       *
       */
exports.CFG = require('/alloy/CFG');

if (true) {
  exports.Android = {};
  exports.Android.menuItemCreateArgs = ['itemId', 'groupId', 'title', 'order', 'actionView', 'checkable', 'checked', 'enabled', 'icon', 'showAsAction', 'titleCondensed', 'visible'];
}

/*
     * Adapted version of node.extend https://www.npmjs.org/package/node.extend
     *
     * Original copyright:
     *
     * node.extend
     * Copyright 2011, John Resig
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     *
     * @fileoverview
     * Port of jQuery.extend that actually works on node.js
     */
exports.deepExtend = function () {
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  var options, name, src, copy, copy_is_array, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !_.isFunction(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    options = arguments[i];
    if (options != null) {
      if (typeof options === 'string') {
        options = options.split('');
      }
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        if (deep && copy && !_.isFunction(copy) && _.isObject(copy) && ((copy_is_array = _.isArray(copy)) || !_.has(copy, 'apiName'))) {
          // Recurse if we're merging plain objects or arrays
          if (copy_is_array) {
            copy_is_array = false;
            clone = src && _.isArray(src) ? src : [];
          } else if (_.isDate(copy)) {
            clone = new Date(copy.valueOf());
          } else {
            clone = src && _.isObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = exports.deepExtend(deep, clone, copy);
        } else {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsbG95LmpzIl0sIm5hbWVzIjpbIl8iLCJyZXF1aXJlIiwiQmFja2JvbmUiLCJDT05TVCIsImV4cG9ydHMiLCJ2ZXJzaW9uIiwiREVGQVVMVF9XSURHRVQiLCJUSV9WRVJTSU9OIiwiVGkiLCJNVzMyMF9DSEVDSyIsIklERU5USVRZX1RSQU5TRk9STSIsIlVJIiwiY3JlYXRlTWF0cml4MkQiLCJjcmVhdGUyRE1hdHJpeCIsInVuZGVmaW5lZCIsIlJFU0VUIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwidG9wIiwiaGVpZ2h0Iiwid2lkdGgiLCJzaGFkb3dDb2xvciIsInNoYWRvd09mZnNldCIsImJhY2tncm91bmRJbWFnZSIsImJhY2tncm91bmRSZXBlYXQiLCJjZW50ZXIiLCJsYXlvdXQiLCJiYWNrZ3JvdW5kU2VsZWN0ZWRDb2xvciIsImJhY2tncm91bmRTZWxlY3RlZEltYWdlIiwib3BhY2l0eSIsInRvdWNoRW5hYmxlZCIsImVuYWJsZWQiLCJob3Jpem9udGFsV3JhcCIsInpJbmRleCIsImJhY2tncm91bmRDb2xvciIsImZvbnQiLCJ2aXNpYmxlIiwiY29sb3IiLCJ0cmFuc2Zvcm0iLCJiYWNrZ3JvdW5kR3JhZGllbnQiLCJib3JkZXJDb2xvciIsImJvcmRlclJhZGl1cyIsImJvcmRlcldpZHRoIiwiZXh0ZW5kIiwiYmFja2dyb3VuZExlZnRDYXAiLCJiYWNrZ3JvdW5kVG9wQ2FwIiwiYmFja2dyb3VuZERpc2FibGVkQ29sb3IiLCJiYWNrZ3JvdW5kRGlzYWJsZWRJbWFnZSIsImJhY2tncm91bmRGb2N1c2VkQ29sb3IiLCJiYWNrZ3JvdW5kRm9jdXNlZEltYWdlIiwiZm9jdXNhYmxlIiwia2VlcFNjcmVlbk9uIiwidWNmaXJzdCIsInRleHQiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0ciIsImFkZE5hbWVzcGFjZSIsImFwaU5hbWUiLCJJTVBMSUNJVF9OQU1FU1BBQ0VTIiwiTkFNRVNQQUNFX0RFRkFVTFQiLCJNIiwibmFtZSIsIm1vZGVsRGVzYyIsIm1pZ3JhdGlvbnMiLCJjb25maWciLCJhZGFwdGVyIiwiZXh0ZW5kT2JqIiwiZXh0ZW5kQ2xhc3MiLCJtb2QiLCJ0eXBlIiwic3luYyIsIm1ldGhvZCIsIm1vZGVsIiwib3B0cyIsIkFQSSIsIndhcm4iLCJKU09OIiwic3RyaW5naWZ5IiwidG9KU09OIiwiZGVmYXVsdHMiLCJpc0Z1bmN0aW9uIiwiYmVmb3JlTW9kZWxDcmVhdGUiLCJNb2RlbCIsInByb3RvdHlwZSIsImV4dGVuZE1vZGVsIiwiYWZ0ZXJNb2RlbENyZWF0ZSIsIkMiLCJDb2xsZWN0aW9uIiwiZXh0ZW5kQ29sbGVjdGlvbiIsImFmdGVyQ29sbGVjdGlvbkNyZWF0ZSIsImNyZWF0ZSIsImNvbnRyb2xsZXIiLCJiYXNlTmFtZSIsIm5zIiwicGFydHMiLCJzcGxpdCIsImxlbmd0aCIsInNsaWNlIiwiam9pbiIsInN0eWxlIiwiY3JlYXRlU3R5bGUiLCJldmFsIiwiY2xhc3NlcyIsImlzQXJyYXkiLCJpc1N0cmluZyIsImluZGV4T2YiLCJzdHlsZUFycmF5IiwiaXNPYmplY3QiLCJ3aWRnZXRJZCIsInN0eWxlRmluYWwiLCJpIiwibGVuIiwic3R5bGVBcGkiLCJrZXkiLCJpc0FwaSIsImlzSWQiLCJpZCIsImlzQ2xhc3MiLCJjb250YWlucyIsInF1ZXJpZXMiLCJmb3JtRmFjdG9yIiwiaWYiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJHbG9iYWxzIiwiZGVlcEV4dGVuZCIsImV4dHJhU3R5bGUiLCJvbWl0IiwiQ0xBU1NfUFJPUEVSVFkiLCJBUElOQU1FX1BST1BFUlRZIiwicHJvY2Vzc1N0eWxlIiwicHJveHkiLCJhcHBseVByb3BlcnRpZXMiLCJhZGRDbGFzcyIsInBDbGFzc2VzIiwiYmVmb3JlTGVuIiwibmV3Q2xhc3NlcyIsInVuaW9uIiwicmVtb3ZlQ2xhc3MiLCJkaWZmZXJlbmNlIiwicmVzZXRDbGFzcyIsImNyZWF0ZVdpZGdldCIsImFyZ3MiLCJjcmVhdGVDb250cm9sbGVyIiwiY3JlYXRlTW9kZWwiLCJjcmVhdGVDb2xsZWN0aW9uIiwiaXNUYWJsZXRGYWxsYmFjayIsIk1hdGgiLCJtaW4iLCJQbGF0Zm9ybSIsImRpc3BsYXlDYXBzIiwicGxhdGZvcm1IZWlnaHQiLCJwbGF0Zm9ybVdpZHRoIiwiaXNUYWJsZXQiLCJwc2MiLCJBbmRyb2lkIiwicGh5c2ljYWxTaXplQ2F0ZWdvcnkiLCJQSFlTSUNBTF9TSVpFX0NBVEVHT1JZX0xBUkdFIiwiUEhZU0lDQUxfU0laRV9DQVRFR09SWV9YTEFSR0UiLCJtYXgiLCJpc0hhbmRoZWxkIiwiTW9kZWxzIiwiaW5zdGFuY2UiLCJDb2xsZWN0aW9ucyIsIkNGRyIsIm1lbnVJdGVtQ3JlYXRlQXJncyIsInRhcmdldCIsImFyZ3VtZW50cyIsImRlZXAiLCJvcHRpb25zIiwic3JjIiwiY29weSIsImNvcHlfaXNfYXJyYXkiLCJjbG9uZSIsImhhcyIsImlzRGF0ZSIsIkRhdGUiLCJ2YWx1ZU9mIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQSxJQUFJQSxDQUFDLEdBQUdDLE9BQU8sQ0FBQyxtQkFBRCxDQUFQLENBQTZCRCxDQUFyQztBQUNBRSxRQUFRLEdBQUdELE9BQU8sQ0FBQyxpQkFBRCxDQURsQjtBQUVBRSxLQUFLLEdBQUdGLE9BQU8sQ0FBQyxrQkFBRCxDQUZmOztBQUlBRyxPQUFPLENBQUNDLE9BQVIsR0FBa0IsUUFBbEI7QUFDQUQsT0FBTyxDQUFDSixDQUFSLEdBQVlBLENBQVo7QUFDQUksT0FBTyxDQUFDRixRQUFSLEdBQW1CQSxRQUFuQjs7QUFFQSxJQUFJSSxjQUFjLEdBQUcsUUFBckI7QUFDQSxJQUFJQyxVQUFVLEdBQUdDLEVBQUUsQ0FBQ0gsT0FBcEI7QUFDQSxJQUFJSSxXQUFXLEdBQUcsU0FBU0YsVUFBVSxJQUFJLE9BQXpDO0FBQ0EsSUFBSUcsa0JBQWtCLEdBQUcsT0FBT0YsRUFBRSxDQUFDSCxPQUFILElBQWMsT0FBZCxHQUF3QkcsRUFBRSxDQUFDRyxFQUFILENBQU1DLGNBQU4sRUFBeEIsR0FBaURKLEVBQUUsQ0FBQ0csRUFBSCxDQUFNRSxjQUFOLEVBQXhELEdBQWlGQyxTQUExRztBQUNBLElBQUlDLEtBQUssR0FBRztBQUNWQyxFQUFBQSxNQUFNLEVBQUUsSUFERTtBQUVWQyxFQUFBQSxJQUFJLEVBQUUsSUFGSTtBQUdWQyxFQUFBQSxLQUFLLEVBQUUsSUFIRztBQUlWQyxFQUFBQSxHQUFHLEVBQUUsSUFKSztBQUtWQyxFQUFBQSxNQUFNLEVBQUUsSUFMRTtBQU1WQyxFQUFBQSxLQUFLLEVBQUUsSUFORztBQU9WQyxFQUFBQSxXQUFXLEVBQUUsSUFQSDtBQVFWQyxFQUFBQSxZQUFZLEVBQUUsSUFSSjtBQVNWQyxFQUFBQSxlQUFlLEVBQUUsSUFUUDtBQVVWQyxFQUFBQSxnQkFBZ0IsRUFBRSxJQVZSO0FBV1ZDLEVBQUFBLE1BQU0sRUFBRSxJQVhFO0FBWVZDLEVBQUFBLE1BQU0sRUFBRSxJQVpFO0FBYVZDLEVBQUFBLHVCQUF1QixFQUFFLElBYmY7QUFjVkMsRUFBQUEsdUJBQXVCLEVBQUUsSUFkZjs7QUFnQlY7QUFDQUMsRUFBQUEsT0FBTyxFQUFFLEdBakJDO0FBa0JWQyxFQUFBQSxZQUFZLEVBQUUsSUFsQko7QUFtQlZDLEVBQUFBLE9BQU8sRUFBRSxJQW5CQztBQW9CVkMsRUFBQUEsY0FBYyxFQUFFLElBcEJOO0FBcUJWQyxFQUFBQSxNQUFNLEVBQUUsQ0FyQkU7O0FBdUJWOztBQUVBO0FBQ0E7QUFDQUMsRUFBQUEsZUFBZSxFQUFFLE9BQU8sYUFBUCxHQUF1QixJQTNCOUI7O0FBNkJWO0FBQ0E7QUFDQUMsRUFBQUEsSUFBSSxFQUFFLElBL0JJOztBQWlDVjtBQUNBO0FBQ0FDLEVBQUFBLE9BQU8sRUFBRSxJQW5DQzs7QUFxQ1Y7QUFDQTtBQUNBQyxFQUFBQSxLQUFLLEVBQUUsT0FBTyxNQUFQLEdBQWdCLElBdkNiOztBQXlDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQyxFQUFBQSxTQUFTLEVBQUUsT0FBTzdCLGtCQUFQLEdBQTRCLElBaEQ3Qjs7QUFrRFY7QUFDQTtBQUNBOEIsRUFBQUEsa0JBQWtCLEVBQUUsQ0FBQyxJQUFELEdBQVEsRUFBUixHQUFhLElBcER2Qjs7QUFzRFY7QUFDQTtBQUNBQyxFQUFBQSxXQUFXLEVBQUUsT0FBTyxJQUFQLEdBQWMsYUF4RGpCOztBQTBEVjtBQUNBQyxFQUFBQSxZQUFZLEVBQUUsUUFBUSxDQUFSLEdBQVksSUEzRGhCOztBQTZEVjtBQUNBQyxFQUFBQSxXQUFXLEVBQUUsUUFBUSxDQUFSLEdBQVksSUE5RGYsRUFBWjs7O0FBaUVBLElBQUksS0FBSixFQUFXO0FBQ1Q1QixFQUFBQSxLQUFLLEdBQUdmLENBQUMsQ0FBQzRDLE1BQUYsQ0FBUzdCLEtBQVQsRUFBZ0I7QUFDdEI4QixJQUFBQSxpQkFBaUIsRUFBRSxDQURHO0FBRXRCQyxJQUFBQSxnQkFBZ0IsRUFBRSxDQUZJLEVBQWhCLENBQVI7O0FBSUQsQ0FMRCxNQUtPLElBQUksSUFBSixFQUFVO0FBQ2YvQixFQUFBQSxLQUFLLEdBQUdmLENBQUMsQ0FBQzRDLE1BQUYsQ0FBUzdCLEtBQVQsRUFBZ0I7QUFDdEJnQyxJQUFBQSx1QkFBdUIsRUFBRSxJQURIO0FBRXRCQyxJQUFBQSx1QkFBdUIsRUFBRSxJQUZIO0FBR3RCQyxJQUFBQSxzQkFBc0IsRUFBRSxJQUhGO0FBSXRCQyxJQUFBQSxzQkFBc0IsRUFBRSxJQUpGO0FBS3RCQyxJQUFBQSxTQUFTLEVBQUUsS0FMVztBQU10QkMsSUFBQUEsWUFBWSxFQUFFLEtBTlEsRUFBaEIsQ0FBUjs7QUFRRDs7QUFFRCxTQUFTQyxPQUFULENBQWlCQyxJQUFqQixFQUF1QjtBQUNyQixNQUFJLENBQUNBLElBQUwsRUFBVyxDQUFDLE9BQU9BLElBQVAsQ0FBYTtBQUN6QixTQUFPQSxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVFDLFdBQVIsS0FBd0JELElBQUksQ0FBQ0UsTUFBTCxDQUFZLENBQVosQ0FBL0I7QUFDRDs7QUFFRCxTQUFTQyxZQUFULENBQXNCQyxPQUF0QixFQUErQjtBQUM3QixTQUFPLENBQUN2RCxLQUFLLENBQUN3RCxtQkFBTixDQUEwQkQsT0FBMUIsS0FBc0N2RCxLQUFLLENBQUN5RCxpQkFBN0M7QUFDUCxLQURPLEdBQ0RGLE9BRE47QUFFRDs7QUFFRHRELE9BQU8sQ0FBQ3lELENBQVIsR0FBWSxVQUFVQyxJQUFWLEVBQWdCQyxTQUFoQixFQUEyQkMsVUFBM0IsRUFBdUM7QUFDakQsTUFBSUMsTUFBTSxHQUFHLENBQUNGLFNBQVMsSUFBSSxFQUFkLEVBQWtCRSxNQUFsQixJQUE0QixFQUF6QztBQUNBLE1BQUlDLE9BQU8sR0FBR0QsTUFBTSxDQUFDQyxPQUFQLElBQWtCLEVBQWhDO0FBQ0EsTUFBSUMsU0FBUyxHQUFHLEVBQWhCO0FBQ0EsTUFBSUMsV0FBVyxHQUFHLEVBQWxCO0FBQ0EsTUFBSUMsR0FBSjs7QUFFQSxNQUFJSCxPQUFPLENBQUNJLElBQVosRUFBa0I7QUFDaEJELElBQUFBLEdBQUcsR0FBR3BFLE9BQU8sQ0FBQyxpQkFBaUJpRSxPQUFPLENBQUNJLElBQTFCLENBQWI7QUFDQUgsSUFBQUEsU0FBUyxDQUFDSSxJQUFWLEdBQWlCLFVBQVVDLE1BQVYsRUFBa0JDLEtBQWxCLEVBQXlCQyxJQUF6QixFQUErQjtBQUM5QyxhQUFPTCxHQUFHLENBQUNFLElBQUosQ0FBU0MsTUFBVCxFQUFpQkMsS0FBakIsRUFBd0JDLElBQXhCLENBQVA7QUFDRCxLQUZEO0FBR0QsR0FMRCxNQUtPO0FBQ0xQLElBQUFBLFNBQVMsQ0FBQ0ksSUFBVixHQUFpQixVQUFVQyxNQUFWLEVBQWtCQyxLQUFsQixFQUF5QkMsSUFBekIsRUFBK0I7QUFDOUNsRSxNQUFBQSxFQUFFLENBQUNtRSxHQUFILENBQU9DLElBQVAsQ0FBWSxrQkFBa0JKLE1BQWxCLEdBQTJCLCtEQUF2QztBQUNBaEUsTUFBQUEsRUFBRSxDQUFDbUUsR0FBSCxDQUFPQyxJQUFQLENBQVksWUFBWUMsSUFBSSxDQUFDQyxTQUFMLENBQWVMLEtBQUssQ0FBQ00sTUFBTixFQUFmLENBQXhCO0FBQ0QsS0FIRDtBQUlEO0FBQ0RaLEVBQUFBLFNBQVMsQ0FBQ2EsUUFBVixHQUFxQmYsTUFBTSxDQUFDZSxRQUE1Qjs7QUFFQTtBQUNBLE1BQUloQixVQUFKLEVBQWdCLENBQUNJLFdBQVcsQ0FBQ0osVUFBWixHQUF5QkEsVUFBekIsQ0FBcUM7O0FBRXREO0FBQ0EsTUFBSUssR0FBRyxJQUFJckUsQ0FBQyxDQUFDaUYsVUFBRixDQUFhWixHQUFHLENBQUNhLGlCQUFqQixDQUFYLEVBQWdEO0FBQzlDakIsSUFBQUEsTUFBTSxHQUFHSSxHQUFHLENBQUNhLGlCQUFKLENBQXNCakIsTUFBdEIsRUFBOEJILElBQTlCLEtBQXVDRyxNQUFoRDtBQUNEOztBQUVEO0FBQ0EsTUFBSWtCLEtBQUssR0FBR2pGLFFBQVEsQ0FBQ2lGLEtBQVQsQ0FBZXZDLE1BQWYsQ0FBc0J1QixTQUF0QixFQUFpQ0MsV0FBakMsQ0FBWjtBQUNBZSxFQUFBQSxLQUFLLENBQUNDLFNBQU4sQ0FBZ0JuQixNQUFoQixHQUF5QkEsTUFBekI7O0FBRUE7QUFDQSxNQUFJakUsQ0FBQyxDQUFDaUYsVUFBRixDQUFhbEIsU0FBUyxDQUFDc0IsV0FBdkIsQ0FBSixFQUF5QztBQUN2Q0YsSUFBQUEsS0FBSyxHQUFHcEIsU0FBUyxDQUFDc0IsV0FBVixDQUFzQkYsS0FBdEIsS0FBZ0NBLEtBQXhDO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJZCxHQUFHLElBQUlyRSxDQUFDLENBQUNpRixVQUFGLENBQWFaLEdBQUcsQ0FBQ2lCLGdCQUFqQixDQUFYLEVBQStDO0FBQzdDakIsSUFBQUEsR0FBRyxDQUFDaUIsZ0JBQUosQ0FBcUJILEtBQXJCLEVBQTRCckIsSUFBNUI7QUFDRDs7QUFFRCxTQUFPcUIsS0FBUDtBQUNELENBM0NEOztBQTZDQS9FLE9BQU8sQ0FBQ21GLENBQVIsR0FBWSxVQUFVekIsSUFBVixFQUFnQkMsU0FBaEIsRUFBMkJVLEtBQTNCLEVBQWtDO0FBQzVDLE1BQUlOLFNBQVMsR0FBRyxFQUFFTSxLQUFLLEVBQUVBLEtBQVQsRUFBaEI7QUFDQSxNQUFJUixNQUFNLEdBQUcsQ0FBQ1EsS0FBSyxHQUFHQSxLQUFLLENBQUNXLFNBQU4sQ0FBZ0JuQixNQUFuQixHQUE0QixFQUFsQyxLQUF5QyxFQUF0RDtBQUNBLE1BQUlJLEdBQUo7O0FBRUEsTUFBSUosTUFBTSxDQUFDQyxPQUFQLElBQWtCRCxNQUFNLENBQUNDLE9BQVAsQ0FBZUksSUFBckMsRUFBMkM7QUFDekNELElBQUFBLEdBQUcsR0FBR3BFLE9BQU8sQ0FBQyxpQkFBaUJnRSxNQUFNLENBQUNDLE9BQVAsQ0FBZUksSUFBakMsQ0FBYjtBQUNBSCxJQUFBQSxTQUFTLENBQUNJLElBQVYsR0FBaUIsVUFBVUMsTUFBVixFQUFrQkMsS0FBbEIsRUFBeUJDLElBQXpCLEVBQStCO0FBQzlDLGFBQU9MLEdBQUcsQ0FBQ0UsSUFBSixDQUFTQyxNQUFULEVBQWlCQyxLQUFqQixFQUF3QkMsSUFBeEIsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQUxELE1BS087QUFDTFAsSUFBQUEsU0FBUyxDQUFDSSxJQUFWLEdBQWlCLFVBQVVDLE1BQVYsRUFBa0JDLEtBQWxCLEVBQXlCQyxJQUF6QixFQUErQjtBQUM5Q2xFLE1BQUFBLEVBQUUsQ0FBQ21FLEdBQUgsQ0FBT0MsSUFBUCxDQUFZLGtCQUFrQkosTUFBbEIsR0FBMkIsb0VBQXZDO0FBQ0FoRSxNQUFBQSxFQUFFLENBQUNtRSxHQUFILENBQU9DLElBQVAsQ0FBWSxZQUFZQyxJQUFJLENBQUNDLFNBQUwsQ0FBZUwsS0FBSyxDQUFDTSxNQUFOLEVBQWYsQ0FBeEI7QUFDRCxLQUhEO0FBSUQ7O0FBRUQsTUFBSVMsVUFBVSxHQUFHdEYsUUFBUSxDQUFDc0YsVUFBVCxDQUFvQjVDLE1BQXBCLENBQTJCdUIsU0FBM0IsQ0FBakI7QUFDQXFCLEVBQUFBLFVBQVUsQ0FBQ0osU0FBWCxDQUFxQm5CLE1BQXJCLEdBQThCQSxNQUE5Qjs7QUFFQTtBQUNBLE1BQUlqRSxDQUFDLENBQUNpRixVQUFGLENBQWFsQixTQUFTLENBQUMwQixnQkFBdkIsQ0FBSixFQUE4QztBQUM1Q0QsSUFBQUEsVUFBVSxHQUFHekIsU0FBUyxDQUFDMEIsZ0JBQVYsQ0FBMkJELFVBQTNCLEtBQTBDQSxVQUF2RDtBQUNEOztBQUVEO0FBQ0EsTUFBSW5CLEdBQUcsSUFBSXJFLENBQUMsQ0FBQ2lGLFVBQUYsQ0FBYVosR0FBRyxDQUFDcUIscUJBQWpCLENBQVgsRUFBb0Q7QUFDbERyQixJQUFBQSxHQUFHLENBQUNxQixxQkFBSixDQUEwQkYsVUFBMUI7QUFDRDs7QUFFRCxTQUFPQSxVQUFQO0FBQ0QsQ0EvQkQ7O0FBaUNBcEYsT0FBTyxDQUFDTyxFQUFSLEdBQWEsRUFBYjtBQUNBUCxPQUFPLENBQUNPLEVBQVIsQ0FBV2dGLE1BQVgsR0FBb0IsVUFBVUMsVUFBVixFQUFzQmxDLE9BQXRCLEVBQStCZ0IsSUFBL0IsRUFBcUM7QUFDdkRBLEVBQUFBLElBQUksR0FBR0EsSUFBSSxJQUFJLEVBQWY7O0FBRUE7QUFDQSxNQUFJbUIsUUFBSixFQUFjQyxFQUFkO0FBQ0EsTUFBSUMsS0FBSyxHQUFHckMsT0FBTyxDQUFDc0MsS0FBUixDQUFjLEdBQWQsQ0FBWjtBQUNBLE1BQUlELEtBQUssQ0FBQ0UsTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUN0QkosSUFBQUEsUUFBUSxHQUFHbkMsT0FBWDtBQUNBb0MsSUFBQUEsRUFBRSxHQUFHcEIsSUFBSSxDQUFDb0IsRUFBTCxJQUFXM0YsS0FBSyxDQUFDd0QsbUJBQU4sQ0FBMEJrQyxRQUExQixDQUFYLElBQWtEMUYsS0FBSyxDQUFDeUQsaUJBQTdEO0FBQ0QsR0FIRCxNQUdPLElBQUltQyxLQUFLLENBQUNFLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUMzQkosSUFBQUEsUUFBUSxHQUFHRSxLQUFLLENBQUNBLEtBQUssQ0FBQ0UsTUFBTixHQUFlLENBQWhCLENBQWhCO0FBQ0FILElBQUFBLEVBQUUsR0FBR0MsS0FBSyxDQUFDRyxLQUFOLENBQVksQ0FBWixFQUFlSCxLQUFLLENBQUNFLE1BQU4sR0FBZSxDQUE5QixFQUFpQ0UsSUFBakMsQ0FBc0MsR0FBdEMsQ0FBTDtBQUNELEdBSE0sTUFHQTtBQUNMLFVBQU0seUVBQU47QUFDRDtBQUNEekIsRUFBQUEsSUFBSSxDQUFDaEIsT0FBTCxHQUFlb0MsRUFBRSxHQUFHLEdBQUwsR0FBV0QsUUFBMUI7QUFDQUEsRUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUMsQ0FBRCxDQUFSLENBQVl0QyxXQUFaLEtBQTRCc0MsUUFBUSxDQUFDckMsTUFBVCxDQUFnQixDQUFoQixDQUF2Qzs7QUFFQTtBQUNBLE1BQUk0QyxLQUFLLEdBQUdoRyxPQUFPLENBQUNpRyxXQUFSLENBQW9CVCxVQUFwQixFQUFnQ2xCLElBQWhDLENBQVo7O0FBRUE7QUFDQSxTQUFPNEIsSUFBSSxDQUFDUixFQUFELENBQUosQ0FBUyxXQUFXRCxRQUFwQixFQUE4Qk8sS0FBOUIsQ0FBUDtBQUNELENBdkJEOztBQXlCQWhHLE9BQU8sQ0FBQ2lHLFdBQVIsR0FBc0IsVUFBVVQsVUFBVixFQUFzQmxCLElBQXRCLEVBQTRCTSxRQUE1QixFQUFzQztBQUMxRCxNQUFJdUIsT0FBSixFQUFhN0MsT0FBYjs7QUFFQTtBQUNBO0FBQ0EsTUFBSSxDQUFDZ0IsSUFBTCxFQUFXLENBQUMsT0FBTyxFQUFQLENBQVc7O0FBRXZCO0FBQ0EsTUFBSTFFLENBQUMsQ0FBQ3dHLE9BQUYsQ0FBVTlCLElBQUksQ0FBQzZCLE9BQWYsQ0FBSixFQUE2QjtBQUMzQkEsSUFBQUEsT0FBTyxHQUFHN0IsSUFBSSxDQUFDNkIsT0FBTCxDQUFhTCxLQUFiLENBQW1CLENBQW5CLENBQVY7QUFDRCxHQUZELE1BRU8sSUFBSWxHLENBQUMsQ0FBQ3lHLFFBQUYsQ0FBVy9CLElBQUksQ0FBQzZCLE9BQWhCLENBQUosRUFBOEI7QUFDbkNBLElBQUFBLE9BQU8sR0FBRzdCLElBQUksQ0FBQzZCLE9BQUwsQ0FBYVAsS0FBYixDQUFtQixLQUFuQixDQUFWO0FBQ0QsR0FGTSxNQUVBO0FBQ0xPLElBQUFBLE9BQU8sR0FBRyxFQUFWO0FBQ0Q7O0FBRUQ7QUFDQTdDLEVBQUFBLE9BQU8sR0FBR2dCLElBQUksQ0FBQ2hCLE9BQWY7QUFDQSxNQUFJQSxPQUFPLElBQUlBLE9BQU8sQ0FBQ2dELE9BQVIsQ0FBZ0IsR0FBaEIsTUFBeUIsQ0FBQyxDQUF6QyxFQUE0QztBQUMxQ2hELElBQUFBLE9BQU8sR0FBR0QsWUFBWSxDQUFDQyxPQUFELENBQXRCO0FBQ0Q7O0FBRUQ7O0FBRUE7QUFDQSxNQUFJaUQsVUFBSjtBQUNBLE1BQUlmLFVBQVUsSUFBSTVGLENBQUMsQ0FBQzRHLFFBQUYsQ0FBV2hCLFVBQVgsQ0FBbEIsRUFBMEM7QUFDeENlLElBQUFBLFVBQVUsR0FBRzFHLE9BQU8sQ0FBQyxvQkFBb0IyRixVQUFVLENBQUNpQixRQUEvQjtBQUNyQixjQURxQixHQUNSakIsVUFBVSxDQUFDOUIsSUFESixDQUFwQjtBQUVELEdBSEQsTUFHTztBQUNMNkMsSUFBQUEsVUFBVSxHQUFHMUcsT0FBTyxDQUFDLG1CQUFtQjJGLFVBQXBCLENBQXBCO0FBQ0Q7QUFDRCxNQUFJa0IsVUFBVSxHQUFHLEVBQWpCOztBQUVBO0FBQ0EsTUFBSUMsQ0FBSixFQUFPQyxHQUFQO0FBQ0EsT0FBS0QsQ0FBQyxHQUFHLENBQUosRUFBT0MsR0FBRyxHQUFHTCxVQUFVLENBQUNWLE1BQTdCLEVBQXFDYyxDQUFDLEdBQUdDLEdBQXpDLEVBQThDRCxDQUFDLEVBQS9DLEVBQW1EO0FBQ2pELFFBQUlYLEtBQUssR0FBR08sVUFBVSxDQUFDSSxDQUFELENBQXRCOztBQUVBO0FBQ0EsUUFBSUUsUUFBUSxHQUFHYixLQUFLLENBQUNjLEdBQXJCO0FBQ0EsUUFBSWQsS0FBSyxDQUFDZSxLQUFOLElBQWVGLFFBQVEsQ0FBQ1AsT0FBVCxDQUFpQixHQUFqQixNQUEwQixDQUFDLENBQTlDLEVBQWlEO0FBQy9DTyxNQUFBQSxRQUFRLEdBQUcsQ0FBQzlHLEtBQUssQ0FBQ3dELG1CQUFOLENBQTBCc0QsUUFBMUI7QUFDWjlHLE1BQUFBLEtBQUssQ0FBQ3lELGlCQURLLElBQ2dCLEdBRGhCLEdBQ3NCcUQsUUFEakM7QUFFRDs7QUFFRDtBQUNBLFFBQUliLEtBQUssQ0FBQ2dCLElBQU4sSUFBYzFDLElBQUksQ0FBQzJDLEVBQW5CLElBQXlCakIsS0FBSyxDQUFDYyxHQUFOLEtBQWN4QyxJQUFJLENBQUMyQyxFQUE1QztBQUNKakIsSUFBQUEsS0FBSyxDQUFDa0IsT0FBTixJQUFpQnRILENBQUMsQ0FBQ3VILFFBQUYsQ0FBV2hCLE9BQVgsRUFBb0JILEtBQUssQ0FBQ2MsR0FBMUIsQ0FEakIsRUFDaUQ7QUFDL0M7QUFDRCxLQUhELE1BR08sSUFBSWQsS0FBSyxDQUFDZSxLQUFWLEVBQWlCO0FBQ3RCLFVBQUlmLEtBQUssQ0FBQ2MsR0FBTixDQUFVUixPQUFWLENBQWtCLEdBQWxCLE1BQTJCLENBQUMsQ0FBaEMsRUFBbUM7QUFDakNOLFFBQUFBLEtBQUssQ0FBQ2MsR0FBTixHQUFZekQsWUFBWSxDQUFDMkMsS0FBSyxDQUFDYyxHQUFQLENBQXhCO0FBQ0Q7QUFDRCxVQUFJZCxLQUFLLENBQUNjLEdBQU4sS0FBY3hELE9BQWxCLEVBQTJCLENBQUMsU0FBVTtBQUN2QyxLQUxNLE1BS0E7QUFDTDtBQUNBO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJMEMsS0FBSyxDQUFDb0IsT0FBTixJQUFpQnBCLEtBQUssQ0FBQ29CLE9BQU4sQ0FBY0MsVUFBL0I7QUFDSixLQUFDckgsT0FBTyxDQUFDZ0csS0FBSyxDQUFDb0IsT0FBTixDQUFjQyxVQUFmLENBRFIsRUFDb0M7QUFDbEM7QUFDRDs7QUFFRDtBQUNBLFFBQUlyQixLQUFLLENBQUNvQixPQUFOLElBQWlCcEIsS0FBSyxDQUFDb0IsT0FBTixDQUFjRSxFQUEvQjtBQUNKdEIsSUFBQUEsS0FBSyxDQUFDb0IsT0FBTixDQUFjRSxFQUFkLENBQWlCQyxJQUFqQixHQUF3QkMsV0FBeEIsT0FBMEMsT0FBMUM7QUFDQXhCLElBQUFBLEtBQUssQ0FBQ29CLE9BQU4sQ0FBY0UsRUFBZCxDQUFpQmhCLE9BQWpCLENBQXlCLGVBQXpCLE1BQThDLENBQUMsQ0FBL0M7QUFDQXRHLElBQUFBLE9BQU8sQ0FBQ3lILE9BQVIsQ0FBZ0J6QixLQUFLLENBQUNvQixPQUFOLENBQWNFLEVBQWQsQ0FBaUIxQixLQUFqQixDQUF1QixHQUF2QixFQUE0QixDQUE1QixDQUFoQixNQUFvRCxLQUhoRCxDQUFKLEVBRzREO0FBQzFEO0FBQ0Q7O0FBRUQ7QUFDQTVGLElBQUFBLE9BQU8sQ0FBQzBILFVBQVIsQ0FBbUIsSUFBbkIsRUFBeUJoQixVQUF6QixFQUFxQ1YsS0FBSyxDQUFDQSxLQUEzQztBQUNEOztBQUVEOztBQUVBO0FBQ0EsTUFBSTJCLFVBQVUsR0FBRy9ILENBQUMsQ0FBQ2dJLElBQUYsQ0FBT3RELElBQVAsRUFBYTtBQUM5QnZFLEVBQUFBLEtBQUssQ0FBQzhILGNBRHdCO0FBRTlCOUgsRUFBQUEsS0FBSyxDQUFDK0gsZ0JBRndCLENBQWIsQ0FBakI7O0FBSUE5SCxFQUFBQSxPQUFPLENBQUMwSCxVQUFSLENBQW1CLElBQW5CLEVBQXlCaEIsVUFBekIsRUFBcUNpQixVQUFyQztBQUNBakIsRUFBQUEsVUFBVSxDQUFDM0csS0FBSyxDQUFDOEgsY0FBUCxDQUFWLEdBQW1DMUIsT0FBbkM7QUFDQU8sRUFBQUEsVUFBVSxDQUFDM0csS0FBSyxDQUFDK0gsZ0JBQVAsQ0FBVixHQUFxQ3hFLE9BQXJDOztBQUVBLE1BQUlqRCxXQUFKLEVBQWlCLENBQUMsT0FBT3FHLFVBQVUsQ0FBQzNHLEtBQUssQ0FBQytILGdCQUFQLENBQWpCLENBQTJDOztBQUU3RCxTQUFPbEQsUUFBUSxHQUFHaEYsQ0FBQyxDQUFDZ0YsUUFBRixDQUFXOEIsVUFBWCxFQUF1QjlCLFFBQXZCLENBQUgsR0FBc0M4QixVQUFyRDtBQUNELENBNUZEOztBQThGQSxTQUFTcUIsWUFBVCxDQUFzQnZDLFVBQXRCLEVBQWtDd0MsS0FBbEMsRUFBeUM3QixPQUF6QyxFQUFrRDdCLElBQWxELEVBQXdETSxRQUF4RCxFQUFrRTtBQUNoRU4sRUFBQUEsSUFBSSxHQUFHQSxJQUFJLElBQUksRUFBZjtBQUNBQSxFQUFBQSxJQUFJLENBQUM2QixPQUFMLEdBQWVBLE9BQWY7QUFDQSxNQUFJNkIsS0FBSyxDQUFDMUUsT0FBVixFQUFtQixDQUFDZ0IsSUFBSSxDQUFDaEIsT0FBTCxHQUFlMEUsS0FBSyxDQUFDMUUsT0FBckIsQ0FBOEI7QUFDbEQsTUFBSTBFLEtBQUssQ0FBQ2YsRUFBVixFQUFjLENBQUMzQyxJQUFJLENBQUMyQyxFQUFMLEdBQVVlLEtBQUssQ0FBQ2YsRUFBaEIsQ0FBb0I7QUFDbkNlLEVBQUFBLEtBQUssQ0FBQ0MsZUFBTixDQUFzQmpJLE9BQU8sQ0FBQ2lHLFdBQVIsQ0FBb0JULFVBQXBCLEVBQWdDbEIsSUFBaEMsRUFBc0NNLFFBQXRDLENBQXRCO0FBQ0EsTUFBSSxJQUFKLEVBQVUsQ0FBQ29ELEtBQUssQ0FBQzdCLE9BQU4sR0FBZ0JBLE9BQWhCLENBQXlCO0FBQ3JDOztBQUVEbkcsT0FBTyxDQUFDa0ksUUFBUixHQUFtQixVQUFVMUMsVUFBVixFQUFzQndDLEtBQXRCLEVBQTZCN0IsT0FBN0IsRUFBc0M3QixJQUF0QyxFQUE0Qzs7QUFFN0Q7QUFDQSxNQUFJLENBQUM2QixPQUFMLEVBQWM7QUFDWixRQUFJN0IsSUFBSixFQUFVO0FBQ1IsVUFBSWpFLFdBQUosRUFBaUIsQ0FBQyxPQUFPaUUsSUFBSSxDQUFDaEIsT0FBWixDQUFxQjtBQUN2QzBFLE1BQUFBLEtBQUssQ0FBQ0MsZUFBTixDQUFzQjNELElBQXRCO0FBQ0Q7QUFDRDtBQUNELEdBTkQsTUFNTztBQUNMO0FBQ0EsUUFBSTZELFFBQVEsR0FBR0gsS0FBSyxDQUFDakksS0FBSyxDQUFDOEgsY0FBUCxDQUFMLElBQStCLEVBQTlDO0FBQ0EsUUFBSU8sU0FBUyxHQUFHRCxRQUFRLENBQUN0QyxNQUF6QjtBQUNBTSxJQUFBQSxPQUFPLEdBQUd2RyxDQUFDLENBQUN5RyxRQUFGLENBQVdGLE9BQVgsSUFBc0JBLE9BQU8sQ0FBQ1AsS0FBUixDQUFjLEtBQWQsQ0FBdEIsR0FBNkNPLE9BQXZEO0FBQ0EsUUFBSWtDLFVBQVUsR0FBR3pJLENBQUMsQ0FBQzBJLEtBQUYsQ0FBUUgsUUFBUixFQUFrQmhDLE9BQU8sSUFBSSxFQUE3QixDQUFqQjs7QUFFQTtBQUNBLFFBQUlpQyxTQUFTLEtBQUtDLFVBQVUsQ0FBQ3hDLE1BQTdCLEVBQXFDO0FBQ25DLFVBQUl2QixJQUFKLEVBQVU7QUFDUixZQUFJakUsV0FBSixFQUFpQixDQUFDLE9BQU9pRSxJQUFJLENBQUNoQixPQUFaLENBQXFCO0FBQ3ZDMEUsUUFBQUEsS0FBSyxDQUFDQyxlQUFOLENBQXNCM0QsSUFBdEI7QUFDRDtBQUNEO0FBQ0QsS0FORCxNQU1PO0FBQ0x5RCxNQUFBQSxZQUFZLENBQUN2QyxVQUFELEVBQWF3QyxLQUFiLEVBQW9CSyxVQUFwQixFQUFnQy9ELElBQWhDLENBQVo7QUFDRDtBQUNGO0FBQ0YsQ0EzQkQ7O0FBNkJBdEUsT0FBTyxDQUFDdUksV0FBUixHQUFzQixVQUFVL0MsVUFBVixFQUFzQndDLEtBQXRCLEVBQTZCN0IsT0FBN0IsRUFBc0M3QixJQUF0QyxFQUE0QztBQUNoRTZCLEVBQUFBLE9BQU8sR0FBR0EsT0FBTyxJQUFJLEVBQXJCO0FBQ0EsTUFBSWdDLFFBQVEsR0FBR0gsS0FBSyxDQUFDakksS0FBSyxDQUFDOEgsY0FBUCxDQUFMLElBQStCLEVBQTlDO0FBQ0EsTUFBSU8sU0FBUyxHQUFHRCxRQUFRLENBQUN0QyxNQUF6Qjs7QUFFQTtBQUNBLE1BQUksQ0FBQ3VDLFNBQUQsSUFBYyxDQUFDakMsT0FBTyxDQUFDTixNQUEzQixFQUFtQztBQUNqQyxRQUFJdkIsSUFBSixFQUFVO0FBQ1IsVUFBSWpFLFdBQUosRUFBaUIsQ0FBQyxPQUFPaUUsSUFBSSxDQUFDaEIsT0FBWixDQUFxQjtBQUN2QzBFLE1BQUFBLEtBQUssQ0FBQ0MsZUFBTixDQUFzQjNELElBQXRCO0FBQ0Q7QUFDRDtBQUNELEdBTkQsTUFNTztBQUNMO0FBQ0E2QixJQUFBQSxPQUFPLEdBQUd2RyxDQUFDLENBQUN5RyxRQUFGLENBQVdGLE9BQVgsSUFBc0JBLE9BQU8sQ0FBQ1AsS0FBUixDQUFjLEtBQWQsQ0FBdEIsR0FBNkNPLE9BQXZEO0FBQ0EsUUFBSWtDLFVBQVUsR0FBR3pJLENBQUMsQ0FBQzRJLFVBQUYsQ0FBYUwsUUFBYixFQUF1QmhDLE9BQXZCLENBQWpCOztBQUVBO0FBQ0EsUUFBSWlDLFNBQVMsS0FBS0MsVUFBVSxDQUFDeEMsTUFBN0IsRUFBcUM7QUFDbkMsVUFBSXZCLElBQUosRUFBVTtBQUNSLFlBQUlqRSxXQUFKLEVBQWlCLENBQUMsT0FBT2lFLElBQUksQ0FBQ2hCLE9BQVosQ0FBcUI7QUFDdkMwRSxRQUFBQSxLQUFLLENBQUNDLGVBQU4sQ0FBc0IzRCxJQUF0QjtBQUNEO0FBQ0Q7QUFDRCxLQU5ELE1BTU87QUFDTHlELE1BQUFBLFlBQVksQ0FBQ3ZDLFVBQUQsRUFBYXdDLEtBQWIsRUFBb0JLLFVBQXBCLEVBQWdDL0QsSUFBaEMsRUFBc0MzRCxLQUF0QyxDQUFaO0FBQ0Q7QUFDRjtBQUNGLENBNUJEOztBQThCQVgsT0FBTyxDQUFDeUksVUFBUixHQUFxQixVQUFVakQsVUFBVixFQUFzQndDLEtBQXRCLEVBQTZCN0IsT0FBN0IsRUFBc0M3QixJQUF0QyxFQUE0QztBQUMvRDZCLEVBQUFBLE9BQU8sR0FBR0EsT0FBTyxJQUFJLEVBQXJCO0FBQ0FBLEVBQUFBLE9BQU8sR0FBR3ZHLENBQUMsQ0FBQ3lHLFFBQUYsQ0FBV0YsT0FBWCxJQUFzQkEsT0FBTyxDQUFDUCxLQUFSLENBQWMsS0FBZCxDQUF0QixHQUE2Q08sT0FBdkQ7QUFDQTRCLEVBQUFBLFlBQVksQ0FBQ3ZDLFVBQUQsRUFBYXdDLEtBQWIsRUFBb0I3QixPQUFwQixFQUE2QjdCLElBQTdCLEVBQW1DM0QsS0FBbkMsQ0FBWjtBQUNELENBSkQ7O0FBTUE7Ozs7Ozs7OztBQVNBWCxPQUFPLENBQUMwSSxZQUFSLEdBQXVCLFVBQVV6QixFQUFWLEVBQWN2RCxJQUFkLEVBQW9CaUYsSUFBcEIsRUFBMEI7QUFDL0MsTUFBSSxPQUFPakYsSUFBUCxLQUFnQixXQUFoQixJQUErQkEsSUFBSSxLQUFLLElBQXhDO0FBQ0o5RCxFQUFBQSxDQUFDLENBQUM0RyxRQUFGLENBQVc5QyxJQUFYLENBREksSUFDZ0IsQ0FBQzlELENBQUMsQ0FBQ3lHLFFBQUYsQ0FBVzNDLElBQVgsQ0FEckIsRUFDdUM7QUFDckNpRixJQUFBQSxJQUFJLEdBQUdqRixJQUFQO0FBQ0FBLElBQUFBLElBQUksR0FBR3hELGNBQVA7QUFDRDtBQUNELFNBQU8sS0FBS0wsT0FBTyxDQUFDLG9CQUFvQm9ILEVBQXBCLEdBQXlCLGVBQXpCLElBQTRDdkQsSUFBSSxJQUFJeEQsY0FBcEQsQ0FBRCxDQUFaLEVBQW1GeUksSUFBbkYsQ0FBUDtBQUNELENBUEQ7O0FBU0E7Ozs7Ozs7O0FBUUEzSSxPQUFPLENBQUM0SSxnQkFBUixHQUEyQixVQUFVbEYsSUFBVixFQUFnQmlGLElBQWhCLEVBQXNCO0FBQy9DLFNBQU8sS0FBSzlJLE9BQU8sQ0FBQyx3QkFBd0I2RCxJQUF6QixDQUFaLEVBQTRDaUYsSUFBNUMsQ0FBUDtBQUNELENBRkQ7O0FBSUE7Ozs7Ozs7Ozs7O0FBV0EzSSxPQUFPLENBQUM2SSxXQUFSLEdBQXNCLFVBQVVuRixJQUFWLEVBQWdCaUYsSUFBaEIsRUFBc0I7QUFDMUMsU0FBTyxLQUFLOUksT0FBTyxDQUFDLG1CQUFtQm9ELE9BQU8sQ0FBQ1MsSUFBRCxDQUEzQixDQUFQLENBQTBDcUIsS0FBL0MsRUFBc0Q0RCxJQUF0RCxDQUFQO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7Ozs7Ozs7O0FBWUEzSSxPQUFPLENBQUM4SSxnQkFBUixHQUEyQixVQUFVcEYsSUFBVixFQUFnQmlGLElBQWhCLEVBQXNCO0FBQy9DLFNBQU8sS0FBSzlJLE9BQU8sQ0FBQyxtQkFBbUJvRCxPQUFPLENBQUNTLElBQUQsQ0FBM0IsQ0FBUCxDQUEwQzBCLFVBQS9DLEVBQTJEdUQsSUFBM0QsQ0FBUDtBQUNELENBRkQ7O0FBSUEsU0FBU0ksZ0JBQVQsR0FBNEI7QUFDMUIsU0FBT0MsSUFBSSxDQUFDQyxHQUFMO0FBQ1A3SSxFQUFBQSxFQUFFLENBQUM4SSxRQUFILENBQVlDLFdBQVosQ0FBd0JDLGNBRGpCO0FBRVBoSixFQUFBQSxFQUFFLENBQUM4SSxRQUFILENBQVlDLFdBQVosQ0FBd0JFLGFBRmpCO0FBR1AsS0FIQTtBQUlEOztBQUVEOzs7OztBQUtBckosT0FBTyxDQUFDc0osUUFBUixHQUFtQixZQUFZO0FBQzdCLE1BQUksS0FBSixFQUFXO0FBQ1QsV0FBTyxjQUFjLE1BQXJCO0FBQ0QsR0FGRCxNQUVPLElBQUksSUFBSixFQUFVO0FBQ2YsUUFBSUMsR0FBRyxHQUFHbkosRUFBRSxDQUFDOEksUUFBSCxDQUFZTSxPQUFaLENBQW9CQyxvQkFBOUI7QUFDQSxXQUFPRixHQUFHLEtBQUtuSixFQUFFLENBQUM4SSxRQUFILENBQVlNLE9BQVosQ0FBb0JFLDRCQUE1QjtBQUNQSCxJQUFBQSxHQUFHLEtBQUtuSixFQUFFLENBQUM4SSxRQUFILENBQVlNLE9BQVosQ0FBb0JHLDZCQUQ1QjtBQUVELEdBSk0sTUFJQSxJQUFJLEtBQUosRUFBVztBQUNoQixXQUFPWCxJQUFJLENBQUNDLEdBQUw7QUFDUDdJLElBQUFBLEVBQUUsQ0FBQzhJLFFBQUgsQ0FBWUMsV0FBWixDQUF3QkMsY0FEakI7QUFFUGhKLElBQUFBLEVBQUUsQ0FBQzhJLFFBQUgsQ0FBWUMsV0FBWixDQUF3QkUsYUFGakI7QUFHUCxPQUhBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDRCxHQVRNLE1BU0EsSUFBSSxLQUFKLEVBQVc7QUFDaEI7QUFDQTtBQUNBO0FBQ0EsV0FBT0wsSUFBSSxDQUFDWSxHQUFMO0FBQ1B4SixJQUFBQSxFQUFFLENBQUM4SSxRQUFILENBQVlDLFdBQVosQ0FBd0JDLGNBRGpCO0FBRVBoSixJQUFBQSxFQUFFLENBQUM4SSxRQUFILENBQVlDLFdBQVosQ0FBd0JFLGFBRmpCO0FBR1AsUUFIQTtBQUlELEdBUk0sTUFRQTtBQUNMLFdBQU9OLGdCQUFnQixFQUF2QjtBQUNEO0FBQ0YsQ0EzQmtCLEVBQW5COztBQTZCQTs7Ozs7QUFLQS9JLE9BQU8sQ0FBQzZKLFVBQVIsR0FBcUIsQ0FBQzdKLE9BQU8sQ0FBQ3NKLFFBQTlCOztBQUVBOzs7Ozs7Ozs7Ozs7OztBQWNBdEosT0FBTyxDQUFDeUgsT0FBUixHQUFrQixFQUFsQjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7QUFjQXpILE9BQU8sQ0FBQzhKLE1BQVIsR0FBaUIsRUFBakI7O0FBRUE7Ozs7O0FBS0E5SixPQUFPLENBQUM4SixNQUFSLENBQWVDLFFBQWYsR0FBMEIsVUFBVXJHLElBQVYsRUFBZ0I7QUFDeEMsU0FBTzFELE9BQU8sQ0FBQzhKLE1BQVIsQ0FBZXBHLElBQWYsTUFBeUIxRCxPQUFPLENBQUM4SixNQUFSLENBQWVwRyxJQUFmLElBQXVCMUQsT0FBTyxDQUFDNkksV0FBUixDQUFvQm5GLElBQXBCLENBQWhELENBQVA7QUFDRCxDQUZEOztBQUlBOzs7Ozs7Ozs7Ozs7OztBQWNBMUQsT0FBTyxDQUFDZ0ssV0FBUixHQUFzQixFQUF0Qjs7QUFFQTs7Ozs7QUFLQWhLLE9BQU8sQ0FBQ2dLLFdBQVIsQ0FBb0JELFFBQXBCLEdBQStCLFVBQVVyRyxJQUFWLEVBQWdCO0FBQzdDLFNBQU8xRCxPQUFPLENBQUNnSyxXQUFSLENBQW9CdEcsSUFBcEIsTUFBOEIxRCxPQUFPLENBQUNnSyxXQUFSLENBQW9CdEcsSUFBcEIsSUFBNEIxRCxPQUFPLENBQUM4SSxnQkFBUixDQUF5QnBGLElBQXpCLENBQTFELENBQVA7QUFDRCxDQUZEOztBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQTFELE9BQU8sQ0FBQ2lLLEdBQVIsR0FBY3BLLE9BQU8sQ0FBQyxZQUFELENBQXJCOztBQUVBLElBQUksSUFBSixFQUFVO0FBQ1JHLEVBQUFBLE9BQU8sQ0FBQ3dKLE9BQVIsR0FBa0IsRUFBbEI7QUFDQXhKLEVBQUFBLE9BQU8sQ0FBQ3dKLE9BQVIsQ0FBZ0JVLGtCQUFoQixHQUFxQyxDQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLE9BQXRCLEVBQStCLE9BQS9CLEVBQXdDLFlBQXhDLEVBQXNELFdBQXRELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLE1BQXpGLEVBQWlHLGNBQWpHLEVBQWlILGdCQUFqSCxFQUFtSSxTQUFuSSxDQUFyQztBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUFsSyxPQUFPLENBQUMwSCxVQUFSLEdBQXFCLFlBQVk7QUFDL0IsTUFBSXlDLE1BQU0sR0FBR0MsU0FBUyxDQUFDLENBQUQsQ0FBVCxJQUFnQixFQUE3QjtBQUNBLE1BQUl6RCxDQUFDLEdBQUcsQ0FBUjtBQUNBLE1BQUlkLE1BQU0sR0FBR3VFLFNBQVMsQ0FBQ3ZFLE1BQXZCO0FBQ0EsTUFBSXdFLElBQUksR0FBRyxLQUFYO0FBQ0EsTUFBSUMsT0FBSixFQUFhNUcsSUFBYixFQUFtQjZHLEdBQW5CLEVBQXdCQyxJQUF4QixFQUE4QkMsYUFBOUIsRUFBNkNDLEtBQTdDOztBQUVBO0FBQ0EsTUFBSSxPQUFPUCxNQUFQLEtBQWtCLFNBQXRCLEVBQWlDO0FBQy9CRSxJQUFBQSxJQUFJLEdBQUdGLE1BQVA7QUFDQUEsSUFBQUEsTUFBTSxHQUFHQyxTQUFTLENBQUMsQ0FBRCxDQUFULElBQWdCLEVBQXpCO0FBQ0E7QUFDQXpELElBQUFBLENBQUMsR0FBRyxDQUFKO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJLE9BQU93RCxNQUFQLEtBQWtCLFFBQWxCLElBQThCLENBQUN2SyxDQUFDLENBQUNpRixVQUFGLENBQWFzRixNQUFiLENBQW5DLEVBQXlEO0FBQ3ZEQSxJQUFBQSxNQUFNLEdBQUcsRUFBVDtBQUNEOztBQUVELFNBQU94RCxDQUFDLEdBQUdkLE1BQVgsRUFBbUJjLENBQUMsRUFBcEIsRUFBd0I7QUFDdEI7QUFDQTJELElBQUFBLE9BQU8sR0FBR0YsU0FBUyxDQUFDekQsQ0FBRCxDQUFuQjtBQUNBLFFBQUkyRCxPQUFPLElBQUksSUFBZixFQUFxQjtBQUNuQixVQUFJLE9BQU9BLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0JBLFFBQUFBLE9BQU8sR0FBR0EsT0FBTyxDQUFDMUUsS0FBUixDQUFjLEVBQWQsQ0FBVjtBQUNEO0FBQ0Q7QUFDQSxXQUFLbEMsSUFBTCxJQUFhNEcsT0FBYixFQUFzQjtBQUNwQkMsUUFBQUEsR0FBRyxHQUFHSixNQUFNLENBQUN6RyxJQUFELENBQVo7QUFDQThHLFFBQUFBLElBQUksR0FBR0YsT0FBTyxDQUFDNUcsSUFBRCxDQUFkOztBQUVBO0FBQ0EsWUFBSXlHLE1BQU0sS0FBS0ssSUFBZixFQUFxQjtBQUNuQjtBQUNEOztBQUVELFlBQUlILElBQUksSUFBSUcsSUFBUixJQUFnQixDQUFDNUssQ0FBQyxDQUFDaUYsVUFBRixDQUFhMkYsSUFBYixDQUFqQixJQUF1QzVLLENBQUMsQ0FBQzRHLFFBQUYsQ0FBV2dFLElBQVgsQ0FBdkMsS0FBNEQsQ0FBQ0MsYUFBYSxHQUFHN0ssQ0FBQyxDQUFDd0csT0FBRixDQUFVb0UsSUFBVixDQUFqQixLQUFxQyxDQUFDNUssQ0FBQyxDQUFDK0ssR0FBRixDQUFNSCxJQUFOLEVBQVksU0FBWixDQUFsRyxDQUFKLEVBQStIO0FBQzdIO0FBQ0EsY0FBSUMsYUFBSixFQUFtQjtBQUNqQkEsWUFBQUEsYUFBYSxHQUFHLEtBQWhCO0FBQ0FDLFlBQUFBLEtBQUssR0FBR0gsR0FBRyxJQUFJM0ssQ0FBQyxDQUFDd0csT0FBRixDQUFVbUUsR0FBVixDQUFQLEdBQXdCQSxHQUF4QixHQUE4QixFQUF0QztBQUNELFdBSEQsTUFHTyxJQUFJM0ssQ0FBQyxDQUFDZ0wsTUFBRixDQUFTSixJQUFULENBQUosRUFBb0I7QUFDekJFLFlBQUFBLEtBQUssR0FBRyxJQUFJRyxJQUFKLENBQVNMLElBQUksQ0FBQ00sT0FBTCxFQUFULENBQVI7QUFDRCxXQUZNLE1BRUE7QUFDTEosWUFBQUEsS0FBSyxHQUFHSCxHQUFHLElBQUkzSyxDQUFDLENBQUM0RyxRQUFGLENBQVcrRCxHQUFYLENBQVAsR0FBeUJBLEdBQXpCLEdBQStCLEVBQXZDO0FBQ0Q7O0FBRUQ7QUFDQUosVUFBQUEsTUFBTSxDQUFDekcsSUFBRCxDQUFOLEdBQWUxRCxPQUFPLENBQUMwSCxVQUFSLENBQW1CMkMsSUFBbkIsRUFBeUJLLEtBQXpCLEVBQWdDRixJQUFoQyxDQUFmO0FBQ0QsU0FiRCxNQWFPO0FBQ0xMLFVBQUFBLE1BQU0sQ0FBQ3pHLElBQUQsQ0FBTixHQUFlOEcsSUFBZjtBQUNEO0FBQ0Y7QUFDRjtBQUNGOztBQUVEO0FBQ0EsU0FBT0wsTUFBUDtBQUNELENBM0REIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAY2xhc3MgQWxsb3lcbiAqIFRvcC1sZXZlbCBtb2R1bGUgZm9yIEFsbG95IGZ1bmN0aW9ucy5cbiAqXG4gKiBBbGxveSBpcyBhbiBhcHBsaWNhdGlvbiBmcmFtZXdvcmsgYnVpbHQgb24gdG9wIG9mIHRoZSBUaXRhbml1bSBTREsgZGVzaWduZWQgdG8gaGVscCByYXBpZGx5XG4gKiBkZXZlbG9wIGhpZ2ggcXVhbGl0eSBhcHBsaWNhdGlvbnMgYW5kIHJlZHVjZSBtYWludGVuYW5jZS5cbiAqXG4gKiBBbGxveSB1c2VzIHRoZSBtb2RlbC12aWV3LWNvbnRyb2xsZXIgYXJjaGl0ZWN0dXJlIHRvIHNlcGFyYXRlIHRoZSBhcHBsaWNhdGlvbiBpbnRvIHRocmVlXG4gKiBjb21wb25lbnRzOlxuICpcbiAqICAqICoqTW9kZWxzKiogcHJvdmlkZSB0aGUgZGF0YSBvZiB0aGUgYXBwbGljYXRpb24uIEFsbG95IHV0aWxpemVzICoqQmFja2JvbmUgTW9kZWwgYW5kIENvbGxlY3Rpb24qKlxuICogICAgIG9iamVjdHMgZm9yIHRoaXMgZnVuY3Rpb25hbGl0eS5cbiAqXG4gKiAgKiAqKlZpZXdzKiogcHJvdmlkZSB0aGUgVUkgY29tcG9uZW50cyB0byBpbnRlcmFjdCB3aXRoIHRoZSBhcHBsaWNhdGlvbiwgd3JpdHRlbiB1c2luZyAqKlhNTCBtYXJrdXAqKlxuICogICAgYW5kICoqVGl0YW5pdW0gU3R5bGVzaGVldHMgKFRTUykqKiwgd2hpY2ggYWJzdHJhY3RzIHRoZSBVSSBjb21wb25lbnRzIG9mIHRoZSBUaXRhbml1bSBBUEkuXG4gKlxuICogICogKipDb250cm9sbGVycyoqIHByb3ZpZGUgdGhlIGdsdWUgbGF5ZXIgYmV0d2VlbiB0aGUgTW9kZWwgYW5kIFZpZXcgY29tcG9uZW50cyBhcyB3ZWxsIGFzXG4gKiAgICBhZGRpdGlvbmFsIGFwcGxpY2F0aW9uIGxvZ2ljIHVzaW5nIHRoZSAqKkFsbG95IEFQSSoqIGFuZCAqKlRpdGFuaXVtIEFQSSoqLlxuICpcbiAqIFRoZSBBUEkgZG9jdW1lbnRhdGlvbiBwcm92aWRlZCBoZXJlIGlzIHVzZWQgd2l0aCBBbGxveSBDb250cm9sbGVycyBhbmQgV2lkZ2V0IENvbnRyb2xsZXJzIHRvXG4gKiBpbnRlcmFjdCB3aXRoIHRoZSBWaWV3IGFuZCBNb2RlbCBjb21wb25lbnRzIG9mIHRoZSBhcHBsaWNhdGlvbiBvciB3aWRnZXQuXG4gKlxuICogRm9yIGd1aWRlcyBvbiB1c2luZyBBbGxveSwgc2VlXG4gKiBbQWxsb3kgRnJhbWV3b3JrXShodHRwOi8vZG9jcy5hcHBjZWxlcmF0b3IuY29tL3BsYXRmb3JtL2xhdGVzdC8jIS9ndWlkZS9BbGxveV9GcmFtZXdvcmspLlxuICovXG52YXIgXyA9IHJlcXVpcmUoJy9hbGxveS91bmRlcnNjb3JlJykuXyxcbkJhY2tib25lID0gcmVxdWlyZSgnL2FsbG95L2JhY2tib25lJyksXG5DT05TVCA9IHJlcXVpcmUoJy9hbGxveS9jb25zdGFudHMnKTtcblxuZXhwb3J0cy52ZXJzaW9uID0gJzEuMTQuMSc7XG5leHBvcnRzLl8gPSBfO1xuZXhwb3J0cy5CYWNrYm9uZSA9IEJhY2tib25lO1xuXG52YXIgREVGQVVMVF9XSURHRVQgPSAnd2lkZ2V0JztcbnZhciBUSV9WRVJTSU9OID0gVGkudmVyc2lvbjtcbnZhciBNVzMyMF9DSEVDSyA9IGZhbHNlICYmIFRJX1ZFUlNJT04gPj0gJzMuMi4wJztcbnZhciBJREVOVElUWV9UUkFOU0ZPUk0gPSB0cnVlID8gVGkudmVyc2lvbiA+PSAnOC4wLjAnID8gVGkuVUkuY3JlYXRlTWF0cml4MkQoKSA6IFRpLlVJLmNyZWF0ZTJETWF0cml4KCkgOiB1bmRlZmluZWQ7XG52YXIgUkVTRVQgPSB7XG4gIGJvdHRvbTogbnVsbCxcbiAgbGVmdDogbnVsbCxcbiAgcmlnaHQ6IG51bGwsXG4gIHRvcDogbnVsbCxcbiAgaGVpZ2h0OiBudWxsLFxuICB3aWR0aDogbnVsbCxcbiAgc2hhZG93Q29sb3I6IG51bGwsXG4gIHNoYWRvd09mZnNldDogbnVsbCxcbiAgYmFja2dyb3VuZEltYWdlOiBudWxsLFxuICBiYWNrZ3JvdW5kUmVwZWF0OiBudWxsLFxuICBjZW50ZXI6IG51bGwsXG4gIGxheW91dDogbnVsbCxcbiAgYmFja2dyb3VuZFNlbGVjdGVkQ29sb3I6IG51bGwsXG4gIGJhY2tncm91bmRTZWxlY3RlZEltYWdlOiBudWxsLFxuXG4gIC8vIG5vbi1udWxsIHJlc2V0c1xuICBvcGFjaXR5OiAxLjAsXG4gIHRvdWNoRW5hYmxlZDogdHJ1ZSxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgaG9yaXpvbnRhbFdyYXA6IHRydWUsXG4gIHpJbmRleDogMCxcblxuICAvLyMjIyMjIERJU1BBUklUSUVTICMjIyMjLy9cblxuICAvLyBTZXR0aW5nIHRvIFwibnVsbFwiIG9uIGFuZHJvaWQgd29ya3MgdGhlIGZpcnN0IHRpbWUuIExlYXZlcyB0aGUgY29sb3JcbiAgLy8gb24gc3Vic2VxdWVudCBjYWxscy5cbiAgYmFja2dyb3VuZENvbG9yOiB0cnVlID8gJ3RyYW5zcGFyZW50JyA6IG51bGwsXG5cbiAgLy8gY3JlYXRlcyBhIGZvbnQgc2xpZ2h0bHkgZGlmZmVyZW50IChzbWFsbGVyKSB0aGFuIGRlZmF1bHQgb24gaU9TXG4gIC8vIGh0dHBzOi8vamlyYS5hcHBjZWxlcmF0b3Iub3JnL2Jyb3dzZS9USU1PQi0xNDU2NVxuICBmb250OiBudWxsLFxuXG4gIC8vIFRocm93cyBhbiBleGNlcHRpb24gb24gQW5kcm9pZCBpZiBzZXQgdG8gbnVsbC4gV29ya3Mgb24gb3RoZXIgcGxhdGZvcm1zLlxuICAvLyBodHRwczovL2ppcmEuYXBwY2VsZXJhdG9yLm9yZy9icm93c2UvVElNT0ItMTQ1NjZcbiAgdmlzaWJsZTogdHJ1ZSxcblxuICAvLyBTZXR0aW5nIHRvIFwibnVsbFwiIG9uIGFuZHJvaWQgbWFrZXMgdGV4dCB0cmFuc3BhcmVudFxuICAvLyBodHRwczovL2ppcmEuYXBwY2VsZXJhdG9yLm9yZy9icm93c2UvVElNT0ItMTQ1NjdcbiAgY29sb3I6IHRydWUgPyAnIzAwMCcgOiBudWxsLFxuXG4gIC8vIEFuZHJvaWQgd2lsbCBsZWF2ZSBhcnRpZmFjdCBvZiBwcmV2aW91cyB0cmFuc2Zvcm0gdW5sZXNzIHRoZSBpZGVudGl0eSBtYXRyaXggaXNcbiAgLy8gbWFudWFsbHkgcmVzZXQuXG4gIC8vIGh0dHBzOi8vamlyYS5hcHBjZWxlcmF0b3Iub3JnL2Jyb3dzZS9USU1PQi0xNDU2OFxuICAvL1xuICAvLyBNb2JpbGV3ZWIgZG9lcyBub3QgcmVzcGVjdCBtYXRyaXggcHJvcGVydGllcyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yLCBkZXNwaXRlIHRoZVxuICAvLyBkb2N1bWVudGF0aW9uIGF0IGRvY3MuYXBwY2VsZXJhdG9yLmNvbSBpbmRpY2F0aW5nIHRoYXQgaXQgc2hvdWxkLlxuICAvLyBodHRwczovL2ppcmEuYXBwY2VsZXJhdG9yLm9yZy9icm93c2UvVElNT0ItMTQ1NzBcbiAgdHJhbnNmb3JtOiB0cnVlID8gSURFTlRJVFlfVFJBTlNGT1JNIDogbnVsbCxcblxuICAvLyBDcmFzaGVzIGlmIHNldCB0byBudWxsIG9uIGFueXRoaW5nIGJ1dCBBbmRyb2lkXG4gIC8vIGh0dHBzOi8vamlyYS5hcHBjZWxlcmF0b3Iub3JnL2Jyb3dzZS9USU1PQi0xNDU3MVxuICBiYWNrZ3JvdW5kR3JhZGllbnQ6ICF0cnVlID8ge30gOiBudWxsLFxuXG4gIC8vIEFsbCBzdXBwb3J0ZWQgcGxhdGZvcm1zIGhhdmUgdmFyeWluZyBiZWhhdmlvciB3aXRoIGJvcmRlciBwcm9wZXJ0aWVzXG4gIC8vIGh0dHBzOi8vamlyYS5hcHBjZWxlcmF0b3Iub3JnL2Jyb3dzZS9USU1PQi0xNDU3M1xuICBib3JkZXJDb2xvcjogdHJ1ZSA/IG51bGwgOiAndHJhbnNwYXJlbnQnLFxuXG4gIC8vIGh0dHBzOi8vamlyYS5hcHBjZWxlcmF0b3Iub3JnL2Jyb3dzZS9USU1PQi0xNDU3NVxuICBib3JkZXJSYWRpdXM6IGZhbHNlID8gMCA6IG51bGwsXG5cbiAgLy8gaHR0cHM6Ly9qaXJhLmFwcGNlbGVyYXRvci5vcmcvYnJvd3NlL1RJTU9CLTE0NTc0XG4gIGJvcmRlcldpZHRoOiBmYWxzZSA/IDAgOiBudWxsIH07XG5cblxuaWYgKGZhbHNlKSB7XG4gIFJFU0VUID0gXy5leHRlbmQoUkVTRVQsIHtcbiAgICBiYWNrZ3JvdW5kTGVmdENhcDogMCxcbiAgICBiYWNrZ3JvdW5kVG9wQ2FwOiAwIH0pO1xuXG59IGVsc2UgaWYgKHRydWUpIHtcbiAgUkVTRVQgPSBfLmV4dGVuZChSRVNFVCwge1xuICAgIGJhY2tncm91bmREaXNhYmxlZENvbG9yOiBudWxsLFxuICAgIGJhY2tncm91bmREaXNhYmxlZEltYWdlOiBudWxsLFxuICAgIGJhY2tncm91bmRGb2N1c2VkQ29sb3I6IG51bGwsXG4gICAgYmFja2dyb3VuZEZvY3VzZWRJbWFnZTogbnVsbCxcbiAgICBmb2N1c2FibGU6IGZhbHNlLFxuICAgIGtlZXBTY3JlZW5PbjogZmFsc2UgfSk7XG5cbn1cblxuZnVuY3Rpb24gdWNmaXJzdCh0ZXh0KSB7XG4gIGlmICghdGV4dCkge3JldHVybiB0ZXh0O31cbiAgcmV0dXJuIHRleHRbMF0udG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBhZGROYW1lc3BhY2UoYXBpTmFtZSkge1xuICByZXR1cm4gKENPTlNULklNUExJQ0lUX05BTUVTUEFDRVNbYXBpTmFtZV0gfHwgQ09OU1QuTkFNRVNQQUNFX0RFRkFVTFQpICtcbiAgJy4nICsgYXBpTmFtZTtcbn1cblxuZXhwb3J0cy5NID0gZnVuY3Rpb24gKG5hbWUsIG1vZGVsRGVzYywgbWlncmF0aW9ucykge1xuICB2YXIgY29uZmlnID0gKG1vZGVsRGVzYyB8fCB7fSkuY29uZmlnIHx8IHt9O1xuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IHt9O1xuICB2YXIgZXh0ZW5kT2JqID0ge307XG4gIHZhciBleHRlbmRDbGFzcyA9IHt9O1xuICB2YXIgbW9kO1xuXG4gIGlmIChhZGFwdGVyLnR5cGUpIHtcbiAgICBtb2QgPSByZXF1aXJlKCcvYWxsb3kvc3luYy8nICsgYWRhcHRlci50eXBlKTtcbiAgICBleHRlbmRPYmouc3luYyA9IGZ1bmN0aW9uIChtZXRob2QsIG1vZGVsLCBvcHRzKSB7XG4gICAgICByZXR1cm4gbW9kLnN5bmMobWV0aG9kLCBtb2RlbCwgb3B0cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBleHRlbmRPYmouc3luYyA9IGZ1bmN0aW9uIChtZXRob2QsIG1vZGVsLCBvcHRzKSB7XG4gICAgICBUaS5BUEkud2FybignRXhlY3V0aW9uIG9mICcgKyBtZXRob2QgKyAnI3N5bmMoKSBmdW5jdGlvbiBvbiBhIG1vZGVsIHRoYXQgZG9lcyBub3Qgc3VwcG9ydCBwZXJzaXN0ZW5jZScpO1xuICAgICAgVGkuQVBJLndhcm4oJ21vZGVsOiAnICsgSlNPTi5zdHJpbmdpZnkobW9kZWwudG9KU09OKCkpKTtcbiAgICB9O1xuICB9XG4gIGV4dGVuZE9iai5kZWZhdWx0cyA9IGNvbmZpZy5kZWZhdWx0cztcblxuICAvLyBjb25zdHJ1Y3QgdGhlIG1vZGVsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGFkYXB0ZXIgdHlwZVxuICBpZiAobWlncmF0aW9ucykge2V4dGVuZENsYXNzLm1pZ3JhdGlvbnMgPSBtaWdyYXRpb25zO31cblxuICAvLyBSdW4gdGhlIHByZSBtb2RlbCBjcmVhdGlvbiBjb2RlLCBpZiBhbnlcbiAgaWYgKG1vZCAmJiBfLmlzRnVuY3Rpb24obW9kLmJlZm9yZU1vZGVsQ3JlYXRlKSkge1xuICAgIGNvbmZpZyA9IG1vZC5iZWZvcmVNb2RlbENyZWF0ZShjb25maWcsIG5hbWUpIHx8IGNvbmZpZztcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgTW9kZWwgb2JqZWN0XG4gIHZhciBNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZChleHRlbmRPYmosIGV4dGVuZENsYXNzKTtcbiAgTW9kZWwucHJvdG90eXBlLmNvbmZpZyA9IGNvbmZpZztcblxuICAvLyBFeHRlbmQgdGhlIE1vZGVsIHdpdGggZXh0ZW5kTW9kZWwoKSwgaWYgZGVmaW5lZFxuICBpZiAoXy5pc0Z1bmN0aW9uKG1vZGVsRGVzYy5leHRlbmRNb2RlbCkpIHtcbiAgICBNb2RlbCA9IG1vZGVsRGVzYy5leHRlbmRNb2RlbChNb2RlbCkgfHwgTW9kZWw7XG4gIH1cblxuICAvLyBSdW4gdGhlIHBvc3QgbW9kZWwgY3JlYXRpb24gY29kZSwgaWYgYW55XG4gIGlmIChtb2QgJiYgXy5pc0Z1bmN0aW9uKG1vZC5hZnRlck1vZGVsQ3JlYXRlKSkge1xuICAgIG1vZC5hZnRlck1vZGVsQ3JlYXRlKE1vZGVsLCBuYW1lKTtcbiAgfVxuXG4gIHJldHVybiBNb2RlbDtcbn07XG5cbmV4cG9ydHMuQyA9IGZ1bmN0aW9uIChuYW1lLCBtb2RlbERlc2MsIG1vZGVsKSB7XG4gIHZhciBleHRlbmRPYmogPSB7IG1vZGVsOiBtb2RlbCB9O1xuICB2YXIgY29uZmlnID0gKG1vZGVsID8gbW9kZWwucHJvdG90eXBlLmNvbmZpZyA6IHt9KSB8fCB7fTtcbiAgdmFyIG1vZDtcblxuICBpZiAoY29uZmlnLmFkYXB0ZXIgJiYgY29uZmlnLmFkYXB0ZXIudHlwZSkge1xuICAgIG1vZCA9IHJlcXVpcmUoJy9hbGxveS9zeW5jLycgKyBjb25maWcuYWRhcHRlci50eXBlKTtcbiAgICBleHRlbmRPYmouc3luYyA9IGZ1bmN0aW9uIChtZXRob2QsIG1vZGVsLCBvcHRzKSB7XG4gICAgICByZXR1cm4gbW9kLnN5bmMobWV0aG9kLCBtb2RlbCwgb3B0cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBleHRlbmRPYmouc3luYyA9IGZ1bmN0aW9uIChtZXRob2QsIG1vZGVsLCBvcHRzKSB7XG4gICAgICBUaS5BUEkud2FybignRXhlY3V0aW9uIG9mICcgKyBtZXRob2QgKyAnI3N5bmMoKSBmdW5jdGlvbiBvbiBhIGNvbGxlY3Rpb24gdGhhdCBkb2VzIG5vdCBzdXBwb3J0IHBlcnNpc3RlbmNlJyk7XG4gICAgICBUaS5BUEkud2FybignbW9kZWw6ICcgKyBKU09OLnN0cmluZ2lmeShtb2RlbC50b0pTT04oKSkpO1xuICAgIH07XG4gIH1cblxuICB2YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKGV4dGVuZE9iaik7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlLmNvbmZpZyA9IGNvbmZpZztcblxuICAvLyBleHRlbmQgdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG4gIGlmIChfLmlzRnVuY3Rpb24obW9kZWxEZXNjLmV4dGVuZENvbGxlY3Rpb24pKSB7XG4gICAgQ29sbGVjdGlvbiA9IG1vZGVsRGVzYy5leHRlbmRDb2xsZWN0aW9uKENvbGxlY3Rpb24pIHx8IENvbGxlY3Rpb247XG4gIH1cblxuICAvLyBkbyBhbnkgcG9zdCBjb2xsZWN0aW9uIGNyZWF0aW9uIGNvZGUgZm9ybSB0aGUgc3luYyBhZGFwdGVyXG4gIGlmIChtb2QgJiYgXy5pc0Z1bmN0aW9uKG1vZC5hZnRlckNvbGxlY3Rpb25DcmVhdGUpKSB7XG4gICAgbW9kLmFmdGVyQ29sbGVjdGlvbkNyZWF0ZShDb2xsZWN0aW9uKTtcbiAgfVxuXG4gIHJldHVybiBDb2xsZWN0aW9uO1xufTtcblxuZXhwb3J0cy5VSSA9IHt9O1xuZXhwb3J0cy5VSS5jcmVhdGUgPSBmdW5jdGlvbiAoY29udHJvbGxlciwgYXBpTmFtZSwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhIGZ1bGwgYXBpIG5hbWVcbiAgdmFyIGJhc2VOYW1lLCBucztcbiAgdmFyIHBhcnRzID0gYXBpTmFtZS5zcGxpdCgnLicpO1xuICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgYmFzZU5hbWUgPSBhcGlOYW1lO1xuICAgIG5zID0gb3B0cy5ucyB8fCBDT05TVC5JTVBMSUNJVF9OQU1FU1BBQ0VTW2Jhc2VOYW1lXSB8fCBDT05TVC5OQU1FU1BBQ0VfREVGQVVMVDtcbiAgfSBlbHNlIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgYmFzZU5hbWUgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICBucyA9IHBhcnRzLnNsaWNlKDAsIHBhcnRzLmxlbmd0aCAtIDEpLmpvaW4oJy4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyAnQWxsb3kuVUkuY3JlYXRlKCkgZmFpbGVkOiBObyBBUEkgbmFtZSB3YXMgZ2l2ZW4gaW4gdGhlIHNlY29uZCBwYXJhbWV0ZXInO1xuICB9XG4gIG9wdHMuYXBpTmFtZSA9IG5zICsgJy4nICsgYmFzZU5hbWU7XG4gIGJhc2VOYW1lID0gYmFzZU5hbWVbMF0udG9VcHBlckNhc2UoKSArIGJhc2VOYW1lLnN1YnN0cigxKTtcblxuICAvLyBnZW5lcmF0ZSB0aGUgc3R5bGUgb2JqZWN0XG4gIHZhciBzdHlsZSA9IGV4cG9ydHMuY3JlYXRlU3R5bGUoY29udHJvbGxlciwgb3B0cyk7XG5cbiAgLy8gY3JlYXRlIHRoZSB0aXRhbml1bSBwcm94eSBvYmplY3RcbiAgcmV0dXJuIGV2YWwobnMpWydjcmVhdGUnICsgYmFzZU5hbWVdKHN0eWxlKTtcbn07XG5cbmV4cG9ydHMuY3JlYXRlU3R5bGUgPSBmdW5jdGlvbiAoY29udHJvbGxlciwgb3B0cywgZGVmYXVsdHMpIHtcbiAgdmFyIGNsYXNzZXMsIGFwaU5hbWU7XG5cbiAgLy8gSWYgdGhlcmUncyBubyBvcHRzLCB0aGVyZSdzIG5vIHJlYXNvbiB0byBsb2FkIHRoZSBzdHlsZSBtb2R1bGUuIEp1c3RcbiAgLy8gcmV0dXJuIGFuIGVtcHR5IG9iamVjdC5cbiAgaWYgKCFvcHRzKSB7cmV0dXJuIHt9O31cblxuICAvLyBtYWtlIG9wdHMuY2xhc3NlcyBhbiBhcnJheSBpZiBpdCBpc24ndCBhbHJlYWR5XG4gIGlmIChfLmlzQXJyYXkob3B0cy5jbGFzc2VzKSkge1xuICAgIGNsYXNzZXMgPSBvcHRzLmNsYXNzZXMuc2xpY2UoMCk7XG4gIH0gZWxzZSBpZiAoXy5pc1N0cmluZyhvcHRzLmNsYXNzZXMpKSB7XG4gICAgY2xhc3NlcyA9IG9wdHMuY2xhc3Nlcy5zcGxpdCgvXFxzKy8pO1xuICB9IGVsc2Uge1xuICAgIGNsYXNzZXMgPSBbXTtcbiAgfVxuXG4gIC8vIGdpdmUgb3B0cy5hcGlOYW1lIGEgbmFtZXNwYWNlIGlmIGl0IGRvZXNuJ3QgaGF2ZSBvbmUgYWxyZWFkeVxuICBhcGlOYW1lID0gb3B0cy5hcGlOYW1lO1xuICBpZiAoYXBpTmFtZSAmJiBhcGlOYW1lLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBhcGlOYW1lID0gYWRkTmFtZXNwYWNlKGFwaU5hbWUpO1xuICB9XG5cbiAgLy8gVE9ETzogY2hlY2sgY2FjaGVkIHN0eWxlcyBiYXNlZCBvbiBvcHRzIGFuZCBjb250cm9sbGVyXG5cbiAgLy8gTG9hZCB0aGUgcnVudGltZSBzdHlsZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2xsZXJcbiAgdmFyIHN0eWxlQXJyYXk7XG4gIGlmIChjb250cm9sbGVyICYmIF8uaXNPYmplY3QoY29udHJvbGxlcikpIHtcbiAgICBzdHlsZUFycmF5ID0gcmVxdWlyZSgnL2FsbG95L3dpZGdldHMvJyArIGNvbnRyb2xsZXIud2lkZ2V0SWQgK1xuICAgICcvc3R5bGVzLycgKyBjb250cm9sbGVyLm5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlQXJyYXkgPSByZXF1aXJlKCcvYWxsb3kvc3R5bGVzLycgKyBjb250cm9sbGVyKTtcbiAgfVxuICB2YXIgc3R5bGVGaW5hbCA9IHt9O1xuXG4gIC8vIGl0ZXJhdGUgdGhyb3VnaCBhbGwgc3R5bGVzXG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IHN0eWxlQXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgc3R5bGUgPSBzdHlsZUFycmF5W2ldO1xuXG4gICAgLy8gZ2l2ZSB0aGUgYXBpTmFtZSBhIG5hbWVzcGFjZSBpZiBuZWNlc3NhcnlcbiAgICB2YXIgc3R5bGVBcGkgPSBzdHlsZS5rZXk7XG4gICAgaWYgKHN0eWxlLmlzQXBpICYmIHN0eWxlQXBpLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgIHN0eWxlQXBpID0gKENPTlNULklNUExJQ0lUX05BTUVTUEFDRVNbc3R5bGVBcGldIHx8XG4gICAgICBDT05TVC5OQU1FU1BBQ0VfREVGQVVMVCkgKyAnLicgKyBzdHlsZUFwaTtcbiAgICB9XG5cbiAgICAvLyBkb2VzIHRoaXMgc3R5bGUgbWF0Y2ggdGhlIGdpdmVuIG9wdHM/XG4gICAgaWYgKHN0eWxlLmlzSWQgJiYgb3B0cy5pZCAmJiBzdHlsZS5rZXkgPT09IG9wdHMuaWQgfHxcbiAgICBzdHlsZS5pc0NsYXNzICYmIF8uY29udGFpbnMoY2xhc3Nlcywgc3R5bGUua2V5KSkge1xuICAgICAgLy8gZG8gbm90aGluZyBoZXJlLCBrZWVwIG9uIHByb2Nlc3NpbmdcbiAgICB9IGVsc2UgaWYgKHN0eWxlLmlzQXBpKSB7XG4gICAgICBpZiAoc3R5bGUua2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgc3R5bGUua2V5ID0gYWRkTmFtZXNwYWNlKHN0eWxlLmtleSk7XG4gICAgICB9XG4gICAgICBpZiAoc3R5bGUua2V5ICE9PSBhcGlOYW1lKSB7Y29udGludWU7fVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBubyBtYXRjaGVzLCBza2lwIHRoaXMgc3R5bGVcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNhbiB3ZSBjbGVhciBvdXQgYW55IGZvcm0gZmFjdG9yIHF1ZXJpZXM/XG4gICAgaWYgKHN0eWxlLnF1ZXJpZXMgJiYgc3R5bGUucXVlcmllcy5mb3JtRmFjdG9yICYmXG4gICAgIWV4cG9ydHNbc3R5bGUucXVlcmllcy5mb3JtRmFjdG9yXSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcHJvY2VzcyBydW50aW1lIGN1c3RvbSBxdWVyaWVzXG4gICAgaWYgKHN0eWxlLnF1ZXJpZXMgJiYgc3R5bGUucXVlcmllcy5pZiAmJiAoXG4gICAgc3R5bGUucXVlcmllcy5pZi50cmltKCkudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhbHNlJyB8fFxuICAgIHN0eWxlLnF1ZXJpZXMuaWYuaW5kZXhPZignQWxsb3kuR2xvYmFscycpICE9PSAtMSAmJlxuICAgIGV4cG9ydHMuR2xvYmFsc1tzdHlsZS5xdWVyaWVzLmlmLnNwbGl0KCcuJylbMl1dID09PSBmYWxzZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIE1lcmdlIHRoaXMgc3R5bGUgaW50byB0aGUgZXhpc3Rpbmcgc3R5bGUgb2JqZWN0XG4gICAgZXhwb3J0cy5kZWVwRXh0ZW5kKHRydWUsIHN0eWxlRmluYWwsIHN0eWxlLnN0eWxlKTtcbiAgfVxuXG4gIC8vIFRPRE86IGNhY2hlIHRoZSBzdHlsZSBiYXNlZCBvbiB0aGUgb3B0cyBhbmQgY29udHJvbGxlclxuXG4gIC8vIE1lcmdlIHJlbWFpbmluZyBleHRyYSBzdHlsZSBwcm9wZXJ0aWVzIGZyb20gb3B0cywgaWYgYW55XG4gIHZhciBleHRyYVN0eWxlID0gXy5vbWl0KG9wdHMsIFtcbiAgQ09OU1QuQ0xBU1NfUFJPUEVSVFksXG4gIENPTlNULkFQSU5BTUVfUFJPUEVSVFldKTtcblxuICBleHBvcnRzLmRlZXBFeHRlbmQodHJ1ZSwgc3R5bGVGaW5hbCwgZXh0cmFTdHlsZSk7XG4gIHN0eWxlRmluYWxbQ09OU1QuQ0xBU1NfUFJPUEVSVFldID0gY2xhc3NlcztcbiAgc3R5bGVGaW5hbFtDT05TVC5BUElOQU1FX1BST1BFUlRZXSA9IGFwaU5hbWU7XG5cbiAgaWYgKE1XMzIwX0NIRUNLKSB7ZGVsZXRlIHN0eWxlRmluYWxbQ09OU1QuQVBJTkFNRV9QUk9QRVJUWV07fVxuXG4gIHJldHVybiBkZWZhdWx0cyA/IF8uZGVmYXVsdHMoc3R5bGVGaW5hbCwgZGVmYXVsdHMpIDogc3R5bGVGaW5hbDtcbn07XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdHlsZShjb250cm9sbGVyLCBwcm94eSwgY2xhc3Nlcywgb3B0cywgZGVmYXVsdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIG9wdHMuY2xhc3NlcyA9IGNsYXNzZXM7XG4gIGlmIChwcm94eS5hcGlOYW1lKSB7b3B0cy5hcGlOYW1lID0gcHJveHkuYXBpTmFtZTt9XG4gIGlmIChwcm94eS5pZCkge29wdHMuaWQgPSBwcm94eS5pZDt9XG4gIHByb3h5LmFwcGx5UHJvcGVydGllcyhleHBvcnRzLmNyZWF0ZVN0eWxlKGNvbnRyb2xsZXIsIG9wdHMsIGRlZmF1bHRzKSk7XG4gIGlmICh0cnVlKSB7cHJveHkuY2xhc3NlcyA9IGNsYXNzZXM7fVxufVxuXG5leHBvcnRzLmFkZENsYXNzID0gZnVuY3Rpb24gKGNvbnRyb2xsZXIsIHByb3h5LCBjbGFzc2VzLCBvcHRzKSB7XG5cbiAgLy8gbWFrZSBzdXJlIHdlIGFjdHVhbGx5IGhhdmUgY2xhc3NlcyB0byBhZGRcbiAgaWYgKCFjbGFzc2VzKSB7XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIGlmIChNVzMyMF9DSEVDSykge2RlbGV0ZSBvcHRzLmFwaU5hbWU7fVxuICAgICAgcHJveHkuYXBwbHlQcm9wZXJ0aWVzKG9wdHMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgLy8gY3JlYXRlIGEgdW5pb24gb2YgdGhlIGV4aXN0aW5nIGNsYXNzZXMgd2l0aCB0aGUgbmV3IG9uZShzKVxuICAgIHZhciBwQ2xhc3NlcyA9IHByb3h5W0NPTlNULkNMQVNTX1BST1BFUlRZXSB8fCBbXTtcbiAgICB2YXIgYmVmb3JlTGVuID0gcENsYXNzZXMubGVuZ3RoO1xuICAgIGNsYXNzZXMgPSBfLmlzU3RyaW5nKGNsYXNzZXMpID8gY2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogY2xhc3NlcztcbiAgICB2YXIgbmV3Q2xhc3NlcyA9IF8udW5pb24ocENsYXNzZXMsIGNsYXNzZXMgfHwgW10pO1xuXG4gICAgLy8gbWFrZSBzdXJlIHdlIGFjdHVhbGx5IGFkZGVkIGNsYXNzZXMgYmVmb3JlIHByb2Nlc3Npbmcgc3R5bGVzXG4gICAgaWYgKGJlZm9yZUxlbiA9PT0gbmV3Q2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgIGlmIChvcHRzKSB7XG4gICAgICAgIGlmIChNVzMyMF9DSEVDSykge2RlbGV0ZSBvcHRzLmFwaU5hbWU7fVxuICAgICAgICBwcm94eS5hcHBseVByb3BlcnRpZXMob3B0cyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2Nlc3NTdHlsZShjb250cm9sbGVyLCBwcm94eSwgbmV3Q2xhc3Nlcywgb3B0cyk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNvbnRyb2xsZXIsIHByb3h5LCBjbGFzc2VzLCBvcHRzKSB7XG4gIGNsYXNzZXMgPSBjbGFzc2VzIHx8IFtdO1xuICB2YXIgcENsYXNzZXMgPSBwcm94eVtDT05TVC5DTEFTU19QUk9QRVJUWV0gfHwgW107XG4gIHZhciBiZWZvcmVMZW4gPSBwQ2xhc3Nlcy5sZW5ndGg7XG5cbiAgLy8gbWFrZSBzdXJlIHRoZXJlJ3MgY2xhc3NlcyB0byByZW1vdmUgYmVmb3JlIHByb2Nlc3NpbmdcbiAgaWYgKCFiZWZvcmVMZW4gfHwgIWNsYXNzZXMubGVuZ3RoKSB7XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIGlmIChNVzMyMF9DSEVDSykge2RlbGV0ZSBvcHRzLmFwaU5hbWU7fVxuICAgICAgcHJveHkuYXBwbHlQcm9wZXJ0aWVzKG9wdHMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgLy8gcmVtb3ZlIHRoZSBnaXZlbiBjbGFzcyhlcylcbiAgICBjbGFzc2VzID0gXy5pc1N0cmluZyhjbGFzc2VzKSA/IGNsYXNzZXMuc3BsaXQoL1xccysvKSA6IGNsYXNzZXM7XG4gICAgdmFyIG5ld0NsYXNzZXMgPSBfLmRpZmZlcmVuY2UocENsYXNzZXMsIGNsYXNzZXMpO1xuXG4gICAgLy8gbWFrZSBzdXJlIHRoZXJlIHdhcyBhY3R1YWxseSBhIGRpZmZlcmVuY2UgYmVmb3JlIHByb2Nlc3NpbmdcbiAgICBpZiAoYmVmb3JlTGVuID09PSBuZXdDbGFzc2VzLmxlbmd0aCkge1xuICAgICAgaWYgKG9wdHMpIHtcbiAgICAgICAgaWYgKE1XMzIwX0NIRUNLKSB7ZGVsZXRlIG9wdHMuYXBpTmFtZTt9XG4gICAgICAgIHByb3h5LmFwcGx5UHJvcGVydGllcyhvcHRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzc1N0eWxlKGNvbnRyb2xsZXIsIHByb3h5LCBuZXdDbGFzc2VzLCBvcHRzLCBSRVNFVCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLnJlc2V0Q2xhc3MgPSBmdW5jdGlvbiAoY29udHJvbGxlciwgcHJveHksIGNsYXNzZXMsIG9wdHMpIHtcbiAgY2xhc3NlcyA9IGNsYXNzZXMgfHwgW107XG4gIGNsYXNzZXMgPSBfLmlzU3RyaW5nKGNsYXNzZXMpID8gY2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogY2xhc3NlcztcbiAgcHJvY2Vzc1N0eWxlKGNvbnRyb2xsZXIsIHByb3h5LCBjbGFzc2VzLCBvcHRzLCBSRVNFVCk7XG59O1xuXG4vKipcbiAgICAqIEBtZXRob2QgY3JlYXRlV2lkZ2V0XG4gICAgKiBGYWN0b3J5IG1ldGhvZCBmb3IgaW5zdGFudGlhdGluZyBhIHdpZGdldCBjb250cm9sbGVyLiBDcmVhdGVzIGFuZCByZXR1cm5zIGFuIGluc3RhbmNlIG9mIHRoZVxuICAgICogbmFtZWQgd2lkZ2V0LlxuICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIElkIG9mIHdpZGdldCB0byBpbnN0YW50aWF0ZS5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbmFtZT1cIndpZGdldFwiXSBOYW1lIG9mIHRoZSB2aWV3IHdpdGhpbiB0aGUgd2lkZ2V0IHRvIGluc3RhbnRpYXRlICgnd2lkZ2V0JyBieSBkZWZhdWx0KVxuICAgICogQHBhcmFtIHtPYmplY3R9IFthcmdzXSBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgd2lkZ2V0LlxuICAgICogQHJldHVybiB7QWxsb3kuQ29udHJvbGxlcn0gQWxsb3kgd2lkZ2V0IGNvbnRyb2xsZXIgb2JqZWN0LlxuICAgICovXG5leHBvcnRzLmNyZWF0ZVdpZGdldCA9IGZ1bmN0aW9uIChpZCwgbmFtZSwgYXJncykge1xuICBpZiAodHlwZW9mIG5hbWUgIT09ICd1bmRlZmluZWQnICYmIG5hbWUgIT09IG51bGwgJiZcbiAgXy5pc09iamVjdChuYW1lKSAmJiAhXy5pc1N0cmluZyhuYW1lKSkge1xuICAgIGFyZ3MgPSBuYW1lO1xuICAgIG5hbWUgPSBERUZBVUxUX1dJREdFVDtcbiAgfVxuICByZXR1cm4gbmV3IChyZXF1aXJlKCcvYWxsb3kvd2lkZ2V0cy8nICsgaWQgKyAnL2NvbnRyb2xsZXJzLycgKyAobmFtZSB8fCBERUZBVUxUX1dJREdFVCkpKShhcmdzKTtcbn07XG5cbi8qKlxuICAgICogQG1ldGhvZCBjcmVhdGVDb250cm9sbGVyXG4gICAgKiBGYWN0b3J5IG1ldGhvZCBmb3IgaW5zdGFudGlhdGluZyBhIGNvbnRyb2xsZXIuIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gaW5zdGFuY2Ugb2YgdGhlXG4gICAgKiBuYW1lZCBjb250cm9sbGVyLlxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBjb250cm9sbGVyIHRvIGluc3RhbnRpYXRlLlxuICAgICogQHBhcmFtIHtPYmplY3R9IFthcmdzXSBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgY29udHJvbGxlci5cbiAgICAqIEByZXR1cm4ge0FsbG95LkNvbnRyb2xsZXJ9IEFsbG95IGNvbnRyb2xsZXIgb2JqZWN0LlxuICAgICovXG5leHBvcnRzLmNyZWF0ZUNvbnRyb2xsZXIgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICByZXR1cm4gbmV3IChyZXF1aXJlKCcvYWxsb3kvY29udHJvbGxlcnMvJyArIG5hbWUpKShhcmdzKTtcbn07XG5cbi8qKlxuICAgICogQG1ldGhvZCBjcmVhdGVNb2RlbFxuICAgICogRmFjdG9yeSBtZXRob2QgZm9yIGluc3RhbnRpYXRpbmcgYSBCYWNrYm9uZSBNb2RlbCBvYmplY3QuIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gaW5zdGFuY2Ugb2YgdGhlXG4gICAgKiBuYW1lZCBtb2RlbC5cbiAgICAqXG4gICAgKiBTZWUgW0JhY2tib25lLk1vZGVsXShodHRwOi8vZG9jcy5hcHBjZWxlcmF0b3IuY29tL2JhY2tib25lLzAuOS4yLyNNb2RlbCkgaW4gdGhlIEJhY2tib25lLmpzIGRvY3VtZW50YXRpb24gZm9yXG4gICAgKiBpbmZvcm1hdGlvbiBvbiB0aGUgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBwcm92aWRlZCBieSB0aGUgTW9kZWwgb2JqZWN0LlxuICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBtb2RlbCB0byBpbnN0YW50aWF0ZS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnc10gQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1vZGVsLlxuICAgICogQHJldHVybiB7QmFja2JvbmUuTW9kZWx9IEJhY2tib25lIG1vZGVsIG9iamVjdC5cbiAgICAqL1xuZXhwb3J0cy5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gIHJldHVybiBuZXcgKHJlcXVpcmUoJy9hbGxveS9tb2RlbHMvJyArIHVjZmlyc3QobmFtZSkpLk1vZGVsKShhcmdzKTtcbn07XG5cbi8qKlxuICAgICogQG1ldGhvZCBjcmVhdGVDb2xsZWN0aW9uXG4gICAgKiBGYWN0b3J5IG1ldGhvZCBmb3IgaW5zdGFudGlhdGluZyBhIEJhY2tib25lIGNvbGxlY3Rpb24gb2YgbW9kZWwgb2JqZWN0cy4gQ3JlYXRlcyBhbmQgcmV0dXJucyBhXG4gICAgKiBjb2xsZWN0aW9uIGZvciBob2xkaW5nIHRoZSBuYW1lZCB0eXBlIG9mIG1vZGVsIG9iamVjdHMuXG4gICAgKlxuICAgICogU2VlIFtCYWNrYm9uZS5Db2xsZWN0aW9uXShodHRwOi8vZG9jcy5hcHBjZWxlcmF0b3IuY29tL2JhY2tib25lLzAuOS4yLyNDb2xsZWN0aW9uKSBpbiB0aGUgQmFja2JvbmUuanNcbiAgICAqIGRvY3VtZW50YXRpb24gZm9yICBpbmZvcm1hdGlvbiBvbiB0aGUgbWV0aG9kcyBhbmQgIHByb3BlcnRpZXMgcHJvdmlkZWQgYnkgdGhlXG4gICAgKiBDb2xsZWN0aW9uIG9iamVjdC5cbiAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgbW9kZWwgdG8gaG9sZCBpbiB0aGlzIGNvbGxlY3Rpb24uXG4gICAgKiBAcGFyYW0ge09iamVjdH0gW2FyZ3NdIEFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgICogQHJldHVybiB7QmFja2JvbmUuQ29sbGVjdGlvbn0gQmFja2JvbmUgY29sbGVjdGlvbiBvYmplY3QuXG4gICAgKi9cbmV4cG9ydHMuY3JlYXRlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gIHJldHVybiBuZXcgKHJlcXVpcmUoJy9hbGxveS9tb2RlbHMvJyArIHVjZmlyc3QobmFtZSkpLkNvbGxlY3Rpb24pKGFyZ3MpO1xufTtcblxuZnVuY3Rpb24gaXNUYWJsZXRGYWxsYmFjaygpIHtcbiAgcmV0dXJuIE1hdGgubWluKFxuICBUaS5QbGF0Zm9ybS5kaXNwbGF5Q2Fwcy5wbGF0Zm9ybUhlaWdodCxcbiAgVGkuUGxhdGZvcm0uZGlzcGxheUNhcHMucGxhdGZvcm1XaWR0aCkgPj1cbiAgNzAwO1xufVxuXG4vKipcbiAgICogQHByb3BlcnR5IHtCb29sZWFufSBpc1RhYmxldFxuICAgKiBgdHJ1ZWAgaWYgdGhlIGN1cnJlbnQgZGV2aWNlIGlzIGEgdGFibGV0LlxuICAgKlxuICAgKi9cbmV4cG9ydHMuaXNUYWJsZXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChmYWxzZSkge1xuICAgIHJldHVybiBcImFuZHJvaWRcIiA9PT0gJ2lwYWQnO1xuICB9IGVsc2UgaWYgKHRydWUpIHtcbiAgICB2YXIgcHNjID0gVGkuUGxhdGZvcm0uQW5kcm9pZC5waHlzaWNhbFNpemVDYXRlZ29yeTtcbiAgICByZXR1cm4gcHNjID09PSBUaS5QbGF0Zm9ybS5BbmRyb2lkLlBIWVNJQ0FMX1NJWkVfQ0FURUdPUllfTEFSR0UgfHxcbiAgICBwc2MgPT09IFRpLlBsYXRmb3JtLkFuZHJvaWQuUEhZU0lDQUxfU0laRV9DQVRFR09SWV9YTEFSR0U7XG4gIH0gZWxzZSBpZiAoZmFsc2UpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgVGkuUGxhdGZvcm0uZGlzcGxheUNhcHMucGxhdGZvcm1IZWlnaHQsXG4gICAgVGkuUGxhdGZvcm0uZGlzcGxheUNhcHMucGxhdGZvcm1XaWR0aCkgPj1cbiAgICA0MDA7XG4gICAgLy8gfSBlbHNlIGlmIChPU19CTEFDS0JFUlJZKSB7XG4gICAgLy8gXHQvLyBUYWJsZXRzIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGJ5IEJCIFRpU0RLXG4gICAgLy8gXHQvLyBodHRwczovL2ppcmEuYXBwY2VsZXJhdG9yLm9yZy9icm93c2UvVElNT0ItMTMyMjVcbiAgICAvLyBcdHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChmYWxzZSkge1xuICAgIC8vIHBlciBodHRwOi8vd3d3LmV4dHJlbWV0ZWNoLmNvbS9jb21wdXRpbmcvMTM5NzY4LXdpbmRvd3MtOC1zbWFydHBob25lcy1hbmQtd2luZG93cy1waG9uZS04LXRhYmxldHNcbiAgICAvLyB0YWJsZXRzIHNob3VsZCBiZSA+PSAxMDI0eDc2OCBhbmQgcGhvbmVzIGNvdWxkIGJlIGxvd2VyLCB0aG91Z2ggY3VycmVudCBwaG9uZXMgYXJlIHJ1bm5pbmcgYXRcbiAgICAvLyB0aGUgMTI4MHg3MjAgcmFuZ2UgYW5kIGhpZ2hlclxuICAgIHJldHVybiBNYXRoLm1heChcbiAgICBUaS5QbGF0Zm9ybS5kaXNwbGF5Q2Fwcy5wbGF0Zm9ybUhlaWdodCxcbiAgICBUaS5QbGF0Zm9ybS5kaXNwbGF5Q2Fwcy5wbGF0Zm9ybVdpZHRoKSA+PVxuICAgIDEwMjQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGlzVGFibGV0RmFsbGJhY2soKTtcbiAgfVxufSgpO1xuXG4vKipcbiAgICAgICogQHByb3BlcnR5IHtCb29sZWFufSBpc0hhbmRoZWxkXG4gICAgICAqIGB0cnVlYCBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSBoYW5kaGVsZCBkZXZpY2UgKG5vdCBhIHRhYmxldCkuXG4gICAgICAqXG4gICAgICAqL1xuZXhwb3J0cy5pc0hhbmRoZWxkID0gIWV4cG9ydHMuaXNUYWJsZXQ7XG5cbi8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBHbG9iYWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQW4gb2JqZWN0IGZvciBzdG9yaW5nIGdsb2JhbGx5IGFjY2Vzc2libGUgdmFyaWFibGVzIGFuZCBmdW5jdGlvbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWxsb3kuR2xvYmFscyBpcyBhY2Nlc3NpYmxlIGluIGFueSBjb250cm9sbGVyIGluIHlvdXIgYXBwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgIEFsbG95Lkdsb2JhbHMuc29tZUdsb2JhbE9iamVjdCA9IHsga2V5OiAndmFsdWUnIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgIEFsbG95Lkdsb2JhbHMuc29tZUdsb2JhbEZ1bmN0aW9uID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWxsb3kuR2xvYmFscyBjYW4gYmUgYWNjZXNzZWQgaW4gb3RoZXIgbm9uLWNvbnRyb2xsZXIgSmF2YXNjcmlwdCBmaWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGxpa2UgdGhpczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICB2YXIgdGhlT2JqZWN0ID0gcmVxdWlyZSgnYWxsb3knKS5HbG9iYWxzLnNvbWVHbG9iYWxPYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbmV4cG9ydHMuR2xvYmFscyA9IHt9O1xuXG4vKipcbiAgICAgICAgICAgICAgICAgICAgICAgKiBAcHJvcGVydHkge09iamVjdH0gTW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICogQW4gb2JqZWN0IGZvciBzdG9yaW5nIGdsb2JhbGx5IGFjY2Vzc2libGUgQWxsb3kgbW9kZWxzLiBTaW5nbGV0b24gbW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICogY3JlYXRlZCB2aWEgbWFya3VwIHdpbGwgYmUgc3RvcmVkIG9uIHRoaXMgb2JqZWN0LlxuICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICogICAgIDxNb2RlbCBzcmM9XCJteU1vZGVsXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICogVGhlIGFib3ZlIG1hcmt1cCB3b3VsZCBlZmZlY3RpdmVseSBnZW5lcmF0ZSB0aGUgZm9sbG93aW5nIGNvZGU6XG4gICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgQWxsb3kuTW9kZWxzLm15TW9kZWwgPSBBbGxveS5jcmVhdGVNb2RlbCgnTXlNb2RlbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICogQWxsb3kuTW9kZWxzLm15TW9kZWwgd291bGQgdGhlbiBiZSBhY2Nlc3NpYmxlIGluIGFueSBjb250cm9sbGVyIGluIHlvdXIgYXBwLlxuICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICovXG5leHBvcnRzLk1vZGVscyA9IHt9O1xuXG4vKlxuICAgICAgICAgICAgICAgICAgICAgICogQ3JlYXRlcyBhIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiBhIE1vZGVsIGJhc2VkIG9uIHRoZSBnaXZlbiBtb2RlbCwgb3JcbiAgICAgICAgICAgICAgICAgICAgICAqIHJldHVybnMgYW4gZXhpc3RpbmcgaW5zdGFuY2UgaWYgb25lIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICAgICAgICAgICAgICAqIERvY3VtZW50ZWQgaW4gZG9jcy9hcGlkb2MvbW9kZWwuanMgZm9yIGRvY3Mgc2l0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAqL1xuZXhwb3J0cy5Nb2RlbHMuaW5zdGFuY2UgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZXhwb3J0cy5Nb2RlbHNbbmFtZV0gfHwgKGV4cG9ydHMuTW9kZWxzW25hbWVdID0gZXhwb3J0cy5jcmVhdGVNb2RlbChuYW1lKSk7XG59O1xuXG4vKipcbiAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBDb2xsZWN0aW9uc1xuICAgICogQW4gb2JqZWN0IGZvciBzdG9yaW5nIGdsb2JhbGx5IGFjY2Vzc2libGUgQWxsb3kgY29sbGVjdGlvbnMuIFNpbmdsZXRvbiBjb2xsZWN0aW9uc1xuICAgICogY3JlYXRlZCB2aWEgbWFya3VwIHdpbGwgYmUgc3RvcmVkIG9uIHRoaXMgb2JqZWN0LlxuICAgICpcbiAgICAqICAgICA8Q29sbGVjdGlvbiBzcmM9XCJteU1vZGVsXCIvPlxuICAgICpcbiAgICAqIFRoZSBhYm92ZSBtYXJrdXAgd291bGQgZWZmZWN0aXZlbHkgZ2VuZXJhdGUgdGhlIGZvbGxvd2luZyBjb2RlOlxuICAgICpcbiAgICAqICAgICBBbGxveS5Db2xsZWN0aW9ucy5teU1vZGVsID0gQWxsb3kuY3JlYXRlQ29sbGVjdGlvbignTXlNb2RlbCcpO1xuICAgICpcbiAgICAqIEFsbG95LkNvbGxlY3Rpb25zLm15TW9kZWwgd291bGQgdGhlbiBiZSBhY2Nlc3NpYmxlIGluIGFueSBjb250cm9sbGVyIGluIHlvdXIgYXBwLlxuICAgICpcbiAgICAqL1xuZXhwb3J0cy5Db2xsZWN0aW9ucyA9IHt9O1xuXG4vKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBDcmVhdGVzIGEgc2luZ2xldG9uIGluc3RhbmNlIG9mIGEgQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZ2l2ZW4gbW9kZWwsIG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqIHJldHVybnMgYW4gZXhpc3RpbmcgaW5zdGFuY2UgaWYgb25lIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICogRG9jdW1lbnRlZCBpbiBkb2NzL2FwaWRvYy9jb2xsZWN0aW9uLmpzIGZvciBkb2NzIHNpdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuZXhwb3J0cy5Db2xsZWN0aW9ucy5pbnN0YW5jZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBleHBvcnRzLkNvbGxlY3Rpb25zW25hbWVdIHx8IChleHBvcnRzLkNvbGxlY3Rpb25zW25hbWVdID0gZXhwb3J0cy5jcmVhdGVDb2xsZWN0aW9uKG5hbWUpKTtcbn07XG5cbi8qKlxuICAgICogQHByb3BlcnR5IHtPYmplY3R9IENGR1xuICAgICogQW4gb2JqZWN0IHRoYXQgc3RvcmVzIEFsbG95IGNvbmZpZ3VyYXRpb24gdmFsdWVzIGFzIGRlZmluZWQgaW4geW91ciBhcHAnc1xuICAgICogYXBwL2NvbmZpZy5qc29uIGZpbGUuIEhlcmUncyB3aGF0IGEgdHlwaWNhbCBjb25maWcuanNvbiBmaWxlIG1pZ2h0IGxvb2tcbiAgICAqIGxpa2UgaW4gYW4gQWxsb3kgYXBwLlxuICAgICpcbiAgICAqICAgICB7XG4gICAgKiAgICAgICAgIFwiZ2xvYmFsXCI6IHsgXCJrZXlcIjogXCJkZWZhdWx0VmFsdWVcIiwgXCJhbm90aGVyS2V5XCI6IDEyMzQ1IH0sXG4gICAgKiAgICAgICAgIFwiZW52OmRldmVsb3BtZW50XCI6IHt9LFxuICAgICogICAgICAgICBcImVudjp0ZXN0XCI6IHt9LFxuICAgICogICAgICAgICBcImVudjpwcm9kdWN0aW9uXCI6IHt9LFxuICAgICogICAgICAgICBcIm9zOmlvc1wiOiB7IFwia2V5XCI6IFwiaW9zVmFsdWVcIiB9LFxuICAgICogICAgICAgICBcIm9zOmFuZHJvaWRcIjogeyBcImtleVwiOiBcImFuZHJvaWRWYWx1ZVwiIH0sXG4gICAgKiAgICAgICAgIFwiZGVwZW5kZW5jaWVzXCI6IHt9XG4gICAgKiAgICAgfVxuICAgICpcbiAgICAqIElmIHRoaXMgYXBwIHdhcyBjb21waWxlZCBmb3IgaU9TLCB0aGUgQWxsb3kuQ0ZHIHdvdWxkIGxvb2sgbGlrZSB0aGlzOlxuICAgICpcbiAgICAqICAgICBBbGxveS5DRkcgPSB7XG4gICAgKiAgICAgICAgIFwia2V5XCI6IFwiaW9zVmFsdWVcIixcbiAgICAqICAgICAgICAgXCJhbm90aGVyS2V5XCI6IDEyMzQ1XG4gICAgKiAgICAgfVxuICAgICpcbiAgICAqIEFsbG95LkNGRyBpcyBhY2Nlc3NpYmxlIGluIGFueSBjb250cm9sbGVyIGluIHlvdXIgYXBwLCBhbmQgY2FuIGJlIGFjY2Vzc2VkXG4gICAgKiBpbiBvdGhlciBub24tY29udHJvbGxlciBKYXZhc2NyaXB0IGZpbGVzIGxpa2UgdGhpczpcbiAgICAqXG4gICAgKiAgICAgdmFyIHRoZUtleSA9IHJlcXVpcmUoJ2FsbG95JykuQ0ZHLmtleTtcbiAgICAqXG4gICAgKi9cbmV4cG9ydHMuQ0ZHID0gcmVxdWlyZSgnL2FsbG95L0NGRycpO1xuXG5pZiAodHJ1ZSkge1xuICBleHBvcnRzLkFuZHJvaWQgPSB7fTtcbiAgZXhwb3J0cy5BbmRyb2lkLm1lbnVJdGVtQ3JlYXRlQXJncyA9IFsnaXRlbUlkJywgJ2dyb3VwSWQnLCAndGl0bGUnLCAnb3JkZXInLCAnYWN0aW9uVmlldycsICdjaGVja2FibGUnLCAnY2hlY2tlZCcsICdlbmFibGVkJywgJ2ljb24nLCAnc2hvd0FzQWN0aW9uJywgJ3RpdGxlQ29uZGVuc2VkJywgJ3Zpc2libGUnXTtcbn1cblxuLypcbiAgICogQWRhcHRlZCB2ZXJzaW9uIG9mIG5vZGUuZXh0ZW5kIGh0dHBzOi8vd3d3Lm5wbWpzLm9yZy9wYWNrYWdlL25vZGUuZXh0ZW5kXG4gICAqXG4gICAqIE9yaWdpbmFsIGNvcHlyaWdodDpcbiAgICpcbiAgICogbm9kZS5leHRlbmRcbiAgICogQ29weXJpZ2h0IDIwMTEsIEpvaG4gUmVzaWdcbiAgICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBWZXJzaW9uIDIgbGljZW5zZXMuXG4gICAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAgICpcbiAgICogQGZpbGVvdmVydmlld1xuICAgKiBQb3J0IG9mIGpRdWVyeS5leHRlbmQgdGhhdCBhY3R1YWxseSB3b3JrcyBvbiBub2RlLmpzXG4gICAqL1xuZXhwb3J0cy5kZWVwRXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGFyZ2V0ID0gYXJndW1lbnRzWzBdIHx8IHt9O1xuICB2YXIgaSA9IDE7XG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgZGVlcCA9IGZhbHNlO1xuICB2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5X2lzX2FycmF5LCBjbG9uZTtcblxuICAvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG4gIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcbiAgICBkZWVwID0gdGFyZ2V0O1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICAvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG4gICAgaSA9IDI7XG4gIH1cblxuICAvLyBIYW5kbGUgY2FzZSB3aGVuIHRhcmdldCBpcyBhIHN0cmluZyBvciBzb21ldGhpbmcgKHBvc3NpYmxlIGluIGRlZXAgY29weSlcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmICFfLmlzRnVuY3Rpb24odGFyZ2V0KSkge1xuICAgIHRhcmdldCA9IHt9O1xuICB9XG5cbiAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcbiAgICBvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuICAgIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuc3BsaXQoJycpO1xuICAgICAgfVxuICAgICAgLy8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuICAgICAgZm9yIChuYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgICAgc3JjID0gdGFyZ2V0W25hbWVdO1xuICAgICAgICBjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuICAgICAgICAvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG4gICAgICAgIGlmICh0YXJnZXQgPT09IGNvcHkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwICYmIGNvcHkgJiYgIV8uaXNGdW5jdGlvbihjb3B5KSAmJiBfLmlzT2JqZWN0KGNvcHkpICYmICgoY29weV9pc19hcnJheSA9IF8uaXNBcnJheShjb3B5KSkgfHwgIV8uaGFzKGNvcHksICdhcGlOYW1lJykpKSB7XG4gICAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG4gICAgICAgICAgaWYgKGNvcHlfaXNfYXJyYXkpIHtcbiAgICAgICAgICAgIGNvcHlfaXNfYXJyYXkgPSBmYWxzZTtcbiAgICAgICAgICAgIGNsb25lID0gc3JjICYmIF8uaXNBcnJheShzcmMpID8gc3JjIDogW107XG4gICAgICAgICAgfSBlbHNlIGlmIChfLmlzRGF0ZShjb3B5KSkge1xuICAgICAgICAgICAgY2xvbmUgPSBuZXcgRGF0ZShjb3B5LnZhbHVlT2YoKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb25lID0gc3JjICYmIF8uaXNPYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuICAgICAgICAgIHRhcmdldFtuYW1lXSA9IGV4cG9ydHMuZGVlcEV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0W25hbWVdID0gY29weTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG4gIHJldHVybiB0YXJnZXQ7XG59OyJdLCJzb3VyY2VSb290IjoiL1VzZXJzL3VzZXIwMDEvRG9jdW1lbnRzL0FwcGNlbGVyYXRvcl9TdHVkaW9fV29ya3NwYWNlL29jci9SZXNvdXJjZXMvYW5kcm9pZCJ9
