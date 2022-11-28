/*==================================
    
     Display Group Handler Scripts
        
====================================*/

function CreateDisplayGroup(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			displayGroupListHandler.CreateDisplayGroup();
			
			if (displayGroupListHandler.dtDisplayGroupList != null)
				displayGroupListHandler.dtDisplayGroupList.Refresh();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (elDisplayGroupName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_79"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayGroupType.value < 1 || elDisplayGroupType.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_80"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayOrder.value < 1 || elDisplayOrder.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_81"], l10nMsg["text_02"]);
			return;
		}
		
		if (elServiceName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_82"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "displayGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayGroupName.value);
		req_string += "&displayGroupUseFlag=" + (elDisplayGroupUseFlag.checked ? "1" : "0");
		req_string += "&displayGroupType=" + elDisplayGroupType.value;
		req_string += "&displayOrder=" + elDisplayOrder.value;
		req_string += "&displayAdditionalInfo=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayAdditionalInfo.value);
		req_string += "&serviceName=" + CruiseGlobal.ReplaceToSpecialChar(elServiceName.value);
		
		OPAjaxRequest("POST", "createDisplayGroup", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 38});
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
	var elTable = CruiseGlobal.CreateElement("TABLE", "CreateDisplayGroupTable", elBasePaneDiv, "CreateDisplayGroupTable");
	
	var elDisplayGroupName = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupName", null, "txtInputNormal", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_75"], elDisplayGroupName, elTable);
	
	var elDisplayGroupUseFlag = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elDisplayGroupUseFlag, elTable);
	elDisplayGroupUseFlag.checked = true;
	
	var elDisplayGroupType = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupType", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_76"], elDisplayGroupType, elTable);
	
	var elDisplayOrder = CruiseGlobal.CreateElement("INPUT", "inputDisplayOrder", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_77"], elDisplayOrder, elTable);
	
	var elDisplayAdditionalInfo = CruiseGlobal.CreateElement("INPUT", "inputDisplayAdditionalInfo", null, "txtInputBig", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_78"], elDisplayAdditionalInfo, elTable);
	
	var elServiceName = CruiseGlobal.CreateElement("INPUT", "inputServiceName", null, "txtInputNormal", {maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_79"], elServiceName, elTable);
}

function GetDisplayGroupList(action, event, obj) {
	SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
	SteerLayout.CommonInnerLeft();
	CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(7), true);

	SteerLayout.LoadLeftCenterLayout();
	
	function _callback() {
		var searchText = CruiseGlobal.GetElementValue("SearchUserText");
		
		//Validation
		var addRequestVal = '';
		if (searchText) {
			if (searchText != null && searchText != '')
				addRequestVal += "&searchCriteria=" + searchText;
		}
		
		if (displayGroupListHandler.dtDisplayGroupList)
			SteerGlobal.SteerPageResourceMan.Remove("getDisplayGroupList_DataListSection");
		
		var configs = {
				selectCallbackFn: displayGroupListHandler.ISelectedDataTable,
				addRequestParamFn : function () { return addRequestVal; },
				paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
				l10nObj : l10nMsg,
				formatRow : SteerMindLogic.MindProcessFormatter,
				sortColumn : "displayGroupIDint",
				sortDir : "asc",
				selectionMode : "single"};
		
		displayGroupListHandler.dtDisplayGroupList = SteerMindLogic.CreateSteerDatatable("getDisplayGroupList", "getDisplayGroupList?", "getDisplayGroupList", "DataListSection", configs, 0);
	}
	
	//Build Divs
	var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
	var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

	var elArray = new Array();
	elArray.push(searchCriteriaDIV);
	elArray.push(CruiseGlobal.CreateElement("DIV", "SearchDisplayGroupListButton"));
	elArray.push(dataPaginationDIV);
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
	
	//Input Tag
	var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
	var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
	keyListener.enable();
	
	//Search Button
	var btnSearch = new OPButton("SearchDisplayGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
	btnSearch.SetHeight(20);
	
	//Resource Registration
	SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
	
	_callback();
}

function ISelectedDataTable(selectedValues, tableObj) {
	SteerGlobal.NowLoading();
	displayGroupListHandler.parentOPTable = tableObj;
	displayGroupListHandler.GetDisplayGroup(selectedValues[0].displayGroupIDint);
}

function InitializePane() {
	PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 20});
	displayGroupListHandler.actionPaneDiv = PaneArray[0];
	displayGroupListHandler.basePaneDiv = PaneArray[1];
}

function SetOPTable(tableObj) {
	displayGroupListHandler.parentOPTable = tableObj;
}

function GetDisplayGroup(displayGroupIDint) {
	function _callback(o, messages) {
		if (!SteerGlobal.ValidateResponse(messages))
			return;
		
		var displayGroup = messages.returnTables[0][0][0];
		var displayGroupAndFunctions = messages.returnTables[1][0];
		
		if (displayGroupAndFunctions.length < 1)
			displayGroupAndFunctions = null;
		
		displayGroupListHandler.InitializePane();
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elements = [CruiseGlobal.CreateElement("SPAN", "RemoveButton"),
		                CruiseGlobal.CreateElement("SPAN", "ModifyButton")];
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elements, displayGroupListHandler.actionPaneDiv);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton", l10nMsg["text_09"],
				displayGroupListHandler.actionPaneDiv,
				displayGroupListHandler.RemoveDisplayGroup,
				displayGroup);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);

		//Modify Button
		var btnModify = new OPButton("ModifyButton",
				l10nMsg["text_08"],
				displayGroupListHandler.actionPaneDiv,
				displayGroupListHandler.ModifyDisplayGroup,
				displayGroup);
		SteerGlobal.SteerHandleResourceMan.Add("btnModify", btnModify);
		
		var elTable = CruiseGlobal.CreateElement("TABLE", "DisplayGroupDetailTable", displayGroupListHandler.basePaneDiv, "DisplayGroupDetailTable");
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayGroupIDint"], displayGroup.displayGroupIDint], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayGroupName"], displayGroup.displayGroupName], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayGroupUseFlag"], SteerGlobal.GetCodeText('displayGroupUseFlag', displayGroup.displayGroupUseFlag)], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayGroupType"], displayGroup.displayGroupType], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayOrder"], displayGroup.displayOrder], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_displayAdditionalInfo"], displayGroup.displayAdditionalInfo], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_serviceName"], displayGroup.serviceName], elTable);
		
		// Show displayGroupAndFunctions
		var elTable = CruiseGlobal.CreateElement("TABLE", "displayGroupAndFunctionsDataTable", displayGroupListHandler.basePaneDiv, "displayGroupAndFunctionsDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_41']], elTable);
		
		var displayGroupAndFunctionsDataTableDIV = CruiseGlobal.CreateElement("DIV", "displayGroupAndFunctionsDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, displayGroupAndFunctionsDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: displayGroupAndFunctions},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var displayGroupAndFunctionsDataTable = new OPDataTable("displayGroupAndFunctionsDataTable", null, SteerMindLogic.GetColumns("displayGroupAndFunctionsDataTable"), "displayGroupAndFunctionsDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("displayGroupAndFunctionsDataTable", displayGroupAndFunctionsDataTable);
	}
	
	OPAjaxRequest("POST", "getDetailDisplayGroup", _callback, "displayGroupIDint=" + displayGroupIDint);
}

