# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Test test runner utiltities
#

import sys
import logging
import unittest

sys.path.append("../..")

# Test class
class TestExample(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testCase(self):
        assert "Some condition"

    def testArg(self):
        assert self.arg == "val"

    # Sentinel/placeholder tests

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
        assert (True)

    def testPending(self):
        assert (False), "No pending test"

# Assemble test suite

from MiscLib import TestUtils

def getTestSuite(select="unit", testargs=[("arg","val")]):
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
            , "testCase"
            , "testArg"
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
    for (argname,argval) in testargs:
        if argval: setattr(TestExample, argname, argval)
    return TestUtils.getTestSuite(TestExample, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    testargs = [ ("-a", "--arg", "VAL", "arg", "Argument passed to test suite") ]
    TestUtils.runTests("TestTestUtils.log", getTestSuite, sys.argv+['-a','val'], testargs=testargs)

# End.
