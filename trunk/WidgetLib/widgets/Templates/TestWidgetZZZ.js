// $Id: TestWIDGETZZZ.js $
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.WIDGETZZZ module.
 *
 * @version $Id: TestWIDGETZZZ.js 36 2009-01-09 15:24:30Z gk-google@ninebynine.org $
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
 * @requires webbrick.widgets.WIDGETZZZ
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
webbrick.require("webbrick.widgets.WIDGETZZZ");
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
 * Test suite for the webbrick.widgets.WIDGETZZZ module.
 */
webbrick.widgets.TestWIDGETZZZ = function() {
    return this;
};

// Specify order of tests: 
webbrick.widgets.TestWIDGETZZZ.exposeTestFunctionNames = function() {
    return [ 'testModuleContents'
           //, 'testInitialModel'
           //, 'testInitialElem'
           //, 'testSetState'
           //, 'testSetValue'
           //, 'testSetStateEvent'
           //, 'testSetValueEvent'
           ];
}

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestWIDGETZZZ.prototype.toString = function() {
    return 'TestWIDGETZZZ';
};

/**
 *  Set up function for webbrick.widgets.TestWIDGETZZZ.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.setUp = function() {
    var elem = null;
    logInfo("TestWIDGETZZZ.setUp");
    // Instantiate a local event router
    this.router = webbrick.widgets.getLocalEventRouter();
    // Set up the WIDGETZZZ widget
    try {
        //////////////////////////
        //// TODO: define HTML for DOM to initialize widget
        var html =
            "<span class='WIDGETZZZ_unknown'"+
            ">WIDGETZZZ value here</span>";
        ////var html =
        ////    "<input type='button' class='WIDGETZZZ_unknown' "+
        ////    "value='WIDGETZZZ value here' >WIDGETZZZ value here</input>";
        //////////////////////////
        var div = document.createElement('div');
        div.innerHTML = html;
        elem = div.getElementsByTagName('span')[0];
    } catch (e) {
        logError("TestWIDGETZZZ.setUp: document.createElement('div') error, "+e.name+", "+e.message);
    }
    logDebug("TestWIDGETZZZ.setUp: elem: "+elem);
    if (elem == null) {
        logError("TestWIDGETZZZ.setUp: elem is null");
    }
    try {
        this.widget = webbrick.widgets.WIDGETZZZ_Init(elem);
        this.model  = this.widget._model;
        this.elem   = elem;     // this.widget._elem;
    } catch (e) {
        logError("setUp new WIDGETZZZ error, "+e.name+", "+e.message);
    }
    logDebug("TestWIDGETZZZ.setUp: done");
};

/**
 *  Tear down function for webbrick.widgets.TestWIDGETZZZ.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.tearDown = function() {
    try {
        logInfo("TestWIDGETZZZ.tearDown");
    } catch (e) {
        logError("TestWIDGETZZZ.tearDown: error, "+e.name+", "+e.message);
    }
};

/**
 *  Test that the contents of the webbrick.widgets.WIDGETZZZ module have been defined.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testModuleContents = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testModuleContents ====");
    assertNotUndefined("testModuleContents", "_model",      this.widget._model);
    assertNotUndefined("testModuleContents", "_renderer",   this.widget._renderer);
    assertNotUndefined("testModuleContents", "_collector",  this.widget._collector);
    assertNotUndefined("testModuleContents", "_subscribes", this.widget._subscribes);
};

/** 
 *  Test initial WIDGETZZZ model content
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testInitialModel = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testInitialModel ====");
    logDebug("testInitialModel: state: "+this.model.get("STATE"));
    logDebug("testInitialModel: value: "+this.model.get("VALUE"));
    assertEq("testInitialModel", this.model.get("STATE"), "unknown");
    assertEq("testInitialModel", this.model.get("VALUE"), "WIDGETZZZ value here");
    assertEq("testInitialModel", this.model.get("SetValueEvent"),   "_WIDGETZZZ.SetValueEvent");
    assertEq("testInitialModel", this.model.get("SetStateEvent"),   "_WIDGETZZZ.SetStateEvent");
    assertEq("testInitialModel", this.model.get("ClickEvent"),      "_WIDGETZZZ.ClickEvent");
    assertEq("testInitialModel", this.model.get("ClickSource"),     "_WIDGETZZZ.ClickSource");
    assertEq("testInitialModel", this.model.get("ClockTickEvent"),  "_WIDGETZZZ.ClockTickEvent_OverrideMe");    
};

/**
 *  Compare widget class with supplied value, ensuring that other 
 *  display classes are not present.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.compareElementClass = function(expected) {
    return webbrick.widgets.testClassValues(this.elem, expected, 
        [ "WIDGETZZZ_normal"
        , "WIDGETZZZ_pending"
        , "WIDGETZZZ_unknown"
        ] );
};

/** 
 *  Test initial WIDGETZZZ element values
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testInitialElem = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testInitialElem ====");
    logDebug("testInitialElem: class: "+this.elem.className);
    logDebug("testInitialElem: value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug("testInitialElem: text:  "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    //assertEq("testInitialElem",  MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testInitialElem", webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testInitialElem", null, this.compareElementClass("WIDGETZZZ_unknown"));
};

/** 
 *  Test set state by direct setting of model
 *
 *  Expect model and element class to be updated each time.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testSetState = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testSetState ====");

    // Confirm initial element class
    assertEq("testSetState: Initial state: ", this.model.get("STATE"), "unknown");
    assertEq("testSetState: Initial class: ", null, this.compareElementClass("WIDGETZZZ_unknown"));

    // Test setting invalid state
    logDebug("testSetState: test invalid state raises error");
    try {
        this.model.set("STATE", "invalid");
        assertFail("testSetState: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testSetState: Set invalid state OK");
        } else {
            assertFail("testSetState: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }

    // Test setting state to "normal"
    logDebug("testSetState: setting state to 'normal'");
    this.model.set("STATE", "normal");
    assertEq("testSetState: state", this.model.get("STATE"), "normal");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetState: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetState", null, this.compareElementClass("WIDGETZZZ_normal"));

    // Test setting state to "pending"
    logDebug("testSetState: setting state to 'pending'");
    this.model.set("STATE", "pending");
    assertEq("testSetState: state", this.model.get("STATE"), "pending");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetState: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetState", null, this.compareElementClass("WIDGETZZZ_pending"));

    // Test setting state to "unknown"
    logDebug("testSetState: setting state to 'unknown'");
    this.model.set("STATE", "unknown");
    assertEq("testSetState: state", this.model.get("STATE"), "unknown");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetState: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetState", null, this.compareElementClass("WIDGETZZZ_unknown"));

    logDebug("testSetState: complete");
};

/** 
 *  Test set value by direct setting of model
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testSetValue = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testSetValue ====");

    // Confirm initial element value
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetState: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////

    //////////////////////////
    //// TODO: adjust as needed
    // Test set new element value
    this.model.set("VALUE", "new value");
    logDebug("testSetValue: new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    assertEq("testSetValue: value", webbrick.widgets.getElementText(this.elem), "new value");
    ////logDebug("set new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq("testSetValue: value",  
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "new value");
    //////////////////////////

    logDebug("testSetValue: complete");
};

/** 
 *  Publish event helper function
 *
 *  Returns a deferred status value.
 */
