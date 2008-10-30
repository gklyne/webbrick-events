<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:py="http://purl.org/kid/ns#"
    py:extends="'TestMaster.kid'">

<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type" py:replace="''"/>
<title>TestServer</title>
</head>

<body>
  <h1>Default template</h1>
  <p>This template should be overridden by the corresponding controller method</p>
  <p>Parameters supplied:
    <ul>
    <li py:for="(param,value) in self.__dict__.items()">${param}: ${value}</li>
    </ul>
  </p>
  <p>std values supplied:
    <ul>
    <li py:for="(param,value) in self.std.items()">${param}: ${str(value)}</li>
    </ul>
  </p>
  <p>tg values supplied:
    <ul>
    <li py:for="(param,value) in self.tg.items()">${param}: ${str(value)}</li>
    </ul>
  </p>
  
</body>

</html>
