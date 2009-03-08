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

// Shortcuts (defined with Widget functions)
// var logDebug   = MochiKit.Logging.logDebug;
// var logInfo    = MochiKit.Logging.log;
// var logWarning = MochiKit.Logging.logWarning;
// var logError   = MochiKit.Logging.logError;

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
           , 'testSetCurrentValueModel'
           , 'testSetCurrentValueRender'
           , 'testSetTargetValueModel'
           , 'testSetTargetValueRender'
           , 'testSetModeModel'
           , 'testSetModeRender'
           , 'testSetModeTimerModel'
           , 'testSetModeTimerRender'
           , 'testSetCurrentValueEvent'
           , 'testSetTargetValueEvent'
           , 'testSetTargetModeEvent'
           , 'testClockTickEvent'
           , 'testButtonClick'
           , 'testButtonClickExtendsTargetMode'
           ];
    return [ 'testModuleContents'
             , 'testInitialModel'
             , 'testInitialElem'
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
                "<SetPointValue class='tempsetpoint-unknown'>"+
                  "??.?"+
                "</SetPointValue>"+
                "<SetPointState class='tempsetpoint-unknown'>"+
                  "current"+
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
 *  Retrieve widget element text 
 */
webbrick.widgets.TestTempSetPoint.prototype.getElement = function(path) {
    return webbrick.widgets.getElementTextByTagPath(this.elem, path);
};

/**
 *  Retrieve widget element attribute 
 */
webbrick.widgets.TestTempSetPoint.prototype.getAttribute = function(path, attr) {
    return webbrick.widgets.getAttributeByTagPath(this.elem, path, attr);
};

/**
 *  Retrieve widget element class 
 */
webbrick.widgets.TestTempSetPoint.prototype.getClass = function(path) {
    return this.getAttribute(path, 'class');
};

/**
 *  Compare widget class with supplied value, ensuring that other 
 *  display classes are not present.
 */
webbrick.widgets.TestTempSetPoint.prototype.compareElementClass = function(elem, expected) {
    return webbrick.widgets.testClassValues(elem, expected, 
        [ "tempsetpoint-unknown"
        , "tempsetpoint-current"
        , "tempsetpoint-target"
        ] );
};

/**
 *  Test that the contents of the webbrick.widgets.TempSetPoint module have been defined.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModuleContents = function() {
    var testname = "testModuleContents";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    assertNotUndefined(testname+": ", "_model",      this.widget._model);
    assertNotUndefined(testname+": ", "_renderer",   this.widget._renderer);
    assertNotUndefined(testname+": ", "_collector",  this.widget._collector);
    assertNotUndefined(testname+": ", "_subscribes", this.widget._subscribes);
};

/** 
 *  Test initial TempSetPoint model content
 */
webbrick.widgets.TestTempSetPoint.prototype.testInitialModel = function() {
    var testname = "testInitialModel";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    logDebug(testname+": current value: "+this.model.get("CURRENT"));
    logDebug(testname+": current value state: "+this.model.get("CURRENTSTATE"));
    logDebug(testname+": target value: "+this.model.get("TARGET"));
    logDebug(testname+": target value state: "+this.model.get("TARGETSTATE"));
    logDebug(testname+": mode: "+this.model.get("MODE"));
    logDebug(testname+": mode timer: "+this.model.get("MODETIMER"));
    assertEq(testname+": ", this.model.get("DISPLAY"), "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"), "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"), "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("MODE"), "current");
    assertEq(testname+": ", this.model.get("MODETIMER"), 0);
    assertEq(testname+": ", this.model.get("SetCurrentValueEvent"),    "_TempSetPoint.SetCurrentValueEvent");
    assertEq(testname+": ", this.model.get("SetTargetValueEvent"),     "_TempSetPoint.SetTargetValueEvent");
    assertEq(testname+": ", this.model.get("SetTargetModeEvent"),      "_TempSetPoint.SetTargetModeEvent");
    assertEq(testname+": ", this.model.get("Subject"),                 "http://id.webbrick.co.uk/source/TempSetPoint_Subject");
    assertEq(testname+": ", this.model.get("TargetChangeEvent"),       "_TempSetPoint.TargetChangeEvent");
    assertEq(testname+": ", this.model.get("TargetChangeSource"),      "_TempSetPoint.TargetChangeSource");
    assertEq(testname+": ", this.model.get("ClockTickEvent"),          "http://id.webbrick.co.uk/events/ClockTickEventType_second");
    //assertEq(testname+": ", this.model.get("ClockTickEvent"),          "_TempSetPoint.ClockTickEvent_OverrideMe");
};

