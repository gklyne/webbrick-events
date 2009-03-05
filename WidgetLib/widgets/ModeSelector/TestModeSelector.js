// $Id: TestModeSelector.js $
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.ModeSelector module.
 *
 * @version $Id: TestModeSelector.js 36 2009-01-09 15:24:30Z gk-google@ninebynine.org $
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
 * @requires webbrick.widgets.ModeSelector
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
webbrick.require("webbrick.widgets.ModeSelector");
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
 * Test suite for the webbrick.widgets.ModeSelector module.
 */
webbrick.widgets.TestModeSelector = function() {
    return this;
};

// Specify order of tests: 
webbrick.widgets.TestModeSelector.exposeTestFunctionNames = function() {
    return [ 'testModuleContents'
           , 'testInitialModel'
           , 'testInitialElem'
           //, 'testSetValue'
           //, 'testSetValueEvent'
           ];
};

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestModeSelector.prototype.toString = function() {
    return 'TestModeSelector';
};

/**
 *  Set up function for webbrick.widgets.TestModeSelector.
 */
webbrick.widgets.TestModeSelector.prototype.setUp = function() {
    var elem = null;
    logInfo("TestModeSelector.setUp");
    // Instantiate a local event router
    this.router = webbrick.widgets.getLocalEventRouter();
    // Set up the ModeSelector widget
    try {
        var html =
            "<ModeSelectorWidget InitializeWidget='ModeSelector_Init' SelectionName='TestSelection'>"+
            "  <ModeSelectorBody>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='SelectionName' value='1'>"+
            "        Selection[1]"+
            "      </input>"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='SelectionName' value='3'>"+
            "        Selection[2]"+
            "      </input>"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='SelectionName' value='5'>"+
            "        Selection[3]"+
            "      </input>"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='SelectionName' value='7'>"+
            "        Selection[4]"+
            "      </input>"+
            "    </ModeSelectorButton>"+
            "  </ModeSelectorBody>"+
            "</ModeSelectorWidget>";
        var div = document.createElement('div');
        div.innerHTML = html;
        elem = div.getElementsByTagName('ModeSelectorWidget')[0];
    } catch (e) {
        logError("TestModeSelector.setUp: document.createElement('div') error, "+e.name+", "+e.message);
    }
    logDebug("TestModeSelector.setUp: elem: "+elem);
    if (elem == null) {
        logError("TestModeSelector.setUp: elem is null");
    }
    try {
        this.widget = webbrick.widgets.ModeSelector_Init(elem);
        this.model  = this.widget._model;
        this.elem   = elem;     // this.widget._elem;
    } catch (e) {
        logError("setUp new ModeSelector error, "+e.name+", "+e.message);
    }
    logDebug("TestModeSelector.setUp: done");
};

/**
 *  Tear down function for webbrick.widgets.TestModeSelector.
 */
webbrick.widgets.TestModeSelector.prototype.tearDown = function() {
    try {
        logInfo("TestModeSelector.tearDown");
    } catch (e) {
        logError("TestModeSelector.tearDown: error, "+e.name+", "+e.message);
    }
};

/**
 *  Compare widget class with supplied value, ensuring that other 
 *  display classes are not present.
 */
webbrick.widgets.TestModeSelector.prototype.compareElementClass = function(expected) {
    return webbrick.widgets.testClassValues(this.elem, expected, 
        [ "ModeSelector_normal"
        , "ModeSelector_pending"
        , "ModeSelector_unknown"
        ] );
};

/**
 *  Test that the contents of the webbrick.widgets.ModeSelector module have been defined.
 */
webbrick.widgets.TestModeSelector.prototype.testModuleContents = function() {
    var testname = "testModuleContents";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    assertNotUndefined(testname, "_model",      this.widget._model);
    assertNotUndefined(testname, "_renderer",   this.widget._renderer);
    assertNotUndefined(testname, "_collector",  this.widget._collector);
    assertNotUndefined(testname, "_subscribes", this.widget._subscribes);
};

