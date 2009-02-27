/**
 * @fileoverview
 * Module providing logic for TempSetPoint widget to generate and respond to events.
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
 * Function to create and return a new TempSetPoint object.
 *
 * Widget element attributes:
 *  [[[see initializeValues below]]]
 *
 * @param   {HTMLElement}   element     HTML element that constitutes the widget.
 * @return  A WIDGETSAMPLE widget object - can be discarded
 * @type    {webbrick.widgets.TempSetPoint}
 */
webbrick.widgets.TempSetPoint_Init = function (element) {
    MochiKit.Logging.logDebug("TempSetPoint_Init: create renderer/collector");
    var renderer  = new webbrick.widgets.TempSetPoint.renderer(element);
    renderer.initialize();

    MochiKit.Logging.logDebug("TempSetPoint_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.TempSetPoint.initializeValues, element);

    MochiKit.Logging.logDebug("TempSetPoint: create widget");
    var widget = new webbrick.widgets.TempSetPoint(modelvals, renderer, renderer);
    return widget;
};

// ------------------------------
// Widget main class (controller)
// ------------------------------

/**
 * @class
 * Class for a TempSetPoint widget, implementing the controller functions for the widget.
 *
 * @constructor
 * @param {Object}      modelvals   object that supplies values to initialize the model
 * @param {Object}      renderer    object used to render the widget
 * @param {Object}      collecter   object used to collect and deliver input events
 */
webbrick.widgets.TempSetPoint = function (modelvals, renderer, collector) {
   
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
     * Model for this TempSetPoint widget
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
        ["SetCurrentValueEvent", null, "SetCurrentValueEventHandler"],
        ["SetTargetValueEvent",  null, "SetTargetValueEventHandler"],
        ["SetTargetModeEvent",   null, "SetTargetModeEventHandler"],
        ////["ClockTickEvent",  null, "ClockTickEventHandler"],
        ////["SetYYYEvent",  null, "SetYYYEventHandler"],
    ];    

    // ---- Initialize ----

    // Create the model
    MochiKit.Logging.logDebug(
        "TempSetPoint: create model: "+webbrick.widgets.TempSetPoint.modelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.TempSetPoint.modelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("TempSetPoint: populate model");
    this._model.swap(modelvals);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("TempSetPoint: connect model listeners");
    this._renderer.connectModel(this._model);

    ////////////////////
    // TODO: delete or enable this as appropriate
    // Connect controller input listeners to input collector
    ////MochiKit.Logging.logDebug("TempSetPoint: connect input collector listeners");
    ////MochiKit.Signal.connect(this._collector, 'Clicked', this, this.Clicked);
    ////////////////////

    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();

    // TODO: Refactor this to common support code, with checks to catch non-existing methods 
    // Subscribe handlers for incoming controller events
    MochiKit.Logging.logDebug("TempSetPoint: subscribe controller events");
    for (var i = 0 ; i<this._subscribes.length ; i++) {
        var evtyp = this._model.get(this._subscribes[i][0]);
        var evsrc = this._model.getDefault(this._subscribes[i][1], null);
        // makeEventHandler  arguments are (handlerUri,handlerFunc,initFunc,endFunc)
        var handler = makeEventHandler(
            evtyp+"_handler", MochiKit.Base.bind(this._subscribes[i][2],this), null, null);
        MochiKit.Logging.logDebug("TempSetPoint: subscribe: evtyp: "+evtyp+", evsrc: "+evsrc);
        WidgetEventRouter.subscribe(32000, handler, evtyp, evsrc);
    };

    MochiKit.Logging.logDebug("TempSetPoint: initialized");
};

// ------------------
// Controller methods
// ------------------

webbrick.widgets.TempSetPoint.prototype.convertFloatToString = function(val, state) {
    MochiKit.Logging.log("TempSetPoint.convertValue: "+val);
    if (typeof val == "number") {
        val = val.toFixed(1);
    }
    if (val.match(/^\s*\d+(.\d+)?\s*$/) == null) {
        state = "unknown";
    }
    return {value:val, state:state};
};

webbrick.widgets.TempSetPoint.prototype.convertStringToInt = function(val, state) {
    MochiKit.Logging.log("TempSetPoint.convertValue: "+val);
    if (typeof val == "string") {
        if (val.match(/^\s*\d+\s*$/) != null) {
            val = parseInt(val, 10);
        };
    };
    if (typeof val != "integer") {
            state = "unknown";
    };
    return {value:val, state:state};
};

webbrick.widgets.TempSetPoint.prototype.updateDisplay = function(mode, val, state) {
    // Mode corresponds to a value that has changed
    MochiKit.Logging.log("TempSetPoint.updateDisplay: "+val);
    if (this._model.get("MODE") == mode) {
        this._model.set("DISPLAY",      val);
        this._model.set("DISPLAYSTATE", state);        
    }
};

webbrick.widgets.TempSetPoint.prototype.setCurrentValue = function (val) {
    MochiKit.Logging.log("TempSetPoint.setCurrentValue: "+val);
    var vs = this.convertFloatToString(val, "current");
    this._model.set("CURRENT",      vs.value);
    this._model.set("CURRENTSTATE", vs.state);
    this.updateDisplay("current", vs.value, vs.state);
};

webbrick.widgets.TempSetPoint.prototype.setTargetValue = function (val) {
    MochiKit.Logging.log("TempSetPoint.setTargetValue: "+val);
    var vs = this.convertFloatToString(val, "target");
    this._model.set("TARGET",      vs.value);
    this._model.set("TARGETSTATE", vs.state);
    this.updateDisplay("target", vs.value, vs.state);
};

webbrick.widgets.TempSetPoint.prototype.setMode = function (val) {
    MochiKit.Logging.log("TempSetPoint.setMode: "+val);
    this._model.set("MODE", val);
    var valmap = {
        current: {valuename:"CURRENT", statename:"CURRENTSTATE"},
        target:  {valuename:"TARGET",  statename:"TARGETSTATE"}
        }
    this.updateDisplay(val, 
        this._model.get(valmap[val].valuename), 
        this._model.get(valmap[val].statename)
        );
};

webbrick.widgets.TempSetPoint.prototype.setModeTimer = function (val) {
    MochiKit.Logging.log("TempSetPoint.setModeTimer: "+val);
    this._model.set("MODETIMER", val);
    var vs = this.convertStringToInt(val, "timer");
    if (vs.value > 0 ) {
        this.setMode("target");
    } else {
        this.setMode("current");
    };
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
webbrick.widgets.TempSetPoint.prototype.Clicked = function (inputtype) {
    MochiKit.Logging.logDebug("TempSetPoint.Clicked: "+inputtype);
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    var Event  = makeEvent(this._model.get("YYYClickEvent"), 
                           this._model.get("YYYClickSource"), 
                           inputtype);
    var Source = makeEventAgent(this._model.get("YYYClickSource"));
    MochiKit.Logging.logDebug("TempSetPoint.Clicked: Source: "+Source+", Event: "+Event);
    WidgetEventRouter.publish(Source, Event);
};

// ----------------------------------
// Incoming controller event handlers
// ----------------------------------

/**
 *  Incoming event handler for setting the current value
 */
webbrick.widgets.TempSetPoint.prototype.SetCurrentValueEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("TempSetPoint.SetCurrentValueEventHandler: "+event.getPayload());
    this.setCurrentValue(event.getPayload());
};

/**
 *  Incoming event handler for setting the target value
 */
webbrick.widgets.TempSetPoint.prototype.SetTargetValueEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("TempSetPoint.SetTargetValueEventHandler: "+event.getPayload());
    this.setTargetValue(event.getPayload());
};

