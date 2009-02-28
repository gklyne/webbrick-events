/**
 * @fileoverview
 *
 * Functions to support panel interaction widgets
 *
 * @version $Id$
 * @author Graham Klyne
 *
 * @requires MochiKit.Base
 * @requires MochiKit.Dom
 * @requires MochiKit.Logging
 * @requires MochiKit.Signal
 */

webbrick.namespace("webbrick.widgets.WidgetFunctions");

// TODO - break this into more focused modules

/**
 *  Add logging functions to global namespace, for convenience
 */
logDebug   = MochiKit.Logging.logDebug;
logInfo    = MochiKit.Logging.log;
logWarning = MochiKit.Logging.logWarning;
logError   = MochiKit.Logging.logError;

// ----------------------------------------------------------------
// General functions
// ----------------------------------------------------------------

/**
 * Apply a supplied function to every named element in a DOM tree or subtree
 * vals, if supplied, is a list of values that are supplied to function calls
 * for the the dom elements walked.
 */
webbrick.widgets.domWalk = function (domref,func,elemname,vals) {
    logDebug( "domWalk: ", domref, ", ", elemname, ", ", vals) ;
    if (elemname == null ) { elemname = "*"; }
    var elems = domref.getElementsByTagName(elemname) ;
    logDebug( "domWalk: ", elems.length) ;
    for (var i = 0 ; i < elems.length ; i++) {
        if ( vals ) {
            func(elems[i],i,vals) ;
        }
        else {
            func(elems[i],i) ;
        };
    };
};

/**
 * Find the first child element of a node (i.e. skip any text nodes)
 */
webbrick.widgets.getFirstChildElem = function (elem) {
    logDebug("getFirstChildElem: ", elem.nodeName, ", len: ", elem.childNodes.length) ;
    for ( var i = 0 ; i < elem.childNodes.length ; i++ ) {
        var n = elem.childNodes[i] ;
        if (n.nodeType == 1) {
            return n ; 
        };
    };
    return null ;
} ;

/**
 * Extract all child text from DOM element node.
 *
 * NOTE: for most purposes, innerHTML attribute is more efficient
 */
webbrick.widgets.getElementText = function (elem) {
    if ( elem == null ) { return "" ; }
    logDebug("getElementText: ", elem.childNodes) ;
    var txt = "" ;
    for ( var i = 0 ; i < elem.childNodes.length ; i++ ) {
        //logDebug("getElementText (node type): ", elem.childNodes[i].nodeType) ;
        //logDebug("getElementText (node value): ", elem.childNodes[i].nodeValue) ;
        if ( elem.childNodes[i].nodeType == 3 ) {
            txt += elem.childNodes[i].nodeValue ;
        };
    };
    return txt ;
};

/**
 * Set text value in DOM element node:  
 * Replaces all children of the node with just one containing the supplied text.
 *
 * NOTE: for most purposes, innerHTML attribute is more efficient
 * (but may expose code to injection attacks if used injudiciously?)
 */
webbrick.widgets.setElementText = function (elem, text) {
    logDebug("setElementText: ", elem, ", ", text) ;
    MochiKit.DOM.replaceChildNodes(elem, text);
    return elem ;
};

/**
 * Locate the first node reached by following the supplied path of elements 
 * descending from the supplied element node.
 * 
 * pathnames is a list of element names.
 */
webbrick.widgets.getElementByTagPath = function (elem, pathnames) {
    logDebug("getElementByTagPath: "+elem+", "+pathnames);
    var nodes = elem.getElementsByTagName(pathnames[0]);
    if ( nodes.length > 0 ) {
        if (pathnames.length == 1) {
            return nodes[0];
        } else {
            return webbrick.widgets.getElementByTagPath(nodes[0], pathnames.slice(1));
        }
    } else {
        return null;
    }
};

/**
 * Set attribute of first node reached by following the supplied 
 * path of elements descending from the supplied element node.
 * 
 *  elem        is the base element to search from
 *  pathnames   is a list of element names.
 *  attrname    is the name of the attribute to set
 *  attrval     is the attribute value to set
 */
webbrick.widgets.setAttributeByTagPath = function (elem, pathnames, attrname, attrval) {
    var node = webbrick.widgets.getElementByTagPath(elem, pathnames);
    if (node != null) {
        node.setAttribute(attrname, attrval);
    };
};

/**
 * Get attribute of the first node reached by following the supplied 
 * path of elements descending from the supplied element node.
 * 
 *  elem        is the base element to search from
 *  pathnames   is a list of element names.
 *  attrname    is the name of the attribute to set
 */
webbrick.widgets.getAttributeByTagPath = function (elem, pathnames, attrname) {
    var node = webbrick.widgets.getElementByTagPath(elem, pathnames);
    if (node == null) return null; 
    return node.getAttribute(attrname); 
};

