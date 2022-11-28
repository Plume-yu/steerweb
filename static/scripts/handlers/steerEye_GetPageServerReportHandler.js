var getPageServerReportHandler = {
	parentOPTable : null,
	serverCategory : null,
	serverNumber : null,
	dtServerReportList : null,
	refreshInterval : 5,
	
	SetSourceData : function (serverCategory, serverNumber)
	{
		getPageServerReportHandler.serverCategory = serverCategory;
		getPageServerReportHandler.serverNumber = serverNumber;
	},
	LoadServerListLayout : function (action, event, obj)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 46});
		userListHandler.actionPaneDiv = PaneArray[0];
		userListHandler.basePaneDiv = PaneArray[1];

		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		var innerCallback = function ()
		{
			var refreshInterval = Number(CruiseGlobal.GetElementValue("SettingReportRefreshInterval"));
			if (!CruiseValidation.IsNumber(refreshInterval, false) || refreshInterval <= 0){
				CruiseGlobal.SetElementValue("SettingReportRefreshInterval", getPageServerReportHandler.refreshInterval);
			}else{
				getPageServerReportHandler.refreshInterval = refreshInterval;
			}
			getPageServerReportHandler.GetServerList ();
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataReportListPaginateSection", userListHandler.actionPaneDiv, null, {paddingLeft : "30px"});
		var settingReportCriteriaDIV = CruiseGlobal.CreateElement("DIV", "settingReportCriteriaDIV", userListHandler.actionPaneDiv);

		var elArray = new Array();
		elArray.push(settingReportCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerReportListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, userListHandler.actionPaneDiv);
		
		//Setting Input Tag
		CruiseGlobal.CreateElement("LABEL", "SettingRefreshIntervalLabel", settingReportCriteriaDIV, null, {body: l10nMsg["text_51"], paddingRight: "5px"});
		var elInputInterval = CruiseGlobal.CreateElement("INPUT", "SettingReportRefreshInterval", settingReportCriteriaDIV, "txtInputTiny", { value: getPageServerReportHandler.refreshInterval, maxlength: 2 });
		var keyListenerInterval = new CruiseEvent.CreateKeyListener (elInputInterval, 13, innerCallback, this, false, false, this);
		keyListenerInterval.enable();
		
		//Search Button
		var btnReportSearch = new OPButton("SearchServerReportListButton", l10nMsg["text_58"], null, function (){ innerCallback(); });
		btnReportSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerHandleResourceMan.Add("btnReportSearch", btnReportSearch);
		
		getPageServerReportHandler.dtServerReportList = getPageServerReportHandler.GetServerList();
	},
	GetServerList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		addRequestVal += "&serverCategory=" + getPageServerReportHandler.serverCategory;
		addRequestVal += "&serverNumber=" + getPageServerReportHandler.serverNumber;
		
		BaseDivId = userListHandler.basePaneDiv.id;
		
		//Validation
		if (getPageServerReportHandler.dtServerReportList){
			SteerGlobal.SteerHandleResourceMan.Remove("getPageServerReport_" + BaseDivId);
			SteerGlobal.SteerHandleResourceMan.Remove("getPageServerReport_" + BaseDivId + "_Interval");
		}
		
		return SteerMindLogic.CreateHandleSteerDatatable("getPageServerReport",
														"getPageServerReport?",
														"getPageServerReport",
														BaseDivId,
														{ 	
															addRequestParamFn : function () { return addRequestVal; },
															paginator : new OPPaginator("DataReportListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
															l10nObj : l10nMsg,
															formatRow : SteerMindLogic.MindProcessFormatter,
														},
														0,
														getPageServerReportHandler.refreshInterval * 1000);
	}
};
