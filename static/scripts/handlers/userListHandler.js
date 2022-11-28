/*==================================
    
     User Handler Scripts
        
====================================*/

function CreateUser(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			elUserID.value = "";
			elUserName.value = "";
			elUserPassword.value = "";
			elUserPasswordCheck.value = "";
			
			if (userListHandler.dtUserList != null)
				userListHandler.dtUserList.Refresh();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (CruiseValidation.HasSpecialCharacter(elUserID.value)){
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_88"], l10nMsg["text_02"]);
			return;	
		}
		
		if (elUserID.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_06"], l10nMsg["text_02"]);
			return;
		}
		
		if (elUserPassword.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_07"], l10nMsg["text_02"]);
			return;
		}
		
		if (elUserPassword.value != elUserPasswordCheck.value) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_01"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "userIDstr=" + elUserID.value;
		req_string += "&userName=" + CruiseGlobal.ReplaceToSpecialChar(elUserName.value);
		req_string += "&password=" + elUserPassword.value;
		req_string += "&allowMultipleLoginFlag=" + (elallowMultipleLoginFlag.checked ? "1" : "0");
		
		OPAjaxRequest("POST", "createUser", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 31});
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
	var elTable = CruiseGlobal.CreateElement("TABLE", "CreateUserTable", elBasePaneDiv, "CreateUserTable");
	
	var elUserID = CruiseGlobal.CreateElement("INPUT", "inputUserID", null, "txtInputSmall", {maxlength: 64});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_47"], elUserID, elTable);
	
	var elUserName = CruiseGlobal.CreateElement("INPUT", "inputUserName", null, "txtInputSmall", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_43"], elUserName, elTable);
	
	var elUserPassword = CruiseGlobal.CreateElement("INPUT", "inputUserPassword", null, "txtInputSmall", {type: "password", maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_48"], elUserPassword, elTable);
	
	var elUserPasswordCheck = CruiseGlobal.CreateElement("INPUT", "inputUserPasswordCheck", null, "txtInputSmall", {type: "password", maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_49"], elUserPasswordCheck, elTable);
	
	var elallowMultipleLoginFlag = CruiseGlobal.CreateElement("INPUT", "inputallowMultipleLoginFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_45"], elallowMultipleLoginFlag, elTable);
	
	elallowMultipleLoginFlag.checked = true;
}

function GetUserList(action, event, obj) {
	SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
	SteerLayout.CommonInnerLeft();
	CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(3), true);

	SteerLayout.LoadLeftCenterLayout();
	
	function _callback() {
		var searchText = CruiseGlobal.GetElementValue("SearchUserText");
		
		//Validation
		var addRequestVal = '';
		
		if (searchText) {
			if (searchText != null && searchText != '')
				addRequestVal += "&searchCriteria=" + searchText;
		}
		
		if (userListHandler.dtUserList)
			SteerGlobal.SteerPageResourceMan.Remove("getUserList_DataListSection");
		
		var configs = {selectCallbackFn : userListHandler.ISelectedDataTable,
				addRequestParamFn: function () {return addRequestVal;},
				paginator: new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()),
				l10nObj: l10nMsg,
				formatRow: SteerMindLogic.MindProcessFormatter,
				sortColumn: "userIDint",
				sortDir: "asc",
				selectionMode: "single"};
		
		userListHandler.dtUserList = SteerMindLogic.CreateSteerDatatable("getUserList", "getUserList?", "getUserList", "DataListSection", configs, 0);
	}
	
	//Build Divs
	var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft: "30px"});
	var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));
	
	var elements = [searchCriteriaDIV,
	                CruiseGlobal.CreateElement("DIV", "SearchUserListButton"),
	                dataPaginationDIV];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, document.getElementById("DataListActionSection"));
	
	//Input Tag
	var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
	var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
	keyListener.enable();
	
	//Search Button
	var btnSearch = new OPButton("SearchUserListButton", l10nMsg["text_30"], null, function (){_callback();});
	btnSearch.SetHeight(20);
	
	//Resource Registration
	SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
	
	_callback();
}

function ISelectedDataTable(selectedValues, tableObj) {
	SteerGlobal.NowLoading();
	userListHandler.parentOPTable = tableObj;
	userListHandler.GetUser(selectedValues[0].userIDint);
}

function InitializePane() {
	PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 10});
	userListHandler.actionPaneDiv = PaneArray[0];
	userListHandler.basePaneDiv = PaneArray[1];
}

function SetOPTable(tableObj) {
	userListHandler.parentOPTable = tableObj;
}

