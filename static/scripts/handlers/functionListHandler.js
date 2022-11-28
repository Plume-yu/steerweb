/*==================================
    
     Function Handler Scripts
        
====================================*/

function CreateFunction(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			if (functionListHandler.dtFunctionList != null)
				functionListHandler.dtFunctionList.Refresh();
			
			functionListHandler.CreateFunction();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (elFunctionName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_86"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_87"], l10nMsg["text_02"]);
			return;
		}
		
		if (selectedServerCategories.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_26"], l10nMsg["text_02"]);
			return;
		}
		
		if (elFunctionIDint.value <= 0 || elFunctionIDint.value > 16777216) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_83"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDangerLevel.value < 1 || elDangerLevel.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_84"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplaySortOrder.value < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_85"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "serverType=" + selectedServerCategories[0].categoryIDint;
		req_string += "&functionIDint=" + elFunctionIDint.value;
		req_string += "&functionName=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionName.value);
		req_string += "&functionUseFlag=" + (elFunctionUseFlag.checked ? 1 : 0);
		req_string += "&dangerLevel=" + elDangerLevel.value;
		req_string += "&requireSessionFlag=" + (elRequireSessionFlag.checked ? 1 : 0);
		req_string += "&arguments=" + CruiseGlobal.ReplaceToSpecialChar(elArguments.value);
		req_string += "&results=" + CruiseGlobal.ReplaceToSpecialChar(elResults.value);
		req_string += "&functionDescription=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionDescription.value);
		req_string += "&displayName=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayName.value);
		req_string += "&displaySortOrder=" + elDisplaySortOrder.value;
		
		OPAjaxRequest("POST", "createFunction", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 36});
	var elActionPaneDiv = PaneArray[0];
	var elBasePaneDiv = PaneArray[1];
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elArray = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	               CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, elActionPaneDiv);
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_06"], elActionPaneDiv, _confirm);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "CreateUserGroupTable", elBasePaneDiv, "CreateUserGroupTable");
	
	// Add selecting function group panel
	var serverCategoryDataTable = null;
	var selectedServerCategories = [];
	
	function _AddServerCategory(event, msg) {
		function _MakeSelectionLayout(btnClickCallback, config) {
			function _callback(event, msg) {
				serverCategoryDataTable = _GetItemDataTable();
			}
			
			var layout_wrapper_div = CruiseGlobal.CreateElement("div", "layout_wrapper_div");
			var layout_body_div = CruiseGlobal.CreateElement("div", "layout_body_div", layout_wrapper_div, "bd");
			
			//Build Divs
			var pagination_div = CruiseGlobal.CreateElement("div", "pagination_div", layout_body_div, null);
			var search_condition_div = CruiseGlobal.CreateElement("div", "search_condition_div", layout_body_div);
			
			var elArray = [search_condition_div,
			               CruiseGlobal.CreateElement("SPAN", "search_button_span"),
			               pagination_div];
			
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layout_body_div);
			
			var data_table_div = CruiseGlobal.CreateElement("div", "data_table_div", layout_body_div);
			data_table_div.style.height = "370px";
			data_table_div.style.width = "780px";

			//Input 
			var search_input = CruiseGlobal.CreateElement("INPUT", "search_input", search_condition_div, "txtInputNormal");
			var key_listener = new CruiseEvent.CreateKeyListener(search_input, 13, _callback, this , false, false, this);
			key_listener.enable();

			//Search Button
			var search_button = new OPButton("search_button_span", l10nMsg["text_30"], null, _callback);
			search_button.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("search_button", search_button);
			
			return layout_wrapper_div.innerHTML;
		}
		
		function _ClearDialogResources() {
			server_category_dialog.Hide();
			CruiseGlobal.RemoveElement("layout_wrapper_div");
			SteerGlobal.SteerHandleResourceMan.Remove("search_button");
			SteerGlobal.SteerHandleResourceMan.Remove("function_group_dialog");
		}
		
		function _AddServerCategory(event, msg) {
			var selected_rows = serverCategoryDataTable.GetSelectedRows();
			
			for (selected_row in selected_rows) {
				var isSelected = false;
				
				for (selected_server_category in selectedServerCategories) {
					if (selectedServerCategories[selected_server_category].categoryIDint == selected_rows[selected_row].categoryIDint) {
						isSelected = true;
						CruiseGlobal.SHOWINFO (l10nMsg["text_09"], l10nMsg["msg_39"], l10nMsg["text_09"]);
						loadingCount++;
						break;
					}
				}
				
				if (isSelected == false) {
					function _callback(event, messages) {
						var serverCategory = messages.returnTables[0][0][0];
						
						var data = {categoryIDint: serverCategory.categoryIDint,
								serverName : serverCategory.serverName,
								description : serverCategory.description};
						
						selectedServerCategories.push(data);
						
						selectedServerCategoryDataTable.Refresh();
					}
					
					OPAjaxRequest("POST", "getDetailServerCategory", _callback, "categoryIDint=" + selected_rows[selected_row].categoryIDint);
					SteerGlobal.ShowLoading();
				}
			}
			
			_ClearDialogResources();
		}
		
		function _CancelAddingFunctionGroup(o, msg) {
			_ClearDialogResources();
		}
		
		var server_category_dialog = new OPDialog("server_category_dialog", _MakeSelectionLayout(), null, l10nMsg["text_33"], null, {width: 800, height: 500});
		server_category_dialog.SetButtons([{text:l10nMsg["text_33"], width: 100, handler: _AddServerCategory}, {text:l10nMsg["text_03"], width: 100, handler: _CancelAddingFunctionGroup}])
		server_category_dialog.SetModal(true);
		server_category_dialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("server_category_dialog", server_category_dialog);
		
		function _GetItemDataTable() {
			var search_condition = CruiseGlobal.GetElementValue("search_input");
			
			//Validation
			var addRequestVal = '';
			if (search_condition) {
				if (search_condition != null && search_condition != '')
					addRequestVal += "&searchCriteria=" + search_condition;
			}
			
			if (serverCategoryDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getServerCategoryList_data_table_div");
			
			var configs = {
					addRequestParamFn: function () {return addRequestVal;},
					paginator: new OPPaginator("pagination_div", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "categoryIDint",
					sortDir: "asc",
					selectionMode: "single"};
			
			return SteerMindLogic.CreateSteerDatatable("getServerCategoryList", "getServerCategory?", "getServerCategory", "data_table_div", configs, 0);
		}
		
		serverCategoryDataTable = _GetItemDataTable();
	}
	
	function _ResetFunctionGroup() {
		var length = selectedServerCategories.length;
		
		for (var i = 0; i < length; i++){
			selectedServerCategories.pop();
		}
		
		selectedServerCategoryDataTable.Refresh();
	}
	
	var serverCategoryDiv = CruiseGlobal.CreateElement("DIV", "serverCategoryDiv");
	var addServerCategorySpan = CruiseGlobal.CreateElement("SPAN", "addServerCategorySpan", serverCategoryDiv);
	var resetServerCategorySpan = CruiseGlobal.CreateElement("SPAN", "resetServerCategorySpan", serverCategoryDiv);
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_63"], serverCategoryDiv, elTable);
	
	// Add server category
	var addServerCategoryButton = new OPButton("addServerCategoryButton", l10nMsg["text_33"], addServerCategorySpan, _AddServerCategory);
	SteerGlobal.SteerHandleResourceMan.Add("addServerCategoryButton", addServerCategoryButton);
	
	// Reset server category
	var resetServerCategoryButton = new OPButton("resetServerCategoryButton", l10nMsg["text_57"], resetServerCategorySpan, _ResetFunctionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("resetServerCategoryButton", resetServerCategoryButton);
	
	var selectedServerCategoryDiv = CruiseGlobal.CreateElement("DIV", "selectedServerCategoryDiv");
	SteerGlobal.MakeLayoutTR_INPUT(null, selectedServerCategoryDiv, elTable);
	
	var configs = {JSArrayObejct: {data: selectedServerCategories},
			l10nObj: l10nMsg,
			formatRow: SteerMindLogic.MindProcessFormatter,
			selectionMode: "null",
			width: "105%",
			height: "105%"};
	
    var selectedServerCategoryDataTable = new OPDataTable("selectedServerCategoryDataTable", null, SteerMindLogic.GetColumns("getServerCategory"), "selectedServerCategoryDiv", configs);
	SteerGlobal.SteerHandleResourceMan.Add("selectedServerCategoryDataTable", selectedServerCategoryDataTable);
	
	var elFunctionIDint = CruiseGlobal.CreateElement("INPUT", "inputFunctionIDint", null, "txtInputVerySmall", {maxlength: 8});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_64"], elFunctionIDint, elTable);
	
	var elFunctionName = CruiseGlobal.CreateElement("INPUT", "inputFunctionName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_65"], elFunctionName, elTable);
	
	var elFunctionUseFlag = CruiseGlobal.CreateElement("INPUT", "inputFunctionUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elFunctionUseFlag, elTable);
	
	elFunctionUseFlag.checked = true;
	
	var elDangerLevel = CruiseGlobal.CreateElement("INPUT", "inputDangerLevel", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_67"], elDangerLevel, elTable);
	
	var elRequireSessionFlag = CruiseGlobal.CreateElement("INPUT", "inputRequireSessionFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_68"], elRequireSessionFlag, elTable);
	
	elRequireSessionFlag.checked = true;
	
	var elArguments = CruiseGlobal.CreateElement("INPUT", "inputArguments", null, "txtInputBig", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_69"], elArguments, elTable);
	
	var elResults = CruiseGlobal.CreateElement("INPUT", "inputResults", null, "txtInputBig", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_70"], elResults, elTable);
	
	var elFunctionDescription = CruiseGlobal.CreateElement("INPUT", "inputFunctionDescription", null, "txtInputBig", {maxlength: 1000});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_71"], elFunctionDescription, elTable);
	
	var elDisplayName = CruiseGlobal.CreateElement("INPUT", "inputDisplayName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_72"], elDisplayName, elTable);
	
	var elDisplaySortOrder = CruiseGlobal.CreateElement("INPUT", "inputDisplaySortOrder", null, "txtInputVerySmall", {maxlength: 10});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_73"], elDisplaySortOrder, elTable);
}

function GetFunctionList(action, event, obj) {
	SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
	SteerLayout.CommonInnerLeft();
	CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(5), true);

	SteerLayout.LoadLeftCenterLayout();
	
	function _callback() {
		var serverCategory = CruiseGlobal.GetElementValue("FuncServerCategorySelect");
		var searchText = CruiseGlobal.GetElementValue("SearchUserText");
		
		//Validation
		var addRequestVal = '';
		if (serverCategory) {
			addRequestVal += "&serverType=" + serverCategory;
			if (searchText != null && searchText != '')
				addRequestVal += "&searchCriteria=" + searchText;
		}
		
		if (functionListHandler.dtFunctionList)
			SteerGlobal.SteerPageResourceMan.Remove("getFunctionList_DataListSection");
		
		var configs = {
				selectCallbackFn: functionListHandler.ISelectedDataTable,
				addRequestParamFn : function () { return addRequestVal; },
				paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
				l10nObj : l10nMsg,
				formatRow : SteerMindLogic.MindProcessFormatter,
				sortColumn : "globalUniqueFunctionIDint",
				sortDir : "asc",
				selectionMode : "single"};
		
		functionListHandler.dtFunctionList = SteerMindLogic.CreateSteerDatatable("getFunctionList", "getFunctionList?", "getFunctionList", "DataListSection", configs, 0);
	}
	
	//Build Divs
	var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
	var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

	var elArray = new Array();
	elArray.push(searchCriteriaDIV);
	elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionListButton"));
	elArray.push(dataPaginationDIV);
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
	
	//ServerCategory		
	SteerLayout.LoadServerCategorySelect("FuncServerCategorySelect", searchCriteriaDIV, _callback);
	
	//Input Tag
	var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
	var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
	keyListener.enable();
	
	//Search Button
	var btnSearch = new OPButton("SearchFunctionListButton", l10nMsg["text_30"], null, function (){ _callback(); });
	btnSearch.SetHeight(20);
	
	//Resource Registration
	SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
	
	 _callback();
}

function ISelectedDataTable(selectedValues, tableObj) {
	SteerGlobal.NowLoading();
	functionListHandler.parentOPTable = tableObj;
	functionListHandler.GetFunction(selectedValues[0].globalUniqueFunctionIDint);
}

function InitializePane() {
	PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 18});
	functionListHandler.actionPaneDiv = PaneArray[0];
	functionListHandler.basePaneDiv = PaneArray[1];
}

