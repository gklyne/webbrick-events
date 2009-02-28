/**
 * @fileoverview
 * Module providing logic for temperature set point widget to generate and respond to events.
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

    // If defined, set default target value from attribute
    // TODO: is there a better way to handle this as part of the initialize-from-DOM logic?
    var deftgt = webbrick.widgets.getWidgetValue(element, "@DefaultTarget");
    if (deftgt != null && deftgt != "") {
        widget.setTargetValue(deftgt);
    }
    
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
        ["ClockTickEvent",       null, "ClockTickEventHandler"],
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

    // Add clock tick event value to model
    var clockevent = webbrick.widgets.startClock();
    MochiKit.Logging.logDebug("TempSetPoint: clockevent: "+clockevent[0]);
    this._model.set("ClockTickEvent", clockevent[0]);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("TempSetPoint: connect model listeners");
    this._renderer.connectModel(this._model);

    // Connect controller input listeners to input collector
    // (DOM events are mapped to MochiKit signals by the input collector)
    MochiKit.Logging.logDebug("TempSetPoint: connect input collector listeners");
    MochiKit.Signal.connect(this._collector, 'BumpTarget', this, this.bumpTarget);

    webbrick.widgets.SubscribeWidgetEvents(this, this._model, this._subscribes);

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

/**
 *  Function called when widget buttons are clicked to increase or deacrease 
 *  the target value.
 *
 * @param {Float}      delta    a posotove opr negative amount by which the 
 *                              target value is to be changed.
 */
webbrick.widgets.TempSetPoint.prototype.bumpTarget = function (delta) {
    MochiKit.Logging.logDebug("TempSetPoint.bumpTarget: "+delta);

    // If current displayed, switch to target
    if (this._model.get("MODE") == "current") {
        this.setModeTimer(5);
        return;
    };

    // If target is defined, bump value
    if (this._model.get("TARGETSTATE") == "target") {
        var target = parseFloat(this._model.get("TARGET"));
        if (isFinite(target)) {
            target += delta;
            this.setTargetValue(target);
            webbrick.widgets.publishEvent(
                this._model.get("TargetChangeSource"),
                this._model.get("TargetChangeEvent"),
                target);
        };
    };
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

/**
 *  Incoming event handler for clock ticks
 */
webbrick.widgets.TempSetPoint.prototype.ClockTickEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("TempSetPoint.ClockTickEventHandler: ");
    var timer = this._model.get("MODETIMER");
    if (timer > 0) {
        this.setModeTimer(timer-1);
    };
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
        [ webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
    DISPLAYSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
    CURRENT:                  
        [webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
    CURRENTSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
    TARGET:                  
        [webbrick.widgets.getWidgetPathContent, ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
    TARGETSTATE:                  
        [ webbrick.widgets.getWidgetPathClass, webbrick.widgets.TempSetPoint.StateClass, 
          ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
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
 *  Table to map button values to signal parameter values for the Input collector
 */
webbrick.widgets.TempSetPoint.ButtonValueMap = {
    Up:     +0.5,
    Down:   -0.5
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
              ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
        SetDisplayStateModelListener: 
            [ 'setWidgetPathClass', webbrick.widgets.TempSetPoint.StateClass, 
              ["SetPointBody", "SetPointDisplay", "SetPointValue"] ],
        SetModeModelListener:  
            [ 'setWidgetPathTextClass', webbrick.widgets.TempSetPoint.StateClass, 
              ["SetPointBody", "SetPointDisplay", "SetPointState"] ],
        ButtonClicked: 
            ['domButtonClicked', 'BumpTarget', webbrick.widgets.TempSetPoint.ButtonValueMap]
        },
    // Define model listener connections
    renderModel: {
        DISPLAY:        'SetDisplayModelListener',
        DISPLAYSTATE:   'SetDisplayStateModelListener',
        MODE:           'SetModeModelListener'
    },
    // Define DOM input event connections
    // These map DOM events to renderer handler methods (cf. GenericDomRenderer),
    // which may direct methods or indirectly defined via renderFundtions (above).
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

/**
 *  Button-click handler: need to determine which button was clicked
 *
 *  The input is propagated as a MochiKit non-DOM signal.
 *
 * @param   {String} signalname Name of signal to raise when event click occurs
 * @param   {Object} valuemap   Maps button values to parameters that
 *                              are provided with the propagated signal.
 *                              No signal is generated for button values that
 *                              do not appear in this table.
 * @param   {Object} event      MochiKit custom event object corresponding to the
 *                              incoming DOM event.
 *
 *  This function should be partially applied to name of signal to generate, an 
 *  event type mapping table and a button mapping table to yield a usable DOM event 
 *  handler function.
 */
webbrick.widgets.TempSetPoint.renderer.prototype.domButtonClicked = function 
        (signalname, valuemap, event) {
    MochiKit.Logging.logDebug("TempSetPoint.collector.domButtonClicked");

    var eventtype = event.type();
    MochiKit.Logging.logDebug("eventtype: "+eventtype);
    if (eventtype == 'click') {
        var elem = event.target();
        var name = elem.nodeName;
        MochiKit.Logging.logDebug("node name: "+name);
        if (elem.nodeName.toLowerCase() == "button") {
            var value = MochiKit.DOM.getNodeAttribute(elem, 'value');
            MochiKit.Logging.logDebug("button value: "+value);
            var sigparam = valuemap[value];
            MochiKit.Logging.logDebug("signal parameter: "+sigparam);
            if (sigparam != null) {
                MochiKit.Signal.signal(this, signalname, sigparam);
                event.stop();
            };
        }
    };

    // Allow event to propagate...
};

// End.
