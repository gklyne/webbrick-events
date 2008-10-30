// $Id$
//
// Unit test for event envelope handling
//

// Create test suite object
function TestCombinatorParser() {
}

// Specify order of tests: 
TestCombinatorParser.exposeTestFunctionNames = function() {
    return [ "testWord1"
           , "testWord2"
           , "testText1"
           , "testText2"
           , "testText3"
           , "testText4"
           , "testText5"
           , "testInteger1"
           , "testInteger2"
           , "testInteger3"
           , "testInteger4"
           , "testInteger5"
           , "testInteger6"
           , "testInteger7"
           , "testConst1"
           , "testConst2"
           , "testConst3"
           , "testConst4"
           , "testVal1"
           , "testVal2"
           , "testPrim1"
           , "testPrim2"
           , "testFact1"
           , "testFact2"
           , "testExpr1"
           , "testExpr2"
           , "testExpr3"
           , "testExpr4"
           , "testGen_delims1"
           , "testGen_delims2"
           , "testGen_delims3"
           , "testGen_delims4"
           , "testGen_delims5"
           , "testGen_delims6"
           , "testGen_delims7"
           , "testSub_delims1"
           , "testSub_delims2"
           , "testSub_delims3"
           , "testSub_delims4"
           , "testSub_delims5"
           , "testSub_delims6"
           , "testSub_delims7"
           , "testSub_delims8"
           , "testSub_delims9"
           , "testSub_delims10"
           , "testSub_delims11"
           , "testUnreserved1"
           , "testUnreserved2"
           , "testUnreserved3"
           , "testUnreserved4"
           , "testUnreserved5"
           , "testUnreserved6"
           , "testXXX"
           ];
    return [ "testText1"
           , "testText3"
           , "testInteger3"
           , "testPrim2"
           ];
}

// Setup and teardown

var P = CombinatorParsers;
word = P.regex("[a-zA-Z][a-zA-Z0-9_]*");    // Identifiers
num  = P.int(P.regex("[0-9]+"));            // Integers
nump = P.seq("(",num,")");
numq = P.seq(P.sup("("),num,P.sup(")"));
numo = P.opt("(",num,")");
con1 = P.val([11]);
con2 = P.val(22);
con3 = P.val([]);
dotf = P.fwd(this,"dot");
dot  = P.text(".");
dot2 = P.seq(dot,P.fwd(this,"dot"));
text = P.seq("text",dot);                   // 'text.'
val  = P.alt(word,num);                     // Name or number
prim = P.alt(num,P.seq("(",num,")"));
fact = P.alt(val,P.grp("(",P.fwd(this,"sexp"),")"));
term = P.seq(fact,P.rpt(0,P.alt("*","/"),fact));
sexp = P.seq(term,P.rpt(0,P.alt("+","-"),term));
expr = P.seq(sexp,dot);

// Regex tests (URI character classes)

gen_delims  = P.regex("[:/?#@\\[\\]]");
sub_delims  = P.regex("[!$&'()*+,;=]");
unreserved  = P.regex("[\\w-.~]");

TestCombinatorParser.prototype.setUp = function() {
}

TestCombinatorParser.prototype.tearDown = function() {
}

// Test cases
TestCombinatorParser.prototype.testWord1 = function() {
    assertEquals("testWord1", word.parseString("a1234"), ["a1234"]);
}

TestCombinatorParser.prototype.testWord2 = function() {
    assertEquals("testWord2", word.parseString("a1234*"), null);
}

TestCombinatorParser.prototype.testText1 = function() {
    assertEquals("testText1", dot.parseString("."), ["."]);
}

TestCombinatorParser.prototype.testText2 = function() {
    assertEquals("testText2", dot.parseString(".*"), null);
}

TestCombinatorParser.prototype.testText3 = function() {
    assertEquals("testText3", text.parseString("text."), ["text", "."]);
}

TestCombinatorParser.prototype.testText4 = function() {
    assertEquals("testText4", dotf.parseString("."), ["."]);
}

TestCombinatorParser.prototype.testText5 = function() {
    assertEquals("testText5", dot2.parseString(".."), [".","."]);
}

TestCombinatorParser.prototype.testInteger1 = function() {
    assertEquals("testInteger1", num.parseString("1234"), [1234]);
}

TestCombinatorParser.prototype.testInteger2 = function() {
    assertEquals("testInteger2", num.parseString("1234*"), null);
}

TestCombinatorParser.prototype.testInteger3 = function() {
    assertEquals("testInteger3", nump.parseString("(333)"), ["(",333,")"]);
}

TestCombinatorParser.prototype.testInteger4 = function() {
    assertEquals("testInteger4", numq.parseString("(444)"), [444]);
}

TestCombinatorParser.prototype.testInteger5 = function() {
    assertEquals("testInteger5", numo.parseString("(555)"), ["(",555,")"]);
}

TestCombinatorParser.prototype.testInteger6 = function() {
    assertEquals("testInteger6", numo.parseString(""), [null]);
}

TestCombinatorParser.prototype.testInteger7 = function() {
    assertEquals("testInteger7", numo.parseString("x"), null);
}

TestCombinatorParser.prototype.testConst1 = function() {
    assertEquals("testConst1", con1.parseString(""), [11]);
}

TestCombinatorParser.prototype.testConst2 = function() {
    assertEquals("testConst2", con2.parseString(""), [22]);
}

TestCombinatorParser.prototype.testConst3 = function() {
    assertEquals("testConst3", con3.parseString(""), []);
}

TestCombinatorParser.prototype.testConst4 = function() {
    assertEquals("testConst4", con1.parseString("x"), null);
}

TestCombinatorParser.prototype.testVal1 = function() {
    assertEquals("testVal1", val.parseString("1"), [1]);
}

