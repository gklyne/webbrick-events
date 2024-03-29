// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//

/**
 * @fileoverview
 *  This script defines some utilities for managing namespaces in 
 *  webbrick javascript code
 *
 * @version $Id$
 * @author Graham Klyne, copied and adapted from something similar Alistair Miles.
 */

/**
 * @class
 * @constructor
 * A class for namespaces.
 */
Namespace_class = function (base, name) {
    /**
     * @member
     */
    this._globalobj  = base;

    /**
     * @member
     */
    this._name = name;

    /**
     * @member
     */
    this._namespaces = [];
};

/**
 * Create the webbrick global namespace.
 *  
 * If already defined, the existing value will not be overwritten 
 * so that defined namespaces are preserved.
 */
var webbrick;
if (typeof webbrick == "undefined" || !webbrick) {
    webbrick = new Namespace_class(this, "webbrick");
}

/**
 * Returns the namespace specified and creates it if it doesn't exist.
 * Keeps track of the namespaces created in webbrick._namespaces.
 * <pre>
 * webbrick.namespace("property.package");
 * webbrick.namespace("webbrick.property.package");
 * </pre>
 * Either of the above would create webbrick.property, then
 * webbrick.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * webbrick.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * @param  {String*} arguments  1-n namespaces to create 
 * @return {Object}             A reference to the last namespace object created
 */
webbrick.namespace = function() {
    for (var i=0; i<arguments.length; i+=1) {
        MochiKit.Logging.logDebug("webbrick.namespace: "+arguments[i]);
        var nspath = arguments[i].split(".");
        var nsobj  = webbrick;
        nsobj._namespaces.push(arguments[i]);
        // webbrick is implied, so it is ignored if it is included
        for (var j=(nspath[0] == "webbrick") ? 1 : 0; j<nspath.length; j+=1) {
            if (!nsobj[nspath[j]]) {
                nsobj[nspath[j]] = new Namespace_class(nsobj._globalobj, nspath[j]);
            };
            nsobj=nsobj[nspath[j]];
        }
    }
};

/**
 *  Ensure that a specified namespace is defined.  Raise an error if it is not.
 *  This is provided mainly to avoid obscure error messages when modules are missing.
 *
 * @param  {String*} arguments 1-n namespaces to check 
 * @return {Object}  A reference to the last namespace object checked
 */
webbrick.require = function() {
    for (var i=0 ; i<arguments.length ; i+=1 ) {
        MochiKit.Logging.logDebug("webbrick.require: "+arguments[i]);
        var nspath = arguments[i].split(".");
        var nsobj  = webbrick._globalobj;
        for (var j=0 ; j<nspath.length ; j+=1) {
            if (!nsobj[nspath[j]]) {
                throw "MissingNamespaceError", "MissingNamespaceError: "+arguments[i]+" not present";
            }
            nsobj=nsobj[nspath[j]];
        }
    }
};

// End.
