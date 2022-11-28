var receivedCastTabHandler = {
	opTabView : null,
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	
	dtReceived : null,
	dtDelegatable : null,
	
	LoadRecvDeleCastLayout : function ()
	{
		CruiseGlobal.SHOWINFO (l10nMsg["text_80"], l10nMsg["msg_30"], l10nMsg["text_02"]);
		return;
		
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "ImportPaneNameArea", {body: SteerGlobal.GetPaneText(34)});
		var tabDiv = CruiseGlobal.CreateElement("div", "DataListSection", newDiv);
		receivedCastTabHandler.opTabView = new OPTabView ("receivedDelegatableCastTabView", tabDiv);

		SteerLayout.LoadLeftCenterLayout();

		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			if (messages.Received != null && messages.Received){
				receivedCastTabHandler.GetReceivedListLayout();
			}
			if (messages.Delegatable != null && messages.Delegatable){
				receivedCastTabHandler.GetDelegatableListLayout();
			}
			receivedCastTabHandler.opTabView.SelectTab(0);
		};
		OPAjaxRequest("GET", "checkReceivedDelegatablePrivileges", _callback);
		SteerGlobal.ShowLoading();
	},
	GetReceivedListLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetRecvCastListTagAction", null, "NormalTab");
		receivedCastTabHandler.opTabView.AddTab(l10nMsg["text_59"], actionDiv, false);
		
		var innerCallback = function ()
		{
			receivedCastTabHandler.GetReceivedList({
				serverCategory : CruiseGlobal.GetElementValue("RecvCastServerCategorySelect"),
				searchText : CruiseGlobal.GetElementValue("SearchRecvCastText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "RecvCastListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "RecvCastListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchRecvCastButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "RecvCastListDataListSection", actionDiv);
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("RecvCastServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchRecvCastText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchRecvCastButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		receivedCastTabHandler.dtReceived = receivedCastTabHandler.GetReceivedList();
	},
	GetReceivedList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (receivedCastTabHandler.dtReceived)
			SteerGlobal.SteerPageResourceMan.Remove("getRecvCastListBySession_RecvCastListDataListSection");
		
		return SteerCastLogic.CreateSteerDatatable("getRecvCastListBySession",
													"getRecvCastListBySession?",
													"getRecvCastListBySession",
													"RecvCastListDataListSection",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("RecvCastListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerCastLogic.CastProcessFormatter,
														sortColumn : "castIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	GetDelegatableListLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetCastDelegatableListTagAction", null, "NormalTab");
		receivedCastTabHandler.opTabView.AddTab(l10nMsg["text_60"], actionDiv, false);
		
		var innerCallback = function ()
		{
			receivedCastTabHandler.GetDelegatableList({
				serverCategory : CruiseGlobal.GetElementValue("CastDelegatableServerCategorySelect"),
				searchText : CruiseGlobal.GetElementValue("SearchCastDelegatableText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "CastDelegatableListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "CastDelegatableListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchCastDelegatableButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "CastDelegatableListDataListSection", actionDiv);

		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("CastDelegatableServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchCastDelegatableText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchCastDelegatableButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		receivedCastTabHandler.dtDelegatable = receivedCastTabHandler.GetDelegatableList();
	},
	GetDelegatableList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (receivedCastTabHandler.dtDelegatable)
			SteerGlobal.SteerPageResourceMan.Remove("getCastDelegatableListBySession_CastDelegatableListDataListSection");
		
		return SteerCastLogic.CreateSteerDatatable("getCastDelegatableListBySession",
													"getCastDelegatableListBySession?",
													"getCastDelegatableListBySession",
													"CastDelegatableListDataListSection",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("CastDelegatableListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerCastLogic.CastProcessFormatter,
														sortColumn : "castIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	}
};
