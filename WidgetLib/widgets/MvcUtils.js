/**
 * @fileoverview
 * This script defines some MVC utilities, notably a GenericModel object that 
 * implements common behaviour for data/state managed by a widget.
 *
 * @version $Id$
 * @author Graham Klyne, copied and adapted from a similar module by Alistair Miles.
 *
 * @requires MochiKit.Base
 * @requires MochiKit.Dom
 * @requires MochiKit.Logging
 * @requires MochiKit.Signal
 */

// TODO - apply namespace to other modules (later)
// TODO - refactor code from WidgetFunctions?
// TODO - break this into more focused modules

// create a namespace if not already defined
webbrick.namespace("webbrick.widgets.MvcUtils");

/**
 *  Add logging functions to global namespace, for convenience
 */
logDebug   = MochiKit.Logging.logDebug;
logInfo    = MochiKit.Logging.log;
logWarning = MochiKit.Logging.logWarning;
logError   = MochiKit.Logging.logError;

// -------------------
// Create error object
// -------------------

/**
 *  Construct an error object of specified type
 *
 * @param   {String} nam    type name of error - used by code to identify the error
 * @param   {String} msg    error message for display to user
 */
webbrick.Error = function(nam, msg) {
    e = new Error(msg);
    e.name = nam;
    return e;
};

// --------------------
// Generic widget model
// --------------------

/** 
 * @class
 * A generic model class for an MVC widget or application.
 * @constructor
 *
 * @param {Object} definition the definition of the model.  
 *      Fields of this object are:
 *      propertyNames:
 *          a list of model property names
 *      controlledValues:
 *          an object indexed by property name, and returning false-equivalent, 
 *          or a list of terms that enumerate allowed values for that property
 *      defaultValues:
 *          an object indexed by property name that contains static default values
 *          for model properties that are not initialized more dynamically.
 */
webbrick.widgets.GenericModel = function(definition) {
    logDebug("webbrick.widgets.GenericModel");

    /** 
     *  Private data object storing the model.
     */
    this._data = new Object();

    /**
     *  Private array of property names.
     */
    this._propertyNames = definition.propertyNames;

    /**
     *  Private definition of controlled-enumeration property values.
     */
    this._controlledValues = definition.controlledValues;

    logDebug("webbrick.widgets.GenericModel: initial (default) values");
    for (var vn in definition.defaultValues) {
        logDebug("webbrick.widgets.GenericModel: data["+vn+"] = "+definition.defaultValues[vn]);
        this._data[vn] = definition.defaultValues[vn];
    };
};

/** Get a property of the model.
 * @param {String} propertyName the name of the property to get
 */
webbrick.widgets.GenericModel.prototype.get = function( propertyName ) {
    this._validatePropertyName(propertyName);
    return this._data[propertyName];
};

/** Get a property of the model, or a default value if the supplied property name is null.
 * @param {String} propertyName the name of the property to get
 * @param {any}    defaultValue default value returned if supplied name is null
 */
webbrick.widgets.GenericModel.prototype.getDefault = function(propertyName, defaultValue) {
    var result = defaultValue;
    if (propertyName) {
        this._validatePropertyName(propertyName);
        result = this._data[propertyName];
    };
    return result;
};

/** Set a property of the model (all listeners will be notified of the change).
 * @param   {String} propertyName   the name of the property to set
 * @param   {Any} value             the new value of the property
 * @return  {Any}                   the previous value of the property.
 */
webbrick.widgets.GenericModel.prototype.set = function( propertyName, value ) {
    this._validatePropertyValuePair(propertyName, value);
    var oldValue = this._data[propertyName];                // store the old value
    this._data[propertyName] = value;                       // set the new value
    this._notifyListeners(propertyName, oldValue, value);   // notify the change
    return oldValue;
};

/** Validate a property name.
 * @param {String} propertyName the name of the property to validate
 * @private
 */