/**
 * Set text in the first node reached by following the supplied 
 * path of elements descending from the supplied element node.
 * 
 *  elem        is the base element to search from
 *  pathnames   is a list of element names.
 */
webbrick.widgets.setElementTextByTagPath = function (elem, pathnames, textval) {
    var node = webbrick.widgets.getElementByTagPath(elem, pathnames);
    if (node != null) {
        webbrick.widgets.setElementText(node, textval);
    };
};

/**
 * Get test from the first node reached by following the supplied 
 * path of elements descending from the supplied element node.
 * 
 *  elem        is the base element to search from
 *  pathnames   is a list of element names.
 */
webbrick.widgets.getElementTextByTagPath = function (elem, pathnames) {
    var node = webbrick.widgets.getElementByTagPath(elem, pathnames);
    if (node == null) return null; 
    return webbrick.widgets.getElementText(node); 
};

/**
 * Extract the text from the first child node with the given name
 */
// TODO: refactor this to use path function above
webbrick.widgets.getElementTextByTagName = function (elem, elemname) {
    var txt = "" ;
    var nodes = elem.getElementsByTagName(elemname);
    if ( nodes.length > 0 ) {
        txt = webbrick.widgets.getElementText(nodes[0]);
    };
    return txt ;
};

/**
 * Extract the text from the first child node with the given name
 * and convert to an integer value
 */
webbrick.widgets.getElementIntByTagName = function (elem, elemname) {
    var txt = getElementTextByTagName(elem, elemname);
    if ( txt != null ) {
        var pat = /^\d+$/ ;         // digit digit*
        if ( pat.test(txt) ) {
            return parseInt(txt, 10);
        };
    };
    return null ;
};

/**
 * Extract the text from the first child node with the given name
 * and convert to a float value
 */
webbrick.widgets.getElementFloatByTagName = function (elem, elemname) {
    var txt = getElementTextByTagName(elem, elemname);
    if ( txt != null ) {
        var pat = /^\d+[.]?\d*$/ ;         // digit digit*[.]digit*
        if ( pat.test(txt) ) {
            return parseFloat(txt);
        };
    };
    return null ;
};

/**
 *  Get selected element attributes to new object
 *
 * @param   {String}    elem    element whose attributes are collected
 * @param   {String*}   attrs   list of attribute names to be collected
 * @return  a dictionary of selected attributes and values not including 
 *          entries attributes not present on the element.
 */
webbrick.widgets.getElementAttributes = function (elem, attrs) {
    logDebug("getElementAttributes: "+elem+", "+attrs) ;
    var attrmap = {};
    for (var i = 0 ; i<attrs.length ; i++) {
        var val = elem.getAttribute(attrs[i]);
        if (val != null) {
            attrmap[attrs[i]] = val;
        };
    };
    //attrmap["class"] = elem.className.split(' ');
    //logDebug("getElementAttributes: return:") ;
    //for (var k in attrmap) {
    //    logDebug("- ", k, ": ", attrmap[k]) ;
    //};
    return attrmap;
};

// ----------------------------------------------------------------
// Access event publish/subscribe router
// ----------------------------------------------------------------

webbrick.widgets.WidgetEventRouter = null;

/**
 *  Check for event router, create local event router if needed
 * 
 *  For testing, call this function before any call to getWidgetEventRouter
 *  for all event handling to be synchronous within the calling program.
 */
webbrick.widgets.getLocalEventRouter = function () {
    //logDebug( "webbrick.widgets.getLocalEventRouter");
    if (!webbrick.widgets.WidgetEventRouter) {
        logDebug( "webbrick.widgets.getLocalEventRouter: new EventPubSub");
        webbrick.widgets.WidgetEventRouter = new EventPubSub("WidgetEventRouter");
    };
    return webbrick.widgets.WidgetEventRouter;
};

/**
 *  Check for event router, create HTTP event router if needed
 */
webbrick.widgets.getWidgetEventRouter = function () {
    //logDebug( "webbrick.widgets.getWidgetEventRouter");
    if (!webbrick.widgets.WidgetEventRouter) {
        logDebug( "webbrick.widgets.getWidgetEventRouter: new EventRouterHTTPC");
        webbrick.widgets.WidgetEventRouter = new EventRouterHTTPC("WidgetEventRouter","localhost", 8080, "/Proxy/8081");
    };
    return webbrick.widgets.WidgetEventRouter;
};

/** 
 *  Publish event helper function
 *
 *  Returns a deferred status value from publishing the event. 
 */
webbrick.widgets.publishEvent = function(sourceid, evtype, payload) {
    logDebug("publishEvent: evtype: "+evtype+", payload: "+payload);
    var source = makeEventAgent(sourceid);
    logDebug("publishEvent: source: "+source);
    var event  = makeEvent(evtype, sourceid, payload);
    logDebug("publishEvent: event: "+event);
    var sts = webbrick.widgets.getWidgetEventRouter().publish(source, event);
    logDebug("publishEvent: sts: "+sts);
    return sts;
};

