/**
 * @fileoverview
 * Module providing logic for countdown display to respond to (and generate?) events.
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
 * Function to create and return a new CountdownDisplay object.
 *
 * Widget element attributes:
 *   SetCounterEvent        event type URI for setting numeric value to display
 *
 * @param   {HTMLElement}   element HTML element that contains the countdown display
 * @return  A CountdownDisplay object - can be discarded
 * @type    {webbrick.widgets.CountdownDisplay}
 */
// TODO: parameterize widget constructor with model object, 
//       create here, and pass in to constructor?
webbrick.widgets.CountdownDisplay_Init = function (element) {
    MochiKit.Logging.logDebug("CountdownDisplay_Init: create renderer/collector");
    var renderer  = new webbrick.widgets.CountdownDisplay.renderer(element);
    renderer.initialize();

    MochiKit.Logging.logDebug("CountdownDisplay_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.CountdownDisplay.initializeValues, element);
    
    MochiKit.Logging.logDebug("CountdownDisplay: create widget");
    var display = new webbrick.widgets.CountdownDisplay(modelvals, renderer, renderer);
    return display;
}

//------------------------------
//Widget main class (controller)
//------------------------------

/**
* @class
* Class for a countdown display.
* This class implements the controller functions for the widget.
*
* @constructor
* @param {Object}      modelvals   object that supplies values to initialize model
* @param {Object}      renderer    object used to render button
* @param {Object}      collecter   object used to collect and deliver input events
*/
webbrick.widgets.CountdownDisplay = function (modelvals, renderer, collector) {

    /**
     * @private
     * @type Object Widget renderer object.
     */
    this._renderer = renderer;
 
    /**
     * @private
     * @type Object Widget input collector object.
     */
    this._collector = collector;
     
    /**
     * @private
     * @type webbrick.widgets.GenericModel
     * Model for this CountdownDisplay widget
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
        ["SetCounterEvent", null, "SetCounterEventHandler" ],
        ["ClockTickEvent",  null, "ClockTickEventHandler"],
    ];

    // ---- Initialize ----
    
    // Create the model
    MochiKit.Logging.logDebug("CountdownDisplay: create model: "+webbrick.widgets.CountdownDisplay.modelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.CountdownDisplay.modelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("CountdownDisplay: populate model");
    this._model.swap(modelvals);

    // Add clock tick event value to model
    var clockevent = webbrick.widgets.startClock();
    MochiKit.Logging.logDebug("CountdownDisplay: clockevent: "+clockevent[0]);
    this._model.set("ClockTickEvent", clockevent[0]);
    
    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("CountdownDisplay: connect model listeners");
    this._renderer.connectModel(this._model);

    // Call SetCounter to convert numeric value and establish state for widget
    this.SetCounter(this._model.get("VALUE"));
    
    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    
    // Subscribe handlers for incoming controller events
    MochiKit.Logging.logDebug("CountdownDisplay: subscribe controller events");
    for (var i = 0 ; i<this._subscribes.length ; i++) {
        var evtyp = this._model.get(this._subscribes[i][0]);
        var evsrc = this._model.getDefault(this._subscribes[i][1], null);
        var evfun = this._subscribes[i][2];
        // makeEventHandler(handlerUri,handlerFunc,initFunc,endFunc)
        var handler = makeEventHandler(
            evtyp+"_handler", MochiKit.Base.bind(evfun,this), null, null);
        MochiKit.Logging.logDebug("CountdownDisplay: subscribe: evtyp: "+evtyp+", evsrc: "+evsrc);
        WidgetEventRouter.subscribe(32000, handler, evtyp, evsrc);
    }

    MochiKit.Logging.logDebug("CountdownDisplay: initialized");
};

// ------------------------------
// Input collector event handlers
// ------------------------------

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

/**
 *  Helper function to set counter and state
 */ 
webbrick.widgets.CountdownDisplay.prototype.SetCounter = function (value) {
    MochiKit.Logging.logDebug("CountdownDisplay.SetCounter: "+value);
    var state = "done";
    if (typeof(value) == "string") {
        var numregex = /\d+/
        if (numregex.test(value)) {
            value = parseInt(value, 10);
        }
    }
    this._model.set("VALUE", value);
    if (typeof(value) != "number") {
        state = "unknown";
    } 
    else if (value != 0) {
        state = "pending";
    };
    MochiKit.Logging.logDebug("CountdownDisplay.SetCounter: state: "+state);
    this._model.set("STATE", state);
}

/**
 *  Set value incoming event handler
 */ 
webbrick.widgets.CountdownDisplay.prototype.SetCounterEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("CountdownDisplay.SetCounterEventHandler: "+event);
    value = event.getPayload();
    this.SetCounter(value);
}

/**
 *  Clock tick incoming event handler
 */
webbrick.widgets.CountdownDisplay.prototype.ClockTickEventHandler = function (handler, event) {
    //MochiKit.Logging.logDebug("CountdownDisplay_ClockTickEventHandler");
    var count = this._model.get("VALUE");
    if ( (typeof(count) == "number") && (count > 0) ) {
        MochiKit.Logging.logDebug("CountdownDisplay_ClockTickEventHandler: count "+count);
        count -= 1;
    }
    this.SetCounter(count);
}

// --------------------------------------------
// Element attributes used to initialize widget
// --------------------------------------------

/**
 * Table for mapping model state to display DOM class values
 */
webbrick.widgets.CountdownDisplay.StateClass = {
        done:       'countdown_done',
        pending:    'countdown_pending',
        unknown:    'countdown_unknown'
    };

webbrick.widgets.CountdownDisplay.initializeValues = {
    STATE:                  
        [webbrick.widgets.getMappedClass, webbrick.widgets.CountdownDisplay.StateClass],
    VALUE:                  
        [webbrick.widgets.getWidgetContent],
    SetCounterEvent:
        [webbrick.widgets.getWidgetAttribute, "SetCounterEvent"],
};

// ----------------
// Model definition
// ----------------

/**
 *  Definition of CountdownDisplay model, with dynamic values determined by widget
 *  behaviour, and static values initialized with parameters provided when the
 *  widget is created.
 */
webbrick.widgets.CountdownDisplay.modelDefinition = {
    propertyNames : [ 
        // Dynamic values:
        "STATE",                    // state of button
        "VALUE",                    // text value displayed in button
        // Static parameters:
        "SetCounterEvent",          // event type URI for setting display value
        "ClockTickEvent",           // event type URI for clock tick
    ],
    controlledValues : {
        "STATE" : [ "unknown", "done", "pending"]
    },
    defaultValues : {
        STATE:             "unknown",
        VALUE:             "(unknown)",
        SetCounterEvent:   "_CountdownDisplay.SetCounterEvent",
        ClockTickEvent:    "_CountdownDisplay.OverrideMe"
    }
};

// -------------------
// Renderer definition
// -------------------

/**
 *  Definitions for the CountdownDisplay DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 */
webbrick.widgets.CountdownDisplay.rendererDefinition = {
    // Define functions used by other parts of definition
    renderFunctions: {
        SetValueModelListener:  
            ['setElementText', null],
        SetStateModelListener: 
            ['setClassMapped', webbrick.widgets.CountdownDisplay.StateClass],
        },
    // Define model listener connections
    renderModel: {
        VALUE: 'SetValueModelListener',
        STATE: 'SetStateModelListener'
    },
};

/**
 * @class
 *  CountdownDisplay renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the button.
 */
webbrick.widgets.CountdownDisplay.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.CountdownDisplay.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.CountdownDisplay.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.CountdownDisplay.rendererDefinition, this._element);
};

// End.
