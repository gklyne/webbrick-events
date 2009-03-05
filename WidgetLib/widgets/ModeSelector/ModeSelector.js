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
        "BUTTONSTATES",             // True/false selection state for each button
        // Static parameters:
        "Default",                  // Default mode (integer 0..N)
        "Subject",                  // Subject URI for mode-change events
        "SetModeEvent"              // Type URI for mode-change events
    ],
    controlledValues : {
    },
    defaultValues : {
        MODE:                   "0",
        Subject:                "_ModeSelector.Subject",
        SetModeEvent:           "_ModeSelector.SetModeEvent"
    }
};

// -------------------------
// Model initialization data
// -------------------------

/**
 * Return an array value with an element for each DOM sub-element with
 * the indicated name, initialized to the specified value
 * 
 * @param   {[String,any]} subtagvalue  a pair consisting of a subtag name and an
 *                                      initial value for each allocated array 
 *                                      element.
 * @param   {HTMLElement} elem          an HTML element that is scanned for 
 *                                      matching sub-elements. 
 */
webbrick.widgets.allocateButtonArray = function(subtagvalue, elem) {
    var array  = new Array(elem.getElementsByTagName(subtagvalue[0]).length);
    for (var i = 0 ; i < array.length ; i++) {
        array[i] = subtagvalue[1];
    };
    MochiKit.Logging.logDebug("allocateButtonArray: "+array.length+", "+array[0]+", ...");
    return array;
};

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
    BUTTONSTATES:
        [webbrick.widgets.allocateButtonArray,  ["ModeSelectorButton",false]],
    Subject:
        [webbrick.widgets.getWidgetAttribute,   "Subject"],
    SetModeEvent:
        [webbrick.widgets.getWidgetAttribute,   "SetModeEvent"],
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
    var renderer  = new webbrick.widgets.ModeSelector.renderer(element);
    renderer.initialize();

    MochiKit.Logging.logDebug("ModeSelector_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.ModeSelector_InitializeValues, element);

    // Initialize button data
    var buttons = element.getElementsByTagName("ModeSelectorButton");
    for (var i = 0 ; i < buttons.length ; i++) {
        //TODO..............
    }

    MochiKit.Logging.logDebug("ModeSelector: create widget");
    var widget = new webbrick.widgets.ModeSelector(modelvals, renderer, renderer);
    
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

    ////////////////////
    // TODO: delete or enable this as appropriate
    // Connect controller input listeners to input collector
    ////MochiKit.Logging.logDebug("ModeSelector: connect input collector listeners");
    ////MochiKit.Signal.connect(this._collector, 'Clicked', this, this.Clicked);
    ////////////////////

    // Connect controller to external control events
    // (Subscribed event definitions reference the model)
    webbrick.widgets.SubscribeWidgetEvents(this, this._model, this._subscribes);

    MochiKit.Logging.logDebug("ModeSelector: initialized");
};

// ------------------------------
// Input collector event handlers
// ------------------------------

////////////////////
// TODO: delete this function if there are no user input events.
////////////////////

/**
 *  Function called when widget is clicked (down, up, clicked)
 *
 * @param {String}      inputtype   a string value that indicates the type of 
 *                      click event (e.g. 'up', 'down', etc.).  See also
 *                      the DOM event mapping table at 'ClickTypeMap' below. 
 */
webbrick.widgets.ModeSelector.prototype.Clicked = function (inputtype) {
    MochiKit.Logging.logDebug("ModeSelector.Clicked: "+inputtype);
    webbrick.widgets.publishEvent(
            this._model.get("YYYClickSource"),
            this._model.get("YYYClickEvent"),
            inputtype);
};

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

////////////////////
// TODO: These functions will need removing or adjusting to match the widget capabilities
// These functions support a common pattern of simple VALUE and STATE values in themodel
////////////////////

/**
 *  Incoming event handler for setting the current mode
 */
webbrick.widgets.ModeSelector.prototype.SetModeEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("ModeSelector.SetModeEventHandler: "+event.getPayload());
    this._model.set("MODE", event.getPayload());
};

// --------------------------------------------
// Renderer and user input collector definition
// --------------------------------------------

/**
 *  Table to map DOM event types to signal parameter values for Input collector
 */
webbrick.widgets.ModeSelector.ClickTypeMap = {
    click:      'click',
    mousedown:  'down',
    keydown:    'down',
    mouseup:    'up',
    keyup:      'up'
};

/**
 *  Definitions for the ModeSelector DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 *
 *  The collector class generates the following input events via MochiKit.Signal:
 *    'Clicked', with parameter 'click', 'down', or 'up' to indicate the type of input event.
 */
webbrick.widgets.ModeSelector.rendererDefinition = {
    // Define functions used by other parts of the renderer definition
    renderFunctions: {
        SetModeModelListener:  
            ['undefinedListener', 'SetModeModelListener'],
        SetButtonStateModelListener:  
            ['undefinedListener', 'SetButtonStateModelListener'],
        WidgetClicked: 
            ['undefinedListener', 'WidgetClicked']
        },
    // Define model listener connections
    renderModel: {
        MODE:         'SetModeModelListener',
        BUTTONSTATES: 'SetButtonStateModelListener'
    },
    // Define DOM input event connections
    collectDomInputs: {
        onclick:        'WidgetClicked',
        onmousedown:    'WidgetClicked',
        onmouseup:      'WidgetClicked',
        onkeydown:      'WidgetClicked',
        onkeyup:        'WidgetClicked'
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

// End.
