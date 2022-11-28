/*==================================
    
    AjaxRequest Wrapper Scripts
    By Daesup, Lee
        
====================================*/

YAHOO.log ("opAjaxRequest.js :: Script file start loading");

var SHOW_ERROR_PANEL = function (o, responseText)
{
	YAHOO.log ("AsyncRequest failed: Server Error", "error");
    if (!document.getElementById('opCriticalErrorDiv'))
    {
        opCriticalErrorDiv = document.createElement("div");
        opCriticalErrorDiv.innerHTML = "<div id=\"opCriticalErrorInnerDiv\" style=\"background: #FFFFFF\"></div>";
        opCriticalErrorDiv.id = "opCriticalErrorDiv";
        document.body.appendChild(opCriticalErrorDiv);
        
        var panelConfig = {    
            constraintoviewport: true, 
            visible: true, 
            close: false,
            width: "1000px",
            height: "700px",
            modal: false,
            zIndex: 999
        };
        
        var errorPanel = new YAHOO.widget.Panel ("opCriticalErrorDiv", panelConfig);
        errorPanel.setHeader("Server Error");
        errorPanel.render(document.body);
    }
    if (!responseText) responseText = "";
    
    var innerErrorDiv = document.getElementById('opCriticalErrorInnerDiv');
    innerErrorDiv.style.overflow = "auto";
    innerErrorDiv.style.height = "677px";
    innerErrorDiv.innerHTML = "<div>" + responseText.replace(/[\n\r]/gi,'<BR>') + "</div><div>" + YAHOO.lang.dump(o) + "</div>";

    var msgBox = new OPMsgBox ("CriticalError", 
                               "Request failed - Server error.<br>Please capture the back screen and report to your administrator.", 
                               "Critical Error!",
                               {isFixedCenter: true,
    							isDraggable: true,
    							isClose: false,
    							isModal: false
             					});
    msgBox.SetZIndex(1000);
    msgBox.SetICON("warn");
    msgBox.Show();
};

var REQUEST_SUCCESS_CALLBACK = function (afterCallback){
	this.callback = function (o) {
		if (CruiseGlobal.SHOWLOADING)
			CruiseGlobal.SHOWLOADING.hide();
		if (CruiseGlobal.NOWLOADING)
			CruiseGlobal.NOWLOADING.hide();
        var messages = [];
        try {
            messages = YAHOO.lang.JSON.parse(o.responseText);
            
            if (messages.exceptionFlag)
            {
            	SHOW_ERROR_PANEL (o, "<B><FONT SIZE='4'>ERROR MESSAGE: " + messages.errMsg + "</FONT><BR>TRACE: " + messages.trace + "</B>");
            	return;
            }
        }
        catch (x) {
            YAHOO.log ("JSON Parse failed exception: [" + x + "]", "error");
            var msgBox = new OPMsgBox ("ResponseError", 
                                       "Request failed - Javascript JSON Pase error.<br>Please report to your administrator and try again.<br>exception: [" + x + "]", 
                                       "ResponseError!",
                                       {isFixedCenter: true,
		    							isDraggable: true,
		    							isClose: false,
		    							isModal: false
		             					});
            msgBox.SetZIndex(1000);
            msgBox.SetICON("warn");
            msgBox.Show();
            return;
        }
        afterCallback (o, messages);
    };
};

var REQUEST_FAIL_CALLBACK = function (afterCallback) {
	this.callback = function (o) {
		if (CruiseGlobal.SHOWLOADING)
			CruiseGlobal.SHOWLOADING.hide();
		if (CruiseGlobal.NOWLOADING)
			CruiseGlobal.NOWLOADING.hide();
	    if (!YAHOO.util.Connect.isCallInProgress(o)) {
			if (o.responseText != null){
				SHOW_ERROR_PANEL(o);
			}
			else
				YAHOO.log ("AsyncRequest failed: No server response", "error");
	    };
	    if (afterCallback) afterCallback (o, o.responseText);
	};
};

var REQUESTFAIL_DEFAULT_CALLBACK = (new REQUEST_FAIL_CALLBACK()).callback;

function OPAjaxRequest (callType, url, callback, postData)
{
    var innerCallbacks = {
        success : (new REQUEST_SUCCESS_CALLBACK(callback)).callback,
        failure : REQUESTFAIL_DEFAULT_CALLBACK,
        timeout : 120000
    };
    YAHOO.util.Connect.asyncRequest (callType, url, innerCallbacks, postData);
    YAHOO.log ("ajaxCall [" + callType + "|" + url + "|" + ((postData == null) ? "NoArgs" : postData) + "]", "debug");
}
YAHOO.log ("opAjaxRequest.js :: Script file loading completed");