<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?python import sitetemplate ?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:py="http://purl.org/kid/ns#" py:extends="sitetemplate">

<head py:match="item.tag=='{http://www.w3.org/1999/xhtml}head'" py:attrs="item.items()">
    <meta content="text/html; charset=UTF-8" http-equiv="content-type" py:replace="''"/>
    <title py:replace="''">Your title goes here</title>
    <link href="/static/css/style.css" rel="stylesheet" type="text/css"/>
    <script type="text/javascript" src="/mochikit/MochiKit.js"></script>
    <script type="text/javascript" src="/misclib/static/javascript/Namespace.js"></script>
    <script type="text/javascript" src="/misclib/static/javascript/DeferredMonad.js"></script>
    <script type="text/javascript" src="/widgets/MvcUtils.js"></script>
    <script type="text/javascript" src="/widgets/WidgetFunctions.js"></script>
    <meta py:replace="item[:]"/>
</head>

<body py:match="item.tag=='{http://www.w3.org/1999/xhtml}body'" py:attrs="item.items()">

    <div py:if="tg.config('identity.on',False) and not 'logging_in' in locals()"
        id="pageLogin">
        <span py:if="tg.identity.anonymous">
            <a href="/login">Login</a>
        </span>
        <span py:if="not tg.identity.anonymous">
            Welcome ${tg.identity.user.display_name}.
            <a href="/logout">Logout</a>
        </span>
    </div>

    <div id="header">&nbsp;</div>

    <div id="homeLink"><span><a href="/">Home</a></span>
    </div>

    <div id="main_content">
      <div py:if="tg_flash" class="flash">
      ${tg_flash}
      <hr/>
      </div>

      <div py:replace="[item.text]+item[:]">
        This is replaced by code from body of derived template.
      </div>

      <h2>
        <a href="javascript:MochiKit.Logging.logger.debuggingBookmarklet()">Logging pane</a>
      </h2>

    <!-- End of main_content -->
    </div>

  <div id="footer"> 
    <img src="/static/images/under_the_hood_blue.png" alt="TurboGears under the hood" />
    <p>TestMaster.kid - master template</p>
  </div>

</body>
</html>
