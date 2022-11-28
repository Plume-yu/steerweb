/*==================================
    
     User Group Handler Scripts
        
====================================*/

function CreateUserGroup(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			if (userGroupListHandler.dtUserGroupList != null)
				userGroupListHandler.dtUserGroupList.Refresh();
			
			userGroupListHandler.CreateUserGroup();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (elUserGroupName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_23"], l10nMsg["text_02"]);
			return;
		}
		
		if (selectedFunctionGroups.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_22"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "userGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elUserGroupName.value);
		req_string += "&auditorUserGroupIDint=" +(selectedAuditorUserGroups.length > 0 ? selectedAuditorUserGroups[0].userGroupIDint : "");
		req_string += "&userGroupUseFlag=" + "1";
		req_string += "&functionGroupIDint=" + (selectedFunctionGroups.length > 0 ? selectedFunctionGroups[0].functionGroupIDint : "");
		
		OPAjaxRequest("POST", "createUserGroup", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 35});
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
	
	var elUserGroupName = CruiseGlobal.CreateElement("INPUT", "inputUserGroupName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_61"], elUserGroupName, elTable);
	
	// Add selecting function group panel
	var functionGroupDataTable = null;
	var selectedFunctionGroups = [];
	
	function _AddFunctionGroup(event, msg) {
		if (selectedFunctionGroups.length >= 1){
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_77"], l10nMsg["text_02"]);
			return;
		}
		
		function _MakeSelectionLayout(btnClickCallback, config) {
			function _callback(event, msg) {
				functionGroupDataTable = _GetItemDataTable();
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
			function_group_dialog.Hide();
			CruiseGlobal.RemoveElement("layout_wrapper_div");
			SteerGlobal.SteerHandleResourceMan.Remove("search_button");
			SteerGlobal.SteerHandleResourceMan.Remove("function_group_dialog");
		}
		
		function _AddFunctionGroup(event, msg) {
			var selected_rows = functionGroupDataTable.GetSelectedRows();
			
			for (selected_row in selected_rows) {
				var isSelected = false;
				
				for (selected_function_group in selectedFunctionGroups) {
					if (selectedFunctionGroups[selected_function_group].functionGroupIDint == selected_rows[selected_row].functionGroupIDint) {
						isSelected = true;
						CruiseGlobal.SHOWINFO (l10nMsg["text_09"], l10nMsg["msg_39"], l10nMsg["text_09"]);
						loadingCount++;
						break;
					}
				}
				
				if (isSelected == false) {
					function _callback(event, messages) {
						var functionGroup = messages.returnTables[0][0][0];
						
						var data = {functionGroupIDint: functionGroup.functionGroupIDint,
								functionGroupName : functionGroup.functionGroupName,
								functionGroupUseFlag : functionGroup.functionGroupUseFlag};
						
						selectedFunctionGroups.push(data);
						
						selectedFunctionGroupDataTable.Refresh();
					}
					
					OPAjaxRequest("POST", "getDetailFunctionGroup", _callback, "functionGroupIDint=" + selected_rows[selected_row].functionGroupIDint);
					SteerGlobal.ShowLoading();
				}
			}
			
			_ClearDialogResources();
		}
		
		function _CancelAddingFunctionGroup(o, msg) {
			_ClearDialogResources();
		}
		
		var function_group_dialog = new OPDialog("function_group_dialog", _MakeSelectionLayout(), null, l10nMsg["text_33"], null, {width: 800, height: 500});
		function_group_dialog.SetButtons([{text:l10nMsg["text_33"], width: 100, handler: _AddFunctionGroup}, {text:l10nMsg["text_03"], width: 100, handler: _CancelAddingFunctionGroup}])
		function_group_dialog.SetModal(true);
		function_group_dialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("function_group_dialog", function_group_dialog);
		
		function _GetItemDataTable() {
			var search_condition = CruiseGlobal.GetElementValue("search_input");
			
			//Validation
			var addRequestVal = '';
			if (search_condition) {
				if (search_condition != null && search_condition != '')
					addRequestVal += "&searchCriteria=" + search_condition;
			}
			
			if (functionGroupDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getFunctionGroupList_data_table_div");
			
			var configs = {
					addRequestParamFn: function () {return addRequestVal;},
					paginator: new OPPaginator("pagination_div", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "functionGroupIDint",
					sortDir: "asc",
					selectionMode: "single"};
			
			return SteerMindLogic.CreateSteerDatatable("getFunctionGroupList", "getFunctionGroupList?", "getFunctionGroupList", "data_table_div", configs, 0);
		}
		
		functionGroupDataTable = _GetItemDataTable();
	}
	
	function _ResetFunctionGroup() {
		var length = selectedFunctionGroups.length;
		
		for (var i = 0; i < length; i++){
			selectedFunctionGroups.pop();
		}
		
		selectedFunctionGroupDataTable.Refresh();
	}
	
	var functionGroupDiv = CruiseGlobal.CreateElement("DIV", "functionGroupDiv");
	var addFunctionGroupSpan = CruiseGlobal.CreateElement("SPAN", "addFunctionGroupSpan", functionGroupDiv);
	var resetFunctionGroupSpan = CruiseGlobal.CreateElement("SPAN", "resetFunctionGroupSpan", functionGroupDiv);
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_56"], functionGroupDiv, elTable);
	
	// Add function group
	var addFunctionGroupButton = new OPButton("addFunctionGroupButton", l10nMsg["text_33"], addFunctionGroupSpan, _AddFunctionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("addFunctionGroupButton", addFunctionGroupButton);
	
	// Init function group 
	var resetFunctionGroupButton = new OPButton("resetFunctionGroupButton", l10nMsg["text_57"], resetFunctionGroupSpan, _ResetFunctionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("resetFunctionGroupButton", resetFunctionGroupButton);
	
	var selectedFunctionGroupDiv = CruiseGlobal.CreateElement("DIV", "selectedFunctionGroupDiv");
	SteerGlobal.MakeLayoutTR_INPUT(null, selectedFunctionGroupDiv, elTable);
	
	var configs = {JSArrayObejct: {data: selectedFunctionGroups},
			l10nObj: l10nMsg,
			formatRow: SteerMindLogic.MindProcessFormatter,
			selectionMode: "null",
			width: "105%",
			height: "105%"};
	
    var selectedFunctionGroupDataTable = new OPDataTable("selectedFunctionGroupDataTable", null, SteerMindLogic.GetColumns("selectedFunctionGroupDataTable"), "selectedFunctionGroupDiv", configs);
	SteerGlobal.SteerHandleResourceMan.Add("selectedFunctionGroupDataTable", selectedFunctionGroupDataTable);
	
	// Add selecting auditor user group panel
	var auditorUserGroupDataTable = null;
	var selectedAuditorUserGroups = [];
	
	function _AddAuditorUserGroup(event, msg) {
		if (selectedAuditorUserGroups.length >= 1){
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_78"], l10nMsg["text_02"]);
			return;
		}
		
		function _MakeSelectionLayout(btnClickCallback, config) {
			function _callback(event, msg) {
				auditorUserGroupDataTable = _GetItemDataTable();
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
			auditor_user_group_dialog.Hide();
			CruiseGlobal.RemoveElement("layout_wrapper_div");
			SteerGlobal.SteerHandleResourceMan.Remove("search_button");
			SteerGlobal.SteerHandleResourceMan.Remove("auditor_user_group_dialog");
		}
		
		function _AddAuditorUserGroup(event, msg) {
			var selected_rows = auditorUserGroupDataTable.GetSelectedRows();
			
			for (selected_row in selected_rows) {
				var isSelected = false;
				
				for (selected_auditor_user_group in selectedAuditorUserGroups) {
					if (selectedAuditorUserGroups[selected_auditor_user_group].userGroupIDint == selected_rows[selected_row].userGroupIDint) {
						isSelected = true;
						CruiseGlobal.SHOWINFO (l10nMsg["text_09"], l10nMsg["msg_39"], l10nMsg["text_09"]);
						loadingCount++;
						break;
					}
				}
				
				if (isSelected == false) {
					function _callback(event, messages) {
						var userGroup = messages.returnTables[0][0][0];
						
						var data = {userGroupIDint: userGroup.userGroupIDint,
								userGroupName : userGroup.userGroupName,
								userGroupUseFlag : userGroup.userGroupUseFlag};
						
						selectedAuditorUserGroups.push(data);
						
						selectedAuditorUserGroupDataTable.Refresh();
					}
					
					OPAjaxRequest("POST", "getDetailUserGroup", _callback, "userGroupIDint=" + selected_rows[selected_row].userGroupIDint);
					SteerGlobal.ShowLoading();
				}
			}
			
			_ClearDialogResources();
		}
		
		function _CancelAddingFunctionGroup(o, msg) {
			_ClearDialogResources();
		}
		
		var auditor_user_group_dialog = new OPDialog("auditor_user_group_dialog", _MakeSelectionLayout(), null, l10nMsg["text_33"], null, {width: 800, height: 500});
		auditor_user_group_dialog.SetButtons([{text:l10nMsg["text_33"], width: 100, handler: _AddAuditorUserGroup}, {text:l10nMsg["text_03"], width: 100, handler: _CancelAddingFunctionGroup}])
		auditor_user_group_dialog.SetModal(true);
		auditor_user_group_dialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("auditor_user_group_dialog", auditor_user_group_dialog);
		
		function _GetItemDataTable() {
			var search_condition = CruiseGlobal.GetElementValue("search_input");
			
			//Validation
			var addRequestVal = '';
			if (search_condition) {
				if (search_condition != null && search_condition != '')
					addRequestVal += "&searchCriteria=" + search_condition;
			}
			
			if (auditorUserGroupDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getUserGroupList_data_table_div");
			
			var configs = {
					addRequestParamFn: function () {return addRequestVal;},
					paginator: new OPPaginator("pagination_div", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "userGroupIDint",
					sortDir: "asc",
					selectionMode: "single"};
			
			return SteerMindLogic.CreateSteerDatatable("getUserGroupList", "getUserGroupList?", "getUserGroupList", "data_table_div", configs, 0);
		}
		
		auditorUserGroupDataTable = _GetItemDataTable();
	}
	
	function _ResetAuditorUserGroup() {
		var length = selectedAuditorUserGroups.length;
		
		for (var i = 0; i < length; i++){
			selectedAuditorUserGroups.pop();
		}
		
		selectedAuditorUserGroupDataTable.Refresh();
	}
	
	var auditorUserGroupDiv = CruiseGlobal.CreateElement("DIV", "auditorUserGroupDiv");
	var addAuditorUserGroupSpan = CruiseGlobal.CreateElement("SPAN", "addAuditorUserGroupSpan", auditorUserGroupDiv);
	var resetAuditorUserGroupSpan = CruiseGlobal.CreateElement("SPAN", "resetAuditorUserGroupSpan", auditorUserGroupDiv);
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_62"], auditorUserGroupDiv, elTable);
	
	// Add function group
	var addAuditorUserGroupButton = new OPButton("addAuditorUserGroupButton", l10nMsg["text_33"], addAuditorUserGroupSpan, _AddAuditorUserGroup);
	SteerGlobal.SteerHandleResourceMan.Add("addAuditorUserGroupButton", addAuditorUserGroupButton);
	
	// Init function group 
	var resetAuditorUserGroupButton = new OPButton("resetAuditorUserGroupButton", l10nMsg["text_57"], resetAuditorUserGroupSpan, _ResetAuditorUserGroup);
	SteerGlobal.SteerHandleResourceMan.Add("resetAuditorUserGroupButton", resetAuditorUserGroupButton);
	
	var selectedAuditorUserGroupDiv = CruiseGlobal.CreateElement("DIV", "selectedAuditorUserGroupDiv");
	SteerGlobal.MakeLayoutTR_INPUT(null, selectedAuditorUserGroupDiv, elTable);
	
	var configs = {JSArrayObejct: {data: selectedAuditorUserGroups},
			l10nObj: l10nMsg,
			formatRow: SteerMindLogic.MindProcessFormatter,
			selectionMode: "null",
			width: "105%",
			height: "105%"};
	
    var selectedAuditorUserGroupDataTable = new OPDataTable("selectedAuditorUserGroupDataTable", null, SteerMindLogic.GetColumns("selectedAuditorUserGroupDataTable"), "selectedAuditorUserGroupDiv", configs);
	SteerGlobal.SteerHandleResourceMan.Add("selectedAuditorUserGroupDataTable", selectedAuditorUserGroupDataTable);
}

function GetUserGroupList(action, event, obj) {
	SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
	SteerLayout.CommonInnerLeft();
	CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(4), true);

	SteerLayout.LoadLeftCenterLayout();
	
	function _callback() {
		var searchText = CruiseGlobal.GetElementValue("SearchUserText")
		
		var addRequestVal = '';
		if (searchText) {
			if (searchText != null && searchText != '')
				addRequestVal += "&searchCriteria=" + searchText;
		}
		
		if (userGroupListHandler.dtUserGroupList)
			SteerGlobal.SteerPageResourceMan.Remove("getUserGroupList_DataListSection");
		
		var configs = {
				selectCallbackFn: userGroupListHandler.ISelectedDataTable,
				addRequestParamFn: function () { return addRequestVal; },
				paginator: new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
				l10nObj: l10nMsg,
				formatRow: SteerMindLogic.MindProcessFormatter,
				sortColumn: "userGroupIDint",
				sortDir: "asc",
				selectionMode: "single"}
		
		userGroupListHandler.dtUserGroupList = SteerMindLogic.CreateSteerDatatable("getUserGroupList", "getUserGroupList?", "getUserGroupList", "DataListSection", configs, 0);
	}
	
	//Build Divs
	var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
	var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

	var elArray = new Array();
	elArray.push(searchCriteriaDIV);
	elArray.push(CruiseGlobal.CreateElement("DIV", "SearchUserGroupListButton"));
	elArray.push(dataPaginationDIV);
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
	
	//Input Tag
	var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
	var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
	keyListener.enable();
	
	//Search Button
	var btnSearch = new OPButton("SearchUserGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
	btnSearch.SetHeight(20);
	
	//Resource Registration
	SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
	
	_callback();
}

function ISelectedDataTable(selectedValues, tableObj) {
	SteerGlobal.NowLoading();
	userGroupListHandler.parentOPTable = tableObj;
	userGroupListHandler.GetUserGroup(selectedValues[0].userGroupIDint);
}

function InitializePane() {
	PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 17});
	userGroupListHandler.actionPaneDiv = PaneArray[0];
	userGroupListHandler.basePaneDiv = PaneArray[1];
}

function SetOPTable(tableObj) {
	userGroupListHandler.parentOPTable = tableObj;
}

function GetUserGroup(userGroupIDint) {
	function _callback(o, messages) {
		if (!SteerGlobal.ValidateResponse(messages))
			return;
		
		var userGroup = messages.returnTables[0][0][0];
		var userGroupAndFunctionGroup = messages.returnTables[1][0];
		var userGroupAndAuditorUserGroup = messages.returnTables[2][0];
		
		userGroupListHandler.InitializePane();
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elements = [CruiseGlobal.CreateElement("SPAN", "RemoveButton"),
		                CruiseGlobal.CreateElement("SPAN", "ModifyButton")];
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elements, userGroupListHandler.actionPaneDiv);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton", l10nMsg["text_09"],
				userGroupListHandler.actionPaneDiv,
				userGroupListHandler.RemoveUserGroup,
				userGroup);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);

		//Modify Button
		var btnModify = new OPButton("ModifyButton",
				l10nMsg["text_08"],
				userGroupListHandler.actionPaneDiv,
				userGroupListHandler.ModifyUserGroup,
				[userGroup, userGroupAndFunctionGroup, userGroupAndAuditorUserGroup]);
		SteerGlobal.SteerHandleResourceMan.Add("btnModify", btnModify);
		
		var elTable = CruiseGlobal.CreateElement("TABLE", "UserGroupTable", userGroupListHandler.basePaneDiv, "UserGroupTable");
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userGroupIDint"], userGroup.userGroupIDint], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userGroupName"], userGroup.userGroupName], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_auditorUserGroupIDint"], userGroup.auditorUserGroupIDint], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userGroupUseFlag"], SteerGlobal.GetCodeText('userGroupUseFlag', userGroup.userGroupUseFlag)], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionGroupIDint"], userGroup.functionGroupIDint], elTable);
		
		// Show userGroupAndFunctionGroup
		var elTable = CruiseGlobal.CreateElement("TABLE", "userGroupAndFunctionGroupDataTable", userGroupListHandler.basePaneDiv, "userGroupAndFunctionGroupDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_39']], elTable);
		
		var userGroupAndFunctionGroupDataTableDIV = CruiseGlobal.CreateElement("DIV", "userGroupAndFunctionGroupDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, userGroupAndFunctionGroupDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: userGroupAndFunctionGroup},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var userGroupAndFunctionGroupDataTable = new OPDataTable("userGroupAndFunctionGroupDataTable", null, SteerMindLogic.GetColumns("userGroupAndFunctionGroupDataTable"), "userGroupAndFunctionGroupDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("userGroupAndFunctionGroupDataTable", userGroupAndFunctionGroupDataTable);
		
		// Show userGroupAndAuditorUserGroup
		var elTable = CruiseGlobal.CreateElement("TABLE", "userGroupAndAuditorUserGroupDataTable", userGroupListHandler.basePaneDiv, "userGroupAndAuditorUserGroupDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_40']], elTable);
		
		var userGroupAndAuditorUserGroupDataTableDIV = CruiseGlobal.CreateElement("DIV", "userGroupAndAuditorUserGroupDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, userGroupAndAuditorUserGroupDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: userGroupAndAuditorUserGroup},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var userGroupAndAuditorUserGroupDataTable = new OPDataTable("userGroupAndAuditorUserGroupDataTable", null, SteerMindLogic.GetColumns("userGroupAndAuditorUserGroupDataTable"), "userGroupAndAuditorUserGroupDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("userGroupAndAuditorUserGroupDataTable", userGroupAndAuditorUserGroupDataTable);
	}
	
	OPAjaxRequest("POST", "getDetailUserGroup", _callback, "userGroupIDint=" + userGroupIDint);
}

function RemoveUserGroup(event, userGroup) {
	function _confirm() {
    	function _callback(o, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], userGroup.userGroupIDint + l10nMsg["msg_25"], l10nMsg["text_02"]);
			userGroupListHandler.GetUserGroup(userGroup.userGroupIDint);
			userGroupListHandler.parentOPTable.Refresh();
		};
		
		var req_string = "";
		req_string += "userGroupIDint=" + userGroup.userGroupIDint;
		req_string += "&userGroupName=" + CruiseGlobal.ReplaceToSpecialChar(userGroup.userGroupName);
		req_string += "&auditorUserGroupIDint=" + userGroup.auditorUserGroupIDint;
		req_string += "&userGroupUseFlag=" + "0";
		req_string += "&functionGroupIDint=" + userGroup.functionGroupIDint;
		
		OPAjaxRequest("POST", "modifyUserGroup", _callback, req_string);
		
		this.hide();
		SteerGlobal.ShowLoading();
    }
    
    function _cancel() {
    	this.hide();
    }
    
	var confirmBox = new OPMsgBox("ConfirmRemove", userGroup.userGroupIDint + l10nMsg["msg_24"], l10nMsg["text_50"], {isFixedCenter: true, isDraggable: false, isClose: true, isModal: true, width: 300});
	confirmBox.SetICON("warn");
	confirmBox.SetButtons([{text: l10nMsg["text_02"], handler: _confirm, isDefault: true}, {text: l10nMsg["text_03"],  handler: _cancel}]);
	confirmBox.Show();
}

