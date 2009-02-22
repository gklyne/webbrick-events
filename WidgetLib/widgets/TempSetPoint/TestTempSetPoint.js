// $Id: TestTempSetPoint.js $
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.TempSetPoint module.
 *
 * @version $Id: TestTempSetPoint.js 36 2009-01-09 15:24:30Z gk-google@ninebynine.org $
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
 * @requires webbrick.widgets.TempSetPoint
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
webbrick.require("webbrick.widgets.TempSetPoint");
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
 * Test suite for the webbrick.widgets.TempSetPoint module.
 */
webbrick.widgets.TestTempSetPoint = function() {
    return this;
};

// Specify order of tests: 
webbrick.widgets.TestTempSetPoint.exposeTestFunctionNames = function() {
    logInfo("TestTempSetPoint.exposeTestFunctionNames");
    return [ 'testModuleContents'
           , 'testInitialModel'
           , 'testInitialElem'
           , 'testModelSetDISPLAY'
           , 'testModelSetDISPLAYSTATE'
           , 'testModelSetCURRENT'
           , 'testModelSetCURRENTSTATE'
           , 'testModelSetTARGET'
           , 'testModelSetTARGETSTATE'
           , 'testModelSetMODE'
           , 'testModelSetMODETIMER'
           , 'testSetCurrentValue'
           //, 'testSetTarget'
           //, 'testSetMode'
           //, 'testSetCurrentEvent'
           //, 'testSetTargetEvent'
           //, 'testSetModeEvent'
           ];
}

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestTempSetPoint.prototype.toString = function() {
    return 'TestTempSetPoint';
};

/**
 *  Set up function for webbrick.widgets.TestTempSetPoint.
 */
webbrick.widgets.TestTempSetPoint.prototype.setUp = function() {
    var elem = null;
    logInfo("TestTempSetPoint.setUp");
    // Instantiate a local event router
    this.router = webbrick.widgets.getLocalEventRouter();
    // Set up the TempSetPoint widget
    try {
        var html =
          "<SetPointWidget>"+
            "<SetPointBody>"+
              "<SetPointDisplay class='tempsetpoint-unknown'>"+
                "<SetPointValue>"+
                  "<span class='tempsetpoint-unknown'>??.?</span>"+
                "</SetPointValue>"+
                "<SetPointState>"+
                  "<span class='tempsetpoint-current'>current</span>"+
                "</SetPointState>"+
              "</SetPointDisplay>"+
              "<SetPointButtons>"+
                "<SetPointUp>"+
                  "<button value='Up' name='Up' type='button'>"+
                    "<img alt='Increase set point' src='/widgets/bullet_arrow_up.png' />"+
                  "</button>"+
                "</SetPointUp>"+
                "<SetPointDown>"+
                  "<button value='Down' name='Down' type='button'>"+
                    "<img alt='Decrease set point' src='/widgets/bullet_arrow_down.png' />"+
                  "</button>"+
                "</SetPointDown>"+
              "</SetPointButtons>"+
            "</SetPointBody>"+
          "</SetPointWidget>";
        var div = document.createElement('div');
        div.innerHTML = html;
        elem = div.getElementsByTagName('SetPointWidget')[0];
    } catch (e) {
        logError("TestTempSetPoint.setUp: document.createElement('div') error, "+e.name+", "+e.message);
    }
    logDebug("TestTempSetPoint.setUp: elem: "+elem);
    if (elem == null) {
        logError("TestTempSetPoint.setUp: elem is null");
    }
    try {
        this.widget = webbrick.widgets.TempSetPoint_Init(elem);
        this.model  = this.widget._model;
        this.elem   = elem;     // this.widget._elem;
    } catch (e) {
        logError("setUp new TempSetPoint error, "+e.name+", "+e.message);
    }
    logDebug("TestTempSetPoint.setUp: done");
};

/**
 *  Tear down function for webbrick.widgets.TestTempSetPoint.
 */
webbrick.widgets.TestTempSetPoint.prototype.tearDown = function() {
    try {
        logInfo("TestTempSetPoint.tearDown");
    } catch (e) {
        logError("TestTempSetPoint.tearDown: error, "+e.name+", "+e.message);
    }
};

/**
 *  Test that the contents of the webbrick.widgets.TempSetPoint module have been defined.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModuleContents = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModuleContents ====");
    assertNotUndefined("testModuleContents", "_model",      this.widget._model);
    assertNotUndefined("testModuleContents", "_renderer",   this.widget._renderer);
    assertNotUndefined("testModuleContents", "_collector",  this.widget._collector);
    assertNotUndefined("testModuleContents", "_subscribes", this.widget._subscribes);
};

/** 
 *  Test initial TempSetPoint model content
 */
