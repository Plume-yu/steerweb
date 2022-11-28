var executeCastTabHandler = {
	opTabView : null,
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	parentOPTable : null,
	actionPaneDiv : null,
	basePaneDiv : null,
	
	dtExecutable : null,
	dtCastable : null,
	
	LoadExecCastLayout : function ()
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "ImportPaneNameArea", {body: SteerGlobal.GetPaneText(1)});
		var tabDiv = CruiseGlobal.CreateElement("div", "DataListSection", newDiv);
		executeCastTabHandler.opTabView = new OPTabView ("executeCastTabView", tabDiv);

		SteerLayout.LoadLeftCenterLayout();

		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			if (messages.Executable != null && messages.Executable){
				executeCastTabHandler.GetExecFuncListLayout();
			}
			if (messages.Castable != null && messages.Castable){
				executeCastTabHandler.GetCastFuncListLayout();
			}
			executeCastTabHandler.opTabView.SelectTab(0);
		};
		OPAjaxRequest("GET", "checkExecCastPrivileges", _callback);
		SteerGlobal.ShowLoading();
	},
	GetExecFuncListLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetExecFuncListTagAction", null, "NormalTab");
		executeCastTabHandler.opTabView.AddTab(l10nMsg["text_28"], actionDiv, false);
		
		var innerCallback = function ()
		{
			executeCastTabHandler.GetExecFuncList({
				serverCategory : CruiseGlobal.GetElementValue("ExecFuncServerCategorySelect"),
				searchText : CruiseGlobal.GetElementValue("SearchExecFuncText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "ExecFuncListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "ExecFuncListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchExecFuncButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "ExecFuncListDataListSection", actionDiv);
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("ExecFuncServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchExecFuncText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchExecFuncButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		executeCastTabHandler.dtExecutable = executeCastTabHandler.GetExecFuncList();
	},
	GetExecFuncList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (executeCastTabHandler.dtExecutable)
			SteerGlobal.SteerPageResourceMan.Remove("getExecutableFunctionList_ExecFuncListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getExecutableFunctionList",
													"getExecutableFunctionList?",
													"getExecutableFunctionList",
													"ExecFuncListDataListSection",
													{ 	
														selectCallbackFn: executeCastTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("ExecFuncListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "globalUniqueFunctionIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	GetCastFuncListLayout : function()
	{
		var actionDiv = CruiseGlobal.CreateElement("div", "GetCastFuncListTagAction", null, "NormalTab");
		executeCastTabHandler.opTabView.AddTab(l10nMsg["text_29"], actionDiv, false);
		
		var innerCallback = function ()
		{
			executeCastTabHandler.GetCastFuncList({
				serverCategory : CruiseGlobal.GetElementValue("CastFuncServerCategorySelect"),
				searchText : CruiseGlobal.GetElementValue("SearchCastFuncText") 
				});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "CastFuncListPagination", actionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "CastFuncListSearchCriteriaDIV", actionDiv);

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchCastFuncButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, actionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "CastFuncListDataListSection", actionDiv);

		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("CastFuncServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchCastFuncText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchCastFuncButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		executeCastTabHandler.dtCastable = executeCastTabHandler.GetCastFuncList();
	},
	GetCastFuncList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (executeCastTabHandler.dtCastable)
			SteerGlobal.SteerPageResourceMan.Remove("getCastableFunctionList_CastFuncListDataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getCastableFunctionList",
													"getCastableFunctionList?",
													"getCastableFunctionList",
													"CastFuncListDataListSection",
													{ 	
														selectCallbackFn: executeCastTabHandler.ISelectedDataTable,
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("CastFuncListPagination", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "globalUniqueFunctionIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function(selectedValues, tableObj) {
		SteerGlobal.NowLoading();
		executeCastTabHandler.parentOPTable = tableObj;
		executeCastTabHandler.GetFunction(selectedValues[0].globalUniqueFunctionIDint);
	},
	InitializePane : function (){
		PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 18});
		executeCastTabHandler.actionPaneDiv = PaneArray[0];
		executeCastTabHandler.basePaneDiv = PaneArray[1];
	},
	GetFunction : function (globalUniqueFunctionIDint) {
		var _callback = function (o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			var func = messages.returnTables[0][0][0];
			var functionAndFunctionGroups = messages.returnTables[1][0];
			
			executeCastTabHandler.InitializePane();
			
			//Resource Truncation
			SteerGlobal.SteerHandleResourceMan.RemoveAll();
			
			var splittedArguments = func.arguments.replace('[', '').replace(']', '').split(',');
			var formattedArguments = '';
			
			for (index in splittedArguments) {
				if (formattedArguments.length > 0)
					formattedArguments = formattedArguments.concat('<br />');
				formattedArguments = formattedArguments.concat(splittedArguments[index]);
			}
			
			var elTable = CruiseGlobal.CreateElement("TABLE", "FunctionDetailTable", executeCastTabHandler.basePaneDiv, "FunctionDetailTable");
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_globalUniqueFunctionIDint"], func.globalUniqueFunctionIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_serverType"], func.serverType], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_serverName"], func.serverName], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionIDint"], func.functionIDint], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionName"], func.functionName], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionUseFlag"], SteerGlobal.GetCodeText('functionUseFlag', func.functionUseFlag)], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_dangerLevel"], func.dangerLevel], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_requireSessionFlag"], SteerGlobal.GetCodeText('requireSessionFlag', func.requireSessionFlag)], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_arguments"], formattedArguments], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_results"], func.results], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionDescription"], func.functionDescription], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayName"], func.displayName], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displaySortOrder"], func.displaySortOrder], elTable);
			
			// Show functionAndFunctionGroups
			var elTable = CruiseGlobal.CreateElement("TABLE", "functionAndFunctionGroupsDataTable", executeCastTabHandler.basePaneDiv, "functionAndFunctionGroupsDataTable");
			SteerGlobal.MakeLayoutTR_HTML([''], elTable);
			SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_39']], elTable);
			
			var functionAndFunctionGroupsDataTableDIV = CruiseGlobal.CreateElement("DIV", "functionAndFunctionGroupsDataTableDIV");
			SteerGlobal.MakeLayoutTR_INPUT(null, functionAndFunctionGroupsDataTableDIV, elTable);
			
			var configs = {JSArrayObejct: {data: functionAndFunctionGroups},
					 l10nObj: l10nMsg,
					 formatRow: SteerMindLogic.MindProcessFormatter,
					 selectionMode: "null",
					 width: "105%",
					 height: "105%"};
			
			var functionAndFunctionGroupsDataTable = new OPDataTable("functionAndFunctionGroupsDataTable", null, SteerMindLogic.GetColumns("functionAndFunctionGroupsDataTable"), "functionAndFunctionGroupsDataTableDIV", configs);
			SteerGlobal.SteerHandleResourceMan.Add("functionAndFunctionGroupsDataTable", functionAndFunctionGroupsDataTable);
		}
		
		OPAjaxRequest("POST", "getDetailFunction", _callback, "globalUniqueFunctionIDint=" + globalUniqueFunctionIDint);
	}
};
