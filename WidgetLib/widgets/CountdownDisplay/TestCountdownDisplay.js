// $Id: TestCountdownDisplay.js 36 2009-01-09 15:24:30Z gk-google@ninebynine.org $
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.CountdownDisplay module.
 *
 * @version $Id: TestCountdownDisplay.js 36 2009-01-09 15:24:30Z gk-google@ninebynine.org $
 * @author Graham Klyne
 *
 * @requires MochiKit.Base
 * @requires MochiKit.DOM
 * @requires MochiKit.Logging
 * @requires MochiKit.Signal
 * @requires SimpleTest
 * @requires AsyncUnitTest
 * @requires webbrick.URI.js
 * @requires webbrick.Status.js
 * @requires webbrick.Event.js
 * @requires webbrick.EventEnvelope.js
 * @requires webbrick.EventSerializer.js
 * @requires webbrick.EventAgent.js
 * @requires webbrick.EventHandler.js
 * @requires webbrick.EventRouter.js
 * @requires webbrick.EventRouterHTTPC.js
 * @requires webbrick.WidgetFunctions
 * @requires webbrick.widgets.MvcUtils
 * @requires webbrick.widgets.CountdownDisplay
 */

webbrick.require("MochiKit.Base");
webbrick.require("MochiKit.DOM");
webbrick.require("MochiKit.Logging");
webbrick.require("MochiKit.Signal");
webbrick.require("SimpleTest");
//TODO: put in namespace
// webbrick.require("AsyncUnitTest");
// webbrick.require("webbrick.URI");
// webbrick.require("webbrick.Status");
// webbrick.require("webbrick.Event");
// webbrick.require("webbrick.EventEnvelope");
// webbrick.require("webbrick.EventSerializer");
// webbrick.require("webbrick.EventAgent");
// webbrick.require("webbrick.EventHandler");
// webbrick.require("webbrick.EventPubSub");
// webbrick.require("webbrick.EventRouter");
// webbrick.require("webbrick.EventRouterHTTPC");
webbrick.require("webbrick.widgets.MvcUtils");
webbrick.require("webbrick.widgets.CountdownDisplay");
webbrick.require("webbrick.widgets.WidgetFunctions");

// Shortcuts
var logDebug   = MochiKit.Logging.logDebug;
var logInfo    = MochiKit.Logging.log;
var logWarning = MochiKit.Logging.logWarning;
var logError   = MochiKit.Logging.logError;

// var assert             = (from webbrick.AsyncUnitTest)
// var assertEq           = (from webbrick.AsyncUnitTest)
// var assertNotUndefined = (from webbrick.AsyncUnitTest)

/**
 * @class
 * Test suite for the webbrick.widgets.CountdownDisplay module.
 */
webbrick.widgets.TestCountdownDisplay = function() {
    logInfo("TestCountdownDisplay constructor");
    return this;
};

// Specify order of tests: 
webbrick.widgets.TestCountdownDisplay.exposeTestFunctionNames = function() {
    return [ 'testModuleContents'
           , 'testInitialModel'
           , 'testInitialElem'
           , 'testSetState'
           , 'testSetValue'
           , 'testSetCounterEvent'
           , 'testSetCounterStringEvent'
           , 'testClockTickEvent'
           ];
}

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestCountdownDisplay.prototype.toString = function() {
    return 'TestCountdownDisplay';
};

/**
 *  Set up function for webbrick.widgets.TestCountdownDisplay.
 */
webbrick.widgets.TestCountdownDisplay.prototype.setUp = function() {
    var elem = null;
    logInfo("setUp test");
    // Instantiate a local event router
    this.router = webbrick.widgets.getLocalEventRouter();
    // Set up the CountdownDisplay element and widget
    try {
        var html =
            "<span class='countdown_unknown'"+
            ">Countdown value here</span>";
        var div = document.createElement('div');
        div.innerHTML = html;
        elem = div.getElementsByTagName('span')[0];
    } catch (e) {
        logError("setUp document.createElement('div') error, "+e.name+", "+e.message);
    }
    logDebug("setUp elem: "+elem);
    if (elem == null) {
        logError("setUp: elem is null");
    }
    try {
        this.display = webbrick.widgets.CountdownDisplay_Init(elem);
        this.model   = this.display._model;
        this.elem    = elem;
    } catch (e) {
        logError("setUp new CountdownDisplay error, "+e.name+", "+e.message);
    }
    logDebug("setUp done");
};

/**
 *  Tear down function for webbrick.widgets.TestCountdownDisplay.
 */
