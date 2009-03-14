/**
 * @fileoverview
 * Module providing logic for numeric display to respond to (and generate?) events.
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

// Initialize numeric display: set up event subscriptions
// Note that event URIs are obtained from the server via widget attributes

/**
 * Function to create and return a new NumericDisplay object.
 *
 * Widget element attributes:
 *   SetNumericDisplayValueEvent    event type URI for setting numeric value to display
 *   SetNumericDisplayStateEvent    event type URI for setting numeric display state
 *
 * @param   {HTMLElement}   element HTML element that contains the numericv display
 * @return  A NumericDisplay object - can be discarded
 * @type    {webbrick.widgets.NumericDisplay}
 */
// TODO: parameterize widget constructor with model object, 
//       create here, and pass in to constructor?
webbrick.widgets.NumericDisplay_Init = function (element) {
    MochiKit.Logging.logDebug("NumericDisplay_Init: create renderer/collector");
    var renderer  = new webbrick.widgets.NumericDisplay.renderer(element);
    renderer.initialize();

    MochiKit.Logging.logDebug("NumericDisplay_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.NumericDisplay.initializeValues, element);

    MochiKit.Logging.logDebug("NumericDisplay: create widget");
    var display = new webbrick.widgets.NumericDisplay(modelvals, renderer, renderer);
    return display;
}

// Function sets text in a simple button
function NumericDisplay_SetValue(element, text) {
    webbrick.widgets.setElementText(element, text);
}

// ------------------------------
// Widget main class (controller)
// ------------------------------

/**
 * @class
 * Class for a numeric display.
 * This class implements the controller functions for the widget.
 *
 * @constructor
 * @param {Object}      modelvals   object that supplies values to initialize model
 * @param {Object}      renderer    object used to render button
 * @param {Object}      collecter   object used to collect and deliver input events
 */
webbrick.widgets.NumericDisplay = function (modelvals, renderer, collector) {
   
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
     * Model for this NumericDisplay widget
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
    this._subscribes = [
        ["SetDisplayValueEvent", null, "SetValueEventHandler"],
        ["SetDisplayStateEvent", null, "SetStateEventHandler"]
    ];    

    // ---- Initialize ----

    // Create the model
    MochiKit.Logging.logDebug("NumericDisplay: create model: "+webbrick.widgets.NumericDisplay.modelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.NumericDisplay.modelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("NumericDisplay: populate model");
    this._model.swap(modelvals);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("NumericDisplay: connect model listeners");
    this._renderer.connectModel(this._model);

    // Connect controller input listeners to input collector
    MochiKit.Logging.logDebug("NumericDisplay: connect input collector listeners");
    MochiKit.Signal.connect(this._collector, 'Clicked', this, this.Clicked);

    // Connect controller to external control events
    webbrick.widgets.SubscribeWidgetEvents(this, this._model, this._subscribes);

    MochiKit.Logging.logDebug("NumericDisplay: initialized");
};

// ------------------------------
// Input collector event handlers
// ------------------------------

// Function called when button is clicked - down, up, clicked
//
// event is a MochiKit.Signal.event object
//
webbrick.widgets.NumericDisplay.prototype.Clicked = function (inputtype) {
    MochiKit.Logging.logDebug("NumericDisplay.Clicked: "+inputtype);
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    var Event  = makeEvent(this._model.get("DisplayClickEvent"), 
                           this._model.get("DisplayClickSource"), 
                           inputtype);
    var Source = makeEventAgent(this._model.get("DisplayClickSource"));
    MochiKit.Logging.logDebug("NumericDisplay.Clicked: Source: "+Source+", Event: "+Event);
    WidgetEventRouter.publish(Source, Event);
};

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

// Set text incoming event handler for simple button
webbrick.widgets.NumericDisplay.prototype.SetValueEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("NumericDisplay.SetValueEventHandler: "+event.getPayload());
    this._model.set("VALUE", event.getPayload());
};

// Set state incoming event handler for simple button
webbrick.widgets.NumericDisplay.prototype.SetStateEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("NumericDisplay.SetStateEventHandler: "+event.getPayload());
    try {
        this._model.set("STATE", event.getPayload());
    } catch(e) {
        if (e.name == "InvalidPropertyValuePairError") {
            this._model.set("STATE", "unknown");
        };
        throw e;
    };
}

// --------------------------------------------
// Element attributes used to initialize widget
// --------------------------------------------

/**
 * Table for mapping model state to display DOM class values
 */
webbrick.widgets.NumericDisplay.StateClass = {
        up:         'numericdisplay_normal',
        down:       'numericdisplay_depressed',
        waiting:    'numericdisplay_pending',
        unknown:    'numericdisplay_unknown'
    };

webbrick.widgets.NumericDisplay.initializeValues = {
    STATE:                  
        [webbrick.widgets.getMappedClass, webbrick.widgets.NumericDisplay.StateClass],
    VALUE:                  
        [webbrick.widgets.getWidgetContent],
    SetDisplayValueEvent:
        [webbrick.widgets.getWidgetAttribute, "SetNumericDisplayValueEvent"],
    SetDisplayStateEvent:
        [webbrick.widgets.getWidgetAttribute, "SetNumericDisplayStateEvent"],
    DisplayClickEvent:
        [webbrick.widgets.getWidgetAttribute, "DisplayClickEvent"],
    DisplayClickSource:
        [webbrick.widgets.getWidgetAttribute, "DisplayClickEvent"]
};

// ----------------
// Model definition
// ----------------

/**
 *  Definition of NumericDisplay model, with dynamic values determined by widget
 *  behaviour, and static values initialized with parameters provided when the
 *  widget is created.
 */
webbrick.widgets.NumericDisplay.modelDefinition = {
    propertyNames : [ 
        // Dynamic values:
        "STATE",                    // state of button
        "VALUE",                    // text value displayed in button
        // Static parameters:
        "SetDisplayValueEvent",     // event type URI for setting display value
        "SetDisplayStateEvent",     // event type URI for setting display state
    ],
    controlledValues : {
        "STATE" : [ "unknown", "up", "down", "waiting"]
    },
    defaultValues : {
        STATE:                  "unknown",
        VALUE:                  "(unknown)",
        SetDisplayValueEvent:   "_NumericDisplay.SetDisplayValueEvent",
        SetDisplayStateEvent:   "_NumericDisplay.SetDisplayStateEvent"
    }
};

// -------------------
// Renderer definition
// -------------------

/**
 *  Definitions for the NumericDisplay DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 */
webbrick.widgets.NumericDisplay.rendererDefinition = {
    // Define functions used by other parts of definition
    renderFunctions: {
        SetValueModelListener:  
            ['setElementText', null],
        SetStateModelListener: 
            ['setClassMapped', webbrick.widgets.NumericDisplay.StateClass]
        },
    // Define model listener connections
    renderModel: {
        VALUE: 'SetValueModelListener',
        STATE: 'SetStateModelListener'
    },
    // Define DOM input event connections
    collectDomInputs: {
    }
};

/**
 * @class
 *  NumericDisplay renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the button.
 */
webbrick.widgets.NumericDisplay.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.NumericDisplay.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.NumericDisplay.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.NumericDisplay.rendererDefinition, this._element);
};

// End.
