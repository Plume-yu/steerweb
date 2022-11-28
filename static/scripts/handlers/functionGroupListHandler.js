/*==================================
    
     Function Group Handler Scripts
        
====================================*/

function CreateFunctionGroup(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			functionGroupListHandler.CreateFunctionGroup();
			
			if (functionGroupListHandler.dtFunctionGroupList != null)
				functionGroupListHandler.dtFunctionGroupList.Refresh();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (elFunctionGroupName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_06"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "functionGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionGroupName.value);
		req_string += "&functionGroupUseFlag=" + (elFunctionGroupUseFlag.checked ? "1" : "0");
		
		OPAjaxRequest("POST", "createFunctionGroup", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 37});
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
	var elTable = CruiseGlobal.CreateElement("TABLE", "CreateFunctionGroupTable", elBasePaneDiv, "CreateFunctionGroupTable");
	
	var elFunctionGroupName = CruiseGlobal.CreateElement("INPUT", "inputFunctionGroupName", null, "txtInputNormal", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_74"], elFunctionGroupName, elTable);
	
	var elFunctionGroupUseFlag = CruiseGlobal.CreateElement("INPUT", "inputFunctionGroupUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elFunctionGroupUseFlag, elTable);
	
	elFunctionGroupUseFlag.checked = true;
}

function GetFunctionGroupList(action, event, obj) {
	SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
	SteerLayout.CommonInnerLeft();
	CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(6), true);

	SteerLayout.LoadLeftCenterLayout();
	
	function _callback() {
		var searchText = CruiseGlobal.GetElementValue("SearchUserText");
		
		//Validation
		var addRequestVal = '';
		if (searchText) {
			if (searchText != null && searchText != '')
				addRequestVal += "&searchCriteria=" + searchText;
		}
		
		if (functionGroupListHandler.dtFunctionGroupList)
			SteerGlobal.SteerPageResourceMan.Remove("getFunctionGroupList_DataListSection");
		
		var configs = {
				selectCallbackFn: functionGroupListHandler.ISelectedDataTable,
				addRequestParamFn : function () { return addRequestVal; },
				paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
				l10nObj : l10nMsg,
				formatRow : SteerMindLogic.MindProcessFormatter,
				sortColumn : "functionGroupIDint",
				sortDir : "asc",
				selectionMode : "single"};
		
		functionGroupListHandler.dtFunctionGroupList = SteerMindLogic.CreateSteerDatatable("getFunctionGroupList", "getFunctionGroupList?", "getFunctionGroupList", "DataListSection", configs, 0);
	}
	
	//Build Divs
	var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
	var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

	var elArray = new Array();
	elArray.push(searchCriteriaDIV);
	elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionGroupListButton"));
	elArray.push(dataPaginationDIV);
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
	
	//Input Tag
	var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
	var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
	keyListener.enable();
	
	//Search Button
	var btnSearch = new OPButton("SearchFunctionGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
	btnSearch.SetHeight(20);
	
	//Resource Registration
	SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
	
	_callback();
}

function ISelectedDataTable(selectedValues, tableObj) {
	SteerGlobal.NowLoading();
	functionGroupListHandler.parentOPTable = tableObj;
	functionGroupListHandler.GetFunctionGroup(selectedValues[0].functionGroupIDint);
}

function InitializePane() {
	PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 19});
	functionGroupListHandler.actionPaneDiv = PaneArray[0];
	functionGroupListHandler.basePaneDiv = PaneArray[1];
}

function SetOPTable(tableObj) {
	functionGroupListHandler.parentOPTable = tableObj;
}

