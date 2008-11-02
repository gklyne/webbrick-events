# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit test for event envelope handling
#

import sys
import unittest
import logging

sys.path.append("../..")

from EventLib.Event           import Event, makeEvent
from EventLib.EventEnvelope   import EventEnvelope

# Test class
class TestEventEnvelope(unittest.TestCase):

    def setUp(self):
        self.evt  = makeEvent("evtype","evsource","payload")
        self.env1 = EventEnvelope(self.evt,"R1")
        self.env2 = self.env1.nextHop("R2")
        self.env3 = self.env2.nextHop("R3")
        return

    def tearDown(self):
        return

    # Test cases

    def testUnWrap1(self):
        assert self.env3.unWrap() is self.evt

    def testUnWrap2(self):
        assert self.env3.unWrap("R4") is self.evt

    def testUnWrap3(self):
        assert self.env3.unWrap("R2") is None

    def testUnWrap4(self):
        assert self.env3.unWrap("R4", 1) is None

    def testUnWrap5(self):
        assert self.env3.unWrap("R4", 2) is self.evt

    def testFlatten1(self):
        assert self.env3.flatten() == (self.evt, ["R1", "R2", "R3"])

    # Second call to detect bad use of static empty list initializer
    def testFlatten2(self):
        assert self.env3.flatten() == (self.evt, ["R1", "R2", "R3"])

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
            , "testUnWrap1"
            , "testUnWrap2"
            , "testUnWrap3"
            , "testUnWrap4"
            , "testUnWrap5"
            , "testFlatten1"
            , "testFlatten2"
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
    return TestUtils.getTestSuite(TestEventEnvelope, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventEnvelope.log", getTestSuite, sys.argv)

# End.
