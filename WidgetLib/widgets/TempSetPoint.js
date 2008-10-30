// $Id$
//
// Module providing logic for temperature set point widget to generate and respond to events.
//
// Outgoing events:
//   TempSetPoint_SetTargetValue - temperature set point
//
// Incoming events:
//   TempSetPoint_SetCurrentValue
//   TempSetPoint_SetTargetValue
//   TempSetPoint_ShowTarget(N) - show target for N seconds before 
//                                reverting to current value
//   

// -------------------------------------
// Temperate set point widget logic
// -------------------------------------

// Initialize simple button: set up event subscriptions
// Note that event URIs are obtained from the server via widget attributes
function TempSetPoint_Init(element) {

    // Internal values
    element.currentValue  = null ;  // unknown
    element.targetValue   = null ;  // unknown
    element.targetDisplay = 0;      // Seconds to show target
    element.agentUri      = makeEventAgentUri(EventUriSourceBase);

    // If defined, set default target value
    var deftgt = webbrick.widgets.getWidgetValue(element, "@DefaultTarget");
    if (deftgt != null && deftgt != "") {
        element.targetValue   = parseFloat(deftgt);
    }
    TempSetPoint_UpdateDisplay(element);

    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();

    // Set up handler for set value events
    webbrick.widgets.subscribeWidgetEventHandler
        (element, "@SetCurrentEvent", "@Subject", TempSetPoint_SetCurrentHandler);
    webbrick.widgets.subscribeWidgetEventHandler
        (element, "@SetTargetEvent",  "@Subject", TempSetPoint_SetTargetHandler);
    webbrick.widgets.subscribeWidgetEventHandler
        (element, "@ShowTargetEvent", "@Subject", TempSetPoint_ShowTargetHandler);

    // Set handlers for up, down buttons clicked, and connect to local timer...
    MochiKit.Signal.connect(
        webbrick.widgets.getSubElement(element,"SetPointUp"),   'onclick', 
        MochiKit.Base.partial(TempSetPoint_IncreaseTarget, element));
    MochiKit.Signal.connect(
        webbrick.widgets.getSubElement(element,"SetPointDown"), 'onclick',
        MochiKit.Base.partial(TempSetPoint_DecreaseTarget, element));
    var clockevent = webbrick.widgets.startClock();
    webbrick.widgets.subscribeWidgetEventHandler
        (element, clockevent[0], clockevent[1], TempSetPoint_ClockTickEventHandler);
}

// Function sets the current value, and updates the display
function TempSetPoint_SetCurrentValue(element, val) {
    logDebug("TempSetPoint_SetCurrentValue: val: "+val+", ",typeof val);
    element.currentValue = val;
    TempSetPoint_UpdateDisplay(element);
}

// Function sets the target value, and updates the display
function TempSetPoint_SetTargetValue(element,val) {
    element.targetValue = val;
    TempSetPoint_UpdateDisplay(element);
}

// Function switches display to target value for 5 seconds
function TempSetPoint_ShowTargetValue(element, val) {
    element.targetDisplay = val;      // Seconds to show target
    TempSetPoint_UpdateDisplay(element);
}

// Update the display to reflect current values:
function TempSetPoint_UpdateDisplay(element) {
    var displayvalue      = null;
    var displaystatetext  = "unknown";
    var displaystateclass = "tempsetpoint-unknown";
    if (element.targetDisplay == 0) {
        displayvalue      = element.currentValue;
        displaystatetext  = "current";
        displaystateclass = "tempsetpoint-current";
    }
    if (element.targetDisplay > 0) {
        displayvalue      = element.targetValue;
        displaystatetext  = "set point";
        displaystateclass = "tempsetpoint-target";
    }
    var displayvaluetext  = "??.?";
    var displayvalueclass = "tempsetpoint-unknown";
    logDebug("TempSetPoint_UpdateDisplay: targetDisplay: "+element.targetDisplay+
        ", displayvalue: ", displayvalue, ", ", typeof displayvalue);
    if (displayvalue != null) {
        displayvaluetext  = displayvalue.toFixed(1);
        displayvalueclass = displaystateclass;
    }
    webbrick.widgets.setSubElementValue
        (element, "SetPointDisplay" , 0, null,            displayvalueclass);
    webbrick.widgets.setSubElementValue
        (element, "SetPointValue",   0, displayvaluetext, displayvalueclass);
    webbrick.widgets.setSubElementValue
        (element, "SetPointState",   0, displaystatetext, displaystateclass);
}

// Button click handlers: 
// these generate events that can be picked up by other parts of the system
function TempSetPoint_IncreaseTarget(element, event) {
    TempSetPoint_BumpTarget(element, +0.5);
}

function TempSetPoint_DecreaseTarget(element, event) {
    TempSetPoint_BumpTarget(element, -0.5);
}

function TempSetPoint_BumpTarget(element, delta) {
    var target = element.targetValue;
    if (target != null && element.targetDisplay > 0) { target += delta; }
    TempSetPoint_SetTarget(element, target);
}

function TempSetPoint_SetTarget(element, target) {
    var router       = webbrick.widgets.getWidgetEventRouter();
    var showtargetev = webbrick.widgets.makeWidgetEvent(element, "@ShowTargetEvent", "@Subject", 5);
    router.publish(element.agentUri, showtargetev);
    var settargetev  = webbrick.widgets.makeWidgetEvent(element, "@SetTargetEvent", "@Subject", target);
    router.publish(element.agentUri, settargetev);
}

// Set current value incoming event handler
function TempSetPoint_SetCurrentHandler(handler, event) {
    TempSetPoint_SetCurrentValue
        (handler.element, webbrick.widgets.getEventData(event, parseFloat));
}

// Set target value incoming event handler
function TempSetPoint_SetTargetHandler(handler, event) {
    TempSetPoint_SetTargetValue
        (handler.element, webbrick.widgets.getEventData(event, parseFloat));
}

// Show target value incoming event handler
function TempSetPoint_ShowTargetHandler(handler, event) {
    TempSetPoint_ShowTargetValue
        (handler.element, webbrick.widgets.getEventData(event, parseInt));
}

// Clock tick incoming event handler
function TempSetPoint_ClockTickEventHandler(handler, event) {
    var elm = handler.element;
    if (elm.targetDisplay > 0) {
        elm.targetDisplay -= 1;
        TempSetPoint_UpdateDisplay(elm);
    }
}

// End.
