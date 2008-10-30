#!C:\Dev\Python251\python.exe

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

# first look on the command line for a desired config file,
# if it's not on the command line, then
# look for setup.py in this directory. If it's not there, this script is
# probably installed
if len(sys.argv) > 1:
    update_config(configfile=sys.argv[1],
        modulename="jsproxy.config")
elif exists(join(dirname(__file__), "setup.py")):
    update_config(configfile="dev.cfg",modulename="jsproxy.config")
else:
    update_config(configfile="prod.cfg",modulename="jsproxy.config")
config.update(dict(package="jsproxy"))

from jsproxy.controllers import Root

start_server(Root())
