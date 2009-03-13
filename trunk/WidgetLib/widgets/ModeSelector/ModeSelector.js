/**
 * @fileoverview
 * Module providing logic for ModeSelector widget to generate and respond to events.
 *
 * @version $Id$
 * @author Graham Klyne
 *
 * @requires MochiKit.Base
 * @requires MochiKit.DOM
 * @requires MochiKit.Logging
 * @requires MochiKit.Signal
 * @requires webbrick.widgets.MvcUtils
 */

// -----
// Setup
// -----

// Create a namespace (if not already defined)
webbrick.namespace("webbrick.widgets");

// Check dependencies
webbrick.require("MochiKit.Base");
webbrick.require("MochiKit.DOM");
webbrick.require("MochiKit.Logging");
webbrick.require("MochiKit.Signal");
webbrick.require("webbrick.widgets.MvcUtils");

// ----------------
// Model definition
// ----------------

/**
 *  Definition of ModeSelector model, with dynamic values determined by widget
 *  behaviour and interactions, and static values initialized with parameters
 *  provided when the widget is created.
 */
webbrick.widgets.ModeSelector_ModelDefinition = {
    propertyNames : [ 
        // Dynamic values:
        "MODE",                     // Current mode (integer 0..N)
        "STATE",                    // Overall state of widget
        "BUTTONCOUNT",              // Number of selector buttons
        "BUTTONVALUES",             // Mode index value (1..N) for each button
        "BUTTONSTATES",             // True/false selection state for each button
        // Static parameters:
        "SelectionName",            // Mode/selection name covering all modes
        "Default",                  // Default mode (integer 0..N)
        "Subject",                  // Subject URI for mode-change events
        "SetModeEvent"              // Type URI for mode-change events
    ],
    controlledValues : {
        STATE:                  [ "normal",  "unknown" ]
    },
    defaultValues : {
        MODE:                   0,
        BUTTONSTATES:           ['_ModeSelector.BUTTONSTATES'],
        SelectionName:          "_ModeSelector.SelectionName",
        Default:                "_ModeSelector.Default",
        Subject:                "_ModeSelector.Subject",
        SetModeEvent:           "_ModeSelector.SetModeEvent"
    }
};

// -------------------------
// Model initialization data
// -------------------------

/**
 *  Dictionary used to initialize a model from DOM element, used with
 *  function webbrick.widgets.getWidgetValues (defined in MvcUtils).     
 *  
 *  Each entry initializes a single model value with the same name as
 *  the dictionary key value.  The value initializer is obtained by
 *  calling the indicated function with the supplied value and the DOM
 *  element as parameters.  Module webbrick.widgets.MvcUtils defines some
 *  commonly used functions in the webbrick.widgets namespace.
 */
webbrick.widgets.ModeSelector_InitializeValues = {
    MODE:
        [webbrick.widgets.getWidgetAttribute,   "Default"],
    BUTTONCOUNT:
        [webbrick.widgets.countSubelementArray, ["ModeSelectorButton"]],
    BUTTONVALUES:
        [webbrick.widgets.mapSubelementArray,   ["ModeSelectorButton", webbrick.widgets.getWidgetPathAttributeInt, "value", ["input"]]],
    BUTTONSTATES:
        [webbrick.widgets.mapSubelementArray,   ["ModeSelectorButton", webbrick.widgets.constantValue, false]],
    SelectionName:
        [webbrick.widgets.getWidgetAttribute,   "SelectionName"],
    Subject:
        [webbrick.widgets.getWidgetAttribute,   "Subject"],
    SetModeEvent:
        [webbrick.widgets.getWidgetAttribute,   "SetModeEvent"],
};

/**
 * A dictionary of class names used for rendering different selector mand button states. 
 */
webbrick.widgets.ModeSelector_ClassMap = {
    unknown:    "modeselector-unknown",
    normal:     "modeselector-normal",
    selected:   "modeselector-selected"
};    

// ---------------
// Incoming events
// ---------------

