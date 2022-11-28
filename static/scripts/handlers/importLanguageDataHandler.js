var ImportLangHandler = {
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	elBottomPaneDiv : null,
	
	LoadImportLanguageDataLayout : function ()
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 44 });
		ImportLangHandler.elActionPaneDiv = PaneArray[0];
		ImportLangHandler.elBasePaneDiv = PaneArray[1];
		ImportLangHandler.elBottomPaneDiv = PaneArray[2];
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("SPAN", "uploaderDiv"));
		elArray.push(CruiseGlobal.CreateElement("DIV", "uploadProgressBarDiv", null, "uploadProgressBar"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, ImportLangHandler.elActionPaneDiv);
		
		CruiseGlobal.CreateElement("DIV", "analyzeDiv", ImportLangHandler.elBasePaneDiv, "analyzeResultDiv");
		CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_39"], true);
		
		CruiseGlobal.SetElHide("uploadProgressBarDiv");
		var uploadPgb = new OPProgressBar ("upload", "uploadProgressBarDiv", {value:0, minValue:0, maxValue:1, height: 7});
		var upLoader = new OPUploader("importUploader",CruiseGlobal.GetEl("uploaderDiv"), "importLanguageResource", 
				{uploadButtonText: l10nMsg["text_95"],
				allowedExtensions: ['csv'],
				typeErrorMsg: l10nMsg["msg_40"],
		        sizeErrorMsg: l10nMsg["msg_41"],
		        minSizeErrorMsg: l10nMsg["msg_42"],
		        emptyErrorMsg: l10nMsg["msg_43"],
		        onLeave: l10nMsg["msg_44"]}
		);

		upLoader.RegisterEventProgress(function(id, fileName, loaded, total){
			uploadPgb.SetMaxValue(total);
			uploadPgb.SetValue(loaded);
		});
		
		upLoader.RegisterEventSubmit(function(id, fileName){
			SteerGlobal.ShowLoading();
			
			upLoader.FlushUploadList();
			uploadPgb.SetMaxValue(1);
			uploadPgb.SetValue(0);
			CruiseGlobal.SetElShow("uploadProgressBarDiv");
			
			//Reset
			SteerGlobal.SteerHandleResourceMan.Remove("RegisterButton");
		});
		
		upLoader.RegisterEventComplete(function(id, fileName, messages){
			if (!SteerGlobal.ValidateResponse(messages)) return;
			CruiseGlobal.SHOWLOADING.hide();
			
			CruiseGlobal.SetHTML("analyzeDiv", l10nMsg["msg_76"], true);
		});
	}
};