TestCombinatorParser.prototype.testVal2 = function() {
    assertEquals("testVal2", val.parseString("abc"), ["abc"]);
}

TestCombinatorParser.prototype.testPrim1 = function() {
    assertEquals("testPrim1", prim.parseString("1"), [1]);
}

TestCombinatorParser.prototype.testPrim2 = function() {
    assertEquals("testPrim2", prim.parseString("(22)"), ["(",22,")"]);
}

TestCombinatorParser.prototype.testFact1 = function() {
    assertEquals("testFact1", fact.parseString("1"), [1]);
}

TestCombinatorParser.prototype.testFact2 = function() {
    assertEquals("testFact2", fact.parseString("(22)"), [["(",22,")"]]);
}

TestCombinatorParser.prototype.testExpr1 = function() {
    assertEquals("testExpr1", expr.parseString("1+2*3."), [1,"+",2,"*",3,"."]);
}

TestCombinatorParser.prototype.testExpr2 = function() {
    assertEquals("testExpr2", expr.parseString("(1+2)*3."), [["(",1,"+",2,")"],"*",3,"."]);
}

TestCombinatorParser.prototype.testExpr3 = function() {
    assertEquals("testExpr3", expr.parseString("(1+2)*3"), null);
}

TestCombinatorParser.prototype.testExpr4 = function() {
    assertEquals("testExpr4", expr.parseString("(1+2)!3."), null);
}

TestCombinatorParser.prototype.testGen_delims1 = function() {
    assertEquals("testGen_delims1", gen_delims.parseString(":"), [":"]);
}

TestCombinatorParser.prototype.testGen_delims2 = function() {
    assertEquals("testGen_delims2", gen_delims.parseString("/"), ["/"]);
}

TestCombinatorParser.prototype.testGen_delims3 = function() {
    assertEquals("testGen_delims3", gen_delims.parseString("?"), ["?"]);
}

TestCombinatorParser.prototype.testGen_delims4 = function() {
    assertEquals("testGen_delims4", gen_delims.parseString("#"), ["#"]);
}

TestCombinatorParser.prototype.testGen_delims5 = function() {
    assertEquals("testGen_delims5", gen_delims.parseString("["), ["["]);
}

TestCombinatorParser.prototype.testGen_delims6 = function() {
    assertEquals("testGen_delims6", gen_delims.parseString("]"), ["]"]);
}

TestCombinatorParser.prototype.testGen_delims7 = function() {
    assertEquals("testGen_delims7", gen_delims.parseString("@"), ["@"]);
}

TestCombinatorParser.prototype.testSub_delims1 = function() {
    assertEquals("testSub_delims1", sub_delims.parseString("!"), ["!"]);
}

TestCombinatorParser.prototype.testSub_delims2 = function() {
    assertEquals("testSub_delims2", sub_delims.parseString("$"), ["$"]);
}

TestCombinatorParser.prototype.testSub_delims3 = function() {
    assertEquals("testSub_delims3", sub_delims.parseString("&"), ["&"]);
}

TestCombinatorParser.prototype.testSub_delims4 = function() {
    assertEquals("testSub_delims4", sub_delims.parseString("'"), ["'"]);
}

TestCombinatorParser.prototype.testSub_delims5 = function() {
    assertEquals("testSub_delims5", sub_delims.parseString("("), ["("]);
}

TestCombinatorParser.prototype.testSub_delims6 = function() {
    assertEquals("testSub_delims6", sub_delims.parseString(")"), [")"]);
}

TestCombinatorParser.prototype.testSub_delims7 = function() {
    assertEquals("testSub_delims7", sub_delims.parseString("*"), ["*"]);
}

TestCombinatorParser.prototype.testSub_delims8 = function() {
    assertEquals("testSub_delims8", sub_delims.parseString("+"), ["+"]);
}

TestCombinatorParser.prototype.testSub_delims9 = function() {
    assertEquals("testSub_delims9", sub_delims.parseString(","), [","]);
}

TestCombinatorParser.prototype.testSub_delims10 = function() {
    assertEquals("testSub_delims10", sub_delims.parseString(";"), [";"]);
}

TestCombinatorParser.prototype.testSub_delims11 = function() {
    assertEquals("testSub_delims11", sub_delims.parseString("="), ["="]);
}

TestCombinatorParser.prototype.testUnreserved1 = function() {
    assertEquals("testUnreserved1", unreserved.parseString("a"), ["a"]);
}

TestCombinatorParser.prototype.testUnreserved2 = function() {
    assertEquals("testUnreserved2", unreserved.parseString("Z"), ["Z"]);
}

TestCombinatorParser.prototype.testUnreserved3 = function() {
    assertEquals("testUnreserved3", unreserved.parseString("3"), ["3"]);
}

TestCombinatorParser.prototype.testUnreserved4 = function() {
    assertEquals("testUnreserved4", unreserved.parseString("-"), ["-"]);
}

TestCombinatorParser.prototype.testUnreserved5 = function() {
    assertEquals("testUnreserved5", unreserved.parseString("."), ["."]);
}

TestCombinatorParser.prototype.testUnreserved6 = function() {
    assertEquals("testUnreserved6", unreserved.parseString("~"), ["~"]);
}

TestCombinatorParser.prototype.testXXX = function() {
    assertEquals("testXXX", 4, 2+2);
}

// Expose functions at global level of frame for JSUnit

// JSUnit page setup
function setUpPage() {
    info("setUpPage", "TestCombinatorParser");
    setUpPageForJSUnit(TestCombinatorParser, this);
}

// Return list of tests for JSunit
exposeTestFunctionNames = TestCombinatorParser.exposeTestFunctionNames;

// End.
