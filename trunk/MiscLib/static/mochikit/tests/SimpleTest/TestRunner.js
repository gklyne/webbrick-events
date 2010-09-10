/**
 * TestRunner: A test runner for SimpleTest
 * TODO:
 * 
 *  * Avoid moving iframes: That causes reloads on mozilla and opera.
 *
 *
**/
var TestRunner = {};
TestRunner.logEnabled = false;
TestRunner._iframes = {};
TestRunner._iframeDocuments = {};
TestRunner._iframeRows = {};
TestRunner._currentTest = 0;
TestRunner._urls = [];
TestRunner._testsDiv = MochiKit.DOM.DIV();
TestRunner._progressDiv = MochiKit.DOM.DIV();
TestRunner._summaryDiv = MochiKit.DOM.DIV(null, 
    MochiKit.DOM.H1(null, "Tests Summary"),
    MochiKit.DOM.TABLE(null, 
        MochiKit.DOM.THEAD(null, 
            MochiKit.DOM.TR(null,
                MochiKit.DOM.TH(null, "Test"), 
                MochiKit.DOM.TH(null, "Passed"), 
                MochiKit.DOM.TH(null, "Failed")
            )
        ),
        MochiKit.DOM.TBODY()
    )
);

/**
 * This function is called after generating the summary.
**/
TestRunner.onComplete = null;

/**
 * If logEnabled is true, this is the logger that will be used.
**/
TestRunner.logger = MochiKit.Logging.logger;

/**
 * Toggle element visibility
**/
TestRunner._toggle = function(el) {
    if (el.className == "noshow") {
        el.className = "";
        el.style.cssText = "";
    } else {
        el.className = "noshow";
        el.style.cssText = "width:0px; height:0px; border:0px;";
    }
};


/**
 * Creates the iframe that contains a test
**/
TestRunner._makeIframe = function (url) {
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.name = url;
    iframe.width = "500";
    var tbody = TestRunner._summaryDiv.getElementsByTagName("tbody")[0];
    var tr = MochiKit.DOM.TR(null, MochiKit.DOM.TD({'colspan': '3'}, iframe));
    iframe._row = tr;
    tbody.appendChild(tr);
    return iframe;
};

/**
 * TestRunner entry point.
 *
 * The arguments are the URLs of the test to be ran.
 *
**/
TestRunner.runTests = function (/*url...*/) {
    if (TestRunner.logEnabled)
        TestRunner.logger.log("SimpleTest START");
  
    var body = document.getElementsByTagName("body")[0];
    MochiKit.DOM.appendChildNodes(body,
        TestRunner._testsDiv,
        TestRunner._progressDiv,
        TestRunner._summaryDiv
    );
    for (var i = 0; i < arguments.length; i++) {
        TestRunner._urls.push(arguments[i]); 
    }
    TestRunner.runNextTest();
};

/**
 * Run the next test. If no test remains, calls makeSummary
**/
TestRunner.runNextTest = function() {
    if (TestRunner._currentTest < TestRunner._urls.length) {
        var url = TestRunner._urls[TestRunner._currentTest];
        var progress = MochiKit.DOM.SPAN(null,
            "Running ", MochiKit.DOM.A({href:url}, url), "..."
        );
        
        if (TestRunner.logEnabled)
            TestRunner.logger.log(scrapeText(progress));
        
        TestRunner._progressDiv.appendChild(progress);
        TestRunner._iframes[url] = TestRunner._makeIframe(url);
    }  else {
        TestRunner.makeSummary();
        if (TestRunner.onComplete)
            TestRunner.onComplete();
    }
};

/**
 * This stub is called by SimpleTest when a test is finished.
**/
TestRunner.testFinished = function (doc) {
    MochiKit.DOM.appendChildNodes(TestRunner._progressDiv, 
        MochiKit.DOM.SPAN(null, "Done"), 
        MochiKit.DOM.BR());
    var finishedURL = TestRunner._urls[TestRunner._currentTest];
    
    if (TestRunner.logEnabled)
        TestRunner.logger.debug("SimpleTest finished " + finishedURL);
    
    TestRunner._iframeDocuments[finishedURL] = doc;
    // TestRunner._iframes[finishedURL].style.display = "none";
    TestRunner._toggle(TestRunner._iframes[finishedURL]);
    TestRunner._currentTest++;
    TestRunner.runNextTest();
};

/**
 * Display the summary in the browser
**/
TestRunner.makeSummary = function() {
    if (TestRunner.logEnabled)
        TestRunner.logger.log("SimpleTest FINISHED");
    var rows = [];
    for (var url in TestRunner._iframeDocuments) {
        var doc = TestRunner._iframeDocuments[url];
        var nOK = MochiKit.DOM.withDocument(doc,
            MochiKit.Base.partial(MochiKit.DOM.getElementsByTagAndClassName, 'div', 'test_ok')
        ).length;
        var nNotOK = MochiKit.DOM.withDocument(doc,
            MochiKit.Base.partial(MochiKit.DOM.getElementsByTagAndClassName, 'div', 'test_not_ok')
        ).length;
        var toggle = MochiKit.Base.partial(TestRunner._toggle, TestRunner._iframes[url]);
        var jsurl = "TestRunner._toggle(TestRunner._iframes['" + url + "'])";
        var row = MochiKit.DOM.TR(
            {'style': {'backgroundColor': nNotOK > 0 ? "#f00":"#0f0"}}, 
            MochiKit.DOM.TD(null, url),
            MochiKit.DOM.TD(null, nOK),
            MochiKit.DOM.TD(null, nNotOK)
        );
        row.onclick = toggle;
        var tbody = TestRunner._summaryDiv.getElementsByTagName("tbody")[0];
        tbody.insertBefore(row, TestRunner._iframes[url]._row)
    }
};
