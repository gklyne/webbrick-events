// $Id$
//
// Module providing logic for countdown display.
//

// Initialize simple button: set up event subscriptions
// Note that global event URIs are obtained from the server via widget attributes
function CountdownDisplay_Init(element) {
    // Access widget event router
    var WidgetEventRouter = webbrick.widgets.getWidgetEventRouter();
    // Set up handler for set value events
    var setcounteventtype  = element.getAttribute("SetCountdownDisplayValueEvent");
    var setcountlistener   = makeEventHandler(
        setcounteventtype+"_handler", 
        webbrick.widgets.CountdownDisplay_SetValueEventHandler, null, null);
    setcountlistener.element = element;
    WidgetEventRouter.subscribe(32000, 
        setcountlistener, setcounteventtype, null);     // evtype, source
    // Set up handler for timer events
    // startClock first to define ClockTickEventType
    var clockevent          = webbrick.widgets.startClock();
    var clockticklistener   = makeEventHandler(
        clockevent[0]+"_handler", 
        webbrick.widgets.CountdownDisplay_ClockTickEventHandler, null, null);
    clockticklistener.element = element;
    MochiKit.Logging.logDebug("CountdownDisplay_Init: ClockTickEventType: "+clockevent[0]);
    WidgetEventRouter.subscribe(32000, 
        clockticklistener, clockevent[0], clockevent[1]);   // evtype, source
    // Initialize element value
    webbrick.widgets.CountdownDisplay_SetValue
        (element, parseInt(webbrick.widgets.getElementText(element), 10) );
};

// Function sets the countdown element value
webbrick.widgets.CountdownDisplay_SetValue = function (element, value) {
    MochiKit.Logging.logDebug("CountdownDisplay_SetValue: "+value);
    element.value = value;
    webbrick.widgets.setElementText(element, value.toString(10));
    var elemclass = "countdown_done";
    if (value !== 0) {
        elemclass = "countdown_pending";
    }
    MochiKit.DOM.setNodeAttribute(element, "class", elemclass);
}

// Set value incoming event handler 
webbrick.widgets.CountdownDisplay_SetValueEventHandler = function (handler, event) {
    MochiKit.Logging.logDebug("CountdownDisplay_SetValueEventHandler: "+event.getPayload());
    webbrick.widgets.CountdownDisplay_SetValue(handler.element, event.getPayload());
}

// Clock tick incoming event handler
webbrick.widgets.CountdownDisplay_ClockTickEventHandler = function (handler, event) {
    //MochiKit.Logging.logDebug("CountdownDisplay_ClockTickEventHandler");
    var elm = handler.element;
    if (elm.value > 0) {
        MochiKit.Logging.logDebug("CountdownDisplay_ClockTickEventHandler: event "+event);
        MochiKit.Logging.logDebug("CountdownDisplay_ClockTickEventHandler: set value "+(elm.value-1));
        webbrick.widgets.CountdownDisplay_SetValue(elm, elm.value-1);
    }
}

// End.