/**
 *  Incoming event handler for setting the target mode timer
 */
webbrick.widgets.TempSetPoint.prototype.SetTargetModeEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("TempSetPoint.SetTargetModeEventHandler: "+event.getPayload());
    this.setModeTimer(event.getPayload());
};

// ----------------
// Model definition
// ----------------

/**
 *  Definition of TempSetPoint model, with dynamic values determined by widget
 *  behaviour and interactions, and static values initialized with parameters
 *  provided when the widget is created.
 */
webbrick.widgets.TempSetPoint.modelDefinition = {
    propertyNames : [ 
        // Dynamic values:
        "DISPLAY",                  // display temperature value
        "DISPLAYSTATE",             // state of displayed temperature value
        "CURRENT",                  // current temperature value
        "CURRENTSTATE",             // state of current temperature value
        "TARGET",                   // target temperature value
        "TARGETSTATE",              // target temperature value
        "MODETIMER",                // seconds to display target value, or zero 
        "MODE",                     // display mode: current or target 
        // Static parameters:
        "SetCurrentValueEvent",     // event type URI for setting current value
        "SetTargetValueEvent",      // event type URI for setting target value
        "SetTargetModeEvent",       // event type URI for setting widget mode
        "TargetChangeEvent",        // event type URI published when target is changed
        "TargetChangeSource",       // event source URI published when target is changed
        "ClockTickEvent"            // event type URI for clock tick
    ],
    controlledValues : {
        "DISPLAYSTATE" : [ "current", "target",  "unknown" ],
        "CURRENTSTATE" : [ "current", "unknown" ],
        "TARGETSTATE"  : [ "target",  "unknown" ],
        "MODE"         : [ "current", "target" ]
    },
    defaultValues : {
        DISPLAY:                "(unknown)",
        DISPLAYSTATE:           "unknown",
        CURRENT:                "(unknown)",
        CURRENTSTATE:           "unknown",
        TARGET:                 "(unknown)",
        TARGETSTATE:            "unknown",
        MODE:                   "current",
        MODETIMER:              0,
        SetCurrentValueEvent:   "_TempSetPoint.SetCurrentValueEvent",
        SetTargetValueEvent:    "_TempSetPoint.SetTargetValueEvent",
        SetTargetModeEvent:     "_TempSetPoint.SetTargetModeEvent",
        TargetChangeEvent:      "_TempSetPoint.TargetChangeEvent",
        TargetChangeSource:     "_TempSetPoint.TargetChangeSource",
        ClockTickEvent:         "_TempSetPoint.ClockTickEvent_OverrideMe"
    }
};

