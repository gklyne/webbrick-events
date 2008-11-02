# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#

import logging
from twisted.python import log

_log = logging.getLogger( "twisted" )

class TwistedLogObserver:
    """
    Log observer that writes to python logging.

    @type timeFormat: C{str} or C{NoneType}
    @ivar timeFormat: If not C{None}, the format string passed to strftime().
    """
    def __init__(self):
        pass

    def _safeFormat(self, fmtString, crap):
        #There's a way we could make this if not safer at least more
        #informative: perhaps some sort of str/repr wrapper objects
        #could be wrapped around the things inside of 'crap'. That way
        #if the event dict contains an object with a bad __repr__, we
        #can only cry about that individual object instead of the
        #entire event dict.
        try:
            text = fmtString % crap
        except KeyboardInterrupt:
            raise
        except:
            try:
                text = ('Invalid format string or unformattable object in log message: %r, %s' % (fmtString, crap))
            except:
                try:
                    text = 'UNFORMATTABLE OBJECT WRITTEN TO LOG with fmt %r, MESSAGE LOST' % (fmtString,)
                except:
                    text = 'PATHOLOGICAL ERROR IN BOTH FORMAT STRING AND MESSAGE DETAILS, MESSAGE LOST'
        return text

    def emit(self, eventDict):
        edm = eventDict['message']
        if not edm:
            if eventDict['isError'] and eventDict.has_key('failure'):
                text = ((eventDict.get('why') or 'Unhandled Error')
                        + '\n' + eventDict['failure'].getTraceback())
            elif eventDict.has_key('format'):
                text = self._safeFormat(eventDict['format'], eventDict)
            else:
                text = str(eventDict)
        else:
            text = str(edm)
        if eventDict['isError']:
            _log.error( text )
        else:
            _log.debug( text )
        #_log.debug( str(eventDict) )

    def start(self):
        """Start observing log events."""
        log.addObserver(self.emit)

    def stop(self):
        """Stop observing log events."""
        log.removeObserver(self.emit)