function GetFunctionGroup(functionGroupIDint) {
	function _callback(o, messages) {
		if (!SteerGlobal.ValidateResponse(messages))
			return;
		
		var functionGroup = messages.returnTables[0][0][0];
		var functionGroupAndUserGroups = messages.returnTables[1][0];
		var functionGroupAndFunctions = messages.returnTables[2][0];
		
		functionGroupListHandler.InitializePane();
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elements = [CruiseGlobal.CreateElement("SPAN", "RemoveButton"),
		                CruiseGlobal.CreateElement("SPAN", "ModifyButton")];
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elements, functionGroupListHandler.actionPaneDiv);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton", l10nMsg["text_09"],
				functionGroupListHandler.actionPaneDiv,
				functionGroupListHandler.RemoveFunctionGroup,
				functionGroup);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);

		//Modify Button
		var btnModify = new OPButton("ModifyButton",
				l10nMsg["text_08"],
				functionGroupListHandler.actionPaneDiv,
				functionGroupListHandler.ModifyFunctionGroup,
				functionGroup);
		SteerGlobal.SteerHandleResourceMan.Add("btnModify", btnModify);
		
		var elTable = CruiseGlobal.CreateElement("TABLE", "FunctionGroupDetailTable", functionGroupListHandler.basePaneDiv, "FunctionGroupDetailTable");
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionGroupIDint"], functionGroup.functionGroupIDint], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionGroupName"], functionGroup.functionGroupName], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_functionGroupUseFlag"], SteerGlobal.GetCodeText('functionGroupUseFlag', functionGroup.functionGroupUseFlag)], elTable);
		
		// Show functionGroupAndUserGroups
		var elTable = CruiseGlobal.CreateElement("TABLE", "functionGroupAndUserGroupsDataTable", functionGroupListHandler.basePaneDiv, "functionGroupAndUserGroupsDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_38']], elTable);
		
		var functionGroupAndUserGroupsDataTableDIV = CruiseGlobal.CreateElement("DIV", "functionGroupAndUserGroupsDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, functionGroupAndUserGroupsDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: functionGroupAndUserGroups},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var functionGroupAndUserGroupsDataTable = new OPDataTable("functionGroupAndUserGroupsDataTable", null, SteerMindLogic.GetColumns("functionGroupAndUserGroupsDataTable"), "functionGroupAndUserGroupsDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("functionGroupAndUserGroupsDataTable", functionGroupAndUserGroupsDataTable);
		
		// Show functionGroupAndFunctions
		var elTable = CruiseGlobal.CreateElement("TABLE", "functionGroupAndFunctionsDataTable", functionGroupListHandler.basePaneDiv, "functionGroupAndFunctionsDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_41']], elTable);
		
		var functionGroupAndFunctionsDataTableDIV = CruiseGlobal.CreateElement("DIV", "functionGroupAndFunctionsDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, functionGroupAndFunctionsDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: functionGroupAndFunctions},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var functionGroupAndFunctionsDataTable = new OPDataTable("functionGroupAndFunctionsDataTable", null, SteerMindLogic.GetColumns("functionGroupAndFunctionsDataTable"), "functionGroupAndFunctionsDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("functionGroupAndFunctionsDataTable", functionGroupAndFunctionsDataTable);
	}
	
	OPAjaxRequest("POST", "getDetailFunctionGroup", _callback, "functionGroupIDint=" + functionGroupIDint);
}

function RemoveFunctionGroup(event, functionGroup) {
	function _confirm() {
    	function _callback(o, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			functionGroupListHandler.GetFunctionGroup(functionGroup.functionGroupIDint);
			functionGroupListHandler.parentOPTable.Refresh();
		};
		
		var req_string = "";
		req_string += "functionGroupIDint=" + functionGroup.functionGroupIDint;
		req_string += "&functionGroupName=" + CruiseGlobal.ReplaceToSpecialChar(functionGroup.functionGroupName);
		req_string += "&functionGroupUseFlag=" + "0";
		
		OPAjaxRequest("POST", "modifyFunctionGroup", _callback, req_string);
		
		this.hide();
		SteerGlobal.ShowLoading();
    }
    
    function _cancel() {
    	this.hide();
    }
    
	var confirmBox = new OPMsgBox("ConfirmRemove", functionGroup.functionGroupIDint + l10nMsg["msg_28"], l10nMsg["text_50"], {isFixedCenter: true, isDraggable: false, isClose: true, isModal: true, width: 300});
	confirmBox.SetICON("warn");
	confirmBox.SetButtons([{text: l10nMsg["text_02"], handler: _confirm, isDefault: true}, {text: l10nMsg["text_03"],  handler: _cancel}]);
	confirmBox.Show();
}

function ModifyFunctionGroup(event, functionGroup) {
	functionGroupListHandler.InitializePane();
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elements = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	                CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, functionGroupListHandler.actionPaneDiv);
	
	function confirm_callback(event, functionGroup) {
		function _callback(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			if (functionGroupListHandler.dtFunctionGroupList != null)
				functionGroupListHandler.dtFunctionGroupList.Refresh();
			
			functionGroupListHandler.GetFunctionGroup(functionGroup.functionGroupIDint);
		}
		
		var req_string = "";
		req_string += "functionGroupIDint=" + functionGroup.functionGroupIDint;
		req_string += "&functionGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elFunctionGroupName.value);
		req_string += "&functionGroupUseFlag=" + (elFunctionGroupUseFlag.checked ? "1" : "0");
		
		OPAjaxRequest("POST", "modifyFunctionGroup", _callback, req_string);
	}
	
	function cancel_callback(event, functionGroup) {
		functionGroupListHandler.GetFunctionGroup(functionGroup.functionGroupIDint);
	}
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_02"], functionGroupListHandler.actionPaneDiv, confirm_callback, functionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);

	//Cancel Button
	var btnCancel = new OPButton("CancelButton", l10nMsg["text_03"], functionGroupListHandler.actionPaneDiv, cancel_callback, functionGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnCancel", btnCancel);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "ModifyFunctionGroupTable", functionGroupListHandler.basePaneDiv, "ModifyFunctionGroupTable");
	
	var elFunctionGroupName = CruiseGlobal.CreateElement("INPUT", "inputFunctionGroupName", null, "txtInputNormal", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_74"], elFunctionGroupName, elTable);
	elFunctionGroupName.value = functionGroup.functionGroupName;
	
	var elFunctionGroupUseFlag = CruiseGlobal.CreateElement("INPUT", "inputFunctionGroupUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elFunctionGroupUseFlag, elTable);
	functionGroup.functionGroupUseFlag > 0 ? elFunctionGroupUseFlag.checked = true : elFunctionGroupUseFlag.checked = false;
}

var functionGroupListHandler = {
	dtFunctionGroupList: null,
	actionPaneDiv: null,
	basePaneDiv: null,
	parentOPTable: null,
	
	CreateFunctionGroup: CreateFunctionGroup,
	GetFunctionGroupList: GetFunctionGroupList,
	
	ISelectedDataTable: ISelectedDataTable,
	InitializePane: InitializePane,
	SetOPTable: SetOPTable,
	
	GetFunctionGroup: GetFunctionGroup,
	RemoveFunctionGroup: RemoveFunctionGroup,
	ModifyFunctionGroup: ModifyFunctionGroup};
