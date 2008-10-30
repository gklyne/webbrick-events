#!C:\Dev\Python252\python.exe
#
# $Id$

# Use version 2, not version 3 of CherryPy
import sys
import glob
from os.path import *
cpfile = glob.glob(sys.prefix+"\\Lib\\site-packages\\cherrypy-2.*")
sys.path.insert(1, cpfile[0])
#print "path insert: ", cpfile[0]
#print '\n'.join(sys.path)

# Now can import TurboGears, etc.

import pkg_resources
pkg_resources.require("TurboGears")

from turbogears import config, update_config, start_server
import cherrypy
cherrypy.lowercase_api = True

# Add WidgetLibs directory to the python path:
sys.path.append("../..")

# Add Trunk to the python path:
sys.path.append("../../..")

# first look on the command line for a desired config file,
# if it's not on the command line, then
# look for setup.py in this directory. If it's not there, this script is
# probably installed
if len(sys.argv) > 1:
    update_config(configfile=sys.argv[1],
        modulename="testserver.config")
elif exists(join(dirname(__file__), "setup.py")):
    update_config(configfile="dev.cfg",modulename="testserver.config")
else:
    update_config(configfile="prod.cfg",modulename="testserver.config")
config.update(dict(package="testserver"))

from testserver.controllers import Root

print "WebBrick panel widgets test server"
print ""
print "*** NOTE ***"
print "File WebBrickGateway/panels/tests/TestServer/testserver/config/app.cfg must"
print "be edited so that definition 'webbrickRootDirectory' reflects the location"
print "of files to be served on this system"
print ""

start_server(Root())

# End.