<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:py="http://purl.org/kid/ns#"
    py:extends="'testmaster.kid'">

<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type" py:replace="''"/>
    <title>Parameterized Temperature Set Point</title>
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
    <script type="text/javascript" src="/widgets/TempSetPoint.js"></script>
    <link type="text/css" href="/widgets/TempSetPoint.css" rel="stylesheet" />
</head>

<body>

    <form xmlns:py="http://purl.org/kid/ns#"
        name="TestTempSetPointParameterized"
        action="TestTempSetPointParameterized"
        method="post"
        class="tableform"
    >
        <table border="1" cellspacing="0" cellpadding="2">
            <tr class="odd">
                <td colspan="2">
                    Temperature set point widget with event and other values specified by
                    parameters in the source page code.
                </td>            
            </tr>
            <tr class="even">
                <td>
                    <label class="fieldlabel">Temperature set point:</label>
                </td>
                <?python
                    # Generate temperature set point widget bwith values parameterized
                    # The constructor 'tempsetpoint' comes from the CherryPy controller
                    setpointwidgetcontent = tempsetpoint.display(
                        id=              "myzone",
                        name=            "myzone_name",
                        SetCurrentEvent= "myuri:SetCurrentEvent",
                        SetTargetEvent=  "myuri:SetTargetEvent",
                        ShowTargetEvent= "myuri:ShowTargetEvent",
                        Subject=         "myuri:myzone",
                        DefaultTarget=   "10.0"
                        )
                ?>
                <td py:content="setpointwidgetcontent">
                    Temperature set point widget code here
                </td>
            </tr>
        </table>
    </form>

</body>
</html>