/** 
 *  Test initial TempSetPoint element values
 */
webbrick.widgets.TestTempSetPoint.prototype.testInitialElem = function() {
    var testname = "testInitialElem";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // test:
    // element is widget
    //  <SetPointWidget>
    //    <SetPointBody>
    //      <SetPointDisplay class="tempsetpoint-unknown">
    //        <SetPointValue class="tempsetpoint-unknown">
    //          ??.?
    //        <SetPointState class="tempsetpoint-current">
    //          current
    //        </SetPointState>
    //      </SetPointDisplay>
    //      <SetPointButtons>
    //        <SetPointUp>
    //          <button ...>
    //        <SetPointDown>
    //          <button ...>

    assertEq(testname+": ", this.elem.nodeName, "SetPointWidget".toUpperCase());
    var spbody = this.elem.childNodes[0];
    assertEq(testname+": ", spbody.nodeName, "SetPointBody".toUpperCase());

    var spdisp = spbody.childNodes[0];
    logDebug(testname+": spdisp class: "+spdisp.className);
    logDebug(testname+": spdisp text:  "+webbrick.widgets.getElementText(spdisp));
    assertEq(testname+": ", spdisp.nodeName, "SetPointDisplay".toUpperCase());
    assertEq(testname+": ", null, this.compareElementClass(spdisp, "tempsetpoint-unknown"));
    
    var spvalu = spdisp.childNodes[0];
    logDebug(testname+": spvalu class: "+spvalu.className);
    logDebug(testname+": spvalu text:  "+webbrick.widgets.getElementText(spvalu));
    assertEq(testname+": ", spvalu.nodeName, "SetPointValue".toUpperCase());
    assertEq(testname+": ", null, this.compareElementClass(spvalu, "tempsetpoint-unknown"));
    assertEq(testname+": ", spvalu.childNodes[0].nodeValue, "??.?");
    
    var spstat = spdisp.childNodes[1];
    logDebug(testname+": spstat class: "+spstat.className);
    logDebug(testname+": spstat text:  "+webbrick.widgets.getElementText(spstat));
    assertEq(testname+": ", spstat.nodeName, "SetPointState".toUpperCase());    
    assertEq(testname+": ", null, this.compareElementClass(spstat, "tempsetpoint-current"));
    assertEq(testname+": ", spstat.childNodes[0].nodeValue, "current");
    
    var spbutt = spbody.childNodes[1];
    assertEq(testname+": ", spbutt.nodeName, "SetPointButtons".toUpperCase());
    
    var spup   = spbutt.childNodes[0];
    assertEq(testname+": ", spup.nodeName, "SetPointUp".toUpperCase());
    assertEq(testname+": ", spup.childNodes[0].nodeName, "button".toUpperCase());
    
    var spdown = spbutt.childNodes[1];
    assertEq(testname+": ", spdown.nodeName, "SetPointDown".toUpperCase());
    assertEq(testname+": ", spdown.childNodes[0].nodeName, "button".toUpperCase());

    // Final test of value extraction by library function
    var spvalutxt = webbrick.widgets.getElementTextByTagPath(spdisp, ['SetPointValue']);
    assertEq(testname+": ", spvalutxt, "??.?");

    var spvalucls = webbrick.widgets.getAttributeByTagPath(spdisp, ['SetPointValue'], 'class');
    assertEq(testname+":d ", spvalucls, "tempsetpoint-unknown");

    logDebug(testname+": complete");
};

