var functionGroupAndFunctionLinkHandler = {
	dtFunctionGroupList : null,
	dtLinkedFunctionList : null,
	selectedFunctionGroupIDint : null,
	
	LoadFunctionGroupListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(15), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			functionGroupAndFunctionLinkHandler.GetFunctionGroupList ({ searchText : CruiseGlobal.GetElementValue("SearchFunctionText") });
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionGroupListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchFunctionText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchFunctionGroupListButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		functionGroupAndFunctionLinkHandler.dtFunctionGroupList = functionGroupAndFunctionLinkHandler.GetFunctionGroupList();
	},
	GetFunctionGroupList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (functionGroupAndFunctionLinkHandler.dtFunctionGroupList)
			SteerGlobal.SteerPageResourceMan.Remove("getFunctionGroupList_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getFunctionGroupList",
													"getFunctionGroupList?",
													"getFunctionGroupList",
													"DataListSection",
													{ 	
														selectCallbackFn : functionGroupAndFunctionLinkHandler.ISelectedDataTable, 
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "functionGroupIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function (selectedValues, tableObj)
	{
		SteerGlobal.NowLoading();
		functionGroupAndFunctionLinkHandler.GetFunctionListByFunctionGroup(selectedValues[0].functionGroupIDint, selectedValues[0].functionGroupName);
		functionGroupAndFunctionLinkHandler.selectedFunctionGroupIDint = selectedValues[0].functionGroupIDint;
	},
	GetFunctionListByFunctionGroup : function (functionGroupIDint, functionGroupName)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 16, arrPaneText : [functionGroupName], isForList: true});
		elActionPaneDiv = PaneArray[0];
		elBasePaneDiv = PaneArray[1];
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "SelectedPaginateSection", elActionPaneDiv, null, {paddingLeft : "30px"});
		
		//Display Handler
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("SPAN", "AddButton"));
		elArray.push(CruiseGlobal.CreateElement("SPAN", "RemoveButton"));
		elArray.push(dataPaginationDIV);
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, elActionPaneDiv);
		
		//Add Button
		var btnAdd = new OPButton("AddButton",
									l10nMsg["text_36"], 
									elActionPaneDiv,
									functionGroupAndFunctionLinkHandler.AddFunctionAndFunctionGroupLink);
		btnAdd.SetFontBold();
		SteerGlobal.SteerHandleResourceMan.Add("btnAdd", btnAdd);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton",
									l10nMsg["text_09"], 
									elActionPaneDiv,
									functionGroupAndFunctionLinkHandler.RemoveFunctionAndFunctionGroupLink);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);
		
		if (functionGroupAndFunctionLinkHandler.dtLinkedFunctionList)
			SteerGlobal.SteerHandleResourceMan.Remove("getLinkedFunctionGroupList_" + elBasePaneDiv.id);
		
		functionGroupAndFunctionLinkHandler.dtLinkedFunctionList = SteerMindLogic.CreateHandleSteerDatatable("getFunctionListByFunctionGroup",
				"getFunctionListByFunctionGroup?",
				"getFunctionList",
				elBasePaneDiv.id,
				{ 	
					addRequestParamFn : function () { return "&functionGroupIDint=" + functionGroupIDint + "&actionType=1"; },
					paginator : new OPPaginator("SelectedPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "globalUniqueFunctionIDint",
					sortDir : "asc",
					selectionMode : "multi"
				},
				0);
	},
	AddFunctionAndFunctionGroupLink : function ()
	{
		// Add Item Tag Panel
		var FunctionSelectLayout = function (btnClickCallback, config){
			var layoutWrapper = CruiseGlobal.CreateElement("div", "addFunctionDialogLayout");
			var layoutBody = CruiseGlobal.CreateElement("div", "addFunctionDialogLayoutBody", layoutWrapper, "bd");
			var FunctionSelectInnerCallback = function (){
				// 데이터를 가져온다.
				FunctionSelectDataTable = functionGroupAndFunctionLinkHandler.GetFunctionListForAdd({
					serverCategory : CruiseGlobal.GetElementValue("FuncAddServerCategorySelect"),
					searchText : CruiseGlobal.GetElementValue("FunctionSearchText") });
			};
			
			//Build Divs
			var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "FunctionDataListPaginateSection", layoutBody, null);
			var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "FunctionSearchCriteriaDIV", layoutBody);
	
			var elArray = new Array();
			elArray.push(searchCriteriaDIV);
			elArray.push(CruiseGlobal.CreateElement("SPAN", "FunctionSearchButton"));
			elArray.push(dataPaginationDIV);
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layoutBody);
			
			var datatableDIV = CruiseGlobal.CreateElement("DIV", "FunctionSearchDatatableDIV", layoutBody);
			datatableDIV.style.height = "370px";
			datatableDIV.style.width = "780px";

			//ServerCategory		
			SteerLayout.LoadServerCategorySelect("FuncAddServerCategorySelect", searchCriteriaDIV, FunctionSelectInnerCallback);
			
			//Input Tag
			var elInputArea = CruiseGlobal.CreateElement("INPUT", "FunctionSearchText", searchCriteriaDIV, "txtInputSmall");
			var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, FunctionSelectInnerCallback, this , false, false, this);
			keyListener.enable();

			//Search Button
			var btnSearch = new OPButton("FunctionSearchButton", l10nMsg["text_30"], null, FunctionSelectInnerCallback);
			btnSearch.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("FunctionSearchButton", btnSearch);
			return layoutWrapper.innerHTML;
		}
		
		var oTagDialog = new OPDialog ("addFunctionDialog", FunctionSelectLayout(), null, l10nMsg["msg_18"], null,
				{ width : 800,
				  height : 500 });
		
		var ClearDialogResources = function(){
			oTagDialog.Hide();
			CruiseGlobal.RemoveElement("addFunctionDialogLayout");
			SteerGlobal.SteerHandleResourceMan.Remove("FunctionSearchButton");
			SteerGlobal.SteerHandleResourceMan.Remove("addFunctionDialog");
		}
		oTagDialog.SetButtons([{ text:l10nMsg["text_33"], width: 100, handler:function(o, msg) {
							var selectedRows = FunctionSelectDataTable.GetSelectedRows();
							var callbackCount = 0;
							
							for (var i = 0; i < selectedRows.length; i++){
								var _callback = function(o, messages) {
									if (callbackCount >= selectedRows.length - 1){
										functionGroupAndFunctionLinkHandler.dtLinkedFunctionList.Refresh();
									}else{
										callbackCount++;
										SteerGlobal.ShowLoading();
									}
									if (!SteerGlobal.ValidateResponse(messages)) return;
								};
								OPAjaxRequest("POST", "createLinkFunctionGroupAndExecuteFunction", _callback, 
										"functionGroupIDint=" + functionGroupAndFunctionLinkHandler.selectedFunctionGroupIDint + "&gufid=" + selectedRows[i].globalUniqueFunctionIDint);
							}
							ClearDialogResources();
						}}, { text:l10nMsg["text_03"], width: 100, handler:function(o, msg) {
							ClearDialogResources();
						}}])
		oTagDialog.SetModal(true);
		oTagDialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("addFunctionDialog", oTagDialog);
		FunctionSelectDataTable = functionGroupAndFunctionLinkHandler.GetFunctionListForAdd();
	},
	GetFunctionListForAdd : function (objs)
	{
		//Validation
		var addRequestVal = '&functionGroupIDint=' + functionGroupAndFunctionLinkHandler.selectedFunctionGroupIDint + "&actionType=1";
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		SteerGlobal.SteerHandleResourceMan.Remove("getFunctionListForAdd_FunctionSearchDatatableDIV");
		
		return SteerMindLogic.CreateHandleSteerDatatable("getFunctionListForAdd",
													"getFunctionListNoLinkToFunctionGroup?",
													"getSimpleFunctionList",
													"FunctionSearchDatatableDIV",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("FunctionDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "globalUniqueFunctionIDint",
														sortDir : "asc",
														selectionMode : "multi"
													},
													0);
	},
	RemoveFunctionAndFunctionGroupLink : function ()
	{
		var selectedRows = functionGroupAndFunctionLinkHandler.dtLinkedFunctionList.GetSelectedRows();
		var callbackCount = 0;
		
		for (var i = 0; i < selectedRows.length; i++){
			var _callback = function(o, messages) {
				if (callbackCount >= selectedRows.length - 1){
					functionGroupAndFunctionLinkHandler.dtLinkedFunctionList.Refresh();
				}else{
					callbackCount++;
					SteerGlobal.ShowLoading();
				}
				if (!SteerGlobal.ValidateResponse(messages)) return;
				
			};
			OPAjaxRequest("POST", "removeLinkFunctionGroupAndExecuteFunction", _callback, 
					"functionGroupIDint=" + functionGroupAndFunctionLinkHandler.selectedFunctionGroupIDint + "&gufid=" + selectedRows[i].globalUniqueFunctionIDint);
		}
	}
};
