# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit test for status value type and handling
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest

sys.path.append("../..")

from EventLib.Status import Status, StatusVal, StatusException
from EventLib.Event  import Event

# Test class
class TestStatusVals(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testStatusCreate1(self):
        s = Status("StatusUri", "message", "values")
        assert s.getUri()     == "StatusUri", "testStatusCreate1, getUri"
        assert s.getMessage() == "message",   "testStatusCreate1, getMessage"
        assert s.getValues()  == "values",    "testStatusCreate1, getValues"

    def testStatusCreate2(self):
        s = Status("StatusUri", values="values", message="message")
        assert s.getUri()     == "StatusUri", "testStatusCreate2, getUri"
        assert s.getMessage() == "message",   "testStatusCreate2, getMessage"
        assert s.getValues()  == "values",    "testStatusCreate2, getValues"

    def testStatusCreate3(self):
        s = Status("StatusUri")
        assert s.getUri()     == "StatusUri", "testStatusCreate3, getUri"
        assert s.getMessage() == "",          "testStatusCreate3, getMessage"
        assert s.getValues()  == None,        "testStatusCreate3, getValues"

    def testStatusEqual1(self):
        s1 = Status("StatusUri", "message1", "values1")
        s2 = Status("StatusUri", "message2", "values2")
        assert s1 == s2, "testStatusEqual1"

    def testStatusEqual2(self):
        s1 = Status("StatusUri")
        s2 = Status("StatusUri")
        assert s1 == s2, "testStatusEqual2"

    def testStatusEqual3(self):
        s1 = Status("StatusUri1", "message", "values")
        s2 = Status("StatusUri2", "message", "values")
        assert s1 != s2, "testStatusEqual3"

    def testStatusString1(self):
        s = Status("StatusUri", "message", "values")
        assert str(s) == "StatusUri: message", "testStatusString1"

    def testStatusString2(self):
        s = Status("StatusUri", values="values", message="message")
        assert str(s) == "StatusUri: message", "testStatusString2"

    def testStatusString3(self):
        s = Status("StatusUri")
        assert str(s) == "StatusUri", "testStatusString3"

    def testStatusString4(self):
        s = Status("StatusUri", message=None)
        assert str(s) == "StatusUri", "testStatusString4"

    def testStatusException1(self):
        s = Status("StatusUri", "message", "values")
        try:
            raise s.makeException()
        except StatusException, e:
            assert str(e) == "StatusUri: message", "testStatusException1, str"
            assert e.getStatus() == s, "testStatusException1, getStatus"

    def testStatusException2(self):
        s = Status("StatusUri")
        try:
            raise s.makeException()
        except StatusException, e:
            assert str(e) == "StatusUri", "testStatusException2, str"
            assert e.getStatus() == s, "testStatusException2, getStatus"

    def testStatusEvent1(self):
        s = Status("StatusUri", "message", "values")
        e = s.makeEvent("SourceUri")
        assert e == Event("StatusUri", "SourceUri", s), "testStatusEvent1"

    def testStatusEvent2(self):
        s = Status("StatusUri")
        e = s.makeEvent("SourceUri")
        assert e == Event("StatusUri", "SourceUri", s), "testStatusEvent2"

    def testStatusValues(self):
        assert isinstance(StatusVal.OK, Status), "testStatusValues, StatusVal.OK"

    # Sentinel/placeholder tests

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
        assert (True)

# Assemble test suite
from MiscLib import TestUtils

def getTestSuite(select="unit"):
    """
    Get test suite

    select  is one of the following:
            "unit"      return suite of unit tests only
            "component" return suite of unit and component tests
            "all"       return suite of unit, component and integration tests
            "pending"   return suite of pending tests
            name        a single named test to be run
    """
    testdict = {
        "unit": 
            [ "testUnits"
            , "testStatusCreate1"
            , "testStatusCreate2"
            , "testStatusCreate3"
            , "testStatusEqual1"
            , "testStatusEqual2"
            , "testStatusEqual3"
            , "testStatusString1"
            , "testStatusString2"
            , "testStatusString3"
            , "testStatusString4"
            , "testStatusException1"
            , "testStatusException2"
            , "testStatusEvent1"
            , "testStatusEvent2"
            , "testStatusValues"
            ],
        "component":
            [ "testComponents"
            ],
        "integration":
            [ "testIntegration"
            ],
        "pending":
            [ "testPending"
            ]
        }
    return TestUtils.getTestSuite(TestStatusVals, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestStatus.log", getTestSuite, sys.argv)

# End.