webbrick.widgets.TestTempSetPoint.prototype.testInitialModel = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testInitialModel ====");
    logDebug("testInitialModel: current value: "+this.model.get("CURRENT"));
    logDebug("testInitialModel: current value state: "+this.model.get("CURRENTSTATE"));
    logDebug("testInitialModel: target value: "+this.model.get("TARGET"));
    logDebug("testInitialModel: target value state: "+this.model.get("TARGETSTATE"));
    logDebug("testInitialModel: mode: "+this.model.get("MODE"));
    logDebug("testInitialModel: mode timer: "+this.model.get("MODETIMER"));
    assertEq("testInitialModel", this.model.get("DISPLAY"), "??.?");
    assertEq("testInitialModel", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq("testInitialModel", this.model.get("CURRENT"), "??.?");
    assertEq("testInitialModel", this.model.get("CURRENTSTATE"), "unknown");
    assertEq("testInitialModel", this.model.get("TARGET"), "??.?");
    assertEq("testInitialModel", this.model.get("TARGETSTATE"), "unknown");
    assertEq("testInitialModel", this.model.get("MODE"), "current");
    assertEq("testInitialModel", this.model.get("MODETIMER"), 0);
    assertEq("testInitialModel", this.model.get("SetCurrentEvent"),     "_TempSetPoint.SetCurrentEvent");
    assertEq("testInitialModel", this.model.get("SetTargetEvent"),      "_TempSetPoint.SetTargetEvent");
    assertEq("testInitialModel", this.model.get("SetModeEvent"),        "_TempSetPoint.SetModeEvent");
    assertEq("testInitialModel", this.model.get("TargetChangeEvent"),   "_TempSetPoint.TargetChangeEvent");
    assertEq("testInitialModel", this.model.get("TargetChangeSource"),  "_TempSetPoint.TargetChangeSource");
    assertEq("testInitialModel", this.model.get("ClockTickEvent"),      "_TempSetPoint.ClockTickEvent_OverrideMe");    
};

/**
 *  Compare widget class with supplied value, ensuring that other 
 *  display classes are not present.
 */
webbrick.widgets.TestTempSetPoint.prototype.compareElementClass = function(elem, expected) {
    return webbrick.widgets.testClassValues(elem, expected, 
        [ "tempsetpoint-normal"
        , "tempsetpoint-pending"
        , "tempsetpoint-unknown"
        ] );
};

/** 
 *  Test initial TempSetPoint element values
 */
webbrick.widgets.TestTempSetPoint.prototype.testInitialElem = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testInitialElem ====");
    logDebug("testInitialElem: class: "+this.elem.className);
    logDebug("testInitialElem: value: "+MochiKit.DOM.getNodeAttribute(this.elem, "value"));
    logDebug("testInitialElem: text:  "+webbrick.widgets.getElementText(this.elem));
    // test:
    // element is widget
    //  <SetPointWidget>
    //    <SetPointBody>
    //      <SetPointDisplay class="tempsetpoint-unknown">
    //        <SetPointValue>
    //          <span class="tempsetpoint-unknown">
    //            ??.?
    //        <SetPointState>
    //          <span class="tempsetpoint-unknown">
    //            current
    //        </SetPointState>
    //      </SetPointDisplay>
    //      <SetPointButtons>
    //        <SetPointUp>
    //          <button ...>
    //        <SetPointDown>
    //          <button ...>

    assertEq("testInitialElem", this.elem.nodeName, "SetPointWidget".toUpperCase());
    var spbody = this.elem.childNodes[0];
    assertEq("testInitialElem", spbody.nodeName, "SetPointBody".toUpperCase());

    var spdisp = spbody.childNodes[0];
    assertEq("testInitialElem", spdisp.nodeName, "SetPointDisplay".toUpperCase());
    assertEq("testInitialElem", null, this.compareElementClass(spdisp, "tempsetpoint-unknown"));
    
    var spvalu = spdisp.childNodes[0];
    assertEq("testInitialElem", spvalu.nodeName, "SetPointValue".toUpperCase());
    assertEq("testInitialElem", null, this.compareElementClass(spvalu.childNodes[0], "tempsetpoint-unknown"));
    assertEq("testInitialElem", spvalu.childNodes[0].childNodes[0].nodeValue, "??.?");
    
    var spstat = spdisp.childNodes[1];
    assertEq("testInitialElem", spstat.nodeName, "SetPointState".toUpperCase());    
    assertEq("testInitialElem", null, this.compareElementClass(spstat.childNodes[0], "tempsetpoint-current"));
    assertEq("testInitialElem", spstat.childNodes[0].childNodes[0].nodeValue, "current");
    
    var spbutt = spbody.childNodes[1];
    assertEq("testInitialElem", spbutt.nodeName, "SetPointButtons".toUpperCase());
    
    var spup   = spbutt.childNodes[0];
    assertEq("testInitialElem", spup.nodeName, "SetPointUp".toUpperCase());
    assertEq("testInitialElem", spup.childNodes[0].nodeName, "button".toUpperCase());
    
    var spdown = spbutt.childNodes[1];
    assertEq("testInitialElem", spdown.nodeName, "SetPointDown".toUpperCase());
    assertEq("testInitialElem", spdown.childNodes[0].nodeName, "button".toUpperCase());

    // Final test of value extraction by library function
    var spvalutxt = webbrick.widgets.getElementTextByTagPath(spdisp, ['SetPointValue','span'])
    assertEq("testInitialElem: ", spvalutxt, "??.?");

    var spvalucls = webbrick.widgets.getAttributeByTagPath(spdisp, ['SetPointValue','span'], 'class')
    assertEq("testInitialElem: ", spvalucls, "tempsetpoint-unknown");

    logDebug("testInitialElem: complete");
};

