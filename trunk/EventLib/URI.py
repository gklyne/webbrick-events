# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Event-related URI definitions
"""

from urlparse import urljoin
from time     import localtime, time

# Status URIs

StatusBaseUri        = "http://id.webbrick.co.uk/status/"

Status_OK            = urljoin(StatusBaseUri, "OK")
Status_NONE          = urljoin(StatusBaseUri, "NONE")
Status_SUBSCRIBED    = urljoin(StatusBaseUri, "SUBSCRIBED")
Status_TRIGGERED     = urljoin(StatusBaseUri, "TRIGGERED")
Status_UNSUBSCRIBED  = urljoin(StatusBaseUri, "UNSUBSCRIBED")

# Event types

EventBaseUri         = "http://id.webbrick.co.uk/events/"

EventDefaultType     = urljoin(EventBaseUri, "default")
EventSubscribeType   = urljoin(EventBaseUri, "subscribe")
EventCloseType       = urljoin(EventBaseUri, "close")

# Event agent, source and target base URIs

EventAgentBase       = "http://id.webbrick.co.uk/agent/"
EventSourceBase      = "http://id.webbrick.co.uk/source/"
EventTargetBase      = "http://id.webbrick.co.uk/target/"

# Get current date in form suitable for use as URI path segment: YYYYMMDD

# Date/time functions for constructing unique URIs

def uriDate(timeval=None):
    """
    Return specified or current date as yyyymmdd
    """
    if not timeval: timeval = time()
    return "%04u%02u%02u"%(localtime(timeval)[0:3])

def uriTime(timeval=None):
    """
    Return specified or current time as hhmmss
    """
    if not timeval: timeval = time()
    return "%02u%02u%02u"%(localtime(timeval)[3:6])

def uriDateTime(timeval=None):
    """
    Return specified or current time as yyyymmddThhmmss
    """
    if not timeval: timeval = time()
    return "%04u%02u%02uT%02u%02u%02u"%(localtime(timeval)[0:6])

# Get current date in form suitable for use as URI path segment: YYYYMMDD

# End.