webbrick.widgets.GenericModel.prototype._validatePropertyName = function( propertyName ) {
    var valid = false;
    for (var i=0; i<this._propertyNames.length; i++) {
        if (this._propertyNames[i] == propertyName) valid = true;
    };
    if (!valid) {
        throw webbrick.Error("InvalidPropertyNameError", 
            "Invalid property name: "+propertyName);
    };
};

/** Validate a property value pair.
 *
 * For properties whose values are restricted to a predefined enumeration
 * of values, check the supplied value is valid.
 *  
 * @param {String} propertyName the name of the property to validate
 * @param {Any} value the property value to validate
 * @private
 */
webbrick.widgets.GenericModel.prototype._validatePropertyValuePair = function( propertyName, value ) {
    var valid = false;
    this._validatePropertyName(propertyName);
    var values = this._controlledValues[propertyName];
    if (values) {
        for (var i=0; i<values.length; i++) {
            if (value == values[i]) {
                valid = true;
            }   
        }
    } else {
        valid = true;
    };
    if (!valid) {
        throw webbrick.Error("InvalidPropertyValuePairError", 
            "Invalid property-value pair, property name: "+propertyName+
            ", property value: "+value);
    };
};

/** Add a property change listener to this model.
 *
 * The listener is called as:
 *   listener(model, propName, oldvalue, newvalue);
 *
 * @param {String}      property    name of property to listen to
 * @param {Function}    listener    a function to call when the property changes
 * @param {Object}      baseobj     if non-null, a base object of which listener is 
 *                                  a member (value of 'this' for listener callback)
 *                                  otherwise 'this' is the model object.
 */
webbrick.widgets.GenericModel.prototype.addListener = function(propertyName, listener, baseobj) {
    logDebug("addListener: "+propertyName);
    this._validatePropertyName(propertyName);
    // NOTE: if disconnect functionality is added, save the value returned by 'connect'
    if (typeof baseobj != "undefined" && baseobj != null) {
        //logDebug("addListener: baseobj: "+baseobj+", listener: "+listener);
        MochiKit.Signal.connect(this, propertyName, baseobj, listener);
    } else {
        //logDebug("addListener: listener: "+listener);
        MochiKit.Signal.connect(this, propertyName, listener);
    };
};

/** Notify all listeners of a property change.
 * @param {String} propertyName the name of the property to validate
 * @param {Any} oldValue the old property value
 * @param {Any} newValue the new property value
 * @private
 */
webbrick.widgets.GenericModel.prototype._notifyListeners = function( propertyName, oldValue, newValue ) {
    logDebug("_notifyListeners, "+propertyName+", old: "+oldValue+", new: "+newValue);
    MochiKit.Signal.signal(this, propertyName, this, propertyName, oldValue, newValue);
};

/** 
 *  Swap the model values for a new set of values, returning the previous values that
 *  have been swapped out.
 *
 * @param   {Object} newprops       a dictionary of property name/values that
 *                                  are swapped into the model.
 * @return  {Object}                a dictionary of property name/values that
 *                                  are swapped out of the model.  Only those 
 *                                  properties updated are returned.
 */
// TODO - review whether a separate listener should be used for SWAP 
//      - only needed if individual update calls cause display glitches.
webbrick.widgets.GenericModel.prototype.swap = function (newprops) {
    logDebug("GenericModel.swap");
    var oldprops = {};
    for (var pn in newprops) {
        oldprops[pn] = this.set(pn, newprops[pn]);
    } ;
    return oldprops
};

// -----------------------------------------------
// Generic widget DOM renderer and input collector
// -----------------------------------------------