// -------------------------
// Model initialization data
// -------------------------

/**
 * Table for mapping model STATE value to CSS class.
 *
 * See also modelDefinition.controlledValues above.
 *
 * As well as for initialization, this is used by the DOM renderer below.
 */
webbrick.widgets.TempSetPoint.StateClass = {
        current:    'tempsetpoint-current',
        target:     'tempsetpoint-target',
        unknown:    'tempsetpoint-unknown'
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
webbrick.widgets.TempSetPoint.initializeValues = {
    DISPLAY:                  
        [ webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    DISPLAYSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    CURRENT:                  
        [webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    CURRENTSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    TARGET:                  
        [webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    TARGETSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
    SetCurrentValueEvent:
        [webbrick.widgets.getWidgetAttribute, "SetCurrentValueEvent"],
    SetTargetValueEvent:
        [webbrick.widgets.getWidgetAttribute, "SetTargetValueEvent"],
    SetModeEvent:
        [webbrick.widgets.getWidgetAttribute, "SetModeEvent"],
    ClickEvent:
        [webbrick.widgets.getWidgetAttribute, "ClickEvent"],
    ClickSource:
        [webbrick.widgets.getWidgetAttribute, "ClickSource"]
};

// --------------------------------------------
// Renderer and user input collector definition
// --------------------------------------------

/**
 *  Table to map DOM event types to signal parameter values for Input collector
 */
webbrick.widgets.TempSetPoint.ClickTypeMap = {
    click:      'click',
    mousedown:  'down',
    keydown:    'down',
    mouseup:    'up',
    keyup:      'up'
};

/**
 *  Definitions for the TempSetPoint DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 *
 *  The collector class generates the following input events via MochiKit.Signal:
 *    'Clicked', with parameter 'click', 'down', or 'up' to indicate the type of input event.
 */
webbrick.widgets.TempSetPoint.rendererDefinition = {
    // Define functions used by other parts of the renderer definition
    renderFunctions: {
        SetDisplayModelListener:  
            [ 'setWidgetPathText', 
              ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
        SetDisplayStateModelListener: 
            [ 'setWidgetPathClass', webbrick.widgets.TempSetPoint.StateClass, 
              ["SetPointBody", "SetPointDisplay", "SetPointValue", "span"] ],
        SetModeModelListener:  
            [ 'setWidgetPathTextClass', webbrick.widgets.TempSetPoint.StateClass, 
              ["SetPointBody", "SetPointDisplay", "SetPointState", "span"] ]
        //WidgetClicked: 
        //    ['domEventClicked', 'Clicked', webbrick.widgets.TempSetPoint.ClickTypeMap]
        },
    // Define model listener connections
    renderModel: {
        DISPLAY:        'SetDisplayModelListener',
        DISPLAYSTATE:   'SetDisplayStateModelListener',
        MODE:           'SetModeModelListener'
    },
    // Define DOM input event connections
    collectDomInputs: {
        //onclick:        'WidgetClicked',
        //onmousedown:    'WidgetClicked',
        //onmouseup:      'WidgetClicked',
        //onkeydown:      'WidgetClicked',
        //onkeyup:        'WidgetClicked'
    }
};

/**
 * @class
 *  TempSetPoint renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the widget.
 */
webbrick.widgets.TempSetPoint.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.TempSetPoint.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.TempSetPoint.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.TempSetPoint.rendererDefinition, this._element);
};

// End.
