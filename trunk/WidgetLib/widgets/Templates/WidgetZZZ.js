/**
 * @fileoverview
 * Module providing logic for WIDGETZZZ widget to generate and respond to events.
 *
 * @version $Id: $
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
 *  Definition of WIDGETZZZ model, with dynamic values determined by widget
 *  behaviour and interactions, and static values initialized with parameters
 *  provided when the widget is created.
 */
webbrick.widgets.WIDGETZZZ_ModelDefinition = {
    ////////////////////
    // TODO: Adjust as appropriate
    ////////////////////
    propertyNames : [ 
        // Dynamic values:
        "STATE",                    // state of widget
        "VALUE",                    // value displayed in widget
        // Static parameters:
        "SetValueEvent",            // event type URI for setting widget value
        "SetStateEvent",            // event type URI for setting widget state
        "ClickEvent",               // event type URI published when widget is clicked
        "ClickSource",              // event source URI published when widget is clicked
        "ClockTickEvent"            // event type URI for clock tick
    ],
    ////////////////////
    // TODO: Adjust as appropriate
    ////////////////////
    controlledValues : {
        "STATE" : [ "unknown", "normal", "pending" ]
    },
    ////////////////////
    // TODO: Adjust as appropriate
    ////////////////////
    defaultValues : {
        STATE:                  "unknown",
        VALUE:                  "(unknown)",
        SetValueEvent:          "_WIDGETZZZ.SetValueEvent",
        SetStateEvent:          "_WIDGETZZZ.SetStateEvent",
        ClickEvent:             "_WIDGETZZZ.ClickEvent",
        ClickSource:            "_WIDGETZZZ.ClickSource",
        ClockTickEvent:         "_WIDGETZZZ.ClockTickEvent_OverrideMe"
    }
};

// -------------------------
// Model initialization data
// -------------------------

////////////////////
// TODO: Adjust as appropriate
////////////////////

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
webbrick.widgets.WIDGETZZZ_InitializeValues = {
    STATE:                  
        [webbrick.widgets.getMappedClass, webbrick.widgets.WIDGETZZZ_StateClass],
    VALUE:                  
        ////////////////////
        // TODO: Adjust as appropriate
        //[webbrick.widgets.getWidgetAttribute, "value"],     // From TG widget
        [webbrick.widgets.getWidgetContent],
        ////////////////////
    SetValueEvent:
        [webbrick.widgets.getWidgetAttribute, "SetValueEvent"],
    SetStateEvent:
        [webbrick.widgets.getWidgetAttribute, "SetStateEvent"],
    ClickEvent:
        [webbrick.widgets.getWidgetAttribute, "ClickEvent"],
    ClickSource:
        [webbrick.widgets.getWidgetAttribute, "ClickSource"]
};

/**
 * Table for mapping model STATE value to CSS class.
 *
 * See also modelDefinition.controlledValues above.
 *
 * As well as for initialization, this is used by the DOM renderer below.
 */
webbrick.widgets.WIDGETZZZ_StateClass = {
        normal:     'WIDGETZZZ_normal',
        pending:    'WIDGETZZZ_pending',
        unknown:    'WIDGETZZZ_unknown'
    };

// ---------------
// Incoming events
// ---------------

/**
 * @private
 * Table of event subscriptions for this widget.
 *
 * Each entry is a triple consisting of:
 *   the name of the model property that defines the event type URI
 *   the name of the model property that defines the event source URI, or null
 *   the name of the event handler method of the widget object to be subscribed.
 */
webbrick.widgets.WIDGETZZZ_EventSubscriptions = [
    ["SetValueEvent", null, "SetValueEventHandler"],
    ////["ClockTickEvent",  null, "ClockTickEventHandler"],
    ////["SetYYYEvent",  null, "SetYYYEventHandler"],
    ];

// ---------------------
// Widget initialization
// ---------------------

/**
 * Function to create and return a new WIDGETZZZ object.
 *
 * Widget element attributes:
 *  [[[see initializeValues below]]]
 *
 * @param   {HTMLElement}   element     HTML element that constitutes the widget.
 * @return  A WIDGETSAMPLE widget object - can be discarded
 * @type    {webbrick.widgets.WIDGETZZZ}
 */
webbrick.widgets.WIDGETZZZ_Init = function (element) {
    MochiKit.Logging.logDebug("WIDGETZZZ_Init: create renderer/collector");
    var renderer  = new webbrick.widgets.WIDGETZZZ.renderer(element);
    renderer.initialize();

    MochiKit.Logging.logDebug("WIDGETZZZ_Init: extract parameters from DOM");
    var modelvals = webbrick.widgets.getWidgetValues
        (webbrick.widgets.WIDGETZZZ_InitializeValues, element);

    MochiKit.Logging.logDebug("WIDGETZZZ: create widget");
    var widget = new webbrick.widgets.WIDGETZZZ(modelvals, renderer, renderer);

    ////////////////////
    // TODO: delete or adjust as needed:
    // If defined, access additional attributes to set default value(s)
    //var defYYYY = webbrick.widgets.getWidgetValue(element, "@DefaultYYYY");
    //if (defYYYY != null && defYYYY != "") {
    //    widget.setYYYYValue(defYYYY);
    //}
    ////////////////////

    ////////////////////
    // TODO: delete or adjust as needed:
    // Initialize display state
    //widget.setYYYY(...);
    ////////////////////
    
    return widget;
};

