# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for event distribution functions
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys, unittest, logging

# Add main library directory to python path
sys.path.append("../..")

from MiscLib import TestUtils

import TestURI
import TestStatus
import TestSyncDeferred
import TestEventAgent
import TestEventHandler
import TestEvent
import TestEventEnvelope
import TestEventSerializer
import TestEventPubSub
import TestEventRouter
import TestEventRouterThreaded
import TestEventRouterHTTP
import TestEventHTTPClientServer
import TestEventHTTPClient

# Code to run unit tests from all library test modules
def getTestSuite(select="unit"):
    suite = unittest.TestSuite()
    suite.addTest(TestURI.getTestSuite(select=select))
    suite.addTest(TestStatus.getTestSuite(select=select))
    suite.addTest(TestSyncDeferred.getTestSuite(select=select))
    suite.addTest(TestEventAgent.getTestSuite(select=select))
    suite.addTest(TestEventHandler.getTestSuite(select=select))
    suite.addTest(TestEvent.getTestSuite(select=select))
    suite.addTest(TestEventEnvelope.getTestSuite(select=select))
    suite.addTest(TestEventSerializer.getTestSuite(select=select))
    suite.addTest(TestEventPubSub.getTestSuite(select=select))
    suite.addTest(TestEventRouter.getTestSuite(select=select))
    suite.addTest(TestEventRouterThreaded.getTestSuite(select=select))
    suite.addTest(TestEventRouterHTTP.getTestSuite(select=select))
    suite.addTest(TestEventHTTPClientServer.getTestSuite(select=select))
    suite.addTest(TestEventHTTPClient.getTestSuite(select=select))
    return suite

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestAll.log", getTestSuite, sys.argv)

# End.
