# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Unit testing for WebBrick library functions (Functions.py)
# See http://pyunit.sourceforge.net/pyunit.html
#

import sys
import unittest
import re
from os import *
from os.path import *

sys.path.append("../..")
from MiscLib.ScanFiles import *
from MiscLib.Functions import compareLists

class TestScanFiles(unittest.TestCase):
    def setUp(self):
        if exists("./MiscLib/tests/resources/"):
            # assume being run as part of overall test of WebBrickLibs.
            self.testpath = "./MiscLib/tests/resources/"
        else:
            self.testpath = "resources/"
        self.testpatt = re.compile( r'^TestScanFiles.*\.txt$' )
        return

    def tearDown(self):
        return

    # Actual tests follow

    def testCollectShallow(self):
        files    = CollectFiles(self.testpath,self.testpatt,recursive=False)
        expected = [ (self.testpath,"TestScanFiles1.txt")
                   , (self.testpath,"TestScanFiles2.txt")
                   ]
        assert compareLists(files, expected) == None, "Wrong file list: "+repr(files)

    def testCollectRecursive(self):
        files    = CollectFiles(self.testpath,self.testpatt)
        expected = [ (self.testpath,"TestScanFiles1.txt")
                   , (self.testpath,"TestScanFiles2.txt")
                   , (self.testpath+"TestScanFilesSubDir","TestScanFiles31.txt")
                   , (self.testpath+"TestScanFilesSubDir","TestScanFiles32.txt")
                   ]
        assert compareLists(files, expected) == None, "Wrong file list: "+repr(files)

    def testJoinDirName(self):
        # normpath used here to take care of dir separator issues.
        n = joinDirName("/root/sub","name")
        assert n==normpath("/root/sub/name"), "JoinDirName failed: "+n
        n = joinDirName("/root/sub/","name")
        assert n==normpath("/root/sub/name"), "JoinDirName failed: "+n
        n = joinDirName("/root/sub/","/name")
        assert n==normpath("/name"), "JoinDirName failed: "+n

    def testReadDirNameFile(self):
        assert readDirNameFile(self.testpath,"TestScanFiles1.txt"), "Read dir,file 'TestScanFiles1.txt' failed"

    def testReadFile(self):
        assert readFile(self.testpath+"TestScanFiles1.txt"), "Read file 'TestScanFiles1.txt' failed"


# Code to run unit tests directly from command line.
# Constructing the suite manually allows control over the order of tests.
def getTestSuite():
    suite = unittest.TestSuite()
    suite.addTest(TestScanFiles("testCollectShallow"))
    suite.addTest(TestScanFiles("testCollectRecursive"))
    suite.addTest(TestScanFiles("testJoinDirName"))
    suite.addTest(TestScanFiles("testReadDirNameFile"))
    suite.addTest(TestScanFiles("testReadFile"))
    return suite

if __name__ == "__main__":
    runner = unittest.TextTestRunner()
    if runner.run(getTestSuite()).wasSuccessful(): sys.exit(1)
    sys.exit(1)