function SetOPTable(tableObj) {
	functionListHandler.parentOPTable = tableObj;
}

function GetFunction(globalUniqueFunctionIDint) {
	function _callback(o, messages) {
		if (!SteerGlobal.ValidateResponse(messages))
			return;
		
		var func = messages.returnTables[0][0][0];
		var functionAndFunctionGroups = messages.returnTables[1][0];
		
		functionListHandler.InitializePane();
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elements = [CruiseGlobal.CreateElement("SPAN", "RemoveButton"),
		                CruiseGlobal.CreateElement("SPAN", "ModifyButton")];
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elements, functionListHandler.actionPaneDiv);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton", l10nMsg["text_09"],
				functionListHandler.actionPaneDiv,
				functionListHandler.RemoveFunction,
				func);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);

		//Modify Button
		var btnModify = new OPButton("ModifyButton",
				l10nMsg["text_08"],
				functionListHandler.actionPaneDiv,
				functionListHandler.ModifyFunction,
				func);
		SteerGlobal.SteerHandleResourceMan.Add("btnModify", btnModify);
		
		var splittedArguments = func.arguments.replace('[', '').replace(']', '').split(',');
		var formattedArguments = '';
		
		for (index in splittedArguments) {
			if (formattedArguments.length > 0)
				formattedArguments = formattedArguments.concat('<br />');
			formattedArguments = formattedArguments.concat(splittedArguments[index]);
		}
		
		var elTable = CruiseGlobal.CreateElement("TABLE", "FunctionDetailTable", functionListHandler.basePaneDiv, "FunctionDetailTable");
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
		var elTable = CruiseGlobal.CreateElement("TABLE", "functionAndFunctionGroupsDataTable", functionListHandler.basePaneDiv, "functionAndFunctionGroupsDataTable");
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

