var importDataHandler = {
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	elBottomPaneDiv : null,
	uploadedImportFileName : "",
	
	objImportFunctionData : [],
	objImportFunctionGroupData : [],
	objImportUserGroupData : [],
	objImportDisplayGroupData : [],
	
	dtImportFunction : null,
	dtImportFunctionGroup : null,
	dtImportUserGroup : null,
	dtImportDisplayGroup : null,
	// Reset 
	ResetFunctionList : function()
	{
		if (!importDataHandler.objImportFunctionData || !importDataHandler.dtImportFunction)
			return;

		var len = importDataHandler.objImportFunctionData.length;
		for (var i = 0; i < len; i++){
			importDataHandler.objImportFunctionData.pop();
		}
		importDataHandler.dtImportFunction.Refresh();
	},
	ResetFunctionGroupList : function()
	{
		if (!importDataHandler.objImportFunctionGroupData || !importDataHandler.dtImportFunctionGroup)
			return;
		
		var len = importDataHandler.objImportFunctionGroupData.length;
		for (var i = 0; i < len; i++){
			importDataHandler.objImportFunctionGroupData.pop();
		}
		importDataHandler.dtImportFunctionGroup.Refresh();
	},
	ResetUserGroupList : function()
	{
		if (!importDataHandler.objImportUserGroupData || !importDataHandler.dtImportFunction)
			return;
		
		var len = importDataHandler.objImportUserGroupData.length;
		for (var i = 0; i < len; i++){
			importDataHandler.objImportUserGroupData.pop();
		}
		importDataHandler.dtImportUserGroup.Refresh();
	},
	ResetDisplayGroupList : function()
	{
		if (!importDataHandler.objImportDisplayGroupData || !importDataHandler.dtImportDisplayGroup)
			return;
		
		var len = importDataHandler.objImportDisplayGroupData.length;
		for (var i = 0; i < len; i++){
			importDataHandler.objImportDisplayGroupData.pop();
		}
		importDataHandler.dtImportDisplayGroup.Refresh();		
	},
	LoadImportLayout : function()
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "PaneNameArea", {body: SteerGlobal.GetPaneText(43)});
		var dataSectionDiv = CruiseGlobal.CreateElement("div", "DataListSection", newDiv, "ImportLeftDiv");
		SteerLayout.LoadLeftCenterLayout();
		
		// Contents
		CruiseGlobal.CreateElement("DIV", null, dataSectionDiv, "ExportSelectionDiv", {body: l10nMsg["msg_38"]})
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_88"]}));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, dataSectionDiv);
		var FunctionSelectedDIV = CruiseGlobal.CreateElement("DIV", "FunctionSelected", dataSectionDiv, "ImportSelectionDiv");
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_89"]}));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, dataSectionDiv);
		var boxTagSelectedDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupSelected", dataSectionDiv, "ImportSelectionDiv");
		
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_90"]}));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, dataSectionDiv);
		var UserGroupSelectedDIV = CruiseGlobal.CreateElement("DIV", "UserGroupSelected", dataSectionDiv, "ImportSelectionDiv");
		
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_94"]}));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, dataSectionDiv);
		var boxTemplateSelectedDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupSelected", dataSectionDiv, "ImportSelectionDiv");
		
		// Contents - UserGroup Tag
		importDataHandler.dtImportFunction = new OPDataTable("ImportFunctionSelection", null, SteerMindLogic.GetColumns("getFunctionList"), "FunctionSelected",
															 {	JSArrayObejct : { data : importDataHandler.objImportFunctionData },
												    			l10nObj : l10nMsg,
																formatRow : SteerMindLogic.SteerBaseFormatter,
																selectionMode : "null"});

	    // Contents - Steer Tag
		importDataHandler.dtImportFunctionGroup = new OPDataTable("ImportFunctionGroupSelection", null, SteerMindLogic.GetColumns("getImportFunctionGroupList"), "FunctionGroupSelected",
														 {	JSArrayObejct : { data : importDataHandler.objImportFunctionGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});

		// Contents - UserGroup
		importDataHandler.dtImportUserGroup = new OPDataTable("ImportUserGroupSelection", null, SteerMindLogic.GetColumns("getImportUserGroupList"), "UserGroupSelected",
														 {	JSArrayObejct : { data : importDataHandler.objImportUserGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});

		// Contents - DisplayGroup
		importDataHandler.dtImportDisplayGroup = new OPDataTable("ImportDisplayGroupSelection", null, SteerMindLogic.GetColumns("getDisplayGroupList"), "DisplayGroupSelected",
														 {	JSArrayObejct : { data : importDataHandler.objImportDisplayGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});
		
		// Resource Registration for clean-up
		SteerGlobal.SteerPageResourceMan.Add("ImportFunctionSelection_FunctionSelected", importDataHandler.dtImportFunction);
		SteerGlobal.SteerPageResourceMan.Add("ImportFunctionGroupSelection_FunctionGroupSelected", importDataHandler.dtImportFunctionGroup);
		SteerGlobal.SteerPageResourceMan.Add("ImportUserGroupSelection_UserGroupSelected", importDataHandler.dtImportUserGroup);
		SteerGlobal.SteerPageResourceMan.Add("ImportDisplayGroupSelection_DisplayGroupSelected", importDataHandler.dtImportDisplayGroup);
		
		importDataHandler.LoadImportListLayout();
	},
	LoadImportListLayout : function ()
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 43 });
		importDataHandler.elActionPaneDiv = PaneArray[0];
		importDataHandler.elBasePaneDiv = PaneArray[1];
		importDataHandler.elBottomPaneDiv = PaneArray[2];
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		importDataHandler.ResetFunctionList();
		importDataHandler.ResetFunctionGroupList();
		importDataHandler.ResetUserGroupList();
		importDataHandler.ResetDisplayGroupList();
		
		//Display Handler
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("SPAN", "uploaderDiv"));
		elArray.push(CruiseGlobal.CreateElement("DIV", "uploadProgressBarDiv", null, "uploadProgressBar"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, importDataHandler.elActionPaneDiv);
		
		CruiseGlobal.CreateElement("DIV", "analyzeDiv", importDataHandler.elBasePaneDiv, "analyzeResultDiv");
		CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_39"], true);
		
		CruiseGlobal.SetElHide("uploadProgressBarDiv");
		var uploadPgb = new OPProgressBar ("upload", "uploadProgressBarDiv", {value:0, minValue:0, maxValue:1, height: 7});
		var upLoader = new OPUploader("importUploader",CruiseGlobal.GetEl("uploaderDiv"), "uploadUserGroupAndFunctionGroupAndFunction", 
				{uploadButtonText: l10nMsg["text_95"],
				allowedExtensions: ['sef'],
				typeErrorMsg: l10nMsg["msg_40"],
		        sizeErrorMsg: l10nMsg["msg_41"],
		        minSizeErrorMsg: l10nMsg["msg_42"],
		        emptyErrorMsg: l10nMsg["msg_43"],
		        onLeave: l10nMsg["msg_44"]}
		);

		upLoader.RegisterEventProgress(function(id, fileName, loaded, total){
			SteerGlobal.ShowLoading();
			uploadPgb.SetMaxValue(total);
			uploadPgb.SetValue(loaded);
		});
		
		upLoader.RegisterEventSubmit(function(id, fileName){
			upLoader.FlushUploadList();
			uploadPgb.SetMaxValue(1);
			uploadPgb.SetValue(0);
			CruiseGlobal.SetElShow("uploadProgressBarDiv");
			
			//Reset
			SteerGlobal.SteerHandleResourceMan.Remove("RegisterButton");
			importDataHandler.ResetFunctionList();
			importDataHandler.ResetFunctionGroupList();
			importDataHandler.ResetUserGroupList();
			importDataHandler.ResetDisplayGroupList();
			
			CruiseGlobal.SetHTML("analyzeDiv", l10nMsg["msg_45"], true);
			CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_68"]);
		});
		
		upLoader.RegisterEventComplete(function(id, fileName, messages){
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			for (var i = 0; i < messages.returnTables[0].length; i++){
				importDataHandler.objImportFunctionData.push(messages.returnTables[0][i]);
			}
			
			for (var i = 0; i < messages.returnTables[1].length; i++){
				importDataHandler.objImportFunctionGroupData.push(messages.returnTables[1][i]);
			}
			
			for (var i = 0; i < messages.returnTables[5].length; i++){
				importDataHandler.objImportUserGroupData.push(messages.returnTables[5][i]);
			}
			
			for (var i = 0; i < messages.returnTables[3].length; i++){
				importDataHandler.objImportDisplayGroupData.push(messages.returnTables[3][i]);
			}
			
			importDataHandler.dtImportFunction.Refresh();
			importDataHandler.dtImportFunctionGroup.Refresh();
			importDataHandler.dtImportUserGroup.Refresh();
			importDataHandler.dtImportDisplayGroup.Refresh();
			
			importDataHandler.uploadedImportFileName = messages.importFileName;
			
			CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_46"]);
			CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_47"] + importDataHandler.uploadedImportFileName, true);
			CruiseGlobal.AddNewLineHTML("analyzeDiv", l10nMsg["msg_48"], true);
			CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='red'>" + l10nMsg["msg_69"] + "</font></B>", true);
			
			reportList = messages.report;
			
			for (el in reportList.globalUniqueFunctions){
				var importType = reportList.globalUniqueFunctions[el].importType
				var key = reportList.globalUniqueFunctions[el].key
				var oldValues = CruiseGlobal.ToDumpString(reportList.globalUniqueFunctions[el].oldValues);
				var values = CruiseGlobal.ToDumpString(reportList.globalUniqueFunctions[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_49"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (oldValues == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_70"], [key]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_55"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [oldValues]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}
			
			for (el in reportList.functionGroups){
				var importType = reportList.functionGroups[el].importType
				var key = reportList.functionGroups[el].key
				var oldValues = CruiseGlobal.ToDumpString(reportList.functionGroups[el].oldValues);
				var values = CruiseGlobal.ToDumpString(reportList.functionGroups[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_50"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (oldValues == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_71"], [key]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_56"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [oldValues]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}
			
			for (el in reportList.functionGroupAndFunctionLinks){
				var importType = reportList.functionGroupAndFunctionLinks[el].importType;
				var key = reportList.functionGroupAndFunctionLinks[el].key;
				var oldValues = reportList.functionGroupAndFunctionLinks[el].oldValues;
				var values = CruiseGlobal.ToDumpString(reportList.functionGroupAndFunctionLinks[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_51"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (CruiseGlobal.ToDumpString(oldValues) == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_72"], [key, oldValues.globalUniqueFunctionIDint]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_57"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [CruiseGlobal.ToDumpString(oldValues)]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}

			for (el in reportList.displayGroups){
				var importType = reportList.displayGroups[el].importType
				var key = reportList.displayGroups[el].key
				var oldValues = CruiseGlobal.ToDumpString(reportList.displayGroups[el].oldValues);
				var values = CruiseGlobal.ToDumpString(reportList.displayGroups[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_52"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (oldValues == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_73"], [key]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_58"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [oldValues]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}
			
			for (el in reportList.displayGroupAndFunctionLinks){
				var importType = reportList.displayGroupAndFunctionLinks[el].importType;
				var key = reportList.displayGroupAndFunctionLinks[el].key;
				var oldValues = reportList.displayGroupAndFunctionLinks[el].oldValues;
				var values = CruiseGlobal.ToDumpString(reportList.displayGroupAndFunctionLinks[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_53"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (CruiseGlobal.ToDumpString(oldValues) == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_74"], [key, oldValues.globalUniqueFunctionIDint]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_59"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [CruiseGlobal.ToDumpString(oldValues)]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}
			
			for (el in reportList.userGroups){
				var importType = reportList.userGroups[el].importType
				var key = reportList.userGroups[el].key
				var oldValues = CruiseGlobal.ToDumpString(reportList.userGroups[el].oldValues);
				var values = CruiseGlobal.ToDumpString(reportList.userGroups[el].values);
				
				if (importType == 1){
					CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_54"], [key]) + "</font></B>");
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
				} else if (importType == 2){
					if (oldValues == values){
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_75"], [key]));
					} else {
						CruiseGlobal.AddNewLineHTML("analyzeDiv", "<B><font color='blue'>" + CruiseGlobal.ToL10NMsg(l10nMsg["msg_60"], [key]) + "</font></B>");
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_62"], [oldValues]));
						CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.GetSpaces(8) + CruiseGlobal.ToL10NMsg(l10nMsg["msg_63"], [values]));
					}
				} else
					CruiseGlobal.AddNewLineHTML("analyzeDiv", CruiseGlobal.ToL10NMsg(l10nMsg["msg_61"]));	
			}
			
			var CheckRegister = function(){
			    var RegisterProcess = function (){
			        this.hide();
			        importDataHandler.RegisterStart();
			    }

			    var qstBox = new OPMsgBox ("ConfirmRegisterImport",
			    							l10nMsg["msg_64"],
			    							l10nMsg["text_96"],
			    							{isFixedCenter: true,
			    							isDraggable: true,
			    							isClose: false,
			    							isModal: true
			             					});
			    qstBox.SetICON("warn");
			    qstBox.SetButtons([{ text:l10nMsg["text_02"], handler:RegisterProcess, isDefault:true }, { text:l10nMsg["text_03"],  handler: function () {this.hide();} }]);
			    qstBox.Show();
			};
		    
			//Display Handler
			var elArray = new Array();
			elArray.push(CruiseGlobal.CreateElement("SPAN", "RegisterButton"));
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, importDataHandler.elBottomPaneDiv);
			
			// Buttons
			var btnRegister = new OPButton("RegisterButton", l10nMsg["text_97"], null, CheckRegister);
			btnRegister.SetHeight(25);
			btnRegister.SetFontBold();
			btnRegister.SetFontSize(12);
			btnRegister.SetFontColor("#FF4444");
			
			// Resource Registration for clean-up
			SteerGlobal.SteerHandleResourceMan.Add("RegisterButton", btnRegister);
		});
	},
	RegisterStart : function(){
		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)){
				CruiseGlobal.SetHTML("analyzeDiv", l10nMsg["msg_65"], true);
				return;
			}

			CruiseGlobal.AddNewLineHTML("analyzeDiv", "<BR>" + l10nMsg["msg_66"]);
		};
		OPAjaxRequest("POST", "importUserGroupAndFunctionGroupAndFunction", _callback, "fileName=" + importDataHandler.uploadedImportFileName);
		SteerGlobal.SteerHandleResourceMan.Remove("RegisterButton");
		CruiseGlobal.SetHTML("analyzeDiv", l10nMsg["msg_67"] + "<BR>", true);
		SteerGlobal.ShowLoading();
	}
};