webbrick.widgets.TestCountdownDisplay.prototype.tearDown = function() {
    try {
        logInfo("tearDown test");
    } catch (e) {
        logError("tearDown error, "+e.name+", "+e.message);
    }
};

/**
 *  Test that the contents of the webbrick.widgets.CountdownDisplay module have been defined.
 */
webbrick.widgets.TestCountdownDisplay.prototype.testModuleContents = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testModuleContents ====");
    assertNotUndefined("testModuleContents", "_model", this.display._model);
    assertNotUndefined("testModuleContents", "_renderer", this.display._renderer);
    assertNotUndefined("testModuleContents", "_collector", this.display._collector);
    assertNotUndefined("testModuleContents", "_subscribes", this.display._subscribes);
};

/** 
 *  Test initial CountdownDisplay model content
 */
webbrick.widgets.TestCountdownDisplay.prototype.testInitialModel = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testInitialModel ====");
    logDebug("testInitialModel: state: "+this.model.get("STATE"));
    logDebug("testInitialModel: value: "+this.model.get("VALUE"));
    assertEq("testInitialModel", this.model.get("STATE"), "unknown");
    assertEq("testInitialModel", this.model.get("VALUE"), "Countdown value here");
    assertEq("testInitialModel", this.model.get("SetCounterEvent"), "_CountdownDisplay.SetCounterEvent");
    assertEq("testInitialModel", this.model.get("ClockTickEvent"),  "http://id.webbrick.co.uk/events/ClockTickEventType_second");    
};

/**
 *  Compare display class with supplied value, ensuring that other display classes
 *  are not present.
 */
webbrick.widgets.TestCountdownDisplay.prototype.compareElementClass = function(expected) {
    return webbrick.widgets.testClassValues(this.elem, expected, 
        [ "countdown_done"
        , "countdown_pending"
        , "countdown_unknown"
        ] );
};

/** 
 *  Test initial CountdownDisplay element values
 */
