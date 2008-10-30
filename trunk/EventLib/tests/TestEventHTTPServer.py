# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Event routing HTTP server for testing client event routing functions.
# This module can be used to create a server thread within another program,
# or run directly to instantiate a separate standalone test server.
#
# Creates HTTP event router servers listening on ports 8082 and 8083, 
# to be used for testing HTTP client event routers.
#

import sys
import logging
import time
from Queue     import Queue
from threading import Thread
from traceback import print_exc

sys.path.append("../..")

from MiscLib.Functions     import compareLists
from MiscLib.Logging       import Trace, Info

from EventLib.Event        import Event, makeEvent
from EventLib.Status       import Status, StatusVal
from EventLib.SyncDeferred import makeDeferred
from EventLib.EventAgent   import EventAgent, makeEventAgent
from EventLib.EventHandler import EventHandler, makeEventHandler
from EventLib.EventRouter  import EventRouter
from EventLib.EventRouterHTTPS import EventRouterHTTPS
from EventLib.EventRouterHTTPC import EventRouterHTTPC
from TestEventRouter           import TestEventRouter

# Test class
class TestEventHTTPServer(object):

    def start(self):
        try:
            self.R1  = EventRouter("R1")
            self.R2  = EventRouterHTTPS("R2S","localhost",8082)
            self.R3  = EventRouterHTTPS("R3S","localhost",8083)
        except Exception, e:
            print_exc()
            try:
                self.tearDown()
            except Exception:
                pass
            raise e
        #
        # Configure event routers with R1 as hub:
        #
        #        R1
        #       /  \
        #     R2    R3      -- HTTPS event routers (HTTP server)
        #     /      \
        #   R2C      R3C    -- HTTPC event routers (HTTP client)
        #
        # The test setup assumes that:
        # * HTTPS and HTTPC event routers work as pairs, with just one 
        #   HTTPC connecting to each HTTPS
        # * all events delivered to an HTTPS event router are forwarded to 
        #   the corresponding HTTPC event router.  For finer control, use an
        #   ordinary event router to filter delivery to the HTTPS event router.
        # * all events delivered to an HTTPC event router are forwarded to 
        #   the corresponding HTTPS event router.  For finer control, use an
        #   ordinary event router to filter delivery to the HTTPC event router.
        # * All subscriptions are similarly forwarded between HTTPS and HTTPC
        #   event routers.
        # * all local event delivery and routing functions operate as for an
        #   ordinary event router.
        #
        # Wildcard event source
        self.R1.routeEventFrom(evtype="R2Events/ev1",router=self.R2)
        self.R1.routeEventFrom(evtype="R3Events/ev1",router=self.R3)
        self.R2.routeEventFrom(evtype="R1Events/ev1",router=self.R1)
        self.R2.routeEventFrom(evtype="R3Events/ev1",router=self.R1)
        self.R3.routeEventFrom(evtype="R1Events/ev1",router=self.R1)
        self.R3.routeEventFrom(evtype="R2Events/ev1",router=self.R1)
        # Wildcard event type
        self.R1.routeEventFrom(source="R2Source/src1",router=self.R2)
        self.R1.routeEventFrom(source="R3Source/src1",router=self.R3)
        self.R2.routeEventFrom(source="R1Source/src1",router=self.R1)
        self.R2.routeEventFrom(source="R3Source/src1",router=self.R1)
        self.R3.routeEventFrom(source="R1Source/src1",router=self.R1)
        self.R3.routeEventFrom(source="R2Source/src1",router=self.R1)
        # Wildcard none
        self.R1.routeEventFrom(evtype="R2Events1/ev1",source="R2Source1/src1",router=self.R2)
        self.R1.routeEventFrom(evtype="R3Events1/ev1",source="R3Source1/src1",router=self.R3)
        self.R2.routeEventFrom(evtype="R1Events1/ev1",source="R1Source1/src1",router=self.R1)
        self.R2.routeEventFrom(evtype="R3Events1/ev1",source="R3Source1/src1",router=self.R1)
        self.R3.routeEventFrom(evtype="R1Events1/ev1",source="R1Source1/src1",router=self.R1)
        self.R3.routeEventFrom(evtype="R2Events1/ev1",source="R2Source1/src1",router=self.R1)
        # Cross routing event
        self.R1.routeEventFrom(evtype="RREvents2/ev1",source="RRSource2/src1",router=self.R2)
        self.R2.routeEventFrom(evtype="RREvents2/ev1",source="RRSource2/src1",router=self.R1)
        # 3-way loop routing event
        self.R1.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R2)
        self.R2.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R3)
        self.R3.routeEventFrom(evtype="RREvents3/ev1",source="RRSource3/src1",router=self.R1)
        return

    def close(self):
        self.R1.close()
        self.R2.close()
        self.R3.close()
        return

# Run test server directly from command line
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s.%(msecs)03d %(levelname)s %(message)s',
        datefmt="%H:%M:%S")
    if False:
        # Enable debug logging to a file
        fileloghandler = logging.FileHandler("TestEventHTTPServer.log","w")
        fileloghandler.setLevel(logging.DEBUG)
        filelogformatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        fileloghandler.setFormatter(filelogformatter)
        logging.getLogger('').addHandler(fileloghandler)
    # Create and start test server
    server = TestEventHTTPServer()
    server.start()

# End.
