# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Define a type and function that mimics an asynchronously delivered value
(deferred) for synchronously determined values.
"""

class SyncDeferred:
    """
    Represents an asynchronously delivered value.
    This is a simple implementation that works in synchronous environments only.
    It is provided to establish a minimal interface that can be used in synchronous,
    multithreaded or asynchronous operating environments.

    This is not the same as a Twisted Deferred type, but it may be replaced with an 
    implemented based on such a value when used in a Twisted environment.
    """

    def __init__(self, value):
        """
        Initialize a new deferred object
        """
        self._value = value

    def syncValue(self):
        """
        Wait for value to be available, then return it
        """
        return self._value

def makeDeferred(value):
    """
    Construct a new Deferred object that returns the supplied value synchronously.
    """
    return SyncDeferred(value)

# End.
