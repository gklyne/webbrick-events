/**
 * @fileoverview
 * Module providing logic for simple button to generate and respond to events.
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

/**
 * Function to create and return a new SimpleButton object.
 *
 * @param   {HTMLElement}   elem    HTML element that constitutes the button.
 * @return  A simpleButton object - can be discarded
 * @type    {webbrick.widgets.SimpleButton}
 *
 * Widget attributes:
 *   SetButtonTextEvent     event type URI for setting button text
 *   SetButtonStateEvent    event type URI for setting button state
 *   ButtonClickEvent       event type URI published when button is clicked
 *   ButtonClickSource      event source URI published when button is clicked
 */
// TODO: use namespace for this function? - affects calling pages
// TODO: parameterize widget constructor with model object, and create here?
SimpleButton_Init = function (elem) {
    MochiKit.Logging.logDebug("SimpleButton_Init: create renderer/collector");
    var renderer  = new webbrick.widgets.SimpleButton.renderer(elem);
    renderer.initialize();

    MochiKit.Logging.logDebug("SimpleButton_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.SimpleButton.initializeValues, elem);

    MochiKit.Logging.logDebug("SimpleButton: create widget");
    var button    = new webbrick.widgets.SimpleButton(modelvals, renderer, renderer);
    return button;
};

// ------------------------------
// Widget main class (controller)
// ------------------------------

/**
 * @class
 * Class for a simple button.
 * This class implements the controller functions for the widget.
 *
 * @constructor
 * @param {Object}      modelvals   object that supplies values to initialize model
 * @param {Object}      renderer    object used to render button
 * @param {Object}      collecter   object used to collect and deliver input events
 */
webbrick.widgets.SimpleButton = function (modelvals, renderer, collector) {
   
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
     * Model for this SimpleButton widget
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
        ["SetButtonTextEvent",  null, "SetTextEventHandler"],
        ["SetButtonStateEvent", null, "SetStateEventHandler"]
    ];    

    // ---- Initialize ----

    // Create the model
    MochiKit.Logging.logDebug("SimpleButton: create model: "+webbrick.widgets.SimpleButton.modelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.SimpleButton.modelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("SimpleButton: populate model");
    this._model.swap(modelvals);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("SimpleButton: connect model listeners");
    this._renderer.connectModel(this._model);

    // Connect controller input listeners to input collector
    MochiKit.Logging.logDebug("SimpleButton: connect input collector listeners");
    MochiKit.Signal.connect(this._collector, 'Clicked', this, this.Clicked);

    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();

    // Subscribe handlers for incoming controller events
    MochiKit.Logging.logDebug("SimpleButton: subscribe controller events");
    for (var i = 0 ; i<this._subscribes.length ; i++) {
        var evtyp = this._model.get(this._subscribes[i][0]);
        var evsrc = this._model.getDefault(this._subscribes[i][1], null);
        // makeEventHandler(handlerUri,handlerFunc,initFunc,endFunc)
        var handler = makeEventHandler(
            evtyp+"_handler", MochiKit.Base.bind(this._subscribes[i][2],this), null, null);
        MochiKit.Logging.logDebug("SimpleButton: subscribe: evtyp: "+evtyp+", evsrc: "+evsrc);
        WidgetEventRouter.subscribe(32000, handler, evtyp, evsrc);
    }

    MochiKit.Logging.logDebug("SimpleButton: initialized");
};

// ------------------------------
// Input collector event handlers
// ------------------------------

// Function called when button is clicked - down, up, clicked
//
// event is a MochiKit.Signal.event object
//
webbrick.widgets.SimpleButton.prototype.Clicked = function (inputtype) {
    MochiKit.Logging.logDebug("SimpleButton.Clicked: "+inputtype);
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    var Event  = makeEvent(this._model.get("ButtonClickEvent"), 
                           this._model.get("ButtonClickSource"), 
                           inputtype);
    var Source = makeEventAgent(this._model.get("ButtonClickSource"));
    MochiKit.Logging.logDebug("SimpleButton.Clicked: Source: "+Source+", Event: "+Event);
    WidgetEventRouter.publish(Source, Event);
};

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

// Set text incoming event handler for simple button
webbrick.widgets.SimpleButton.prototype.SetTextEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("SimpleButton.SetTextEventHandler: "+event.getPayload());
    this._model.set("VALUE", event.getPayload());
};

