// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php

/**
 * @fileoverview
 * This script defines tests for the webbrick.widgets.MvcUtils module.
 *
 * @version $Id$
 * @author Graham Klyne, copied and adapted from a similar module by Alistair Miles.
 *
 * @requires MochiKit.Base
 * @requires MochiKit.DOM
 * @requires MochiKit.Logging
 * @requires MochiKit.Signal
 * @requires MochiKit.tests.SimpleTest
 * @requires webbrick.widgets.MvcUtils
 * @requires webbrick.AsyncUnitTest
 */

webbrick.require("MochiKit.Base");
webbrick.require("MochiKit.DOM");
webbrick.require("MochiKit.Logging");
webbrick.require("MochiKit.Signal");
webbrick.require("webbrick.widgets.MvcUtils");
webbrick.require("webbrick.SimpleTest");
webbrick.require("webbrick.AsyncUnitTest");

// Shortcuts
//var logDebug   = MochiKit.Logging.logDebug;
//var logInfo    = MochiKit.Logging.log;
//var logWarning = MochiKit.Logging.logWarning;
//var logError   = MochiKit.Logging.logError;

// var assert             = (from webbrick.AsyncUnitTest)
// var assertEq           = (from webbrick.AsyncUnitTest)
// var assertNotUndefined = (from webbrick.AsyncUnitTest)

/**
 * @class
 * Test suite for the webbrick.widgets.MvcUtils module.
 */
webbrick.widgets.TestMvcUtils = function() {};

// Specify order of tests: 
webbrick.widgets.TestMvcUtils.exposeTestFunctionNames = function() {
    return [ 'testModuleContents'
           , 'testGenericModel'
           , 'testGenericModelGetDefault'
           , 'testEventSignal'
           , 'testEventSignalObj'
           , 'testSwap'
           , 'testSwapEvent'
           , 'testShowHide'
           ];
};

/**
 *  toString method to facilitate testing
 */
webbrick.widgets.TestMvcUtils.prototype.toString = function() {
    return 'TestMvcUtils';
};

/**
 * Set up function for webbrick.widgets.TestMvcUtils.
 */
webbrick.widgets.TestMvcUtils.prototype.setUp = function() {
    this.oldState = null;
    this.newState = null;
    this.gotState = null;
    try {
        logInfo("setUp TestMvcUtils");
        logInfo("instantiate a dummy model");
        var modelDefinition = {
            propertyNames : [ "STATE", "IMAGES" ],
            controlledValues : {
                "STATE" : [ "LOADING", "PENDING", "READY"]
            },
            defaultValues : {
                STATE: "LOADING"
            }
         }
        this.model = new webbrick.widgets.GenericModel(modelDefinition);
    } catch (e) {
        logError("setUp error, "+e.name+", "+e.message);
    }
};

/**
 * Tear down function for webbrick.widgets.TestMvcUtils.
 */
webbrick.widgets.TestMvcUtils.prototype.tearDown = function() {
    try {
        logInfo("tearDown test");
    } catch (e) {
        logError("tearDown error, "+e.name+", "+e.message);
    }
};

/** Test that the contents of the webbrick.widgets.MvcUtils module have been defined.
 */
webbrick.widgets.TestMvcUtils.prototype.testModuleContents = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testModuleContents ====");
    assertNotUndefined("Initial module contents", "GenericModel", webbrick.widgets.GenericModel); 
    assertNotUndefined("Initial module contents", "show", webbrick.widgets.show); 
    assertNotUndefined("Initial module contents", "hide", webbrick.widgets.hide);
};

/** Test get/set methods on the webbrick.widgets.MvcUtils.GenericModel class.
 */
