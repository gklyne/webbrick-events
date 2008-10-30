<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:py="http://purl.org/kid/ns#"
    py:extends="'testmaster.kid'">

<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type" py:replace="''"/>
    <title>Button and value display</title>
    <link href="../static/css/style.css" rel="stylesheet" type="text/css"/>
    <script type="text/javascript" src="/eventlib/static/javascript/URI.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/Status.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/Event.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventEnvelope.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventSerializer.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventAgent.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventHandler.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventRouter.js"></script>
    <script type="text/javascript" src="/eventlib/static/javascript/EventRouterHTTPC.js"></script>
    <script type="text/javascript" src="/widgets/SimpleButton/SimpleButton.js"></script>
    <script type="text/javascript" src="/widgets/NumericDisplay.js"></script>
    <link type="text/css"         href="/widgets/SimpleButton/SimpleButton.css" rel="stylesheet" />
</head>

<body>

    <script type="text/javascript">
        webbrick.widgets.sendPageResetEvent();
    </script>
    
    <form xmlns:py="http://purl.org/kid/ns#"
        name="TestSimpleButton"
        action="TestSimpleButton"
        method="post"
        class="tableform"
    >
        <table border="1" cellspacing="0" cellpadding="2">
            <tr>
                <th>
                    <label class="fieldlabel">Simple button:</label>
                </th>
                <td py:content="simplebutton.display(value='A simple button')">
                    Simple button here
                </td>
            </tr>
            <tr>
                <th>
                    <label class="fieldlabel">Numeric Display:</label>
                </th>
                <td py:content="numericdisplay.display(value=0)">
                    Numeric Display here
                </td>
            </tr>
        </table>
    </form>

</body>
</html>
