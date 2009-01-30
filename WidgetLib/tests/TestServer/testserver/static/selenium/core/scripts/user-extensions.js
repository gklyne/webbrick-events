// $Id: user-extensions.js 2 2008-10-30 18:29:31Z gk-google@ninebynine.org $
//
// Selenium extension for testing and generating events
//
// All do* methods on the Selenium prototype are added as actions.
//
// Copy this file to selenium/core/scripts/user-extensions.js to run tests
// using these additional commands.  It is assumed that the event libraries
// are loaded by the application web page, using something like this:
//    <script type="text/javascript" src="/eventlib/static/javascript/URI.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/Status.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/Event.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/EventEnvelope.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/EventSerializer.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/EventAgent.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/EventHandler.js"></script>
//    <script type="text/javascript" src="/eventlib/static/javascript/EventRouter.js"></script>
//    <script type="text/javascript" src="/eventlib/tests/static/javascript/MochiKit.js"></script>
//    <script type="text/javascript" src="/eventlib/tests/static/javascript/DeferredMonad.js"></script>
//

EventRouter = null;
EventSender = null;
MyAppWindow = null;

// Local event handler function:
// Saves event and bumps count in handler object
function HandleEvent(h,e) {
    h.evcount += 1;
    h.event    = e;
    return MyAppWindow.makeDeferred(MyAppWindow.StatusVal.OK);
}

Selenium.prototype.doMakeEventRouter = function(routername) {
    // Create a new local event router with the specified name
    MyAppWindow = this.browserbot.getCurrentWindow();
    EventRouter = new MyAppWindow.EventPubSub(routername+"/router");
    EventSender = new MyAppWindow.EventAgent(routername+"/sender");
}

Selenium.prototype.doGetWidgetEventRouter = function(sendername) {
    // Access and save the local event router created for widget events handling
    // Also creates an event sending agent for test purposes using the supplied sender name
    MyAppWindow = this.browserbot.getCurrentWindow();
    EventRouter = MyAppWindow.webbrick.widgets.getWidgetEventRouter();
    EventSender = new MyAppWindow.EventAgent(sendername);
}

Selenium.prototype.getEventListener = function(eventtype) {
    // Create an event listener for the specified event type,
    // and return its value
    if (!EventRouter) {
        Assert.fail("getEventListener: no event router, use makeEventRouter(name)");
    }
    var listener = MyAppWindow.makeEventHandler(
        "user-extensions/HandleEvent/"+eventtype, HandleEvent, null, null);
    listener.evcount = 0 ;
    listener.event   = null;
    EventRouter.subscribe(9999, listener, eventtype, null); // evtype, source
    return listener;
};

Selenium.prototype.doPublishEvent = function(eventtype,eventpayload) {
    // Publish event
    if (!EventRouter) {
        Assert.fail("doPublishEvent: no event router, use makeEventRouter(name)");
    }
    var event = MyAppWindow.makeEvent(eventtype, EventSender.getUri(), eventpayload);
    EventRouter.publish(EventSender, event);
};

Selenium.prototype.isEventReceived = function(listenername) {
    // Get details of event received by given handler
    // The value returned is the event payload
    var listener = storedVars[listenername];
    return listener && listener.event;
};

Selenium.prototype.getEventType = function(listenername) {
    // Get type URI of event type received by given handler
    // The value returned is the event type
    var listener = storedVars[listenername];
    if (listener && listener.event) return listener.event.getType();
    return null;
};

Selenium.prototype.getEventSource = function(listenername) {
    // Get type URI of event source received by given handler
    // The value returned is the event type
    var listener = storedVars[listenername];
    if (listener && listener.event) return listener.event.getSource();
    return null;
};

Selenium.prototype.getEventObject = function(listenername) {
    // Get details of event received by given handler
    // The value returned is the event payload
    var listener = storedVars[listenername];
    if (listener && listener.event) return listener.event.getPayload();
    return null;
};

Selenium.prototype.doLog = function(description,value) {
	if ( MyAppWindow == null ) {
	    MyAppWindow = this.browserbot.getCurrentWindow();
	};
	// Log
	if ( value ) {
		MyAppWindow.MochiKit.Logging.log(description+" ("+value+")");
	} else {
		MyAppWindow.MochiKit.Logging.log(description);		
	}
	return null;
};

// End.
