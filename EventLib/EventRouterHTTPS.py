# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
HTTP server event router implementation.

HTTP server and client event routers are connected,  all events received by one party 
are forwarded to the other.
"""

from Queue     import Queue, Empty
import socket
import threading        # Thread, Event
import time
import StringIO

from BaseHTTPServer      import HTTPServer, BaseHTTPRequestHandler

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

HTTP_RESPONSE_TIMEOUT = 2;     # HTTP response timeout in seconds
QUEUE_WAIT_TIMEOUT    = 1;     # Internal queue waiting in seconds

class EventRouterHTTPS(EventRouter):
    """
    This is a derivation of the EventRouter class that prpovides the same basic
    interface, but which also sends and reveives events using an HTTP connection.
    
    The constructed class is an unmodified EventRouter, but the initializer also 
    creates and HTTP server event relay (see below) and hooks it up to the
    EventRouter constructed here.
    """

    def __init__(self, uri=None, hostif='', port=8082 ):
        """
        Initialize a new HTTP client event router object

        uri     is a URI for this event router.  A new URI derived from this is created
                for the HTTP client event relay.
        hostif  is the IP address of host interface on which the HTTP server listens.
        port    is the TCP port number to which the HTTP connection is made.
        """
        super(EventRouterHTTPS, self).__init__(uri)
        relayuri = self.getUri()+"/HTTPS"
        self._relay = EventRelayHTTPS(self, relayuri, hostif, port)
        return

    def close(self):
        """
        Function called to close down event router.
        """
        self._relay.close()
        super(EventRouterHTTPS, self).close()
        return

class EventRelayHTTPS(EventAgent):
    """
    Implements an HTTP server event relay that runs as a separate thread until 
    explicitly closed, based on the simple event router.

    The HTTP connection operates as a half duplex channel for sending and
    receiving events, with the direction of flow being controlled by the
    client:  a GET request is implicitly a request for an event to be delivered
    and blocks until an event is available, the request timeout period expires,
    or the client cancels the request;  a POST request supplies an event to be 
    delivered and/or forwarded.

    Incoming events are queued for the server process, to trigger completion 
    of an outstanding HTTP GET request, or of the next HTTP GET request if none 
    is outstanding.
    """

    # Notes:
    # For server timeout, see 
    #   http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/425210
    #   http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/499376

    def __init__(self, router, uri=None, hostif='', port=8082 ):
        """
        Initialize a new HTTP server event relay  object
        
        An HTTP server is associated with an existing event router, and
        sends all messages received from that router to the HTTP connection,
        and forwards all messages received from the HTTP connection to the
        router.

        Interaction with the indicated EventRouter object takes place primarily
        through the 'receive' methods of this class and the supplied router.
        Because messages received from HTTP are sent onwards using the normal
        forwarding mechanisms, this class must perform loop-detection to stop 
        incoming events being bounced back to the HTTP connection.
        """
        super(EventRelayHTTPS, self).__init__(uri)
        self._router  = router
        self._queue   = Queue()
        self._event   = threading.Event()
        self._closing = False
        # Have 'router' send all events to this object
        router.routeEventFrom(None, None, self)
        router.doSubscribeRequest(self, -1, None, None)
        # Create and start HTTP server in new thread
        self._server  = EventRequestServer(self, 
            HTTP_RESPONSE_TIMEOUT, (hostif,port), EventRequestHandler)
        self._thread  = self._server.start()
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
            Trace("%s receive %s"%(self.getUri(),str(event)), "EventLib.EventRelayHTTPS")
            return self.queueItem(["forward",envelope])
        return makeDeferred(StatusVal.OK)

    def forward(self, event, env):
        """
        Internal function to process event received from HTTP connection: 
        add new hop to envelope and pass it straight on to the associated router object.
        """
        return self._router.receive(self, env.nextHop(self.getUri()))

    def close(self):
        """
        Shut down the event router thread
        """
        # assert False,"EventRelayHTTPS .close called"
        Trace("%s close"%(self.getUri()), "EventLib.EventRelayHTTPS")
        self._closing = True
        self._event.set()
        self._queue.put(["closedown",[]])
        self._server.stop()
        Trace("%s stopped"%(self.getUri()), "EventLib.EventRelayHTTPS")
        self._thread.join()
        Trace("%s closed"%(self.getUri()), "EventLib.EventRelayHTTPS")
        return

    def queueItem(self, item):
        """
        Add an item to the queue, and returned a Deferred object that fires when an item
        is removed or the queue is empty.
        """
        Trace("%s queueItem: %s"%(self.getUri(),str(item)), "EventLib.EventRelayHTTPS")
        if not self._closing:
            self._queue.put(item)
            # Waiting for item to be removed from queue means we wait for 
            # the client to make a request, which is not predictable.
            ### return makeQueueDeferred(StatusVal.OK, self._queue, self._event)
        return makeDeferred(StatusVal.OK)

    def getQueuedItem(self):
        """
        Wait for an item to be queued, then return it.
        """
        try:
            item = self._queue.get(timeout=QUEUE_WAIT_TIMEOUT)
        except Empty:
            Trace("%s getQueuedItem: timeout"%(self.getUri()), "EventLib.EventRelayHTTPS")
            item = ["idle",[]]
        Trace("%s getQueuedItem: item %s"%(self.getUri(),str(item)), "EventLib.EventRelayHTTPS")
        self._event.set()
        return item

# --- HTTP request handler class ---

class EventRequestHandler(BaseHTTPRequestHandler):
    """
    Request handler class for event router server.
    
    This class embodies much of the key event handling logic.
    
    The design is that all event processing is handled as during the
    processing of a received HTTP request from the client.  Until such
    a request is received, queued events from the calling process are
    just left in the queue.  Further, outgoing events are sent only in
    response to HTTP GET requests.

    GET requests are timed out with an "idle" response by the server after 
    a reasonable interval (currently 1 sec), allowing the client to send 
    any requests coming from its end of the connection.  In the absence of 
    any such requests, the GET can simply be re-issued.   This is an 
    interim solution to allow pseudo-full-duplex operation over a single 
    HTTP connection.
    
    If the client needs to send an event while waiting for a response,
    other possible approaches include (a) terminate the GET request, or 
    (b) use a separate connection to another event router.
    The latter is preferred as terminating a request might conceivably result 
    in loss of an event (if it has been de-queued but not yet fully returned).

    TODO: investigate this last assertion - do requests-in-progress get to
    complete when an outstanding request is cancelled?
    """

    def do_GET(self):
        """
        Wait for event to send to client, then return it to the client.
        """
        [typ,env] = self.getRelay().getQueuedItem()
        Info("%s do_GET [%s,%s]: "%(self.getRelay().getUri(),typ,env), "EventLib.EventRelayHTTPS")
        if typ == "closedown":
            self.send_error(503, "Request aborted - closing down") 
            return
        if typ == "idle":
            data = makeIdleData()
        elif typ == "forward":
            data = makeEnvelopeData(env)
        else:
            raise ValueError, "unexpected message type: "+str(typ)
        self.send_response(200, "OK "+typ)
        self.send_header('Content-type', 'application/octet-stream') 
        self.send_header('Content-length', str(len(data)))
        self.end_headers() 
        # Now write data
        Info("%s do_GET data: %s"%(self.getRelay().getUri(),data), "EventLib.EventRelayHTTPS")
        self.wfile.write(data)

    #def do_head(self):
    #    .... not defined for now ....

    def do_POST(self):
        """
        The client is forwarding an event or subscription request:
        it needs to be processed for the underlying local event router.
        """
        router  = self.getRelay()
        msgbody = ""
        l       = int(self.headers.get("content-length","0"))
        if l:
            msgbody = self.rfile.read(l)
        Info("%s do_POST: '%s'"%(self.getRelay().getUri(),msgbody), "EventLib.EventRelayHTTPS")
        # Parse message and act accordingly
        msgdata = parseMessageData(msgbody)
        if msgdata == None:
            self.send_error(400, "Request body malformed") 
            return
        if msgdata[0] == "forward":
            # msgdata = ["forward", [['R1', 'R2', 'R3'], 'ev:typ', 'ev:src', 'payload']]
            event = makeEvent(evtype=msgdata[1][1],source=msgdata[1][2],payload=msgdata[1][3])
            env   = constructEnvelope(msgdata[1][0], event)
            self.getRelay().forward(event, env)
        elif msgdata[0] == "idle":
            self.send_response(200, "OK idle")
            self.end_headers() 
            return            
        elif msgdata[0] == "closedown":
            self.send_response(200, "OK closedown")
            self.end_headers() 
            return            
        else:
            self.send_error(400, "Request body unrecognized option: "+msgdata[0])
            return

        # Complete request with success response
        self.send_response(200, "OK")
        self.end_headers() 

    def log_message(self, format, *args):
        """
        Override default request logging
        """
        Info(self.getRelay().getUri() + " " + (format%args), "EventLib.EventRelayHTTPS-log")

    def getRelay(self):
        """
        Return reference to HTTP event relay object for this request.
        """
        return self.server._relay


# --- HTTP server class, runs server in a new thread ---

class EventRequestServer(HTTPServer):
    """
    HTTP server with provision for request cancellation, 
    and link back to event router object.
    
    Key logic taken from here:
    http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/425210
    """

    def __init__(self, relay, timeout, *args):
        """
        Construct event request server object
        """
        # super(EventRequestServer, self).__init__(*args)
        self._relay   = relay
        self._timeout = timeout
        HTTPServer.__init__(self, *args)
        return

    def server_bind(self):
        """
        Override server_bind to set timeout on listening socket.
        """
        HTTPServer.server_bind(self)
        self.socket.settimeout(self._timeout)
        self._run = True
        return

    def get_request(self):
        """
        Override get_request to deal with timeouts and detect stop request
        """
        while self._run:
            try:
                # Trace("%s get_request listening..."%(self._relay.getUri()), "EventLib.EventRelayHTTPS")
                sock, addr = self.socket.accept()
                Trace("%s get_request returning"%(self._relay.getUri()), "EventLib.EventRelayHTTPS")
                sock.settimeout(None)
                return (sock, addr)
            except socket.timeout:
                ### Trace("%s get_request timed out"%(self._relay.getUri()), "EventLib.EventRelayHTTPS")
                pass
            return (None, None)
        
    def close_request(self, request):
        """
        Override close_request to deal with None request at closedown
        """
        Trace("%s close_request %s"%(self._relay.getUri(), str(request)), "EventLib.EventRelayHTTPS")
        if request: 
            # super(EventRequestServer, self).close_request(request)
            HTTPServer.close_request(self, request)
        
    def process_request(self, request, client_address):
        """
        Override process_request to deal with None request at closedown
        """
        if request: 
            # super(EventRequestServer, self).process_request(request, client_address)
            # This call creates a requesthandler class instance
            HTTPServer.process_request(self, request, client_address)

    def start(self):
        """
        Start server running in a new thread, returning the thread object.
        """
        t = threading.Thread(target=self.serve)
        t.start()
        return t

    def stop(self):
        """
        Request server to stop.
        """
        Trace("%s stop"%(self._relay.getUri()), "EventLib.EventRelayHTTPS")
        self._run = False
        time.sleep(self._timeout+1)
        self.socket.close()

    def serve(self):
        """
        Serve requests until requested to stop.
        """
        while self._run:
            self.handle_request()

# End.

