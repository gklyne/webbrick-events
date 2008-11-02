# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
HTTP client event router implementation.

HTTP server and client event routers are connected,  all events, and forwarding 
subscriptions received by one party are forwarded to the other.  Further, all 
local subscriptions and event publication are handled as for a standard event router.
"""

from Queue     import Queue
import threading        # Thread, Event
import httplib
import socket
import time

from MiscLib.Logging     import Trace, Info, Warn

from Status              import StatusVal
from Event               import makeEvent
from EventEnvelope       import constructEnvelope
from EventSerializer     import ( makeEnvelopeData, makeClosedownData, makeIdleData, 
                                  parseMessageData )
from QueueDeferred       import makeQueueDeferred
from SyncDeferred        import makeDeferred
from EventAgent          import EventAgent
from EventRouter         import EventRouter

class EventRouterHTTPC(EventRouter):
    """
    This is a derivation of the EventRouter class that prpovides the same basic
    interface, but which also sends and reveives events using an HTTP connection.
    
    The constructed class is an unmodified EventRouter, but the initializer also 
    creates and HTTP client event relay (see below) and hooks it up to the
    EventRouter constructed here.
    """

    def __init__(self, uri=None, host='', port=8082 ):
        """
        Initialize a new HTTP client event router object

        uri     is a URI for this event router.  A new URI derived from this is created
                for the HTTP client event relay.
        host    is the IP address of host name to which the HTTP connection is made.
        port    is the TCP port number to which the HTTP connection is made.
        """
        super(EventRouterHTTPC, self).__init__(uri)
        relayuri = self.getUri()+"/HTTPC"
        self._relay = EventRelayHTTPC(self, relayuri, host, port)
        return

    def close(self):
        """
        Function called to close down event router.
        """
        self._relay.close()
        super(EventRouterHTTPC, self).close()
        return


class EventRelayHTTPC(EventAgent):
    """
    Implements an HTTP client event router that runs as a separate thread until 
    explicitly closed, which runs in tandem with a simple event router and
    provides a tiny subset of the event router interface (receive).

    The HTTP connection operates as a half duplex channel for sending and
    receiving events, with the direction of flow being controlled by the
    client:  a GET request is implicitly a request for an event to be delivered
    and blocks until an event is available, the request timeout period expires,
    or the client cancels the request;  a POST request supplies an event to be 
    delivered and/or forwarded.

    Incoming events are queued for the client process, and are handled by the 
    HTTP client running in its separate thread.
    """

    def __init__(self, router, uri=None, host='', port=8082 ):
        """
        Initialize a new HTTP client event passing object
        
        An HTTP client is associated with an existing event router, and
        sends all messages received from that router to the HTTP connection,
        and forwards all messages received from the HTTP connection to the
        router.

        Interaction with the indicated EventRouter object takes place primarily
        through the 'receive' methods of this class and the supplied router.
        Because messages received from HTTP are sent onwards using the normal
        forwarding mechanisms, this class must perform loop-detection to stop 
        events being bounced back to the HTTP connection.
        """
        super(EventRelayHTTPC, self).__init__(uri)
        self._router  = router
        self._queue   = Queue()
        self._event   = threading.Event()
        self._closing = False
        # Have 'router' send all subscriptions events to this object
        router.routeEventFrom(None, None, self)
        router.doSubscribeRequest(self, -1, None, None)
        # Create HTTP "connection", and start thread to respond to new events from it.
        self._httpcon = httplib.HTTPConnection(host=host, port=port)
        self._thread  = threading.Thread(name=uri, target=self.processEvent)
        self._thread.start()
        return

    def receive(self, fromrouter, envelope):
        """
        This function receives messages from the associated router and queues
        them for transmission on the HTTP interface.

        NOTE: receive and forward here perform loop-check for outgoing events, 
        and add the extra envelope hop for incoming.  The sole purpose of this 
        loop-check is to prevent incoming HTTP events from being sent out again.
        """
        event = envelope.unWrap(self.getUri())
        if event:
            Trace("%s receive %s from %s"%(self.getUri(),event,fromrouter), "EventLib.EventRelayHTTPC")
            return self.queueItem(["forward",envelope])
        return makeDeferred(StatusVal.OK)

    def forward(self, event, env):
        """
        Internal function to process event received from HTTP connection: 
        add new hop to envelope and pass it straight on to the associated router object.
        """
        Trace("%s forward %s"%(self.getUri(),event), "EventLib.EventRelayHTTPC")
        return self._router.receive(self, env.nextHop(self.getUri()))

    def close(self):
        """
        Shut down the event router thread
        """
        Trace("%s close"%(self.getUri()), "EventLib.EventRelayHTTPC")
        self._httpcon.close()
        self._closing = True
        self._event.set()
        self._queue.put(["closedown",[]])
        self._thread.join()
        Trace("%s closed"%(self.getUri()), "EventLib.EventRelayHTTPC")
        return

    def queueItem(self, item):
        """
        Add item to the queue, and return a deferred object that fires when an item is removed
        (or the queue is empty).
        """
        Trace("%s queueItem (%s)"%(self.getUri(),item), "EventLib.EventRelayHTTPC")
        if not self._closing:
            self._queue.put(item)
            return makeQueueDeferred(StatusVal.OK, self._queue, self._event)
        return makeDeferred(StatusVal.OK)

    def getQueuedItem(self):
        """
        Wait for an item to be queued, then return it.
        """
        Trace("%s getQueuedItem ..."%(self.getUri()), context="EventLib.EventRelayHTTPC")
        item = self._queue.get()
        Trace("%s getQueuedItem (%s)"%(self.getUri(),item), context="EventLib.EventRelayHTTPC")
        self._event.set()
        return item

    # --- HTTP client worker thread function ---

    def processEvent(self):
        """
        This function is the HTTP client worker thread.
        """
        # Note: break out of event dispatch loop when closedown event is received
        # and closing flag is set.  This is to prevent DoS attack by faked closedown 
        # event type, and to ensure that prior events received are all processed.
        delay_on_error_min = 0.125              # Back off retry interval on error..
        delay_on_error_max = 20.0               # ..
        delay_on_error     = delay_on_error_min # ..
        while True:
            if delay_on_error < delay_on_error_max:
                delay_on_error *= 2
            try:
                if not self._queue.empty():
                    Trace("%s queue.get ..."%(self.getUri()), "EventLib.EventRelayHTTPC")
                    ###msgbody = self._queue.get()
                    ###Trace("%s get msgbody: %s"%(self.getUri(),msgbody), "EventLib.EventRelayHTTPC")
                    ###self._event.set()
                    msgbody = self.getQueuedItem()
                    [typ,env] = msgbody
                    if typ == "closedown":
                        if self._closing: break
                    else:
                        # process request as an HTTP POST request
                        data    = makeEnvelopeData(env)
                        headers = { "Content-type": "text/plain",
                                    "Accept": "text/plain",
                                    "Content-length": str(len(data)) }
                        self._httpcon.request("POST", "/request_path_ignored", data, headers)
                        response = self._httpcon.getresponse()
                        delay_on_error = delay_on_error_min
                else:
                    # Nothing in queue:
                    # issue a GET for incoming events
                    Trace("%s HTTP get ..."%(self.getUri()), "EventLib.EventRelayHTTPC")
                    headers = { "Accept": "text/plain" }
                    self._httpcon.request("GET", "/request_path_ignored", None, headers)
                    response = self._httpcon.getresponse()
                    if response.status == 200:
                        delay_on_error = delay_on_error_min
                        msgbody = response.read()
                        Trace("%s get msgbody: %s"%(self.getUri(),msgbody), "EventLib.EventRelayHTTPC")
                        # Parse message and act accordingly
                        msgdata = parseMessageData(msgbody)
                        Trace("%s get msgdata: %s"%(self.getUri(),str(msgdata)), "EventLib.EventRelayHTTPC")
                        if msgdata == None:
                            #TODO: Log "Request body malformed"
                            pass
                        elif msgdata[0] == "forward":
                            # msgdata = ["forward", [['R1', 'R2', 'R3'], 'ev:typ', 'ev:src', 'payload']]
                            event = makeEvent(evtype=msgdata[1][1],source=msgdata[1][2],payload=msgdata[1][3])
                            env   = constructEnvelope(msgdata[1][0], event)
                            self.forward(event, env)
                        elif msgdata[0] == "idle":
                            # Idle response gives client a chance to send if anything is queued
                            pass
                        else:
                            #TODO: handle closedown message?
                            Warn( "%s Request body unrecognized option: %s"%(self.getUri(),msgdata[0]), "EventRelayHTTPC")
                            pass
                    elif response.status == 503:
                        Trace( "%s processEvent error response: %u, %s"%(self.getUri(),response.status,response.reason), "EventLib.EventRelayHTTPC")
                        # Remote end closed down
                        break
                    else:
                        # TODO: (log error response)
                        Warn( "%s processEvent error response: %u, %s"%(self.getUri(),response.status,response.reason), "EventLib.EventRelayHTTPC")
                        time.sleep(delay_on_error)
            except httplib.BadStatusLine, e:
                # This can happen at closedown
                Info( "%s processEvent bad response: %s"%(self.getUri(), str(e)), "EventLib.EventRelayHTTPC")
                time.sleep(delay_on_error)
            except httplib.CannotSendRequest, e:
                # This can happen at closedown
                Info( "%s Cannot send request: %s"%(self.getUri(), str(e)), "EventLib.EventRelayHTTPC")
                time.sleep(delay_on_error)
            except httplib.ResponseNotReady, e:
                # This can happen at startup and sometimes other times:
                # maybe multiple requests on a single HTTP connection object?
                Info( "%s Response not ready: (%s)"%(self.getUri(), str(e)), "EventLib.EventRelayHTTPC")
                time.sleep(delay_on_error)
            except socket.error, e:
                Warn( "%s Socket error: %s"%(self.getUri(), str(e)), "EventLib.EventRelayHTTPC")
                time.sleep(delay_on_error)
        return

# End.

