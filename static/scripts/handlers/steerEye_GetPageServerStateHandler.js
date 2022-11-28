var getPageServerStateHandler = {
	dtServerList : null,
	refreshInterval : 5,
	
	LoadServerListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(45), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			var refreshInterval = Number(CruiseGlobal.GetElementValue("SettingRefreshInterval"));
			if (!CruiseValidation.IsNumber(refreshInterval, false) || refreshInterval <= 0){
				CruiseGlobal.SetElementValue("SettingRefreshInterval", getPageServerStateHandler.refreshInterval);
			}else{
				getPageServerStateHandler.refreshInterval = refreshInterval;
			}
			
			getPageServerStateHandler.GetServerList ({serverCategory : CruiseGlobal.GetElementValue("ServerCategorySelect")});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var settingCriteriaDIV = CruiseGlobal.CreateElement("DIV", "settingCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(settingCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("ServerCategorySelect", searchCriteriaDIV, innerCallback, false);
		
		//Setting Input Tag
		CruiseGlobal.CreateElement("LABEL", "SettingRefreshIntervalLabel", settingCriteriaDIV, null, {body: l10nMsg["text_51"], paddingRight: "5px"});
		var elInputInterval = CruiseGlobal.CreateElement("INPUT", "SettingRefreshInterval", settingCriteriaDIV, "txtInputTiny", { value: getPageServerStateHandler.refreshInterval, maxlength: 2 });
		var keyListenerInterval = new CruiseEvent.CreateKeyListener (elInputInterval, 13, innerCallback, this, false, false, this);
		keyListenerInterval.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchServerListButton", l10nMsg["text_58"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		getPageServerStateHandler.dtServerList = getPageServerStateHandler.GetServerList({serverCategory : CruiseGlobal.GetElementValue("ServerCategorySelect")});
	},
	GetServerList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverCategory=" + objs.serverCategory;
		}
		
		//Validation
		if (getPageServerStateHandler.dtServerList){
			SteerGlobal.SteerPageResourceMan.Remove("getPageServerState_DataListSection");
			SteerGlobal.SteerPageResourceMan.Remove("getPageServerState_DataListSection_Interval");
		}
		
		return SteerMindLogic.CreateSteerDatatable("getPageServerState",
													"getPageServerState?",
													"getPageServerState",
													"DataListSection",
													{
														selectCallbackFn : getPageServerStateHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
													},
													0,
													getPageServerStateHandler.refreshInterval * 1000);
	},
	ISelectedDataTable : function (selectedValues, tableObj)
	{
		SteerGlobal.NowLoading();
		getPageServerReportHandler.parentOPTable = tableObj;
		getPageServerReportHandler.SetSourceData(selectedValues[0].serverCategory, selectedValues[0].serverNumber);
		getPageServerReportHandler.LoadServerListLayout();
	}
};
