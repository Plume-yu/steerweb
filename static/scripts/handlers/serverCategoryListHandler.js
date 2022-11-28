var serverCategoryListHandler = {
	dtCategoryList : null,
	
	LoadServerCategoryListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(2), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			serverCategoryListHandler.GetServerCategoryList ({ searchText : CruiseGlobal.GetElementValue("SearchServerCategoryText") });
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerCategoryListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchServerCategoryText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchServerCategoryListButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		serverCategoryListHandler.dtCategoryList = serverCategoryListHandler.GetServerCategoryList();
	},
	GetServerCategoryList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (serverCategoryListHandler.dtCategoryList)
			SteerGlobal.SteerPageResourceMan.Remove("getListServerCategory_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getListServerCategory",
													"getServerCategory?",
													"getServerCategory",
													"DataListSection",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "categoryIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	}
};
