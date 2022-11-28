var actionLogTabHandler = {
	opTabView : null,
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	
	dtAll : null,
	dtServerCategory : null,
	dtTerm : null,
	dtUser : null,
	dtUserGroup : null,
	
	LoadActionLogLayout : function ()
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "ImportPaneNameArea", {body: SteerGlobal.GetPaneText(39)});
		var tabDiv = CruiseGlobal.CreateElement("div", "DataListSection", newDiv);
		actionLogTabHandler.opTabView = new OPTabView ("actionLogTabView", tabDiv);

		SteerLayout.LoadLeftCenterLayout();

		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			if (messages.Term != null && messages.Term){
				actionLogTabHandler.GetByTermLayout();
			}
//			if (messages.All != null && messages.All){
//				actionLogTabHandler.GetAllLayout();
//			}
//			if (messages.ServerCategory != null && messages.ServerCategory){
//				actionLogTabHandler.GetByServerCategoryLayout();
//			}
//			if (messages.User != null && messages.User){
//				actionLogTabHandler.GetByUserLayout();
//			}
//			if (messages.UserGroup != null && messages.UserGroup){
//				actionLogTabHandler.GetByUserGroupLayout();
//			}
			actionLogTabHandler.opTabView.SelectTab(0);
		};
		OPAjaxRequest("GET", "checkActionLogPrivileges", _callback);
		SteerGlobal.ShowLoading();
	},
	GetAllLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetListAll", null, "NormalTab");
		actionLogTabHandler.opTabView.AddTab(l10nMsg["text_81"], actionDiv, false);
		
		var innerCallback = function ()
		{
			actionLogTabHandler.GetAllList({
				searchText : CruiseGlobal.GetElementValue("SearchAllText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "AllListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "AllListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchAllButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "AllListDataListSection", actionDiv);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchAllText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchAllButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnAllSearch", btnSearch);
		
		actionLogTabHandler.dtAll = actionLogTabHandler.GetAllList();
	},
	GetAllList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (actionLogTabHandler.dtAll)
			SteerGlobal.SteerPageResourceMan.Remove("getAllActionLogList_AllListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getAllActionLogList",
													"getAllActionLogList?",
													"getAllActionLogList",
													"AllListDataListSection",
													{ 	
														selectCallbackFn: actionLogTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("AllListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "actionLogIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	GetByServerCategoryLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetListServerCategory", null, "NormalTab");
		actionLogTabHandler.opTabView.AddTab(l10nMsg["text_82"], actionDiv, false);
		
		var innerCallback = function ()
		{
			actionLogTabHandler.GetByServerCategoryList({
				serverCategory : CruiseGlobal.GetElementValue("ServerCategoryActionLogSelect"),
				searchText : CruiseGlobal.GetElementValue("SearchServerCategoryText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "ServerCategoryListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "ServerCategoryListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchServerCategoryButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "ServerCategoryListDataListSection", actionDiv);
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("ServerCategoryActionLogSelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchServerCategoryText", searchCriteriaDIV, "txtInputSmServerCategory");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchServerCategoryButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnServerCategorySearch", btnSearch);
		
		actionLogTabHandler.dtServerCategory = actionLogTabHandler.GetByServerCategoryList();
	},
	GetByServerCategoryList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverCategory=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (actionLogTabHandler.dtServerCategory)
			SteerGlobal.SteerPageResourceMan.Remove("getServerCategoryActionLogList_ServerCategoryListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getServerCategoryActionLogList",
													"getActionLogListByServerCategory?",
													"getServerCategoryActionLogList",
													"ServerCategoryListDataListSection",
													{ 	
														selectCallbackFn: actionLogTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("ServerCategoryListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "callerServerType",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	GetByTermLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetListTerm", null, "NormalTab");
		actionLogTabHandler.opTabView.AddTab(l10nMsg["text_83"], actionDiv, false);
		
		var innerCallback = function ()
		{
			actionLogTabHandler.GetByTermList({
				//isUseDate : btnDateUse.GetChecked(),
				startDate : CruiseGlobal.ToTimeFormatString(elYear.value, elMonth.value, elDay.value, elHour.value, elMinute.value, elSecond.value),
				endDate : CruiseGlobal.ToTimeFormatString(elEYear.value, elEMonth.value, elEDay.value, elEHour.value, elEMinute.value, elESecond.value),
				searchText : CruiseGlobal.GetElementValue("SearchTermText"),
				serverCategory : CruiseGlobal.GetElementValue("ServerCategorySelect")
				});
		};
		
		//Build Divs
		
		// Calendar Section
		var elDate = CruiseGlobal.CreateElement("DIV", "DateSectionDiv", actionDiv, null, {paddingLeft: "20px;"});
		var elDateTimeButton = CruiseGlobal.CreateElement("DIV", "divStartDateTimePicker", actionDiv);
		var elTime = CruiseGlobal.CreateElement("DIV", "TimeSectionDiv", actionDiv);
		
		var elEDate = CruiseGlobal.CreateElement("DIV", "DateEndSectionDiv", actionDiv);
		var elEDateTimeButton = CruiseGlobal.CreateElement("DIV", "divEndDateTimePicker", actionDiv);
		var elETime = CruiseGlobal.CreateElement("DIV", "TimeEndSectionDiv", actionDiv);
		
		var elArray = new Array();
		elArray.push(elDate);
		elArray.push(elDateTimeButton);
		elArray.push(elTime);
		elArray.push(elEDate);
		elArray.push(elEDateTimeButton);
		elArray.push(elETime);
		SteerGlobal.MakeLayoutHTMLTable(elArray, actionDiv);
		
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "TermListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "TermListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchTermButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "TermListDataListSection", actionDiv);
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("ServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchTermText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchTermButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		// Start DateTime Picker
		var objDate = OPCalendar.MakeDatePicker ("startDatePicker", elDate, elDateTimeButton, { headerLabel : l10nMsg["msg_31"] });
		var elYear = objDate.elementYear;
		var elMonth = objDate.elementMonth;
		var elDay = objDate.elementDay;
		SteerGlobal.SteerPageResourceMan.Add("startDateCalendar", objDate.objCalendar);
		
		var objTime = OPCalendar.MakeTimePicker ("startTimePicker", elTime, { hour: 0, minutes : 0, seconds : 0 });
		var elHour = objTime.elementHour;
		var elMinute = objTime.elementMinute;
		var elSecond = objTime.elementSecond;
		
		var dateLabel = CruiseGlobal.CreateElement("LABEL", "lblDate", elTime, null, {body: l10nMsg["text_86"], paddingRight: "10px"});
		
		// End DateTime Picker
		var objEDate = OPCalendar.MakeDatePicker ("endDatePicker", elEDate, elEDateTimeButton, { headerLabel : l10nMsg["msg_31"] });
		var elEYear = objEDate.elementYear;
		var elEMonth = objEDate.elementMonth;
		var elEDay = objEDate.elementDay;
		SteerGlobal.SteerPageResourceMan.Add("endDateCalendar", objEDate.objCalendar);
		
		var objETime = OPCalendar.MakeTimePicker ("endTimePicker", elETime, { hour: 23, minutes : 59, seconds : 59 });
		var elEHour = objETime.elementHour;
		var elEMinute = objETime.elementMinute;
		var elESecond = objETime.elementSecond;

		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnTermSearch", btnSearch);
		
		actionLogTabHandler.dtTerm = actionLogTabHandler.GetByTermList({
			startDate : CruiseGlobal.ToTimeFormatString(elYear.value, elMonth.value, elDay.value, elHour.value, elMinute.value, elSecond.value),
			endDate : CruiseGlobal.ToTimeFormatString(elEYear.value, elEMonth.value, elEDay.value, elEHour.value, elEMinute.value, elESecond.value),
			serverCategory : CruiseGlobal.GetElementValue("ServerCategorySelect")
			});
	},
	GetByTermList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverCategory=" + objs.serverCategory;
			addRequestVal += "&startDate=" + CruiseGlobal.ToUTCString(objs.startDate);
			addRequestVal += "&endDate=" + CruiseGlobal.ToUTCString(objs.endDate);
			
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (actionLogTabHandler.dtTerm)
			SteerGlobal.SteerPageResourceMan.Remove("getTermActionLogList_TermListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getTermActionLogList",
													"getActionLogListByTerm?",
													"getTermActionLogList",
													"TermListDataListSection",
													{ 	
														selectCallbackFn: actionLogTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("TermListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "actionLogIDint",
														sortDir : "desc",
														selectionMode : "single"
													},
													0);
	},
	GetByUserLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetListUser", null, "NormalTab");
		actionLogTabHandler.opTabView.AddTab(l10nMsg["text_84"], actionDiv, false);
		
		var innerCallback = function ()
		{
			actionLogTabHandler.GetByUserList({
				searchText : CruiseGlobal.GetElementValue("SearchUserText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "UserListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "UserListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchUserButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "UserListDataListSection", actionDiv);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmUser");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchUserButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnUserSearch", btnSearch);
		
		actionLogTabHandler.dtUser = actionLogTabHandler.GetByUserList();
	},
	GetByUserList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (actionLogTabHandler.dtUser)
			SteerGlobal.SteerPageResourceMan.Remove("getUserActionLogList_UserListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getUserActionLogList",
													"getActionLogListByUser?",
													"getUserActionLogList",
													"UserListDataListSection",
													{ 	
														selectCallbackFn: actionLogTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("UserListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userIDstr",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	GetByUserGroupLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetListUserGroup", null, "NormalTab");
		actionLogTabHandler.opTabView.AddTab(l10nMsg["text_85"], actionDiv, false);
		
		var innerCallback = function ()
		{
			actionLogTabHandler.GetByUserGroupList({
				searchText : CruiseGlobal.GetElementValue("SearchUserGroupText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "UserGroupListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "UserGroupListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchUserGroupButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "UserGroupListDataListSection", actionDiv);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserGroupText", searchCriteriaDIV, "txtInputSmUserGroup");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchUserGroupButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnUserGroupSearch", btnSearch);
		
		actionLogTabHandler.dtUserGroup = actionLogTabHandler.GetByUserGroupList();
	},
	GetByUserGroupList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (actionLogTabHandler.dtUserGroup)
			SteerGlobal.SteerPageResourceMan.Remove("getUserGroupActionLogList_UserGroupListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getUserGroupActionLogList",
													"getActionLogListByUserGroup?",
													"getUserGroupActionLogList",
													"UserGroupListDataListSection",
													{ 	
														selectCallbackFn: actionLogTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("UserGroupListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userGroupName",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function(selectedValues, tableObj) {
		SteerGlobal.NowLoading();
		actionLogTabHandler.parentOPTable = tableObj;
		actionLogTabHandler.GetActionLog(selectedValues[0].actionLogIDint);
	},
	InitializePane : function (){
		PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 40});
		actionLogTabHandler.actionPaneDiv = PaneArray[0];
		actionLogTabHandler.basePaneDiv = PaneArray[1];
	},
	GetActionLog : function (actionLogIDint) {
		var _callback = function (o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			var func = messages.returnTables[0][0][0];
			
			actionLogTabHandler.InitializePane();
			
			//Resource Truncation
			SteerGlobal.SteerHandleResourceMan.RemoveAll();
			
			var splittedArguments = func.arguments.replace('[', '').replace(']', '').split(',');
			var formattedArguments = '';
			
			for (index in splittedArguments) {
				if (formattedArguments.length > 0)
					formattedArguments = formattedArguments.concat('<br />');
				formattedArguments = formattedArguments.concat(splittedArguments[index]);
			}
			
			var elTable = CruiseGlobal.CreateElement("TABLE", "ActionLogDetailTable", actionLogTabHandler.basePaneDiv, "ActionLogDetailTable");
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
