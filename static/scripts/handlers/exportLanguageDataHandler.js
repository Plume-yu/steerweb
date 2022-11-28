var ExportLangHandler = {
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	elBottomPaneDiv : null,
	uploadedImportFileName : "",
	
	LoadExportLanguageDataLayout : function()
	{
		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			var DownloadDialogLayout = function (btnClickCallback, config){
				var layoutWrapper = CruiseGlobal.CreateElement("div", "downloadDialogLayout");
				var layoutBody = CruiseGlobal.CreateElement("div", "downloadDialogLayoutBody", layoutWrapper, "bd");
				
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadTitle", {body: l10nMsg["msg_32"]});
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadSubTitle", {body: l10nMsg["msg_33"]});
				CruiseGlobal.CreateElement("a", null, layoutBody, "downloadText", {body: l10nMsg["text_98"], href: "./data/export/" + messages.functionFileName});
				CruiseGlobal.CreateElement("a", null, layoutBody, "downloadText", {body: "| " + l10nMsg["text_99"], href: "./data/export/" + messages.displayGroupFileName});
				return layoutWrapper.innerHTML;
			}
			
			var oDialog = new OPDialog ("downloadDialog", DownloadDialogLayout(), null, l10nMsg["text_87"], null,
					{ width : 400,
					  height : 250 });
			
			var ClearDialogResources = function(){
				oDialog.Hide();
				CruiseGlobal.RemoveElement("downloadDialogLayout");
				SteerGlobal.SteerHandleResourceMan.Remove("downloadDialog");
			}
			
			var loadingCount = 0;
			oDialog.SetButtons([{ text:l10nMsg["text_02"], width: 100, handler:function(o, msg) {
								ClearDialogResources();
							}}])
			oDialog.SetModal(true);
			oDialog.Show();
			
			SteerGlobal.SteerHandleResourceMan.Add("downloadDialog", oDialog);
		}
		
		OPAjaxRequest("POST", "exportLanguageResource", _callback, "exportData=");
	}
};