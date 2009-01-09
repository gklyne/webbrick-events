// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.NumericDisplay module.
 *
 * @version $Id$
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
 * @requires webbrick.widgets.NumericDisplay
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
webbrick.require("webbrick.widgets.NumericDisplay");
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
 * Test suite for the webbrick.widgets.NumericDisplay module.
 */
webbrick.widgets.TestNumericDisplay = function() {
    return this;
};

// Specify order of tests: 
webbrick.widgets.TestNumericDisplay.exposeTestFunctionNames = function() {
    return [ 'testModuleContents'
           , 'testInitialModel'
           , 'testInitialElem'
           , 'testSetState'
           , 'testSetValue'
           , 'testSetStateEvent'
           , 'testSetValueEvent'
           ];
}

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestNumericDisplay.prototype.toString = function() {
    return 'TestNumericDisplay';
};

/**
 *  Set up function for webbrick.widgets.TestNumericDisplay.
 */
webbrick.widgets.TestNumericDisplay.prototype.setUp = function() {
    var elem = null;
    logInfo("setUp test");
    // Instantiate a local event router
    this.router = webbrick.widgets.getLocalEventRouter();
    // Set up the NumericDisplay element and widget
    try {
        var html =
            "<span class='numericdisplay_normal'"+
            ">Numeric value here</span>";
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
        this.display = webbrick.widgets.NumericDisplay_Init(elem);
        this.model   = this.display._model;
        this.elem    = elem;
    } catch (e) {
        logError("setUp new NumericDisplay error, "+e.name+", "+e.message);
    }
    logDebug("setUp done");
};

/**
 *  Tear down function for webbrick.widgets.TestNumericDisplay.
 */
webbrick.widgets.TestNumericDisplay.prototype.tearDown = function() {
    try {
        logInfo("tearDown test");
    } catch (e) {
        logError("tearDown error, "+e.name+", "+e.message);
    }
};

/**
 *  Test that the contents of the webbrick.widgets.NumericDisplay module have been defined.
 */
webbrick.widgets.TestNumericDisplay.prototype.testModuleContents = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testModuleContents ====");
    assertNotUndefined("testModuleContents", "_model", this.display._model);
    assertNotUndefined("testModuleContents", "_renderer", this.display._renderer);
    assertNotUndefined("testModuleContents", "_collector", this.display._collector);
    assertNotUndefined("testModuleContents", "_subscribes", this.display._subscribes);
};

/** 
 *  Test initial NumericDisplay model content
 */
webbrick.widgets.TestNumericDisplay.prototype.testInitialModel = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testInitialModel ====");
    logDebug("testInitialModel: state: "+this.model.get("STATE"));
    logDebug("testInitialModel: value: "+this.model.get("VALUE"));
    assertEq("testInitialModel", this.model.get("STATE"), "up");
    assertEq("testInitialModel", this.model.get("VALUE"), "Numeric value here");
    assertEq("testInitialModel", this.model.get("SetDisplayValueEvent"), "_NumericDisplay.SetDisplayValueEvent");
    assertEq("testInitialModel", this.model.get("SetDisplayStateEvent"), "_NumericDisplay.SetDisplayStateEvent");
};

/**
 *  Compare display class with supplied value, ensuring that other display classes
 *  are not present.
 */
webbrick.widgets.TestNumericDisplay.prototype.compareElementClass = function(expected) {
    return webbrick.widgets.testClassValues(this.elem, expected, 
        [ "numericdisplay_normal"
        , "numericdisplay_depressed"
        , "numericdisplay_pending"
        , "numericdisplay_unknown"
        ] );
}

/** 
 *  Test initial NumericDisplay element values
 */
webbrick.widgets.TestNumericDisplay.prototype.testInitialElem = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testInitialElem ====");
    logDebug("testInitialElem: class: "+this.elem.className);
    logDebug("testInitialElem: value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug("testInitialElem: text:  "+webbrick.widgets.getElementText(this.elem));
    assertEq("testInitialElem", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testInitialElem", null, this.compareElementClass("numericdisplay_normal"));
};

/** 
 *  Test set state by direct setting of model
 *
 *  Expect model and element class to be updated each time.
 */
webbrick.widgets.TestNumericDisplay.prototype.testSetState = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testSetState ====");

    // Test initial element class
    logDebug("test initial element class: "+this.elem.className);
    assertEq("testSetState: Initial state", this.model.get("STATE"), "up");
    assertEq("testSetState", null, this.compareElementClass("numericdisplay_normal"));

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

    // Test setting state to "up"
    logDebug("test setting state to 'up'");
    this.model.set("STATE", "up");
    assertEq("testSetState: state", this.model.get("STATE"), "up");
    assertEq("testSetState: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetState", null, this.compareElementClass("numericdisplay_normal"));

    // Test setting state to "down"
    logDebug("test setting state to 'down'");
    this.model.set("STATE", "down");
    assertEq("testSetState: state", this.model.get("STATE"), "down");
    assertEq("testSetState: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetState", null, this.compareElementClass("numericdisplay_depressed"));

    // Test setting state to "waiting"
    logDebug("test setting state to 'waiting'");
    this.model.set("STATE", "waiting");
    assertEq("testSetState: state", this.model.get("STATE"), "waiting");
    assertEq("testSetState: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetState", null, this.compareElementClass("numericdisplay_pending"));

    // Test setting state to "unknown"
    logDebug("test setting state to 'unknown'");
    this.model.set("STATE", "unknown");
    assertEq("testSetState: state", this.model.get("STATE"), "unknown");
    assertEq("testSetState: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetState", null, this.compareElementClass("numericdisplay_unknown"));

    logDebug("testSetState complete");
};

