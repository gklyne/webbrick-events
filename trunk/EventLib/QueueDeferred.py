# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Define a type and function that implements an asynchronously delivered value
(deferred) by waiting for queue element to be processed.
"""

from MiscLib.Logging   import Trace

from Queue     import Queue
from threading import Event

class QueueDeferred:
    """
    Represents an asynchronously delivered value, by requiring that a specified 
    queue be empty, or an event be triggered, before returning the specified value.
    
    The presumption is that the event will be set whenever an item removed from 
    the queue has been processed.    
    """

    def __init__(self, value, queue, event):
        """
        Initialize a new deferred object
        """
        self._value = value
        self._queue = queue
        self._event = event

    def syncValue(self):
        """
        Wait for value to be available, then return it
        """
        Trace("QueueDeferred.syncValue (%s)"%(str(self._value)), context="EventLib.QueueDeferred")
        self._event.clear()
        if not self._queue.empty():
            self._event.wait(timeout=20)        # Timeout is precaution to prevent total lockout
        return self._value

def makeQueueDeferred(value, queue, event):
    """
    Construct a new Deferred object that returns the supplied value synchronously.
    """
    return QueueDeferred(value, queue, event)

# End.