/** 
 * @class
 * A generic DOM renderer class for an MVC widget or application.
 * @constructor
 *
 *  Fields of the renderer definition object are:
 *  renderFunctions:
 *      a dictionary of function definitions that are added to the renderer
 *      object.  Each definition has a name for the new function, a function 
 *      reference or name of an existing renderer method), and a number of
 *      additional parameters that are partially applied in the defined 
 *      function.  Functions thus defined may be used as event handlers for
 *      other 
 *  renderModel:
 *      a dictionary of model variable names mapping to the name of a
 *      renderer method that is called to process a change in the 
 *      indicated model variable.  The named renderer method function may 
 *      (and generally will) be defined via the renderFunctions table.
 *  collectDomInputs:
 *      A dictionary that maps DOM events to the name of a renderer/collector 
 *      method that is called to signal the event has occurred.
 *      The signalling function may (and generally will) be defined via
 *      the renderFunctions table.
 */
webbrick.widgets.GenericDomRenderer = function() {

    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._elem  = null;

    /**
     * @private
     * @type Object
     * definition of renderer
     */
    this._defn  = null;
    
    /**
     * @private
     * @type webbrick.widgets.GenericModel
     * Model for this widget.
     */
    this._model = null;

};

/**
 *  Process renderer definition
 *
 * @param   {Object} definition     a structure that defines the renderer.
 * @param   {HTMLElement} element   an HTML element into which the widget is
 *                                  rendered.
 */
webbrick.widgets.GenericDomRenderer.prototype.processDefinition = function
        (definition, element) {
    logDebug("GenericDomRenderer.processDefinition");
    this._elem  = element;
    this._defn  = definition;

    // Create new function definitions
    logDebug("GenericDomRenderer.processDefinition: create new function definitions");
    for (var fn in this._defn.renderFunctions) {
        var fd = this._defn.renderFunctions[fn];
        if (this[fd[0]] == undefined) {
            var msg = "GenericDomRenderer.processDefinition: renderer function "+fd[0]+" not defined" 
            logError(msg);
            throw Error("ValueDefinitionError", msg);
        }
        if (fd.length == 2) {
            this[fn] = MochiKit.Base.bind(fd[0],this,fd[1]);
        }
        else if (fd.length == 3) {
            this[fn] = MochiKit.Base.bind(fd[0],this,fd[1],fd[2]);
        }
    };

    // Connect DOM event handlers
    logDebug("GenericDomRenderer.connectModel: connect model listeners");
    for (var ev in this._defn.collectDomInputs) {
        var handler = this[this._defn.collectDomInputs[ev]];
        logDebug("GenericDomRenderer.processDefinition: connect event: "+ev);
        //logDebug("GenericDomRenderer.processDefinition: connect event: "+ev+", "+this+", "+handler);
        MochiKit.Signal.connect(this._elem, ev, this, handler);
    };
};

// --- renderer methods ---

/**
 *  Connect model to renderer
 *
 * @param   {GenericModel} model    a widget model whose state-changes are rended
 */
webbrick.widgets.GenericDomRenderer.prototype.connectModel = function (model) {
    logDebug("GenericDomRenderer.connectModel: "+model);
    this._model = model;

    if (this._defn === null) {
        throw webbrick.Error("MissingRendererDefinitionError", 
            "MissingRendererDefinitionError: (missed initialization?)");
    };

    // Connect model listeners
    logDebug("GenericDomRenderer.connectModel: connect model listeners");
    for (var mname in this._defn.renderModel) {
        var mfunc = this[this._defn.renderModel[mname]];
        logDebug("GenericDomRenderer.connectModel: name: "+mname+", func: "+mfunc);
        this._model.addListener(mname, mfunc, this);
    };

};

/**
 *  Listener sets attribute to new value of model element.
 *
 * @param   {String} attribute      name of attribute of element to set
 * @param   {GenericModel} model    the widget model being rendered
 * @param   {String} propname       name of the changed model property
 * @param   {any} oldvalue          previous value of the changed model property
 * @param   {any} newvalue          new value of the changed model property
 *
 *  This function should be partially applied to name of attribute to yield a usable
 *  model listener function.
 */
