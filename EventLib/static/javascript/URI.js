// $Id$
//
// Copyright (c) 2008 WebBrick Systems Limited
// Released under the MIT licence
// See LICENCE.TXT included with these files,
// or http://www.opensource.org/licenses/mit-license.php
//
// Event-related URI definitions and functions

// Function for testing with arguments reversed
// This function passes all tests at http://skew.org/uri/
function uriJoinRefBase(ref, base) {
    return uriJoin(base, ref);
}

// Function to combine base URI with relative URI
// See RFC3986, section 5.2.2
function uriJoin(base, ref, strict) {
    if (strict === undefined) strict = true;
    var refparts  = uriSplit(ref);
    var baseparts = uriSplit(base);
    var tgtparts  = [ "", "", "", "", "" ];
    if (!strict && (refparts[0] == baseparts[0])) {
        refparts[0] = "";
    }
    if (refparts[0] != "") {
        // Reference has scheme: treat as absolute
        tgtparts[0] = refparts[0];                  // Scheme
        tgtparts[1] = refparts[1];                  // Authority
        tgtparts[2] = pathNormalize(refparts[2]);   // Path
        tgtparts[3] = refparts[3];                  // Query
    } 
    else {
        // Reference relative to base schema
        tgtparts[0] = baseparts[0];
        if (refparts[1] != "") {
            // Reference has authority
            tgtparts[1] = refparts[1];
            tgtparts[2] = pathNormalize(refparts[2]);
            tgtparts[3] = refparts[3];
        } 
        else {
            // Reference does not have authority
            tgtparts[1] = baseparts[1];
            if (refparts[2] != "") {
                // Reference contains path
                if (refparts[2].charAt(0) == '/') {
                    tgtparts[2] = pathNormalize(refparts[2]);
                } else {
                    tgtparts[2] = pathMergeNormalize(baseparts[1], baseparts[2], refparts[2]);
                }
                tgtparts[3] = refparts[3];
            }
            else {
                // Reference does not contain path
                tgtparts[2] = baseparts[2] ;
                if (refparts[3] != "") {
                    tgtparts[3] = refparts[3] ;
                }
                else {
                    tgtparts[3] = baseparts[3] ;
                }
            }
        }
    }
    tgtparts[4] = refparts[4];      // Fragment always from reference
    return tgtparts[0]+tgtparts[1]+tgtparts[2]+tgtparts[3]+tgtparts[4];
}

function uriSplit(uri) {
    //
    // RegExp from RFC3986, appendix B:
    //
    // ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
    //
    // The values of the five components are
    //      scheme:     = $1
    //      scheme      = $2
    //      //authority = $3
    //      authority   = $4
    //      /path       = $5
    //      ?query      = $6
    //      query       = $7
    //      #fragment   = $8
    //      fragment    = $9
    //
    // NOTE: this function does not validate the URI syntax, merely splits into 
    //       components if it is syntactically valid.
    //
    // Returns an array containing scheme, authority, path, query and fragment 
    // components of the supplied URI
    //
    var r = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
    var u = uri.match(r);
    return [ u[1] || "", u[3] || "", u[5], u[6] || "", u[8] || "" ];
}

function pathNormalize(path) {
    // Removes "dot" segments from the path component of a URI,
    // supplied as a string.
    var old = path.split("/");
    return pathNormalizeSegs(old).join("/");
}

function pathNormalizeSegs(path) {
    // Removes "dot" segments from the path component of a URI.
    // This function deals with any leading '/', and hands off to 
    // 'pathNormalizeSegs1' to perform the main work.
    if (path[0] == "") {
        return [""].concat(pathNormalizeSegs1(path,1));
    } else {
        return pathNormalizeSegs1(path,0);
    }
}

function pathNormalizeSegs1(path, start) {
    // Performs 'pathNormalizeSegs' function after any leading '/' 
    // has been removed.
    //
    // Removes "dot" segments from the path component of a URI,
    // supplied as a list of segments with "/"s removed
    // See RFC3986, section 5.2.4#
    var old = path.slice(start);
    var res = [];
    while (old.length > 0) {
        var s = old.shift();
        if (s == ".") {
            // Skip '.' segment
            // If "." is final segment, ensure terminating "/" is added
            if (old.length == 0) res.push("");
        }
        else if (s == "..") {
            // Remove trailing segment from output, if any
            res.pop();
            // If ".." is final segment, ensure terminating "/" is added
            if (old.length == 0) res.push("");
        }
        else {
            res.push(s);
        }
    }
    return res;
}

function pathMergeNormalize(baseauth,base,more) {
    // Merges and normalizes URI paths
    // See RFC3986, section 5.2.3
    // Called only if the reference part (more) is relative
    if (baseauth && (base == "")) return "/"+more;
    var basesegs = base.split("/");  basesegs.pop();
    var moresegs = more.split("/");
    return pathNormalizeSegs(basesegs.concat(moresegs)).join("/");
}


// Status URI values
StatusUriBase = "http://id.webbrick.co.uk/status/";
StatusUri = {
    OK              : uriJoin(StatusUriBase, "OK"),
    NONE            : uriJoin(StatusUriBase, "NONE"),
    SUBSCRIBED      : uriJoin(StatusUriBase, "SUBSCRIBED"),
    TRIGGERED       : uriJoin(StatusUriBase, "TRIGGERED"),
    UNSUBSCRIBED    : uriJoin(StatusUriBase, "UNSUBSCRIBED")
    };


// Event URIs
EventUriTypeBase       = "http://id.webbrick.co.uk/events/";
EventUriSourceBase     = "http://id.webbrick.co.uk/source/";
EventUriTargetBase     = "http://id.webbrick.co.uk/target/";
EventUriRouterBase     = "http://id.webbrick.co.uk/router/";
EventUri = {
    // Event types
    DefaultType     : uriJoin(EventUriTypeBase, "default"),
    SubscribeType   : uriJoin(EventUriTypeBase, "subscribe"),
    CloseType       : uriJoin(EventUriTypeBase, "close")
    };

// To create new evenmt router id, use:
// uriJoin(EventUriRouterBase, uriDateTime())

// Date/time functions for constructing unique URIs

function numFormat(val, minlen, base) {
    if (base === undefined) base = 10;
    var valstr = val.toString(base);
    while (valstr.length < minlen) {
        valstr = "0" + valstr;
    }
    return valstr;    
}

// Return specified or current date as yyyymmdd
function uriDate(timeval) {
    if (timeval == null) timeval = new Date();
    return numFormat(timeval.getFullYear(),4) + 
           numFormat(timeval.getMonth(),2) + 
           numFormat(timeval.getDate(),2);
}

// Return specified or current time as hhmmss
function uriTime(timeval) {
    if (timeval == null) timeval = new Date();
    return numFormat(timeval.getHours(),2) + 
           numFormat(timeval.getMinutes(),2) + 
           numFormat(timeval.getSeconds(),2);
}

// Return specified or current time as yyyymmddThhmmss
function uriDateTime(timeval) {
    if (timeval == null) timeval = new Date();
    return uriDate(timeval)+"T"+uriTime(timeval);
}

// Helper function to get string representation of a value
// (Used for ported Python code)
// (Avoids using toString() method for use with non-objects.)
function str(val) {
    return ""+val;
}

// End.
