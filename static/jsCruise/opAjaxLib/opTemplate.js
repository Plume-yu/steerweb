/*==================================
    
    AjaxTemplate Wrapper Scripts
    By Daesup, Lee
        
====================================*/

YAHOO.log ("opTemplate.js :: Script file start loading");
function OPTemplateRequest (requestString, templateName, callback)
{
    var innerCallbacks = {
        success : function (o) {
			if (CruiseGlobal.SHOWLOADING)
				CruiseGlobal.SHOWLOADING.hide();
            callback (o, YAHOO.lang.JSON.parse(o.responseText));
            YAHOO.log ("RequestTemplate: [" + templateName + "] Loading Successfully", "debug");
        },

        failure : function (o) {
			if (CruiseGlobal.SHOWLOADING)
				CruiseGlobal.SHOWLOADING.hide();
		    if (!YAHOO.util.Connect.isCallInProgress(o)) {
				if (o.responseText != null){
					YAHOO.log ("Template Request failed: Server Error", "error");  
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
		            var innerErrorDiv = document.getElementById('opCriticalErrorInnerDiv');
		            innerErrorDiv.style.overflow = "auto";
		            innerErrorDiv.style.height = "677px";
		            innerErrorDiv.innerHTML = "<div>" + o.responseText + "</div><div>" + YAHOO.lang.dump(o) + "</div>";
		
		            var msgBox = new OPMsgBox ("Template Request Error!", 
		                                       "Request failed - Server error.<br>Please capture the back screen and report to your administrator.", 
		                                       "Template Request Error!",
		                                       {isFixedCenter: true,
				    							isDraggable: true,
				    							isClose: false,
				    							isModal: false
				             					});
		            msgBox.SetZIndex(1000);
		            msgBox.SetICON("warn");
		            msgBox.Show();
				}
				else
				{
					YAHOO.log ("AsyncRequest failed: No server response", "error");
		            var msgBox = new OPMsgBox ("RequestError", 
		                                       "Request failed - Server error.<br>Please report to your administrator and try again.", 
		                                       "RequestError!",
		                                       {isFixedCenter: true,
				    							isDraggable: true,
				    							isClose: false,
				    							isModal: false
				             					});
		            msgBox.SetZIndex(1000);
		            msgBox.SetICON("warn");
		            msgBox.Show();
				}
		    };
		    return;
        },
        timeout : 90000
    };

    YAHOO.util.Connect.asyncRequest ("GET", requestString + "&templateName=" + templateName, innerCallbacks);
    YAHOO.log ("RequestTemplate: [" + templateName + "]", "debug");
}
YAHOO.log ("opTemplate.js :: Script file loading completed");