/** 
 *  Test set displayed value by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetDISPLAY = function() {
    var testname = "testModelSetDISPLAY";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial current value
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    
    // Test set new element value
    this.model.set("DISPLAY", "new value");
    logDebug(testname+": set new current value: "+this.getElement(['SetPointValue']));
    assertEq(testname+": ", this.getElement(['SetPointValue']), "new value");

    logDebug(testname+": complete");
};

/** 
 *  Test set displayed value state by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetDISPLAYSTATE = function() {
    var testname = "testModelSetDISPLAYSTATE";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial state
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug(testname+": test invalid state raises error");
    try {
        this.model.set("DISPLAYSTATE", "invalid");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("DISPLAYSTATE", "current");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");

    // Set value state to "target"
    this.model.set("DISPLAYSTATE", "target");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");

    // Set value state to "unknown"
    this.model.set("DISPLAYSTATE", "unknown");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    logDebug(testname+": complete");
};

/** 
 *  Test set current value by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetCURRENT = function() {
    var testname = "testModelSetCURRENT";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial display value
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    
    // Test set new current value
    this.model.set("CURRENT", "new value");
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");

    logDebug(testname+": complete");
};

/** 
 *  Test set current state by direct setting of model
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetCURRENTSTATE = function() {
    var testname = "testModelSetCURRENTSTATE";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial value display state
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug(testname+": test invalid state raises error");
    try {
        this.model.set("CURRENTSTATE", "invalid");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    // Test setting target state
    logDebug(testname+": test invalid state raises error");
    try {
        this.model.set("CURRENTSTATE", "target");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("CURRENTSTATE", "current");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set target value by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetTARGET = function() {
    var testname = "testModelSetTARGET";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial display value
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    
    // Test set new current value
    this.model.set("TARGET", "new value");
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");

    logDebug(testname+": complete");
};

/** 
 *  Test set target state by direct setting of model
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetTARGETSTATE = function() {
    var testname = "testModelSetTARGETSTATE";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial value display state
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    // Test setting invalid state
    logDebug(testname+": test invalid state raises error");
    try {
        this.model.set("TARGETSTATE", "invalid");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");

    // Test setting target state
    logDebug(testname+": test invalid state raises error");
    try {
        this.model.set("TARGETSTATE", "current");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    
    // Set value state to "current"
    this.model.set("TARGETSTATE", "target");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set display mode by direct setting of model
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetMODE = function() {
    var testname = "testModelSetMODE";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial mode value and class
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Test setting invalid state
    logDebug(testname+": test invalid mode raises error");
    try {
        this.model.set("MODE", "invalid");
        assertFail(testname+": Set invalid mode - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    // Test setting target state
    logDebug(testname+": test invalid mode raises error");
    try {
        this.model.set("MODE", "unknown");
        assertFail(testname+": Set invalid state - exception expected");
    } catch (e) {
        if (e.name == "InvalidPropertyValuePairError") {
            logDebug(testname+": Set invalid state OK");
        } else {
            assertFail(testname+": Set invalid state - wrong exception: "+e.name+", "+e.message);
        }
    }
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    // Set value state to "target"
    logDebug(testname+": set mode 'target'");
    this.model.set("MODE", "target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");
    
    // Set value state to "current"
    logDebug(testname+": set mode 'current'");
    this.model.set("MODE", "current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set mode timer by direct setting of model.  
 *  This is an internal value, and the renderer should not update.
 */
webbrick.widgets.TestTempSetPoint.prototype.testModelSetMODETIMER = function() {
    var testname = "testModelSetMODETIMER";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial mode value and class
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    // Test set new current value
    this.model.set("MODETIMER", 5);
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    // Test set new current value
    this.model.set("MODETIMER", 0);
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    logDebug(testname+": complete");
};

