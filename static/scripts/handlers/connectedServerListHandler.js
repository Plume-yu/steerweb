var connectedServerListHandler = {
	dtServerList : null,
	refreshInterval : 5,
	
	LoadServerListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(33), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			var refreshInterval = Number(CruiseGlobal.GetElementValue("SettingRefreshInterval"));
			if (!CruiseValidation.IsNumber(refreshInterval, false) || refreshInterval <= 0){
				CruiseGlobal.SetElementValue("SettingRefreshInterval", connectedServerListHandler.refreshInterval);
			}else{
				connectedServerListHandler.refreshInterval = refreshInterval;
			}
			connectedServerListHandler.GetServerList ();
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var settingCriteriaDIV = CruiseGlobal.CreateElement("DIV", "settingCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(settingCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//Setting Input Tag
		CruiseGlobal.CreateElement("LABEL", "SettingRefreshIntervalLabel", settingCriteriaDIV, null, {body: l10nMsg["text_51"], paddingRight: "5px"});
		var elInputInterval = CruiseGlobal.CreateElement("INPUT", "SettingRefreshInterval", settingCriteriaDIV, "txtInputTiny", { value: connectedServerListHandler.refreshInterval, maxlength: 2 });
		var keyListenerInterval = new CruiseEvent.CreateKeyListener (elInputInterval, 13, innerCallback, this, false, false, this);
		keyListenerInterval.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchServerListButton", l10nMsg["text_58"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		connectedServerListHandler.dtServerList = connectedServerListHandler.GetServerList();
	},
	GetServerList : function (objs)
	{
		//Validation
		if (connectedServerListHandler.dtServerList){
			SteerGlobal.SteerPageResourceMan.Remove("getListServer_DataListSection");
			SteerGlobal.SteerPageResourceMan.Remove("getListServer_DataListSection_Interval");
		}
		
		return SteerMindLogic.CreateSteerDatatable("getListServer",
													"getConnectedServerInfo?",
													"getConnectedServerInfo",
													"DataListSection",
													{ 	
														paginator : new OPPaginator("DataListPaginateSection", 100000, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
													},
													0,
													connectedServerListHandler.refreshInterval * 1000);
	}
};