function RemoveFunction(event, func) {
	function _confirm() {
    	function _callback(o, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			functionListHandler.GetFunction(func.globalUniqueFunctionIDint);
			functionListHandler.parentOPTable.Refresh();
		};
		
		var req_string = "";
		req_string += "globalUniqueFunctionIDint=" + func.globalUniqueFunctionIDint;
		req_string += "&functionName=" + CruiseGlobal.ReplaceToSpecialChar(func.functionName);
		req_string += "&functionUseFlag=" + "0";
		req_string += "&dangerLevel=" + func.dangerLevel;
		req_string += "&requireSessionFlag=" + func.requireSessionFlag;
		req_string += "&arguments=" + CruiseGlobal.ReplaceToSpecialChar(func.arguments);
		req_string += "&results=" + CruiseGlobal.ReplaceToSpecialChar(func.results);
		req_string += "&functionDescription=" + CruiseGlobal.ReplaceToSpecialChar(func.functionDescription);
		req_string += "&displayName=" + CruiseGlobal.ReplaceToSpecialChar(func.displayName);
		req_string += "&displaySortOrder=" + func.displaySortOrder;
		
		OPAjaxRequest("POST", "modifyFunction", _callback, req_string);
		
		this.hide();
		SteerGlobal.ShowLoading();
    }
    
    function _cancel() {
    	this.hide();
    }
    
	var confirmBox = new OPMsgBox("ConfirmRemove", func.globalUniqueFunctionIDint + l10nMsg["msg_27"], l10nMsg["text_50"], {isFixedCenter: true, isDraggable: false, isClose: true, isModal: true, width: 300});
	confirmBox.SetICON("warn");
	confirmBox.SetButtons([{text: l10nMsg["text_02"], handler: _confirm, isDefault: true}, {text: l10nMsg["text_03"],  handler: _cancel}]);
	confirmBox.Show();
}

