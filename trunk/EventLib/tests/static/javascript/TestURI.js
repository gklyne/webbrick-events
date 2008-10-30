// $Id$
//
// Test URI functions
//

// Create test suite object
function TestURI() {
}

// Specify order of tests: 
TestURI.exposeTestFunctionNames = function() {
    return [ 'testUriSplit1', 'testUriSplit2', 'testUriSplit3', 'testUriSplit4'
           , 'testUriSplit5', 'testUriSplit6', 'testUriSplit7', 'testUriSplit8'
           , 'testPathNormalizeSegs1', 'testPathNormalizeSegs2', 'testPathNormalizeSegs3'
           , 'testPathNormalizeSegs4'
           , 'testPathNormalize1', 'testPathNormalize2', 'testPathNormalize3', 'testPathNormalize4'
           , 'testPathNormalize5', 'testPathNormalize6'
           , 'testDate1', 'testTime1', 'testDateTime1', 'testDateTime2'
           ];
}

// Setup and teardown

TestURI.prototype.setUp = function() {
}

TestURI.prototype.tearDown = function() {
}

// Test cases

TestURI.prototype.testUriSplit1 = function() {
    var u = "scheme://auth:port/path1/path2/path3?q1=aa&q2=bb#frag";
    var e = [ "scheme:", "//auth:port", "/path1/path2/path3", "?q1=aa&q2=bb", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit1 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit1 - authority", e[1], s[1] );
    assertEquals( "testUriSplit1 - path",      e[2], s[2] );
    assertEquals( "testUriSplit1 - query",     e[3], s[3] );
    assertEquals( "testUriSplit1 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit2 = function() {
    var u = "scheme:path1/path2/path3?q1=aa&q2=bb#frag";
    var e = [ "scheme:", "", "path1/path2/path3", "?q1=aa&q2=bb", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit2 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit2 - authority", e[1], s[1] );
    assertEquals( "testUriSplit2 - path",      e[2], s[2] );
    assertEquals( "testUriSplit2 - query",     e[3], s[3] );
    assertEquals( "testUriSplit2 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit3 = function() {
    var u = "scheme://auth?q1=aa&q2=bb#frag";
    var e = [ "scheme:", "//auth", "", "?q1=aa&q2=bb", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit3 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit3 - authority", e[1], s[1] );
    assertEquals( "testUriSplit3 - path",      e[2], s[2] );
    assertEquals( "testUriSplit3 - query",     e[3], s[3] );
    assertEquals( "testUriSplit3 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit4 = function() {
    var u = "scheme://auth/path#frag";
    var e = [ "scheme:", "//auth", "/path", "", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit4 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit4 - authority", e[1], s[1] );
    assertEquals( "testUriSplit4 - path",      e[2], s[2] );
    assertEquals( "testUriSplit4 - query",     e[3], s[3] );
    assertEquals( "testUriSplit4 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit5 = function() {
    var u = "scheme://auth/path";
    var e = [ "scheme:", "//auth", "/path", "", "" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit5 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit5 - authority", e[1], s[1] );
    assertEquals( "testUriSplit5 - path",      e[2], s[2] );
    assertEquals( "testUriSplit5 - query",     e[3], s[3] );
    assertEquals( "testUriSplit5 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit6 = function() {
    var u = "#frag";
    var e = [ "", "", "", "", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit6 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit6 - authority", e[1], s[1] );
    assertEquals( "testUriSplit6 - path",      e[2], s[2] );
    assertEquals( "testUriSplit6 - query",     e[3], s[3] );
    assertEquals( "testUriSplit6 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit7 = function() {
    var u = "path#frag";
    var e = [ "", "", "path", "", "#frag" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit7 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit7 - authority", e[1], s[1] );
    assertEquals( "testUriSplit7 - path",      e[2], s[2] );
    assertEquals( "testUriSplit7 - query",     e[3], s[3] );
    assertEquals( "testUriSplit7 - fragment",  e[4], s[4] );
}

TestURI.prototype.testUriSplit8 = function() {
    var u = "?q";
    var e = [ "", "", "", "?q", "" ];
    var s = uriSplit(u);
    assertEquals( "testUriSplit8 - scheme",    e[0], s[0] );
    assertEquals( "testUriSplit8 - authority", e[1], s[1] );
    assertEquals( "testUriSplit8 - path",      e[2], s[2] );
    assertEquals( "testUriSplit8 - query",     e[3], s[3] );
    assertEquals( "testUriSplit8 - fragment",  e[4], s[4] );
}

TestURI.prototype.testPathNormalizeSegs1 = function() {
    var s = ["a","b"];
    var n = pathNormalizeSegs(s,0);
    var e = s;
    assertEquals( "testPathNormalizeSegs1 - n", e, n );
}

TestURI.prototype.testPathNormalizeSegs2 = function() {
    var s = ["","a","b"];
    var n = pathNormalizeSegs(s);
    var e = s;
    assertEquals( "testPathNormalizeSegs2 - n", e, n );
}

TestURI.prototype.testPathNormalizeSegs3 = function() {
    var p = "/path1/path2/path3";
    var s = p.split("/");
    assertEquals( "testPathNormalizeSegs3 - s0", "",      s[0] );
    assertEquals( "testPathNormalizeSegs3 - s1", "path1", s[1] );
    assertEquals( "testPathNormalizeSegs3 - s2", "path2", s[2] );
    assertEquals( "testPathNormalizeSegs3 - s3", "path3", s[3] );
    var n = pathNormalizeSegs(s);
    var e = s;
    assertEquals( "testPathNormalizeSegs3 - n", e, n );
    var r = n.join("/");
    assertEquals( "testPathNormalizeSegs3 - res", p, r );
}

TestURI.prototype.testPathNormalizeSegs4 = function() {
    var s1 = "a/b".split("/");
    assertEquals( "testPathNormalizeSegs4 - s1", ["a","b"], s1 );
    var s2 = s1.slice(0);
    s2.pop();
    assertEquals( "testPathNormalizeSegs4 - s2", ["a"], s2 );
    var s3 = "../c".split("/");
    assertEquals( "testPathNormalizeSegs4 - s3", ["..", "c"], s3 );
    var s4 = s2.concat(s3);
    assertEquals( "testPathNormalizeSegs4 - s4", ["a","..","c"], s4 );
    var n = pathNormalizeSegs(s4);
    var e = ["c"];
    assertEquals( "testPathNormalizeSegs4 - n", e, n );
}

TestURI.prototype.testPathNormalize1 = function() {
    var p = "/path1/path2/path3";
    var n = pathNormalize(p);
    var e = p;
    assertEquals( "testPathNormalize1",    e, n );
}

TestURI.prototype.testPathNormalize2 = function() {
    var p = "/a/b/./c/./../../g";
    var n = pathNormalize(p);
    var e = "/a/g";
    assertEquals( "testPathNormalize2",    e, n );
}

TestURI.prototype.testPathNormalize3 = function() {
    var p = "./a/b/./c/./../../g";
    var n = pathNormalize(p);
    var e = "a/g";
    assertEquals( "testPathNormalize3",    e, n );
}

TestURI.prototype.testPathNormalize4 = function() {
    var p = "../a/b/./c/./../../g";
    var n = pathNormalize(p);
    var e = "a/g";
    assertEquals( "testPathNormalize4",    e, n );
}

TestURI.prototype.testPathNormalize5 = function() {
    var p = "../a/b/./c/./../../g/..";
    var n = pathNormalize(p);
    var e = "a/";
    assertEquals( "testPathNormalize5",    e, n );
}

TestURI.prototype.testPathNormalize6 = function() {
    var p = "../a/b/./c/./../../g/../";
    var n = pathNormalize(p);
    var e = "a/";
    assertEquals( "testPathNormalize6",    e, n );
}

TestURI.prototype.testDate1 = function() {
    var t = new Date(2007,3,8,16,25,30,0);
    assertEquals("testDate1", "20070308", uriDate(t));
}

TestURI.prototype.testTime1 = function() {
    var t = new Date(2007,3,8,16,25,30,0);
    assertEquals("testTime1", "162530", uriTime(t));
}

TestURI.prototype.testDateTime1 = function() {
    var t = new Date(2007,3,8,16,25,30,0);
    assertEquals("testDateTime1", "20070308T162530", uriDateTime(t));
}

TestURI.prototype.testDateTime2 = function() {
    var ds1 = uriDate();
    var ts1 = uriTime();
    var dt1 = uriDateTime();
    var t   = new Date();
    var ds2 = uriDate(t);
    var ts2 = uriTime(t);
    var dt2 = uriDateTime(t);
    assertEquals("testDateTime2, date: "+ds1+","+ds2,     ds1, ds2 );
    assertEquals("testDateTime2, time: "+ts1+","+ts2,     ts1, ts2 );
    assertEquals("testDateTime2, datetime: "+dt1+","+dt2, dt1, dt2 );
}

// Expose functions at global level of frame for JSUnit

// JSUnit page setup
function setUpPage() {
    info("setUpPage", "TestURI");
    setUpPageForJSUnit(TestURI, this);
}

// Return list of tests for JSunit
exposeTestFunctionNames = TestURI.exposeTestFunctionNames;

// End.
