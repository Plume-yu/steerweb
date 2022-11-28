/*==================================
    
       Steer Loading Scripts
        
====================================*/
function CheckLoadingProcess(loadingCallback)
{	
    var callback = function (o, messages) {
    	if (!SteerGlobal.ValidateResponse(messages, {redirectPage : "./"})) return;
    	l10nMsg = messages.resourceDict;
    	CruiseGlobal.SetShowLoading(l10nMsg["msg_03"], iconsIMG.loader_bigbar);
    	CruiseGlobal.SetNowLoading(l10nMsg["text_46"]);
    	
		var loadDiv = CruiseGlobal.CreateElement("DIV", "loadingParentDiv", null, "loadingParentDiv");
		CruiseGlobal.CreateElement("DIV", "loadingDiv", loadDiv, "loadingDiv", {body: l10nMsg["msg_08"]});
		CruiseGlobal.CreateElement("DIV", "progressBarDiv", loadDiv);
		
		var loadPgb = new OPProgressBar ("loadingProgressBar", "progressBarDiv", {value:0, minValue:0, maxValue:2, height: 10} );
		SteerGlobal.SteerPageResourceMan.Add("loadPgb", loadPgb);
		CheckServerCategory(loadingCallback);
    };
    OPAjaxRequest ('GET', "getL10NResources" , callback);
}

function CheckServerCategory(loadingCallback)
{	
    var callback = function (o, messages) {
    	if (!SteerGlobal.ValidateResponse(messages, {redirectPage : "./"})) return;
    	
    	SteerGlobal.SteerPageResourceMan.Get("loadPgb").SetValue(1);
    	SteerGlobal.SetValue("serverCategory", messages.records);
    	
		FetchUserSetting(loadingCallback);
    };
    OPAjaxRequest ('GET', "getServerCategoryAll" , callback);
}

function FetchUserSetting (loadingCallback)
{
    var callback = function (o, messages) {
    	if (!SteerGlobal.ValidateResponse(messages, {redirectPage : "./"})) return;

        SteerGlobal.SteerPageResourceMan.Get("loadPgb").SetValue(2);
		SteerGlobal.SetValue("userID", messages.userID);
		SteerGlobal.SetValue("userAccount", messages.userAccount);
        
		if (CruiseGlobal.IsUserAgentIE())
			FinalizeLoading({ fn: loadingCallback });
		else
        	window.setTimeout (FinalizeLoading, 100, { fn: loadingCallback });
    };
    OPAjaxRequest ('GET', "getCurrentUserInfo" , callback);
}

function FinalizeLoading(obj)
{
	SteerGlobal.SteerPageResourceMan.Remove("loadPgb");
	obj.fn(null);
}