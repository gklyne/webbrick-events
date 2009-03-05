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
           //, 'testSetValue'
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
 *  Test that the contents of the webbrick.widgets.WIDGETZZZ module have been defined.
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testModuleContents = function() {
    var testname = "testModuleContents";
    logInfo("==== webbrick.widgets.TestWIDGETZZZ."+testname+" ====");
    assertNotUndefined(testname, "_model",      this.widget._model);
    assertNotUndefined(testname, "_renderer",   this.widget._renderer);
    assertNotUndefined(testname, "_collector",  this.widget._collector);
    assertNotUndefined(testname, "_subscribes", this.widget._subscribes);
};

/** 
 *  Test initial WIDGETZZZ model content
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testInitialModel = function() {
    var testname = "testModuleContents";
    logInfo("==== webbrick.widgets.TestWIDGETZZZ."+testname+" ====");
    logDebug(testname+": state: "+this.model.get("STATE"));
    logDebug(testname+": value: "+this.model.get("VALUE"));
    assertEq(testname, this.model.get("STATE"), "unknown");
    assertEq(testname, this.model.get("VALUE"), "WIDGETZZZ value here");
    assertEq(testname, this.model.get("SetValueEvent"),   "_WIDGETZZZ.SetValueEvent");
    assertEq(testname, this.model.get("SetStateEvent"),   "_WIDGETZZZ.SetStateEvent");
    assertEq(testname, this.model.get("ClickEvent"),      "_WIDGETZZZ.ClickEvent");
    assertEq(testname, this.model.get("ClickSource"),     "_WIDGETZZZ.ClickSource");
    assertEq(testname, this.model.get("ClockTickEvent"),  "_WIDGETZZZ.ClockTickEvent_OverrideMe");    
};

/** 
 *  Test initial WIDGETZZZ element values
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testInitialElem = function() {
    var testname = "testInitialElem";
    logInfo("==== webbrick.widgets.TestWIDGETZZZ."+testname+" ====");
    logDebug(testname+": class: "+this.elem.className);
    logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug(testname+": text:  "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    //assertEq("testInitialElem",  MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq(testname, webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////
    assertEq(testname, null, this.compareElementClass("WIDGETZZZ_unknown"));
};

/** 
 *  Test set value by direct setting of model
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testSetValue = function() {
    var testname = "testSetValue";
    logInfo("==== webbrick.widgets.TestWIDGETZZZ."+testname+" ====");

    // Confirm initial element value
    //////////////////////////
    //// TODO: adjust as needed
    logDebug(testname+": value: "+webbrick.widgets.getElementText(this.elem));
    assertEq(testname+": value: ", 
            webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    ////logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq(testname+": value: ", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    ////logDebug(testname+": class: "+MochiKit.DOM.getNodeAttribute(this.elem, "class"));
    ////assertEq(testname, null, this.compareElementClass("WIDGETZZZ_unknown"));
    //////////////////////////
    
    //////////////////////////
    //// TODO: adjust as needed
    // Test set new element value
    this.model.set("VALUE", "new value");
    logDebug(testname+": value: "+webbrick.widgets.getElementText(this.elem));
    assertEq(testname+": value: ", 
            webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    ////logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq(testname+": value: ", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    ////logDebug(testname+": class: "+MochiKit.DOM.getNodeAttribute(this.elem, "class"));
    ////assertEq(testname, null, this.compareElementClass("WIDGETZZZ_unknown"));
    //////////////////////////

    logDebug(testname+": complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestWIDGETZZZ.prototype.testSetValueEvent = function() {
    var testname = "testSetValueEvent";
    logInfo("==== webbrick.widgets.TestWIDGETZZZ."+testname+" ====");
    var setValueEvent = this.model.get("SetValueEvent");

    // Test initial element value
    logDebug(testname+": initial element value: "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq(testname+": value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "WIDGETZZZ value here");
    assertEq(testname+": value", 
        webbrick.widgets.getElementText(this.elem), "WIDGETZZZ value here");
    //////////////////////////

    //////////////////////////
    //// TODO: adjust as needed
    // Test set new element value
    logDebug(testname+": setting text to 'new value'");
    var sts = this.publishEvent(setValueEvent, "new value");
    logDebug(testname+": sts: "+sts);
    logDebug(testname+": new element value: "+webbrick.widgets.getElementText(this.elem));
    assertEq(testname+": value", 
        webbrick.widgets.getElementText(this.elem), "new value");
    ////logDebug("set new element value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq(testname+": value",  
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "new value");
    //////////////////////////
    
    logDebug(testname+": complete");
};

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
