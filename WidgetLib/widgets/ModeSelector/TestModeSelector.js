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
           // Test effect of setting various model values:
           , 'testModelSetMODE'
           , 'testModelSetSTATE'
           , 'testModelSetBUTTONSTATES'
           // Test effect on model of calling controller functions:
           , 'testControllerSetModeModel'
           // Test effect on renderer of calling controller functions:
           , 'testControllerSetModeRender'
           // Test effect of controller events:
           , 'testEventSetMode'
           // Test effect of input collector events:
           , 'testButtonClick'
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
            "      <input type='radio' name='TestSelection' value='1'/>"+
            "      Selection[1]"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='TestSelection' value='3'/>"+
            "      Selection[2]"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='TestSelection' value='5'/>"+
            "      Selection[3]"+
            "    </ModeSelectorButton>"+
            "    <ModeSelectorButton class='modeselector-unknown'>"+
            "      <input type='radio' name='TestSelection' value='7'/>"+
            "      Selection[4]"+
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
        this.widget    = webbrick.widgets.ModeSelector_Init(elem);
        this.model     = this.widget._model;
        this.collector = this.widget._collector;
        this.elem      = elem;     // this.widget._elem;
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
webbrick.widgets.TestModeSelector.prototype.compareElementClass = function(expected, path) {
    var elem = this.elem;
    if (path != undefined) {
        elem = webbrick.widgets.getElementByTagPath(elem, path);
        if (elem == null) {
            return "compareElementClass "+expected+", no element at ["+path+"]";
        };
    };
    return webbrick.widgets.testClassValues(elem, expected, 
        [ "modeselector-unknown"
        , "modeselector-normal"
        , "modeselector-selected"
        ] );
};

/**
 *  Helper function to test model state settings 
 */
webbrick.widgets.TestModeSelector.prototype.checkModelValues =
function(testname, subtest, selectedlist, modeval, stateval) {
    logDebug("checkModelValues("+subtest+"): selectedlist: "+selectedlist+
        ", modeval: "+modeval+", stateval: "+stateval);
    assertEq(testname+"("+subtest+")", this.model.get("MODE"),  modeval);
    assertEq(testname+"("+subtest+")", this.model.get("STATE"), stateval);
    for (var i = 0 ; i < 4 ; i++) {
        assertEq(testname+"("+subtest+")", this.model.getIndexed("BUTTONSTATES", i),
            webbrick.widgets.contains(selectedlist, i));
    };
};

/**
 *  Helper function to test DOM renderer class settings 
 */
webbrick.widgets.TestModeSelector.prototype.checkClassValues =
function(testname, subtest, selectedlist, nonselectedclass, selectedclass) {
    logDebug("checkClassValues("+subtest+"): selectedlist: "+selectedlist+
        ", nonselectedclass: "+nonselectedclass+", selectedclass: "+selectedclass);
    assertEq(testname+"("+subtest+","+nonselectedclass+")", 
        null, this.compareElementClass(nonselectedclass));
    for (var i = 0 ; i < 4 ; i++) {
        var expect_class   = nonselectedclass;
        var expect_checked = false;
        if (webbrick.widgets.contains(selectedlist, i)) {
            expect_class = selectedclass;
            expect_checked = true;
        };
        assertEq(testname+"("+subtest+","+selectedclass+")", 
            null, 
            this.compareElementClass(expect_class, ["ModeSelectorButton", i]));
        var is_checked = webbrick.widgets.getElementByTagPath
            (this.elem, ["ModeSelectorButton", i, "input"]).checked;
        assertEq(testname+"("+subtest+",checked)", is_checked, expect_checked);
    };
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
    assertEq(testname, this.model.get("MODE"),              0);
    assertEq(testname, this.model.get("STATE"),             "unknown");
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
    var values = ["1","3","5","7"];
    for (var i = 0 ; i < 4 ; i++) {
        var valstr = (i+1).toString(); 
        assertEq(testname+": selection["+valstr+"].class: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i], "class"), 
                "modeselector-unknown");
        assertEq(testname+": selection["+valstr+"].name: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i, "input"], "name"), 
                "TestSelection");
        assertEq(testname+": selection["+valstr+"].value: ", 
                webbrick.widgets.getAttributeByTagPath(this.elem, ["ModeSelectorButton", i, "input"], "value"), 
                values[i]);
        assertEq(testname+": selection["+i+"].text: ", 
                webbrick.widgets.getElementTextByTagPath(this.elem, ["ModeSelectorButton", i]), 
                "Selection["+valstr+"]");
    };   
};

/** 
 *  Test set mode by direct setting of model
 */
webbrick.widgets.TestModeSelector.prototype.testModelSetMODE = function() {
    var testname = "testModelSetMODE";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Confirm initial values
    assertEq(testname, this.model.get("MODE"),              0);
    assertEq(testname, MochiKit.DOM.getNodeAttribute(this.elem, "CurrentMode"), "0");
    
    // Test set new mode value
    logDebug(testname+": set MODE to 1 (integer)");
    this.model.set("MODE", 1);
    assertEq(testname, MochiKit.DOM.getNodeAttribute(this.elem, "CurrentMode"), "1");
    
    // Test set new mode value
    logDebug(testname+": set MODE to '2' (string)");
    this.model.set("MODE", '2');
    assertEq(testname, MochiKit.DOM.getNodeAttribute(this.elem, "CurrentMode"), "2");

    logDebug(testname+": complete");
};

