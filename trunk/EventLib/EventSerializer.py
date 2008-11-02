# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Event and event subscription serialization and deserialization.

This module provides functions for converting event forwarding envelopes,
event subsubscriptions and event unsubsubscriptions to and from a
serialized text format used for transmission between processes.
"""

from MiscLib.Logging   import Trace

# NOTE: simplejson escapes forward slashes "to prevent </script> attacks".
import simplejson   

from Event          import Event, makeEvent
from EventEnvelope  import EventEnvelope

# Serialize subscription, unsubscription and event envelope

def makeEnvelopeData(envelope):
    """
    Serialize event envelope for transmission.
    
    Format is 'forward:(path),<evtype>,<source>[:payload]'
    where 'path' is a list of one or more comma-separated router URIs (in <...>)
    describing the path of event forwarding so far.
    
    Note: in the present implementation, the payload must be a string value.
    """
    (event,path) = envelope.flatten()
    payload = event.getPayload()
    return simplejson.dumps(["forward",[path,event.getType(),event.getSource(),payload]])

def makeClosedownData():
    """
    Make a message payload that signifies closedown of the event router.
    """
    return simplejson.dumps(["closedown",[]])

def makeIdleData():
    """
    Make a message payload that signifies an idle (NOP) response on the connection.
    """
    return simplejson.dumps(["idle",[]])

# Parse serialized subscription, unsubscription and event envelope

def parseEnvelopeData(data):
    """
    Parse serialized event forwarding envelope data, returning a list:
       [[route,...], evtype, source, payload]
    or None if the serialized data does not match.
    """
    val = parseMessageData(data)
    if val is None or val[0] != "forward": return None
    return val[1]

def parseMessageData(data):
    """
    Parse serialized message data, returning a pair:
       [type, data]
    where 'data' is the individual message parse, and type is one
    of "forward", "closedown" or "idle"
    or return None if the serialized data does not match.
    """
    try:
        val = simplejson.loads(data)
    except ValueError:
        return None
    if not isinstance(val,list) or (len(val) != 2) or not isinstance(val[1],list):
        return None
    if val[0] in ["idle", "closedown"] and val[1] == []:
        return val
    if val[0] == "forward":
        # val[1] is [path,type,source,"payload"]
        if len(val[1]) == 4: return val
    return None

# End.

