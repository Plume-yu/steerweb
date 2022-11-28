var functionAndDisplayGroupLinkHandler = {
	dtFunctionList : null,
	dtLinkedDisplayGroupList : null,
	selectedGUFID : null,
	
	LoadFunctionListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(25), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			functionAndDisplayGroupLinkHandler.GetFunctionList ({
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
		
		functionAndDisplayGroupLinkHandler.dtFunctionList = functionAndDisplayGroupLinkHandler.GetFunctionList();
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
		
		if (functionAndDisplayGroupLinkHandler.dtFunctionList)
			SteerGlobal.SteerPageResourceMan.Remove("getFunctionList_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getFunctionList",
													"getFunctionList?",
													"getFunctionList",
													"DataListSection",
													{ 	
														selectCallbackFn : functionAndDisplayGroupLinkHandler.ISelectedDataTable, 
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
		functionAndDisplayGroupLinkHandler.GetDisplayGroupListByFunction(selectedValues[0].globalUniqueFunctionIDint, selectedValues[0].functionName);
		functionAndDisplayGroupLinkHandler.selectedGUFID = selectedValues[0].globalUniqueFunctionIDint;
	},
	GetDisplayGroupListByFunction : function (gufid, functionName)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 26, arrPaneText : [functionName], isForList: true});
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
									l10nMsg["text_37"], 
									elActionPaneDiv,
									functionAndDisplayGroupLinkHandler.AddFunctionAndDisplayGroupLink);
		btnAdd.SetFontBold();
		SteerGlobal.SteerHandleResourceMan.Add("btnAdd", btnAdd);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton",
									l10nMsg["text_09"], 
									elActionPaneDiv,
									functionAndDisplayGroupLinkHandler.RemoveFunctionAndDisplayGroupLink);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);
		
		if (functionAndDisplayGroupLinkHandler.dtLinkedDisplayGroupList)
			SteerGlobal.SteerHandleResourceMan.Remove("getLinkedDisplayGroupList_" + elBasePaneDiv.id);
		
		functionAndDisplayGroupLinkHandler.dtLinkedDisplayGroupList = SteerMindLogic.CreateHandleSteerDatatable("getDisplayGroupListByFunction",
				"getDisplayGroupListByFunction?",
				"getSimpleDisplayGroupFunctionList",
				elBasePaneDiv.id,
				{ 	
					addRequestParamFn : function () { return "&gufid=" + gufid},
					paginator : new OPPaginator("SelectedPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "displayGroupIDint",
					sortDir : "asc",
					selectionMode : "multi"
				},
				0);
	},
	AddFunctionAndDisplayGroupLink : function ()
	{
		// Add Item Tag Panel
		var DisplayGroupSelectLayout = function (btnClickCallback, config){
			var layoutWrapper = CruiseGlobal.CreateElement("div", "addDisplayGroupDialogLayout");
			var layoutBody = CruiseGlobal.CreateElement("div", "addDisplayGroupDialogLayoutBody", layoutWrapper, "bd");
			var DisplayGroupSelectInnerCallback = function (){
				// 데이터를 가져온다.
				DisplayGroupSelectDataTable = functionAndDisplayGroupLinkHandler.GetDisplayGroupListForAdd(
						{ searchText : CruiseGlobal.GetElementValue("DisplayGroupSearchText") });
			};
			
			//Build Divs
			var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupDataListPaginateSection", layoutBody, null);
			var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupSearchCriteriaDIV", layoutBody);
	
			var elArray = new Array();
			elArray.push(searchCriteriaDIV);
			elArray.push(CruiseGlobal.CreateElement("SPAN", "DisplayGroupSearchButton"));
			elArray.push(dataPaginationDIV);
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layoutBody);
			
			var datatableDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupSearchDatatableDIV", layoutBody);
			datatableDIV.style.height = "370px";
			datatableDIV.style.width = "780px";

			//Input Tag
			var elInputArea = CruiseGlobal.CreateElement("INPUT", "DisplayGroupSearchText", searchCriteriaDIV, "txtInputNormal");
			var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, DisplayGroupSelectInnerCallback, this , false, false, this);
			keyListener.enable();

			//Search Button
			var btnSearch = new OPButton("DisplayGroupSearchButton", l10nMsg["text_30"], null, DisplayGroupSelectInnerCallback);
			btnSearch.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("DisplayGroupSearchButton", btnSearch);
			return layoutWrapper.innerHTML;
		}
		
		var oTagDialog = new OPDialog ("addDisplayGroupDialog", DisplayGroupSelectLayout(), null, l10nMsg["msg_19"], null,
				{ width : 800,
				  height : 500 });
		
		var ClearDialogResources = function(){
			oTagDialog.Hide();
			CruiseGlobal.RemoveElement("addDisplayGroupDialogLayout");
			SteerGlobal.SteerHandleResourceMan.Remove("DisplayGroupSearchButton");
			SteerGlobal.SteerHandleResourceMan.Remove("addDisplayGroupDialog");
		}
		oTagDialog.SetButtons([{ text:l10nMsg["text_33"], width: 100, handler:function(o, msg) {
							var selectedRows = DisplayGroupSelectDataTable.GetSelectedRows();
							var callbackCount = 0;
							
							for (var i = 0; i < selectedRows.length; i++){
								var _callback = function(o, messages) {
									if (callbackCount >= selectedRows.length - 1){
										functionAndDisplayGroupLinkHandler.dtLinkedDisplayGroupList.Refresh();
									}else{
										callbackCount++;
										SteerGlobal.ShowLoading();
									}
									if (!SteerGlobal.ValidateResponse(messages)) return;
								};
								OPAjaxRequest("POST", "createLinkDisplayGroupAndFunction", _callback, 
										"gufid=" + functionAndDisplayGroupLinkHandler.selectedGUFID + "&displayGroupIDint=" + selectedRows[i].displayGroupIDint);
							}
							ClearDialogResources();
						}}, { text:l10nMsg["text_03"], width: 100, handler:function(o, msg) {
							ClearDialogResources();
						}}])
		oTagDialog.SetModal(true);
		oTagDialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("addDisplayGroupDialog", oTagDialog);
		DisplayGroupSelectDataTable = functionAndDisplayGroupLinkHandler.GetDisplayGroupListForAdd();
	},
	GetDisplayGroupListForAdd : function (objs)
	{
		//Validation
		var addRequestVal = '&gufid=' + functionAndDisplayGroupLinkHandler.selectedGUFID;
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		SteerGlobal.SteerHandleResourceMan.Remove("getDisplayGroupListForAdd_DisplayGroupSearchDatatableDIV");
		
		return SteerMindLogic.CreateHandleSteerDatatable("getDisplayGroupListForAdd",
													"getDisplayGroupListNoLinkToFunction?",
													"getDisplayGroupList",
													"DisplayGroupSearchDatatableDIV",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DisplayGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "displayGroupIDint",
														sortDir : "asc",
														selectionMode : "multi"
													},
													0);
	},
	RemoveFunctionAndDisplayGroupLink : function ()
	{
		var selectedRows = functionAndDisplayGroupLinkHandler.dtLinkedDisplayGroupList.GetSelectedRows();
		var callbackCount = 0;
		
		for (var i = 0; i < selectedRows.length; i++){
			var _callback = function(o, messages) {
				if (callbackCount >= selectedRows.length - 1){
					functionAndDisplayGroupLinkHandler.dtLinkedDisplayGroupList.Refresh();
				}else{
					callbackCount++;
					SteerGlobal.ShowLoading();
				}
				if (!SteerGlobal.ValidateResponse(messages)) return;
				
			};
			OPAjaxRequest("POST", "removeLinkDisplayGroupAndFunction", _callback, 
					"gufid=" + functionAndDisplayGroupLinkHandler.selectedGUFID + "&displayGroupIDint=" + selectedRows[i].displayGroupIDint);
		}
	}
};