// TODO: refactor this to common library code
webbrick.widgets.TestWIDGETZZZ.prototype.publishEvent = function 
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
webbrick.widgets.TestWIDGETZZZ.prototype.testSetStateEvent = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testSetStateEvent ====");
    var setStateEvent = this.model.get("SetStateEvent");

    // Confirm initial element class
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "unknown");
    assertEq("testSetStateEvent", null, this.compareElementClass("WIDGETZZZ_unknown"));

    // Test for invalid state
    logDebug("test invalid state raises error");
    var sts = this.publishEvent(setStateEvent, "invalid");
    logDebug("testSetStateEvent: Set invalid state");
    logDebug("sts "+sts);
    assertEquals("testSetStateEvent: publishEvent", typeof(sts), "object");
    assertEquals("testSetStateEvent: publishEvent", sts.constructor, Error);
    assertEquals("testSetStateEvent: publishEvent", sts.name, "InvalidPropertyValuePairError");
    assertEquals("testSetStateEvent: publishEvent", sts.message, "Invalid property-value pair, property name: STATE, property value: invalid");

    // Retest initial element class - should be set to unknown after invalid value
    assertEq("testSetStateEvent: invalid", this.model.get("STATE"), "unknown");
    assertEq("testSetStateEvent", null, this.compareElementClass("WIDGETZZZ_unknown"));

    // Test setting state to "normal"
    logDebug("testSetStateEvent: setting state to 'normal'");
    var sts = this.publishEvent(setStateEvent, "normal");
    assertEquals("testSetStateEvent: publishEvent(normal) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "normal");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("WIDGETZZZ_normal"));

    // Test setting state to "pending"
    logDebug("testSetStateEvent: setting state to 'pending'");
    var sts = this.publishEvent(setStateEvent, "pending");
    assertEquals("testSetStateEvent: publishEvent(pending) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "pending");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("WIDGETZZZ_pending"));

    // Test setting state to "unknown"
    logDebug("testSetStateEvent: setting state to 'unknown'");
    var sts = this.publishEvent(setStateEvent, "unknown");
    assertEquals("testSetStateEvent: publishEvent(unknown) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "unknown");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("WIDGETZZZ_unknown"));

    logDebug("testSetStateEvent: complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testSetValueEvent = function() {
    logInfo("==== webbrick.widgets.TestWIDGETZZZ.testSetValueEvent ====");
    var setValueEvent = this.model.get("SetValueEvent");

    // Test initial element value
    logDebug("testSetValueEvent: initial element value: "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq("testSetValueEvent: value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////

    //////////////////////////
    //// TODO: adjust as needed
    // Test set new element value
    logDebug("testSetValueEvent: setting text to 'new value'");
    var sts = this.publishEvent(setValueEvent, "new value");
    logDebug("testSetValueEvent: sts: "+sts);
    logDebug("testSetValueEvent: new element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq("testSetValueEvent: value", 
        webbrick.widgets.getElementText(this.elem), "new value");
    ////logDebug("set new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq("testSetValue: value",  
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "new value");
    //////////////////////////
    
    logDebug("testSetValueEvent: complete");
};

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