/** 
 *  Test set displayed value by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetDISPLAY = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetDISPLAY ====");

    // Confirm initial current value
    var spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    assertEq("testModelSetDISPLAY: ", spvalutxt, "??.?");
    
    // Test set new element value
    this.model.set("DISPLAY", "new value");
    spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    logDebug("set new current value: "+spvalutxt);
    assertEq("testModelSetDISPLAY: ", spvalutxt, "new value");

    logDebug("testModelSetDISPLAY: complete");
};

/** 
 *  Test set displayed value state by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetDISPLAYSTATE = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetDISPLAYSTATE ====");

    // Confirm initial current value
    var cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetDISPLAYSTATE: ", cls, "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug("testModelSetDISPLAYSTATE: test invalid state raises error");
    try {
        this.model.set("DISPLAYSTATE", "invalid");
        assertFail("testModelSetDISPLAYSTATE: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetDISPLAYSTATE: Set invalid state OK");
        } else {
            assertFail("testModelSetDISPLAYSTATE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetDISPLAYSTATE: ", cls, "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("DISPLAYSTATE", "current");
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetDISPLAYSTATE: ", cls, "tempsetpoint-current");

    // Set value state to "target"
    this.model.set("DISPLAYSTATE", "target");
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetDISPLAYSTATE: ", cls, "tempsetpoint-target");

    // Set value state to "unknown"
    this.model.set("DISPLAYSTATE", "unknown");
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetDISPLAYSTATE: ", cls, "tempsetpoint-unknown");

    logDebug("testModelSetDISPLAYSTATE: complete");
};

/** 
 *  Test set current value by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetCURRENT = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetCURRENT ====");

    // Confirm initial display value
    var spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    assertEq("testModelSetCURRENT: ", spvalutxt, "??.?");
    
    // Test set new current value
    this.model.set("CURRENT", "new value");
    spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    assertEq("testModelSetCURRENT: ", spvalutxt, "??.?");

    logDebug("testModelSetCURRENT: complete");
};

/** 
 *  Test set current state by direct setting of model
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetCURRENTSTATE = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetCURRENTSTATE ====");

    // Confirm initial value display state
    var cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetCURRENTSTATE: ", cls, "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug("testModelSetCURRENTSTATE: test invalid state raises error");
    try {
        this.model.set("CURRENTSTATE", "invalid");
        assertFail("testModelSetCURRENTSTATE: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetCURRENTSTATE: Set invalid state OK");
        } else {
            assertFail("testModelSetCURRENTSTATE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetCURRENTSTATE: ", cls, "tempsetpoint-unknown");

    // Test setting target state
    logDebug("testModelSetCURRENTSTATE: test invalid state raises error");
    try {
        this.model.set("CURRENTSTATE", "target");
        assertFail("testModelSetCURRENTSTATE: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetCURRENTSTATE: Set invalid state OK");
        } else {
            assertFail("testModelSetCURRENTSTATE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetCURRENTSTATE: ", cls, "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("CURRENTSTATE", "current");
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetCURRENTSTATE: ", cls, "tempsetpoint-unknown");
    
    logDebug("testModelSetCURRENTSTATE: complete");
};

/** 
 *  Test set target value by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetTARGET = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetTARGET ====");

    // Confirm initial display value
    var spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    assertEq("testModelSetTARGET: ", spvalutxt, "??.?");
    
    // Test set new current value
    this.model.set("TARGET", "new value");
    spvalutxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span'])
    assertEq("testModelSetTARGET: ", spvalutxt, "??.?");

    logDebug("testModelSetTARGET: complete");
};

/** 
 *  Test set target state by direct setting of model
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetTARGETSTATE = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetTARGETSTATE ====");

    // Confirm initial value display state
    var cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetTARGETSTATE: ", cls, "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug("testModelSetTARGETSTATE: test invalid state raises error");
    try {
        this.model.set("TARGETSTATE", "invalid");
        assertFail("testSetState: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetTARGETSTATE: Set invalid state OK");
        } else {
            assertFail("testModelSetTARGETSTATE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetTARGETSTATE: ", cls, "tempsetpoint-unknown");

    // Test setting target state
    logDebug("testSetState: test invalid state raises error");
    try {
        this.model.set("TARGETSTATE", "current");
        assertFail("testModelSetTARGETSTATE: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetTARGETSTATE: Set invalid state OK");
        } else {
            assertFail("testModelSetTARGETSTATE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetTARGETSTATE: ", cls, "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("TARGETSTATE", "target");
    cls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class')
    assertEq("testModelSetTARGETSTATE: ", cls, "tempsetpoint-unknown");
    
    logDebug("testModelSetTARGETSTATE: complete");
};

/** 
 *  Test set display mode by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetMODE = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetMODE ====");

    // Confirm initial mode value and class
    var modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODE: ", modetxt, "current");
    var modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODE: ", modecls, "tempsetpoint-current");

    // Test setting invalid state
    logDebug("testModelSetMODE: test invalid mode raises error");
    try {
        this.model.set("MODE", "invalid");
        assertFail("testModelSetMODE: Set invalid mode - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetMODE: Set invalid state OK");
        } else {
            assertFail("testModelSetMODE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODE: ", modetxt, "current");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODE: ", modecls, "tempsetpoint-current");
    
    // Test setting target state
    logDebug("testModelSetMODE: test invalid mode raises error");
    try {
        this.model.set("MODE", "unknown");
        assertFail("testModelSetMODE: Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug("testModelSetMODE: Set invalid state OK");
        } else {
            assertFail("testModelSetMODE: Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODE: ", modetxt, "current");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODE: ", modecls, "tempsetpoint-current");
    
    // Set value state to "target"
    this.model.set("MODE", "target");
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODE: ", modetxt, "target");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODE: ", modecls, "tempsetpoint-target");
    
    // Set value state to "current"
    this.model.set("MODE", "current");
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODE: ", modetxt, "current");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODE: ", modecls, "tempsetpoint-current");
    
    logDebug("testModelSetMODE: complete");
};

/** 
 *  Test set mode timer by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetMODETIMER = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testModelSetMODETIMER ====");

    // Confirm initial mode value and class
    var modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODETIMER: ", modetxt, "current");
    var modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODETIMER: ", modecls, "tempsetpoint-current");
    
    // Test set new current value
    this.model.set("MODETIMER", 5);
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODETIMER: ", modetxt, "current");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODETIMER: ", modecls, "tempsetpoint-current");
    
    // Test set new current value
    this.model.set("MODETIMER", 0);
    modetxt = webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span'])
    assertEq("testModelSetMODETIMER: ", modetxt, "current");
    modecls = webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class')
    assertEq("testModelSetMODETIMER: ", modecls, "tempsetpoint-current");

    logDebug("testModelSetMODETIMER: complete");
};

/** 
 *  Test set current value through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetCurrentValue = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testSetCurrentValue ====");

    // Confirm initial values in model
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAY"),      "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENT"),      "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("TARGET"),       "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("MODE"),         "current");
    assertEq("testSetCurrentValue: ", this.model.get("MODETIMER"),    0);

    // Confirm initial values in renderer
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span']), 
            "??.?");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class'), 
            "tempsetpoint-unknown");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span']), 
            "current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class'), 
            "tempsetpoint-current");

    // Set new current value
    this.widget.setCurrentValue("11.1")

    // Confirm updated values in model
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAY"),      "11.1");
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAYSTATE"), "current");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENT"),      "11.1");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENTSTATE"), "current");
    assertEq("testSetCurrentValue: ", this.model.get("TARGET"),       "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("MODE"),         "current");
    assertEq("testSetCurrentValue: ", this.model.get("MODETIMER"),    0);

    // Confirm updated values in renderer
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span']), 
            "11.1");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class'), 
            "tempsetpoint-current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span']), 
            "current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class'), 
            "tempsetpoint-current");

    // Set new current value as floating point number
    this.widget.setCurrentValue(22.2)

    // Confirm updated values in model
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAY"),      "22.2");
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAYSTATE"), "current");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENT"),      "22.2");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENTSTATE"), "current");
    assertEq("testSetCurrentValue: ", this.model.get("TARGET"),       "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("MODE"),         "current");
    assertEq("testSetCurrentValue: ", this.model.get("MODETIMER"),    0);

    // Confirm updated values in renderer
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span']), 
            "22.2");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class'), 
            "tempsetpoint-current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span']), 
            "current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class'), 
            "tempsetpoint-current");

    // Set invalid current value
    this.widget.setCurrentValue("xx.x")

    // Confirm updated values in model
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAY"),      "xx.x");
    assertEq("testSetCurrentValue: ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENT"),      "xx.x");
    assertEq("testSetCurrentValue: ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("TARGET"),       "??.?");
    assertEq("testSetCurrentValue: ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq("testSetCurrentValue: ", this.model.get("MODE"),         "current");
    assertEq("testSetCurrentValue: ", this.model.get("MODETIMER"),    0);

    // Confirm updated values in renderer
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointValue','span']), 
            "xx.x");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointValue','span'], 'class'), 
            "tempsetpoint-unknown");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getElementTextByTagPath(this.elem, ['SetPointState','span']), 
            "current");
    assertEq("testSetCurrentValue: ", 
            webbrick.widgets.getAttributeByTagPath(this.elem, ['SetPointState','span'], 'class'), 
            "tempsetpoint-current");

    logDebug("testSetCurrent: complete");
};

// ------------------------------------------------------------------------
// TODO:
//, 'testSetTarget'
//, 'testSetMode'
//, 'testSetCurrentEvent'
//, 'testSetTargetEvent'
//, 'testSetModeEvent'
//------------------------------------------------------------------------

/** 
 *  Publish event helper function
 *
 *  Returns a deferred status value.
 */
