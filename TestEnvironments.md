# Introduction #

The code in the project consists of server- and client- Python code, and client Javascript code for browser access.

A number of test environments are provided:
  * Stand-alone python unit tests
  * Stand-alone Javascript unit tests, run in browser
  * Integrated Python client/Python server tests
  * Integrated Javascript client/Python server tests
  * Selenium user interface tests

# Stand-alone python unit tests #

The test framework recognizes command line options to select tests to run, verbosity and log output: use `--help` to see the options.

  * `MiscLib/tests/TestAll.py`
  * `EventLib/tests/TestAll.py`

# Stand-alone Javascript unit tests #

Tests consist of synchronous tests that must be run in the jsUnit test runner, and asynchronous tests that are loaded directly into a browser.  (This is for historical reasons:  initially, testing was done using jsUnit, but this can't handle tests with asynchronous completion, so I switched to using the variant of SimpleTest provide by the MochiKit libraries.)

  * `.../tests/static/testRunner.html` - jsUnit test runner: load into browser to run jsUnit tests.  Note that the test suites use relative paths, and must be run using the jsUnit test runner loaded from the same directory.

  * `MiscLib/tests/static/TestAll.html` - run in jsUnit test runner
  * `EventLib/tests/static/TestAll.html` - run in jsUnit test runner

  * `MiscLib/tests/static/TestAsyncAll.html` - run directly in browser
  * `EventLib/tests/static/TestAsyncAll.html` - run directly in browser
  * Widget component tests - run directly in browser:
    * `WidgetLib/widgets/TestMvcUtils/TestMvcUtils.html`
    * `WidgetLib/widgets/TestSimpleButton/TestSimpleButton.html`
    * `WidgetLib/widgets/TestNumericDisplay/TestNumericDisplay.html`
    * (etc.)
  * To run all of the widget unit tests - run directly in browser:
    * `WidgetLib/widgets/TestAll.html`

Note: in order to keep all widget code together, I've departed from the previous code organization of having tests in a separate directory.  Each widget consists of a combination of Python, Javascript, HTML, CSS code, which need to be closely coordinated.


# Python client/Python server tests #

See source code for usage notes.

  * `EventLib/tests/TestEventHTTPClientServer.py`
  * `EventLib/tests/TestEventHTTPServer.py`
  * `EventLib/tests/TestEventHTTPClient.py`


# Javascript client/Python server tests #

  * `EventLib/tests/TestEventHTTPServer.py`
  * `EventLib/tests/JSProxy/start-jsproxy.py`
  * `EventLib/tests/static/TestAsyncEventRouterHTTP.html` - see source code for usage notes.

jsProxy needs CherryPy 2.x, runs on port 8080, and proxies requests of the form /Proxy/port to another HTTP server on the same machine (e.g. `http://localhost:8080/Proxy/8082`).

TestEventHTTPClientServer runs event routers for testing on ports 8082 and 8083.

The file `TestAsyncEventRouterHTTP.html` should be loaded into a browser via the proxy.  Browsing to `http://localhost:8080/` should display a page of links that can be clicked to activate various tests.  Note that the file `JSProxy/config/app.cfg` should be edited to reflect the root path for static files served by the proxy.

Slightly more methodical instructions are in the source module `TestAsyncEventRouterHTTP.html`.


# Selenium user interface tests #

Selenium tests are run from `TestServer`:  edit `app.cfg` as necessary, run `start-testserver.py`, browse to http://localhost:8080/, select "Selenium test suite for widgets" or "Quick selenium test suite for widgets", run tests using Selenium interface.

NOTE: the Selenium tests often fail due to timing variations, or some race condition between Selenium and then underlying event system - if a small number of failures are reported, try reloading the browser page and running the failed test again.  If each test passes at least once, the logic is working as intended.  Such failures usually follow a pattern indicative that an updated value on the web page is not yet visible to the test code, often with the exected value displayed on the web page.  Tests are more likely (but not certain) to succeed if the browser is freshly started.

  * `WidgetLib/tests/TestServer/testserver/config/app.cfg`
  * `WidgetLib/tests/TestServer/start-testserver.py`
  * `WidgetLib/tests/TestServer/testserver/static/selenese/Test_Quick.html`
  * `WidgetLib/tests/TestServer/testserver/static/selenese/Test_All.html`