function GetUser(userIDint) {
	function _callback(o, messages) {
		if (!SteerGlobal.ValidateResponse(messages))
			return;
		
		var user = messages.returnTables[0][0][0];
		var userAndUserGroups = messages.returnTables[1][0];
		
		userListHandler.InitializePane();
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elements = [CruiseGlobal.CreateElement("SPAN", "RemoveButton"),
		                CruiseGlobal.CreateElement("SPAN", "ModifyButton")];
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elements, userListHandler.actionPaneDiv);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton", l10nMsg["text_09"],
				userListHandler.actionPaneDiv,
				userListHandler.RemoveUser,
				user);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);

		//Modify Button
		var btnModify = new OPButton("ModifyButton",
				l10nMsg["text_08"],
				userListHandler.actionPaneDiv,
				userListHandler.ModifyUser,
				user);
		SteerGlobal.SteerHandleResourceMan.Add("btnModify", btnModify);
		
		var elTable = CruiseGlobal.CreateElement("TABLE", "UserTable", userListHandler.basePaneDiv, "UserTable");
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userIDint"], user.userIDint], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userIDstr"], user.userIDstr], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userName"], user.userName], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_userState"], SteerGlobal.GetCodeText('userState', user.userState)], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg["col_allowMultipleLoginFlag"], SteerGlobal.GetCodeText('allowMultipleLoginFlag', user.allowMultipleLoginFlag)], elTable);
		
		// Show userAndUserGroups
		var elTable = CruiseGlobal.CreateElement("TABLE", "userAndUserGroupsDataTable", userListHandler.basePaneDiv, "userAndUserGroupsDataTable");
		SteerGlobal.MakeLayoutTR_HTML([''], elTable);
		SteerGlobal.MakeLayoutTR_HTML([l10nMsg['text_38']], elTable);
		
		var userAndUserGroupsDataTableDIV = CruiseGlobal.CreateElement("DIV", "userAndUserGroupsDataTableDIV");
		SteerGlobal.MakeLayoutTR_INPUT(null, userAndUserGroupsDataTableDIV, elTable);
		
		var configs = {JSArrayObejct: {data: userAndUserGroups},
				 l10nObj: l10nMsg,
				 formatRow: SteerMindLogic.MindProcessFormatter,
				 selectionMode: "null",
				 width: "105%",
				 height: "105%"};
		
		var userAndUserGroupsDataTable = new OPDataTable("userAndUserGroupsDataTable", null, SteerMindLogic.GetColumns("userAndUserGroupsDataTable"), "userAndUserGroupsDataTableDIV", configs);
		SteerGlobal.SteerHandleResourceMan.Add("userAndUserGroupsDataTable", userAndUserGroupsDataTable);
	}
	
	OPAjaxRequest("POST", "getDetailUser", _callback, "userIDint=" + userIDint);
}

function RemoveUser(event, user) {
	function _confirm() {
    	function _callback(o, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], user.userIDint + l10nMsg["msg_21"], l10nMsg["text_02"]);
			userListHandler.GetUser(user.userIDint);
			userListHandler.parentOPTable.Refresh();
		};
		
		var req_string = "";
		req_string += "userIDint=" + user.userIDint;
		req_string += "&userName=" + CruiseGlobal.ReplaceToSpecialChar(user.userName);
		req_string += "&password=" + "";
		req_string += "&userState=" + "0";
		req_string += "&allowMultipleLoginFlag=" + user.allowMultipleLoginFlag;
		
		OPAjaxRequest("POST", "modifyUser", _callback, req_string);
		
		this.hide();
		SteerGlobal.ShowLoading();
    }
    
    function _cancel() {
    	this.hide();
    }
    
	var confirmBox = new OPMsgBox("ConfirmRemove", user.userIDint + l10nMsg["msg_20"], l10nMsg["text_50"], {isFixedCenter: true, isDraggable: false, isClose: true, isModal: true, width: 300});
	confirmBox.SetICON("warn");
	confirmBox.SetButtons([{text: l10nMsg["text_02"], handler: _confirm, isDefault: true}, {text: l10nMsg["text_03"],  handler: _cancel}]);
	confirmBox.Show();
}

