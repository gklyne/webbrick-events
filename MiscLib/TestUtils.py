# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Support functions for running different test suites
#
# Test suites are selected using a command line argument or supplied parameter:
#
# Test classes are:
#   "unit"          These are stand-alone tests that all complete within a few 
#                   seceonds and do not depend on resources external to the 
#                   package being tested, (other than other libraries used).
#   "component"     These are tests that take loonger to run, or depend on 
#                   external resources, (files, etc.) but do not depend on 
#                   external services.
#   "integration"   These are tests that exercise interactions with seperate
#                   services.
#   "pending"       These are tests that have been designed and created, but 
#                   for which the corresponding implementation has not been
#                   completed.
#   "all"           return suite of unit, component and integration tests
#   name            a single named test to be run.
#

import sys
import logging
import unittest
import optparse

def getTestSuite(testclass,testdict,select="unit"):
    """
    Assemble test suite from supplied class, dictionary and selector
    
    testclass   is the test class whose methods are test cases
    testdict    is a dictionary of test cases in named test suite, 
                keyed by "unit", "component", etc., or by a named test.
    select      is the test suite selector:
                "unit"      return suite of unit tests only
                "component" return suite of component tests
                "integrate" return suite of integration tests
                "pending"   return suite of pending tests
                "all"       return suite of unit and component tests
                name        a single named test to be run
    """
    suite = unittest.TestSuite()
    # Named test only
    if select[0:3] not in ["uni","com","all","int","pen"]:
        if not hasattr(testclass, select):
            print "%s: no test named '%s'"%(testclass.__name__, select)
            return None
        suite.addTest(testclass(select))
        return suite
    # Select test classes to include
    if select[0:3] == "uni":
        testclasses = ["unit"]
    elif select[0:3] == "com":
        testclasses = ["component"]
    elif select[0:3] == "int":
        testclasses = ["integration"]
    elif select[0:3] == "pen":
        testclasses = ["pending"]
    elif select[0:3] == "all":
        testclasses = ["unit", "component"]
    else:
        testclasses = ["unit"]
    for c in testclasses:
        for t in testdict.get(c,[]):
            if not hasattr(testclass, t):
                print "%s: in '%s' tests, no test named '%s'"%(testclass.__name__, c, t)
                return None
            suite.addTest(testclass(t))
    return suite

def runTests(logname, getSuite, sysargs, testargs=[], select="unit"):
    """
    Run unit tests based on supplied command line argument values
    
    logname     name for logging output file, if used
    getSuite    function to retrieve test suite, given selector value
    sysargs     command line arguments (or equivalent values)
    testargs    is a list of additional test arguments descriptors that,
                if present, are supplied to the getTestSuite function as 
                a list of name/value pairs.  Entries look like this:
                  ["-x", "--xyz", "name", "desc"]
                The argument is required to take a string value.
                The supplied name and resulting value are passed in a 
                list of pairs as a testargs keyword parameter to the 
                getSuite function.
    select      is a default value for the tests to run if not specified by
                a command line value.
    """
    vrb = 1
    log_level = logging.WARNING
    filelog_level = logging.INFO
    log_file  = None

    # Log formatter for short records.
    filelogformatter = logging.Formatter('%(levelname)s %(name)s %(message)s', "%H:%M:%S")
    timedlogformatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s', "%H:%M:%S")
    logformat = filelogformatter

    # Get command line arguments
    parser = optparse.OptionParser(
                usage="%prog [options] (class|test-name)\n\n"\
                      "where class is 'unit', 'component', 'all', 'pending' or 'integration'",
                version="%prog $Rev$")
    parser.add_option("-d", "--debug", 
                      action="store_true", dest="debug", 
                      default=False,
                      help="Log debug output")
    parser.add_option("", "--filedebuglevel", 
                      action="store_true", dest="filedebug", 
                      default=False,
                      help="Log debug output to file.")
    parser.add_option("-i", "--info", 
                      action="store_true", dest="info", 
                      default=False,
                      help="Log info output")
    parser.add_option("-v", "--verbose", 
                      action="store_true", dest="verbose", 
                      default=False,
                      help="Display name of each test executed")
    parser.add_option("-l", "--logtofile", 
                      action="store_true", dest="logfile", 
                      default=False,
                      help="Log output to file")
    parser.add_option("-f", "--logfile", 
                      dest="logfilename", 
                      default="",
                      help="Log file name, sets --logtofile True")
    parser.add_option("-t", "--timed", 
                      action="store_true", dest="timed", 
                      default=False,
                      help="Add timestamps to log file")
    # Add caller-defined options
    for (x, xxx, mv, nam, desc) in testargs:
        parser.add_option(x, xxx, metavar=mv, action="store", type="string", dest=nam, default="", help=desc)
    (options, args) = parser.parse_args(sysargs)
    if len(args) > 2: parser.error("Too many arguments;  supply test name or class (default 'unit')")
    if options.info:   log_level = logging.INFO
    if options.debug:   
        log_level = logging.DEBUG
    if options.filedebug:   
        filelog_level = logging.DEBUG
    if options.verbose: vrb = 2
    
    if options.logfilename: 
        log_file = options.logfilename
    elif options.logfile:
        log_file = logname
    if options.timed: logformat = timedlogformatter

    # Set up logging now
    rootlogger = logging.getLogger('')
    rootlogger.setLevel(logging.DEBUG)  # Then filter in handlers for less.

    strhandler = logging.StreamHandler(sys.stdout)
    strhandler.setLevel(log_level)
    strhandler.setFormatter(logformat)
    rootlogger.addHandler(strhandler)
    
    if log_file:
        # Enable debug logging to a file
        fileloghandler = logging.FileHandler(log_file,"w")
        fileloghandler.setLevel(filelog_level)
        fileloghandler.setFormatter(logformat)
        rootlogger.addHandler(fileloghandler)

    # Adjust verbosity for test runner
    if len(args) > 1: select = args[1]
    if select[0:3] in ["uni","com","all","pen","int"]:
        if select[0:3] in ["com","all"]: vrb = 2
    else:
        # Run single test with elevated verbosity
        vrb = 2

    # Now run the tests
    runner = unittest.TextTestRunner(verbosity=vrb)
    if testargs:
        args   = [ (nam, options.__dict__[nam]) for (x, xxx, mv, nam, desc) in testargs ]
        tests  = getSuite(select=select, testargs=args)
    else:
        tests  = getSuite(select=select)
    if tests:
        testresult = runner.run(tests)
        if not testresult.wasSuccessful(): sys.exit(1)
    return

# End.
