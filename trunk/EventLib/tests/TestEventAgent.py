# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for event source values.
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys, logging
import unittest

sys.path.append("../..")
from EventLib.EventAgent import EventAgent, makeEventAgent
from EventLib             import URI

class DummyClass(object):
    def __init__(self):
        self._stuff = "abc"

# Test class
class TestEventAgent(unittest.TestCase):

    def setUp(self):
        return

    def tearDown(self):
        return

    # Test cases

    def testCreateEventAgent1(self):
        es = EventAgent("EventAgentUri")
        self.assertEqual(es.getUri(), "EventAgentUri")

    def testCreateEventAgentError(self):
        # create an agent with a non string URI
        try:
            es = EventAgent( ("EventAgentUri", "more") )
            self.fail( "Should throw an exception as the URI is not a string" )
        except Exception, ex :
            pass

    def testMakeEventAgent1(self):
        es = makeEventAgent("EventAgentUri")
        self.assertEqual(es.getUri(), "EventAgentUri")

    def testMakeEventAgent2(self):
        es = makeEventAgent()
        eu = es.getUri()
        assert eu.startswith(URI.EventAgentBase), "testMakeEventAgent2: "+eu

    def testMakeEventAgent3(self):
        es1 = makeEventAgent()
        es2 = makeEventAgent()
        self.assertNotEqual(es1.getUri(), es2.getUri())
        # print "es1: %s, es2: %s\n"%(es1.getUri(),es2.getUri())

    def testEventAgentEqual1(self):
        es1 = EventAgent("EventAgentUri")
        es2 = EventAgent("EventAgentUri")
        self.assertEqual(es1, es2)

    def testEventAgentEqual2(self):
        es1 = EventAgent("EventAgentUri1")
        es2 = EventAgent("EventAgentUri2")
        self.assertNotEqual(es1, es2)

    def testEventAgentEqual3(self):
        es1 = makeEventAgent()
        es2 = makeEventAgent()
        self.assertNotEqual(es1, es2)

    def testEventAgentEqual4(self):
        es1 = makeEventAgent()
        es2 = makeEventAgent(es1.getUri())
        self.assertEqual(es1, es2)

    def testEventAgentEqual5(self):
        es1 = makeEventAgent()
        es2 = makeEventAgent()
        self.assertNotEqual(es1, None)

    def testEventAgentEqual5(self):
        es1 = makeEventAgent()
        es2 = makeEventAgent()
        self.assertNotEqual(None, es2)

    def testEventAgentEqual6(self):
        # test against object that is not an event
        es1 = makeEventAgent()
        self.assertNotEqual(es1, DummyClass(), "testEventAgentEqual6")

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
            , "testCreateEventAgent1"
            , "testCreateEventAgentError"
            , "testMakeEventAgent1"
            , "testMakeEventAgent2"
            , "testMakeEventAgent3"
            , "testEventAgentEqual1"
            , "testEventAgentEqual2"
            , "testEventAgentEqual3"
            , "testEventAgentEqual4"
            , "testEventAgentEqual5"
            , "testEventAgentEqual5"
            , "testEventAgentEqual6"
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
    return TestUtils.getTestSuite(TestEventAgent, testdict, select=select)

# Run unit tests directly from command line
if __name__ == "__main__":
    TestUtils.runTests("TestEventAgent.log", getTestSuite, sys.argv)

# End.
