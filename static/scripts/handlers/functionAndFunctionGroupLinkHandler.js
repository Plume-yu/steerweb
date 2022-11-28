var functionAndFunctionGroupLinkHandler = {
	dtFunctionList : null,
	dtLinkedFunctionGroupList : null,
	selectedGUFID : null,
	
	LoadFunctionListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(13), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			functionAndFunctionGroupLinkHandler.GetFunctionList ({
				serverCategory : CruiseGlobal.GetElementValue("FuncServerCategorySelect"),
				searchText : CruiseGlobal.GetElementValue("SearchFunctionText") 
			});
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("FuncServerCategorySelect", searchCriteriaDIV, innerCallback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchFunctionText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchFunctionListButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		functionAndFunctionGroupLinkHandler.dtFunctionList = functionAndFunctionGroupLinkHandler.GetFunctionList();
	},
	GetFunctionList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			addRequestVal += "&serverType=" + objs.serverCategory;
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (functionAndFunctionGroupLinkHandler.dtFunctionList)
			SteerGlobal.SteerPageResourceMan.Remove("getFunctionList_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getFunctionList",
													"getFunctionList?",
													"getFunctionList",
													"DataListSection",
													{ 	
														selectCallbackFn : functionAndFunctionGroupLinkHandler.ISelectedDataTable, 
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "globalUniqueFunctionIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function (selectedValues, tableObj)
	{
		SteerGlobal.NowLoading();
		functionAndFunctionGroupLinkHandler.GetFunctionGroupListByFunction(selectedValues[0].globalUniqueFunctionIDint, selectedValues[0].functionName);
		functionAndFunctionGroupLinkHandler.selectedGUFID = selectedValues[0].globalUniqueFunctionIDint;
	},
	GetFunctionGroupListByFunction : function (gufid, functionName)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 14, arrPaneText : [functionName], isForList: true});
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
									l10nMsg["text_35"], 
									elActionPaneDiv,
									functionAndFunctionGroupLinkHandler.AddFunctionAndFunctionGroupLink);
		btnAdd.SetFontBold();
		SteerGlobal.SteerHandleResourceMan.Add("btnAdd", btnAdd);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton",
									l10nMsg["text_09"], 
									elActionPaneDiv,
									functionAndFunctionGroupLinkHandler.RemoveFunctionAndFunctionGroupLink);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);
		
		if (functionAndFunctionGroupLinkHandler.dtLinkedFunctionGroupList)
			SteerGlobal.SteerHandleResourceMan.Remove("getLinkedFunctionGroupList_" + elBasePaneDiv.id);
		
		functionAndFunctionGroupLinkHandler.dtLinkedFunctionGroupList = SteerMindLogic.CreateHandleSteerDatatable("getFunctionGroupListByFunction",
				"getFunctionGroupListByFunction?",
				"getFunctionGroupList",
				elBasePaneDiv.id,
				{ 	
					addRequestParamFn : function () { return "&gufid=" + gufid + "&actionType=1"},
					paginator : new OPPaginator("SelectedPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "functionGroupIDint",
					sortDir : "asc",
					selectionMode : "multi"
				},
				0);
	},
	AddFunctionAndFunctionGroupLink : function ()
	{
		// Add Item Tag Panel
		var FunctionGroupSelectLayout = function (btnClickCallback, config){
			var layoutWrapper = CruiseGlobal.CreateElement("div", "addFunctionGroupDialogLayout");
			var layoutBody = CruiseGlobal.CreateElement("div", "addFunctionGroupDialogLayoutBody", layoutWrapper, "bd");
			var FunctionGroupSelectInnerCallback = function (){
				// 데이터를 가져온다.
				FunctionGroupSelectDataTable = functionAndFunctionGroupLinkHandler.GetFunctionGroupListForAdd(
						{ searchText : CruiseGlobal.GetElementValue("FunctionGroupSearchText") });
			};
			
			//Build Divs
			var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupDataListPaginateSection", layoutBody, null);
			var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupSearchCriteriaDIV", layoutBody);
	
			var elArray = new Array();
			elArray.push(searchCriteriaDIV);
			elArray.push(CruiseGlobal.CreateElement("SPAN", "FunctionGroupSearchButton"));
			elArray.push(dataPaginationDIV);
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layoutBody);
			
			var datatableDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupSearchDatatableDIV", layoutBody);
			datatableDIV.style.height = "370px";
			datatableDIV.style.width = "780px";

			//Input Tag
			var elInputArea = CruiseGlobal.CreateElement("INPUT", "FunctionGroupSearchText", searchCriteriaDIV, "txtInputNormal");
			var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, FunctionGroupSelectInnerCallback, this , false, false, this);
			keyListener.enable();

			//Search Button
			var btnSearch = new OPButton("FunctionGroupSearchButton", l10nMsg["text_30"], null, FunctionGroupSelectInnerCallback);
			btnSearch.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("FunctionGroupSearchButton", btnSearch);
			return layoutWrapper.innerHTML;
		}
		
		var oTagDialog = new OPDialog ("addFunctionGroupDialog", FunctionGroupSelectLayout(), null, l10nMsg["msg_17"], null,
				{ width : 800,
				  height : 500 });
		
		var ClearDialogResources = function(){
			oTagDialog.Hide();
			CruiseGlobal.RemoveElement("addFunctionGroupDialogLayout");
			SteerGlobal.SteerHandleResourceMan.Remove("FunctionGroupSearchButton");
			SteerGlobal.SteerHandleResourceMan.Remove("addFunctionGroupDialog");
		}
		oTagDialog.SetButtons([{ text:l10nMsg["text_33"], width: 100, handler:function(o, msg) {
							var selectedRows = FunctionGroupSelectDataTable.GetSelectedRows();
							var callbackCount = 0;
							
							for (var i = 0; i < selectedRows.length; i++){
								var _callback = function(o, messages) {
									if (callbackCount >= selectedRows.length - 1){
										functionAndFunctionGroupLinkHandler.dtLinkedFunctionGroupList.Refresh();
									}else{
										callbackCount++;
										SteerGlobal.ShowLoading();
									}
									if (!SteerGlobal.ValidateResponse(messages)) return;
								};
								OPAjaxRequest("POST", "createLinkFunctionGroupAndExecuteFunction", _callback, 
										"gufid=" + functionAndFunctionGroupLinkHandler.selectedGUFID + "&functionGroupIDint=" + selectedRows[i].functionGroupIDint);
							}
							ClearDialogResources();
						}}, { text:l10nMsg["text_03"], width: 100, handler:function(o, msg) {
							ClearDialogResources();
						}}])
		oTagDialog.SetModal(true);
		oTagDialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("addFunctionGroupDialog", oTagDialog);
		FunctionGroupSelectDataTable = functionAndFunctionGroupLinkHandler.GetFunctionGroupListForAdd();
	},
	GetFunctionGroupListForAdd : function (objs)
	{
		//Validation
		var addRequestVal = '&gufid=' + functionAndFunctionGroupLinkHandler.selectedGUFID + "&actionType=1";
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		SteerGlobal.SteerHandleResourceMan.Remove("getFunctionGroupListForAdd_FunctionGroupSearchDatatableDIV");
		
		return SteerMindLogic.CreateHandleSteerDatatable("getFunctionGroupListForAdd",
													"getFunctionGroupListNoLinkToFunction?",
													"getFunctionGroupList",
													"FunctionGroupSearchDatatableDIV",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("FunctionGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "functionGroupIDint",
														sortDir : "asc",
														selectionMode : "multi"
													},
													0);
	},
	RemoveFunctionAndFunctionGroupLink : function ()
	{
		var selectedRows = functionAndFunctionGroupLinkHandler.dtLinkedFunctionGroupList.GetSelectedRows();
		var callbackCount = 0;
		
		for (var i = 0; i < selectedRows.length; i++){
			var _callback = function(o, messages) {
				if (callbackCount >= selectedRows.length - 1){
					functionAndFunctionGroupLinkHandler.dtLinkedFunctionGroupList.Refresh();
				}else{
					callbackCount++;
					SteerGlobal.ShowLoading();
				}
				if (!SteerGlobal.ValidateResponse(messages)) return;
				
			};
			OPAjaxRequest("POST", "removeLinkFunctionGroupAndExecuteFunction", _callback, 
					"gufid=" + functionAndFunctionGroupLinkHandler.selectedGUFID + "&functionGroupIDint=" + selectedRows[i].functionGroupIDint);
		}
	}
};
