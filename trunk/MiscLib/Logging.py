# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
"""
Functions for providing diagnostic information from an application.

This simplistic version uses standard error for log output by default.

Replacing the _logger function in this module by calling the SetLogger
function allows messages to be sent by alternative mechanisms.

The default logger uses the standard python logging module.
"""

import sys, logging
from StringIO import StringIO 

def SetLogger(newlogger):
    """
    Set a new logging function, and return the previous one.
    """
    global _logger
    oldlogger, _logger = _logger, newlogger
    return oldlogger

def FormatLogMessage(msg,context,level):
    """
    Generic log message formatter.
    This is a crude initial attempt:  I'm sure we could do much better.

    msg     - is message to be logged
    context - is a string describing the source of the message
              (can be used for filtering)
    level   - indicates the message severity: 
              0 - diagnostic, 1 - warning, 2 - error
    """
    if level == 0:
        leveltag = "TRACE"
    elif level == 1:
        leveltag = "INFO"
    elif level == 2:
        leveltag = "WARNING"
    elif level == 3:
        leveltag = "ERROR"
    else:
        leveltag = "UKNOWN"
    if context:
        context = context+": "
    return "%s%s - %s" % (context,leveltag,msg)

def DefaultLogger(msg,context,level):
    """
    Generic default logging function: output to standard error.
    msg     - is message to be logged
    context - is a string describing the source of the message
              (can be used for filtering)
    level   - indicates the message severity: 
              0 - diagnostic, 1 - warning, 2 - error
    """
    if False:   # True to log dirtect to stderr
        print >>sys.stderr, FormatLogMessage(msg,context,level)
    else:
        log = logging.getLogger(context)
# logging itself can add context, i.e. logger name
        if   ( level ==  0 ):
            log.debug(msg)
#            log.debug( "%s - %s"% (context,msg) )
        elif ( level ==  1 ):
            log.info(msg)
#            log.info( "%s - %s"% (context,msg) )
        elif ( level ==  2 ):
            log.warning(msg)
#            log.warning( "%s - %s"% (context,msg) )
        else:
            log.error(msg)
#            log.error( "%s - %s"% (context,msg) )

def Trace(msg,context=""):
    """
    Generate trace/diagnostic information message.
    """
    _logger(msg,context,0)
    #logging.debug( "%s - %s"% (context,msg) )
    
def Info(msg,context=""):
    """
    Generate information message.
    """
    _logger(msg,context,1)
    #logging.warning( "%s - %s"% (context,msg) )
    
def Warn(msg,context=""):
    """
    Generate warning message.
    """
    _logger(msg,context,2)
    #logging.warning( "%s - %s"% (context,msg) )
        
def Error(msg,context=""):
    """
    Generate error message.
    """
    _logger(msg,context,3)
    #logging.error( "%s - %s"% (context,msg) )

def Log(msg,context,level):
    """
    Generate any class of message
    """
    _logger(msg,context,level)

def formatDataStructureForLogging( sio, pyOb, level = 0 ):
    """
    Turn the passed object into a string for logging, this formats the object one 
    item per line with indentation to make the resulting log output easier to read.
    """
    pfx = "\n" + level * "  "
    if isinstance( pyOb, dict ):
        sio.write( "%sdictionary:" % (pfx) )
        for key in pyOb:
            sio.write( "%s  %s" % (pfx,key) )
            formatDataStructureForLogging( sio, pyOb[key], level + 2 )
    elif isinstance( pyOb, list ):
        sio.write( "%slist:" % (pfx) )
        for val in pyOb:
            formatDataStructureForLogging( sio, val, level + 1 )
    else:
        sio.write( "%s%s" % (pfx,pyOb) )

def debugLogDataStructure( log, pyOb ):
    """
    Log the contents of a python structure
    """
    if log.isEnabledFor( logging.DEBUG ):
        sio = StringIO()
        formatDataStructureForLogging( sio, pyOb )
        log.debug( sio.getvalue() )
        sio.close()

def infoLogDataStructure( log, pyOb ):
    """
    Log the contents of a python structure
    """
    if log.isEnabledFor( logging.INFO ):
        sio = StringIO()
        formatDataStructureForLogging( sio, pyOb )
        log.info( sio.getvalue() )
        sio.close()

_logger = DefaultLogger

# End.