webbrick.widgets.TestMvcUtils.prototype.testGenericModel = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testGenericModel ====");

    logInfo("test initial object definitions");
    assertNotUndefined("testGenericModel initial contents", "_data", 
        this.model._data); 
    assertNotUndefined("testGenericModel initial contents", "_propertyNames", 
        this.model._propertyNames); 
    assertNotUndefined("testGenericModel initial contents", "_controlledValues", 
        this.model._controlledValues);
    assertNotUndefined("testGenericModel initial contents", "get", 
        this.model.get);
    assertNotUndefined("testGenericModel initial contents", "getDefault", 
        this.model.getDefault);
    assertNotUndefined("testGenericModel initial contents", "set", 
        this.model.set);
    assertNotUndefined("testGenericModel initial contents", "addListener", 
        this.model.addListener);
    
    logInfo("test initial property values");
    assertEq("initial values", "LOADING", this.model.get("STATE"));
    
    logInfo("test change property value");
    var oldval = this.model.set("STATE", "PENDING");
    assertEq("changed property value", "PENDING", this.model.get("STATE"));
    assertEq("previous property value", "LOADING", oldval);
    
    logInfo("get invalid property name");
    try {
        this.model.get("FOO");
        assert("get invalid property name", "no exception was thrown", false);
    } catch( e ) {
        logInfo("caught expected exception: "+e.name+", "+e.message);
    } 

    logInfo("set invalid property name");
    try {
        this.model.set("FOO", "BAR");
        assert("set invalid property name", "no exception was thrown", false);
    } catch( e ) {
        logInfo("caught expected exception: "+e.name+", "+e.message);
    } 

    logInfo("set invalid property value");
    try {
        this.model.set("STATE", "FOO");
        assert("set invalid property value", "no exception was thrown", false);
    } catch( e ) {
        logInfo("caught expected exception: "+e.name+", "+e.message);
    } 

    logInfo("set uncontrolled property value");
    this.model.set("IMAGES", "FOO");
    assertEq("set uncontrolled property value", "FOO", this.model.get("IMAGES"));
};

/** Test getDefault method on the webbrick.widgets.MvcUtils.GenericModel class.
 */
webbrick.widgets.TestMvcUtils.prototype.testGenericModelGetDefault = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testGenericModelGetDefault ====");
    
    logInfo("test initial property values");
    assertEq("initial values", "LOADING", this.model.get("STATE"));
    
    logInfo("test change property value");
    this.model.set("STATE", "PENDING");
    assertEq("changed property value", "PENDING", this.model.get("STATE"));
    
    logInfo("get invalid property name");
    try {
        this.model.get("FOO");
        assert("get invalid property name", "no exception was thrown", false);
    } catch( e ) {
        logInfo("caught expected exception: "+e.name+", "+e.message);
    } 

    logInfo("get invalid property name with default");    
    assertEq("default property value", "BAZ", this.model.getDefault(null, "BAZ"));
};

/** Test event signalling on changed value
 */
webbrick.widgets.TestMvcUtils.prototype.testEventSignal = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testEventSignal ====");
    var oldState = null;
    var newState = null;
    var gotState = null;

    logInfo("add listener to model STATE property");
    var listener = function(mod, prop, oldvalue, newvalue) {
        logDebug("listener("+mod+","+prop+","+oldvalue+","+newvalue+")");
        oldState = oldvalue;
        newState = newvalue;
        gotState = this.get(prop);
    };
    this.model.addListener("STATE", listener);

    logInfo("set model IMAGES property");
    this.model.set("IMAGES", "images");
    assertEq("STATE  (1)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES (1)", "images", this.model.get("IMAGES"));
    assertEq("old    (1)", null,     oldState);
    assertEq("new    (1)", null,     newState);
    assertEq("got    (1)", null,     gotState);

    logInfo("set model STATE property");
    this.model.set("STATE", "PENDING");
    assertEq("STATE  (2)", "PENDING", this.model.get("STATE"));
    assertEq("IMAGES (2)", "images",  this.model.get("IMAGES"));
    assertEq("old    (2)", "LOADING", oldState);
    assertEq("new    (2)", "PENDING", newState);
    assertEq("got    (2)", "PENDING", gotState);
};

/**
 *  Listener as method of test object
 */
webbrick.widgets.TestMvcUtils.prototype.stateChangeListener = function(mod, prop, oldvalue, newvalue) {
    logDebug("TestMvcUtils.stateChangeListener("+mod+","+prop+","+oldvalue+","+newvalue+")");
    logDebug("TestMvcUtils.stateChangeListener - this: "+this);
    this.oldState = oldvalue;
    this.newState = newvalue;
    this.gotState = mod.get(prop);
};

/** Test event signalling to object method on changed value
 */
webbrick.widgets.TestMvcUtils.prototype.testEventSignalObj = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testEventSignalObj ====");
    logDebug("TestMvcUtils.testEventSignalObj - this: "+this);
    this.oldState = null;
    this.newState = null;
    this.gotState = null;

    logInfo("add listener to model STATE property");
    this.model.addListener("STATE", this.stateChangeListener, this);

    logInfo("set model IMAGES property");
    this.model.set("IMAGES", "images");
    assertEq("STATE  (1)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES (1)", "images", this.model.get("IMAGES"));
    assertEq("old    (1)", null,     this.oldState);
    assertEq("new    (1)", null,     this.newState);
    assertEq("got    (1)", null,     this.gotState);

    logInfo("set model STATE property");
    this.model.set("STATE", "PENDING");
    assertEq("STATE  (2)", "PENDING", this.model.get("STATE"));
    assertEq("IMAGES (2)", "images",  this.model.get("IMAGES"));
    assertEq("old    (2)", "LOADING", this.oldState);
    assertEq("new    (2)", "PENDING", this.newState);
    assertEq("got    (2)", "PENDING", this.gotState);
};