function RemoveDisplayGroup(event, displayGroup) {
	function _confirm() {
    	function _callback(o, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
//			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], user.userIDint + l10nMsg["msg_21"], l10nMsg["text_02"]);
			displayGroupListHandler.GetDisplayGroup(displayGroup.displayGroupIDint);
			displayGroupListHandler.parentOPTable.Refresh();
		};
		
		var req_string = "";
		req_string += "displayGroupIDint=" + displayGroup.displayGroupIDint;
		req_string += "&displayGroupName=" + CruiseGlobal.ReplaceToSpecialChar(displayGroup.displayGroupName);
		req_string += "&displayGroupUseFlag=" + "0";
		req_string += "&displayGroupType=" + displayGroup.displayGroupType;
		req_string += "&displayOrder=" + displayGroup.displayOrder;
		req_string += "&displayAdditionalInfo=" + CruiseGlobal.ReplaceToSpecialChar(displayGroup.displayAdditionalInfo);
		req_string += "&serviceName=" + CruiseGlobal.ReplaceToSpecialChar(displayGroup.serviceName);
		
		OPAjaxRequest("POST", "modifyDisplayGroup", _callback, req_string);
		
		this.hide();
		SteerGlobal.ShowLoading();
    }
    
    function _cancel() {
    	this.hide();
    }
    
	var confirmBox = new OPMsgBox("ConfirmRemove", displayGroup.displayGroupIDint + l10nMsg["msg_29"], l10nMsg["text_50"], {isFixedCenter: true, isDraggable: false, isClose: true, isModal: true, width: 300});
	confirmBox.SetICON("warn");
	confirmBox.SetButtons([{text: l10nMsg["text_02"], handler: _confirm, isDefault: true}, {text: l10nMsg["text_03"],  handler: _cancel}]);
	confirmBox.Show();
}

