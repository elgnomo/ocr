//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function () {

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && typeof require !== 'undefined') _ = require('/alloy/underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function (lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function () {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function (events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = { tail: tail, next: list ? list.next : node };
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function (events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if (callback && cb !== callback || context && ctx !== context) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function (events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    } };



  // Aliases for backwards compatibility.
  Events.bind = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function (attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, { silent: true });
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // Return a copy of the model's `attributes` object.
    toJSON: function (options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function (attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function (attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function (attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function (key, value, options) {
      var attrs, attr, val;

      // Handle both
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || options.unset && _.has(now, attr)) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || _.has(now, attr) != _.has(prev, attr)) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function (attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function (options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function (options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function (resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function (key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, { silent: true });
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function (resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function (options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function () {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function (resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function () {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function (resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function () {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function () {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function (options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function (attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function (diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val,changed = false,old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], val = diff[attr])) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function (attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function () {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function () {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function (attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    } });



  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function (models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, { silent: true, parse: options.parse });
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function (options) {
      return this.map(function (model) {return model.toJSON(options);});
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function (models, options) {
      var i,index,length,model,cid,id,cids = {},ids = {},dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || id != null && (ids[id] || this._byId[id])) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({ silent: true });
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function (models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function (model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function (options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function (model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({ at: 0 }, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function (options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function (id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function (cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function (index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function (attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function (model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function (options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function (attr) {
      return _.map(this.models, function (model) {return model.get(attr);});
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function (models, options) {
      models || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({ silent: true }, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function (options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function (resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function (model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function (nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function (resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function (options) {
      this.length = 0;
      this.models = [];
      this._byId = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function (model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function (model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function (event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    } });



  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
  'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
  'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
  'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
  'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function (method) {
    Collection.prototype[method] = function () {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function (options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam = /:\w+/g;
  var splatParam = /\*\w+/g;
  var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function (route, name, callback) {
      Backbone.history || (Backbone.history = new History());
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function (fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function (fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function () {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function (route) {
      route = route.replace(escapeRegExp, '\\$&').
      replace(namedParam, '([^\/]+)').
      replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function (route, fragment) {
      return route.exec(fragment).slice(1);
    } });



  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function () {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function (windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function (fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function (options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options = _.extend({}, { root: '/' }, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState = !!this.options.pushState;
      this._hasPushState = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment = this.getFragment();
      var docMode = document.documentMode;
      var oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && 'onhashchange' in window && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function () {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function (route, callback) {
      this.handlers.unshift({ route: route, callback: callback });
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function (e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function (fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function (handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function (fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = { trigger: options };
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

        // If hash changes haven't been explicitly disabled, update the hash
        // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && frag != this.getFragment(this.getHash(this.iframe))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if (!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

        // If you've told us that you explicitly don't want fallback hashchange-
        // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function (location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    } });


  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function (options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function (selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function () {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function () {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function (tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function (element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof $ ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function (events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1],selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function () {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function (options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function () {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    } });



  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read': 'GET' };


  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function (method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = { type: type, dataType: 'json' };

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? { model: params.data } : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function (xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function (onError, originalModel, options) {
    return function (model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function () {};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function (parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () {parent.apply(this, arguments);};
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function (object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function () {
    throw new Error('A "url" property or function must be specified');
  };

}).call(global);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLmpzIl0sIm5hbWVzIjpbInJvb3QiLCJwcmV2aW91c0JhY2tib25lIiwiQmFja2JvbmUiLCJzbGljZSIsIkFycmF5IiwicHJvdG90eXBlIiwic3BsaWNlIiwiZXhwb3J0cyIsIlZFUlNJT04iLCJfIiwicmVxdWlyZSIsIiQiLCJqUXVlcnkiLCJaZXB0byIsImVuZGVyIiwic2V0RG9tTGlicmFyeSIsImxpYiIsIm5vQ29uZmxpY3QiLCJlbXVsYXRlSFRUUCIsImVtdWxhdGVKU09OIiwiZXZlbnRTcGxpdHRlciIsIkV2ZW50cyIsIm9uIiwiZXZlbnRzIiwiY2FsbGJhY2siLCJjb250ZXh0IiwiY2FsbHMiLCJldmVudCIsIm5vZGUiLCJ0YWlsIiwibGlzdCIsInNwbGl0IiwiX2NhbGxiYWNrcyIsInNoaWZ0IiwibmV4dCIsIm9mZiIsImNiIiwiY3R4Iiwia2V5cyIsInRyaWdnZXIiLCJhcmdzIiwiYWxsIiwicmVzdCIsImNhbGwiLCJhcmd1bWVudHMiLCJhcHBseSIsImNvbmNhdCIsImJpbmQiLCJ1bmJpbmQiLCJNb2RlbCIsImF0dHJpYnV0ZXMiLCJvcHRpb25zIiwiZGVmYXVsdHMiLCJwYXJzZSIsImdldFZhbHVlIiwiZXh0ZW5kIiwiY29sbGVjdGlvbiIsIl9lc2NhcGVkQXR0cmlidXRlcyIsImNpZCIsInVuaXF1ZUlkIiwiY2hhbmdlZCIsIl9zaWxlbnQiLCJfcGVuZGluZyIsInNldCIsInNpbGVudCIsIl9wcmV2aW91c0F0dHJpYnV0ZXMiLCJjbG9uZSIsImluaXRpYWxpemUiLCJpZEF0dHJpYnV0ZSIsInRvSlNPTiIsImdldCIsImF0dHIiLCJlc2NhcGUiLCJodG1sIiwidmFsIiwiaGFzIiwia2V5IiwidmFsdWUiLCJhdHRycyIsImlzT2JqZWN0IiwidW5zZXQiLCJfdmFsaWRhdGUiLCJpZCIsImNoYW5nZXMiLCJub3ciLCJlc2NhcGVkIiwicHJldiIsImlzRXF1YWwiLCJjaGFuZ2UiLCJjbGVhciIsImZldGNoIiwibW9kZWwiLCJzdWNjZXNzIiwicmVzcCIsInN0YXR1cyIsInhociIsImVycm9yIiwid3JhcEVycm9yIiwic3luYyIsInNhdmUiLCJjdXJyZW50Iiwid2FpdCIsInNpbGVudE9wdGlvbnMiLCJzZXJ2ZXJBdHRycyIsIm1ldGhvZCIsImlzTmV3IiwiZGVzdHJveSIsInRyaWdnZXJEZXN0cm95IiwidXJsIiwiYmFzZSIsInVybEVycm9yIiwiY2hhckF0IiwibGVuZ3RoIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJjaGFuZ2luZyIsIl9jaGFuZ2luZyIsImlzRW1wdHkiLCJoYXNDaGFuZ2VkIiwiY2hhbmdlZEF0dHJpYnV0ZXMiLCJkaWZmIiwib2xkIiwicHJldmlvdXMiLCJwcmV2aW91c0F0dHJpYnV0ZXMiLCJpc1ZhbGlkIiwidmFsaWRhdGUiLCJDb2xsZWN0aW9uIiwibW9kZWxzIiwiY29tcGFyYXRvciIsIl9yZXNldCIsInJlc2V0IiwibWFwIiwiYWRkIiwiaSIsImluZGV4IiwiY2lkcyIsImlkcyIsImR1cHMiLCJpc0FycmF5IiwiX3ByZXBhcmVNb2RlbCIsIkVycm9yIiwiX2J5Q2lkIiwiX2J5SWQiLCJwdXNoIiwiX29uTW9kZWxFdmVudCIsImF0Iiwic29ydCIsInJlbW92ZSIsImwiLCJnZXRCeUNpZCIsImluZGV4T2YiLCJfcmVtb3ZlUmVmZXJlbmNlIiwicG9wIiwidW5zaGlmdCIsIndoZXJlIiwiZmlsdGVyIiwiYm91bmRDb21wYXJhdG9yIiwic29ydEJ5IiwicGx1Y2siLCJ1bmRlZmluZWQiLCJjcmVhdGUiLCJjb2xsIiwibmV4dE1vZGVsIiwiY2hhaW4iLCJtZXRob2RzIiwiZWFjaCIsInRvQXJyYXkiLCJSb3V0ZXIiLCJyb3V0ZXMiLCJfYmluZFJvdXRlcyIsIm5hbWVkUGFyYW0iLCJzcGxhdFBhcmFtIiwiZXNjYXBlUmVnRXhwIiwicm91dGUiLCJuYW1lIiwiaGlzdG9yeSIsIkhpc3RvcnkiLCJpc1JlZ0V4cCIsIl9yb3V0ZVRvUmVnRXhwIiwiZnJhZ21lbnQiLCJfZXh0cmFjdFBhcmFtZXRlcnMiLCJuYXZpZ2F0ZSIsInJlcGxhY2UiLCJSZWdFeHAiLCJleGVjIiwiaGFuZGxlcnMiLCJiaW5kQWxsIiwicm91dGVTdHJpcHBlciIsImlzRXhwbG9yZXIiLCJzdGFydGVkIiwiaW50ZXJ2YWwiLCJnZXRIYXNoIiwid2luZG93T3ZlcnJpZGUiLCJsb2MiLCJsb2NhdGlvbiIsIndpbmRvdyIsIm1hdGNoIiwiaHJlZiIsImdldEZyYWdtZW50IiwiZm9yY2VQdXNoU3RhdGUiLCJfaGFzUHVzaFN0YXRlIiwicGF0aG5hbWUiLCJzZWFyY2giLCJzdWJzdHIiLCJzdGFydCIsIl93YW50c0hhc2hDaGFuZ2UiLCJoYXNoQ2hhbmdlIiwiX3dhbnRzUHVzaFN0YXRlIiwicHVzaFN0YXRlIiwiZG9jTW9kZSIsImRvY3VtZW50IiwiZG9jdW1lbnRNb2RlIiwib2xkSUUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0b0xvd2VyQ2FzZSIsImlmcmFtZSIsImhpZGUiLCJhcHBlbmRUbyIsImNvbnRlbnRXaW5kb3ciLCJjaGVja1VybCIsIl9jaGVja1VybEludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJhdFJvb3QiLCJoYXNoIiwicmVwbGFjZVN0YXRlIiwidGl0bGUiLCJwcm90b2NvbCIsImhvc3QiLCJsb2FkVXJsIiwic3RvcCIsImNsZWFySW50ZXJ2YWwiLCJlIiwiZnJhZ21lbnRPdmVycmlkZSIsIm1hdGNoZWQiLCJhbnkiLCJoYW5kbGVyIiwidGVzdCIsImZyYWciLCJfdXBkYXRlSGFzaCIsIm9wZW4iLCJjbG9zZSIsImFzc2lnbiIsInRvU3RyaW5nIiwiVmlldyIsIl9jb25maWd1cmUiLCJfZW5zdXJlRWxlbWVudCIsImRlbGVnYXRlRXZlbnRzIiwiZGVsZWdhdGVFdmVudFNwbGl0dGVyIiwidmlld09wdGlvbnMiLCJ0YWdOYW1lIiwic2VsZWN0b3IiLCIkZWwiLCJmaW5kIiwicmVuZGVyIiwibWFrZSIsImNvbnRlbnQiLCJlbCIsImNyZWF0ZUVsZW1lbnQiLCJzZXRFbGVtZW50IiwiZWxlbWVudCIsImRlbGVnYXRlIiwidW5kZWxlZ2F0ZUV2ZW50cyIsImlzRnVuY3Rpb24iLCJldmVudE5hbWUiLCJjbGFzc05hbWUiLCJwcm90b1Byb3BzIiwiY2xhc3NQcm9wcyIsImNoaWxkIiwiaW5oZXJpdHMiLCJtZXRob2RNYXAiLCJ0eXBlIiwicGFyYW1zIiwiZGF0YVR5cGUiLCJkYXRhIiwiY29udGVudFR5cGUiLCJKU09OIiwic3RyaW5naWZ5IiwiX21ldGhvZCIsImJlZm9yZVNlbmQiLCJzZXRSZXF1ZXN0SGVhZGVyIiwicHJvY2Vzc0RhdGEiLCJhamF4Iiwib25FcnJvciIsIm9yaWdpbmFsTW9kZWwiLCJjdG9yIiwicGFyZW50Iiwic3RhdGljUHJvcHMiLCJoYXNPd25Qcm9wZXJ0eSIsIl9fc3VwZXJfXyIsIm9iamVjdCIsInByb3AiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMsWUFBVTs7QUFFWDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFJQSxJQUFJLEdBQUcsSUFBWDs7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsZ0JBQWdCLEdBQUdELElBQUksQ0FBQ0UsUUFBNUI7O0FBRUE7QUFDQSxNQUFJQyxLQUFLLEdBQUdDLEtBQUssQ0FBQ0MsU0FBTixDQUFnQkYsS0FBNUI7QUFDQSxNQUFJRyxNQUFNLEdBQUdGLEtBQUssQ0FBQ0MsU0FBTixDQUFnQkMsTUFBN0I7O0FBRUE7QUFDQTtBQUNBLE1BQUlKLFFBQUo7QUFDQSxNQUFJLE9BQU9LLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDbkNMLElBQUFBLFFBQVEsR0FBR0ssT0FBWDtBQUNBLEdBRkQsTUFFTztBQUNOTCxJQUFBQSxRQUFRLEdBQUdGLElBQUksQ0FBQ0UsUUFBTCxHQUFnQixFQUEzQjtBQUNBOztBQUVEO0FBQ0FBLEVBQUFBLFFBQVEsQ0FBQ00sT0FBVCxHQUFtQixPQUFuQjs7QUFFQTtBQUNBLE1BQUlDLENBQUMsR0FBR1QsSUFBSSxDQUFDUyxDQUFiO0FBQ0EsTUFBSSxDQUFDQSxDQUFELElBQU8sT0FB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QUtBO0FBQ0EsTUFBSXJMLFFBQVEsR0FBRyxZQUFXO0FBQ3pCLFVBQU0sSUFBSThCLEtBQUosQ0FBVSxnREFBVixDQUFOO0FBQ0EsR0FGRDs7QUFJQyxDQS80Q0QsRUErNENHakcsSUEvNENIIiwic291cmNlc0NvbnRlbnQiOlsiLy8gICAgIEJhY2tib25lLmpzIDAuOS4yXG5cbi8vICAgICAoYykgMjAxMC0yMDEyIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBJbmMuXG4vLyAgICAgQmFja2JvbmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyAgICAgRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gICAgIGh0dHA6Ly9iYWNrYm9uZWpzLm9yZ1xuXG4oZnVuY3Rpb24oKXtcblxuLy8gSW5pdGlhbCBTZXR1cFxuLy8gLS0tLS0tLS0tLS0tLVxuXG4vLyBTYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IChgd2luZG93YCBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbi8vIG9uIHRoZSBzZXJ2ZXIpLlxudmFyIHJvb3QgPSB0aGlzO1xuXG4vLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYEJhY2tib25lYCB2YXJpYWJsZSwgc28gdGhhdCBpdCBjYW4gYmVcbi8vIHJlc3RvcmVkIGxhdGVyIG9uLCBpZiBgbm9Db25mbGljdGAgaXMgdXNlZC5cbnZhciBwcmV2aW91c0JhY2tib25lID0gcm9vdC5CYWNrYm9uZTtcblxuLy8gQ3JlYXRlIGEgbG9jYWwgcmVmZXJlbmNlIHRvIHNsaWNlL3NwbGljZS5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBzcGxpY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlO1xuXG4vLyBUaGUgdG9wLWxldmVsIG5hbWVzcGFjZS4gQWxsIHB1YmxpYyBCYWNrYm9uZSBjbGFzc2VzIGFuZCBtb2R1bGVzIHdpbGxcbi8vIGJlIGF0dGFjaGVkIHRvIHRoaXMuIEV4cG9ydGVkIGZvciBib3RoIENvbW1vbkpTIGFuZCB0aGUgYnJvd3Nlci5cbnZhciBCYWNrYm9uZTtcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0QmFja2JvbmUgPSBleHBvcnRzO1xufSBlbHNlIHtcblx0QmFja2JvbmUgPSByb290LkJhY2tib25lID0ge307XG59XG5cbi8vIEN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgbGlicmFyeS4gS2VlcCBpbiBzeW5jIHdpdGggYHBhY2thZ2UuanNvbmAuXG5CYWNrYm9uZS5WRVJTSU9OID0gJzAuOS4yJztcblxuLy8gUmVxdWlyZSBVbmRlcnNjb3JlLCBpZiB3ZSdyZSBvbiB0aGUgc2VydmVyLCBhbmQgaXQncyBub3QgYWxyZWFkeSBwcmVzZW50LlxudmFyIF8gPSByb290Ll87XG5pZiAoIV8gJiYgKHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJykpIF8gPSByZXF1aXJlKCcvYWxsb3kvdW5kZXJzY29yZScpO1xuXG4vLyBGb3IgQmFja2JvbmUncyBwdXJwb3NlcywgalF1ZXJ5LCBaZXB0bywgb3IgRW5kZXIgb3ducyB0aGUgYCRgIHZhcmlhYmxlLlxudmFyICQgPSByb290LmpRdWVyeSB8fCByb290LlplcHRvIHx8IHJvb3QuZW5kZXI7XG5cbi8vIFNldCB0aGUgSmF2YVNjcmlwdCBsaWJyYXJ5IHRoYXQgd2lsbCBiZSB1c2VkIGZvciBET00gbWFuaXB1bGF0aW9uIGFuZFxuLy8gQWpheCBjYWxscyAoYS5rLmEuIHRoZSBgJGAgdmFyaWFibGUpLiBCeSBkZWZhdWx0IEJhY2tib25lIHdpbGwgdXNlOiBqUXVlcnksXG4vLyBaZXB0bywgb3IgRW5kZXI7IGJ1dCB0aGUgYHNldERvbUxpYnJhcnkoKWAgbWV0aG9kIGxldHMgeW91IGluamVjdCBhblxuLy8gYWx0ZXJuYXRlIEphdmFTY3JpcHQgbGlicmFyeSAob3IgYSBtb2NrIGxpYnJhcnkgZm9yIHRlc3RpbmcgeW91ciB2aWV3c1xuLy8gb3V0c2lkZSBvZiBhIGJyb3dzZXIpLlxuQmFja2JvbmUuc2V0RG9tTGlicmFyeSA9IGZ1bmN0aW9uKGxpYikge1xuXHQkID0gbGliO1xufTtcblxuLy8gUnVucyBCYWNrYm9uZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgQmFja2JvbmVgIHZhcmlhYmxlXG4vLyB0byBpdHMgcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhpcyBCYWNrYm9uZSBvYmplY3QuXG5CYWNrYm9uZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG5cdHJvb3QuQmFja2JvbmUgPSBwcmV2aW91c0JhY2tib25lO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8vIFR1cm4gb24gYGVtdWxhdGVIVFRQYCB0byBzdXBwb3J0IGxlZ2FjeSBIVFRQIHNlcnZlcnMuIFNldHRpbmcgdGhpcyBvcHRpb25cbi8vIHdpbGwgZmFrZSBgXCJQVVRcImAgYW5kIGBcIkRFTEVURVwiYCByZXF1ZXN0cyB2aWEgdGhlIGBfbWV0aG9kYCBwYXJhbWV0ZXIgYW5kXG4vLyBzZXQgYSBgWC1IdHRwLU1ldGhvZC1PdmVycmlkZWAgaGVhZGVyLlxuQmFja2JvbmUuZW11bGF0ZUhUVFAgPSBmYWxzZTtcblxuLy8gVHVybiBvbiBgZW11bGF0ZUpTT05gIHRvIHN1cHBvcnQgbGVnYWN5IHNlcnZlcnMgdGhhdCBjYW4ndCBkZWFsIHdpdGggZGlyZWN0XG4vLyBgYXBwbGljYXRpb24vanNvbmAgcmVxdWVzdHMgLi4uIHdpbGwgZW5jb2RlIHRoZSBib2R5IGFzXG4vLyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYCBpbnN0ZWFkIGFuZCB3aWxsIHNlbmQgdGhlIG1vZGVsIGluIGFcbi8vIGZvcm0gcGFyYW0gbmFtZWQgYG1vZGVsYC5cbkJhY2tib25lLmVtdWxhdGVKU09OID0gZmFsc2U7XG5cbi8vIEJhY2tib25lLkV2ZW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5nc1xudmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbi8vIEEgbW9kdWxlIHRoYXQgY2FuIGJlIG1peGVkIGluIHRvICphbnkgb2JqZWN0KiBpbiBvcmRlciB0byBwcm92aWRlIGl0IHdpdGhcbi8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2sgZnVuY3Rpb25zXG4vLyB0byBhbiBldmVudDsgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW4gc3VjY2Vzc2lvbi5cbi8vXG4vLyAgICAgdmFyIG9iamVjdCA9IHt9O1xuLy8gICAgIF8uZXh0ZW5kKG9iamVjdCwgQmFja2JvbmUuRXZlbnRzKTtcbi8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbi8vICAgICBvYmplY3QudHJpZ2dlcignZXhwYW5kJyk7XG4vL1xudmFyIEV2ZW50cyA9IEJhY2tib25lLkV2ZW50cyA9IHtcblxuXHQvLyBCaW5kIG9uZSBvciBtb3JlIHNwYWNlIHNlcGFyYXRlZCBldmVudHMsIGBldmVudHNgLCB0byBhIGBjYWxsYmFja2Bcblx0Ly8gZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZCB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cblx0b246IGZ1bmN0aW9uKGV2ZW50cywgY2FsbGJhY2ssIGNvbnRleHQpIHtcblxuXHR2YXIgY2FsbHMsIGV2ZW50LCBub2RlLCB0YWlsLCBsaXN0O1xuXHRpZiAoIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcblx0ZXZlbnRzID0gZXZlbnRzLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuXHRjYWxscyA9IHRoaXMuX2NhbGxiYWNrcyB8fCAodGhpcy5fY2FsbGJhY2tzID0ge30pO1xuXG5cdC8vIENyZWF0ZSBhbiBpbW11dGFibGUgY2FsbGJhY2sgbGlzdCwgYWxsb3dpbmcgdHJhdmVyc2FsIGR1cmluZ1xuXHQvLyBtb2RpZmljYXRpb24uICBUaGUgdGFpbCBpcyBhbiBlbXB0eSBvYmplY3QgdGhhdCB3aWxsIGFsd2F5cyBiZSB1c2VkXG5cdC8vIGFzIHRoZSBuZXh0IG5vZGUuXG5cdHdoaWxlIChldmVudCA9IGV2ZW50cy5zaGlmdCgpKSB7XG5cdFx0bGlzdCA9IGNhbGxzW2V2ZW50XTtcblx0XHRub2RlID0gbGlzdCA/IGxpc3QudGFpbCA6IHt9O1xuXHRcdG5vZGUubmV4dCA9IHRhaWwgPSB7fTtcblx0XHRub2RlLmNvbnRleHQgPSBjb250ZXh0O1xuXHRcdG5vZGUuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRjYWxsc1tldmVudF0gPSB7dGFpbDogdGFpbCwgbmV4dDogbGlzdCA/IGxpc3QubmV4dCA6IG5vZGV9O1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Ly8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy4gSWYgYGNvbnRleHRgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGNhbGxiYWNrc1xuXHQvLyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGwgY2FsbGJhY2tzIGZvciB0aGVcblx0Ly8gZXZlbnQuIElmIGBldmVudHNgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kIGNhbGxiYWNrcyBmb3IgYWxsIGV2ZW50cy5cblx0b2ZmOiBmdW5jdGlvbihldmVudHMsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cdHZhciBldmVudCwgY2FsbHMsIG5vZGUsIHRhaWwsIGNiLCBjdHg7XG5cblx0Ly8gTm8gZXZlbnRzLCBvciByZW1vdmluZyAqYWxsKiBldmVudHMuXG5cdGlmICghKGNhbGxzID0gdGhpcy5fY2FsbGJhY2tzKSkgcmV0dXJuO1xuXHRpZiAoIShldmVudHMgfHwgY2FsbGJhY2sgfHwgY29udGV4dCkpIHtcblx0XHRkZWxldGUgdGhpcy5fY2FsbGJhY2tzO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Ly8gTG9vcCB0aHJvdWdoIHRoZSBsaXN0ZWQgZXZlbnRzIGFuZCBjb250ZXh0cywgc3BsaWNpbmcgdGhlbSBvdXQgb2YgdGhlXG5cdC8vIGxpbmtlZCBsaXN0IG9mIGNhbGxiYWNrcyBpZiBhcHByb3ByaWF0ZS5cblx0ZXZlbnRzID0gZXZlbnRzID8gZXZlbnRzLnNwbGl0KGV2ZW50U3BsaXR0ZXIpIDogXy5rZXlzKGNhbGxzKTtcblx0d2hpbGUgKGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCkpIHtcblx0XHRub2RlID0gY2FsbHNbZXZlbnRdO1xuXHRcdGRlbGV0ZSBjYWxsc1tldmVudF07XG5cdFx0aWYgKCFub2RlIHx8ICEoY2FsbGJhY2sgfHwgY29udGV4dCkpIGNvbnRpbnVlO1xuXHRcdC8vIENyZWF0ZSBhIG5ldyBsaXN0LCBvbWl0dGluZyB0aGUgaW5kaWNhdGVkIGNhbGxiYWNrcy5cblx0XHR0YWlsID0gbm9kZS50YWlsO1xuXHRcdHdoaWxlICgobm9kZSA9IG5vZGUubmV4dCkgIT09IHRhaWwpIHtcblx0XHRjYiA9IG5vZGUuY2FsbGJhY2s7XG5cdFx0Y3R4ID0gbm9kZS5jb250ZXh0O1xuXHRcdGlmICgoY2FsbGJhY2sgJiYgY2IgIT09IGNhbGxiYWNrKSB8fCAoY29udGV4dCAmJiBjdHggIT09IGNvbnRleHQpKSB7XG5cdFx0XHR0aGlzLm9uKGV2ZW50LCBjYiwgY3R4KTtcblx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Ly8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG5cdC8vIHBhc3NlZCB0aGUgc2FtZSBhcmd1bWVudHMgYXMgYHRyaWdnZXJgIGlzLCBhcGFydCBmcm9tIHRoZSBldmVudCBuYW1lXG5cdC8vICh1bmxlc3MgeW91J3JlIGxpc3RlbmluZyBvbiBgXCJhbGxcImAsIHdoaWNoIHdpbGwgY2F1c2UgeW91ciBjYWxsYmFjayB0b1xuXHQvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG5cdHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50cykge1xuXHR2YXIgZXZlbnQsIG5vZGUsIGNhbGxzLCB0YWlsLCBhcmdzLCBhbGwsIHJlc3Q7XG5cdGlmICghKGNhbGxzID0gdGhpcy5fY2FsbGJhY2tzKSkgcmV0dXJuIHRoaXM7XG5cdGFsbCA9IGNhbGxzLmFsbDtcblx0ZXZlbnRzID0gZXZlbnRzLnNwbGl0KGV2ZW50U3BsaXR0ZXIpO1xuXHRyZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG5cdC8vIEZvciBlYWNoIGV2ZW50LCB3YWxrIHRocm91Z2ggdGhlIGxpbmtlZCBsaXN0IG9mIGNhbGxiYWNrcyB0d2ljZSxcblx0Ly8gZmlyc3QgdG8gdHJpZ2dlciB0aGUgZXZlbnQsIHRoZW4gdG8gdHJpZ2dlciBhbnkgYFwiYWxsXCJgIGNhbGxiYWNrcy5cblx0d2hpbGUgKGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCkpIHtcblx0XHRpZiAobm9kZSA9IGNhbGxzW2V2ZW50XSkge1xuXHRcdHRhaWwgPSBub2RlLnRhaWw7XG5cdFx0d2hpbGUgKChub2RlID0gbm9kZS5uZXh0KSAhPT0gdGFpbCkge1xuXHRcdFx0bm9kZS5jYWxsYmFjay5hcHBseShub2RlLmNvbnRleHQgfHwgdGhpcywgcmVzdCk7XG5cdFx0fVxuXHRcdH1cblx0XHRpZiAobm9kZSA9IGFsbCkge1xuXHRcdHRhaWwgPSBub2RlLnRhaWw7XG5cdFx0YXJncyA9IFtldmVudF0uY29uY2F0KHJlc3QpO1xuXHRcdHdoaWxlICgobm9kZSA9IG5vZGUubmV4dCkgIT09IHRhaWwpIHtcblx0XHRcdG5vZGUuY2FsbGJhY2suYXBwbHkobm9kZS5jb250ZXh0IHx8IHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcblx0fVxuXG59O1xuXG4vLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbkV2ZW50cy5iaW5kICAgPSBFdmVudHMub247XG5FdmVudHMudW5iaW5kID0gRXZlbnRzLm9mZjtcblxuLy8gQmFja2JvbmUuTW9kZWxcbi8vIC0tLS0tLS0tLS0tLS0tXG5cbi8vIENyZWF0ZSBhIG5ldyBtb2RlbCwgd2l0aCBkZWZpbmVkIGF0dHJpYnV0ZXMuIEEgY2xpZW50IGlkIChgY2lkYClcbi8vIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGFuZCBhc3NpZ25lZCBmb3IgeW91LlxudmFyIE1vZGVsID0gQmFja2JvbmUuTW9kZWwgPSBmdW5jdGlvbihhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG5cdHZhciBkZWZhdWx0cztcblx0YXR0cmlidXRlcyB8fCAoYXR0cmlidXRlcyA9IHt9KTtcblx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wYXJzZSkgYXR0cmlidXRlcyA9IHRoaXMucGFyc2UoYXR0cmlidXRlcyk7XG5cdGlmIChkZWZhdWx0cyA9IGdldFZhbHVlKHRoaXMsICdkZWZhdWx0cycpKSB7XG5cdGF0dHJpYnV0ZXMgPSBfLmV4dGVuZCh7fSwgZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXHR9XG5cdGlmIChvcHRpb25zICYmIG9wdGlvbnMuY29sbGVjdGlvbikgdGhpcy5jb2xsZWN0aW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuXHR0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcblx0dGhpcy5fZXNjYXBlZEF0dHJpYnV0ZXMgPSB7fTtcblx0dGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdjJyk7XG5cdHRoaXMuY2hhbmdlZCA9IHt9O1xuXHR0aGlzLl9zaWxlbnQgPSB7fTtcblx0dGhpcy5fcGVuZGluZyA9IHt9O1xuXHR0aGlzLnNldChhdHRyaWJ1dGVzLCB7c2lsZW50OiB0cnVlfSk7XG5cdC8vIFJlc2V0IGNoYW5nZSB0cmFja2luZy5cblx0dGhpcy5jaGFuZ2VkID0ge307XG5cdHRoaXMuX3NpbGVudCA9IHt9O1xuXHR0aGlzLl9wZW5kaW5nID0ge307XG5cdHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcyA9IF8uY2xvbmUodGhpcy5hdHRyaWJ1dGVzKTtcblx0dGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG4vLyBBdHRhY2ggYWxsIGluaGVyaXRhYmxlIG1ldGhvZHMgdG8gdGhlIE1vZGVsIHByb3RvdHlwZS5cbl8uZXh0ZW5kKE1vZGVsLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cblx0Ly8gQSBoYXNoIG9mIGF0dHJpYnV0ZXMgd2hvc2UgY3VycmVudCBhbmQgcHJldmlvdXMgdmFsdWUgZGlmZmVyLlxuXHRjaGFuZ2VkOiBudWxsLFxuXG5cdC8vIEEgaGFzaCBvZiBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBzaWxlbnRseSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IHRpbWVcblx0Ly8gYGNoYW5nZWAgd2FzIGNhbGxlZC4gIFdpbGwgYmVjb21lIHBlbmRpbmcgYXR0cmlidXRlcyBvbiB0aGUgbmV4dCBjYWxsLlxuXHRfc2lsZW50OiBudWxsLFxuXG5cdC8vIEEgaGFzaCBvZiBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGAnY2hhbmdlJ2AgZXZlbnRcblx0Ly8gYmVnYW4uXG5cdF9wZW5kaW5nOiBudWxsLFxuXG5cdC8vIFRoZSBkZWZhdWx0IG5hbWUgZm9yIHRoZSBKU09OIGBpZGAgYXR0cmlidXRlIGlzIGBcImlkXCJgLiBNb25nb0RCIGFuZFxuXHQvLyBDb3VjaERCIHVzZXJzIG1heSB3YW50IHRvIHNldCB0aGlzIHRvIGBcIl9pZFwiYC5cblx0aWRBdHRyaWJ1dGU6ICdpZCcsXG5cblx0Ly8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG5cdC8vIGluaXRpYWxpemF0aW9uIGxvZ2ljLlxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cblx0Ly8gUmV0dXJuIGEgY29weSBvZiB0aGUgbW9kZWwncyBgYXR0cmlidXRlc2Agb2JqZWN0LlxuXHR0b0pTT046IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0cmV0dXJuIF8uY2xvbmUodGhpcy5hdHRyaWJ1dGVzKTtcblx0fSxcblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZS5cblx0Z2V0OiBmdW5jdGlvbihhdHRyKSB7XG5cdHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbYXR0cl07XG5cdH0sXG5cblx0Ly8gR2V0IHRoZSBIVE1MLWVzY2FwZWQgdmFsdWUgb2YgYW4gYXR0cmlidXRlLlxuXHRlc2NhcGU6IGZ1bmN0aW9uKGF0dHIpIHtcblx0dmFyIGh0bWw7XG5cdGlmIChodG1sID0gdGhpcy5fZXNjYXBlZEF0dHJpYnV0ZXNbYXR0cl0pIHJldHVybiBodG1sO1xuXHR2YXIgdmFsID0gdGhpcy5nZXQoYXR0cik7XG5cdHJldHVybiB0aGlzLl9lc2NhcGVkQXR0cmlidXRlc1thdHRyXSA9IF8uZXNjYXBlKHZhbCA9PSBudWxsID8gJycgOiAnJyArIHZhbCk7XG5cdH0sXG5cblx0Ly8gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGF0dHJpYnV0ZSBjb250YWlucyBhIHZhbHVlIHRoYXQgaXMgbm90IG51bGxcblx0Ly8gb3IgdW5kZWZpbmVkLlxuXHRoYXM6IGZ1bmN0aW9uKGF0dHIpIHtcblx0cmV0dXJuIHRoaXMuZ2V0KGF0dHIpICE9IG51bGw7XG5cdH0sXG5cblx0Ly8gU2V0IGEgaGFzaCBvZiBtb2RlbCBhdHRyaWJ1dGVzIG9uIHRoZSBvYmplY3QsIGZpcmluZyBgXCJjaGFuZ2VcImAgdW5sZXNzXG5cdC8vIHlvdSBjaG9vc2UgdG8gc2lsZW5jZSBpdC5cblx0c2V0OiBmdW5jdGlvbihrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdHZhciBhdHRycywgYXR0ciwgdmFsO1xuXG5cdC8vIEhhbmRsZSBib3RoXG5cdGlmIChfLmlzT2JqZWN0KGtleSkgfHwga2V5ID09IG51bGwpIHtcblx0XHRhdHRycyA9IGtleTtcblx0XHRvcHRpb25zID0gdmFsdWU7XG5cdH0gZWxzZSB7XG5cdFx0YXR0cnMgPSB7fTtcblx0XHRhdHRyc1trZXldID0gdmFsdWU7XG5cdH1cblxuXHQvLyBFeHRyYWN0IGF0dHJpYnV0ZXMgYW5kIG9wdGlvbnMuXG5cdG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cdGlmICghYXR0cnMpIHJldHVybiB0aGlzO1xuXHRpZiAoYXR0cnMgaW5zdGFuY2VvZiBNb2RlbCkgYXR0cnMgPSBhdHRycy5hdHRyaWJ1dGVzO1xuXHRpZiAob3B0aW9ucy51bnNldCkgZm9yIChhdHRyIGluIGF0dHJzKSBhdHRyc1thdHRyXSA9IHZvaWQgMDtcblxuXHQvLyBSdW4gdmFsaWRhdGlvbi5cblx0aWYgKCF0aGlzLl92YWxpZGF0ZShhdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcblxuXHQvLyBDaGVjayBmb3IgY2hhbmdlcyBvZiBgaWRgLlxuXHRpZiAodGhpcy5pZEF0dHJpYnV0ZSBpbiBhdHRycykgdGhpcy5pZCA9IGF0dHJzW3RoaXMuaWRBdHRyaWJ1dGVdO1xuXG5cdHZhciBjaGFuZ2VzID0gb3B0aW9ucy5jaGFuZ2VzID0ge307XG5cdHZhciBub3cgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cdHZhciBlc2NhcGVkID0gdGhpcy5fZXNjYXBlZEF0dHJpYnV0ZXM7XG5cdHZhciBwcmV2ID0gdGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzIHx8IHt9O1xuXG5cdC8vIEZvciBlYWNoIGBzZXRgIGF0dHJpYnV0ZS4uLlxuXHRmb3IgKGF0dHIgaW4gYXR0cnMpIHtcblx0XHR2YWwgPSBhdHRyc1thdHRyXTtcblxuXHRcdC8vIElmIHRoZSBuZXcgYW5kIGN1cnJlbnQgdmFsdWUgZGlmZmVyLCByZWNvcmQgdGhlIGNoYW5nZS5cblx0XHRpZiAoIV8uaXNFcXVhbChub3dbYXR0cl0sIHZhbCkgfHwgKG9wdGlvbnMudW5zZXQgJiYgXy5oYXMobm93LCBhdHRyKSkpIHtcblx0XHRkZWxldGUgZXNjYXBlZFthdHRyXTtcblx0XHQob3B0aW9ucy5zaWxlbnQgPyB0aGlzLl9zaWxlbnQgOiBjaGFuZ2VzKVthdHRyXSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIG9yIGRlbGV0ZSB0aGUgY3VycmVudCB2YWx1ZS5cblx0XHRvcHRpb25zLnVuc2V0ID8gZGVsZXRlIG5vd1thdHRyXSA6IG5vd1thdHRyXSA9IHZhbDtcblxuXHRcdC8vIElmIHRoZSBuZXcgYW5kIHByZXZpb3VzIHZhbHVlIGRpZmZlciwgcmVjb3JkIHRoZSBjaGFuZ2UuICBJZiBub3QsXG5cdFx0Ly8gdGhlbiByZW1vdmUgY2hhbmdlcyBmb3IgdGhpcyBhdHRyaWJ1dGUuXG5cdFx0aWYgKCFfLmlzRXF1YWwocHJldlthdHRyXSwgdmFsKSB8fCAoXy5oYXMobm93LCBhdHRyKSAhPSBfLmhhcyhwcmV2LCBhdHRyKSkpIHtcblx0XHR0aGlzLmNoYW5nZWRbYXR0cl0gPSB2YWw7XG5cdFx0aWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy5fcGVuZGluZ1thdHRyXSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRkZWxldGUgdGhpcy5jaGFuZ2VkW2F0dHJdO1xuXHRcdGRlbGV0ZSB0aGlzLl9wZW5kaW5nW2F0dHJdO1xuXHRcdH1cblx0fVxuXG5cdC8vIEZpcmUgdGhlIGBcImNoYW5nZVwiYCBldmVudHMuXG5cdGlmICghb3B0aW9ucy5zaWxlbnQpIHRoaXMuY2hhbmdlKG9wdGlvbnMpO1xuXHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvLyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhlIG1vZGVsLCBmaXJpbmcgYFwiY2hhbmdlXCJgIHVubGVzcyB5b3UgY2hvb3NlXG5cdC8vIHRvIHNpbGVuY2UgaXQuIGB1bnNldGAgaXMgYSBub29wIGlmIHRoZSBhdHRyaWJ1dGUgZG9lc24ndCBleGlzdC5cblx0dW5zZXQ6IGZ1bmN0aW9uKGF0dHIsIG9wdGlvbnMpIHtcblx0KG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSkpLnVuc2V0ID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXMuc2V0KGF0dHIsIG51bGwsIG9wdGlvbnMpO1xuXHR9LFxuXG5cdC8vIENsZWFyIGFsbCBhdHRyaWJ1dGVzIG9uIHRoZSBtb2RlbCwgZmlyaW5nIGBcImNoYW5nZVwiYCB1bmxlc3MgeW91IGNob29zZVxuXHQvLyB0byBzaWxlbmNlIGl0LlxuXHRjbGVhcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXHQob3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KSkudW5zZXQgPSB0cnVlO1xuXHRyZXR1cm4gdGhpcy5zZXQoXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpLCBvcHRpb25zKTtcblx0fSxcblxuXHQvLyBGZXRjaCB0aGUgbW9kZWwgZnJvbSB0aGUgc2VydmVyLiBJZiB0aGUgc2VydmVyJ3MgcmVwcmVzZW50YXRpb24gb2YgdGhlXG5cdC8vIG1vZGVsIGRpZmZlcnMgZnJvbSBpdHMgY3VycmVudCBhdHRyaWJ1dGVzLCB0aGV5IHdpbGwgYmUgb3ZlcnJpZGVuLFxuXHQvLyB0cmlnZ2VyaW5nIGEgYFwiY2hhbmdlXCJgIGV2ZW50LlxuXHRmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyA/IF8uY2xvbmUob3B0aW9ucykgOiB7fTtcblx0dmFyIG1vZGVsID0gdGhpcztcblx0dmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG5cdG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3AsIHN0YXR1cywgeGhyKSB7XG5cdFx0aWYgKCFtb2RlbC5zZXQobW9kZWwucGFyc2UocmVzcCwgeGhyKSwgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcblx0XHRpZiAoc3VjY2Vzcykgc3VjY2Vzcyhtb2RlbCwgcmVzcCk7XG5cdH07XG5cdG9wdGlvbnMuZXJyb3IgPSBCYWNrYm9uZS53cmFwRXJyb3Iob3B0aW9ucy5lcnJvciwgbW9kZWwsIG9wdGlvbnMpO1xuXHRyZXR1cm4gKHRoaXMuc3luYyB8fCBCYWNrYm9uZS5zeW5jKS5jYWxsKHRoaXMsICdyZWFkJywgdGhpcywgb3B0aW9ucyk7XG5cdH0sXG5cblx0Ly8gU2V0IGEgaGFzaCBvZiBtb2RlbCBhdHRyaWJ1dGVzLCBhbmQgc3luYyB0aGUgbW9kZWwgdG8gdGhlIHNlcnZlci5cblx0Ly8gSWYgdGhlIHNlcnZlciByZXR1cm5zIGFuIGF0dHJpYnV0ZXMgaGFzaCB0aGF0IGRpZmZlcnMsIHRoZSBtb2RlbCdzXG5cdC8vIHN0YXRlIHdpbGwgYmUgYHNldGAgYWdhaW4uXG5cdHNhdmU6IGZ1bmN0aW9uKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0dmFyIGF0dHJzLCBjdXJyZW50O1xuXG5cdC8vIEhhbmRsZSBib3RoIGAoXCJrZXlcIiwgdmFsdWUpYCBhbmQgYCh7a2V5OiB2YWx1ZX0pYCAtc3R5bGUgY2FsbHMuXG5cdGlmIChfLmlzT2JqZWN0KGtleSkgfHwga2V5ID09IG51bGwpIHtcblx0XHRhdHRycyA9IGtleTtcblx0XHRvcHRpb25zID0gdmFsdWU7XG5cdH0gZWxzZSB7XG5cdFx0YXR0cnMgPSB7fTtcblx0XHRhdHRyc1trZXldID0gdmFsdWU7XG5cdH1cblx0b3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG5cblx0Ly8gSWYgd2UncmUgXCJ3YWl0XCItaW5nIHRvIHNldCBjaGFuZ2VkIGF0dHJpYnV0ZXMsIHZhbGlkYXRlIGVhcmx5LlxuXHRpZiAob3B0aW9ucy53YWl0KSB7XG5cdFx0aWYgKCF0aGlzLl92YWxpZGF0ZShhdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcblx0XHRjdXJyZW50ID0gXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpO1xuXHR9XG5cblx0Ly8gUmVndWxhciBzYXZlcyBgc2V0YCBhdHRyaWJ1dGVzIGJlZm9yZSBwZXJzaXN0aW5nIHRvIHRoZSBzZXJ2ZXIuXG5cdHZhciBzaWxlbnRPcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMsIHtzaWxlbnQ6IHRydWV9KTtcblx0aWYgKGF0dHJzICYmICF0aGlzLnNldChhdHRycywgb3B0aW9ucy53YWl0ID8gc2lsZW50T3B0aW9ucyA6IG9wdGlvbnMpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gQWZ0ZXIgYSBzdWNjZXNzZnVsIHNlcnZlci1zaWRlIHNhdmUsIHRoZSBjbGllbnQgaXMgKG9wdGlvbmFsbHkpXG5cdC8vIHVwZGF0ZWQgd2l0aCB0aGUgc2VydmVyLXNpZGUgc3RhdGUuXG5cdHZhciBtb2RlbCA9IHRoaXM7XG5cdHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXHRvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwLCBzdGF0dXMsIHhocikge1xuXHRcdHZhciBzZXJ2ZXJBdHRycyA9IG1vZGVsLnBhcnNlKHJlc3AsIHhocik7XG5cdFx0aWYgKG9wdGlvbnMud2FpdCkge1xuXHRcdGRlbGV0ZSBvcHRpb25zLndhaXQ7XG5cdFx0c2VydmVyQXR0cnMgPSBfLmV4dGVuZChhdHRycyB8fCB7fSwgc2VydmVyQXR0cnMpO1xuXHRcdH1cblx0XHRpZiAoIW1vZGVsLnNldChzZXJ2ZXJBdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcblx0XHRpZiAoc3VjY2Vzcykge1xuXHRcdHN1Y2Nlc3MobW9kZWwsIHJlc3ApO1xuXHRcdH0gZWxzZSB7XG5cdFx0bW9kZWwudHJpZ2dlcignc3luYycsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gRmluaXNoIGNvbmZpZ3VyaW5nIGFuZCBzZW5kaW5nIHRoZSBBamF4IHJlcXVlc3QuXG5cdG9wdGlvbnMuZXJyb3IgPSBCYWNrYm9uZS53cmFwRXJyb3Iob3B0aW9ucy5lcnJvciwgbW9kZWwsIG9wdGlvbnMpO1xuXHR2YXIgbWV0aG9kID0gdGhpcy5pc05ldygpID8gJ2NyZWF0ZScgOiAndXBkYXRlJztcblx0dmFyIHhociA9ICh0aGlzLnN5bmMgfHwgQmFja2JvbmUuc3luYykuY2FsbCh0aGlzLCBtZXRob2QsIHRoaXMsIG9wdGlvbnMpO1xuXHRpZiAob3B0aW9ucy53YWl0KSB0aGlzLnNldChjdXJyZW50LCBzaWxlbnRPcHRpb25zKTtcblx0cmV0dXJuIHhocjtcblx0fSxcblxuXHQvLyBEZXN0cm95IHRoaXMgbW9kZWwgb24gdGhlIHNlcnZlciBpZiBpdCB3YXMgYWxyZWFkeSBwZXJzaXN0ZWQuXG5cdC8vIE9wdGltaXN0aWNhbGx5IHJlbW92ZXMgdGhlIG1vZGVsIGZyb20gaXRzIGNvbGxlY3Rpb24sIGlmIGl0IGhhcyBvbmUuXG5cdC8vIElmIGB3YWl0OiB0cnVlYCBpcyBwYXNzZWQsIHdhaXRzIGZvciB0aGUgc2VydmVyIHRvIHJlc3BvbmQgYmVmb3JlIHJlbW92YWwuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG5cdHZhciBtb2RlbCA9IHRoaXM7XG5cdHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXG5cdHZhciB0cmlnZ2VyRGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRcdG1vZGVsLnRyaWdnZXIoJ2Rlc3Ryb3knLCBtb2RlbCwgbW9kZWwuY29sbGVjdGlvbiwgb3B0aW9ucyk7XG5cdH07XG5cblx0aWYgKHRoaXMuaXNOZXcoKSkge1xuXHRcdHRyaWdnZXJEZXN0cm95KCk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0b3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuXHRcdGlmIChvcHRpb25zLndhaXQpIHRyaWdnZXJEZXN0cm95KCk7XG5cdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRzdWNjZXNzKG1vZGVsLCByZXNwKTtcblx0XHR9IGVsc2Uge1xuXHRcdG1vZGVsLnRyaWdnZXIoJ3N5bmMnLCBtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG5cdFx0fVxuXHR9O1xuXG5cdG9wdGlvbnMuZXJyb3IgPSBCYWNrYm9uZS53cmFwRXJyb3Iob3B0aW9ucy5lcnJvciwgbW9kZWwsIG9wdGlvbnMpO1xuXHR2YXIgeGhyID0gKHRoaXMuc3luYyB8fCBCYWNrYm9uZS5zeW5jKS5jYWxsKHRoaXMsICdkZWxldGUnLCB0aGlzLCBvcHRpb25zKTtcblx0aWYgKCFvcHRpb25zLndhaXQpIHRyaWdnZXJEZXN0cm95KCk7XG5cdHJldHVybiB4aHI7XG5cdH0sXG5cblx0Ly8gRGVmYXVsdCBVUkwgZm9yIHRoZSBtb2RlbCdzIHJlcHJlc2VudGF0aW9uIG9uIHRoZSBzZXJ2ZXIgLS0gaWYgeW91J3JlXG5cdC8vIHVzaW5nIEJhY2tib25lJ3MgcmVzdGZ1bCBtZXRob2RzLCBvdmVycmlkZSB0aGlzIHRvIGNoYW5nZSB0aGUgZW5kcG9pbnRcblx0Ly8gdGhhdCB3aWxsIGJlIGNhbGxlZC5cblx0dXJsOiBmdW5jdGlvbigpIHtcblx0dmFyIGJhc2UgPSBnZXRWYWx1ZSh0aGlzLCAndXJsUm9vdCcpIHx8IGdldFZhbHVlKHRoaXMuY29sbGVjdGlvbiwgJ3VybCcpIHx8IHVybEVycm9yKCk7XG5cdGlmICh0aGlzLmlzTmV3KCkpIHJldHVybiBiYXNlO1xuXHRyZXR1cm4gYmFzZSArIChiYXNlLmNoYXJBdChiYXNlLmxlbmd0aCAtIDEpID09ICcvJyA/ICcnIDogJy8nKSArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLmlkKTtcblx0fSxcblxuXHQvLyAqKnBhcnNlKiogY29udmVydHMgYSByZXNwb25zZSBpbnRvIHRoZSBoYXNoIG9mIGF0dHJpYnV0ZXMgdG8gYmUgYHNldGAgb25cblx0Ly8gdGhlIG1vZGVsLiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyBqdXN0IHRvIHBhc3MgdGhlIHJlc3BvbnNlIGFsb25nLlxuXHRwYXJzZTogZnVuY3Rpb24ocmVzcCwgeGhyKSB7XG5cdHJldHVybiByZXNwO1xuXHR9LFxuXG5cdC8vIENyZWF0ZSBhIG5ldyBtb2RlbCB3aXRoIGlkZW50aWNhbCBhdHRyaWJ1dGVzIHRvIHRoaXMgb25lLlxuXHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLmF0dHJpYnV0ZXMpO1xuXHR9LFxuXG5cdC8vIEEgbW9kZWwgaXMgbmV3IGlmIGl0IGhhcyBuZXZlciBiZWVuIHNhdmVkIHRvIHRoZSBzZXJ2ZXIsIGFuZCBsYWNrcyBhbiBpZC5cblx0aXNOZXc6IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5pZCA9PSBudWxsO1xuXHR9LFxuXG5cdC8vIENhbGwgdGhpcyBtZXRob2QgdG8gbWFudWFsbHkgZmlyZSBhIGBcImNoYW5nZVwiYCBldmVudCBmb3IgdGhpcyBtb2RlbCBhbmRcblx0Ly8gYSBgXCJjaGFuZ2U6YXR0cmlidXRlXCJgIGV2ZW50IGZvciBlYWNoIGNoYW5nZWQgYXR0cmlidXRlLlxuXHQvLyBDYWxsaW5nIHRoaXMgd2lsbCBjYXVzZSBhbGwgb2JqZWN0cyBvYnNlcnZpbmcgdGhlIG1vZGVsIHRvIHVwZGF0ZS5cblx0Y2hhbmdlOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cdHZhciBjaGFuZ2luZyA9IHRoaXMuX2NoYW5naW5nO1xuXHR0aGlzLl9jaGFuZ2luZyA9IHRydWU7XG5cblx0Ly8gU2lsZW50IGNoYW5nZXMgYmVjb21lIHBlbmRpbmcgY2hhbmdlcy5cblx0Zm9yICh2YXIgYXR0ciBpbiB0aGlzLl9zaWxlbnQpIHRoaXMuX3BlbmRpbmdbYXR0cl0gPSB0cnVlO1xuXG5cdC8vIFNpbGVudCBjaGFuZ2VzIGFyZSB0cmlnZ2VyZWQuXG5cdHZhciBjaGFuZ2VzID0gXy5leHRlbmQoe30sIG9wdGlvbnMuY2hhbmdlcywgdGhpcy5fc2lsZW50KTtcblx0dGhpcy5fc2lsZW50ID0ge307XG5cdGZvciAodmFyIGF0dHIgaW4gY2hhbmdlcykge1xuXHRcdHRoaXMudHJpZ2dlcignY2hhbmdlOicgKyBhdHRyLCB0aGlzLCB0aGlzLmdldChhdHRyKSwgb3B0aW9ucyk7XG5cdH1cblx0aWYgKGNoYW5naW5nKSByZXR1cm4gdGhpcztcblxuXHQvLyBDb250aW51ZSBmaXJpbmcgYFwiY2hhbmdlXCJgIGV2ZW50cyB3aGlsZSB0aGVyZSBhcmUgcGVuZGluZyBjaGFuZ2VzLlxuXHR3aGlsZSAoIV8uaXNFbXB0eSh0aGlzLl9wZW5kaW5nKSkge1xuXHRcdHRoaXMuX3BlbmRpbmcgPSB7fTtcblx0XHR0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMsIG9wdGlvbnMpO1xuXHRcdC8vIFBlbmRpbmcgYW5kIHNpbGVudCBjaGFuZ2VzIHN0aWxsIHJlbWFpbi5cblx0XHRmb3IgKHZhciBhdHRyIGluIHRoaXMuY2hhbmdlZCkge1xuXHRcdGlmICh0aGlzLl9wZW5kaW5nW2F0dHJdIHx8IHRoaXMuX3NpbGVudFthdHRyXSkgY29udGludWU7XG5cdFx0ZGVsZXRlIHRoaXMuY2hhbmdlZFthdHRyXTtcblx0XHR9XG5cdFx0dGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzID0gXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpO1xuXHR9XG5cblx0dGhpcy5fY2hhbmdpbmcgPSBmYWxzZTtcblx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Ly8gRGV0ZXJtaW5lIGlmIHRoZSBtb2RlbCBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBgXCJjaGFuZ2VcImAgZXZlbnQuXG5cdC8vIElmIHlvdSBzcGVjaWZ5IGFuIGF0dHJpYnV0ZSBuYW1lLCBkZXRlcm1pbmUgaWYgdGhhdCBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXG5cdGhhc0NoYW5nZWQ6IGZ1bmN0aW9uKGF0dHIpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gIV8uaXNFbXB0eSh0aGlzLmNoYW5nZWQpO1xuXHRyZXR1cm4gXy5oYXModGhpcy5jaGFuZ2VkLCBhdHRyKTtcblx0fSxcblxuXHQvLyBSZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBjaGFuZ2VkLCBvclxuXHQvLyBmYWxzZSBpZiB0aGVyZSBhcmUgbm8gY2hhbmdlZCBhdHRyaWJ1dGVzLiBVc2VmdWwgZm9yIGRldGVybWluaW5nIHdoYXRcblx0Ly8gcGFydHMgb2YgYSB2aWV3IG5lZWQgdG8gYmUgdXBkYXRlZCBhbmQvb3Igd2hhdCBhdHRyaWJ1dGVzIG5lZWQgdG8gYmVcblx0Ly8gcGVyc2lzdGVkIHRvIHRoZSBzZXJ2ZXIuIFVuc2V0IGF0dHJpYnV0ZXMgd2lsbCBiZSBzZXQgdG8gdW5kZWZpbmVkLlxuXHQvLyBZb3UgY2FuIGFsc28gcGFzcyBhbiBhdHRyaWJ1dGVzIG9iamVjdCB0byBkaWZmIGFnYWluc3QgdGhlIG1vZGVsLFxuXHQvLyBkZXRlcm1pbmluZyBpZiB0aGVyZSAqd291bGQgYmUqIGEgY2hhbmdlLlxuXHRjaGFuZ2VkQXR0cmlidXRlczogZnVuY3Rpb24oZGlmZikge1xuXHRpZiAoIWRpZmYpIHJldHVybiB0aGlzLmhhc0NoYW5nZWQoKSA/IF8uY2xvbmUodGhpcy5jaGFuZ2VkKSA6IGZhbHNlO1xuXHR2YXIgdmFsLCBjaGFuZ2VkID0gZmFsc2UsIG9sZCA9IHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcztcblx0Zm9yICh2YXIgYXR0ciBpbiBkaWZmKSB7XG5cdFx0aWYgKF8uaXNFcXVhbChvbGRbYXR0cl0sICh2YWwgPSBkaWZmW2F0dHJdKSkpIGNvbnRpbnVlO1xuXHRcdChjaGFuZ2VkIHx8IChjaGFuZ2VkID0ge30pKVthdHRyXSA9IHZhbDtcblx0fVxuXHRyZXR1cm4gY2hhbmdlZDtcblx0fSxcblxuXHQvLyBHZXQgdGhlIHByZXZpb3VzIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSwgcmVjb3JkZWQgYXQgdGhlIHRpbWUgdGhlIGxhc3Rcblx0Ly8gYFwiY2hhbmdlXCJgIGV2ZW50IHdhcyBmaXJlZC5cblx0cHJldmlvdXM6IGZ1bmN0aW9uKGF0dHIpIHtcblx0aWYgKCFhcmd1bWVudHMubGVuZ3RoIHx8ICF0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMpIHJldHVybiBudWxsO1xuXHRyZXR1cm4gdGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzW2F0dHJdO1xuXHR9LFxuXG5cdC8vIEdldCBhbGwgb2YgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG1vZGVsIGF0IHRoZSB0aW1lIG9mIHRoZSBwcmV2aW91c1xuXHQvLyBgXCJjaGFuZ2VcImAgZXZlbnQuXG5cdHByZXZpb3VzQXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdHJldHVybiBfLmNsb25lKHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcyk7XG5cdH0sXG5cblx0Ly8gQ2hlY2sgaWYgdGhlIG1vZGVsIGlzIGN1cnJlbnRseSBpbiBhIHZhbGlkIHN0YXRlLiBJdCdzIG9ubHkgcG9zc2libGUgdG9cblx0Ly8gZ2V0IGludG8gYW4gKmludmFsaWQqIHN0YXRlIGlmIHlvdSdyZSB1c2luZyBzaWxlbnQgY2hhbmdlcy5cblx0aXNWYWxpZDogZnVuY3Rpb24oKSB7XG5cdHJldHVybiAhdGhpcy52YWxpZGF0ZSh0aGlzLmF0dHJpYnV0ZXMpO1xuXHR9LFxuXG5cdC8vIFJ1biB2YWxpZGF0aW9uIGFnYWluc3QgdGhlIG5leHQgY29tcGxldGUgc2V0IG9mIG1vZGVsIGF0dHJpYnV0ZXMsXG5cdC8vIHJldHVybmluZyBgdHJ1ZWAgaWYgYWxsIGlzIHdlbGwuIElmIGEgc3BlY2lmaWMgYGVycm9yYCBjYWxsYmFjayBoYXNcblx0Ly8gYmVlbiBwYXNzZWQsIGNhbGwgdGhhdCBpbnN0ZWFkIG9mIGZpcmluZyB0aGUgZ2VuZXJhbCBgXCJlcnJvclwiYCBldmVudC5cblx0X3ZhbGlkYXRlOiBmdW5jdGlvbihhdHRycywgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5zaWxlbnQgfHwgIXRoaXMudmFsaWRhdGUpIHJldHVybiB0cnVlO1xuXHRhdHRycyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmF0dHJpYnV0ZXMsIGF0dHJzKTtcblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZShhdHRycywgb3B0aW9ucyk7XG5cdGlmICghZXJyb3IpIHJldHVybiB0cnVlO1xuXHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVycm9yKSB7XG5cdFx0b3B0aW9ucy5lcnJvcih0aGlzLCBlcnJvciwgb3B0aW9ucyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy50cmlnZ2VyKCdlcnJvcicsIHRoaXMsIGVycm9yLCBvcHRpb25zKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG5cdH1cblxufSk7XG5cbi8vIEJhY2tib25lLkNvbGxlY3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gUHJvdmlkZXMgYSBzdGFuZGFyZCBjb2xsZWN0aW9uIGNsYXNzIGZvciBvdXIgc2V0cyBvZiBtb2RlbHMsIG9yZGVyZWRcbi8vIG9yIHVub3JkZXJlZC4gSWYgYSBgY29tcGFyYXRvcmAgaXMgc3BlY2lmaWVkLCB0aGUgQ29sbGVjdGlvbiB3aWxsIG1haW50YWluXG4vLyBpdHMgbW9kZWxzIGluIHNvcnQgb3JkZXIsIGFzIHRoZXkncmUgYWRkZWQgYW5kIHJlbW92ZWQuXG52YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24gPSBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblx0aWYgKG9wdGlvbnMubW9kZWwpIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXHRpZiAob3B0aW9ucy5jb21wYXJhdG9yKSB0aGlzLmNvbXBhcmF0b3IgPSBvcHRpb25zLmNvbXBhcmF0b3I7XG5cdHRoaXMuX3Jlc2V0KCk7XG5cdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRpZiAobW9kZWxzKSB0aGlzLnJlc2V0KG1vZGVscywge3NpbGVudDogdHJ1ZSwgcGFyc2U6IG9wdGlvbnMucGFyc2V9KTtcbn07XG5cbi8vIERlZmluZSB0aGUgQ29sbGVjdGlvbidzIGluaGVyaXRhYmxlIG1ldGhvZHMuXG5fLmV4dGVuZChDb2xsZWN0aW9uLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cblx0Ly8gVGhlIGRlZmF1bHQgbW9kZWwgZm9yIGEgY29sbGVjdGlvbiBpcyBqdXN0IGEgKipCYWNrYm9uZS5Nb2RlbCoqLlxuXHQvLyBUaGlzIHNob3VsZCBiZSBvdmVycmlkZGVuIGluIG1vc3QgY2FzZXMuXG5cdG1vZGVsOiBNb2RlbCxcblxuXHQvLyBJbml0aWFsaXplIGlzIGFuIGVtcHR5IGZ1bmN0aW9uIGJ5IGRlZmF1bHQuIE92ZXJyaWRlIGl0IHdpdGggeW91ciBvd25cblx0Ly8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblxuXHQvLyBUaGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiBhIENvbGxlY3Rpb24gaXMgYW4gYXJyYXkgb2YgdGhlXG5cdC8vIG1vZGVscycgYXR0cmlidXRlcy5cblx0dG9KU09OOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbihtb2RlbCl7IHJldHVybiBtb2RlbC50b0pTT04ob3B0aW9ucyk7IH0pO1xuXHR9LFxuXG5cdC8vIEFkZCBhIG1vZGVsLCBvciBsaXN0IG9mIG1vZGVscyB0byB0aGUgc2V0LiBQYXNzICoqc2lsZW50KiogdG8gYXZvaWRcblx0Ly8gZmlyaW5nIHRoZSBgYWRkYCBldmVudCBmb3IgZXZlcnkgbmV3IG1vZGVsLlxuXHRhZGQ6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuXHR2YXIgaSwgaW5kZXgsIGxlbmd0aCwgbW9kZWwsIGNpZCwgaWQsIGNpZHMgPSB7fSwgaWRzID0ge30sIGR1cHMgPSBbXTtcblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblx0bW9kZWxzID0gXy5pc0FycmF5KG1vZGVscykgPyBtb2RlbHMuc2xpY2UoKSA6IFttb2RlbHNdO1xuXG5cdC8vIEJlZ2luIGJ5IHR1cm5pbmcgYmFyZSBvYmplY3RzIGludG8gbW9kZWwgcmVmZXJlbmNlcywgYW5kIHByZXZlbnRpbmdcblx0Ly8gaW52YWxpZCBtb2RlbHMgb3IgZHVwbGljYXRlIG1vZGVscyBmcm9tIGJlaW5nIGFkZGVkLlxuXHRmb3IgKGkgPSAwLCBsZW5ndGggPSBtb2RlbHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoIShtb2RlbCA9IG1vZGVsc1tpXSA9IHRoaXMuX3ByZXBhcmVNb2RlbChtb2RlbHNbaV0sIG9wdGlvbnMpKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhbiBpbnZhbGlkIG1vZGVsIHRvIGEgY29sbGVjdGlvblwiKTtcblx0XHR9XG5cdFx0Y2lkID0gbW9kZWwuY2lkO1xuXHRcdGlkID0gbW9kZWwuaWQ7XG5cdFx0aWYgKGNpZHNbY2lkXSB8fCB0aGlzLl9ieUNpZFtjaWRdIHx8ICgoaWQgIT0gbnVsbCkgJiYgKGlkc1tpZF0gfHwgdGhpcy5fYnlJZFtpZF0pKSkge1xuXHRcdGR1cHMucHVzaChpKTtcblx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0Y2lkc1tjaWRdID0gaWRzW2lkXSA9IG1vZGVsO1xuXHR9XG5cblx0Ly8gUmVtb3ZlIGR1cGxpY2F0ZXMuXG5cdGkgPSBkdXBzLmxlbmd0aDtcblx0d2hpbGUgKGktLSkge1xuXHRcdG1vZGVscy5zcGxpY2UoZHVwc1tpXSwgMSk7XG5cdH1cblxuXHQvLyBMaXN0ZW4gdG8gYWRkZWQgbW9kZWxzJyBldmVudHMsIGFuZCBpbmRleCBtb2RlbHMgZm9yIGxvb2t1cCBieVxuXHQvLyBgaWRgIGFuZCBieSBgY2lkYC5cblx0Zm9yIChpID0gMCwgbGVuZ3RoID0gbW9kZWxzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0KG1vZGVsID0gbW9kZWxzW2ldKS5vbignYWxsJywgdGhpcy5fb25Nb2RlbEV2ZW50LCB0aGlzKTtcblx0XHR0aGlzLl9ieUNpZFttb2RlbC5jaWRdID0gbW9kZWw7XG5cdFx0aWYgKG1vZGVsLmlkICE9IG51bGwpIHRoaXMuX2J5SWRbbW9kZWwuaWRdID0gbW9kZWw7XG5cdH1cblxuXHQvLyBJbnNlcnQgbW9kZWxzIGludG8gdGhlIGNvbGxlY3Rpb24sIHJlLXNvcnRpbmcgaWYgbmVlZGVkLCBhbmQgdHJpZ2dlcmluZ1xuXHQvLyBgYWRkYCBldmVudHMgdW5sZXNzIHNpbGVuY2VkLlxuXHR0aGlzLmxlbmd0aCArPSBsZW5ndGg7XG5cdGluZGV4ID0gb3B0aW9ucy5hdCAhPSBudWxsID8gb3B0aW9ucy5hdCA6IHRoaXMubW9kZWxzLmxlbmd0aDtcblx0c3BsaWNlLmFwcGx5KHRoaXMubW9kZWxzLCBbaW5kZXgsIDBdLmNvbmNhdChtb2RlbHMpKTtcblx0aWYgKHRoaXMuY29tcGFyYXRvcikgdGhpcy5zb3J0KHtzaWxlbnQ6IHRydWV9KTtcblx0aWYgKG9wdGlvbnMuc2lsZW50KSByZXR1cm4gdGhpcztcblx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdGhpcy5tb2RlbHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoIWNpZHNbKG1vZGVsID0gdGhpcy5tb2RlbHNbaV0pLmNpZF0pIGNvbnRpbnVlO1xuXHRcdG9wdGlvbnMuaW5kZXggPSBpO1xuXHRcdG1vZGVsLnRyaWdnZXIoJ2FkZCcsIG1vZGVsLCB0aGlzLCBvcHRpb25zKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvLyBSZW1vdmUgYSBtb2RlbCwgb3IgYSBsaXN0IG9mIG1vZGVscyBmcm9tIHRoZSBzZXQuIFBhc3Mgc2lsZW50IHRvIGF2b2lkXG5cdC8vIGZpcmluZyB0aGUgYHJlbW92ZWAgZXZlbnQgZm9yIGV2ZXJ5IG1vZGVsIHJlbW92ZWQuXG5cdHJlbW92ZTogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG5cdHZhciBpLCBsLCBpbmRleCwgbW9kZWw7XG5cdG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cdG1vZGVscyA9IF8uaXNBcnJheShtb2RlbHMpID8gbW9kZWxzLnNsaWNlKCkgOiBbbW9kZWxzXTtcblx0Zm9yIChpID0gMCwgbCA9IG1vZGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRtb2RlbCA9IHRoaXMuZ2V0QnlDaWQobW9kZWxzW2ldKSB8fCB0aGlzLmdldChtb2RlbHNbaV0pO1xuXHRcdGlmICghbW9kZWwpIGNvbnRpbnVlO1xuXHRcdGRlbGV0ZSB0aGlzLl9ieUlkW21vZGVsLmlkXTtcblx0XHRkZWxldGUgdGhpcy5fYnlDaWRbbW9kZWwuY2lkXTtcblx0XHRpbmRleCA9IHRoaXMuaW5kZXhPZihtb2RlbCk7XG5cdFx0dGhpcy5tb2RlbHMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR0aGlzLmxlbmd0aC0tO1xuXHRcdGlmICghb3B0aW9ucy5zaWxlbnQpIHtcblx0XHRvcHRpb25zLmluZGV4ID0gaW5kZXg7XG5cdFx0bW9kZWwudHJpZ2dlcigncmVtb3ZlJywgbW9kZWwsIHRoaXMsIG9wdGlvbnMpO1xuXHRcdH1cblx0XHR0aGlzLl9yZW1vdmVSZWZlcmVuY2UobW9kZWwpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8vIEFkZCBhIG1vZGVsIHRvIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG5cdHB1c2g6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG5cdG1vZGVsID0gdGhpcy5fcHJlcGFyZU1vZGVsKG1vZGVsLCBvcHRpb25zKTtcblx0dGhpcy5hZGQobW9kZWwsIG9wdGlvbnMpO1xuXHRyZXR1cm4gbW9kZWw7XG5cdH0sXG5cblx0Ly8gUmVtb3ZlIGEgbW9kZWwgZnJvbSB0aGUgZW5kIG9mIHRoZSBjb2xsZWN0aW9uLlxuXHRwb3A6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dmFyIG1vZGVsID0gdGhpcy5hdCh0aGlzLmxlbmd0aCAtIDEpO1xuXHR0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG5cdHJldHVybiBtb2RlbDtcblx0fSxcblxuXHQvLyBBZGQgYSBtb2RlbCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjb2xsZWN0aW9uLlxuXHR1bnNoaWZ0OiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuXHRtb2RlbCA9IHRoaXMuX3ByZXBhcmVNb2RlbChtb2RlbCwgb3B0aW9ucyk7XG5cdHRoaXMuYWRkKG1vZGVsLCBfLmV4dGVuZCh7YXQ6IDB9LCBvcHRpb25zKSk7XG5cdHJldHVybiBtb2RlbDtcblx0fSxcblxuXHQvLyBSZW1vdmUgYSBtb2RlbCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24uXG5cdHNoaWZ0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHZhciBtb2RlbCA9IHRoaXMuYXQoMCk7XG5cdHRoaXMucmVtb3ZlKG1vZGVsLCBvcHRpb25zKTtcblx0cmV0dXJuIG1vZGVsO1xuXHR9LFxuXG5cdC8vIEdldCBhIG1vZGVsIGZyb20gdGhlIHNldCBieSBpZC5cblx0Z2V0OiBmdW5jdGlvbihpZCkge1xuXHRpZiAoaWQgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcblx0cmV0dXJuIHRoaXMuX2J5SWRbaWQuaWQgIT0gbnVsbCA/IGlkLmlkIDogaWRdO1xuXHR9LFxuXG5cdC8vIEdldCBhIG1vZGVsIGZyb20gdGhlIHNldCBieSBjbGllbnQgaWQuXG5cdGdldEJ5Q2lkOiBmdW5jdGlvbihjaWQpIHtcblx0cmV0dXJuIGNpZCAmJiB0aGlzLl9ieUNpZFtjaWQuY2lkIHx8IGNpZF07XG5cdH0sXG5cblx0Ly8gR2V0IHRoZSBtb2RlbCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG5cdGF0OiBmdW5jdGlvbihpbmRleCkge1xuXHRyZXR1cm4gdGhpcy5tb2RlbHNbaW5kZXhdO1xuXHR9LFxuXG5cdC8vIFJldHVybiBtb2RlbHMgd2l0aCBtYXRjaGluZyBhdHRyaWJ1dGVzLiBVc2VmdWwgZm9yIHNpbXBsZSBjYXNlcyBvZiBgZmlsdGVyYC5cblx0d2hlcmU6IGZ1bmN0aW9uKGF0dHJzKSB7XG5cdGlmIChfLmlzRW1wdHkoYXR0cnMpKSByZXR1cm4gW107XG5cdHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbihtb2RlbCkge1xuXHRcdGZvciAodmFyIGtleSBpbiBhdHRycykge1xuXHRcdGlmIChhdHRyc1trZXldICE9PSBtb2RlbC5nZXQoa2V5KSkgcmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSk7XG5cdH0sXG5cblx0Ly8gRm9yY2UgdGhlIGNvbGxlY3Rpb24gdG8gcmUtc29ydCBpdHNlbGYuIFlvdSBkb24ndCBuZWVkIHRvIGNhbGwgdGhpcyB1bmRlclxuXHQvLyBub3JtYWwgY2lyY3Vtc3RhbmNlcywgYXMgdGhlIHNldCB3aWxsIG1haW50YWluIHNvcnQgb3JkZXIgYXMgZWFjaCBpdGVtXG5cdC8vIGlzIGFkZGVkLlxuXHRzb3J0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cdGlmICghdGhpcy5jb21wYXJhdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzb3J0IGEgc2V0IHdpdGhvdXQgYSBjb21wYXJhdG9yJyk7XG5cdHZhciBib3VuZENvbXBhcmF0b3IgPSBfLmJpbmQodGhpcy5jb21wYXJhdG9yLCB0aGlzKTtcblx0aWYgKHRoaXMuY29tcGFyYXRvci5sZW5ndGggPT0gMSkge1xuXHRcdHRoaXMubW9kZWxzID0gdGhpcy5zb3J0QnkoYm91bmRDb21wYXJhdG9yKTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLm1vZGVscy5zb3J0KGJvdW5kQ29tcGFyYXRvcik7XG5cdH1cblx0aWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdyZXNldCcsIHRoaXMsIG9wdGlvbnMpO1xuXHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvLyBQbHVjayBhbiBhdHRyaWJ1dGUgZnJvbSBlYWNoIG1vZGVsIGluIHRoZSBjb2xsZWN0aW9uLlxuXHRwbHVjazogZnVuY3Rpb24oYXR0cikge1xuXHRyZXR1cm4gXy5tYXAodGhpcy5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKXsgcmV0dXJuIG1vZGVsLmdldChhdHRyKTsgfSk7XG5cdH0sXG5cblx0Ly8gV2hlbiB5b3UgaGF2ZSBtb3JlIGl0ZW1zIHRoYW4geW91IHdhbnQgdG8gYWRkIG9yIHJlbW92ZSBpbmRpdmlkdWFsbHksXG5cdC8vIHlvdSBjYW4gcmVzZXQgdGhlIGVudGlyZSBzZXQgd2l0aCBhIG5ldyBsaXN0IG9mIG1vZGVscywgd2l0aG91dCBmaXJpbmdcblx0Ly8gYW55IGBhZGRgIG9yIGByZW1vdmVgIGV2ZW50cy4gRmlyZXMgYHJlc2V0YCB3aGVuIGZpbmlzaGVkLlxuXHRyZXNldDogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG5cdG1vZGVscyAgfHwgKG1vZGVscyA9IFtdKTtcblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLm1vZGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR0aGlzLl9yZW1vdmVSZWZlcmVuY2UodGhpcy5tb2RlbHNbaV0pO1xuXHR9XG5cdHRoaXMuX3Jlc2V0KCk7XG5cdHRoaXMuYWRkKG1vZGVscywgXy5leHRlbmQoe3NpbGVudDogdHJ1ZX0sIG9wdGlvbnMpKTtcblx0aWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdyZXNldCcsIHRoaXMsIG9wdGlvbnMpO1xuXHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvLyBGZXRjaCB0aGUgZGVmYXVsdCBzZXQgb2YgbW9kZWxzIGZvciB0aGlzIGNvbGxlY3Rpb24sIHJlc2V0dGluZyB0aGVcblx0Ly8gY29sbGVjdGlvbiB3aGVuIHRoZXkgYXJyaXZlLiBJZiBgYWRkOiB0cnVlYCBpcyBwYXNzZWQsIGFwcGVuZHMgdGhlXG5cdC8vIG1vZGVscyB0byB0aGUgY29sbGVjdGlvbiBpbnN0ZWFkIG9mIHJlc2V0dGluZy5cblx0ZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG5cdGlmIChvcHRpb25zLnBhcnNlID09PSB1bmRlZmluZWQpIG9wdGlvbnMucGFyc2UgPSB0cnVlO1xuXHR2YXIgY29sbGVjdGlvbiA9IHRoaXM7XG5cdHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXHRvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwLCBzdGF0dXMsIHhocikge1xuXHRcdGNvbGxlY3Rpb25bb3B0aW9ucy5hZGQgPyAnYWRkJyA6ICdyZXNldCddKGNvbGxlY3Rpb24ucGFyc2UocmVzcCwgeGhyKSwgb3B0aW9ucyk7XG5cdFx0aWYgKHN1Y2Nlc3MpIHN1Y2Nlc3MoY29sbGVjdGlvbiwgcmVzcCk7XG5cdH07XG5cdG9wdGlvbnMuZXJyb3IgPSBCYWNrYm9uZS53cmFwRXJyb3Iob3B0aW9ucy5lcnJvciwgY29sbGVjdGlvbiwgb3B0aW9ucyk7XG5cdHJldHVybiAodGhpcy5zeW5jIHx8IEJhY2tib25lLnN5bmMpLmNhbGwodGhpcywgJ3JlYWQnLCB0aGlzLCBvcHRpb25zKTtcblx0fSxcblxuXHQvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBtb2RlbCBpbiB0aGlzIGNvbGxlY3Rpb24uIEFkZCB0aGUgbW9kZWwgdG8gdGhlXG5cdC8vIGNvbGxlY3Rpb24gaW1tZWRpYXRlbHksIHVubGVzcyBgd2FpdDogdHJ1ZWAgaXMgcGFzc2VkLCBpbiB3aGljaCBjYXNlIHdlXG5cdC8vIHdhaXQgZm9yIHRoZSBzZXJ2ZXIgdG8gYWdyZWUuXG5cdGNyZWF0ZTogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcblx0dmFyIGNvbGwgPSB0aGlzO1xuXHRvcHRpb25zID0gb3B0aW9ucyA/IF8uY2xvbmUob3B0aW9ucykgOiB7fTtcblx0bW9kZWwgPSB0aGlzLl9wcmVwYXJlTW9kZWwobW9kZWwsIG9wdGlvbnMpO1xuXHRpZiAoIW1vZGVsKSByZXR1cm4gZmFsc2U7XG5cdGlmICghb3B0aW9ucy53YWl0KSBjb2xsLmFkZChtb2RlbCwgb3B0aW9ucyk7XG5cdHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuXHRvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihuZXh0TW9kZWwsIHJlc3AsIHhocikge1xuXHRcdGlmIChvcHRpb25zLndhaXQpIGNvbGwuYWRkKG5leHRNb2RlbCwgb3B0aW9ucyk7XG5cdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRzdWNjZXNzKG5leHRNb2RlbCwgcmVzcCk7XG5cdFx0fSBlbHNlIHtcblx0XHRuZXh0TW9kZWwudHJpZ2dlcignc3luYycsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcblx0XHR9XG5cdH07XG5cdG1vZGVsLnNhdmUobnVsbCwgb3B0aW9ucyk7XG5cdHJldHVybiBtb2RlbDtcblx0fSxcblxuXHQvLyAqKnBhcnNlKiogY29udmVydHMgYSByZXNwb25zZSBpbnRvIGEgbGlzdCBvZiBtb2RlbHMgdG8gYmUgYWRkZWQgdG8gdGhlXG5cdC8vIGNvbGxlY3Rpb24uIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyBpdCB0aHJvdWdoLlxuXHRwYXJzZTogZnVuY3Rpb24ocmVzcCwgeGhyKSB7XG5cdHJldHVybiByZXNwO1xuXHR9LFxuXG5cdC8vIFByb3h5IHRvIF8ncyBjaGFpbi4gQ2FuJ3QgYmUgcHJveGllZCB0aGUgc2FtZSB3YXkgdGhlIHJlc3Qgb2YgdGhlXG5cdC8vIHVuZGVyc2NvcmUgbWV0aG9kcyBhcmUgcHJveGllZCBiZWNhdXNlIGl0IHJlbGllcyBvbiB0aGUgdW5kZXJzY29yZVxuXHQvLyBjb25zdHJ1Y3Rvci5cblx0Y2hhaW46IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIF8odGhpcy5tb2RlbHMpLmNoYWluKCk7XG5cdH0sXG5cblx0Ly8gUmVzZXQgYWxsIGludGVybmFsIHN0YXRlLiBDYWxsZWQgd2hlbiB0aGUgY29sbGVjdGlvbiBpcyByZXNldC5cblx0X3Jlc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMubGVuZ3RoID0gMDtcblx0dGhpcy5tb2RlbHMgPSBbXTtcblx0dGhpcy5fYnlJZCAgPSB7fTtcblx0dGhpcy5fYnlDaWQgPSB7fTtcblx0fSxcblxuXHQvLyBQcmVwYXJlIGEgbW9kZWwgb3IgaGFzaCBvZiBhdHRyaWJ1dGVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgY29sbGVjdGlvbi5cblx0X3ByZXBhcmVNb2RlbDogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblx0aWYgKCEobW9kZWwgaW5zdGFuY2VvZiBNb2RlbCkpIHtcblx0XHR2YXIgYXR0cnMgPSBtb2RlbDtcblx0XHRvcHRpb25zLmNvbGxlY3Rpb24gPSB0aGlzO1xuXHRcdG1vZGVsID0gbmV3IHRoaXMubW9kZWwoYXR0cnMsIG9wdGlvbnMpO1xuXHRcdGlmICghbW9kZWwuX3ZhbGlkYXRlKG1vZGVsLmF0dHJpYnV0ZXMsIG9wdGlvbnMpKSBtb2RlbCA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKCFtb2RlbC5jb2xsZWN0aW9uKSB7XG5cdFx0bW9kZWwuY29sbGVjdGlvbiA9IHRoaXM7XG5cdH1cblx0cmV0dXJuIG1vZGVsO1xuXHR9LFxuXG5cdC8vIEludGVybmFsIG1ldGhvZCB0byByZW1vdmUgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuXHRfcmVtb3ZlUmVmZXJlbmNlOiBmdW5jdGlvbihtb2RlbCkge1xuXHRpZiAodGhpcyA9PSBtb2RlbC5jb2xsZWN0aW9uKSB7XG5cdFx0ZGVsZXRlIG1vZGVsLmNvbGxlY3Rpb247XG5cdH1cblx0bW9kZWwub2ZmKCdhbGwnLCB0aGlzLl9vbk1vZGVsRXZlbnQsIHRoaXMpO1xuXHR9LFxuXG5cdC8vIEludGVybmFsIG1ldGhvZCBjYWxsZWQgZXZlcnkgdGltZSBhIG1vZGVsIGluIHRoZSBzZXQgZmlyZXMgYW4gZXZlbnQuXG5cdC8vIFNldHMgbmVlZCB0byB1cGRhdGUgdGhlaXIgaW5kZXhlcyB3aGVuIG1vZGVscyBjaGFuZ2UgaWRzLiBBbGwgb3RoZXJcblx0Ly8gZXZlbnRzIHNpbXBseSBwcm94eSB0aHJvdWdoLiBcImFkZFwiIGFuZCBcInJlbW92ZVwiIGV2ZW50cyB0aGF0IG9yaWdpbmF0ZVxuXHQvLyBpbiBvdGhlciBjb2xsZWN0aW9ucyBhcmUgaWdub3JlZC5cblx0X29uTW9kZWxFdmVudDogZnVuY3Rpb24oZXZlbnQsIG1vZGVsLCBjb2xsZWN0aW9uLCBvcHRpb25zKSB7XG5cdGlmICgoZXZlbnQgPT0gJ2FkZCcgfHwgZXZlbnQgPT0gJ3JlbW92ZScpICYmIGNvbGxlY3Rpb24gIT0gdGhpcykgcmV0dXJuO1xuXHRpZiAoZXZlbnQgPT0gJ2Rlc3Ryb3knKSB7XG5cdFx0dGhpcy5yZW1vdmUobW9kZWwsIG9wdGlvbnMpO1xuXHR9XG5cdGlmIChtb2RlbCAmJiBldmVudCA9PT0gJ2NoYW5nZTonICsgbW9kZWwuaWRBdHRyaWJ1dGUpIHtcblx0XHRkZWxldGUgdGhpcy5fYnlJZFttb2RlbC5wcmV2aW91cyhtb2RlbC5pZEF0dHJpYnV0ZSldO1xuXHRcdHRoaXMuX2J5SWRbbW9kZWwuaWRdID0gbW9kZWw7XG5cdH1cblx0dGhpcy50cmlnZ2VyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH1cblxufSk7XG5cbi8vIFVuZGVyc2NvcmUgbWV0aG9kcyB0aGF0IHdlIHdhbnQgdG8gaW1wbGVtZW50IG9uIHRoZSBDb2xsZWN0aW9uLlxudmFyIG1ldGhvZHMgPSBbJ2ZvckVhY2gnLCAnZWFjaCcsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ2ZpbmQnLFxuXHQnZGV0ZWN0JywgJ2ZpbHRlcicsICdzZWxlY3QnLCAncmVqZWN0JywgJ2V2ZXJ5JywgJ2FsbCcsICdzb21lJywgJ2FueScsXG5cdCdpbmNsdWRlJywgJ2NvbnRhaW5zJywgJ2ludm9rZScsICdtYXgnLCAnbWluJywgJ3NvcnRCeScsICdzb3J0ZWRJbmRleCcsXG5cdCd0b0FycmF5JywgJ3NpemUnLCAnZmlyc3QnLCAnaW5pdGlhbCcsICdyZXN0JywgJ2xhc3QnLCAnd2l0aG91dCcsICdpbmRleE9mJyxcblx0J3NodWZmbGUnLCAnbGFzdEluZGV4T2YnLCAnaXNFbXB0eScsICdncm91cEJ5J107XG5cbi8vIE1peCBpbiBlYWNoIFVuZGVyc2NvcmUgbWV0aG9kIGFzIGEgcHJveHkgdG8gYENvbGxlY3Rpb24jbW9kZWxzYC5cbl8uZWFjaChtZXRob2RzLCBmdW5jdGlvbihtZXRob2QpIHtcblx0Q29sbGVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gX1ttZXRob2RdLmFwcGx5KF8sIFt0aGlzLm1vZGVsc10uY29uY2F0KF8udG9BcnJheShhcmd1bWVudHMpKSk7XG5cdH07XG59KTtcblxuLy8gQmFja2JvbmUuUm91dGVyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFJvdXRlcnMgbWFwIGZhdXgtVVJMcyB0byBhY3Rpb25zLCBhbmQgZmlyZSBldmVudHMgd2hlbiByb3V0ZXMgYXJlXG4vLyBtYXRjaGVkLiBDcmVhdGluZyBhIG5ldyBvbmUgc2V0cyBpdHMgYHJvdXRlc2AgaGFzaCwgaWYgbm90IHNldCBzdGF0aWNhbGx5LlxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblx0aWYgKG9wdGlvbnMucm91dGVzKSB0aGlzLnJvdXRlcyA9IG9wdGlvbnMucm91dGVzO1xuXHR0aGlzLl9iaW5kUm91dGVzKCk7XG5cdHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLy8gQ2FjaGVkIHJlZ3VsYXIgZXhwcmVzc2lvbnMgZm9yIG1hdGNoaW5nIG5hbWVkIHBhcmFtIHBhcnRzIGFuZCBzcGxhdHRlZFxuLy8gcGFydHMgb2Ygcm91dGUgc3RyaW5ncy5cbnZhciBuYW1lZFBhcmFtICAgID0gLzpcXHcrL2c7XG52YXIgc3BsYXRQYXJhbSAgICA9IC9cXCpcXHcrL2c7XG52YXIgZXNjYXBlUmVnRXhwICA9IC9bLVtcXF17fSgpKz8uLFxcXFxeJHwjXFxzXS9nO1xuXG4vLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuUm91dGVyKiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbl8uZXh0ZW5kKFJvdXRlci5wcm90b3R5cGUsIEV2ZW50cywge1xuXG5cdC8vIEluaXRpYWxpemUgaXMgYW4gZW1wdHkgZnVuY3Rpb24gYnkgZGVmYXVsdC4gT3ZlcnJpZGUgaXQgd2l0aCB5b3VyIG93blxuXHQvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG5cdC8vIE1hbnVhbGx5IGJpbmQgYSBzaW5nbGUgbmFtZWQgcm91dGUgdG8gYSBjYWxsYmFjay4gRm9yIGV4YW1wbGU6XG5cdC8vXG5cdC8vICAgICB0aGlzLnJvdXRlKCdzZWFyY2gvOnF1ZXJ5L3A6bnVtJywgJ3NlYXJjaCcsIGZ1bmN0aW9uKHF1ZXJ5LCBudW0pIHtcblx0Ly8gICAgICAgLi4uXG5cdC8vICAgICB9KTtcblx0Ly9cblx0cm91dGU6IGZ1bmN0aW9uKHJvdXRlLCBuYW1lLCBjYWxsYmFjaykge1xuXHRCYWNrYm9uZS5oaXN0b3J5IHx8IChCYWNrYm9uZS5oaXN0b3J5ID0gbmV3IEhpc3RvcnkpO1xuXHRpZiAoIV8uaXNSZWdFeHAocm91dGUpKSByb3V0ZSA9IHRoaXMuX3JvdXRlVG9SZWdFeHAocm91dGUpO1xuXHRpZiAoIWNhbGxiYWNrKSBjYWxsYmFjayA9IHRoaXNbbmFtZV07XG5cdEJhY2tib25lLmhpc3Rvcnkucm91dGUocm91dGUsIF8uYmluZChmdW5jdGlvbihmcmFnbWVudCkge1xuXHRcdHZhciBhcmdzID0gdGhpcy5fZXh0cmFjdFBhcmFtZXRlcnMocm91dGUsIGZyYWdtZW50KTtcblx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHR0aGlzLnRyaWdnZXIuYXBwbHkodGhpcywgWydyb3V0ZTonICsgbmFtZV0uY29uY2F0KGFyZ3MpKTtcblx0XHRCYWNrYm9uZS5oaXN0b3J5LnRyaWdnZXIoJ3JvdXRlJywgdGhpcywgbmFtZSwgYXJncyk7XG5cdH0sIHRoaXMpKTtcblx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Ly8gU2ltcGxlIHByb3h5IHRvIGBCYWNrYm9uZS5oaXN0b3J5YCB0byBzYXZlIGEgZnJhZ21lbnQgaW50byB0aGUgaGlzdG9yeS5cblx0bmF2aWdhdGU6IGZ1bmN0aW9uKGZyYWdtZW50LCBvcHRpb25zKSB7XG5cdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoZnJhZ21lbnQsIG9wdGlvbnMpO1xuXHR9LFxuXG5cdC8vIEJpbmQgYWxsIGRlZmluZWQgcm91dGVzIHRvIGBCYWNrYm9uZS5oaXN0b3J5YC4gV2UgaGF2ZSB0byByZXZlcnNlIHRoZVxuXHQvLyBvcmRlciBvZiB0aGUgcm91dGVzIGhlcmUgdG8gc3VwcG9ydCBiZWhhdmlvciB3aGVyZSB0aGUgbW9zdCBnZW5lcmFsXG5cdC8vIHJvdXRlcyBjYW4gYmUgZGVmaW5lZCBhdCB0aGUgYm90dG9tIG9mIHRoZSByb3V0ZSBtYXAuXG5cdF9iaW5kUm91dGVzOiBmdW5jdGlvbigpIHtcblx0aWYgKCF0aGlzLnJvdXRlcykgcmV0dXJuO1xuXHR2YXIgcm91dGVzID0gW107XG5cdGZvciAodmFyIHJvdXRlIGluIHRoaXMucm91dGVzKSB7XG5cdFx0cm91dGVzLnVuc2hpZnQoW3JvdXRlLCB0aGlzLnJvdXRlc1tyb3V0ZV1dKTtcblx0fVxuXHRmb3IgKHZhciBpID0gMCwgbCA9IHJvdXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR0aGlzLnJvdXRlKHJvdXRlc1tpXVswXSwgcm91dGVzW2ldWzFdLCB0aGlzW3JvdXRlc1tpXVsxXV0pO1xuXHR9XG5cdH0sXG5cblx0Ly8gQ29udmVydCBhIHJvdXRlIHN0cmluZyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLCBzdWl0YWJsZSBmb3IgbWF0Y2hpbmdcblx0Ly8gYWdhaW5zdCB0aGUgY3VycmVudCBsb2NhdGlvbiBoYXNoLlxuXHRfcm91dGVUb1JlZ0V4cDogZnVuY3Rpb24ocm91dGUpIHtcblx0cm91dGUgPSByb3V0ZS5yZXBsYWNlKGVzY2FwZVJlZ0V4cCwgJ1xcXFwkJicpXG5cdFx0XHRcdC5yZXBsYWNlKG5hbWVkUGFyYW0sICcoW15cXC9dKyknKVxuXHRcdFx0XHQucmVwbGFjZShzcGxhdFBhcmFtLCAnKC4qPyknKTtcblx0cmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcm91dGUgKyAnJCcpO1xuXHR9LFxuXG5cdC8vIEdpdmVuIGEgcm91dGUsIGFuZCBhIFVSTCBmcmFnbWVudCB0aGF0IGl0IG1hdGNoZXMsIHJldHVybiB0aGUgYXJyYXkgb2Zcblx0Ly8gZXh0cmFjdGVkIHBhcmFtZXRlcnMuXG5cdF9leHRyYWN0UGFyYW1ldGVyczogZnVuY3Rpb24ocm91dGUsIGZyYWdtZW50KSB7XG5cdHJldHVybiByb3V0ZS5leGVjKGZyYWdtZW50KS5zbGljZSgxKTtcblx0fVxuXG59KTtcblxuLy8gQmFja2JvbmUuSGlzdG9yeVxuLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBIYW5kbGVzIGNyb3NzLWJyb3dzZXIgaGlzdG9yeSBtYW5hZ2VtZW50LCBiYXNlZCBvbiBVUkwgZnJhZ21lbnRzLiBJZiB0aGVcbi8vIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBgb25oYXNoY2hhbmdlYCwgZmFsbHMgYmFjayB0byBwb2xsaW5nLlxudmFyIEhpc3RvcnkgPSBCYWNrYm9uZS5IaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuaGFuZGxlcnMgPSBbXTtcblx0Xy5iaW5kQWxsKHRoaXMsICdjaGVja1VybCcpO1xufTtcblxuLy8gQ2FjaGVkIHJlZ2V4IGZvciBjbGVhbmluZyBsZWFkaW5nIGhhc2hlcyBhbmQgc2xhc2hlcyAuXG52YXIgcm91dGVTdHJpcHBlciA9IC9eWyNcXC9dLztcblxuLy8gQ2FjaGVkIHJlZ2V4IGZvciBkZXRlY3RpbmcgTVNJRS5cbnZhciBpc0V4cGxvcmVyID0gL21zaWUgW1xcdy5dKy87XG5cbi8vIEhhcyB0aGUgaGlzdG9yeSBoYW5kbGluZyBhbHJlYWR5IGJlZW4gc3RhcnRlZD9cbkhpc3Rvcnkuc3RhcnRlZCA9IGZhbHNlO1xuXG4vLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuSGlzdG9yeSoqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG5fLmV4dGVuZChIaXN0b3J5LnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cblx0Ly8gVGhlIGRlZmF1bHQgaW50ZXJ2YWwgdG8gcG9sbCBmb3IgaGFzaCBjaGFuZ2VzLCBpZiBuZWNlc3NhcnksIGlzXG5cdC8vIHR3ZW50eSB0aW1lcyBhIHNlY29uZC5cblx0aW50ZXJ2YWw6IDUwLFxuXG5cdC8vIEdldHMgdGhlIHRydWUgaGFzaCB2YWx1ZS4gQ2Fubm90IHVzZSBsb2NhdGlvbi5oYXNoIGRpcmVjdGx5IGR1ZSB0byBidWdcblx0Ly8gaW4gRmlyZWZveCB3aGVyZSBsb2NhdGlvbi5oYXNoIHdpbGwgYWx3YXlzIGJlIGRlY29kZWQuXG5cdGdldEhhc2g6IGZ1bmN0aW9uKHdpbmRvd092ZXJyaWRlKSB7XG5cdHZhciBsb2MgPSB3aW5kb3dPdmVycmlkZSA/IHdpbmRvd092ZXJyaWRlLmxvY2F0aW9uIDogd2luZG93LmxvY2F0aW9uO1xuXHR2YXIgbWF0Y2ggPSBsb2MuaHJlZi5tYXRjaCgvIyguKikkLyk7XG5cdHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG5cdH0sXG5cblx0Ly8gR2V0IHRoZSBjcm9zcy1icm93c2VyIG5vcm1hbGl6ZWQgVVJMIGZyYWdtZW50LCBlaXRoZXIgZnJvbSB0aGUgVVJMLFxuXHQvLyB0aGUgaGFzaCwgb3IgdGhlIG92ZXJyaWRlLlxuXHRnZXRGcmFnbWVudDogZnVuY3Rpb24oZnJhZ21lbnQsIGZvcmNlUHVzaFN0YXRlKSB7XG5cdGlmIChmcmFnbWVudCA9PSBudWxsKSB7XG5cdFx0aWYgKHRoaXMuX2hhc1B1c2hTdGF0ZSB8fCBmb3JjZVB1c2hTdGF0ZSkge1xuXHRcdGZyYWdtZW50ID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXHRcdHZhciBzZWFyY2ggPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xuXHRcdGlmIChzZWFyY2gpIGZyYWdtZW50ICs9IHNlYXJjaDtcblx0XHR9IGVsc2Uge1xuXHRcdGZyYWdtZW50ID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0fVxuXHR9XG5cdGlmICghZnJhZ21lbnQuaW5kZXhPZih0aGlzLm9wdGlvbnMucm9vdCkpIGZyYWdtZW50ID0gZnJhZ21lbnQuc3Vic3RyKHRoaXMub3B0aW9ucy5yb290Lmxlbmd0aCk7XG5cdHJldHVybiBmcmFnbWVudC5yZXBsYWNlKHJvdXRlU3RyaXBwZXIsICcnKTtcblx0fSxcblxuXHQvLyBTdGFydCB0aGUgaGFzaCBjaGFuZ2UgaGFuZGxpbmcsIHJldHVybmluZyBgdHJ1ZWAgaWYgdGhlIGN1cnJlbnQgVVJMIG1hdGNoZXNcblx0Ly8gYW4gZXhpc3Rpbmcgcm91dGUsIGFuZCBgZmFsc2VgIG90aGVyd2lzZS5cblx0c3RhcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0aWYgKEhpc3Rvcnkuc3RhcnRlZCkgdGhyb3cgbmV3IEVycm9yKFwiQmFja2JvbmUuaGlzdG9yeSBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWRcIik7XG5cdEhpc3Rvcnkuc3RhcnRlZCA9IHRydWU7XG5cblx0Ly8gRmlndXJlIG91dCB0aGUgaW5pdGlhbCBjb25maWd1cmF0aW9uLiBEbyB3ZSBuZWVkIGFuIGlmcmFtZT9cblx0Ly8gSXMgcHVzaFN0YXRlIGRlc2lyZWQgLi4uIGlzIGl0IGF2YWlsYWJsZT9cblx0dGhpcy5vcHRpb25zICAgICAgICAgID0gXy5leHRlbmQoe30sIHtyb290OiAnLyd9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHR0aGlzLl93YW50c0hhc2hDaGFuZ2UgPSB0aGlzLm9wdGlvbnMuaGFzaENoYW5nZSAhPT0gZmFsc2U7XG5cdHRoaXMuX3dhbnRzUHVzaFN0YXRlICA9ICEhdGhpcy5vcHRpb25zLnB1c2hTdGF0ZTtcblx0dGhpcy5faGFzUHVzaFN0YXRlICAgID0gISEodGhpcy5vcHRpb25zLnB1c2hTdGF0ZSAmJiB3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpO1xuXHR2YXIgZnJhZ21lbnQgICAgICAgICAgPSB0aGlzLmdldEZyYWdtZW50KCk7XG5cdHZhciBkb2NNb2RlICAgICAgICAgICA9IGRvY3VtZW50LmRvY3VtZW50TW9kZTtcblx0dmFyIG9sZElFICAgICAgICAgICAgID0gKGlzRXhwbG9yZXIuZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpICYmICghZG9jTW9kZSB8fCBkb2NNb2RlIDw9IDcpKTtcblxuXHRpZiAob2xkSUUpIHtcblx0XHR0aGlzLmlmcmFtZSA9ICQoJzxpZnJhbWUgc3JjPVwiamF2YXNjcmlwdDowXCIgdGFiaW5kZXg9XCItMVwiIC8+JykuaGlkZSgpLmFwcGVuZFRvKCdib2R5JylbMF0uY29udGVudFdpbmRvdztcblx0XHR0aGlzLm5hdmlnYXRlKGZyYWdtZW50KTtcblx0fVxuXG5cdC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHdlJ3JlIHVzaW5nIHB1c2hTdGF0ZSBvciBoYXNoZXMsIGFuZCB3aGV0aGVyXG5cdC8vICdvbmhhc2hjaGFuZ2UnIGlzIHN1cHBvcnRlZCwgZGV0ZXJtaW5lIGhvdyB3ZSBjaGVjayB0aGUgVVJMIHN0YXRlLlxuXHRpZiAodGhpcy5faGFzUHVzaFN0YXRlKSB7XG5cdFx0JCh3aW5kb3cpLmJpbmQoJ3BvcHN0YXRlJywgdGhpcy5jaGVja1VybCk7XG5cdH0gZWxzZSBpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlICYmICgnb25oYXNoY2hhbmdlJyBpbiB3aW5kb3cpICYmICFvbGRJRSkge1xuXHRcdCQod2luZG93KS5iaW5kKCdoYXNoY2hhbmdlJywgdGhpcy5jaGVja1VybCk7XG5cdH0gZWxzZSBpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlKSB7XG5cdFx0dGhpcy5fY2hlY2tVcmxJbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuY2hlY2tVcmwsIHRoaXMuaW50ZXJ2YWwpO1xuXHR9XG5cblx0Ly8gRGV0ZXJtaW5lIGlmIHdlIG5lZWQgdG8gY2hhbmdlIHRoZSBiYXNlIHVybCwgZm9yIGEgcHVzaFN0YXRlIGxpbmtcblx0Ly8gb3BlbmVkIGJ5IGEgbm9uLXB1c2hTdGF0ZSBicm93c2VyLlxuXHR0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG5cdHZhciBsb2MgPSB3aW5kb3cubG9jYXRpb247XG5cdHZhciBhdFJvb3QgID0gbG9jLnBhdGhuYW1lID09IHRoaXMub3B0aW9ucy5yb290O1xuXG5cdC8vIElmIHdlJ3ZlIHN0YXJ0ZWQgb2ZmIHdpdGggYSByb3V0ZSBmcm9tIGEgYHB1c2hTdGF0ZWAtZW5hYmxlZCBicm93c2VyLFxuXHQvLyBidXQgd2UncmUgY3VycmVudGx5IGluIGEgYnJvd3NlciB0aGF0IGRvZXNuJ3Qgc3VwcG9ydCBpdC4uLlxuXHRpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlICYmIHRoaXMuX3dhbnRzUHVzaFN0YXRlICYmICF0aGlzLl9oYXNQdXNoU3RhdGUgJiYgIWF0Um9vdCkge1xuXHRcdHRoaXMuZnJhZ21lbnQgPSB0aGlzLmdldEZyYWdtZW50KG51bGwsIHRydWUpO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHRoaXMub3B0aW9ucy5yb290ICsgJyMnICsgdGhpcy5mcmFnbWVudCk7XG5cdFx0Ly8gUmV0dXJuIGltbWVkaWF0ZWx5IGFzIGJyb3dzZXIgd2lsbCBkbyByZWRpcmVjdCB0byBuZXcgdXJsXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0Ly8gT3IgaWYgd2UndmUgc3RhcnRlZCBvdXQgd2l0aCBhIGhhc2gtYmFzZWQgcm91dGUsIGJ1dCB3ZSdyZSBjdXJyZW50bHlcblx0Ly8gaW4gYSBicm93c2VyIHdoZXJlIGl0IGNvdWxkIGJlIGBwdXNoU3RhdGVgLWJhc2VkIGluc3RlYWQuLi5cblx0fSBlbHNlIGlmICh0aGlzLl93YW50c1B1c2hTdGF0ZSAmJiB0aGlzLl9oYXNQdXNoU3RhdGUgJiYgYXRSb290ICYmIGxvYy5oYXNoKSB7XG5cdFx0dGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0SGFzaCgpLnJlcGxhY2Uocm91dGVTdHJpcHBlciwgJycpO1xuXHRcdHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIGxvYy5wcm90b2NvbCArICcvLycgKyBsb2MuaG9zdCArIHRoaXMub3B0aW9ucy5yb290ICsgdGhpcy5mcmFnbWVudCk7XG5cdH1cblxuXHRpZiAoIXRoaXMub3B0aW9ucy5zaWxlbnQpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2FkVXJsKCk7XG5cdH1cblx0fSxcblxuXHQvLyBEaXNhYmxlIEJhY2tib25lLmhpc3RvcnksIHBlcmhhcHMgdGVtcG9yYXJpbHkuIE5vdCB1c2VmdWwgaW4gYSByZWFsIGFwcCxcblx0Ly8gYnV0IHBvc3NpYmx5IHVzZWZ1bCBmb3IgdW5pdCB0ZXN0aW5nIFJvdXRlcnMuXG5cdHN0b3A6IGZ1bmN0aW9uKCkge1xuXHQkKHdpbmRvdykudW5iaW5kKCdwb3BzdGF0ZScsIHRoaXMuY2hlY2tVcmwpLnVuYmluZCgnaGFzaGNoYW5nZScsIHRoaXMuY2hlY2tVcmwpO1xuXHRjbGVhckludGVydmFsKHRoaXMuX2NoZWNrVXJsSW50ZXJ2YWwpO1xuXHRIaXN0b3J5LnN0YXJ0ZWQgPSBmYWxzZTtcblx0fSxcblxuXHQvLyBBZGQgYSByb3V0ZSB0byBiZSB0ZXN0ZWQgd2hlbiB0aGUgZnJhZ21lbnQgY2hhbmdlcy4gUm91dGVzIGFkZGVkIGxhdGVyXG5cdC8vIG1heSBvdmVycmlkZSBwcmV2aW91cyByb3V0ZXMuXG5cdHJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgY2FsbGJhY2spIHtcblx0dGhpcy5oYW5kbGVycy51bnNoaWZ0KHtyb3V0ZTogcm91dGUsIGNhbGxiYWNrOiBjYWxsYmFja30pO1xuXHR9LFxuXG5cdC8vIENoZWNrcyB0aGUgY3VycmVudCBVUkwgdG8gc2VlIGlmIGl0IGhhcyBjaGFuZ2VkLCBhbmQgaWYgaXQgaGFzLFxuXHQvLyBjYWxscyBgbG9hZFVybGAsIG5vcm1hbGl6aW5nIGFjcm9zcyB0aGUgaGlkZGVuIGlmcmFtZS5cblx0Y2hlY2tVcmw6IGZ1bmN0aW9uKGUpIHtcblx0dmFyIGN1cnJlbnQgPSB0aGlzLmdldEZyYWdtZW50KCk7XG5cdGlmIChjdXJyZW50ID09IHRoaXMuZnJhZ21lbnQgJiYgdGhpcy5pZnJhbWUpIGN1cnJlbnQgPSB0aGlzLmdldEZyYWdtZW50KHRoaXMuZ2V0SGFzaCh0aGlzLmlmcmFtZSkpO1xuXHRpZiAoY3VycmVudCA9PSB0aGlzLmZyYWdtZW50KSByZXR1cm4gZmFsc2U7XG5cdGlmICh0aGlzLmlmcmFtZSkgdGhpcy5uYXZpZ2F0ZShjdXJyZW50KTtcblx0dGhpcy5sb2FkVXJsKCkgfHwgdGhpcy5sb2FkVXJsKHRoaXMuZ2V0SGFzaCgpKTtcblx0fSxcblxuXHQvLyBBdHRlbXB0IHRvIGxvYWQgdGhlIGN1cnJlbnQgVVJMIGZyYWdtZW50LiBJZiBhIHJvdXRlIHN1Y2NlZWRzIHdpdGggYVxuXHQvLyBtYXRjaCwgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGRlZmluZWQgcm91dGVzIG1hdGNoZXMgdGhlIGZyYWdtZW50LFxuXHQvLyByZXR1cm5zIGBmYWxzZWAuXG5cdGxvYWRVcmw6IGZ1bmN0aW9uKGZyYWdtZW50T3ZlcnJpZGUpIHtcblx0dmFyIGZyYWdtZW50ID0gdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQoZnJhZ21lbnRPdmVycmlkZSk7XG5cdHZhciBtYXRjaGVkID0gXy5hbnkodGhpcy5oYW5kbGVycywgZnVuY3Rpb24oaGFuZGxlcikge1xuXHRcdGlmIChoYW5kbGVyLnJvdXRlLnRlc3QoZnJhZ21lbnQpKSB7XG5cdFx0aGFuZGxlci5jYWxsYmFjayhmcmFnbWVudCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG1hdGNoZWQ7XG5cdH0sXG5cblx0Ly8gU2F2ZSBhIGZyYWdtZW50IGludG8gdGhlIGhhc2ggaGlzdG9yeSwgb3IgcmVwbGFjZSB0aGUgVVJMIHN0YXRlIGlmIHRoZVxuXHQvLyAncmVwbGFjZScgb3B0aW9uIGlzIHBhc3NlZC4gWW91IGFyZSByZXNwb25zaWJsZSBmb3IgcHJvcGVybHkgVVJMLWVuY29kaW5nXG5cdC8vIHRoZSBmcmFnbWVudCBpbiBhZHZhbmNlLlxuXHQvL1xuXHQvLyBUaGUgb3B0aW9ucyBvYmplY3QgY2FuIGNvbnRhaW4gYHRyaWdnZXI6IHRydWVgIGlmIHlvdSB3aXNoIHRvIGhhdmUgdGhlXG5cdC8vIHJvdXRlIGNhbGxiYWNrIGJlIGZpcmVkIChub3QgdXN1YWxseSBkZXNpcmFibGUpLCBvciBgcmVwbGFjZTogdHJ1ZWAsIGlmXG5cdC8vIHlvdSB3aXNoIHRvIG1vZGlmeSB0aGUgY3VycmVudCBVUkwgd2l0aG91dCBhZGRpbmcgYW4gZW50cnkgdG8gdGhlIGhpc3RvcnkuXG5cdG5hdmlnYXRlOiBmdW5jdGlvbihmcmFnbWVudCwgb3B0aW9ucykge1xuXHRpZiAoIUhpc3Rvcnkuc3RhcnRlZCkgcmV0dXJuIGZhbHNlO1xuXHRpZiAoIW9wdGlvbnMgfHwgb3B0aW9ucyA9PT0gdHJ1ZSkgb3B0aW9ucyA9IHt0cmlnZ2VyOiBvcHRpb25zfTtcblx0dmFyIGZyYWcgPSAoZnJhZ21lbnQgfHwgJycpLnJlcGxhY2Uocm91dGVTdHJpcHBlciwgJycpO1xuXHRpZiAodGhpcy5mcmFnbWVudCA9PSBmcmFnKSByZXR1cm47XG5cblx0Ly8gSWYgcHVzaFN0YXRlIGlzIGF2YWlsYWJsZSwgd2UgdXNlIGl0IHRvIHNldCB0aGUgZnJhZ21lbnQgYXMgYSByZWFsIFVSTC5cblx0aWYgKHRoaXMuX2hhc1B1c2hTdGF0ZSkge1xuXHRcdGlmIChmcmFnLmluZGV4T2YodGhpcy5vcHRpb25zLnJvb3QpICE9IDApIGZyYWcgPSB0aGlzLm9wdGlvbnMucm9vdCArIGZyYWc7XG5cdFx0dGhpcy5mcmFnbWVudCA9IGZyYWc7XG5cdFx0d2luZG93Lmhpc3Rvcnlbb3B0aW9ucy5yZXBsYWNlID8gJ3JlcGxhY2VTdGF0ZScgOiAncHVzaFN0YXRlJ10oe30sIGRvY3VtZW50LnRpdGxlLCBmcmFnKTtcblxuXHQvLyBJZiBoYXNoIGNoYW5nZXMgaGF2ZW4ndCBiZWVuIGV4cGxpY2l0bHkgZGlzYWJsZWQsIHVwZGF0ZSB0aGUgaGFzaFxuXHQvLyBmcmFnbWVudCB0byBzdG9yZSBoaXN0b3J5LlxuXHR9IGVsc2UgaWYgKHRoaXMuX3dhbnRzSGFzaENoYW5nZSkge1xuXHRcdHRoaXMuZnJhZ21lbnQgPSBmcmFnO1xuXHRcdHRoaXMuX3VwZGF0ZUhhc2god2luZG93LmxvY2F0aW9uLCBmcmFnLCBvcHRpb25zLnJlcGxhY2UpO1xuXHRcdGlmICh0aGlzLmlmcmFtZSAmJiAoZnJhZyAhPSB0aGlzLmdldEZyYWdtZW50KHRoaXMuZ2V0SGFzaCh0aGlzLmlmcmFtZSkpKSkge1xuXHRcdC8vIE9wZW5pbmcgYW5kIGNsb3NpbmcgdGhlIGlmcmFtZSB0cmlja3MgSUU3IGFuZCBlYXJsaWVyIHRvIHB1c2ggYSBoaXN0b3J5IGVudHJ5IG9uIGhhc2gtdGFnIGNoYW5nZS5cblx0XHQvLyBXaGVuIHJlcGxhY2UgaXMgdHJ1ZSwgd2UgZG9uJ3Qgd2FudCB0aGlzLlxuXHRcdGlmKCFvcHRpb25zLnJlcGxhY2UpIHRoaXMuaWZyYW1lLmRvY3VtZW50Lm9wZW4oKS5jbG9zZSgpO1xuXHRcdHRoaXMuX3VwZGF0ZUhhc2godGhpcy5pZnJhbWUubG9jYXRpb24sIGZyYWcsIG9wdGlvbnMucmVwbGFjZSk7XG5cdFx0fVxuXG5cdC8vIElmIHlvdSd2ZSB0b2xkIHVzIHRoYXQgeW91IGV4cGxpY2l0bHkgZG9uJ3Qgd2FudCBmYWxsYmFjayBoYXNoY2hhbmdlLVxuXHQvLyBiYXNlZCBoaXN0b3J5LCB0aGVuIGBuYXZpZ2F0ZWAgYmVjb21lcyBhIHBhZ2UgcmVmcmVzaC5cblx0fSBlbHNlIHtcblx0XHR3aW5kb3cubG9jYXRpb24uYXNzaWduKHRoaXMub3B0aW9ucy5yb290ICsgZnJhZ21lbnQpO1xuXHR9XG5cdGlmIChvcHRpb25zLnRyaWdnZXIpIHRoaXMubG9hZFVybChmcmFnbWVudCk7XG5cdH0sXG5cblx0Ly8gVXBkYXRlIHRoZSBoYXNoIGxvY2F0aW9uLCBlaXRoZXIgcmVwbGFjaW5nIHRoZSBjdXJyZW50IGVudHJ5LCBvciBhZGRpbmdcblx0Ly8gYSBuZXcgb25lIHRvIHRoZSBicm93c2VyIGhpc3RvcnkuXG5cdF91cGRhdGVIYXNoOiBmdW5jdGlvbihsb2NhdGlvbiwgZnJhZ21lbnQsIHJlcGxhY2UpIHtcblx0aWYgKHJlcGxhY2UpIHtcblx0XHRsb2NhdGlvbi5yZXBsYWNlKGxvY2F0aW9uLnRvU3RyaW5nKCkucmVwbGFjZSgvKGphdmFzY3JpcHQ6fCMpLiokLywgJycpICsgJyMnICsgZnJhZ21lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdGxvY2F0aW9uLmhhc2ggPSBmcmFnbWVudDtcblx0fVxuXHR9XG59KTtcblxuLy8gQmFja2JvbmUuVmlld1xuLy8gLS0tLS0tLS0tLS0tLVxuXG4vLyBDcmVhdGluZyBhIEJhY2tib25lLlZpZXcgY3JlYXRlcyBpdHMgaW5pdGlhbCBlbGVtZW50IG91dHNpZGUgb2YgdGhlIERPTSxcbi8vIGlmIGFuIGV4aXN0aW5nIGVsZW1lbnQgaXMgbm90IHByb3ZpZGVkLi4uXG52YXIgVmlldyA9IEJhY2tib25lLlZpZXcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuY2lkID0gXy51bmlxdWVJZCgndmlldycpO1xuXHR0aGlzLl9jb25maWd1cmUob3B0aW9ucyB8fCB7fSk7XG5cdHRoaXMuX2Vuc3VyZUVsZW1lbnQoKTtcblx0dGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcbn07XG5cbi8vIENhY2hlZCByZWdleCB0byBzcGxpdCBrZXlzIGZvciBgZGVsZWdhdGVgLlxudmFyIGRlbGVnYXRlRXZlbnRTcGxpdHRlciA9IC9eKFxcUyspXFxzKiguKikkLztcblxuLy8gTGlzdCBvZiB2aWV3IG9wdGlvbnMgdG8gYmUgbWVyZ2VkIGFzIHByb3BlcnRpZXMuXG52YXIgdmlld09wdGlvbnMgPSBbJ21vZGVsJywgJ2NvbGxlY3Rpb24nLCAnZWwnLCAnaWQnLCAnYXR0cmlidXRlcycsICdjbGFzc05hbWUnLCAndGFnTmFtZSddO1xuXG4vLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuVmlldyoqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG5fLmV4dGVuZChWaWV3LnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cblx0Ly8gVGhlIGRlZmF1bHQgYHRhZ05hbWVgIG9mIGEgVmlldydzIGVsZW1lbnQgaXMgYFwiZGl2XCJgLlxuXHR0YWdOYW1lOiAnZGl2JyxcblxuXHQvLyBqUXVlcnkgZGVsZWdhdGUgZm9yIGVsZW1lbnQgbG9va3VwLCBzY29wZWQgdG8gRE9NIGVsZW1lbnRzIHdpdGhpbiB0aGVcblx0Ly8gY3VycmVudCB2aWV3LiBUaGlzIHNob3VsZCBiZSBwcmVmZXJlZCB0byBnbG9iYWwgbG9va3VwcyB3aGVyZSBwb3NzaWJsZS5cblx0JDogZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0cmV0dXJuIHRoaXMuJGVsLmZpbmQoc2VsZWN0b3IpO1xuXHR9LFxuXG5cdC8vIEluaXRpYWxpemUgaXMgYW4gZW1wdHkgZnVuY3Rpb24gYnkgZGVmYXVsdC4gT3ZlcnJpZGUgaXQgd2l0aCB5b3VyIG93blxuXHQvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG5cdC8vICoqcmVuZGVyKiogaXMgdGhlIGNvcmUgZnVuY3Rpb24gdGhhdCB5b3VyIHZpZXcgc2hvdWxkIG92ZXJyaWRlLCBpbiBvcmRlclxuXHQvLyB0byBwb3B1bGF0ZSBpdHMgZWxlbWVudCAoYHRoaXMuZWxgKSwgd2l0aCB0aGUgYXBwcm9wcmlhdGUgSFRNTC4gVGhlXG5cdC8vIGNvbnZlbnRpb24gaXMgZm9yICoqcmVuZGVyKiogdG8gYWx3YXlzIHJldHVybiBgdGhpc2AuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8vIFJlbW92ZSB0aGlzIHZpZXcgZnJvbSB0aGUgRE9NLiBOb3RlIHRoYXQgdGhlIHZpZXcgaXNuJ3QgcHJlc2VudCBpbiB0aGVcblx0Ly8gRE9NIGJ5IGRlZmF1bHQsIHNvIGNhbGxpbmcgdGhpcyBtZXRob2QgbWF5IGJlIGEgbm8tb3AuXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdHRoaXMuJGVsLnJlbW92ZSgpO1xuXHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvLyBGb3Igc21hbGwgYW1vdW50cyBvZiBET00gRWxlbWVudHMsIHdoZXJlIGEgZnVsbC1ibG93biB0ZW1wbGF0ZSBpc24ndFxuXHQvLyBuZWVkZWQsIHVzZSAqKm1ha2UqKiB0byBtYW51ZmFjdHVyZSBlbGVtZW50cywgb25lIGF0IGEgdGltZS5cblx0Ly9cblx0Ly8gICAgIHZhciBlbCA9IHRoaXMubWFrZSgnbGknLCB7J2NsYXNzJzogJ3Jvdyd9LCB0aGlzLm1vZGVsLmVzY2FwZSgndGl0bGUnKSk7XG5cdC8vXG5cdG1ha2U6IGZ1bmN0aW9uKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNvbnRlbnQpIHtcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcblx0aWYgKGF0dHJpYnV0ZXMpICQoZWwpLmF0dHIoYXR0cmlidXRlcyk7XG5cdGlmIChjb250ZW50KSAkKGVsKS5odG1sKGNvbnRlbnQpO1xuXHRyZXR1cm4gZWw7XG5cdH0sXG5cblx0Ly8gQ2hhbmdlIHRoZSB2aWV3J3MgZWxlbWVudCAoYHRoaXMuZWxgIHByb3BlcnR5KSwgaW5jbHVkaW5nIGV2ZW50XG5cdC8vIHJlLWRlbGVnYXRpb24uXG5cdHNldEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGRlbGVnYXRlKSB7XG5cdGlmICh0aGlzLiRlbCkgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XG5cdHRoaXMuJGVsID0gKGVsZW1lbnQgaW5zdGFuY2VvZiAkKSA/IGVsZW1lbnQgOiAkKGVsZW1lbnQpO1xuXHR0aGlzLmVsID0gdGhpcy4kZWxbMF07XG5cdGlmIChkZWxlZ2F0ZSAhPT0gZmFsc2UpIHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcblx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Ly8gU2V0IGNhbGxiYWNrcywgd2hlcmUgYHRoaXMuZXZlbnRzYCBpcyBhIGhhc2ggb2Zcblx0Ly9cblx0Ly8gKntcImV2ZW50IHNlbGVjdG9yXCI6IFwiY2FsbGJhY2tcIn0qXG5cdC8vXG5cdC8vICAgICB7XG5cdC8vICAgICAgICdtb3VzZWRvd24gLnRpdGxlJzogICdlZGl0Jyxcblx0Ly8gICAgICAgJ2NsaWNrIC5idXR0b24nOiAgICAgJ3NhdmUnXG5cdC8vICAgICAgICdjbGljayAub3Blbic6ICAgICAgIGZ1bmN0aW9uKGUpIHsgLi4uIH1cblx0Ly8gICAgIH1cblx0Ly9cblx0Ly8gcGFpcnMuIENhbGxiYWNrcyB3aWxsIGJlIGJvdW5kIHRvIHRoZSB2aWV3LCB3aXRoIGB0aGlzYCBzZXQgcHJvcGVybHkuXG5cdC8vIFVzZXMgZXZlbnQgZGVsZWdhdGlvbiBmb3IgZWZmaWNpZW5jeS5cblx0Ly8gT21pdHRpbmcgdGhlIHNlbGVjdG9yIGJpbmRzIHRoZSBldmVudCB0byBgdGhpcy5lbGAuXG5cdC8vIFRoaXMgb25seSB3b3JrcyBmb3IgZGVsZWdhdGUtYWJsZSBldmVudHM6IG5vdCBgZm9jdXNgLCBgYmx1cmAsIGFuZFxuXHQvLyBub3QgYGNoYW5nZWAsIGBzdWJtaXRgLCBhbmQgYHJlc2V0YCBpbiBJbnRlcm5ldCBFeHBsb3Jlci5cblx0ZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuXHRpZiAoIShldmVudHMgfHwgKGV2ZW50cyA9IGdldFZhbHVlKHRoaXMsICdldmVudHMnKSkpKSByZXR1cm47XG5cdHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuXHRmb3IgKHZhciBrZXkgaW4gZXZlbnRzKSB7XG5cdFx0dmFyIG1ldGhvZCA9IGV2ZW50c1trZXldO1xuXHRcdGlmICghXy5pc0Z1bmN0aW9uKG1ldGhvZCkpIG1ldGhvZCA9IHRoaXNbZXZlbnRzW2tleV1dO1xuXHRcdGlmICghbWV0aG9kKSB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBcIicgKyBldmVudHNba2V5XSArICdcIiBkb2VzIG5vdCBleGlzdCcpO1xuXHRcdHZhciBtYXRjaCA9IGtleS5tYXRjaChkZWxlZ2F0ZUV2ZW50U3BsaXR0ZXIpO1xuXHRcdHZhciBldmVudE5hbWUgPSBtYXRjaFsxXSwgc2VsZWN0b3IgPSBtYXRjaFsyXTtcblx0XHRtZXRob2QgPSBfLmJpbmQobWV0aG9kLCB0aGlzKTtcblx0XHRldmVudE5hbWUgKz0gJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZDtcblx0XHRpZiAoc2VsZWN0b3IgPT09ICcnKSB7XG5cdFx0dGhpcy4kZWwuYmluZChldmVudE5hbWUsIG1ldGhvZCk7XG5cdFx0fSBlbHNlIHtcblx0XHR0aGlzLiRlbC5kZWxlZ2F0ZShzZWxlY3RvciwgZXZlbnROYW1lLCBtZXRob2QpO1xuXHRcdH1cblx0fVxuXHR9LFxuXG5cdC8vIENsZWFycyBhbGwgY2FsbGJhY2tzIHByZXZpb3VzbHkgYm91bmQgdG8gdGhlIHZpZXcgd2l0aCBgZGVsZWdhdGVFdmVudHNgLlxuXHQvLyBZb3UgdXN1YWxseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzLCBidXQgbWF5IHdpc2ggdG8gaWYgeW91IGhhdmUgbXVsdGlwbGVcblx0Ly8gQmFja2JvbmUgdmlld3MgYXR0YWNoZWQgdG8gdGhlIHNhbWUgRE9NIGVsZW1lbnQuXG5cdHVuZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHR0aGlzLiRlbC51bmJpbmQoJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZCk7XG5cdH0sXG5cblx0Ly8gUGVyZm9ybXMgdGhlIGluaXRpYWwgY29uZmlndXJhdGlvbiBvZiBhIFZpZXcgd2l0aCBhIHNldCBvZiBvcHRpb25zLlxuXHQvLyBLZXlzIHdpdGggc3BlY2lhbCBtZWFuaW5nICoobW9kZWwsIGNvbGxlY3Rpb24sIGlkLCBjbGFzc05hbWUpKiwgYXJlXG5cdC8vIGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSB2aWV3LlxuXHRfY29uZmlndXJlOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGlmICh0aGlzLm9wdGlvbnMpIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aWV3T3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgYXR0ciA9IHZpZXdPcHRpb25zW2ldO1xuXHRcdGlmIChvcHRpb25zW2F0dHJdKSB0aGlzW2F0dHJdID0gb3B0aW9uc1thdHRyXTtcblx0fVxuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHR9LFxuXG5cdC8vIEVuc3VyZSB0aGF0IHRoZSBWaWV3IGhhcyBhIERPTSBlbGVtZW50IHRvIHJlbmRlciBpbnRvLlxuXHQvLyBJZiBgdGhpcy5lbGAgaXMgYSBzdHJpbmcsIHBhc3MgaXQgdGhyb3VnaCBgJCgpYCwgdGFrZSB0aGUgZmlyc3Rcblx0Ly8gbWF0Y2hpbmcgZWxlbWVudCwgYW5kIHJlLWFzc2lnbiBpdCB0byBgZWxgLiBPdGhlcndpc2UsIGNyZWF0ZVxuXHQvLyBhbiBlbGVtZW50IGZyb20gdGhlIGBpZGAsIGBjbGFzc05hbWVgIGFuZCBgdGFnTmFtZWAgcHJvcGVydGllcy5cblx0X2Vuc3VyZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRpZiAoIXRoaXMuZWwpIHtcblx0XHR2YXIgYXR0cnMgPSBnZXRWYWx1ZSh0aGlzLCAnYXR0cmlidXRlcycpIHx8IHt9O1xuXHRcdGlmICh0aGlzLmlkKSBhdHRycy5pZCA9IHRoaXMuaWQ7XG5cdFx0aWYgKHRoaXMuY2xhc3NOYW1lKSBhdHRyc1snY2xhc3MnXSA9IHRoaXMuY2xhc3NOYW1lO1xuXHRcdHRoaXMuc2V0RWxlbWVudCh0aGlzLm1ha2UodGhpcy50YWdOYW1lLCBhdHRycyksIGZhbHNlKTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnNldEVsZW1lbnQodGhpcy5lbCwgZmFsc2UpO1xuXHR9XG5cdH1cblxufSk7XG5cbi8vIFRoZSBzZWxmLXByb3BhZ2F0aW5nIGV4dGVuZCBmdW5jdGlvbiB0aGF0IEJhY2tib25lIGNsYXNzZXMgdXNlLlxudmFyIGV4dGVuZCA9IGZ1bmN0aW9uIChwcm90b1Byb3BzLCBjbGFzc1Byb3BzKSB7XG5cdHZhciBjaGlsZCA9IGluaGVyaXRzKHRoaXMsIHByb3RvUHJvcHMsIGNsYXNzUHJvcHMpO1xuXHRjaGlsZC5leHRlbmQgPSB0aGlzLmV4dGVuZDtcblx0cmV0dXJuIGNoaWxkO1xufTtcblxuLy8gU2V0IHVwIGluaGVyaXRhbmNlIGZvciB0aGUgbW9kZWwsIGNvbGxlY3Rpb24sIGFuZCB2aWV3LlxuTW9kZWwuZXh0ZW5kID0gQ29sbGVjdGlvbi5leHRlbmQgPSBSb3V0ZXIuZXh0ZW5kID0gVmlldy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIEJhY2tib25lLnN5bmNcbi8vIC0tLS0tLS0tLS0tLS1cblxuLy8gTWFwIGZyb20gQ1JVRCB0byBIVFRQIGZvciBvdXIgZGVmYXVsdCBgQmFja2JvbmUuc3luY2AgaW1wbGVtZW50YXRpb24uXG52YXIgbWV0aG9kTWFwID0ge1xuXHQnY3JlYXRlJzogJ1BPU1QnLFxuXHQndXBkYXRlJzogJ1BVVCcsXG5cdCdkZWxldGUnOiAnREVMRVRFJyxcblx0J3JlYWQnOiAgICdHRVQnXG59O1xuXG4vLyBPdmVycmlkZSB0aGlzIGZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgbWFubmVyIGluIHdoaWNoIEJhY2tib25lIHBlcnNpc3RzXG4vLyBtb2RlbHMgdG8gdGhlIHNlcnZlci4gWW91IHdpbGwgYmUgcGFzc2VkIHRoZSB0eXBlIG9mIHJlcXVlc3QsIGFuZCB0aGVcbi8vIG1vZGVsIGluIHF1ZXN0aW9uLiBCeSBkZWZhdWx0LCBtYWtlcyBhIFJFU1RmdWwgQWpheCByZXF1ZXN0XG4vLyB0byB0aGUgbW9kZWwncyBgdXJsKClgLiBTb21lIHBvc3NpYmxlIGN1c3RvbWl6YXRpb25zIGNvdWxkIGJlOlxuLy9cbi8vICogVXNlIGBzZXRUaW1lb3V0YCB0byBiYXRjaCByYXBpZC1maXJlIHVwZGF0ZXMgaW50byBhIHNpbmdsZSByZXF1ZXN0LlxuLy8gKiBTZW5kIHVwIHRoZSBtb2RlbHMgYXMgWE1MIGluc3RlYWQgb2YgSlNPTi5cbi8vICogUGVyc2lzdCBtb2RlbHMgdmlhIFdlYlNvY2tldHMgaW5zdGVhZCBvZiBBamF4LlxuLy9cbi8vIFR1cm4gb24gYEJhY2tib25lLmVtdWxhdGVIVFRQYCBpbiBvcmRlciB0byBzZW5kIGBQVVRgIGFuZCBgREVMRVRFYCByZXF1ZXN0c1xuLy8gYXMgYFBPU1RgLCB3aXRoIGEgYF9tZXRob2RgIHBhcmFtZXRlciBjb250YWluaW5nIHRoZSB0cnVlIEhUVFAgbWV0aG9kLFxuLy8gYXMgd2VsbCBhcyBhbGwgcmVxdWVzdHMgd2l0aCB0aGUgYm9keSBhcyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYFxuLy8gaW5zdGVhZCBvZiBgYXBwbGljYXRpb24vanNvbmAgd2l0aCB0aGUgbW9kZWwgaW4gYSBwYXJhbSBuYW1lZCBgbW9kZWxgLlxuLy8gVXNlZnVsIHdoZW4gaW50ZXJmYWNpbmcgd2l0aCBzZXJ2ZXItc2lkZSBsYW5ndWFnZXMgbGlrZSAqKlBIUCoqIHRoYXQgbWFrZVxuLy8gaXQgZGlmZmljdWx0IHRvIHJlYWQgdGhlIGJvZHkgb2YgYFBVVGAgcmVxdWVzdHMuXG5CYWNrYm9uZS5zeW5jID0gZnVuY3Rpb24obWV0aG9kLCBtb2RlbCwgb3B0aW9ucykge1xuXHR2YXIgdHlwZSA9IG1ldGhvZE1hcFttZXRob2RdO1xuXG5cdC8vIERlZmF1bHQgb3B0aW9ucywgdW5sZXNzIHNwZWNpZmllZC5cblx0b3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuXHQvLyBEZWZhdWx0IEpTT04tcmVxdWVzdCBvcHRpb25zLlxuXHR2YXIgcGFyYW1zID0ge3R5cGU6IHR5cGUsIGRhdGFUeXBlOiAnanNvbid9O1xuXG5cdC8vIEVuc3VyZSB0aGF0IHdlIGhhdmUgYSBVUkwuXG5cdGlmICghb3B0aW9ucy51cmwpIHtcblx0cGFyYW1zLnVybCA9IGdldFZhbHVlKG1vZGVsLCAndXJsJykgfHwgdXJsRXJyb3IoKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGF0IHdlIGhhdmUgdGhlIGFwcHJvcHJpYXRlIHJlcXVlc3QgZGF0YS5cblx0aWYgKCFvcHRpb25zLmRhdGEgJiYgbW9kZWwgJiYgKG1ldGhvZCA9PSAnY3JlYXRlJyB8fCBtZXRob2QgPT0gJ3VwZGF0ZScpKSB7XG5cdHBhcmFtcy5jb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcblx0cGFyYW1zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShtb2RlbC50b0pTT04oKSk7XG5cdH1cblxuXHQvLyBGb3Igb2xkZXIgc2VydmVycywgZW11bGF0ZSBKU09OIGJ5IGVuY29kaW5nIHRoZSByZXF1ZXN0IGludG8gYW4gSFRNTC1mb3JtLlxuXHRpZiAoQmFja2JvbmUuZW11bGF0ZUpTT04pIHtcblx0cGFyYW1zLmNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc7XG5cdHBhcmFtcy5kYXRhID0gcGFyYW1zLmRhdGEgPyB7bW9kZWw6IHBhcmFtcy5kYXRhfSA6IHt9O1xuXHR9XG5cblx0Ly8gRm9yIG9sZGVyIHNlcnZlcnMsIGVtdWxhdGUgSFRUUCBieSBtaW1pY2tpbmcgdGhlIEhUVFAgbWV0aG9kIHdpdGggYF9tZXRob2RgXG5cdC8vIEFuZCBhbiBgWC1IVFRQLU1ldGhvZC1PdmVycmlkZWAgaGVhZGVyLlxuXHRpZiAoQmFja2JvbmUuZW11bGF0ZUhUVFApIHtcblx0aWYgKHR5cGUgPT09ICdQVVQnIHx8IHR5cGUgPT09ICdERUxFVEUnKSB7XG5cdFx0aWYgKEJhY2tib25lLmVtdWxhdGVKU09OKSBwYXJhbXMuZGF0YS5fbWV0aG9kID0gdHlwZTtcblx0XHRwYXJhbXMudHlwZSA9ICdQT1NUJztcblx0XHRwYXJhbXMuYmVmb3JlU2VuZCA9IGZ1bmN0aW9uKHhocikge1xuXHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUhUVFAtTWV0aG9kLU92ZXJyaWRlJywgdHlwZSk7XG5cdFx0fTtcblx0fVxuXHR9XG5cblx0Ly8gRG9uJ3QgcHJvY2VzcyBkYXRhIG9uIGEgbm9uLUdFVCByZXF1ZXN0LlxuXHRpZiAocGFyYW1zLnR5cGUgIT09ICdHRVQnICYmICFCYWNrYm9uZS5lbXVsYXRlSlNPTikge1xuXHRwYXJhbXMucHJvY2Vzc0RhdGEgPSBmYWxzZTtcblx0fVxuXG5cdC8vIE1ha2UgdGhlIHJlcXVlc3QsIGFsbG93aW5nIHRoZSB1c2VyIHRvIG92ZXJyaWRlIGFueSBBamF4IG9wdGlvbnMuXG5cdHJldHVybiAkLmFqYXgoXy5leHRlbmQocGFyYW1zLCBvcHRpb25zKSk7XG59O1xuXG4vLyBXcmFwIGFuIG9wdGlvbmFsIGVycm9yIGNhbGxiYWNrIHdpdGggYSBmYWxsYmFjayBlcnJvciBldmVudC5cbkJhY2tib25lLndyYXBFcnJvciA9IGZ1bmN0aW9uKG9uRXJyb3IsIG9yaWdpbmFsTW9kZWwsIG9wdGlvbnMpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCByZXNwKSB7XG5cdHJlc3AgPSBtb2RlbCA9PT0gb3JpZ2luYWxNb2RlbCA/IHJlc3AgOiBtb2RlbDtcblx0aWYgKG9uRXJyb3IpIHtcblx0XHRvbkVycm9yKG9yaWdpbmFsTW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuXHR9IGVsc2Uge1xuXHRcdG9yaWdpbmFsTW9kZWwudHJpZ2dlcignZXJyb3InLCBvcmlnaW5hbE1vZGVsLCByZXNwLCBvcHRpb25zKTtcblx0fVxuXHR9O1xufTtcblxuLy8gSGVscGVyc1xuLy8gLS0tLS0tLVxuXG4vLyBTaGFyZWQgZW1wdHkgY29uc3RydWN0b3IgZnVuY3Rpb24gdG8gYWlkIGluIHByb3RvdHlwZS1jaGFpbiBjcmVhdGlvbi5cbnZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29ycmVjdGx5IHNldCB1cCB0aGUgcHJvdG90eXBlIGNoYWluLCBmb3Igc3ViY2xhc3Nlcy5cbi8vIFNpbWlsYXIgdG8gYGdvb2cuaW5oZXJpdHNgLCBidXQgdXNlcyBhIGhhc2ggb2YgcHJvdG90eXBlIHByb3BlcnRpZXMgYW5kXG4vLyBjbGFzcyBwcm9wZXJ0aWVzIHRvIGJlIGV4dGVuZGVkLlxudmFyIGluaGVyaXRzID0gZnVuY3Rpb24ocGFyZW50LCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuXHR2YXIgY2hpbGQ7XG5cblx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRpZiAocHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSB7XG5cdGNoaWxkID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3Rvcjtcblx0fSBlbHNlIHtcblx0Y2hpbGQgPSBmdW5jdGlvbigpeyBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcblx0fVxuXG5cdC8vIEluaGVyaXQgY2xhc3MgKHN0YXRpYykgcHJvcGVydGllcyBmcm9tIHBhcmVudC5cblx0Xy5leHRlbmQoY2hpbGQsIHBhcmVudCk7XG5cblx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0Y3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xuXG5cdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHQvLyBpZiBzdXBwbGllZC5cblx0aWYgKHByb3RvUHJvcHMpIF8uZXh0ZW5kKGNoaWxkLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG5cblx0Ly8gQWRkIHN0YXRpYyBwcm9wZXJ0aWVzIHRvIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiwgaWYgc3VwcGxpZWQuXG5cdGlmIChzdGF0aWNQcm9wcykgXy5leHRlbmQoY2hpbGQsIHN0YXRpY1Byb3BzKTtcblxuXHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdGNoaWxkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuXG5cdC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWQgbGF0ZXIuXG5cdGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cblx0cmV0dXJuIGNoaWxkO1xufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGdldCBhIHZhbHVlIGZyb20gYSBCYWNrYm9uZSBvYmplY3QgYXMgYSBwcm9wZXJ0eVxuLy8gb3IgYXMgYSBmdW5jdGlvbi5cbnZhciBnZXRWYWx1ZSA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcCkge1xuXHRpZiAoIShvYmplY3QgJiYgb2JqZWN0W3Byb3BdKSkgcmV0dXJuIG51bGw7XG5cdHJldHVybiBfLmlzRnVuY3Rpb24ob2JqZWN0W3Byb3BdKSA/IG9iamVjdFtwcm9wXSgpIDogb2JqZWN0W3Byb3BdO1xufTtcblxuLy8gVGhyb3cgYW4gZXJyb3Igd2hlbiBhIFVSTCBpcyBuZWVkZWQsIGFuZCBub25lIGlzIHN1cHBsaWVkLlxudmFyIHVybEVycm9yID0gZnVuY3Rpb24oKSB7XG5cdHRocm93IG5ldyBFcnJvcignQSBcInVybFwiIHByb3BlcnR5IG9yIGZ1bmN0aW9uIG11c3QgYmUgc3BlY2lmaWVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMpO1xuIl0sInNvdXJjZVJvb3QiOiIvVXNlcnMvdXNlcjAwMS9Eb2N1bWVudHMvQXBwY2VsZXJhdG9yX1N0dWRpb19Xb3Jrc3BhY2Uvb2NyL1Jlc291cmNlcy9hbmRyb2lkL2FsbG95In0=