/** 
 *  Test set widget state by direct setting of model
 */
webbrick.widgets.TestModeSelector.prototype.testModelSetSTATE = function() {
    var testname = "testModelSetSTATE";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Confirm initial values
    assertEq(testname, this.model.get("STATE"),             "unknown");
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));
    
    // Test set new mode value
    logDebug(testname+": set STATE to 'normal'");
    this.model.set("STATE", 'normal');
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    
    // Test set invalid mode value
    logDebug(testname+": test invalid state raises error");
    try {
        logDebug(testname+": set STATE to 'invalid'");
        this.model.set("STATE", 'invalid');
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    
    logDebug(testname+": complete");
};

/** 
 *  Test set button state by direct setting of model
 */
webbrick.widgets.TestModeSelector.prototype.testModelSetBUTTONSTATES = function() {
    var testname = "testModelSetBUTTONSTATES";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Confirm initial values
    this.checkModelValues(testname, "init", [], 0, "unknown");
    this.checkClassValues(testname, "init", [], "modeselector-unknown", "modeselector-selected");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 4),  undefined);
    assertEquals(testname, ["modeselector-unknown","modeselector-selected"], 
            this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 0]));
    
    // Select button values values with overall state unknown
    logDebug(testname+": set BUTTONSTATES[0][2] to true");
    this.model.setIndexed("BUTTONSTATES", 0, true);
    this.model.setIndexed("BUTTONSTATES", 2, true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));

    // Set widget STATE to normal
    logDebug(testname+": set STATE to 'normal'");
    this.model.set("STATE", 'normal');
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));

    // Set BUTTONSTATE[0]
    logDebug(testname+": set BUTTONSTATES[0] to false");
    this.model.setIndexed("BUTTONSTATES", 0, false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",  ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));

    // Set BUTTONSTATE[1]
    logDebug(testname+": set BUTTONSTATES[1] to true");
    this.model.setIndexed("BUTTONSTATES", 1, true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);    
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown",  ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown",  ["ModeSelectorButton", 3]));
    
    // Set BUTTONSTATE[2]
    logDebug(testname+": set BUTTONSTATES[2] to false");
    this.model.setIndexed("BUTTONSTATES", 2, false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown",  ["ModeSelectorButton", 3]));
    
    // Set BUTTONSTATE[3]
    logDebug(testname+": set BUTTONSTATES[3] to true");
    this.model.setIndexed("BUTTONSTATES", 3, true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  true);    
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 3]));
    
    logDebug(testname+": complete");
};

/** 
 *  Test controller set mode effect on model 
 */
webbrick.widgets.TestModeSelector.prototype.testControllerSetModeModel = function() {
    var testname = "testControllerSetModeModel";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Set mode 0
    logDebug(testname+": set mode to 0");
    this.widget.setMode(0);
    this.checkModelValues(testname, "init", [], 0, "unknown");
    
    // Set mode 1
    logDebug(testname+": set mode to 1");
    this.widget.setMode(1);
    this.checkModelValues(testname, "1", [0], 1, "normal");

    // Set mode 3
    logDebug(testname+": set mode to 3");
    this.widget.setMode(3);
    this.checkModelValues(testname, "3", [1], 3, "normal");

    // Set mode 5
    logDebug(testname+": set mode to 5");
    this.widget.setMode(5);
    this.checkModelValues(testname, "5", [2], 5, "normal");

    // Set mode 7
    logDebug(testname+": set mode to 7");
    this.widget.setMode(7);
    this.checkModelValues(testname, "7", [3], 7, "normal");

    // Set mode 2
    logDebug(testname+": set mode to 2");
    this.widget.setMode(2);
    this.checkModelValues(testname, "2", [], 2, "unknown");
    
    logDebug(testname+": complete");
};

/** 
 *  Test controller set mode effect on renderer 
 */