// Set state incoming event handler for simple button
webbrick.widgets.SimpleButton.prototype.SetStateEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("SimpleButton.SetStateEventHandler: "+event.getPayload());
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
 * Table for mapping model state to button DOM class values
 */
webbrick.widgets.SimpleButton.StateClass = {
        up:         'button_normal',
        down:       'button_depressed',
        waiting:    'button_pending',
        unknown:    'button_unknown'
    };

webbrick.widgets.SimpleButton.initializeValues = {
    STATE:                  
        [webbrick.widgets.getMappedClass, webbrick.widgets.SimpleButton.StateClass],
    VALUE:                  
        [webbrick.widgets.getWidgetAttribute, "value"],
    SetButtonTextEvent:
        [webbrick.widgets.getWidgetAttribute, "SetButtonTextEvent"],
    SetButtonStateEvent:
        [webbrick.widgets.getWidgetAttribute, "SetButtonStateEvent"],
    ButtonClickEvent:
        [webbrick.widgets.getWidgetAttribute, "ButtonClickEvent"],
    ButtonClickSource:
        [webbrick.widgets.getWidgetAttribute, "ButtonClickSource"]
};

// ----------------
// Model definition
// ----------------

/**
 *  Definition of SimpleButton model, with dynamic values determined by widget
 *  behaviour, and static values initialized with parameters provided when the
 *  widget is created.
 */
webbrick.widgets.SimpleButton.modelDefinition = {
    propertyNames : [ 
        // Dynamic values:
        "STATE",                    // state of button
        "VALUE",                    // text value displayed in button
        // Static parameters:
        "SetButtonTextEvent",       // event type URI for setting button text
        "SetButtonStateEvent",      // event type URI for setting button state
        "ButtonClickEvent",         // event type URI published when button is clicked
        "ButtonClickSource"         // event source URI published when button is clicked
    ],
    controlledValues : {
        "STATE" : [ "unknown", "up", "down", "waiting"]
    },
    defaultValues : {
        STATE:                  "unknown",
        VALUE:                  "(unknown)",
        SetButtonTextEvent:     "_SimpleButton.SetButtonTextEvent",
        SetButtonStateEvent:    "_SimpleButton.SetButtonStateEvent",
        ButtonClickEvent:       "_SimpleButton.ButtonClickEvent",
        ButtonClickSource:      "_SimpleButton.ButtonClickSource"
    }
};

// -------------------
// Renderer definition
// -------------------

/**
 *  Table to map DOM event types to signal parameter values for Input collector
 */
webbrick.widgets.SimpleButton.EventTypeMap = {
    click:      'click',
    mousedown:  'down',
    keydown:    'down',
    mouseup:    'up',
    keyup:      'up'
};

/**
 *  Definitions for the SimpleButton DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 *
 *  The collector class generates the following input events via MochiKit.Signal:
 *  Clicked, with parameter 'click', 'down', or 'up' to indicate the type of input event.
 */
webbrick.widgets.SimpleButton.rendererDefinition = {
    // Define functions used by other parts of definition
    renderFunctions: {
        SetTextModelListener:  
            ['setAttributeValue', 'value'],
        SetStateModelListener: 
            ['setClassMapped', webbrick.widgets.SimpleButton.StateClass],
        ButtonClicked: 
            ['domEventClicked', 'Clicked', webbrick.widgets.SimpleButton.EventTypeMap]
        },
    // Define model listener connections
    renderModel: {
        VALUE: 'SetTextModelListener',
        STATE: 'SetStateModelListener'
    },
    // Define DOM input event connections
    collectDomInputs: {
        onclick:        'ButtonClicked',
        onmousedown:    'ButtonClicked',
        onmouseup:      'ButtonClicked',
        onkeydown:      'ButtonClicked',
        onkeyup:        'ButtonClicked'
    }
};

/**
 * @class
 *  SimpleButton renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the button.
 */
webbrick.widgets.SimpleButton.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.SimpleButton.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.SimpleButton.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.SimpleButton.rendererDefinition, this._element);
};

// End.