/** 
 *  Test set current value in model through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetCurrentValueModel = function() {
    var testname = "testSetCurrentValueModel";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set new current value
    this.widget.setCurrentValue("11.1");

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "11.1");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("CURRENT"),      "11.1");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set new current value as floating point number
    this.widget.setCurrentValue(22.2);

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "22.2");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("CURRENT"),      "22.2");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set invalid current value
    this.widget.setCurrentValue("xx.x");

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "xx.x");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "xx.x");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    logDebug(testname+": complete");
};

/** 
 *  Test set current value in renderer through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetCurrentValueRender = function() {
    var testname = "testSetCurrentValueRender";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value
    this.widget.setCurrentValue("11.1");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value as floating point number
    this.widget.setCurrentValue(22.2);

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set invalid current value
    this.widget.setCurrentValue("xx.x");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "xx.x");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    logDebug(testname+": complete");
};

/** 
 *  Test set current value in model through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetTargetValueModel = function() {
    var testname = "testSetTargetValueModel";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set new target value
    this.widget.setTargetValue("11.1");

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "11.1");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set new target value as floating point number
    this.widget.setTargetValue(22.2);

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "22.2");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set invalid target value
    this.widget.setTargetValue("xx.x");

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "??.?");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "xx.x");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    logDebug(testname+": complete");
};

/** 
 *  Test set current value in renderer through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetTargetValueRender = function() {
    var testname = "testSetTargetValueRender";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value
    this.widget.setTargetValue("11.1");

    // Confirm unchanged values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    logDebug(testname+": complete");
};

/** 
 *  Test set mode in model through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetModeModel = function() {
    var testname = "testSetModeModel";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Initialize and confirm initial values in model
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");
    
    assertEq(testname+": ", this.model.get("DISPLAY"),      "11.1");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("CURRENT"),      "11.1");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "22.2");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    assertEq(testname+": ", this.model.get("MODE"),         "current");

    // Set new mode
    this.widget.setMode("target")

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "22.2");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "target");
    assertEq(testname+": ", this.model.get("MODE"),         "target");

    // Set new mode
    this.widget.setMode("current")

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "11.1");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set mode in renderer through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetModeRender = function() {
    var testname = "testSetModeRender";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Initialize and confirm initial values in renderer
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new mode and confirm updated values in renderer
    this.widget.setMode("target")

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Set new mode and confirm updated values in renderer
    this.widget.setMode("current")

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    logDebug(testname+": complete");
};


/** 
 *  Test set mode timer in model through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetModeTimerModel = function() {
    var testname = "testSetModeTimerModel";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Initialize and confirm initial values in model
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");
    
    assertEq(testname+": ", this.model.get("DISPLAY"),      "11.1");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("CURRENT"),      "11.1");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "22.2");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);

    // Set new mode timer value
    this.widget.setModeTimer(5)

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "22.2");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "target");
    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),    5);

    // Set new mode timer value
    this.widget.setModeTimer(0)

    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("DISPLAY"),      "11.1");
    assertEq(testname+": ", this.model.get("DISPLAYSTATE"), "current");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);
    
    logDebug(testname+": complete");
};

/** 
 *  Test set mode timer in renderer through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetModeTimerRender = function() {
    var testname = "testSetModeTimerRender";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Initialize and confirm initial values in renderer
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new mode and confirm updated values in renderer
    this.widget.setModeTimer(5)

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Set new mode and confirm updated values in renderer
    this.widget.setModeTimer(0)

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    logDebug(testname+": complete");
};

/** 
 *  Test set current value in renderer through event publication
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetCurrentValueEvent = function() {
    var testname = "testSetCurrentValueEvent";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");
    var setValueEvent = this.model.get("SetCurrentValueEvent");
    var sourceIdent   = this.model.get("Subject");
    
    // Confirm initial values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    
    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value
    logDebug(testname+": setting current value to '11.1'");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, "11.1");
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "11.1");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    
    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value as floating point number
    logDebug(testname+": setting current value to 22.2");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, 22.2);
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "22.2");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value as integer number
    logDebug(testname+": setting current value to 33");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, 33);
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "33.0");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "33.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new current value as integer numeral string
    logDebug(testname+": setting current value to '44'");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, "44");
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "44.0");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "44.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set invalid current value
    logDebug(testname+": setting current value to 'xx.x'");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, "xx.x");
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "xx.x");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");

    // Confirm updated values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "xx.x");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    logDebug(testname+": complete");
};

/** 
 *  Test set target value in renderer through event publication
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetTargetValueEvent = function() {
    var testname = "testSetTargetValueEvent";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");
    var setValueEvent = this.model.get("SetTargetValueEvent");
    var sourceIdent   = this.model.get("Subject");
    
    // Confirm initial values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "??.?");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");
    
    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new target value
    logDebug(testname+": setting current value to '11.1'");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, "11.1");
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "11.1");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    
    // Confirm unchanged values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new target value as floating point number
    logDebug(testname+": setting current value to 22.2");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, 22.2);
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "22.2");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");

    // Confirm unchanged values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set invalid current value
    logDebug(testname+": setting current value to 'xx.x'");
    webbrick.widgets.publishEvent(sourceIdent, setValueEvent, "xx.x");
    
    // Confirm updated values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "??.?");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "unknown");
    assertEq(testname+": ", this.model.get("TARGET"),       "xx.x");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "unknown");

    // Confirm unchanged values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    logDebug(testname+": complete");
};

/** 
 *  Test set mode timer in renderer through widget controller method.
 */