/** 
 *  Test initial ModeSelector model content
 */
webbrick.widgets.TestModeSelector.prototype.testInitialModel = function() {
    var testname = "testInitialModel";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    logDebug(testname+": mode: "+this.model.get("MODE"));
    logDebug(testname+": button states: "+this.model.get("BUTTONSTATES"));
    assertEq(testname, this.model.get("MODE"), 0);
    assertEq(testname, this.model.get("BUTTONCOUNT"),       4);
    assertEquals(testname, this.model.get("BUTTONVALUES"),  [1,3,5,7]);
    assertEquals(testname, this.model.get("BUTTONSTATES"),  [false,false,false,false]);
    assertEq(testname, this.model.get("SelectionName"),     "TestSelection");
    assertEq(testname, this.model.get("Default"),           "_ModeSelector.Default");
    assertEq(testname, this.model.get("Subject"),           "_ModeSelector.Subject");
    assertEq(testname, this.model.get("SetModeEvent"),      "_ModeSelector.SetModeEvent");
};

/** 
 *  Test initial ModeSelector element values
 */
webbrick.widgets.TestModeSelector.prototype.testInitialElem = function() {
    var testname = "testInitialElem";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    logDebug(testname+": class: "+this.elem.className);
    logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug(testname+": text:  "+webbrick.widgets.getElementText(this.elem));

    // Main widget element
    assertEq(testname, MochiKit.DOM.getNodeAttribute(this.elem, "CurrentMode"), "0");
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));

    // Selection buttons
    for (var i = 0 ; i < 4 ; i++) {
        var valstr = (i+1).toString(); 
        assertEq(testname+": selection["+valstr+"].class: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i, "input"], "class"), 
                "modeselector-unknown");
        assertEq(testname+": selection["+valstr+"].name: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i, "input"], "name"), 
                "TestSelection");
        assertEq(testname+": selection["+valstr+"].value: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i, "input"], "value"), 
                valstr);
        assertEq(testname+": selection["+i+"].text: ", 
                webbrick.widgets.getElementTextByTagPath(this.elem, ["ModeSelectorButton", i, "input"]), 
                "Selection["+valstr+"]");
    };
    
};

/** 
 *  Test set value by direct setting of model
 */
webbrick.widgets.TestModeSelector.prototype.testSetValue = function() {
    var testname = "testSetValue";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Confirm initial element value
    //////////////////////////
    //// TODO: adjust as needed
    logDebug(testname+": value: "+webbrick.widgets.getElementText(this.elem));
    assertEq(testname+": value: ", 
            webbrick.widgets.getElementText(this.elem), "ModeSelector value here");
    ////logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq(testname+": value: ", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "ModeSelector value here");
    ////logDebug(testname+": class: "+MochiKit.DOM.getNodeAttribute(this.elem, "class"));
    ////assertEq(testname, null, this.compareElementClass("ModeSelector_unknown"));
    //////////////////////////
    
    // Test set new element value
    //////////////////////////
    //// TODO: adjust as needed
    this.model.set("VALUE", "new value");
    logDebug(testname+": value: "+webbrick.widgets.getElementText(this.elem));
    assertEq(testname+": value: ", 
            webbrick.widgets.getElementText(this.elem), "ModeSelector value here");
    ////logDebug(testname+": value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    ////assertEq(testname+": value: ", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "ModeSelector value here");
    ////logDebug(testname+": class: "+MochiKit.DOM.getNodeAttribute(this.elem, "class"));
    ////assertEq(testname, null, this.compareElementClass("ModeSelector_unknown"));
    //////////////////////////

    logDebug(testname+": complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestModeSelector.prototype.testSetValueEvent = function() {
    var testname = "testSetValueEvent";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    var setValueEvent = this.model.get("SetValueEvent");

    // Test initial element value
    logDebug(testname+": initial element value: "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq(testname+": value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "ModeSelector value here");
    assertEq(testname+": value", 
        webbrick.widgets.getElementText(this.elem), "ModeSelector value here");
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
