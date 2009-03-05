// $Id$
//
// Module providing logic for mode selector widget
//
// Outgoing events:
//   ModeSelector_SetMode
//
// Incoming events:
//   ModeSelector_SetMode
//   

// -------------------------------------
// Temperate set point widget logic
// -------------------------------------

// Initialize simple button: set up event subscriptions
// Note that event URIs are obtained from the server via widget attributes
function ModeSelector_Init(element) {

    // Internal values
    element.currentMode = 0 ;  // unknown
    element.agentUri    = makeEventAgentUri(EventUriSourceBase);

    // If defined, set default target value
    var defmode = webbrick.widgets.getWidgetValue(element, "@DefaultMode");
    if (defmode != null && defmode != "") {
        element.currentMode = parseInt(defmode);
    }

    // Initialize button data and connect button click handlers
    var buttons = element.getElementsByTagName("ModeSelectorButton");
    for (var i = 0 ; i < buttons.length ; i++) {
        var btn = buttons[i];
        btn.buttonMode = i+1;
        MochiKit.Signal.connect(btn, 'onclick', 
            MochiKit.Base.partial(ModeSelector_SetMode, element, btn));        
    }

    // Update display to reflect initial values
    ModeSelector_UpdateDisplay(element);

    // Set up handler for set value events
    webbrick.widgets.subscribeWidgetEventHandler(
        element, "@SetModeEvent", "@ModeSubject", ModeSelector_SetModeHandler);
}

// Update the display to reflect the current mode:
function ModeSelector_UpdateDisplay(element) {
    var buttons = element.getElementsByTagName("ModeSelectorButton")
    for (var i = 0 ; i < buttons.length ; i++) {
        var btn = buttons[i];
        var buttonclass = "modeselector-normal";
        var buttoncheck = false; 
        if (element.currentMode == btn.buttonMode) {
            buttonclass = "modeselector-selected";
            buttoncheck = true; 
        }
        else if (element.currentMode == 0) {
            buttonclass = "modeselector-unknown";
        }
        btn.setAttribute("class", buttonclass);
        var inp = btn.getElementsByTagName("input")
        if (inp) {
            inp[0].checked = buttoncheck;
        }
    }
}

// Function sets the current value, and updates the display
function ModeSelector_SetCurrentMode(element, mode) {
    element.currentMode = mode;
    element.setAttribute("currentMode", str(mode));
    ModeSelector_UpdateDisplay(element);
}

// Button click handler: 
// This generates an events that can be picked up by other parts of the system,
// as well as ourself.
function ModeSelector_SetMode(element, btn, event) {
    var router    = webbrick.widgets.getWidgetEventRouter();
    var setmodeev = webbrick.widgets.makeWidgetEvent
        (element, "@SetModeEvent", "@ModeSubject", btn.buttonMode);
    router.publish(element.agentUri, setmodeev);
}

// Set mode incoming event handler
function ModeSelector_SetModeHandler(handler, event) {
    ModeSelector_SetCurrentMode(handler.element, webbrick.widgets.getEventData(event, parseInt));
}

// End.
