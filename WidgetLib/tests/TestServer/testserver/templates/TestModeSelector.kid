<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:py="http://purl.org/kid/ns#"
    py:extends="'testmaster.kid'">

<head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type" py:replace="''"/>
    <title>Mode selectors with events</title>
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
    <script type="text/javascript" src="/widgets/ModeSelector.js"></script>
    <link type="text/css" href="/widgets/ModeSelector.css" rel="stylesheet" />
</head>

<body>

    <form xmlns:py="http://purl.org/kid/ns#"
        name="TestModeSelector"
        action="TestModeSelector"
        method="post"
        class="tableform"
    >
        <table border="1" cellspacing="0" cellpadding="2">
            <tr class="odd">
                <td colspan="2">
                    Mode selection widget with event and other values specified by
                    parameters in the source page code.
                </td>            
            </tr>
        </table>
        <table border="1" cellspacing="0" cellpadding="2">
            <tr class="even">
                <td>
                    <label id="label1" class="fieldlabel">Mode selection 1:</label>
                </td>
                <?python
                    modeselectwidgetcontent1 = modeselector.display(
                        id=           "mymode1",
                        SetModeEvent= "myuri:SetMode",
                        ModeSubject=  "myuri:mymode1",
                        ModeList=     ["unknown", "dawn", "day", "dusk", "night"]
                        )
                ?>
                <td py:content="modeselectwidgetcontent1">
                    Mode select 1 widget code here
                </td>
            </tr>
            <tr class="odd">
                <td>
                    <label id="label2" class="fieldlabel">Mode selection 2:</label>
                </td>
                <?python
                    # Generate mode selection widget with values parameterized
                    # The widget object 'modeselector' comes from the CherryPy controller
                    modeselectwidgetcontent2 = modeselector.display(
                        id=           "mymode2",
                        subjectname=  "mymode2_name",
                        SetModeEvent= "myuri:SetMode",
                        ModeSubject=  "myuri:mymode2",
                        DefaultMode=  2,
                        ModeList=     ["unknown", "vacant", "occupied"]
                        )
                ?>
                <td py:content="modeselectwidgetcontent2">
                    Mode select 2 widget code here
                </td>
            </tr>
        </table>
    </form>

</body>
</html>