webbrick.widgets.TestModeSelector.prototype.testControllerSetModeRender = function() {
    var testname = "testControllerSetModeRender";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");

    // Set mode 0
    logDebug(testname+": set mode to 0");
    this.widget.setMode(0);
    this.checkClassValues(testname, "init", [], "modeselector-unknown", "modeselector-selected");
    
    // Set mode 1
    logDebug(testname+": set mode to 1");
    this.widget.setMode(1);
    this.checkClassValues(testname, "1", [0], "modeselector-normal", "modeselector-selected");

    // Set mode 3
    logDebug(testname+": set mode to 3");
    this.widget.setMode(3);
    this.checkClassValues(testname, "3", [1], "modeselector-normal", "modeselector-selected");

    // Set mode 5
    logDebug(testname+": set mode to 5");
    this.widget.setMode(5);
    this.checkClassValues(testname, "5", [2], "modeselector-normal", "modeselector-selected");

    // Set mode 7
    logDebug(testname+": set mode to 7");
    this.widget.setMode(7);
    this.checkClassValues(testname, "7", [3], "modeselector-normal", "modeselector-selected");

    // Set mode 2
    logDebug(testname+": set mode to 2");
    this.widget.setMode(2);
    this.checkClassValues(testname, "2", [], "modeselector-unknown", "modeselector-selected");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestModeSelector.prototype.testEventSetMode = function() {
    var testname = "testEventSetMode";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    var sourceIdent  = this.model.get("Subject");
    var setModeEvent = this.model.get("SetModeEvent");
    logDebug(testname+": sourceIdent: "+sourceIdent+", setModeEvent: "+setModeEvent);
    
    // Test initial model and element values
    logDebug(testname+": Test initial model and element values");
    this.checkModelValues(testname, "init", [], 0, "unknown");
    this.checkClassValues(testname, "init", [], "modeselector-unknown", "modeselector-selected");

    // Set element value to 1 (string)
    logDebug(testname+": Set element value to 1 (string)");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, "1");
    this.checkModelValues(testname, "1", [0], 1, "normal");
    this.checkClassValues(testname, "1", [0], "modeselector-normal", "modeselector-selected");

    // Set element value to 3 (integer)
    logDebug(testname+": Set element value to 3 (integer)");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, 3);
    this.checkModelValues(testname, "3", [1], 3, "normal");
    this.checkClassValues(testname, "3", [1], "modeselector-normal", "modeselector-selected");

    // Set element value to 2 (string)
    logDebug(testname+": Set element value to 2 (string)");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, "2");
    this.checkModelValues(testname, "2", [], 2, "unknown");
    this.checkClassValues(testname, "2", [], "modeselector-unknown", "modeselector-selected");
    
    logDebug(testname+": complete");
};

/** 
 *  Construct an opbject that looks somewhat like a MochiKit button click event
 *  originating from a sub-element at the indicated path from the widget element
 */
webbrick.widgets.TestModeSelector.prototype.makeButtonClickEvent = function(path) {
    var target = webbrick.widgets.getElementByTagPath(this.elem, path);
    if (target == undefined) {
        target = document.createElement('div');
    };
    return {
        type:   function()  { return "click" }, 
        target: function()  { return target; }, 
        stop:   function()  {}
    };
};

/** 
 *  Test button click handler
 */
webbrick.widgets.TestModeSelector.prototype.testButtonClick = function() {
    var testname = "testButtonClick";
    logInfo("==== webbrick.widgets.TestModeSelector."+testname+" ====");
    var event = null;
    
    // Test initial model and element values
    logDebug(testname+": Test initial model and element values");
    this.checkModelValues(testname, "init", [], 0, "unknown");
    this.checkClassValues(testname, "init", [], "modeselector-unknown", "modeselector-selected");

    // Simulate Click on mode '5'
    logDebug(testname+": Click on mode '5'");
    event = this.makeButtonClickEvent(["ModeSelectorButton", 2])
    this.collector.ButtonClicked(event);    // simulate button-click
    this.checkModelValues(testname, "[2]=5", [2], 5, "normal");
    this.checkClassValues(testname, "[2]=5", [2], "modeselector-normal", "modeselector-selected");
    
    // Simulate Click on mode '1'
    logDebug(testname+": Click on mode '1'");
    event = this.makeButtonClickEvent(["ModeSelectorButton", 0])
    this.collector.ButtonClicked(event);    // simulate button-click
    this.checkModelValues(testname, "[0]=1", [0], 1, "normal");
    this.checkClassValues(testname, "[0]=1", [0], "modeselector-normal", "modeselector-selected");

    // Simulate Click on mode '7'
    logDebug(testname+": Click on mode '7'");
    event = this.makeButtonClickEvent(["ModeSelectorButton", 3, "input"])
    this.collector.ButtonClicked(event);    // simulate button-click
    this.checkModelValues(testname, "[3]=7", [3], 7, "normal");
    this.checkClassValues(testname, "[3]=7", [3], "modeselector-normal", "modeselector-selected");

    // Simulate Click on mode 'unknown' - no change
    logDebug(testname+": Click on mode [9]=unknown");
    event = this.makeButtonClickEvent(["ModeSelectorButton", 9])
    this.collector.ButtonClicked(event);    // simulate button-click
    this.checkModelValues(testname, "[9]=?7", [3], 7, "normal");
    this.checkClassValues(testname, "[9]=?7", [3], "modeselector-normal", "modeselector-selected");

    // Force to undefined and repeat last test
    logDebug(testname+": Set undefined, then click on undefined button");
    this.widget.setMode(0);
    event = this.makeButtonClickEvent(["ModeSelectorButton", 9])
    this.collector.ButtonClicked(event);    // simulate button-click
    this.checkModelValues(testname, "[9]=?0", [], 0, "unknown");
    this.checkClassValues(testname, "[9]=?0", [], "modeselector-unknown", "modeselector-selected");
   
    logDebug(testname+": complete");
};

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
