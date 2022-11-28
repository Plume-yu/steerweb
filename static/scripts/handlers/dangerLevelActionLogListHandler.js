var dangerLevelActionLogListHandler = {
	dtActionLogList : null,
	refreshInterval : 10,
	filterDangerLevel : 0,
	
	parentOPTable : null,
	actionPaneDiv : null,
	basePaneDiv : null,
	
	LoadServerActionLogListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(32), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			var refreshInterval = Number(CruiseGlobal.GetElementValue("SettingRefreshInterval"));
			var dangerLevel = Number(CruiseGlobal.GetElementValue("SettingFilterDangerLevel"));
		
			if (!CruiseValidation.IsNumber(refreshInterval, false) || refreshInterval <= 4){
				CruiseGlobal.SetElementValue("SettingRefreshInterval", dangerLevelActionLogListHandler.refreshInterval);
			}else{
				dangerLevelActionLogListHandler.refreshInterval = refreshInterval;
			}
		
			if (dangerLevel != 0 && (!CruiseValidation.IsNumber(dangerLevel, false) || dangerLevel < 0)){
				CruiseGlobal.SetElementValue("SettingFilterDangerLevel", dangerLevelActionLogListHandler.filterDangerLevel);
			}else{
				dangerLevelActionLogListHandler.filterDangerLevel = dangerLevel;
			}
			dangerLevelActionLogListHandler.GetServerActionLogList ({ searchText : CruiseGlobal.GetElementValue("SearchServerActionLogText") });
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var settingCriteriaDIV = CruiseGlobal.CreateElement("DIV", "settingCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(settingCriteriaDIV);
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerActionLogListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));

		//Setting Input Tag
		CruiseGlobal.CreateElement("LABEL", "SettingRefreshIntervalLabel", settingCriteriaDIV, null, {body: l10nMsg["text_51"], paddingRight: "5px"});
		var elInputInterval = CruiseGlobal.CreateElement("INPUT", "SettingRefreshInterval", settingCriteriaDIV, "txtInputTiny", { value: dangerLevelActionLogListHandler.refreshInterval, maxlength: 2 });
		var keyListenerInterval = new CruiseEvent.CreateKeyListener (elInputInterval, 13, innerCallback, this, false, false, this);
		keyListenerInterval.enable();
		
		CruiseGlobal.CreateElement("LABEL", "SettingFilterDangerLevelLabel", settingCriteriaDIV, null, {body: l10nMsg["text_52"] + "&nbsp;" + l10nMsg["text_53"]});
		var elInputLevel = CruiseGlobal.CreateElement("INPUT", "SettingFilterDangerLevel", settingCriteriaDIV, "txtInputTiny", { value: dangerLevelActionLogListHandler.filterDangerLevel, maxlength: 2});
		var keyListenerLevel = new CruiseEvent.CreateKeyListener (elInputLevel, 13, innerCallback, this, false, false, this);
		keyListenerLevel.enable();
		
		CruiseGlobal.CreateElement("LABEL", "SettingFilterDangerLevelLabelTail", settingCriteriaDIV, null, {body: l10nMsg["text_54"]});
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchServerActionLogText", searchCriteriaDIV, "txtInputVerySmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchServerActionLogListButton", l10nMsg["text_55"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		dangerLevelActionLogListHandler.dtActionLogList = dangerLevelActionLogListHandler.GetServerActionLogList();
	},
	GetServerActionLogList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (dangerLevelActionLogListHandler.dtActionLogList){
			SteerGlobal.SteerPageResourceMan.Remove("getListServerActionLog_DataListSection");
			SteerGlobal.SteerPageResourceMan.Remove("getListServerActionLog_DataListSection_Interval");
		}
		
		return SteerMindLogic.CreateSteerDatatable("getListServerActionLog",
													"getServerActionLogByDangerLevel?",
													"getActionLogListByDangerLevel",
													"DataListSection",
													{ 	
														selectCallbackFn: dangerLevelActionLogListHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal + "&dangerLevel=" + dangerLevelActionLogListHandler.filterDangerLevel; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "actionLogIDint",
														sortDir : "desc",
														selectionMode : "single"
													},
													0,
													dangerLevelActionLogListHandler.refreshInterval * 1000);
	},
	ISelectedDataTable : function(selectedValues, tableObj) {
		SteerGlobal.NowLoading();
		dangerLevelActionLogListHandler.parentOPTable = tableObj;
		dangerLevelActionLogListHandler.GetActionLog(selectedValues[0].actionLogIDint);
	},
	InitializePane : function (){
		PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 40});
		dangerLevelActionLogListHandler.actionPaneDiv = PaneArray[0];
		dangerLevelActionLogListHandler.basePaneDiv = PaneArray[1];
	},
	GetActionLog : function (actionLogIDint) {
		var _callback = function (o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			var func = messages.returnTables[0][0][0];
			
			dangerLevelActionLogListHandler.InitializePane();
			
			//Resource Truncation
			SteerGlobal.SteerHandleResourceMan.RemoveAll();
			
			var splittedArguments = func.arguments.replace('[', '').replace(']', '').split(',');
			var formattedArguments = '';
			
			for (index in splittedArguments) {
				if (formattedArguments.length > 0)
					formattedArguments = formattedArguments.concat('<br />');
				formattedArguments = formattedArguments.concat(splittedArguments[index]);
			}
			
			var elTable = CruiseGlobal.CreateElement("TABLE", "ActionLogDetailTable", dangerLevelActionLogListHandler.basePaneDiv, "ActionLogDetailTable");
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_actionLogIDint"], func.actionLogIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayName"], func.displayName], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_dangerLevel"], func.dangerLevel], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userIDstr"], func.userIDstr], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_actionTime"], func.actionTime], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_actionType"], func.actionType], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_globalUniqueFunctionIDint"], func.globalUniqueFunctionIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_castIDint"], func.castIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_arguments"], func.arguments], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_results"], func.results], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_actionMemo"], func.actionMemo], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_actionUserIDint"], func.actionUserIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_calleeServerType"], func.calleeServerType], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_callerServerType"], func.callerServerType], elTable);
		}
		
		OPAjaxRequest("POST", "getDetailActionLog", _callback, "actionLogIDint=" + actionLogIDint);
	}
};
