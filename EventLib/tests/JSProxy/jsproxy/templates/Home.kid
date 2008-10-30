<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:py="http://purl.org/kid/ns#"
    py:extends="'master.kid'">

<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type" py:replace="''"/>
<title>JSProxy</title>
</head>

<body>
  <div id="main_content">
  <h1>JSProxy test server - internal links</h1>
    <ul>
      <li><a href="/EventLib">/EventLib</a> - Static files</li>
      <li><a href="/EventLib/">/EventLib/</a> - Static files</li>
      <li><a href="/EventLib/tests/static/">/EventLib/tests/static/</a> - static files</li>
      <li><a href="/EventLib/TODO.txt">/EventLib/TODO.txt</a> - Static file</li>
      <li><a href="/EventLib/tests/static/TestFile.txt">/EventLib/tests/static/TestFile.txt</a> - Static file</li>
      <li><a href="/EventLib/tests/static/TestFile.html">/EventLib/tests/static/TestFile.html</a> - Static file</li>
      <li><a href="/EventLib/static/javascript/URI.js">/EventLib/static/javascript/URI.js</a> - Javascript file</li>
      <li><a href="/EventLib/tests/static/TestAsyncEvent.html">/EventLib/tests/static/TestAsyncEvent.html</a> - Javascript event test</li>
      <li><a href="/EventLib/tests/static/TestAsyncEventHandler.html">/EventLib/tests/static/TestAsyncEventHandler.html</a> - Javascript event handler test</li>
      <li><a href="/EventLib/tests/static/TestAsyncEventRouterHTTP.html">/EventLib/tests/static/TestAsyncEventRouterHTTP.html</a> - Javascript event router test</li>
      <li><a href="/Proxy/8082">/Proxy/8082</a> - Forward to port 8082</li>
      <li><a href="/Proxy/8083">/Proxy/8083</a> - Forward to port 8083</li>
      <li><a href="/Proxy/8082/abc">/Proxy/8082/abc</a> - Forward to port 8082, path /abc</li>
      <li><a href="/Proxy/8082/abc/def?q1=r1&amp;q2=r2">/Proxy/8082/abc/def?q1=r1&amp;q2=r2</a> - Forward to port 8082, path /abc/def?q1=r1&amp;q2=r2</li>
      <li><a href="/static/selenium/core/TestRunner.html">/static/selenium/core/TestRunner.html</a> - Selenium core test suite</li>
    </ul>
  </div>
</body>

</html>