// ----------------------------------------------------------------
// Initialise widget callbacks
// ----------------------------------------------------------------

/**
 *  Initialize widgets in document
 *
 * @param   {Event} event       the MochiKit event object corresponding to 
 *                              a completed document load.
 *
 * Scan all DOM elements for InitializeWidget attributes, and call the indicated 
 * function for each such element, supplying the element object as an
 * argument.  This allows each element to perform its own onload 
 * initialization, independently of all the other elements on a panel.
 *
 * This function should be activated as an 'onLoad' attribute on the 
 * HTML page containing window.  (See end of this module.)
 *
 */
webbrick.widgets.InitWidgetElements = function (event) {
    logDebug( "webbrick.widgets.InitWidgetElements: ", event ) ;
    try {
        webbrick.widgets.domWalk(event.src().document, webbrick.widgets.InitWidgetElement) ;
    }
    catch( e ) {
        logError("InitWidgetElements: ", e) ;
    };
};

/**
 *  Initialize a widget defined on an HTML element.
 *
 * @param   {HTMLElement} elm   a DOM element possibly containing a widget
 *                              to be initialized (determined by presence
 *                              of an "InitializeWidget" attribute).
 */
webbrick.widgets.InitWidgetElement = function (elm) {
    // logDebug( "InitWidgetElement: ", elm.tagName );
    var fname = elm.getAttribute("InitializeWidget") ;
    if ( fname ) {
        // Assume that 'eval' content executes in current function context
        // hence 'elm' accesses the argument to this function.
        logDebug( "webbrick.widgets.InitWidgetElement: ", elm.tagName, ", ", fname, ", ", elm );
        try {
            if ( eval("webbrick.widgets."+fname) != undefined ) {
                // Try for function defined in namespace scope
                eval( "webbrick.widgets."+fname+"(elm)" ) ;
            } else {
                // Else call function defined in global scope
                // TODO: remove this when all widgets fully in namespace
                eval( fname+"(elm)" ) ;
            }
        }
        catch( e ) {
            logError("InitWidgetElement: ", e) ;
        };
    };
};

// -------------------------------------
// General widget support functions
// -------------------------------------

/**
 *  Retrieve event type or related value for a widget, possibly from
 *  an attribute of the containing DOM element.
 *
 * @param   {HTMLElement} element   is the main widget element.
 * @param   {String} value          has one of the following forms:
 *          "@name"     the value is taken from the named attribute of the widget element
 *          else        the value is used as-provided
 *
 * If the "@name" form is used, returns an empty string if the named attribute 
 * is not defined.
 */
webbrick.widgets.getWidgetValue = function (element, value) {
    if (value != null && value[0] == '@') {
        value = element.getAttribute(value.slice(1));
    };
    return value;
};

/**
 *  Subscribe a widget event handler for a widget
 *
 * @param    {HTMLElement} element  is the main widget element, as is accessible to 
 *                                  the event handler as member 'element' of the 
 *                                  callback 'handler' parameter
 * @param    {String} evtype        indicates the event type to subscribe, 
 *                                  evaluated per 'getWidgetValue'
 * @param    {String} evsubj        indicates the event source to subscribe, 
 *                                  evaluated per 'getWidgetValue'
 * @param    {Function} handler_callback
 *              is called when the event is fired, and looks something like:
 *                  function CountdownDisplay_ClockTickEventHandler(handler, event) {
 *                      var elm = handler.element;      // Retrieve widget element
 *                      ...
 *                  }
 */
webbrick.widgets.subscribeWidgetEventHandler = function 
        (element, evtype, evsubj, handler_callback) {
    evtype = webbrick.widgets.getWidgetValue(element, evtype);
    evsubj = webbrick.widgets.getWidgetValue(element, evsubj);
    var listener = makeEventHandler(evtype +"_handler", handler_callback, null, null);
    listener.element = element;
    var r = webbrick.widgets.getWidgetEventRouter();
    r.subscribe(32000, listener, evtype, evsubj);
};

/**
 * Make an event associated with a widget
 *
 * @param    {HTMLElement} element  is the main widget element.
 * @param    {String} evtype        indicates the event type to construct, 
 *                                  evaluated per 'getWidgetValue'
 * @param    {String} evsubj        indicates the event subject to construct,
 *                                  evaluated per 'getWidgetValue'
 * @param    {Any} payload          is the event payload
 */
webbrick.widgets.makeWidgetEvent = function (element, evtype, evsubj, payload) {
    evtype = webbrick.widgets.getWidgetValue(element, evtype);
    evsubj = webbrick.widgets.getWidgetValue(element, evsubj);
    return makeEvent(evtype, evsubj, payload);
};