function ModifyFunction(event, func) {
	functionListHandler.InitializePane();
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elements = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	                CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, functionListHandler.actionPaneDiv);
	
	function confirm_callback(event, func) {
		function _callback(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			if (functionListHandler.dtFunctionList != null)
				functionListHandler.dtFunctionList.Refresh();
			
			functionListHandler.GetFunction(func.globalUniqueFunctionIDint);
		}

		if (elFunctionName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_86"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_87"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDangerLevel.value < 1 || elDangerLevel.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_84"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDangerLevel.value < 1 || elDangerLevel.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_84"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplaySortOrder.value < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_85"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "globalUniqueFunctionIDint=" + func.globalUniqueFunctionIDint;
		req_string += "&functionName=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionName.value);
		req_string += "&functionUseFlag=" + (elFunctionUseFlag.checked ? 1 : 0);
		req_string += "&dangerLevel=" + elDangerLevel.value;
		req_string += "&requireSessionFlag=" + (elRequireSessionFlag.checked ? 1 : 0);
		req_string += "&arguments=" + CruiseGlobal.ReplaceToSpecialChar(elArguments.value);
		req_string += "&results=" + CruiseGlobal.ReplaceToSpecialChar(elResults.value);
		req_string += "&functionDescription=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionDescription.value);
		req_string += "&displayName=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayName.value);
		req_string += "&displaySortOrder=" + elDisplaySortOrder.value;
		
		OPAjaxRequest("POST", "modifyFunction", _callback, req_string);
	}
	
	function cancel_callback(event, func) {
		functionListHandler.GetFunction(func.globalUniqueFunctionIDint);
	}
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_02"], functionListHandler.actionPaneDiv, confirm_callback, func);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);

	//Cancel Button
	var btnCancel = new OPButton("CancelButton", l10nMsg["text_03"], functionListHandler.actionPaneDiv, cancel_callback, func);
	SteerGlobal.SteerHandleResourceMan.Add("btnCancel", btnCancel);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "ModifyFunctionTable", functionListHandler.basePaneDiv, "ModifyFunctionTable");
	
	var elFunctionName = CruiseGlobal.CreateElement("INPUT", "inputFunctionName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_65"], elFunctionName, elTable);
	elFunctionName.value = func.functionName;
	
	var elFunctionUseFlag = CruiseGlobal.CreateElement("INPUT", "inputFunctionUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elFunctionUseFlag, elTable);
	func.functionUseFlag > 0 ? elFunctionUseFlag.checked = true : elFunctionUseFlag.checked = false;
	
	var elDangerLevel = CruiseGlobal.CreateElement("INPUT", "inputDangerLevel", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_67"], elDangerLevel, elTable);
	elDangerLevel.value = func.dangerLevel;
	
	var elRequireSessionFlag = CruiseGlobal.CreateElement("INPUT", "inputRequireSessionFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_68"], elRequireSessionFlag, elTable);
	func.requireSessionFlag > 0 ? elRequireSessionFlag.checked = true : elRequireSessionFlag.checked = false;
	
	var elArguments = CruiseGlobal.CreateElement("INPUT", "inputArguments", null, "txtInputBig", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_69"], elArguments, elTable);
	elArguments.value = func.arguments;
	
	var elResults = CruiseGlobal.CreateElement("INPUT", "inputResults", null, "txtInputBig", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_70"], elResults, elTable);
	elResults.value = func.results;
	
	var elFunctionDescription = CruiseGlobal.CreateElement("INPUT", "inputFunctionDescription", null, "txtInputBig", {maxlength: 1000});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_71"], elFunctionDescription, elTable);
	elFunctionDescription.value = func.functionDescription;
	
	var elDisplayName = CruiseGlobal.CreateElement("INPUT", "inputDisplayName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_72"], elDisplayName, elTable);
	elDisplayName.value = func.displayName;
	
	var elDisplaySortOrder = CruiseGlobal.CreateElement("INPUT", "inputDisplaySortOrder", null, "txtInputVerySmall", {maxlength: 10});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_73"], elDisplaySortOrder, elTable);
	elDisplaySortOrder.value = func.displaySortOrder;
}

var functionListHandler = {
	dtFunctionList: null,
	actionPaneDiv: null,
	basePaneDiv: null,
	parentOPTable: null,
	
	CreateFunction: CreateFunction,
	GetFunctionList: GetFunctionList,
	
	ISelectedDataTable: ISelectedDataTable,
	InitializePane: InitializePane,
	SetOPTable: SetOPTable,
	
	GetFunction: GetFunction,
	RemoveFunction: RemoveFunction,
	ModifyFunction: ModifyFunction};
