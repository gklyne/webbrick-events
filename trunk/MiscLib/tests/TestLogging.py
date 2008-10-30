# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for WebBrick library functions (Logging.py)
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest

sys.path.append("../..")
from MiscLib.Logging import *

class TestLogging(unittest.TestCase):
    def setUp(self):
        self.log = []
        return

    def tearDown(self):
        return

    def altLogger(self,msg,context,level):
        self.log.append(FormatLogMessage(msg,context,level))

    # Actual tests follow

    def testLogDefault(self):
        Trace("Trace message 1")
        Trace("Trace message 2","testLogDefault")
        Warn("Warning message")
        Error("Error message")


    def testLogAlt(self):
        save = SetLogger(self.altLogger)
        Trace("Trace message 1")
        Trace("Trace message 2","testLogDefault")
        Warn("Warning message")
        Error("Error message")
        SetLogger(save)
        expected = (
            [ "TRACE - Trace message 1"
            , "testLogDefault: TRACE - Trace message 2"
            , "WARNING - Warning message"
            , "ERROR - Error message"
            ] )
        assert self.log == expected, "Unexpected log value: "+repr(self.log)

    def testLogBoth(self):
        Trace("Trace message 1")
        save = SetLogger(self.altLogger)
        Trace("Trace message 2","testLogDefault")
        SetLogger(save)
        Warn("Warning message")
        Error("Error message")
        expected = [ "testLogDefault: TRACE - Trace message 2" ]
        assert self.log == expected, "Unexpected log value: "+repr(self.log)

# Code to run unit tests directly from command line.
# Constructing the suite manually allows control over the order of tests.
def getTestSuite():
    suite = unittest.TestSuite()
    suite.addTest(TestLogging("testLogDefault"))
    suite.addTest(TestLogging("testLogAlt"))
    suite.addTest(TestLogging("testLogBoth"))
    return suite
    # suite = unittest.makeSuite(WidgetTestCase,'test')

if __name__ == "__main__":
    # unittest.main()
    runner = unittest.TextTestRunner()
    runner.run(getTestSuite())
    