webbrick.widgets.TestMvcUtils.prototype.testSwap = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testSwap ====");
    var swapvals = { STATE: "READY", IMAGES: 12345 };

    logInfo("Test initial values");
    assertEq("STATE  (1)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES (1)", undefined, this.model.get("IMAGES"));

    logInfo("Swap with initial values");
    swapvals = this.model.swap(swapvals);
    assertEq("STATE  (2)", "READY", this.model.get("STATE"));
    assertEq("IMAGES (2)", 12345, this.model.get("IMAGES"));
    assertEq("swapvals[STATE]( 2)", "LOADING", swapvals["STATE"]);
    assertEq("swapvals[IMAGES](2)", undefined, swapvals["IMAGES"]);

    logInfo("Swap back initial values");
    swapvals = this.model.swap(swapvals);
    assertEq("STATE  (3)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES (3)", undefined, this.model.get("IMAGES"));
    assertEq("swapvals[STATE] (3)", "READY", swapvals["STATE"]);
    assertEq("swapvals[IMAGES](3)", 12345,   swapvals["IMAGES"]);
};

/**
 *  Test events triggered by swap
 */
webbrick.widgets.TestMvcUtils.prototype.testSwapEvent = function() {
    logInfo("==== webbrick.widgets.TestMvcUtils.testSwapEvent ====");
    var oldState  = null;
    var newState  = null;
    var gotState  = null;
    var oldImages = null;
    var newImages = null;
    var gotImages = null;

    logInfo("Test initial values: STATE: ", this.model.get("STATE"), 
            ", IMAGES:", this.model.get("IMAGES"));
    assertEq("STATE  (1)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES (1)", undefined, this.model.get("IMAGES"));

    logInfo("add listener to model STATE property");
    var listenerState = function(mod, prop, oldvalue, newvalue) {
        logDebug("listener("+mod+","+prop+","+oldvalue+","+newvalue+")");
        oldState = oldvalue;
        newState = newvalue;
        gotState = this.get(prop);
    };
    this.model.addListener("STATE", listenerState);

    logInfo("add listener to model STATE property");
    var listenerImages = function(mod, prop, oldvalue, newvalue) {
        logDebug("listener("+mod+","+prop+","+oldvalue+","+newvalue+")");
        oldImages = oldvalue;
        newImages = newvalue;
        gotImages = this.get(prop);
    };
    this.model.addListener("IMAGES", listenerImages);

    assertEq("STATE     (1)", "LOADING", this.model.get("STATE"));
    assertEq("IMAGES    (1)", undefined, this.model.get("IMAGES"));
    assertEq("oldState  (1)", null,      oldState);
    assertEq("newState  (1)", null,      newState);
    assertEq("gotState  (1)", null,      gotState);
    assertEq("oldImages (1)", null,      oldImages);
    assertEq("newImages (1)", null,      newImages);
    assertEq("gotImages (1)", null,      gotImages);

    logInfo("Swap with initial values");
    var swapvals = { STATE: "READY", IMAGES: "Images" };
    swapvals = this.model.swap(swapvals);

    assertEq("STATE     (2)", "READY", this.model.get("STATE"));
    assertEq("IMAGES    (2)", "Images",  this.model.get("IMAGES"));
    assertEq("oldState  (2)", "LOADING", oldState);
    assertEq("newState  (2)", "READY",   newState);
    assertEq("gotState  (2)", "READY",   gotState);
    assertEq("oldImages (2)", undefined, oldImages);
    assertEq("newImages (2)", "Images",  newImages);
    assertEq("gotImages (2)", "Images",  gotImages);
};

/** Test show/hide.
 */
webbrick.widgets.TestMvcUtils.prototype.testShowHide = function() {
    logInfo("==== test show/hide functions ====");
    var element = document.createElement("div");
    webbrick.widgets.hide(element);
    assertEq("hide element", "invisible", element.className);
    webbrick.widgets.show(element);
    assertEq("side element", "", element.className);
};

// End.