webbrick.widgets.TestCountdownDisplay.prototype.testInitialElem = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testInitialElem ====");
    logDebug("testInitialElem: class: "+this.elem.className);
    logDebug("testInitialElem: value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug("testInitialElem: text:  "+webbrick.widgets.getElementText(this.elem));
    assertEq("testInitialElem", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testInitialElem", null, this.compareElementClass("countdown_unknown"));
};

/** 
 *  Test set state by direct setting of model
 *
 *  Expect model and element class to be updated each time.
 */
webbrick.widgets.TestCountdownDisplay.prototype.testSetState = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testSetState ====");

    // Test initial element class
    logDebug("testSetState: test initial element class: "+this.elem.className);
    assertEq("testSetState: initial state", this.model.get("STATE"), "unknown");
    assertEq("testSetState: initial class", null, this.compareElementClass("countdown_unknown"));

    // Test for invalid state
    logDebug("test invalid state raises error");
    try {
        this.model.set("STATE", "invalid");
        assertFail("testSetState: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("Set invalid state OK");
        } else {
            assertFail("testSetState: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }

    // Test setting state to "done"
    logDebug("test setting state to 'done'");
    this.model.set("STATE", "done");
    assertEq("testSetState: state: ", this.model.get("STATE"), "done");
    assertEq("testSetState: value: ", this.model.get("VALUE"), "Countdown value here");
    assertEq("testSetState: text:  ", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testSetState: class: ", null, this.compareElementClass("countdown_done"));
      
    // Test setting state to "pending"
    logDebug("test setting state to 'pending'");
    this.model.set("STATE", "pending");
    assertEq("testSetState: state", this.model.get("STATE"), "pending");
    assertEq("testSetState: value", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testSetState", null, this.compareElementClass("countdown_pending"));

    // Test setting state to "unknown"
    logDebug("test setting state to 'unknown'");
    this.model.set("STATE", "unknown");
    assertEq("testSetState: state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetState: value: ", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testSetState: class: ", null, this.compareElementClass("countdown_unknown"));

    logDebug("testSetState complete");
};

/** 
 *  Test set value by direct setting of model
 */
webbrick.widgets.TestCountdownDisplay.prototype.testSetValue = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testSetValue ====");

    // Test initial element value
    logDebug("test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetValue: value", webbrick.widgets.getElementText(this.elem), "Countdown value here");

    // Test set new element value
    this.model.set("VALUE", "new value");
    logDebug("testSetValue: new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    assertEq("testSetValue: value", webbrick.widgets.getElementText(this.elem), "new value");

    logDebug("testSetValue complete");
};

/** 
 *  Publish event helper function
 *
 *  Returns a deferred status value.
 */
webbrick.widgets.TestCountdownDisplay.prototype.publishEvent = function 
        (evtype, payload) {
    logDebug("publishEvent: evtype: "+evtype+", payload: "+payload);
    var source = makeEventAgent("testSetStateEvent");
    logDebug("publishEvent: source: "+source);
    var event  = makeEvent(evtype, "testSetStateEvent", payload);
    logDebug("publishEvent: event: "+event);
    var sts = this.router.publish(source, event);
    logDebug("publishEvent: sts: "+sts);
    var sts = syncDeferred(sts);
    logDebug("publishEvent: syncDeferred(sts): "+sts);
    return sts;
}

/** 
 *  Test set value and state by publishing event
 */
webbrick.widgets.TestCountdownDisplay.prototype.testSetCounterEvent = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testSetCounterEvent ====");
    var setCounterEvent = this.model.get("SetCounterEvent");

    // Test initial element value
    logDebug("testSetCounterEvent: test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetCounterEvent: state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetCounterEvent: value: ", this.model.get("VALUE"), "Countdown value here");
    assertEq("testSetCounterEvent: text:  ", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testSetCounterEvent: class: ", null, this.compareElementClass("countdown_unknown"));

    // Test set counter to non-zero value
    logDebug("testSetCounterEvent: test setting counter to '2'");
    var sts = this.publishEvent(setCounterEvent, 2);
    logDebug("testSetCounterEvent: sts: "+sts);
    assertEq("testSetCounterEvent: state: ", this.model.get("STATE"), "pending");
    assertEq("testSetCounterEvent: value: ", this.model.get("VALUE"), 2);
    assertEq("testSetCounterEvent: text:  ", webbrick.widgets.getElementText(this.elem), "2");
    assertEq("testSetCounterEvent: class: ", null, this.compareElementClass("countdown_pending"));

    // Test set counter to zero
    logDebug("testSetCounterEvent: test setting counter to '0'");
    var sts = this.publishEvent(setCounterEvent, 0);
    logDebug("testSetCounterEvent: sts: "+sts);
    assertEq("testSetCounterEvent: state: ", this.model.get("STATE"), "done");
    assertEq("testSetCounterEvent: value: ", this.model.get("VALUE"), 0);
    assertEq("testSetCounterEvent: text:  ", webbrick.widgets.getElementText(this.elem), "0");
    assertEq("testSetCounterEvent: class: ", null, this.compareElementClass("countdown_done"));

    // Test set counter to non-number
    logDebug("testSetCounterEvent: test setting counter to 'unknown'");
    var sts = this.publishEvent(setCounterEvent, "unknown");
    logDebug("testSetCounterEvent: sts: "+sts);
    assertEq("testSetCounterEvent: state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetCounterEvent: value: ", this.model.get("VALUE"), "unknown");
    assertEq("testSetCounterEvent: text:  ", webbrick.widgets.getElementText(this.elem), "unknown");
    assertEq("testSetCounterEvent: class: ", null, this.compareElementClass("countdown_unknown"));
    
    logDebug("testSetCounterEvent complete");
};

/** 
 *  Test set value and state by publishing event with string-valued counter
 */
webbrick.widgets.TestCountdownDisplay.prototype.testSetCounterStringEvent = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testSetCounterStringEvent ====");
    var setCounterEvent = this.model.get("SetCounterEvent");

    // Test initial element value
    logDebug("testSetCounterStringEvent: test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetCounterStringEvent: state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetCounterStringEvent: value: ", this.model.get("VALUE"), "Countdown value here");
    assertEq("testSetCounterStringEvent: text:  ", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testSetCounterStringEvent: class: ", null, this.compareElementClass("countdown_unknown"));

    // Test set counter to non-zero value
    logDebug("testSetCounterStringEvent: test setting counter to '2'");
    var sts = this.publishEvent(setCounterEvent, "2");
    logDebug("testSetCounterStringEvent: sts: "+sts);
    assertEq("testSetCounterStringEvent: state: ", this.model.get("STATE"), "pending");
    assertEq("testSetCounterStringEvent: value: ", this.model.get("VALUE"), 2);
    assertEq("testSetCounterStringEvent: text:  ", webbrick.widgets.getElementText(this.elem), "2");
    assertEq("testSetCounterStringEvent: class: ", null, this.compareElementClass("countdown_pending"));

    // Test set counter to zero
    logDebug("testSetCounterStringEvent: test setting counter to '0'");
    var sts = this.publishEvent(setCounterEvent, "0");
    logDebug("testSetCounterStringEvent: sts: "+sts);
    assertEq("testSetCounterStringEvent: state: ", this.model.get("STATE"), "done");
    assertEq("testSetCounterStringEvent: value: ", this.model.get("VALUE"), 0);
    assertEq("testSetCounterStringEvent: text:  ", webbrick.widgets.getElementText(this.elem), "0");
    assertEq("testSetCounterStringEvent: class: ", null, this.compareElementClass("countdown_done"));

    // Test set counter to non-number
    logDebug("testSetCounterStringEvent: test setting counter to 'unknown'");
    var sts = this.publishEvent(setCounterEvent, "unknown");
    logDebug("testSetCounterStringEvent: sts: "+sts);
    assertEq("testSetCounterStringEvent: state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetCounterStringEvent: value: ", this.model.get("VALUE"), "unknown");
    assertEq("testSetCounterStringEvent: text:  ", webbrick.widgets.getElementText(this.elem), "unknown");
    assertEq("testSetCounterStringEvent: class: ", null, this.compareElementClass("countdown_unknown"));
    
    logDebug("testSetCounterStringEvent complete");
};

/** 
 *  Test countdown on clock tick event
 */
webbrick.widgets.TestCountdownDisplay.prototype.testClockTickEvent = function() {
    logInfo("==== webbrick.widgets.TestCountdownDisplay.testClockTickEvent ====");
    var setCounterEvent  = this.model.get("SetCounterEvent");
    var clockTickEvent = this.model.get("ClockTickEvent");

    // Test initial element value
    logDebug("testClockTickEvent: test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testClockTickEvent: state: ", this.model.get("STATE"), "unknown");
    assertEq("testClockTickEvent: value: ", this.model.get("VALUE"), "Countdown value here");
    assertEq("testClockTickEvent: text:  ", webbrick.widgets.getElementText(this.elem), "Countdown value here");
    assertEq("testClockTickEvent: class: ", null, this.compareElementClass("countdown_unknown"));

    // Test set counter to non-zero value
    logDebug("testClockTickEvent: test setting counter to '2'");
    var sts = this.publishEvent(setCounterEvent, 2);
    logDebug("testClockTickEvent: sts: "+sts);
    assertEq("testClockTickEvent: state: ", this.model.get("STATE"), "pending");
    assertEq("testClockTickEvent: value: ", this.model.get("VALUE"), 2);
    assertEq("testClockTickEvent: text:  ", webbrick.widgets.getElementText(this.elem), "2");
    assertEq("testClockTickEvent: class: ", null, this.compareElementClass("countdown_pending"));

    // Count down to '1'
    logDebug("testClockTickEvent: test count down to '1'");
    var sts = this.publishEvent(clockTickEvent);
    logDebug("testClockTickEvent: sts: "+sts);
    assertEq("testClockTickEvent: state: ", this.model.get("STATE"), "pending");
    assertEq("testClockTickEvent: value: ", this.model.get("VALUE"), 1);
    assertEq("testClockTickEvent: text:  ", webbrick.widgets.getElementText(this.elem), "1");
    assertEq("testClockTickEvent: class: ", null, this.compareElementClass("countdown_pending"));

    // Count down to '0'
    logDebug("testClockTickEvent: test count down to '0'");
    var sts = this.publishEvent(clockTickEvent);
    logDebug("testClockTickEvent: sts: "+sts);
    assertEq("testClockTickEvent: state: ", this.model.get("STATE"), "done");
    assertEq("testClockTickEvent: value: ", this.model.get("VALUE"), 0);
    assertEq("testClockTickEvent: text:  ", webbrick.widgets.getElementText(this.elem), "0");
    assertEq("testClockTickEvent: class: ", null, this.compareElementClass("countdown_done"));

    // Clock tick at '0' - remain at '0'
    logDebug("testClockTickEvent: test count down to '0'");
    var sts = this.publishEvent(clockTickEvent);
    logDebug("testClockTickEvent: sts: "+sts);
    assertEq("testClockTickEvent: state: ", this.model.get("STATE"), "done");
    assertEq("testClockTickEvent: value: ", this.model.get("VALUE"), 0);
    assertEq("testClockTickEvent: text:  ", webbrick.widgets.getElementText(this.elem), "0");
    assertEq("testClockTickEvent: class: ", null, this.compareElementClass("countdown_done"));
    
    logDebug("testClockTickEvent complete");
};

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