// ------------------------------
// Widget main class (controller)
// ------------------------------

/**
 * @class
 * Class for a WIDGETZZZ widget, implementing the controller functions for the widget.
 *
 * @constructor
 * @param {Object}      modelvals   object that supplies values to initialize the model
 * @param {Object}      renderer    object used to render the widget
 * @param {Object}      collecter   object used to collect and deliver input events
 */
webbrick.widgets.WIDGETZZZ = function (modelvals, renderer, collector) {
   
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
     * Model for this WIDGETZZZ widget
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
    this._subscribes = webbrick.widgets.WIDGETZZZ_EventSubscriptions;

    // ---- Initialize ----

    // Create the model
    MochiKit.Logging.logDebug(
        "WIDGETZZZ: create model: "+webbrick.widgets.WIDGETZZZ_ModelDefinition);
    this._model = new webbrick.widgets.GenericModel(
        webbrick.widgets.WIDGETZZZ_ModelDefinition);

    // Populate the model attributes
    MochiKit.Logging.logDebug("WIDGETZZZ: populate model");
    this._model.swap(modelvals);

    // Connect model change listeners to renderer methods
    MochiKit.Logging.logDebug("WIDGETZZZ: connect model listeners");
    this._renderer.connectModel(this._model);

    ////////////////////
    // TODO: delete or enable this as appropriate
    // Connect controller input listeners to input collector
    ////MochiKit.Logging.logDebug("WIDGETZZZ: connect input collector listeners");
    ////MochiKit.Signal.connect(this._collector, 'Clicked', this, this.Clicked);
    ////////////////////

    // Connect controller to external control events
    // (Subscribed event definitions reference the model)
    webbrick.widgets.SubscribeWidgetEvents(this, this._model, this._subscribes);

    MochiKit.Logging.logDebug("WIDGETZZZ: initialized");
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
webbrick.widgets.WIDGETZZZ.prototype.Clicked = function (inputtype) {
    MochiKit.Logging.logDebug("WIDGETZZZ.Clicked: "+inputtype);
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
 *  Incoming event handler for setting the current value
 */
webbrick.widgets.WIDGETZZZ.prototype.SetValueEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("WIDGETZZZ.SetValueEventHandler: "+event.getPayload());
    this._model.set("VALUE", event.getPayload());
};

/**
 *  Incoming event handler for setting the widget state.
 */
webbrick.widgets.WIDGETZZZ.prototype.SetStateEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("WIDGETZZZ.SetStateEventHandler: "+event.getPayload());
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
// Renderer and user input collector definition
// --------------------------------------------

/**
 *  Table to map DOM event types to signal parameter values for Input collector
 */
webbrick.widgets.WIDGETZZZ.ClickTypeMap = {
    click:      'click',
    mousedown:  'down',
    keydown:    'down',
    mouseup:    'up',
    keyup:      'up'
};

/**
 *  Definitions for the WIDGETZZZ DOM renderer and input collector
 *
 *  The renderer responds to model changes to 'VALUE' and 'STATE'.
 *
 *  The collector class generates the following input events via MochiKit.Signal:
 *    'Clicked', with parameter 'click', 'down', or 'up' to indicate the type of input event.
 */
webbrick.widgets.WIDGETZZZ.rendererDefinition = {
    // Define functions used by other parts of the renderer definition
    renderFunctions: {
        ////////////////////
        // TODO: Use one of the following, or adjust as needed
        SetValueModelListener:  
            ['setAttributeValue', 'value'],
        SetValueModelListener:  
            ['setElementText', null],
        ////////////////////
        SetStateModelListener: 
            ['setClassMapped', webbrick.widgets.WIDGETZZZ_StateClass],
        WidgetClicked: 
            ['domEventClicked', 'Clicked', webbrick.widgets.WIDGETZZZ.ClickTypeMap]
        },
    // Define model listener connections
    ////////////////////
    // TODO: Adjust as appropriate
    ////////////////////
    renderModel: {
        VALUE: 'SetValueModelListener',
        STATE: 'SetStateModelListener'
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
 *  WIDGETZZZ renderer and input collector, 
 *  based on webbrick.widgets.GenericDomRenderer
 *
 * @param {HTMLElement} element HTML element that constitutes the widget.
 */
webbrick.widgets.WIDGETZZZ.renderer = function(element) {
    /**
     * @private
     * @type HTMLElement
     * DOM element for rendering to
     */
    this._element = element;
};

webbrick.widgets.WIDGETZZZ.renderer.prototype = 
    new webbrick.widgets.GenericDomRenderer();

/**
 *  Initialize the renderer object by processing the renderer/collector definition.
 */
webbrick.widgets.WIDGETZZZ.renderer.prototype.initialize = function() {
    this.processDefinition(webbrick.widgets.WIDGETZZZ.rendererDefinition, this._element);
};

// End.
