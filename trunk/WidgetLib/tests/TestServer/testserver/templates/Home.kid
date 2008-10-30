<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:py="http://purl.org/kid/ns#"
    py:extends="'TestMaster.kid'">

<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type" py:replace="''"/>
<title>TestServer</title>
</head>

<body>
  <h1>TestServer test server - internal links</h1>

  <h2>Load test pages direct into browser</h2>
  <ul>
    <li><a href="/panels">/panels</a> - Panel files</li>
    <li><a href="/Tests/Default?name=button1&amp;id=field1">/Tests/Default</a> - Default test case</li>
    <li><a href="/Tests/TestSimpleButton?name=button1&amp;id=field1">/Tests/TestSimpleButton</a> - Simple button test page</li>
    <li><a href="/Tests/TestNumericDisplay?name=display1&amp;id=field1">/Tests/TestNumericDisplay</a> - Simple button test page</li>
    <li><a href="/Tests/TestButtonAndDisplay?buttonname=button1&amp;buttonid=field1&amp;displayname=display1&amp;displayid=field2">/Tests/TestButtonAndDisplay</a> - Button and display test page</li>
    <li><a href="/Tests/TestCountdownDisplay?count=5">/Tests/TestCountdownDisplay</a> - Countdown display test page</li>
    <li><a href="/Tests/TestTempSetPoint">/Tests/TestTempSetPoint</a> - Temperature set point test page</li>
    <li><a href="/Tests/TestTempSetPointParameterized">/Tests/TestTempSetPointParameterized</a> - Parameterized temperature set point test page</li>
    <li><a href="/Tests/TestModeSelector">/Tests/TestModeSelector</a> - Mode selector test page</li>
  </ul>

  <h2>Exercise test pages with Selenium test cases</h2>
  <ul>
    <li><a href="/selenium/core/TestRunner.html">/selenium/core/TestRunner.html</a> - Selenium core test suite (tests Selenium)</li>
    <li><a href="/selenium/core/TestRunner.html?test=%2Fselenese%2FTest_All.html">Selenium test suite for widgets</a></li>
    <li><a href="/selenium/core/TestRunner.html?test=%2Fselenese%2FTest_Quick.html">Quick selenium test suite for widgets</a></li>
  </ul>

  <h2>Non-interactive tests</h2>
  <ul>
    <li><a href="/static/TestTestEventResponder.html">/static/TestTestEventResponder.html</a> - test event responder in test server (sed quis costodiet ipsos custodes?)</li>
  </ul>

  <h2>Links to check out proxy forwarding to other servers on this host</h2>
  <ul>
    <li><a href="/Proxy/8082">/Proxy/8082</a> - Forward to port 8082</li>
    <li><a href="/Proxy/8083">/Proxy/8083</a> - Forward to port 8083</li>
    <li><a href="/Proxy/8082/abc">/Proxy/8082/abc</a> - Forward to port 8082, path /abc</li>
    <li><a href="/Proxy/8082/abc/def?q1=r1&amp;q2=r2">/Proxy/8082/abc/def?q1=r1&amp;q2=r2</a> - Forward to port 8082, path /abc/def?q1=r1&amp;q2=r2</li>
  </ul>
</body>

</html>
