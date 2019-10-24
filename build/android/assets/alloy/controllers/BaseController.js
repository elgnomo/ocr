var Alloy = require('/alloy'),
Backbone = Alloy.Backbone,
_ = Alloy._;

/**
              * @class Alloy.Controller
              * @extends Backbone.Events
              * The base class for Alloy controllers.
              *
              * Each controller is associated with a UI hierarchy, defined in an XML file in the
              * `views` folder. Each element in the view hierarchy is either a Titanium {@link Titanium.UI.View View}
              * or another Alloy controller or widget. Each Alloy controller or widget can additionally contain
              * Titanium Views and/or more controllers and widgets.
              *
              */
var Controller = function () {
  var roots = [];
  var self = this;

  function getControllerParam() {
    return self.__widgetId ? {
      widgetId: self.__widgetId,
      name: self.__controllerPath } :
    self.__controllerPath;
  }

  this.__iamalloy = true;
  _.extend(this, Backbone.Events, {
    __views: {},
    __events: [],
    __proxyProperties: {},
    setParent: function (parent) {
      var len = roots.length;

      if (!len) {return;}

      if (parent.__iamalloy) {
        this.parent = parent.parent;
      } else {
        this.parent = parent;
      }

      for (var i = 0; i < len; i++) {
        if (roots[i].__iamalloy) {
          roots[i].setParent(this.parent);
        } else {
          this.parent.add(roots[i]);
        }
      }
    },
    addTopLevelView: function (view) {
      roots.push(view);
    },
    addProxyProperty: function (key, value) {
      this.__proxyProperties[key] = value;
    },
    removeProxyProperty: function (key) {
      delete this.__proxyProperties[key];
    },

    /**
        * @method getTopLevelViews
        * Returns a list of the root view elements associated with this controller.
       	 * #### Example
        * The following example displays the `id` of each top-level view associated with the
        * controller:
       // index.js
       var views = $.getTopLevelViews();
       for (each in views) {
       var view = views[each];
       console.log(view.id);
       }
       	 *
        *
        * @return {Array.<(Titanium.UI.View|Alloy.Controller)>}
        */



    getTopLevelViews: function () {
      return roots;
    },

    /**
        * @method getView
        * Returns the specified view associated with this controller.
        *
        * If no `id` is specified, returns the first top-level view.
        *
        * #### Example
        * The following example gets a reference to a `<Window/>` object
        * with the `id` of "loginWin" and then calls its [open()](Titanium.UI.Window) method.
       var loginWindow = $.getView('loginWin');
       loginWindow.open();
        *
        * @param {String} [id] ID of the view to return.
        * @return {Titanium.UI.View/Alloy.Controller}
        */

    getView: function (id) {
      if (typeof id === 'undefined' || id === null) {
        return roots[0];
      }
      return this.__views[id];
    },
    removeView: function (id) {
      delete this[id];
      delete this.__views[id];
    },

    getProxyProperty: function (name) {
      return this.__proxyProperties[name];
    },

    /**
        * @method getViews
        * Returns a list of all IDed view elements associated with this controller.
        *
        * #### Example
        * Given the following XML view:
       <Alloy>
       <TabGroup id="tabs">
       	<Tab title="Tab 1" icon="KS_nav_ui.png" id="tab1">
       		<Window title="Tab 1" id="win1">
       			<Label id="label1">I am Window 1</Label>
       		</Window>
       	</Tab>
       	<Tab title="Tab 2" icon="KS_nav_views.png" id="tab2">
       		<Window title="Tab 2" id="wind2">
       			<Label id="label2">I am Window 2</Label>
       		</Window>
       	</Tab>
       </TabGroup>
       <View id="otherview"></View>
       </Alloy>
       	* The following view-controller outputs the id of each view in the hierarchy.
       var views = $.getViews();
       for (each in views) {
       var view = views[each];
       console.log(view.id);
       }
       [INFO] :   win1
       [INFO] :   label1
       [INFO] :   tab1
       [INFO] :   wind2
       [INFO] :   label2
       [INFO] :   tab2
       [INFO] :   tabs
       [INFO] :   otherview
       	 * @return {Array.<(Titanium.UI.View|Alloy.Controller)>}
        */





    getViews: function () {
      return this.__views;
    },

    /**
        * @method destroy
        * Frees binding resources associated with this controller and its
        * UI components. It is critical that this is called when employing
        * model/collection binding in order to avoid potential memory leaks.
        * $.destroy() should be called whenever a controller's UI is to
        * be "closed" or removed from the app. See the [Destroying Data Bindings](#!/guide/Destroying_Data_Bindings)
        * test application for an example of this approach.
       	 * #### Example
        * In the following example the view-controller for a {@link Titanium.UI.Window Window} object named `dialog`
        * calls its `destroy()` method in response to the Window object being closed.
       	$.dialog.addEventListener('close', function() {
       $.destroy();
       });
        */



    destroy: function () {
      // destroy() is defined during the compile process based on
      // the UI components and binding contained within the controller.
    },

    // getViewEx for advanced parsing and element traversal
    getViewEx: function (opts) {
      var recurse = opts.recurse || false;
      if (recurse) {
        var view = this.getView();
        if (!view) {
          return null;
        } else if (view.__iamalloy) {
          return view.getViewEx({ recurse: true });
        } else {
          return view;
        }
      } else {
        return this.getView();
      }
    },

    // getProxyPropertyEx for advanced parsing and element traversal
    getProxyPropertyEx: function (name, opts) {
      var recurse = opts.recurse || false;
      if (recurse) {
        var view = this.getProxyProperty(name);
        if (!view) {
          return null;
        } else if (view.__iamalloy) {
          return view.getProxyProperty(name, { recurse: true });
        } else {
          return view;
        }
      } else {
        return this.getView(name);
      }
    },

    /**
        * @method createStyle
        * Creates a dictionary of properties based on the specified styles.
        *
        *
        * You can use this dictionary with the view object's
        * {@link Titanium.UI.View#method-applyProperties applyProperties} method
        * or a create object method, such as {@link Titanium.UI#method-createView Titanium.UI.createView}.
        * #### Examples
        * The following creates a new style object that is passed as a parameter
        * to the {@link Titanium.UI#method-createLabel Ti.UI.createLabel()} method.
       var styleArgs = {
       apiName: 'Ti.UI.Label',
       classes: ['blue','shadow','large'],
       id: 'tester',
       borderWidth: 2,
       borderRadius: 16,
       borderColor: '#000'
       };
       var styleObject = $.createStyle(styleArgs);
       testLabel = Ti.UI.createLabel(styleObject);
       	 * The next example uses the {@link Titanium#method-applyProperties applyProperties()} method
        * to apply a style object to an existing Button control (button not shown).
       var style = $.createStyle({
       classes: args.button,
       apiName: 'Button',
       color: 'blue'
       });
       $.button.applyProperties(style);
        * @param {AlloyStyleDict} opts Dictionary of styles to apply.
        *
        * @return {Dictionary}
        * @since 1.2.0
       	 */




    createStyle: function (opts) {
      return Alloy.createStyle(getControllerParam(), opts);
    },

    /*
        * Documented in docs/apidoc/controller.js
        */
    UI: {
      create: function (apiName, opts) {
        return Alloy.UI.create(getControllerParam(), apiName, opts);
      } },


    /**
            * @method addClass
            * Adds a TSS class to the specified view object.
            *
            * You can apply additional styles with the `opts` parameter. To use this method
            * effectively you may need to enable autostyling
            * on the target XML view. See [Autostyle](#!/guide/Dynamic_Styles-section-37530415_DynamicStyles-Autostyle)
            * in the Alloy developer guide.
            * #### Example
            * The following adds the TSS classes ".redbg" and ".bigger" to a {@link Titanium.UI.Label}
            * object proxy `label1`, and also sets the label's `text` property to "Cancel".
           // index.js
           $.addClass($.label1, 'redbg bigger', {text: "Cancel"});
           The 'redbg' and 'bigger' classes are shown below:
           // index.tss
           ".redbg" : {
           color: 'red'
           }
           ".bigger": {
           font : {
              fontSize: '36'
           }
           }
           	 * @param {Object} proxy View object to which to add class(es).
            * @param {Array<String>/String} classes Array or space-separated list of classes to apply.
            * @param {Dictionary} [opts] Dictionary of properties to apply after classes have been added.
            * @since 1.2.0
            */




    addClass: function (proxy, classes, opts) {
      return Alloy.addClass(getControllerParam(), proxy, classes, opts);
    },

    /**
        * @method removeClass
        * Removes a TSS class from the specified view object.
        *
        * You can apply additional styles after the removal with the `opts` parameter.
        * To use this method effectively you may need to enable autostyling
        * on the target XML view. See [Autostyle](#!/guide/Dynamic_Styles-section-37530415_DynamicStyles-Autostyle)
        * in the Alloy developer guide.
        * #### Example
        * The following removes the "redbg" and "bigger" TSS classes from a {@link Titanium.UI.Label}
        * object proxy `label1`, and also sets the label's `text` property to "...".
       $.removeClass($.label1, 'redbg bigger', {text: "..."});
       	 * @param {Object} proxy View object from which to remove class(es).
        * @param {Array<String>/String} classes Array or space-separated list of classes to remove.
        * @param {Dictionary} [opts] Dictionary of properties to apply after the class removal.
        * @since 1.2.0
        */


    removeClass: function (proxy, classes, opts) {
      return Alloy.removeClass(getControllerParam(), proxy, classes, opts);
    },

    /**
        * @method resetClass
        * Sets the array of TSS classes for the target View object, adding the classes specified and
        * removing any applied classes that are not specified.
        *
        * You can apply classes or styles after the reset using the `classes` or `opts` parameters.
        * To use this method effectively you may need to enable autostyling
        * on the target XML view. See [Autostyle](#!/guide/Dynamic_Styles-section-37530415_DynamicStyles-Autostyle)
        * in the Alloy developer guide.
       	 * #### Example
        * The following removes all previously applied styles on `label1` and then applies
        * the TSS class 'no-style'.
       $.resetClass($.label1, 'no-style');
        * @param {Object} proxy View object to reset.
        * @param {Array<String>/String} [classes] Array or space-separated list of classes to apply after the reset.
        * @param {Dictionary} [opts] Dictionary of properties to apply after the reset.
        * @since 1.2.0
        */


    resetClass: function (proxy, classes, opts) {
      return Alloy.resetClass(getControllerParam(), proxy, classes, opts);
    },

    /**
        * @method updateViews
        * Applies a set of properties to view elements associated with this controller.
        * This method is useful for setting properties on repeated elements such as
        * {@link Titanium.UI.TableViewRow TableViewRow} objects, rather than needing to have a controller
        * for those child controllers.
        * #### Example
        * The following example uses this method to update a Label inside a TableViewRow object
        * before adding it to a TableView.
       	 * View-controller file: controllers/index.js
       for (var i=0; i < 10; i++) {
        var row = Alloy.createController("tablerow");
        row.updateViews({
        	"#theLabel": {
        		text: "I am row #" + i
        	}
        });
        $.tableView.appendRow(row.getView());
       };
       		 * XML view: views/tablerow.xml
       <Alloy>
       <TableViewRow>
       	<Label id="theLabel"></Label>
       </TableViewRow>
       </Alloy>
       		 * XML view: views/index.xml
       <TableView id="tableView">
       </TableView>
        * @param {Object} args An object whose keys are the IDs (in form '#id') of views to which the styles will be applied.
        * @since 1.4.0
       	 */







    updateViews: function (args) {
      var views = this.getViews();
      if (_.isObject(args)) {
        _.each(_.keys(args), function (key) {
          var elem = views[key.substring(1)];
          if (key.indexOf('#') === 0 && key !== '#' && _.isObject(elem) && typeof elem.applyProperties === 'function') {
            // apply the properties but make sure we're applying them to a Ti.UI object (not a controller)
            elem.applyProperties(args[key]);
          }
        });
      }
      return this;
    },

    /**
        * @method addListener
        * Adds a tracked event listeners to a view proxy object.
        * By default, any event listener declared in XML is tracked by Alloy.
        *
        * #### Example
        * Add an event to the tracking target.
       $.addListener($.aView, 'click', onClick);
       	 * @param {Object} proxy Proxy view object to listen to.
        * @param {String} type Name of the event.
        * @param {Function} callback Callback function to invoke when the event is fired.
        * @returns {String} ID attribute of the view object.  If one does not exist, Alloy will create a unique ID.
        * @since 1.7.0
        */


    addListener: function (proxy, type, callback) {
      if (!proxy.id) {
        proxy.id = _.uniqueId('__trackId');

        if (_.has(this.__views, proxy.id)) {
          Ti.API.error('$.addListener: ' + proxy.id + ' was conflict.');
          return;
        }
      }

      proxy.addEventListener(type, callback);
      this.__events.push({
        id: proxy.id,
        view: proxy,
        type: type,
        handler: callback });


      return proxy.id;
    },

    /**
        * @method getListener
        * Gets all the tracked event listeners of the view-controller or
        * only the ones specified by the parameters.  Passing no parameters,
        * retrieves all tracked event listeners. Set a parameter to `null`
        * if you do not want to restrict the match to that parameter.
        *
        * #### Example
        * Get all events bound to the view-controller.
       var listener = $.getListener();
       	 * @param {Object} [proxy] Proxy view object.
        * @param {String} [type] Name of the event.
        * @returns {Array<TrackedEventListener>} List of tracked event listeners.
        * @since 1.7.0
        */



    getListener: function (proxy, type) {
      return _.filter(this.__events, function (event, index) {
        if ((!proxy || proxy.id === event.id) && (
        !type || type === event.type)) {
          return true;
        }

        return false;
      });
    },

    /**
        * @method removeListener
        * Removes all tracked event listeners or only the ones
        * specified by the parameters. Passing no parameters,
        * removes all tracked event listeners.  Set a parameter to `null`
        * if you do not want to restrict the match to that parameter.
        *
        * #### Example
        * When the window is closed, remove all tracked event listeners.
       <Alloy>
       <Window onOpen="doOpen" onClose="doClose">
       	<Label id="label" onClick="doClick">Hello, world</Label>
       </Window>
       </Alloy>
       function doClose() {
       $.removeListener();
       }
        * @param {Object} [proxy] Proxy view object to remove event listeners from.
        * @param {String} [type] Name of the event to remove.
        * @param {Function} [callback] Callback to remove.
        * @returns {Alloy.Controller} Controller instance.
        * @since 1.7.0
        */


    removeListener: function (proxy, type, callback) {
      this.__events.forEach(function (event, index) {
        if ((!proxy || proxy.id === event.id) && (
        !type || type === event.type) && (
        !callback || callback === event.handler)) {
          event.view.removeEventListener(event.type, event.handler);
          delete self.__events[index];
        }
      });
      return this;
    } });

};
module.exports = Controller;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2VDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIkFsbG95IiwicmVxdWlyZSIsIkJhY2tib25lIiwiXyIsIkNvbnRyb2xsZXIiLCJyb290cyIsInNlbGYiLCJnZXRDb250cm9sbGVyUGFyYW0iLCJfX3dpZGdldElkIiwid2lkZ2V0SWQiLCJuYW1lIiwiX19jb250cm9sbGVyUGF0aCIsIl9faWFtYWxsb3kiLCJleHRlbmQiLCJFdmVudHMiLCJfX3ZpZXdzIiwiX19ldmVudHMiLCJfX3Byb3h5UHJvcGVydGllcyIsInNldFBhcmVudCIsInBhcmVudCIsImxlbiIsImxlbmd0aCIsImkiLCJhZGQiLCJhZGRUb3BMZXZlbFZpZXciLCJ2aWV3IiwicHVzaCIsImFkZFByb3h5UHJvcGVydHkiLCJrZXkiLCJ2YWx1ZSIsInJlbW92ZVByb3h5UHJvcGVydHkiLCJnZXRUb3BMZXZlbFZpZXdzIiwiZ2V0VmlldyIsImlkIiwicmVtb3ZlVmlldyIsImdldFByb3h5UHJvcGVydHkiLCJnZXRWaWV3cyIsImRlc3Ryb3kiLCJnZXRWaWV3RXgiLCJvcHRzIiwicmVjdXJzZSIsImdldFByb3h5UHJvcGVydHlFeCIsImNyZWF0ZVN0eWxlIiwiVUkiLCJjcmVhdGUiLCJhcGlOYW1lIiwiYWRkQ2xhc3MiLCJwcm94eSIsImNsYXNzZXMiLCJyZW1vdmVDbGFzcyIsInJlc2V0Q2xhc3MiLCJ1cGRhdGVWaWV3cyIsImFyZ3MiLCJ2aWV3cyIsImlzT2JqZWN0IiwiZWFjaCIsImtleXMiLCJlbGVtIiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImFwcGx5UHJvcGVydGllcyIsImFkZExpc3RlbmVyIiwidHlwZSIsImNhbGxiYWNrIiwidW5pcXVlSWQiLCJoYXMiLCJUaSIsIkFQSSIsImVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImhhbmRsZXIiLCJnZXRMaXN0ZW5lciIsImZpbHRlciIsImV2ZW50IiwiaW5kZXgiLCJyZW1vdmVMaXN0ZW5lciIsImZvckVhY2giLCJyZW1vdmVFdmVudExp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QXVCO0FBQ3JELFlBQUksQ0FBQyxDQUFDM0IsS0FBRCxJQUFVQSxLQUFLLENBQUNkLEVBQU4sS0FBYXdDLEtBQUssQ0FBQ3hDLEVBQTlCO0FBQ0YsU0FBQzZCLElBQUQsSUFBU0EsSUFBSSxLQUFLVyxLQUFLLENBQUNYLElBRHRCLENBQUosRUFDaUM7QUFDaEMsaUJBQU8sSUFBUDtBQUNBOztBQUVELGVBQU8sS0FBUDtBQUNBLE9BUE0sQ0FBUDtBQVFBLEtBeGI4Qjs7QUEwYi9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBYSxJQUFBQSxjQUFjLEVBQUUsVUFBUzVCLEtBQVQsRUFBZ0JlLElBQWhCLEVBQXNCQyxRQUF0QixFQUFnQztBQUMvQyxXQUFLL0MsUUFBTCxDQUFjNEQsT0FBZCxDQUFzQixVQUFTSCxLQUFULEVBQWdCQyxLQUFoQixFQUF1QjtBQUM1QyxZQUFJLENBQUMsQ0FBQzNCLEtBQUQsSUFBVUEsS0FBSyxDQUFDZCxFQUFOLEtBQWF3QyxLQUFLLENBQUN4QyxFQUE5QjtBQUNGLFNBQUM2QixJQUFELElBQVNBLElBQUksS0FBS1csS0FBSyxDQUFDWCxJQUR0QjtBQUVGLFNBQUNDLFFBQUQsSUFBYUEsUUFBUSxLQUFLVSxLQUFLLENBQUNILE9BRjlCLENBQUosRUFFNEM7QUFDM0NHLFVBQUFBLEtBQUssQ0FBQ2hELElBQU4sQ0FBV29ELG1CQUFYLENBQStCSixLQUFLLENBQUNYLElBQXJDLEVBQTJDVyxLQUFLLENBQUNILE9BQWpEO0FBQ0EsaUJBQU9oRSxJQUFJLENBQUNVLFFBQUwsQ0FBYzBELEtBQWQsQ0FBUDtBQUNBO0FBQ0QsT0FQRDtBQVFBLGFBQU8sSUFBUDtBQUNBLEtBN2Q4QixFQUFoQzs7QUErZEEsQ0EzZUQ7QUE0ZUFJLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjNFLFVBQWpCIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFsbG95ID0gcmVxdWlyZSgnL2FsbG95JyksXG5cdEJhY2tib25lID0gQWxsb3kuQmFja2JvbmUsXG5cdF8gPSBBbGxveS5fO1xuXG4vKipcbiAqIEBjbGFzcyBBbGxveS5Db250cm9sbGVyXG4gKiBAZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBBbGxveSBjb250cm9sbGVycy5cbiAqXG4gKiBFYWNoIGNvbnRyb2xsZXIgaXMgYXNzb2NpYXRlZCB3aXRoIGEgVUkgaGllcmFyY2h5LCBkZWZpbmVkIGluIGFuIFhNTCBmaWxlIGluIHRoZVxuICogYHZpZXdzYCBmb2xkZXIuIEVhY2ggZWxlbWVudCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgaXMgZWl0aGVyIGEgVGl0YW5pdW0ge0BsaW5rIFRpdGFuaXVtLlVJLlZpZXcgVmlld31cbiAqIG9yIGFub3RoZXIgQWxsb3kgY29udHJvbGxlciBvciB3aWRnZXQuIEVhY2ggQWxsb3kgY29udHJvbGxlciBvciB3aWRnZXQgY2FuIGFkZGl0aW9uYWxseSBjb250YWluXG4gKiBUaXRhbml1bSBWaWV3cyBhbmQvb3IgbW9yZSBjb250cm9sbGVycyBhbmQgd2lkZ2V0cy5cbiAqXG4gKi9cbnZhciBDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XG5cdHZhciByb290cyA9IFtdO1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0ZnVuY3Rpb24gZ2V0Q29udHJvbGxlclBhcmFtKCkge1xuXHRcdHJldHVybiBzZWxmLl9fd2lkZ2V0SWQgPyB7XG5cdFx0XHR3aWRnZXRJZDogc2VsZi5fX3dpZGdldElkLFxuXHRcdFx0bmFtZTogc2VsZi5fX2NvbnRyb2xsZXJQYXRoXG5cdFx0fSA6IHNlbGYuX19jb250cm9sbGVyUGF0aDtcblx0fVxuXG5cdHRoaXMuX19pYW1hbGxveSA9IHRydWU7XG5cdF8uZXh0ZW5kKHRoaXMsIEJhY2tib25lLkV2ZW50cywge1xuXHRcdF9fdmlld3M6IHt9LFxuXHRcdF9fZXZlbnRzOiBbXSxcblx0XHRfX3Byb3h5UHJvcGVydGllczoge30sXG5cdFx0c2V0UGFyZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcblx0XHRcdHZhciBsZW4gPSByb290cy5sZW5ndGg7XG5cblx0XHRcdGlmICghbGVuKSB7IHJldHVybjsgfVxuXG5cdFx0XHRpZiAocGFyZW50Ll9faWFtYWxsb3kpIHtcblx0XHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0aWYgKHJvb3RzW2ldLl9faWFtYWxsb3kpIHtcblx0XHRcdFx0XHRyb290c1tpXS5zZXRQYXJlbnQodGhpcy5wYXJlbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFyZW50LmFkZChyb290c1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGFkZFRvcExldmVsVmlldzogZnVuY3Rpb24odmlldykge1xuXHRcdFx0cm9vdHMucHVzaCh2aWV3KTtcblx0XHR9LFxuXHRcdGFkZFByb3h5UHJvcGVydHk6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcblx0XHRcdHRoaXMuX19wcm94eVByb3BlcnRpZXNba2V5XSA9IHZhbHVlO1xuXHRcdH0sXG5cdFx0cmVtb3ZlUHJveHlQcm9wZXJ0eTogZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRkZWxldGUgdGhpcy5fX3Byb3h5UHJvcGVydGllc1trZXldO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGdldFRvcExldmVsVmlld3Ncblx0XHQgKiBSZXR1cm5zIGEgbGlzdCBvZiB0aGUgcm9vdCB2aWV3IGVsZW1lbnRzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRyb2xsZXIuXG5cblx0XHQgKiAjIyMjIEV4YW1wbGVcblx0XHQgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGlzcGxheXMgdGhlIGBpZGAgb2YgZWFjaCB0b3AtbGV2ZWwgdmlldyBhc3NvY2lhdGVkIHdpdGggdGhlXG5cdFx0ICogY29udHJvbGxlcjpcblxuXHQvLyBpbmRleC5qc1xuXHR2YXIgdmlld3MgPSAkLmdldFRvcExldmVsVmlld3MoKTtcblx0Zm9yIChlYWNoIGluIHZpZXdzKSB7XG5cdFx0dmFyIHZpZXcgPSB2aWV3c1tlYWNoXTtcblx0XHRjb25zb2xlLmxvZyh2aWV3LmlkKTtcblx0fVxuXG5cdFx0ICpcblx0XHQgKlxuXHRcdCAqIEByZXR1cm4ge0FycmF5LjwoVGl0YW5pdW0uVUkuVmlld3xBbGxveS5Db250cm9sbGVyKT59XG5cdFx0ICovXG5cdFx0Z2V0VG9wTGV2ZWxWaWV3czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcm9vdHM7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgZ2V0Vmlld1xuXHRcdCAqIFJldHVybnMgdGhlIHNwZWNpZmllZCB2aWV3IGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRyb2xsZXIuXG5cdFx0ICpcblx0XHQgKiBJZiBubyBgaWRgIGlzIHNwZWNpZmllZCwgcmV0dXJucyB0aGUgZmlyc3QgdG9wLWxldmVsIHZpZXcuXG5cdFx0ICpcblx0XHQgKiAjIyMjIEV4YW1wbGVcblx0XHQgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZ2V0cyBhIHJlZmVyZW5jZSB0byBhIGA8V2luZG93Lz5gIG9iamVjdFxuXHRcdCAqIHdpdGggdGhlIGBpZGAgb2YgXCJsb2dpbldpblwiIGFuZCB0aGVuIGNhbGxzIGl0cyBbb3BlbigpXShUaXRhbml1bS5VSS5XaW5kb3cpIG1ldGhvZC5cblxuXHR2YXIgbG9naW5XaW5kb3cgPSAkLmdldFZpZXcoJ2xvZ2luV2luJyk7XG5cdGxvZ2luV2luZG93Lm9wZW4oKTtcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbaWRdIElEIG9mIHRoZSB2aWV3IHRvIHJldHVybi5cblx0XHQgKiBAcmV0dXJuIHtUaXRhbml1bS5VSS5WaWV3L0FsbG95LkNvbnRyb2xsZXJ9XG5cdFx0ICovXG5cdFx0Z2V0VmlldzogZnVuY3Rpb24oaWQpIHtcblx0XHRcdGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnIHx8IGlkID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiByb290c1swXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLl9fdmlld3NbaWRdO1xuXHRcdH0sXG5cdFx0cmVtb3ZlVmlldzogZnVuY3Rpb24oaWQpIHtcblx0XHRcdGRlbGV0ZSB0aGlzW2lkXTtcblx0XHRcdGRlbGV0ZSB0aGlzLl9fdmlld3NbaWRdO1xuXHRcdH0sXG5cblx0XHRnZXRQcm94eVByb3BlcnR5OiBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fX3Byb3h5UHJvcGVydGllc1tuYW1lXTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQG1ldGhvZCBnZXRWaWV3c1xuXHRcdCAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCBJRGVkIHZpZXcgZWxlbWVudHMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udHJvbGxlci5cblx0XHQgKlxuXHRcdCAqICMjIyMgRXhhbXBsZVxuXHRcdCAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgWE1MIHZpZXc6XG5cblx0PEFsbG95PlxuXHRcdDxUYWJHcm91cCBpZD1cInRhYnNcIj5cblx0XHRcdDxUYWIgdGl0bGU9XCJUYWIgMVwiIGljb249XCJLU19uYXZfdWkucG5nXCIgaWQ9XCJ0YWIxXCI+XG5cdFx0XHRcdDxXaW5kb3cgdGl0bGU9XCJUYWIgMVwiIGlkPVwid2luMVwiPlxuXHRcdFx0XHRcdDxMYWJlbCBpZD1cImxhYmVsMVwiPkkgYW0gV2luZG93IDE8L0xhYmVsPlxuXHRcdFx0XHQ8L1dpbmRvdz5cblx0XHRcdDwvVGFiPlxuXHRcdFx0PFRhYiB0aXRsZT1cIlRhYiAyXCIgaWNvbj1cIktTX25hdl92aWV3cy5wbmdcIiBpZD1cInRhYjJcIj5cblx0XHRcdFx0PFdpbmRvdyB0aXRsZT1cIlRhYiAyXCIgaWQ9XCJ3aW5kMlwiPlxuXHRcdFx0XHRcdDxMYWJlbCBpZD1cImxhYmVsMlwiPkkgYW0gV2luZG93IDI8L0xhYmVsPlxuXHRcdFx0XHQ8L1dpbmRvdz5cblx0XHRcdDwvVGFiPlxuXHRcdDwvVGFiR3JvdXA+XG5cdFx0PFZpZXcgaWQ9XCJvdGhlcnZpZXdcIj48L1ZpZXc+XG5cdDwvQWxsb3k+XG5cblx0XHQqIFRoZSBmb2xsb3dpbmcgdmlldy1jb250cm9sbGVyIG91dHB1dHMgdGhlIGlkIG9mIGVhY2ggdmlldyBpbiB0aGUgaGllcmFyY2h5LlxuXG5cdHZhciB2aWV3cyA9ICQuZ2V0Vmlld3MoKTtcblx0Zm9yIChlYWNoIGluIHZpZXdzKSB7XG5cdFx0dmFyIHZpZXcgPSB2aWV3c1tlYWNoXTtcblx0XHRjb25zb2xlLmxvZyh2aWV3LmlkKTtcblx0fVxuXG5cdFtJTkZPXSA6ICAgd2luMVxuXHRbSU5GT10gOiAgIGxhYmVsMVxuXHRbSU5GT10gOiAgIHRhYjFcblx0W0lORk9dIDogICB3aW5kMlxuXHRbSU5GT10gOiAgIGxhYmVsMlxuXHRbSU5GT10gOiAgIHRhYjJcblx0W0lORk9dIDogICB0YWJzXG5cdFtJTkZPXSA6ICAgb3RoZXJ2aWV3XG5cblx0XHQgKiBAcmV0dXJuIHtBcnJheS48KFRpdGFuaXVtLlVJLlZpZXd8QWxsb3kuQ29udHJvbGxlcik+fVxuXHRcdCAqL1xuXHRcdGdldFZpZXdzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLl9fdmlld3M7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgZGVzdHJveVxuXHRcdCAqIEZyZWVzIGJpbmRpbmcgcmVzb3VyY2VzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRyb2xsZXIgYW5kIGl0c1xuXHRcdCAqIFVJIGNvbXBvbmVudHMuIEl0IGlzIGNyaXRpY2FsIHRoYXQgdGhpcyBpcyBjYWxsZWQgd2hlbiBlbXBsb3lpbmdcblx0XHQgKiBtb2RlbC9jb2xsZWN0aW9uIGJpbmRpbmcgaW4gb3JkZXIgdG8gYXZvaWQgcG90ZW50aWFsIG1lbW9yeSBsZWFrcy5cblx0XHQgKiAkLmRlc3Ryb3koKSBzaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIGEgY29udHJvbGxlcidzIFVJIGlzIHRvXG5cdFx0ICogYmUgXCJjbG9zZWRcIiBvciByZW1vdmVkIGZyb20gdGhlIGFwcC4gU2VlIHRoZSBbRGVzdHJveWluZyBEYXRhIEJpbmRpbmdzXSgjIS9ndWlkZS9EZXN0cm95aW5nX0RhdGFfQmluZGluZ3MpXG5cdFx0ICogdGVzdCBhcHBsaWNhdGlvbiBmb3IgYW4gZXhhbXBsZSBvZiB0aGlzIGFwcHJvYWNoLlxuXG5cdFx0ICogIyMjIyBFeGFtcGxlXG5cdFx0ICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHRoZSB2aWV3LWNvbnRyb2xsZXIgZm9yIGEge0BsaW5rIFRpdGFuaXVtLlVJLldpbmRvdyBXaW5kb3d9IG9iamVjdCBuYW1lZCBgZGlhbG9nYFxuXHRcdCAqIGNhbGxzIGl0cyBgZGVzdHJveSgpYCBtZXRob2QgaW4gcmVzcG9uc2UgdG8gdGhlIFdpbmRvdyBvYmplY3QgYmVpbmcgY2xvc2VkLlxuXG5cblx0JC5kaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0XHQkLmRlc3Ryb3koKTtcblx0fSk7XG5cdFx0ICovXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBkZXN0cm95KCkgaXMgZGVmaW5lZCBkdXJpbmcgdGhlIGNvbXBpbGUgcHJvY2VzcyBiYXNlZCBvblxuXHRcdFx0Ly8gdGhlIFVJIGNvbXBvbmVudHMgYW5kIGJpbmRpbmcgY29udGFpbmVkIHdpdGhpbiB0aGUgY29udHJvbGxlci5cblx0XHR9LFxuXG5cdFx0Ly8gZ2V0Vmlld0V4IGZvciBhZHZhbmNlZCBwYXJzaW5nIGFuZCBlbGVtZW50IHRyYXZlcnNhbFxuXHRcdGdldFZpZXdFeDogZnVuY3Rpb24ob3B0cykge1xuXHRcdFx0dmFyIHJlY3Vyc2UgPSBvcHRzLnJlY3Vyc2UgfHwgZmFsc2U7XG5cdFx0XHRpZiAocmVjdXJzZSkge1xuXHRcdFx0XHR2YXIgdmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdFx0XHRpZiAoIXZpZXcpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fSBlbHNlIGlmICh2aWV3Ll9faWFtYWxsb3kpIHtcblx0XHRcdFx0XHRyZXR1cm4gdmlldy5nZXRWaWV3RXgoeyByZWN1cnNlOiB0cnVlIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB2aWV3O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIGdldFByb3h5UHJvcGVydHlFeCBmb3IgYWR2YW5jZWQgcGFyc2luZyBhbmQgZWxlbWVudCB0cmF2ZXJzYWxcblx0XHRnZXRQcm94eVByb3BlcnR5RXg6IGZ1bmN0aW9uKG5hbWUsIG9wdHMpIHtcblx0XHRcdHZhciByZWN1cnNlID0gb3B0cy5yZWN1cnNlIHx8IGZhbHNlO1xuXHRcdFx0aWYgKHJlY3Vyc2UpIHtcblx0XHRcdFx0dmFyIHZpZXcgPSB0aGlzLmdldFByb3h5UHJvcGVydHkobmFtZSk7XG5cdFx0XHRcdGlmICghdmlldykge1xuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHZpZXcuX19pYW1hbGxveSkge1xuXHRcdFx0XHRcdHJldHVybiB2aWV3LmdldFByb3h5UHJvcGVydHkobmFtZSwgeyByZWN1cnNlOiB0cnVlIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB2aWV3O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KG5hbWUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGNyZWF0ZVN0eWxlXG5cdFx0ICogQ3JlYXRlcyBhIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyBiYXNlZCBvbiB0aGUgc3BlY2lmaWVkIHN0eWxlcy5cblx0XHQgKlxuXHRcdCAqXG5cdFx0ICogWW91IGNhbiB1c2UgdGhpcyBkaWN0aW9uYXJ5IHdpdGggdGhlIHZpZXcgb2JqZWN0J3Ncblx0XHQgKiB7QGxpbmsgVGl0YW5pdW0uVUkuVmlldyNtZXRob2QtYXBwbHlQcm9wZXJ0aWVzIGFwcGx5UHJvcGVydGllc30gbWV0aG9kXG5cdFx0ICogb3IgYSBjcmVhdGUgb2JqZWN0IG1ldGhvZCwgc3VjaCBhcyB7QGxpbmsgVGl0YW5pdW0uVUkjbWV0aG9kLWNyZWF0ZVZpZXcgVGl0YW5pdW0uVUkuY3JlYXRlVmlld30uXG5cdFx0ICogIyMjIyBFeGFtcGxlc1xuXHRcdCAqIFRoZSBmb2xsb3dpbmcgY3JlYXRlcyBhIG5ldyBzdHlsZSBvYmplY3QgdGhhdCBpcyBwYXNzZWQgYXMgYSBwYXJhbWV0ZXJcblx0XHQgKiB0byB0aGUge0BsaW5rIFRpdGFuaXVtLlVJI21ldGhvZC1jcmVhdGVMYWJlbCBUaS5VSS5jcmVhdGVMYWJlbCgpfSBtZXRob2QuXG5cblx0dmFyIHN0eWxlQXJncyA9IHtcblx0YXBpTmFtZTogJ1RpLlVJLkxhYmVsJyxcblx0XHRjbGFzc2VzOiBbJ2JsdWUnLCdzaGFkb3cnLCdsYXJnZSddLFxuXHRcdGlkOiAndGVzdGVyJyxcblx0XHRib3JkZXJXaWR0aDogMixcblx0XHRib3JkZXJSYWRpdXM6IDE2LFxuXHRcdGJvcmRlckNvbG9yOiAnIzAwMCdcblx0fTtcblx0dmFyIHN0eWxlT2JqZWN0ID0gJC5jcmVhdGVTdHlsZShzdHlsZUFyZ3MpO1xuXHR0ZXN0TGFiZWwgPSBUaS5VSS5jcmVhdGVMYWJlbChzdHlsZU9iamVjdCk7XG5cblx0XHQgKiBUaGUgbmV4dCBleGFtcGxlIHVzZXMgdGhlIHtAbGluayBUaXRhbml1bSNtZXRob2QtYXBwbHlQcm9wZXJ0aWVzIGFwcGx5UHJvcGVydGllcygpfSBtZXRob2Rcblx0XHQgKiB0byBhcHBseSBhIHN0eWxlIG9iamVjdCB0byBhbiBleGlzdGluZyBCdXR0b24gY29udHJvbCAoYnV0dG9uIG5vdCBzaG93bikuXG5cblx0dmFyIHN0eWxlID0gJC5jcmVhdGVTdHlsZSh7XG5cdFx0Y2xhc3NlczogYXJncy5idXR0b24sXG5cdFx0YXBpTmFtZTogJ0J1dHRvbicsXG5cdFx0Y29sb3I6ICdibHVlJ1xuXHR9KTtcblx0JC5idXR0b24uYXBwbHlQcm9wZXJ0aWVzKHN0eWxlKTtcblx0XHQgKiBAcGFyYW0ge0FsbG95U3R5bGVEaWN0fSBvcHRzIERpY3Rpb25hcnkgb2Ygc3R5bGVzIHRvIGFwcGx5LlxuXHRcdCAqXG5cdFx0ICogQHJldHVybiB7RGljdGlvbmFyeX1cblx0XHQgKiBAc2luY2UgMS4yLjBcblxuXHRcdCAqL1xuXHRcdGNyZWF0ZVN0eWxlOiBmdW5jdGlvbihvcHRzKSB7XG5cdFx0XHRyZXR1cm4gQWxsb3kuY3JlYXRlU3R5bGUoZ2V0Q29udHJvbGxlclBhcmFtKCksIG9wdHMpO1xuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIERvY3VtZW50ZWQgaW4gZG9jcy9hcGlkb2MvY29udHJvbGxlci5qc1xuXHRcdCAqL1xuXHRcdFVJOiB7XG5cdFx0XHRjcmVhdGU6IGZ1bmN0aW9uKGFwaU5hbWUsIG9wdHMpIHtcblx0XHRcdFx0cmV0dXJuIEFsbG95LlVJLmNyZWF0ZShnZXRDb250cm9sbGVyUGFyYW0oKSwgYXBpTmFtZSwgb3B0cyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgYWRkQ2xhc3Ncblx0XHQgKiBBZGRzIGEgVFNTIGNsYXNzIHRvIHRoZSBzcGVjaWZpZWQgdmlldyBvYmplY3QuXG5cdFx0ICpcblx0XHQgKiBZb3UgY2FuIGFwcGx5IGFkZGl0aW9uYWwgc3R5bGVzIHdpdGggdGhlIGBvcHRzYCBwYXJhbWV0ZXIuIFRvIHVzZSB0aGlzIG1ldGhvZFxuXHRcdCAqIGVmZmVjdGl2ZWx5IHlvdSBtYXkgbmVlZCB0byBlbmFibGUgYXV0b3N0eWxpbmdcblx0XHQgKiBvbiB0aGUgdGFyZ2V0IFhNTCB2aWV3LiBTZWUgW0F1dG9zdHlsZV0oIyEvZ3VpZGUvRHluYW1pY19TdHlsZXMtc2VjdGlvbi0zNzUzMDQxNV9EeW5hbWljU3R5bGVzLUF1dG9zdHlsZSlcblx0XHQgKiBpbiB0aGUgQWxsb3kgZGV2ZWxvcGVyIGd1aWRlLlxuXHRcdCAqICMjIyMgRXhhbXBsZVxuXHRcdCAqIFRoZSBmb2xsb3dpbmcgYWRkcyB0aGUgVFNTIGNsYXNzZXMgXCIucmVkYmdcIiBhbmQgXCIuYmlnZ2VyXCIgdG8gYSB7QGxpbmsgVGl0YW5pdW0uVUkuTGFiZWx9XG5cdFx0ICogb2JqZWN0IHByb3h5IGBsYWJlbDFgLCBhbmQgYWxzbyBzZXRzIHRoZSBsYWJlbCdzIGB0ZXh0YCBwcm9wZXJ0eSB0byBcIkNhbmNlbFwiLlxuXG5cdC8vIGluZGV4LmpzXG5cdCQuYWRkQ2xhc3MoJC5sYWJlbDEsICdyZWRiZyBiaWdnZXInLCB7dGV4dDogXCJDYW5jZWxcIn0pO1xuXG5UaGUgJ3JlZGJnJyBhbmQgJ2JpZ2dlcicgY2xhc3NlcyBhcmUgc2hvd24gYmVsb3c6XG5cblx0Ly8gaW5kZXgudHNzXG5cdFwiLnJlZGJnXCIgOiB7XG5cdFx0Y29sb3I6ICdyZWQnXG5cdH1cblx0XCIuYmlnZ2VyXCI6IHtcblx0XHRmb250IDoge1xuXHRcdCAgIGZvbnRTaXplOiAnMzYnXG5cdFx0fVxuXHR9XG5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gcHJveHkgVmlldyBvYmplY3QgdG8gd2hpY2ggdG8gYWRkIGNsYXNzKGVzKS5cblx0XHQgKiBAcGFyYW0ge0FycmF5PFN0cmluZz4vU3RyaW5nfSBjbGFzc2VzIEFycmF5IG9yIHNwYWNlLXNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgdG8gYXBwbHkuXG5cdFx0ICogQHBhcmFtIHtEaWN0aW9uYXJ5fSBbb3B0c10gRGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGFwcGx5IGFmdGVyIGNsYXNzZXMgaGF2ZSBiZWVuIGFkZGVkLlxuXHRcdCAqIEBzaW5jZSAxLjIuMFxuXHRcdCAqL1xuXHRcdGFkZENsYXNzOiBmdW5jdGlvbihwcm94eSwgY2xhc3Nlcywgb3B0cykge1xuXHRcdFx0cmV0dXJuIEFsbG95LmFkZENsYXNzKGdldENvbnRyb2xsZXJQYXJhbSgpLCBwcm94eSwgY2xhc3Nlcywgb3B0cyk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgcmVtb3ZlQ2xhc3Ncblx0XHQgKiBSZW1vdmVzIGEgVFNTIGNsYXNzIGZyb20gdGhlIHNwZWNpZmllZCB2aWV3IG9iamVjdC5cblx0XHQgKlxuXHRcdCAqIFlvdSBjYW4gYXBwbHkgYWRkaXRpb25hbCBzdHlsZXMgYWZ0ZXIgdGhlIHJlbW92YWwgd2l0aCB0aGUgYG9wdHNgIHBhcmFtZXRlci5cblx0XHQgKiBUbyB1c2UgdGhpcyBtZXRob2QgZWZmZWN0aXZlbHkgeW91IG1heSBuZWVkIHRvIGVuYWJsZSBhdXRvc3R5bGluZ1xuXHRcdCAqIG9uIHRoZSB0YXJnZXQgWE1MIHZpZXcuIFNlZSBbQXV0b3N0eWxlXSgjIS9ndWlkZS9EeW5hbWljX1N0eWxlcy1zZWN0aW9uLTM3NTMwNDE1X0R5bmFtaWNTdHlsZXMtQXV0b3N0eWxlKVxuXHRcdCAqIGluIHRoZSBBbGxveSBkZXZlbG9wZXIgZ3VpZGUuXG5cdFx0ICogIyMjIyBFeGFtcGxlXG5cdFx0ICogVGhlIGZvbGxvd2luZyByZW1vdmVzIHRoZSBcInJlZGJnXCIgYW5kIFwiYmlnZ2VyXCIgVFNTIGNsYXNzZXMgZnJvbSBhIHtAbGluayBUaXRhbml1bS5VSS5MYWJlbH1cblx0XHQgKiBvYmplY3QgcHJveHkgYGxhYmVsMWAsIGFuZCBhbHNvIHNldHMgdGhlIGxhYmVsJ3MgYHRleHRgIHByb3BlcnR5IHRvIFwiLi4uXCIuXG5cblx0JC5yZW1vdmVDbGFzcygkLmxhYmVsMSwgJ3JlZGJnIGJpZ2dlcicsIHt0ZXh0OiBcIi4uLlwifSk7XG5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gcHJveHkgVmlldyBvYmplY3QgZnJvbSB3aGljaCB0byByZW1vdmUgY2xhc3MoZXMpLlxuXHRcdCAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPi9TdHJpbmd9IGNsYXNzZXMgQXJyYXkgb3Igc3BhY2Utc2VwYXJhdGVkIGxpc3Qgb2YgY2xhc3NlcyB0byByZW1vdmUuXG5cdFx0ICogQHBhcmFtIHtEaWN0aW9uYXJ5fSBbb3B0c10gRGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGFwcGx5IGFmdGVyIHRoZSBjbGFzcyByZW1vdmFsLlxuXHRcdCAqIEBzaW5jZSAxLjIuMFxuXHRcdCAqL1xuXHRcdHJlbW92ZUNsYXNzOiBmdW5jdGlvbihwcm94eSwgY2xhc3Nlcywgb3B0cykge1xuXHRcdFx0cmV0dXJuIEFsbG95LnJlbW92ZUNsYXNzKGdldENvbnRyb2xsZXJQYXJhbSgpLCBwcm94eSwgY2xhc3Nlcywgb3B0cyk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgcmVzZXRDbGFzc1xuXHRcdCAqIFNldHMgdGhlIGFycmF5IG9mIFRTUyBjbGFzc2VzIGZvciB0aGUgdGFyZ2V0IFZpZXcgb2JqZWN0LCBhZGRpbmcgdGhlIGNsYXNzZXMgc3BlY2lmaWVkIGFuZFxuXHRcdCAqIHJlbW92aW5nIGFueSBhcHBsaWVkIGNsYXNzZXMgdGhhdCBhcmUgbm90IHNwZWNpZmllZC5cblx0XHQgKlxuXHRcdCAqIFlvdSBjYW4gYXBwbHkgY2xhc3NlcyBvciBzdHlsZXMgYWZ0ZXIgdGhlIHJlc2V0IHVzaW5nIHRoZSBgY2xhc3Nlc2Agb3IgYG9wdHNgIHBhcmFtZXRlcnMuXG5cdFx0ICogVG8gdXNlIHRoaXMgbWV0aG9kIGVmZmVjdGl2ZWx5IHlvdSBtYXkgbmVlZCB0byBlbmFibGUgYXV0b3N0eWxpbmdcblx0XHQgKiBvbiB0aGUgdGFyZ2V0IFhNTCB2aWV3LiBTZWUgW0F1dG9zdHlsZV0oIyEvZ3VpZGUvRHluYW1pY19TdHlsZXMtc2VjdGlvbi0zNzUzMDQxNV9EeW5hbWljU3R5bGVzLUF1dG9zdHlsZSlcblx0XHQgKiBpbiB0aGUgQWxsb3kgZGV2ZWxvcGVyIGd1aWRlLlxuXG5cdFx0ICogIyMjIyBFeGFtcGxlXG5cdFx0ICogVGhlIGZvbGxvd2luZyByZW1vdmVzIGFsbCBwcmV2aW91c2x5IGFwcGxpZWQgc3R5bGVzIG9uIGBsYWJlbDFgIGFuZCB0aGVuIGFwcGxpZXNcblx0XHQgKiB0aGUgVFNTIGNsYXNzICduby1zdHlsZScuXG5cblx0JC5yZXNldENsYXNzKCQubGFiZWwxLCAnbm8tc3R5bGUnKTtcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gcHJveHkgVmlldyBvYmplY3QgdG8gcmVzZXQuXG5cdFx0ICogQHBhcmFtIHtBcnJheTxTdHJpbmc+L1N0cmluZ30gW2NsYXNzZXNdIEFycmF5IG9yIHNwYWNlLXNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgdG8gYXBwbHkgYWZ0ZXIgdGhlIHJlc2V0LlxuXHRcdCAqIEBwYXJhbSB7RGljdGlvbmFyeX0gW29wdHNdIERpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBhcHBseSBhZnRlciB0aGUgcmVzZXQuXG5cdFx0ICogQHNpbmNlIDEuMi4wXG5cdFx0ICovXG5cdFx0cmVzZXRDbGFzczogZnVuY3Rpb24ocHJveHksIGNsYXNzZXMsIG9wdHMpIHtcblx0XHRcdHJldHVybiBBbGxveS5yZXNldENsYXNzKGdldENvbnRyb2xsZXJQYXJhbSgpLCBwcm94eSwgY2xhc3Nlcywgb3B0cyk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgdXBkYXRlVmlld3Ncblx0XHQgKiBBcHBsaWVzIGEgc2V0IG9mIHByb3BlcnRpZXMgdG8gdmlldyBlbGVtZW50cyBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb250cm9sbGVyLlxuXHRcdCAqIFRoaXMgbWV0aG9kIGlzIHVzZWZ1bCBmb3Igc2V0dGluZyBwcm9wZXJ0aWVzIG9uIHJlcGVhdGVkIGVsZW1lbnRzIHN1Y2ggYXNcblx0XHQgKiB7QGxpbmsgVGl0YW5pdW0uVUkuVGFibGVWaWV3Um93IFRhYmxlVmlld1Jvd30gb2JqZWN0cywgcmF0aGVyIHRoYW4gbmVlZGluZyB0byBoYXZlIGEgY29udHJvbGxlclxuXHRcdCAqIGZvciB0aG9zZSBjaGlsZCBjb250cm9sbGVycy5cblx0XHQgKiAjIyMjIEV4YW1wbGVcblx0XHQgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgdXNlcyB0aGlzIG1ldGhvZCB0byB1cGRhdGUgYSBMYWJlbCBpbnNpZGUgYSBUYWJsZVZpZXdSb3cgb2JqZWN0XG5cdFx0ICogYmVmb3JlIGFkZGluZyBpdCB0byBhIFRhYmxlVmlldy5cblxuXHRcdCAqIFZpZXctY29udHJvbGxlciBmaWxlOiBjb250cm9sbGVycy9pbmRleC5qc1xuXG5cdGZvciAodmFyIGk9MDsgaSA8IDEwOyBpKyspIHtcblx0ICB2YXIgcm93ID0gQWxsb3kuY3JlYXRlQ29udHJvbGxlcihcInRhYmxlcm93XCIpO1xuXHQgIHJvdy51cGRhdGVWaWV3cyh7XG5cdCAgXHRcIiN0aGVMYWJlbFwiOiB7XG5cdCAgXHRcdHRleHQ6IFwiSSBhbSByb3cgI1wiICsgaVxuXHQgIFx0fVxuXHQgIH0pO1xuXHQgICQudGFibGVWaWV3LmFwcGVuZFJvdyhyb3cuZ2V0VmlldygpKTtcblx0fTtcblxuXHRcdFx0ICogWE1MIHZpZXc6IHZpZXdzL3RhYmxlcm93LnhtbFxuXG5cdDxBbGxveT5cblx0XHQ8VGFibGVWaWV3Um93PlxuXHRcdFx0PExhYmVsIGlkPVwidGhlTGFiZWxcIj48L0xhYmVsPlxuXHRcdDwvVGFibGVWaWV3Um93PlxuXHQ8L0FsbG95PlxuXG5cdFx0XHQgKiBYTUwgdmlldzogdmlld3MvaW5kZXgueG1sXG5cblx0PFRhYmxlVmlldyBpZD1cInRhYmxlVmlld1wiPlxuXHQ8L1RhYmxlVmlldz5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gYXJncyBBbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgdGhlIElEcyAoaW4gZm9ybSAnI2lkJykgb2Ygdmlld3MgdG8gd2hpY2ggdGhlIHN0eWxlcyB3aWxsIGJlIGFwcGxpZWQuXG5cdFx0ICogQHNpbmNlIDEuNC4wXG5cblx0XHQgKi9cblx0XHR1cGRhdGVWaWV3czogZnVuY3Rpb24oYXJncykge1xuXHRcdFx0dmFyIHZpZXdzID0gdGhpcy5nZXRWaWV3cygpO1xuXHRcdFx0aWYgKF8uaXNPYmplY3QoYXJncykpIHtcblx0XHRcdFx0Xy5lYWNoKF8ua2V5cyhhcmdzKSwgZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRcdFx0dmFyIGVsZW0gPSB2aWV3c1trZXkuc3Vic3RyaW5nKDEpXTtcblx0XHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoJyMnKSA9PT0gMCAmJiBrZXkgIT09ICcjJyAmJiBfLmlzT2JqZWN0KGVsZW0pICYmIHR5cGVvZiBlbGVtLmFwcGx5UHJvcGVydGllcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Ly8gYXBwbHkgdGhlIHByb3BlcnRpZXMgYnV0IG1ha2Ugc3VyZSB3ZSdyZSBhcHBseWluZyB0aGVtIHRvIGEgVGkuVUkgb2JqZWN0IChub3QgYSBjb250cm9sbGVyKVxuXHRcdFx0XHRcdFx0ZWxlbS5hcHBseVByb3BlcnRpZXMoYXJnc1trZXldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgYWRkTGlzdGVuZXJcblx0XHQgKiBBZGRzIGEgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMgdG8gYSB2aWV3IHByb3h5IG9iamVjdC5cblx0XHQgKiBCeSBkZWZhdWx0LCBhbnkgZXZlbnQgbGlzdGVuZXIgZGVjbGFyZWQgaW4gWE1MIGlzIHRyYWNrZWQgYnkgQWxsb3kuXG5cdFx0ICpcblx0XHQgKiAjIyMjIEV4YW1wbGVcblx0XHQgKiBBZGQgYW4gZXZlbnQgdG8gdGhlIHRyYWNraW5nIHRhcmdldC5cblxuXHQkLmFkZExpc3RlbmVyKCQuYVZpZXcsICdjbGljaycsIG9uQ2xpY2spO1xuXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IHByb3h5IFByb3h5IHZpZXcgb2JqZWN0IHRvIGxpc3RlbiB0by5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBOYW1lIG9mIHRoZSBldmVudC5cblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQuXG5cdFx0ICogQHJldHVybnMge1N0cmluZ30gSUQgYXR0cmlidXRlIG9mIHRoZSB2aWV3IG9iamVjdC4gIElmIG9uZSBkb2VzIG5vdCBleGlzdCwgQWxsb3kgd2lsbCBjcmVhdGUgYSB1bmlxdWUgSUQuXG5cdFx0ICogQHNpbmNlIDEuNy4wXG5cdFx0ICovXG5cdFx0YWRkTGlzdGVuZXI6IGZ1bmN0aW9uKHByb3h5LCB0eXBlLCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKCFwcm94eS5pZCkge1xuXHRcdFx0XHRwcm94eS5pZCA9IF8udW5pcXVlSWQoJ19fdHJhY2tJZCcpO1xuXG5cdFx0XHRcdGlmIChfLmhhcyh0aGlzLl9fdmlld3MsIHByb3h5LmlkKSkge1xuXHRcdFx0XHRcdFRpLkFQSS5lcnJvcignJC5hZGRMaXN0ZW5lcjogJyArIHByb3h5LmlkICsgJyB3YXMgY29uZmxpY3QuJyk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHByb3h5LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuXHRcdFx0dGhpcy5fX2V2ZW50cy5wdXNoKHtcblx0XHRcdFx0aWQ6IHByb3h5LmlkLFxuXHRcdFx0XHR2aWV3OiBwcm94eSxcblx0XHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdFx0aGFuZGxlcjogY2FsbGJhY2tcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gcHJveHkuaWQ7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgZ2V0TGlzdGVuZXJcblx0XHQgKiBHZXRzIGFsbCB0aGUgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMgb2YgdGhlIHZpZXctY29udHJvbGxlciBvclxuXHRcdCAqIG9ubHkgdGhlIG9uZXMgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXJzLiAgUGFzc2luZyBubyBwYXJhbWV0ZXJzLFxuXHRcdCAqIHJldHJpZXZlcyBhbGwgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMuIFNldCBhIHBhcmFtZXRlciB0byBgbnVsbGBcblx0XHQgKiBpZiB5b3UgZG8gbm90IHdhbnQgdG8gcmVzdHJpY3QgdGhlIG1hdGNoIHRvIHRoYXQgcGFyYW1ldGVyLlxuXHRcdCAqXG5cdFx0ICogIyMjIyBFeGFtcGxlXG5cdFx0ICogR2V0IGFsbCBldmVudHMgYm91bmQgdG8gdGhlIHZpZXctY29udHJvbGxlci5cblxuXHR2YXIgbGlzdGVuZXIgPSAkLmdldExpc3RlbmVyKCk7XG5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3h5XSBQcm94eSB2aWV3IG9iamVjdC5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIE5hbWUgb2YgdGhlIGV2ZW50LlxuXHRcdCAqIEByZXR1cm5zIHtBcnJheTxUcmFja2VkRXZlbnRMaXN0ZW5lcj59IExpc3Qgb2YgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMuXG5cdFx0ICogQHNpbmNlIDEuNy4wXG5cdFx0ICovXG5cblx0XHRnZXRMaXN0ZW5lcjogZnVuY3Rpb24ocHJveHksIHR5cGUpIHtcblx0XHRcdHJldHVybiBfLmZpbHRlcih0aGlzLl9fZXZlbnRzLCBmdW5jdGlvbihldmVudCwgaW5kZXgpIHtcblx0XHRcdFx0aWYgKCghcHJveHkgfHwgcHJveHkuaWQgPT09IGV2ZW50LmlkKSAmJlxuXHRcdFx0XHRcdCghdHlwZSB8fCB0eXBlID09PSBldmVudC50eXBlKSkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgcmVtb3ZlTGlzdGVuZXJcblx0XHQgKiBSZW1vdmVzIGFsbCB0cmFja2VkIGV2ZW50IGxpc3RlbmVycyBvciBvbmx5IHRoZSBvbmVzXG5cdFx0ICogc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXJzLiBQYXNzaW5nIG5vIHBhcmFtZXRlcnMsXG5cdFx0ICogcmVtb3ZlcyBhbGwgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMuICBTZXQgYSBwYXJhbWV0ZXIgdG8gYG51bGxgXG5cdFx0ICogaWYgeW91IGRvIG5vdCB3YW50IHRvIHJlc3RyaWN0IHRoZSBtYXRjaCB0byB0aGF0IHBhcmFtZXRlci5cblx0XHQgKlxuXHRcdCAqICMjIyMgRXhhbXBsZVxuXHRcdCAqIFdoZW4gdGhlIHdpbmRvdyBpcyBjbG9zZWQsIHJlbW92ZSBhbGwgdHJhY2tlZCBldmVudCBsaXN0ZW5lcnMuXG5cblx0PEFsbG95PlxuXHRcdDxXaW5kb3cgb25PcGVuPVwiZG9PcGVuXCIgb25DbG9zZT1cImRvQ2xvc2VcIj5cblx0XHRcdDxMYWJlbCBpZD1cImxhYmVsXCIgb25DbGljaz1cImRvQ2xpY2tcIj5IZWxsbywgd29ybGQ8L0xhYmVsPlxuXHRcdDwvV2luZG93PlxuXHQ8L0FsbG95PlxuXG5cdGZ1bmN0aW9uIGRvQ2xvc2UoKSB7XG5cdFx0JC5yZW1vdmVMaXN0ZW5lcigpO1xuXHR9XG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm94eV0gUHJveHkgdmlldyBvYmplY3QgdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyBmcm9tLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gTmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlLlxuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gQ2FsbGJhY2sgdG8gcmVtb3ZlLlxuXHRcdCAqIEByZXR1cm5zIHtBbGxveS5Db250cm9sbGVyfSBDb250cm9sbGVyIGluc3RhbmNlLlxuXHRcdCAqIEBzaW5jZSAxLjcuMFxuXHRcdCAqL1xuXHRcdHJlbW92ZUxpc3RlbmVyOiBmdW5jdGlvbihwcm94eSwgdHlwZSwgY2FsbGJhY2spIHtcblx0XHRcdHRoaXMuX19ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCwgaW5kZXgpIHtcblx0XHRcdFx0aWYgKCghcHJveHkgfHwgcHJveHkuaWQgPT09IGV2ZW50LmlkKSAmJlxuXHRcdFx0XHRcdCghdHlwZSB8fCB0eXBlID09PSBldmVudC50eXBlKSAmJlxuXHRcdFx0XHRcdCghY2FsbGJhY2sgfHwgY2FsbGJhY2sgPT09IGV2ZW50LmhhbmRsZXIpKSB7XG5cdFx0XHRcdFx0ZXZlbnQudmlldy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LnR5cGUsIGV2ZW50LmhhbmRsZXIpO1xuXHRcdFx0XHRcdGRlbGV0ZSBzZWxmLl9fZXZlbnRzW2luZGV4XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjtcbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL3VzZXIwMDEvRG9jdW1lbnRzL0FwcGNlbGVyYXRvcl9TdHVkaW9fV29ya3NwYWNlL29jci9SZXNvdXJjZXMvYW5kcm9pZC9hbGxveS9jb250cm9sbGVycyJ9
