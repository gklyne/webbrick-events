# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for URI functions
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
from time import mktime, time

sys.path.append("../..")
from EventLib.URI import uriDate, uriTime, uriDateTime


# Test class
class TestURI(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testDate1(self):
        t = int(mktime((2007,3,8,16,25,30,0,0,0)))
        self.assertEqual(uriDate(t), "20070308", "testDate1")

    def testTime1(self):
        t = mktime((2007,3,8,16,25,30,0,0,0))
        self.assertEqual(uriTime(t), "162530", "testTime1")

    def testDateTime1(self):
        t = mktime((2007,3,8,16,25,30,0,0,0))
        self.assertEqual(uriDateTime(t), "20070308T162530", "testDateTime1")

    def testDateTime2(self):
        ds1 = uriDate()
        ts1 = uriTime()
        dt1 = uriDateTime()
        t   = time()
        ds2 = uriDate(t)
        ts2 = uriTime(t)
        dt2 = uriDateTime(t)
        self.assertEqual(ds1, ds2, "testDateTime2, date: "+str((ds1,ds2)) )
        self.assertEqual(ts1, ts2, "testDateTime2, time: "+str((ts1,ts2)) )
        self.assertEqual(dt1, dt2, "testDateTime2, datetime: "+str((dt1,dt2)) )

    # Sentinel/placeholder tests

    def testUnits(self):
        assert (True)

    def testComponents(self):
        assert (True)

    def testIntegration(self):
        assert (True)

    def testPending(self):
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
            , "testDate1"
            , "testTime1"
            , "testDateTime1"
            , "testDateTime2"
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
    return TestUtils.getTestSuite(TestURI, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestURI.log", getTestSuite, sys.argv)

# End.
