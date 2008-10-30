// $Id$
//
// Module providing logic for simple button to generate and respond to events.
//

// Initialize simple button: set up event subscriptions
// Note that event URIs are obtained from the server via widget attributes
function NumericDisplay_Init(element) {
    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    // Set up handler for set text events
    var settexteventtype  = element.getAttribute("SetNumericDisplayValueEvent");
    var settextlistener   = makeEventHandler(
        settexteventtype+"_handler", NumericDisplay_SetValueEventHandler, null, null);
    settextlistener.element = element;
    WidgetEventRouter.subscribe(32000, 
        settextlistener, settexteventtype, null);       // evtype, source
    // Set up handler for set state events
    var setstateeventtype = element.getAttribute("SetNumericDisplayStateEvent");
    var setstatelistener  = makeEventHandler(
        setstateeventtype+"_handler", NumericDisplay_SetStateEventHandler, null, null);
    setstatelistener.element = element;
    WidgetEventRouter.subscribe(32000, 
        setstatelistener, setstateeventtype, null);     // evtype, source
}

// Function sets text in a simple button
function NumericDisplay_SetValue(element,text) {
    webbrick.widgets.setElementText(element, text);
}

// Function sets state of a simple button
//
// State is: up, down, waiting, unknown
//
function NumericDisplay_SetState(element,state) {
    var elemclass = "numericdisplay_unknown";
    if (state == "up") {
        elemclass = "numericdisplay_normal";
    }
    else if (state == "down") {
        elemclass = "numericdisplay_depressed";
    }
    else if (state == "waiting") {
        elemclass = "numericdisplay_pending";
    }
    else if (state == "unknown") {
        elemclass = "numericdisplay_unknown";
    }
    MochiKit.DOM.setNodeAttribute(element, "class", elemclass);
}

// Set text incoming event handler for simple button
function NumericDisplay_SetValueEventHandler(handler, event) {
    NumericDisplay_SetValue(handler.element, event.getPayload())
}

// Set state incoming event handler for simple button
function NumericDisplay_SetStateEventHandler(handler, event) {
    NumericDisplay_SetState(handler.element, event.getPayload())
}

// End.