webbrick.widgets.GenericDomRenderer.prototype.setAttributeValue = function 
        (attribute, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.setAttributeValue: "+newvalue);
    MochiKit.DOM.setNodeAttribute(this._elem, attribute, newvalue);
};

/**
 *  Listener sets element text to new value of model element.
 *
 * @param   {GenericModel} model    the widget model being rendered
 * @param   {String} propname       name of the changed model property
 * @param   {any} oldvalue          previous value of the changed model property
 * @param   {any} newvalue          new value of the changed model property
 *
 *  This function should be partially applied to name of attribute to yield a usable
 *  model listener function.
 */
webbrick.widgets.GenericDomRenderer.prototype.setElementText = function 
        (unused, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.setElementText: "+newvalue);
    webbrick.widgets.setElementText(this._elem, newvalue);
};

/**
 *  Listener sets widget element class to new value from map indexed by new value 
 *  of model element.
 *
 * @param   {Object} valuemap       an object used as a dictionary to map model values
 *                                  to DOM class values
 * @param   {GenericModel} model    the widget model being rendered
 * @param   {String} propname       name of the changed model property
 * @param   {any} oldvalue          previous value of the changed model property
 * @param   {any} newvalue          new value of the changed model property
 *
 *  This function should be partially applied to the map object 
 *  to yield a model listener function.
 */
webbrick.widgets.GenericDomRenderer.prototype.setClassMapped = function 
        (valuemap, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.setClassMapped: newvalue: "+newvalue+", oldvalue: "+oldvalue);
    var oldclass = valuemap[oldvalue];
    var newclass = valuemap[newvalue];
    logDebug("GenericDomRenderer.setClassMapped: newclass: "+newclass+", oldclass: "+oldclass);
    MochiKit.DOM.removeElementClass(this._elem, oldclass);
    MochiKit.DOM.addElementClass(this._elem, newclass);
};

/**
 *  Listener sets content of element located by a path of tag names from
 *  the widget base element.
 *
 * @param   {Array} path            a list of tag names defining a path from the
 *                                  widget base to the required sub-element.
 * @param   {GenericModel} model    the widget model being rendered
 * @param   {String} propname       name of the changed model property
 * @param   {any} oldvalue          previous value of the changed model property
 * @param   {any} newvalue          new value of the changed model property
 *
 *  This function should be partially applied to the path parameter 
 *  to yield a model listener function.
 */
webbrick.widgets.GenericDomRenderer.prototype.setWidgetPathText = function 
        (path, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.setWidgetPathText: newvalue: "+newvalue+", oldvalue: "+oldvalue);
    elem = webbrick.widgets.getElementByTagPath(this._elem, path);
    webbrick.widgets.setElementText(elem, newvalue);
};

/**
 *  Listener sets class element located by a path of tag names from
 *  the widget base element.
 *
 * @param   {Object} valuemap       an object used as a dictionary to map model values
 *                                  to DOM class values
 * @param   {Array} path            a list of tag names defining a path from the
 *                                  widget base to the required sub-element.
 * @param   {GenericModel} model    the widget model being rendered
 * @param   {String} propname       name of the changed model property
 * @param   {any} oldvalue          previous value of the changed model property
 * @param   {any} newvalue          new value of the changed model property
 *
 *  This function should be partially applied to the path parameter 
 *  to yield a model listener function.
 */
webbrick.widgets.GenericDomRenderer.prototype.setWidgetPathClass = function 
        (valuemap, path, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.setWidgetPathClass: newvalue: "+newvalue+", oldvalue: "+oldvalue);
    elem = webbrick.widgets.getElementByTagPath(this._elem, path);
    var oldclass = valuemap[oldvalue];
    var newclass = valuemap[newvalue];
    logDebug("GenericDomRenderer.setWidgetPathClass: newclass: "+newclass+", oldclass: "+oldclass);
    MochiKit.DOM.removeElementClass(elem, oldclass);
    MochiKit.DOM.addElementClass(elem, newclass);
};