/**
 * Table of event subscriptions for this widget.
 *
 * Each entry is a triple consisting of:
 *   the name of the model property that defines the event type URI
 *   the name of the model property that defines the event source URI, or null
 *   the name of the event handler method of the widget object to be subscribed.
 */
webbrick.widgets.ModeSelector_EventSubscriptions = [
    ["SetModeEvent", "Subject", "SetModeEventHandler"]
];

// ---------------------
// Widget initialization
// ---------------------

/**
 * Function to create and return a new ModeSelector object.
 *
 * Widget element attributes:
 *  [[[see initializeValues below]]]
 *
 * @param   {HTMLElement}   element     HTML element that constitutes the widget.
 * @return  A WIDGETSAMPLE widget object - can be discarded
 * @type    {webbrick.widgets.ModeSelector}
 */
webbrick.widgets.ModeSelector_Init = function (element) {
    MochiKit.Logging.logDebug("ModeSelector_Init: create renderer/collector");

    // Create a renderer
    var renderer  = new webbrick.widgets.ModeSelector.renderer(element);
    renderer.initialize();

    // Extract a dictionary of values from the DOM, to be used to initialize the widget model.
    MochiKit.Logging.logDebug("ModeSelector_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.ModeSelector_InitializeValues, element);

    // Create the widget object
    MochiKit.Logging.logDebug("ModeSelector: create widget");
    var widget = new webbrick.widgets.ModeSelector(modelvals, renderer, renderer);

    // Finish initializing the widget 
    widget.setMode(0);
    
    return widget;
};

// ------------------------------
// Widget main class (controller)
// ------------------------------

/**
 * @class
 * Class for a ModeSelector widget, implementing the controller functions for the widget.
 *
 * @constructor
 * @param {Object}      modelvals   object that supplies values to initialize the model
 * @param {Object}      renderer    object used to render the widget
 * @param {Object}      collecter   object used to collect and deliver input events
 */
webbrick.widgets.ModeSelector = function (modelvals, renderer, collector) {
   
    /**
     * @private
     * @type Object
     * Widget renderer object.
     */
    this._renderer = renderer;
    
    /**
     * @private
     * @type Object
     * Widget input collector object.
     */
    this._collector = collector;
    
    /**
     * @private
     * @type webbrick.widgets.GenericModel
     * Model for this ModeSelector widget
     */
    this._model = null;

    /**
     * @private
     * Table of event subscriptions for this widget.
     *
     * Each entry is a triple consisting of:
     *   the name of the model property that defines the event type URI
     *   the name of the model property that defines the event source URI, or null
     *   the name of the event handler method of this object to be subscribed.
     */
    this._subscribes = webbrick.widgets.ModeSelector_EventSubscriptions;

    // ---- Initialize ----

    // Create the model
    MochiKit.Logging.logDebug(
        "ModeSelector: create model: "+webbrick.widgets.ModeSelector_ModelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.ModeSelector_ModelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("ModeSelector: populate model");
    this._model.swap(modelvals);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("ModeSelector: connect model listeners");
    this._renderer.connectModel(this._model);

    // Connect controller input listeners to input collector
    MochiKit.Logging.logDebug("ModeSelector: connect input collector listeners");
    MochiKit.Signal.connect(this._collector, 'ModeSelect', this, this.ModeButtonClicked);

    // Connect controller to external control events
    // (Subscribed event definitions reference the model)
    webbrick.widgets.SubscribeWidgetEvents(this, this._model, this._subscribes);

    MochiKit.Logging.logDebug("ModeSelector: initialized");
};

// ------------------
// Controller methods
// ------------------

webbrick.widgets.ModeSelector.prototype.setMode = function (mode) {
    MochiKit.Logging.logDebug("ModeSelector.setMode: "+mode);
    this._model.set("MODE", mode);
    var state = "unknown";
    for (var i = 0 ; i < this._model.get("BUTTONCOUNT") ; i++) {
        // look for matching button
        if (this._model.getIndexed("BUTTONVALUES", i) == mode) {
            state = "normal"
        };
    };
    this._model.set("STATE", state);
    for (i = 0 ; i < this._model.get("BUTTONCOUNT") ; i++) {
        // look for matching button
        var sel = this._model.getIndexed("BUTTONVALUES", i) == mode;
        this._model.setIndexed("BUTTONSTATES", i, sel);
    };
    MochiKit.Logging.logDebug("ModeSelector.setMode: done.");
};

// ------------------------------
// Input collector event handlers
// ------------------------------

/**
 *  Function called when mode selection button is clicked
 *
 * @param {String}      inputtype   a string value that indicates the type of 
 *                      click event (e.g. 'up', 'down', etc.).  
 */
webbrick.widgets.ModeSelector.prototype.ModeButtonClicked = function (inputtype) {
    MochiKit.Logging.logDebug("ModeSelector.ModeButtonClicked: "+inputtype);
    webbrick.widgets.publishEvent(
            this._model.get("Subject"), 
            this._model.get("SetModeEvent"), 
            inputtype);
};

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

/**
 *  Incoming event handler for setting the current mode
 */
webbrick.widgets.ModeSelector.prototype.SetModeEventHandler = function (handler, event) {
    var mode = webbrick.widgets.convertStringToInt(event.getPayload());
    MochiKit.Logging.logDebug("ModeSelector.SetModeEventHandler: "+mode);
    this.setMode(mode);
};

// --------------------------------------------
// Renderer and user input collector definition
// --------------------------------------------

/**
 *  Button value mapping function that returns the signal parameter value
 *  for an indicated button element, or null if no such value exists. 
 */
// Note: this function definition must precede the table below that refers to it
webbrick.widgets.ModeSelector.ButtonValueMap = function(elem) {
    return webbrick.widgets.getAttributeByTagPath(elem, ['input'], 'value')
};

/**
 *  Definitions for the ModeSelector DOM renderer and input collector
 */
webbrick.widgets.ModeSelector.rendererDefinition = {
    // Define functions used by other parts of the renderer definition
    renderFunctions: {
        SetModeModelListener:
            ['setAttributeValue', 'CurrentMode'],
        SetStateModelListener:
            ['setWidgetPathClass',  webbrick.widgets.ModeSelector_ClassMap, []],
        SetButtonStateModelListener:
            ['SetButtonStateModelListener', webbrick.widgets.ModeSelector_ClassMap],
        ButtonClicked: 
            ['domButtonClicked', 'ModeSelect', webbrick.widgets.ModeSelector.ButtonValueMap]
        },
    // Define model listener connections
    renderModel: {
        MODE:         'SetModeModelListener',
        STATE:        'SetStateModelListener',
        BUTTONSTATES: 'SetButtonStateModelListener'
    },
    // Define DOM input event connections
    collectDomInputs: {
        onclick:        'ButtonClicked'
    }
};

/**
 * @class
 *  ModeSelector renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the widget.
 */
webbrick.widgets.ModeSelector.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.ModeSelector.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.ModeSelector.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.ModeSelector.rendererDefinition, this._element);
};

/**
 *  Set class for a mode selection button (normal, selected or unknown)
 */
webbrick.widgets.ModeSelector.renderer.prototype.SetButtonStateModelListener = function
        (valuemap, model, propname, oldvalue, newvalue) {
    logDebug("GenericDomRenderer.SetButtonStateModelListener: propname: "+propname+
            ", newvalue: "+newvalue+", oldvalue: "+oldvalue);
    var path = ["ModeSelectorButton", propname[1]];
    var tfmap = {false: "normal", true: "selected"};
    var oldkey = tfmap[oldvalue];
    var newkey = tfmap[newvalue];
    if (model.get("STATE") == "unknown" ) {
        newkey = "unknown";
    };
    this.setWidgetPathClass(valuemap, path, model, propname, "unknown", oldkey);
    this.setWidgetPathClass(valuemap, path, model, propname, oldkey, newkey);
};

// End.