// TODO: refactor this to common library code
webbrick.widgets.TestTempSetPoint.prototype.publishEvent = function 
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
webbrick.widgets.TestTempSetPoint.prototype.testSetStateEvent = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testSetStateEvent ====");
    var setStateEvent = this.model.get("SetStateEvent");

    // Confirm initial element class
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "unknown");
    assertEq("testSetStateEvent", null, this.compareElementClass("TempSetPoint_unknown"));

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
    assertEq("testSetStateEvent", null, this.compareElementClass("TempSetPoint_unknown"));

    // Test setting state to "normal"
    logDebug("testSetStateEvent: setting state to 'normal'");
    var sts = this.publishEvent(setStateEvent, "normal");
    assertEquals("testSetStateEvent: publishEvent(normal) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "normal");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "TempSetPoint value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "TempSetPoint value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("TempSetPoint_normal"));

    // Test setting state to "pending"
    logDebug("testSetStateEvent: setting state to 'pending'");
    var sts = this.publishEvent(setStateEvent, "pending");
    assertEquals("testSetStateEvent: publishEvent(pending) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "pending");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "TempSetPoint value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "TempSetPoint value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("TempSetPoint_pending"));

    // Test setting state to "unknown"
    logDebug("testSetStateEvent: setting state to 'unknown'");
    var sts = this.publishEvent(setStateEvent, "unknown");
    assertEquals("testSetStateEvent: publishEvent(unknown) sts", sts, StatusVal.OK);
    assertEq("testSetStateEvent: state", this.model.get("STATE"), "unknown");
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "TempSetPoint value here");
    assertEq("testSetStateEvent: value", 
        webbrick.widgets.getElementText(this.elem), "TempSetPoint value here");
    //////////////////////////
    assertEq("testSetStateEvent", null, this.compareElementClass("TempSetPoint_unknown"));

    logDebug("testSetStateEvent: complete");
};

/** 
 *  Test set value by publishing event
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetValueEvent = function() {
    logInfo("==== webbrick.widgets.TestTempSetPoint.testSetValueEvent ====");
    var setValueEvent = this.model.get("SetValueEvent");

    // Test initial element value
    logDebug("testSetValueEvent: initial element value: "+webbrick.widgets.getElementText(this.elem));
    //////////////////////////
    //// TODO: adjust as needed
    ////assertEq("testSetState: value", 
    ////    MochiKit.DOM.getNodeAttribute(this.elem, "value"), "TempSetPoint value here");
    assertEq("testSetValueEvent: value", 
        webbrick.widgets.getElementText(this.elem), "TempSetPoint value here");
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