function ModifyUser(event, user) {
	userListHandler.InitializePane();
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elements = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	                CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elements, userListHandler.actionPaneDiv);
	
	function confirm_callback(event, user) {
		function _callback(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages))
				return;
			
			if (userListHandler.dtUserList != null)
				userListHandler.dtUserList.Refresh();
			
			userListHandler.GetUser(user.userIDint);
		}
		
		var req_string = "";
		req_string += "userIDint=" + user.userIDint;
		req_string += "&userName=" + CruiseGlobal.ReplaceToSpecialChar(elUserName.value);
		req_string += "&password=" + elPassword.value;
		req_string += "&userState=" + elUserUseFlag.value;
		req_string += "&allowMultipleLoginFlag=" + (elallowMultipleLoginFlag.checked ? 1 : 0);
		
		OPAjaxRequest("POST", "modifyUser", _callback, req_string);
	}
	
	function cancel_callback(event, user) {
		userListHandler.GetUser(user.userIDint);
	}
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_02"], userListHandler.actionPaneDiv, confirm_callback, user);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);

	//Cancel Button
	var btnCancel = new OPButton("CancelButton", l10nMsg["text_03"], userListHandler.actionPaneDiv, cancel_callback, user);
	SteerGlobal.SteerHandleResourceMan.Add("btnCancel", btnCancel);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "ModifyUserTable", userListHandler.basePaneDiv, "ModifyUserTable");
	
	// userName
	var elUserName = CruiseGlobal.CreateElement("INPUT", "inputUserName", null, "txtInputSmall", {value: user.userName, maxlength: 20});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_43"], elUserName, elTable);
	
	// password
	var elPassword = CruiseGlobal.CreateElement("INPUT", "inputPassword", null, "txtInputSmall", {type: "password", maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_42"], elPassword, elTable);
	
	// useflag
	var elUserUseFlag = CruiseGlobal.CreateElement("SELECT", "userStatus", null);
	CruiseGlobal.CreateElement("OPTION", null, elUserUseFlag, null, {value: 0, body: l10nMsg["code_userState_0"]});
	CruiseGlobal.CreateElement("OPTION", null, elUserUseFlag, null, {value: 1, body: l10nMsg["code_userState_1"]});
	CruiseGlobal.CreateElement("OPTION", null, elUserUseFlag, null, {value: 2, body: l10nMsg["code_userState_2"]});
	
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["col_userState"], elUserUseFlag, elTable);
	
	// allowMultipleLoginFlag
	var elallowMultipleLoginFlag = CruiseGlobal.CreateElement("INPUT", "inputallowMultipleLoginFlag", null, null, {type: "checkbox"});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_45"], elallowMultipleLoginFlag, elTable);
	
	elUserUseFlag.value = user.userState;
	
	if (user.allowMultipleLoginFlag > 0)
		elallowMultipleLoginFlag.checked = true;
	else
		elallowMultipleLoginFlag.checked = false;
}

function ModifyME(action, event, obj) {
	function _confirm(event, obj) {
		function _callback(event, msg) {
			if (!SteerGlobal.ValidateResponse(msg))
				return;
			
			elUserName.value = "";
			elUserPassword.value = "";
			elUserPasswordCheck.value = "";
			
			if (userListHandler.dtUserList != null)
				userListHandler.dtUserList.Refresh();
			
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], l10nMsg["msg_04"], l10nMsg["text_02"]);
		}
		
		if (elUserPassword.value.length < 1) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_07"], l10nMsg["text_02"]);
			return;
		}
		
		if (elUserPassword.value != elUserPasswordCheck.value) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_05"], l10nMsg["msg_01"], l10nMsg["text_02"]);
			return;
		}
		
		var req_string = "";
		req_string += "&userName=" + CruiseGlobal.ReplaceToSpecialChar(elUserName.value);
		req_string += "&password=" + elUserPassword.value;
		
		OPAjaxRequest("POST", "modifyME", _callback, req_string);
	}
	
	var PaneArray = SteerLayout.LoadDefaultRightLayout ({paneCode: 41});
	var elActionPaneDiv = PaneArray[0];
	var elBasePaneDiv = PaneArray[1];
	
	//Resource Truncation
	SteerGlobal.SteerHandleResourceMan.RemoveAll();
	
	//Display Handler
	var elArray = [CruiseGlobal.CreateElement("SPAN", "ConfirmButton"),
	               CruiseGlobal.CreateElement("SPAN", "CancelButton")];
	
	SteerGlobal.MakeSearchLayoutHTMLTable(elArray, elActionPaneDiv);
	
	//Confirm Button
	var btnConfirm = new OPButton("ConfirmButton", l10nMsg["text_08"], elActionPaneDiv, _confirm);
	SteerGlobal.SteerHandleResourceMan.Add("btnConfirm", btnConfirm);
	
	//Input Area
	var elTable = CruiseGlobal.CreateElement("TABLE", "CreateUserTable", elBasePaneDiv, "CreateUserTable");
	
	var elUserName = CruiseGlobal.CreateElement("INPUT", "inputUserName", null, "txtInputSmall", {maxlength: 500});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_43"], elUserName, elTable);
	
	var elUserPassword = CruiseGlobal.CreateElement("INPUT", "inputUserPassword", null, "txtInputSmall", {type: "password", maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_48"], elUserPassword, elTable);
	
	var elUserPasswordCheck = CruiseGlobal.CreateElement("INPUT", "inputUserPasswordCheck", null, "txtInputSmall", {type: "password", maxlength: 50});
	SteerGlobal.MakeLayoutTR_INPUT(l10nMsg["text_49"], elUserPasswordCheck, elTable);
}

var userListHandler = {
		dtUserList: null,
		actionPaneDiv: null,
		basePaneDiv: null,
		parentOPTable: null,
		
		CreateUser: CreateUser,
		GetUserList: GetUserList,
		
		ISelectedDataTable: ISelectedDataTable,
		InitializePane: InitializePane,
		SetOPTable: SetOPTable,
		
		GetUser: GetUser,
		RemoveUser: RemoveUser,
		ModifyUser: ModifyUser,
		
		ModifyME: ModifyME};