webbrick.widgets.TestTempSetPoint.prototype.testSetTargetModeEvent = function() {
    var testname = "testSetTargetModeEvent";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");
    var setModeEvent = this.model.get("SetTargetModeEvent");
    var sourceIdent   = this.model.get("Subject");

    // Initialize and confirm initial values in renderer
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");
    
    assertEq(testname+": ", this.model.get("MODETIMER"),    0);
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set non-zero timer and confirm updated values in renderer
    logDebug(testname+": setting target mode timer to 5");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, 5);

    assertEq(testname+": ", this.model.get("MODETIMER"),    5);
    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Set timer to zero and confirm updated values in renderer
    logDebug(testname+": setting target mode timer to 0");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, 0);

    assertEq(testname+": ", this.model.get("MODETIMER"),    0);
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set new timer as string and confirm updated values in renderer
    logDebug(testname+": setting target mode timer to '3'");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, '3');

    assertEq(testname+": ", this.model.get("MODETIMER"),    3);
    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");
    
    logDebug(testname+": complete");
};

/** 
 *  Test handling of clock tick events
 */
webbrick.widgets.TestTempSetPoint.prototype.testClockTickEvent = function() {
    var testname = "testClockTickEvent";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");
    var clockIdent   = testname;
    var sourceIdent  = this.model.get("Subject");
    var clockEvent   = this.model.get("ClockTickEvent");
    var setModeEvent = this.model.get("SetTargetModeEvent");

    // Initialize
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.2");

    // Confirm initial values in model
    assertEq(testname+": ", this.model.get("CURRENT"),      "11.1");
    assertEq(testname+": ", this.model.get("CURRENTSTATE"), "current");
    assertEq(testname+": ", this.model.get("TARGET"),       "22.2");
    assertEq(testname+": ", this.model.get("TARGETSTATE"),  "target");
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),     0);

    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    // Clock tick with initial (default) mode timer - no change
    logDebug(testname+": clock tick with delay already at zero");
    webbrick.widgets.publishEvent(clockIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),     0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set target mode timer to 2
    logDebug(testname+": setting target mode timer to 2");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, 2);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     2);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Clock tick to 1
    logDebug(testname+": clock tick down to 1");
    webbrick.widgets.publishEvent(clockIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     1);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.2");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");


    // Clock tick to 0
    logDebug(testname+": clock tick down to 0");
    webbrick.widgets.publishEvent(clockIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),     0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Clock tick at 0 (no change)
    logDebug(testname+": clock tick at 0");
    webbrick.widgets.publishEvent(clockIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),     0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Set target mode timer to -1
    logDebug(testname+": setting target mode timer to -1");
    webbrick.widgets.publishEvent(sourceIdent, setModeEvent, -1);

    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    -1);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Clock tick at -1 (no change)
    logDebug(testname+": clock tick at -1");
    webbrick.widgets.publishEvent(clockIdent, clockEvent);
    
    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),    -1);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    logDebug(testname+": complete");
}

/** 
 *  Test button click handler
 */