/**
 * Retrieve value from an event payload
 *
 * @param    {Object} event         is the event whose payload is to be retrieved
 * @param    {Function} convert     converts a text payload to the desired type
 */
webbrick.widgets.getEventData = function (event, convert) {
    var payload = event.getPayload();
    if (typeof payload == "string" && payload != undefined) {
        payload = convert(payload);
    };
    return payload;
};

/**
 * Get a sub-element of a widget
 *
 * @param    {HTMLElement} element  is the main widget element.
 * @param    {String} subname       is the name of the widget sub-element to set
 * @param    {String} subindex      is the index of the widget sub-element to set 
 *          (usually zero, but may be used to select from more than one sub-element 
 *          with the same name.  If omitted, zero (i.e. return the first or only 
 *          matching sub-element) is assumed.
 */
webbrick.widgets.getSubElement = function (element, subname, subindex) {
    logDebug( "webbrick.widgets.getSubElement: ", subname, ", ", typeof subindex);
    if (subindex == null) { 
        subindex = 0; 
    };
    logDebug( "webbrick.widgets.getSubElement: ", subname, ", ", subindex);
    logDebug( "webbrick.widgets.getSubElement: elem: ", 
        element.getElementsByTagName(subname)[subindex]);
    return element.getElementsByTagName(subname)[subindex];
};

/**
 * Set value of widget sub-element
 *
 * @param    {HTMLElement} element  is the main widget element.
 * @param    {String} subname       is the name of the widget sub-element to set
 * @param    {String} subindex      is the index of the widget sub-element to set 
 *          (usually zero, but may be used to select from more than one sub-element 
 *          with the same name).
 * @param    {String} value    if non-null, is the sub-element text value to be assigned
 * @param    {String} class    if non-null, is the sub-element class to be assigned
 */
webbrick.widgets.setSubElementValue = function (element, subname, subindex, value, class) {
    var subelm = webbrick.widgets.getSubElement(element, subname, subindex);
    if (value != null) { 
        webbrick.widgets.setElementText(subelm, value); 
    };
    if (class != null) { 
        subelm.setAttribute("class", class); 
    };
};

// ----------------------------------------------------------------
// Send page-reset event
// ----------------------------------------------------------------

/**
 * This function may be used to indicate a page has been reloaded, and may
 * be used by server side software to reset associated state information.
 * (So far, used for testing only.)
 */
webbrick.widgets.sendPageResetEvent = function () {
    var r = webbrick.widgets.getWidgetEventRouter();
    var e = makeEvent(uriJoin(EventUriTypeBase, "reset"),document.baseURI);
    var s = makeEventAgentUri(EventUriSourceBase);
    r.publish(s, e);
};

// ----------------------------------------------------------------
// Generate an internal browser event each second
// ----------------------------------------------------------------

webbrick.widgets.ClockStarted         = false;
webbrick.widgets.ClockTickEventType   = null;
webbrick.widgets.ClockTickEvent       = null;
webbrick.widgets.ClockTickEventSource = null;
webbrick.widgets.ClockTickEventAgent  = null;

/**
 *  Start an internal clock running, if not already running, and return a pair
 *  containing the event type and source to subscribe to receive clock tick events.
 */
webbrick.widgets.startClock = function () {
    if ( !webbrick.widgets.ClockStarted ) {
        webbrick.widgets.ClockStarted         = true;
        webbrick.widgets.ClockTickEventType   = uriJoin(EventUriTypeBase, "ClockTickEventType_second");
        webbrick.widgets.ClockTickEventSource = makeEventAgentUri(EventUriSourceBase);
        webbrick.widgets.ClockTickEventAgent  = makeEventAgent(webbrick.widgets.ClockTickEventSource);
        webbrick.widgets.ClockTickEvent       = 
            makeEvent(webbrick.widgets.ClockTickEventType, webbrick.widgets.ClockTickEventSource);
        MochiKit.Async.callLater(1, webbrick.widgets.clockTick);
    };
    return [webbrick.widgets.ClockTickEventType, webbrick.widgets.ClockTickEventSource];
};

/**
 *  Publish a clock-tick event.
 */
webbrick.widgets.clockTick = function () {
    var r = webbrick.widgets.getWidgetEventRouter();
    r.publish(webbrick.widgets.ClockTickEventAgent, webbrick.widgets.ClockTickEvent);
    MochiKit.Async.callLater(1, webbrick.widgets.clockTick);
};

// ----------------------------------------------------------------
// Page initialization
// ----------------------------------------------------------------

// Hack as default is no limit and default firebug off
//MochiKit.Logging.logger.useNativeConsole = false;
//MochiKit.Logging.logger.maxSize = 2000;

// This will get things going.
MochiKit.Signal.connect(window, "onload", webbrick.widgets.InitWidgetElements ); 

// End.