function ModifyUserGroup(event, userGroupDetail) {
	var userGroup = userGroupDetail[0];
	var userGroupAndFunctionGroup = userGroupDetail[1];
	var userGroupAndAuditorUserGroup = userGroupDetail[2];
	
	userGroupListHandler.InitializePane();
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elements = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	                CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, userGroupListHandler.actionPaneDiv);
	
	function confirm_callback(event, userGroup) {
		function _callback(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			if (userGroupListHandler.dtUserGroupList != null)
				userGroupListHandler.dtUserGroupList.Refresh();
			
			userGroupListHandler.GetUserGroup(userGroup.userGroupIDint);
		}
		
		if (elUserGroupName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_23"], l10nMsg["text_02"]);
			return;
		}
		
		if (selectedFunctionGroups.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_22"], l10nMsg["text_02"]);
			return;
		}

		var req_string = "";
		req_string += "userGroupIDint=" + userGroup.userGroupIDint;
		req_string += "&userGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elUserGroupName.value);
		req_string += "&auditorUserGroupIDint=" +(selectedAuditorUserGroups.length > 0 ? selectedAuditorUserGroups[0].userGroupIDint : "");
		req_string += "&userGroupUseFlag=" + ((elUserGroupUseFlag.checked) ? "1" : "0");
		req_string += "&functionGroupIDint=" + (selectedFunctionGroups.length > 0 ? selectedFunctionGroups[0].functionGroupIDint : "");
		
		OPAjaxRequest("POST", "modifyUserGroup", _callback, req_string);
	}
	
	function cancel_callback(event, userGroup) {
		userGroupListHandler.GetUserGroup(userGroup.userGroupIDint);
	}
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_02"], userGroupListHandler.actionPaneDiv, confirm_callback, userGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);

	//Cancel Button
	var btnCancel = new OPButton("CancelButton", l10nMsg["text_03"], userGroupListHandler.actionPaneDiv, cancel_callback, userGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnCancel", btnCancel);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "ModifyUserGroupTable", userGroupListHandler.basePaneDiv, "ModifyUserGroupTable");
	
	var elUserGroupName = CruiseGlobal.CreateElement("INPUT", "inputUserGroupName", null, "txtInputSmall", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_61"], elUserGroupName, elTable);
	
	var elUserGroupUseFlag = CruiseGlobal.CreateElement("INPUT", "inputUserGroupUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elUserGroupUseFlag, elTable);
	
	elUserGroupName.value = userGroup.userGroupName;
	
	if (userGroup.userGroupUseFlag == 1)
		elUserGroupUseFlag.checked = true;
	
	// Add selecting function group panel
	var functionGroupDataTable = null;
	var selectedFunctionGroups = [];
	
	if (userGroupAndFunctionGroup.length > 0) {
		var row = {functionGroupIDint: userGroupAndFunctionGroup[0].functionGroupIDint,
				functionGroupName : userGroupAndFunctionGroup[0].functionGroupName,
				functionGroupUseFlag : userGroupAndFunctionGroup[0].functionGroupUseFlag};
		
		selectedFunctionGroups.push(row);
	}
	
	function _AddFunctionGroup(event, msg) {
		if (selectedFunctionGroups.length >= 1){
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_77"], l10nMsg["text_02"]);
			return;
		}
		
		function _MakeSelectionLayout(btnClickCallback, config) {
			function _callback(event, msg) {
				functionGroupDataTable = _GetItemDataTable();
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
			function_group_dialog.Hide();
			CruiseGlobal.RemoveElement("layout_wrapper_div");
			SteerGlobal.SteerHandleResourceMan.Remove("search_button");
			SteerGlobal.SteerHandleResourceMan.Remove("function_group_dialog");
		}
		
		function _AddFunctionGroup(event, msg) {
			var selected_rows = functionGroupDataTable.GetSelectedRows();
			
			for (selected_row in selected_rows) {
				var isSelected = false;
				
				for (selected_function_group in selectedFunctionGroups) {
					if (selectedFunctionGroups[selected_function_group].functionGroupIDint == selected_rows[selected_row].functionGroupIDint) {
						isSelected = true;
						CruiseGlobal.SHOWINFO (l10nMsg["text_09"], l10nMsg["msg_39"], l10nMsg["text_09"]);
						loadingCount++;
						break;
					}
				}
				
				if (isSelected == false) {
					function _callback(event, messages) {
						var functionGroup = messages.returnTables[0][0][0];
						
						var data = {functionGroupIDint: functionGroup.functionGroupIDint,
								functionGroupName : functionGroup.functionGroupName,
								functionGroupUseFlag : functionGroup.functionGroupUseFlag};
						
						selectedFunctionGroups.push(data);
						
						selectedFunctionGroupDataTable.Refresh();
					}
					
					OPAjaxRequest("POST", "getDetailFunctionGroup", _callback, "functionGroupIDint=" + selected_rows[selected_row].functionGroupIDint);
					SteerGlobal.ShowLoading();
				}
			}
			
			_ClearDialogResources();
		}
		
		function _CancelAddingFunctionGroup(o, msg) {
			_ClearDialogResources();
		}
		
		var function_group_dialog = new OPDialog("function_group_dialog", _MakeSelectionLayout(), null, l10nMsg["text_33"], null, {width: 800, height: 500});
		function_group_dialog.SetButtons([{text:l10nMsg["text_33"], width: 100, handler: _AddFunctionGroup}, {text:l10nMsg["text_03"], width: 100, handler: _CancelAddingFunctionGroup}])
		function_group_dialog.SetModal(true);
		function_group_dialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("function_group_dialog", function_group_dialog);
		
		function _GetItemDataTable() {
			var search_condition = CruiseGlobal.GetElementValue("search_input");
			
			//Validation
			var addRequestVal = '';
			if (search_condition) {
				if (search_condition != null && search_condition != '')
					addRequestVal += "&searchCriteria=" + search_condition;
			}
			
			if (functionGroupDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getFunctionGroupList_data_table_div");
			
			var configs = {
					addRequestParamFn: function () {return addRequestVal;},
					paginator: new OPPaginator("pagination_div", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "functionGroupIDint",
					sortDir: "asc",
					selectionMode: "single"};
			
			return SteerMindLogic.CreateSteerDatatable("getFunctionGroupList", "getFunctionGroupList?", "getFunctionGroupList", "data_table_div", configs, 0);
		}
		
		functionGroupDataTable = _GetItemDataTable();
	}
	
	function _ResetFunctionGroup() {
		var length = selectedFunctionGroups.length;
		
		for (var i = 0; i < length; i++){
			selectedFunctionGroups.pop();
		}
		
		selectedFunctionGroupDataTable.Refresh();
	}
	
	var functionGroupDiv = CruiseGlobal.CreateElement("DIV", "functionGroupDiv");
	var addFunctionGroupSpan = CruiseGlobal.CreateElement("SPAN", "addFunctionGroupSpan", functionGroupDiv);
	var resetFunctionGroupSpan = CruiseGlobal.CreateElement("SPAN", "resetFunctionGroupSpan", functionGroupDiv);
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_56"], functionGroupDiv, elTable);
	
	// Add function group
	var addFunctionGroupButton = new OPButton("addFunctionGroupButton", l10nMsg["text_33"], addFunctionGroupSpan, _AddFunctionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("addFunctionGroupButton", addFunctionGroupButton);
	
	// Init function group 
	var resetFunctionGroupButton = new OPButton("resetFunctionGroupButton", l10nMsg["text_57"], resetFunctionGroupSpan, _ResetFunctionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("resetFunctionGroupButton", resetFunctionGroupButton);
	
	var selectedFunctionGroupDiv = CruiseGlobal.CreateElement("DIV", "selectedFunctionGroupDiv");
	SteerGlobal.MakeLayoutTR_INPUT(null, selectedFunctionGroupDiv, elTable);
	
	var configs = {JSArrayObejct: {data: selectedFunctionGroups},
			l10nObj: l10nMsg,
			formatRow: SteerMindLogic.MindProcessFormatter,
			selectionMode: "null",
			width: "105%",
			height: "105%"};
	
    var selectedFunctionGroupDataTable = new OPDataTable("selectedFunctionGroupDataTable", null, SteerMindLogic.GetColumns("selectedFunctionGroupDataTable"), "selectedFunctionGroupDiv", configs);
	SteerGlobal.SteerHandleResourceMan.Add("selectedFunctionGroupDataTable", selectedFunctionGroupDataTable);
	
	// Add selecting auditor user group panel
	var auditorUserGroupDataTable = null;
	var selectedAuditorUserGroups = [];
	
	if (userGroupAndAuditorUserGroup.length > 0) {
		var row = {userGroupIDint: userGroupAndAuditorUserGroup[0].userGroupIDint,
				userGroupName : userGroupAndAuditorUserGroup[0].userGroupName,
				userGroupUseFlag : userGroupAndAuditorUserGroup[0].userGroupUseFlag};
		
		selectedAuditorUserGroups.push(row);
	}
	
	function _AddAuditorUserGroup(event, msg) {
		
		if (selectedAuditorUserGroups.length >= 1){
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_78"], l10nMsg["text_02"]);
			return;
		}
		
		function _MakeSelectionLayout(btnClickCallback, config) {
			function _callback(event, msg) {
				auditorUserGroupDataTable = _GetItemDataTable();
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
			auditor_user_group_dialog.Hide();
			CruiseGlobal.RemoveElement("layout_wrapper_div");
			SteerGlobal.SteerHandleResourceMan.Remove("search_button");
			SteerGlobal.SteerHandleResourceMan.Remove("auditor_user_group_dialog");
		}
		
		function _AddAuditorUserGroup(event, msg) {
			var selected_rows = auditorUserGroupDataTable.GetSelectedRows();
			
			for (selected_row in selected_rows) {
				var isSelected = false;
				
				for (selected_auditor_user_group in selectedAuditorUserGroups) {
					if (selectedAuditorUserGroups[selected_auditor_user_group].userGroupIDint == selected_rows[selected_row].userGroupIDint) {
						isSelected = true;
						CruiseGlobal.SHOWINFO (l10nMsg["text_09"], l10nMsg["msg_39"], l10nMsg["text_09"]);
						loadingCount++;
						break;
					}
				}
				
				if (isSelected == false) {
					function _callback(event, messages) {
						var userGroup = messages.returnTables[0][0][0];
						
						var data = {userGroupIDint: userGroup.userGroupIDint,
								userGroupName : userGroup.userGroupName,
								userGroupUseFlag : userGroup.userGroupUseFlag};
						
						selectedAuditorUserGroups.push(data);
						
						selectedAuditorUserGroupDataTable.Refresh();
					}
					
					OPAjaxRequest("POST", "getDetailUserGroup", _callback, "userGroupIDint=" + selected_rows[selected_row].userGroupIDint);
					SteerGlobal.ShowLoading();
				}
			}
			
			_ClearDialogResources();
		}
		
		function _CancelAddingFunctionGroup(o, msg) {
			_ClearDialogResources();
		}
		
		var auditor_user_group_dialog = new OPDialog("auditor_user_group_dialog", _MakeSelectionLayout(), null, l10nMsg["text_33"], null, {width: 800, height: 500});
		auditor_user_group_dialog.SetButtons([{text:l10nMsg["text_33"], width: 100, handler: _AddAuditorUserGroup}, {text:l10nMsg["text_03"], width: 100, handler: _CancelAddingFunctionGroup}])
		auditor_user_group_dialog.SetModal(true);
		auditor_user_group_dialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("auditor_user_group_dialog", auditor_user_group_dialog);
		
		function _GetItemDataTable() {
			var search_condition = CruiseGlobal.GetElementValue("search_input");
			
			//Validation
			var addRequestVal = '';
			if (search_condition) {
				if (search_condition != null && search_condition != '')
					addRequestVal += "&searchCriteria=" + search_condition;
			}
			
			if (auditorUserGroupDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getUserGroupList_data_table_div");
			
			var configs = {
					addRequestParamFn: function () {return addRequestVal;},
					paginator: new OPPaginator("pagination_div", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "userGroupIDint",
					sortDir: "asc",
					selectionMode: "single"};
			
			return SteerMindLogic.CreateSteerDatatable("getUserGroupList", "getUserGroupList?", "getUserGroupList", "data_table_div", configs, 0);
		}
		
		auditorUserGroupDataTable = _GetItemDataTable();
	}
	
	function _ResetAuditorUserGroup() {
		var length = selectedAuditorUserGroups.length;
		
		for (var i = 0; i < length; i++){
			selectedAuditorUserGroups.pop();
		}
		
		selectedAuditorUserGroupDataTable.Refresh();
	}
	
	var auditorUserGroupDiv = CruiseGlobal.CreateElement("DIV", "auditorUserGroupDiv");
	var addAuditorUserGroupSpan = CruiseGlobal.CreateElement("SPAN", "addAuditorUserGroupSpan", auditorUserGroupDiv);
	var resetAuditorUserGroupSpan = CruiseGlobal.CreateElement("SPAN", "resetAuditorUserGroupSpan", auditorUserGroupDiv);
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_62"], auditorUserGroupDiv, elTable);
	
	// Add function group
	var addAuditorUserGroupButton = new OPButton("addAuditorUserGroupButton", l10nMsg["text_33"], addAuditorUserGroupSpan, _AddAuditorUserGroup);
	SteerGlobal.SteerHandleResourceMan.Add("addAuditorUserGroupButton", addAuditorUserGroupButton);
	
	// Init function group 
	var resetAuditorUserGroupButton = new OPButton("resetAuditorUserGroupButton", l10nMsg["text_57"], resetAuditorUserGroupSpan, _ResetAuditorUserGroup);
	SteerGlobal.SteerHandleResourceMan.Add("resetAuditorUserGroupButton", resetAuditorUserGroupButton);
	
	var selectedAuditorUserGroupDiv = CruiseGlobal.CreateElement("DIV", "selectedAuditorUserGroupDiv");
	SteerGlobal.MakeLayoutTR_INPUT(null, selectedAuditorUserGroupDiv, elTable);
	
	var configs = {JSArrayObejct: {data: selectedAuditorUserGroups},
			l10nObj: l10nMsg,
			formatRow: SteerMindLogic.MindProcessFormatter,
			selectionMode: "null",
			width: "105%",
			height: "105%"};
	
    var selectedAuditorUserGroupDataTable = new OPDataTable("selectedAuditorUserGroupDataTable", null, SteerMindLogic.GetColumns("selectedAuditorUserGroupDataTable"), "selectedAuditorUserGroupDiv", configs);
	SteerGlobal.SteerHandleResourceMan.Add("selectedAuditorUserGroupDataTable", selectedAuditorUserGroupDataTable);
}

var userGroupListHandler = {
		dtUserGroupList: null,
		actionPaneDiv: null,
		basePaneDiv: null,
		parentOPTable: null,
		
		CreateUserGroup: CreateUserGroup,
		GetUserGroupList: GetUserGroupList,
		
		ISelectedDataTable: ISelectedDataTable,
		InitializePane: InitializePane,
		SetOPTable: SetOPTable,
		
		GetUserGroup: GetUserGroup,
		RemoveUserGroup: RemoveUserGroup,
		ModifyUserGroup: ModifyUserGroup};
