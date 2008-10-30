import sys
print sys.path
sys.path.append("C:\\Dev\\selenium-remote-control-0.9.0\\python")
print sys.path

from selenium import selenium
import unittest, time, re

baseuri = "file://localhost/D:/Svn/Thirtover/HomeGateway2/Trunk/WebBrickLibs/EventLib/tests/static/"

class SimpleTest(unittest.TestCase):
    def setUp(self):
        self.verificationErrors = []
        self.selenium = selenium("localhost", 4444, "*firefox", "http://localhost:4444")
        self.selenium.start()
    
    def test_simple(self):
        sel = self.selenium
        print("This is a Selenium test command")
        sel.open(baseuri+"SimpleTestPage.html")
        try: self.assertEqual("Simple Test Page", sel.get_title())
        except AssertionError, e: self.verificationErrors.append(str(e))

        #     <tr>
        #       <td>cmd</td>
        #       <td>target</td>
        #       <td>&nbsp;</td>
        #     </tr>

    
    def tearDown(self):
        time.sleep(20)
        self.selenium.stop()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
