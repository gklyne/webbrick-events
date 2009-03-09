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
           //, 'testEventSetValue'
           // Test effect of input collector events:
           //, 'testButtonClick'
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
    assertEq(testname, this.model.get("STATE"),             "unknown");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 4),  undefined);
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));
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
    assertEq(testname, this.model.get("MODE"),                    0);
    assertEq(testname, this.model.get("STATE"),                   "unknown");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    
    // Set mode 1
    logDebug(testname+": set mode to 1");
    this.widget.setMode(1);
    assertEq(testname, this.model.get("MODE"),                    1);
    assertEq(testname, this.model.get("STATE"),                   "normal");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);

    // Set mode 3
    logDebug(testname+": set mode to 3");
    this.widget.setMode(3);
    assertEq(testname, this.model.get("MODE"),                    3);
    assertEq(testname, this.model.get("STATE"),                   "normal");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);

    // Set mode 5
    logDebug(testname+": set mode to 5");
    this.widget.setMode(5);
    assertEq(testname, this.model.get("MODE"),                    5);
    assertEq(testname, this.model.get("STATE"),                   "normal");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  true);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);

    // Set mode 7
    logDebug(testname+": set mode to 7");
    this.widget.setMode(7);
    assertEq(testname, this.model.get("MODE"),                    7);
    assertEq(testname, this.model.get("STATE"),                   "normal");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  true);

    // Set mode 2
    logDebug(testname+": set mode to 2");
    this.widget.setMode(2);
    assertEq(testname, this.model.get("MODE"),                    2);
    assertEq(testname, this.model.get("STATE"),                   "unknown");
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 0),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 1),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 2),  false);
    assertEq(testname, this.model.getIndexed("BUTTONSTATES", 3),  false);
    
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
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));
    
    // Set mode 1
    logDebug(testname+": set mode to 1");
    this.widget.setMode(1);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 3]));

    // Set mode 3
    logDebug(testname+": set mode to 3");
    this.widget.setMode(3);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 3]));

    // Set mode 5
    logDebug(testname+": set mode to 5");
    this.widget.setMode(5);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 3]));

    // Set mode 7
    logDebug(testname+": set mode to 7");
    this.widget.setMode(7);
    assertEq(testname, null, this.compareElementClass("modeselector-normal"));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-normal",   ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-selected", ["ModeSelectorButton", 3]));

    // Set mode 2
    logDebug(testname+": set mode to 2");
    this.widget.setMode(2);
    assertEq(testname, null, this.compareElementClass("modeselector-unknown"));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 0]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 1]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 2]));
    assertEq(testname, null, this.compareElementClass("modeselector-unknown", ["ModeSelectorButton", 3]));
    
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