/** 
 *  Test set value by direct setting of model
 */
webbrick.widgets.TestNumericDisplay.prototype.testSetValue = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testSetValue ====");

    // Test initial element value
    logDebug("test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetValue: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");

    // Test set new element value
    this.model.set("VALUE", "new value");
    logDebug("set new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    assertEq("testSetValue: value", webbrick.widgets.getElementText(this.elem), "new value");

    logDebug("testSetValue complete");
};

/** 
 *  Publish event helper function
 *
 *  Returns a deferred status value.
 */
webbrick.widgets.TestNumericDisplay.prototype.publishEvent = function 
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
 *  Test set state by publishing event
 *
 *  Expect model and element class to be updated each time.
 */
webbrick.widgets.TestNumericDisplay.prototype.testSetStateEvent = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testSetStateEvent ====");
    var setStateEvent = this.model.get("SetDisplayStateEvent");

    // Test initial element class
    logDebug("test initial element class: "+this.elem.className);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "up");
    assertEq("testInitialElem", null, this.compareElementClass("numericdisplay_normal"));

    // Test for invalid state
    logDebug("test invalid state raises error");
    var sts = this.publishEvent(setStateEvent, "invalid");
    logDebug("testSetStateEvent: Set invalid state");
    logDebug("sts "+sts);
    assertEquals("testSetStateEvent: publishEvent(s)", typeof(sts), "object");
    assertEquals("testSetStateEvent: publishEvent(c)", sts.constructor, Error);
    assertEquals("testSetStateEvent: publishEvent(n)", sts.name, "InvalidPropertyValuePairError");
    assertEquals("testSetStateEvent: publishEvent(m)", sts.message, "Invalid property-value pair, property name: STATE, property value: invalid");

    // Retest initial element class - should be set to unknown after invalid value
    logDebug("test initial element class: "+this.elem.className);
    assertEq("testSetStateEvent: invalid", this.model.get("STATE"), "unknown");
    assertEq("testSetStateEvent", null, this.compareElementClass("numericdisplay_unknown"));

    // Test setting state to "up"
    logDebug("test setting state to 'up'");
    var sts = this.publishEvent(setStateEvent, "up");
    assertEquals("publishEvent(up) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "up");
    assertEq("testSetStateEvent: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetStateEvent", null, this.compareElementClass("numericdisplay_normal"));

    // Test setting state to "down"
    logDebug("test setting state to 'down'");
    var sts = this.publishEvent(setStateEvent, "down");
    assertEquals("publishEvent(down) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "down");
    assertEq("testSetStateEvent: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetStateEvent", null, this.compareElementClass("numericdisplay_depressed"));

    // Test setting state to "waiting"
    logDebug("test setting state to 'waiting'");
    var sts = this.publishEvent(setStateEvent, "waiting");
    assertEquals("publishEvent(waiting) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "waiting");
    assertEq("testSetStateEvent: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetStateEvent", null, this.compareElementClass("numericdisplay_pending"));

    // Test setting state to "unknown"
    logDebug("test setting state to 'unknown'");
    var sts = this.publishEvent(setStateEvent, "unknown");
    assertEquals("publishEvent(unknown) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "unknown");
    assertEq("testSetStateEvent: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");
    assertEq("testSetStateEvent", null, this.compareElementClass("numericdisplay_unknown"));

    logDebug("testSetStateEvent complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestNumericDisplay.prototype.testSetValueEvent = function() {
    logInfo("==== webbrick.widgets.TestNumericDisplay.testSetValueEvent ====");
    var setValueEvent = this.model.get("SetDisplayValueEvent");

    // Test initial element value
    logDebug("test initial element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetValueEvent: value", webbrick.widgets.getElementText(this.elem), "Numeric value here");

    // Test set new element value
    logDebug("test setting text to 'new value'");
    var sts = this.publishEvent(setValueEvent, "new value");
    logDebug("testSetValueEvent: sts: "+sts);
    logDebug("test set new element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetValueEvent: value", webbrick.widgets.getElementText(this.elem), "new value");

    logDebug("testSetValueEvent complete");
};

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
