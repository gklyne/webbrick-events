<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:py="http://purl.org/kid/ns#"
    py:extends="'testmaster.kid'">

<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type" py:replace="''"/>
    <title>Countdown Display</title>
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
    <script type="text/javascript" src="/widgets/CountdownDisplay.js"></script>
    <link type="text/css" href="/widgets/CountdownDisplay.css" rel="stylesheet" />
</head>

<body>

    <form xmlns:py="http://purl.org/kid/ns#"
        name="TestCountdownDisplay"
        action="TestCountdownDisplay"
        method="post"
        class="tableform"
    >
        <table border="1" cellspacing="0" cellpadding="2">
            <tr class="even">
                <th>
                    <label class="fieldlabel">Countdown Display:</label>
                </th>
                <td py:content="countdowndisplay.display(value=0)">
                    Countdown Display here
                </td>
            </tr>
        </table>
    </form>

</body>
</html>
