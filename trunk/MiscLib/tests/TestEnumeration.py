# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for Enumeration module
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest

sys.path.append("../..")
from MiscLib.Enumeration import *

class TestEnumeration(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testCreateEnumeration(self):
        ms = Enumeration("MediaState",
                ["STOP","PLAY","PAUSED","FASTFORWARD","REVERSE",
                 ("ERROR",-1), ("UNKNOWN",-2)]
             )
        self.assertEqual(ms.STOP, 0)
        self.assertEqual(ms.PLAY, 1)
        self.assertEqual(ms.PAUSED,2)
        self.assertEqual(ms.FASTFORWARD,3)
        self.assertEqual(ms.REVERSE,4)
        self.assertEqual(ms.ERROR,-1)
        self.assertEqual(ms.UNKNOWN,-2)

    def testReverseEnumeration(self):
        ms = Enumeration("MediaState",
                ["STOP","PLAY","PAUSED","FASTFORWARD","REVERSE",
                 ("ERROR",-1), ("UNKNOWN",-2)]
             )
        self.assertEqual(ms.whatis(0),  "STOP")
        self.assertEqual(ms.whatis(4),  "REVERSE")
        self.assertEqual(ms.whatis(-2), "UNKNOWN")


# Code to run unit tests directly from command line.
def getTestSuite():
    suite = unittest.TestSuite()
    suite.addTest(TestEnumeration("testCreateEnumeration"))
    suite.addTest(TestEnumeration("testReverseEnumeration"))
    return suite

if __name__ == "__main__":
    runner = unittest.TextTestRunner()
    runner.run(getTestSuite())

# End.