function ModifyDisplayGroup(event, displayGroup) {
	displayGroupListHandler.InitializePane();
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elements = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	                CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, displayGroupListHandler.actionPaneDiv);
	
	function confirm_callback(event, displayGroup) {
		function _callback(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			if (displayGroupListHandler.dtDisplayGroupList != null)
				displayGroupListHandler.dtDisplayGroupList.Refresh();
			
			displayGroupListHandler.GetDisplayGroup(displayGroup.displayGroupIDint);
		}

		if (elDisplayGroupName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_79"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayGroupType.value < 1 || elDisplayGroupType.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_80"], l10nMsg["text_02"]);
			return;
		}
		
		if (elDisplayOrder.value < 1 || elDisplayOrder.value > 127) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_81"], l10nMsg["text_02"]);
			return;
		}
		
		if (elServiceName.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_82"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "displayGroupIDint=" + displayGroup.displayGroupIDint;
		req_string += "&displayGroupName=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayGroupName.value);
		req_string += "&displayGroupUseFlag=" + (elDisplayGroupUseFlag.checked ? "1" : "0");
		req_string += "&displayGroupType=" + elDisplayGroupType.value;
		req_string += "&displayOrder=" + elDisplayOrder.value;
		req_string += "&displayAdditionalInfo=" + CruiseGlobal.ReplaceToSpecialChar(elDisplayAdditionalInfo.value);
		req_string += "&serviceName=" + CruiseGlobal.ReplaceToSpecialChar(elServiceName.value);
		
		OPAjaxRequest("POST", "modifyDisplayGroup", _callback, req_string);
	}
	
	function cancel_callback(event, displayGroup) {
		displayGroupListHandler.GetDisplayGroup(displayGroup.displayGroupIDint);
	}
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_02"], displayGroupListHandler.actionPaneDiv, confirm_callback, displayGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);

	//Cancel Button
	var btnCancel = new OPButton("CancelButton", l10nMsg["text_03"], displayGroupListHandler.actionPaneDiv, cancel_callback, displayGroup);
	SteerGlobal.SteerHandleResourceMan.Add("btnCancel", btnCancel);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "ModifyDisplayGroupTable", displayGroupListHandler.basePaneDiv, "ModifyDisplayGroupTable");
	
	var elDisplayGroupName = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupName", null, "txtInputNormal", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_75"], elDisplayGroupName, elTable);
	elDisplayGroupName.value = displayGroup.displayGroupName;
	
	var elDisplayGroupUseFlag = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupUseFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_66"], elDisplayGroupUseFlag, elTable);
	displayGroup.displayGroupUseFlag > 0 ? elDisplayGroupUseFlag.checked = true : elDisplayGroupUseFlag.checked = false;
	
	var elDisplayGroupType = CruiseGlobal.CreateElement("INPUT", "inputDisplayGroupType", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_76"], elDisplayGroupType, elTable);
	elDisplayGroupType.value = displayGroup.displayGroupType;
	
	var elDisplayOrder = CruiseGlobal.CreateElement("INPUT", "inputDisplayOrder", null, "txtInputVerySmall", {maxlength: 3});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_77"], elDisplayOrder, elTable);
	elDisplayOrder.value = displayGroup.displayOrder;
	
	var elDisplayAdditionalInfo = CruiseGlobal.CreateElement("INPUT", "inputDisplayAdditionalInfo", null, "txtInputBig", {maxlength: 255});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_78"], elDisplayAdditionalInfo, elTable);
	elDisplayAdditionalInfo.value = displayGroup.displayAdditionalInfo;
	
	var elServiceName = CruiseGlobal.CreateElement("INPUT", "inputServiceName", null, "txtInputNormal", {maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_79"], elServiceName, elTable);
	elServiceName.value = displayGroup.serviceName;
}

var displayGroupListHandler = {
	dtDisplayGroupList: null,
	actionPaneDiv: null,
	basePaneDiv: null,
	parentOPTable: null,
	
	CreateDisplayGroup: CreateDisplayGroup,
	GetDisplayGroupList: GetDisplayGroupList,
	
	ISelectedDataTable: ISelectedDataTable,
	InitializePane: InitializePane,
	SetOPTable: SetOPTable,
	
	GetDisplayGroup: GetDisplayGroup,
	RemoveDisplayGroup: RemoveDisplayGroup,
	ModifyDisplayGroup: ModifyDisplayGroup};
