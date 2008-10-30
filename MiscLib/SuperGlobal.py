# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#

import __main__

class SuperGlobal:
    """
    http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/457667

    Here so can use in testing.

    Creates globals.

    i.e.
    superglobal = SuperGlobal()
    superglobal.data = ....

    However many times you create SuperGlobal it access the same data.
    """

    def __getattr__(self, name):
        return __main__.__dict__.get(name, None)
        
    def __setattr__(self, name, value):
        __main__.__dict__[name] = value
        
    def __delattr__(self, name):
        if __main__.__dict__.has_key(name):
            del  __main__.__dict__[name]
