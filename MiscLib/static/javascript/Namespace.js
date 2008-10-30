// $Id$
//
// Copyright (c) 2008 O2M8 Limited
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

if (typeof webbrick == "undefined" || !webbrick) {
    /**
     * @class
     * The webbrick global namespace. 
     * If already defined, the existing value will not be overwritten 
     * so that defined namespaces are preserved.
     */
    function webbrick() {
    };
}

if (typeof webbrick._namespaces == "undefined" ) {
    webbrick._namespaces = [];
};

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
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        o=webbrick;
        o._namespaces.push(a[i]);
        // webbrick is implied, so it is ignored if it is included
        d=a[i].split(".");
        for (j=(d[0] == "webbrick") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }
    return o;
};

/**
 *  Ensure that a specified namespace is defined.  Raise an error if it is not.
 *  This is provided mainly to avoid obscure error messages when modules are missing.
 *
 * @param  {String*} arguments 1-n namespaces to check 
 * @return {Object}  A reference to the last namespace object checked
 */
webbrick._globalobj = this;
webbrick.require = function() {
    var a=arguments, o=null, i, j, d;
    for ( i=0 ; i<a.length ; i++ ) {
        d=a[i].split(".");
        o=webbrick._globalobj;
        MochiKit.Logging.logDebug("webbrick.require: "+a[i]);
        for (j=0 ; j<d.length ; j=j+1) {
            if (!o[d[j]]) {
                throw webbrick.Error("MissingNamespaceError", "MissingNamespaceError: "+a[i]+" not present");
            }
            o=o[d[j]];
        }
    }
    return o;
};

// End.