// TODO - define more renderer base methods as required

// --- collector methods ---

/**
 *  Function called when button is clicked - down, up, clicked.
 *
 *  The input is propagated as a MochiKit non-DOM signal.
 *
 * @param   {String} signalname Name of signal to raise when event click occurs
 * @param   {Object} eventmap   Maps event type values to singnal parameter values.
 *                              No signal is generated for DOM event types that do
 *                              not appear in this table.
 * @param   {Object} event      MochiKit custom event object corresponding to the
 *                              incoming DOM event.
 *
 *  This function should be partially applied to name of signal to generate and an 
 *  event type mapping table to yield a usable DOM event handler function.
 */
webbrick.widgets.GenericDomRenderer.prototype.domEventClicked = function 
        (signalname, eventmap, event) {
    MochiKit.Logging.logDebug("SimpleButton.collector.domEventClicked");
    var eventtype = event.type();
    pubevent = eventmap[eventtype];
    MochiKit.Logging.logDebug("SimpleButton.collector.domEventClicked: "+pubevent);
    if (pubevent !== null) {
        MochiKit.Signal.signal(this, signalname, pubevent);
    };
};

// TODO - define more collector base methods as required


// -----------------------------------------------
// Additional widget functions
// -----------------------------------------------

/**
 *  Make an element visible.
 *
 * @param   {Element} element   the element to make visible
 */
webbrick.widgets.show = function( element ) {
    MochiKit.DOM.removeElementClass(element, "invisible");
}

/** 
 *  Make an element invisible.
 *
 * @param   {Element} element   the element to make invisible
 */
webbrick.widgets.hide = function( element ) {
    MochiKit.DOM.addElementClass(element, "invisible");
}

/** 
 *  Retrieve widget value from the DOM element class mapped though supplied mapping table.
 *
 *  Note that this function performs a reverse transformation through the supplied 
 *  mapping.  The mapping for the first matched class is returned.
 *
 * @param   {Object} classmap       an object that maps widget state to a corresponding
 *                                  DOM element class.
 * @param   {HTMLElement} element   is the widget element whose DOM class is mapped to
 *                                  a state value.
 * @return  {String}                A widget state value, or null of none of the class
 *                                  values are applied to the widget element.
 */
webbrick.widgets.getMappedClass = function(classmap, element) {
    for (var s in classmap) {
        if (MochiKit.DOM.hasElementClass(element, classmap[s])) {
            return s;
        };
    };
    return null;
};

/** 
 *  Get sub-element of widget by following supplied element path
 *
 * @param   {String*} path          a list of element names that define a path from
 *                                  the widget's root element to the desired inner
 *                                  element.
 * @param   {HTMLElement} element   the element whose textual content is retrieved.
 * @return  {HTMLElement}           the element designated by the given path. 
 */
webbrick.widgets.getWidgetPathElement = function(path, element) {
    for (var i in path) {
        var n = path[i];
        e = element.getElementsByTagName(n);
        if (e.length == 0) {
            throw "ValueError", "DOM element contains no <"+n+"> child";
        };
        if (e.length > 1) {
            throw "ValueError", "DOM element contains more than one <"+n+"> child";
        };
        element = e[0];
    };
    return element;
};

/** 
 *  Retrieve widget value from an attribute of the supplied DOM element.
 *
 * @param   {String} attrname       name of the attribute whose value is retrieved.
 * @param   {HTMLElement} element   the element whose attribute value is retrieved.
 * @return  {String}                the attribute value, or null if the attribute is
 *                                  not present on the element.
 */
webbrick.widgets.getWidgetAttribute = function(attrname, element) {
    // See http://developer.mozilla.org/en/DOM/element.getAttribute#Notes
    if (element.hasAttribute(attrname)) {
        return element.getAttribute(attrname);
    };
    return null;
};