webbrick.widgets.TestTempSetPoint.prototype.testButtonClick = function() {
    var testname = "testButtonClick";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");

    // Click up when display mode is current: switch display
    logDebug(testname+": click up with current value displayed");

    this.widget.setMode("current");
    this.widget.setModeTimer(0);
    this.widget.setTargetValue(10.0);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.0");
    assertEq(testname+": ", this.model.get("MODE"),      "current");
    assertEq(testname+": ", this.model.get("MODETIMER"), 0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-current");

    this.widget.bumpTarget(+0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.0");
    assertEq(testname+": ", this.model.get("MODE"),      "target");
    assertEq(testname+": ", this.model.get("MODETIMER"), 5);
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "10.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");
    
    // Click down when display mode is current: switch display
    logDebug(testname+": click down with current value displayed");

    this.widget.setMode("current");
    this.widget.setModeTimer(0);
    this.widget.setTargetValue(10.0);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.0");
    assertEq(testname+": ", this.model.get("MODE"),      "current");
    assertEq(testname+": ", this.model.get("MODETIMER"), 0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "??.?");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-current");

    this.widget.bumpTarget(-0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.0");
    assertEq(testname+": ", this.model.get("MODE"),      "target");
    assertEq(testname+": ", this.model.get("MODETIMER"), 5);
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "10.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");

    // Click up when display mode is target: bump value
    logDebug(testname+": click up with target value displayed");

    this.widget.bumpTarget(+0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.5");
    assertEq(testname+": ", this.model.get("MODE"),      "target");
    assertEq(testname+": ", this.model.get("MODETIMER"), 5);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "10.5");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");
    
    // Click down when display mode is target: bump value
    logDebug(testname+": click down with target value displayed");

    this.widget.bumpTarget(-0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "10.0");
    assertEq(testname+": ", this.model.get("MODE"),      "target");
    assertEq(testname+": ", this.model.get("MODETIMER"), 5);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "10.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");
    
    // Click up with undefined target value: no change
    logDebug(testname+": click up with target displayed and undefined");

    this.widget.setTargetValue("xx.x");

    assertEq(testname+": ", this.model.get("TARGET"),    "xx.x");
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "xx.x");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");

    this.widget.bumpTarget(+0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "xx.x");
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "xx.x");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");

    // Click down with undefined target value: no change
    logDebug(testname+": click up with target displayed and undefined");

    this.widget.bumpTarget(-0.5);

    assertEq(testname+": ", this.model.get("TARGET"),    "xx.x");
    
    assertEq(testname+": ", this.getElement(['SetPointValue']), "xx.x");
    assertEq(testname+": ", this.getClass(['SetPointValue']),   "tempsetpoint-unknown");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']),   "tempsetpoint-target");

    logDebug(testname+": complete");
};

/** 
 *  Test button click extends target display mode timer
 */
webbrick.widgets.TestTempSetPoint.prototype.testButtonClickExtendsTargetMode = function() {
    var testname = "testButtonClickExtendsTargetMode";
    logInfo("==== webbrick.widgets.TestTempSetPoint."+testname+" ====");
    var sourceIdent  = testname;
    var clockEvent   = this.model.get("ClockTickEvent");

    // Initialize
    this.widget.setCurrentValue("11.1");
    this.widget.setTargetValue("22.5");

    // Confirm initial values in renderer
    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");

    // Simulate button-up click
    logDebug(testname+": simulate button-up click");
    this.widget.bumpTarget(+0.5);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     5);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.5");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Clock tick to 1
    logDebug(testname+": clock tick down to 1");
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     1);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.5");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Simulate button-up click
    logDebug(testname+": simulate button-up click");
    this.widget.bumpTarget(+0.5);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     5);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "23.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Clock tick to 3
    logDebug(testname+": clock tick down to 3");
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     3);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "23.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Simulate two button-down clicks
    logDebug(testname+": simulate button-down clicks");
    this.widget.bumpTarget(-0.5);
    this.widget.bumpTarget(-0.5);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     5);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Clock tick to 3
    logDebug(testname+": clock tick down to 3");
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "target");
    assertEq(testname+": ", this.model.get("MODETIMER"),     3);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "22.0");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-target");
    assertEq(testname+": ", this.getElement(['SetPointState']), "set point");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-target");

    // Clock tick to 0
    logDebug(testname+": clock tick down to 0");
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);
    webbrick.widgets.publishEvent(sourceIdent, clockEvent);

    assertEq(testname+": ", this.model.get("MODE"),         "current");
    assertEq(testname+": ", this.model.get("MODETIMER"),     0);

    assertEq(testname+": ", this.getElement(['SetPointValue']), "11.1");
    assertEq(testname+": ", this.getClass(['SetPointValue']), "tempsetpoint-current");
    assertEq(testname+": ", this.getElement(['SetPointState']), "current");
    assertEq(testname+": ", this.getClass(['SetPointState']), "tempsetpoint-current");
    
    logDebug(testname+": complete");
}

//        1         2         3         4         5         6         7         8
// 345678901234567890123456789012345678901234567890123456789012345678901234567890
// End.