/** 
 *  Retrieve widget value from the textual content of the supplied DOM element.
 *
 * @param   {HTMLElement} element   the element whose textual content is retrieved.
 * @return  {String}                the element textual content, which may be an empty string
 */
webbrick.widgets.getWidgetContent = function(element) {
    return element.innerHTML;
    // or null if there is no element content?
};

/** 
 *  Retrieve the textual content of the supplied element at at the end of
 *  the supplied path from the supplied element.
 *
 * @param   {String*} path          a list of element names that define a path from
 *                                  the widget's root element to the desired inner
 *                                  element.
 * @param   {HTMLElement} element   the element whose textual content is retrieved.
 * @return  {String}                the element textual content, which may be an empty string
 */
webbrick.widgets.getWidgetPathContent = function(path, element) {
    var e = webbrick.widgets.getWidgetPathElement(path, element);
    return webbrick.widgets.getWidgetContent(e);
};

/** 
 *  Retrieve the class of the supplied element at at the end of
 *  the supplied path from the supplied element.
 *
 * @param   {Object} classmap       an object that maps widget state to a corresponding
 *                                  DOM element class.
 * @param   {String*} path          a list of element names that define a path from
 *                                  the widget's root element to the desired inner
 *                                  element.
 * @param   {HTMLElement} element   the element whose textual content is retrieved.
 * @return  {String}                the element textual content, which may be an empty string
 */
webbrick.widgets.getWidgetPathClass = function(classmap, path, element) {
    var e = webbrick.widgets.getWidgetPathElement(path, element);
    return webbrick.widgets.getMappedClass(classmap, e);
};

/**
 *  Helper function to extract widget parameters from a DOM element.
 *  Used when initializing a widget with values in the DOM.
 *
 * @param   {Object} valueDefs      an object used as a dictionary of value definitions
 *                                  in the form used by GenericModel.initializeValues
 *                                  (see webbrick.widgets.GenericModel)
 * @return  {Object}                an object that is a dictionary of values extracted
 *                                  from the DOM, and which may be used to initialise
 *                                  or swap into a widget model
 *
 *  The value definitions (valueDefs) are provided as an object indexed by value name 
 *  that defines dynamic extracting widget values from a DOM element.  The functions 
 *  are defined as a function and any parameters that are passed to that function.
 *  The widget's DOM element is appended to this list of parameters.
 */
// TODO - generalize multiple parameter support
webbrick.widgets.getWidgetValues = function(valueDefs, elem) {
    logDebug("webbrick.widgets.getWidgetValues: extract widget parameters from DOM");
    var modelvals = {};
    for (var vname in valueDefs) {
        var vfunc = valueDefs[vname];
        var vval  = null;
        if (vfunc.length == 1) {
            vval = vfunc[0](elem);
        }
        else if (vfunc.length == 2) {
            vval = vfunc[0](vfunc[1], elem);
        }
        else if (vfunc.length == 3) {
            vval = vfunc[0](vfunc[1], vfunc[2], elem);
        }
        else {
            throw Error( 
                "ValueDefinitionError: Unexpected entry length in getWidgetValues definition: "+
                vfunc.length);
        }
        if (vval !== null) {
            modelvals[vname] = vval;
        };
    };
    return modelvals;
}; 

/**
 *  Helper function for confirming that exactly a specified one of a list of
 *  class values is present on an element.
 *
 * @param   {Object} elem       DOM element to be tested
 * @param   {String} exected    expected class value
 * @param   (String*} trials    list of class values to test
 * @return  (String*}           null if only the expected value is present, 
 *                              or a list of unexpected class values found.
 */
webbrick.widgets.testClassValues = function(elem,expected,trials) {
    var mismatch = [];
    var result   = null;
    for (var i = 0 ; i <trials.length ; i++) {
        var c = MochiKit.DOM.hasElementClass(elem, trials[i]);
        if (c != ( trials[i] == expected ) ) {
            mismatch.push(trials[i]);
            result = mismatch;
        }
    }
    return result;
};

// End.
