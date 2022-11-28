var userGroupAndUserLinkHandler = {
	dtUserGroupList : null,
	dtLinkedUserList : null,
	selectedUserGroupIDint : null,
	
	LoadUserGroupListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(11), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			userGroupAndUserLinkHandler.GetUserGroupList ({ searchText : CruiseGlobal.GetElementValue("SearchUserText") });
		};
		
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
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchUserGroupListButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		userGroupAndUserLinkHandler.dtUserGroupList = userGroupAndUserLinkHandler.GetUserGroupList();
	},
	GetUserGroupList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (userGroupAndUserLinkHandler.dtUserGroupList)
			SteerGlobal.SteerPageResourceMan.Remove("getUserGroupList_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getUserGroupList",
													"getUserGroupList?",
													"getUserGroupList",
													"DataListSection",
													{ 	
														selectCallbackFn : userGroupAndUserLinkHandler.ISelectedDataTable, 
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userGroupIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function (selectedValues, tableObj)
	{
		SteerGlobal.NowLoading();
		userGroupAndUserLinkHandler.GetUserListByUserGroup(selectedValues[0].userGroupIDint, selectedValues[0].userGroupName);
		userGroupAndUserLinkHandler.selectedUserGroupIDint = selectedValues[0].userGroupIDint;
	},
	GetUserListByUserGroup : function (userGroupIDint, userGroupName)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 12, arrPaneText : [userGroupName], isForList: true });
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
									l10nMsg["text_34"], 
									elActionPaneDiv,
									userGroupAndUserLinkHandler.AddUserAndUserGroupLink);
		btnAdd.SetFontBold();
		SteerGlobal.SteerHandleResourceMan.Add("btnAdd", btnAdd);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton",
									l10nMsg["text_09"], 
									elActionPaneDiv,
									userGroupAndUserLinkHandler.RemoveUserAndUserGroupLink);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);
		
		if (userGroupAndUserLinkHandler.dtLinkedUserList)
			SteerGlobal.SteerHandleResourceMan.Remove("getLinkedUserGroupList_" + elBasePaneDiv.id);
		
		userGroupAndUserLinkHandler.dtLinkedUserList = SteerMindLogic.CreateHandleSteerDatatable("getUserListByUserGroup",
				"getUserListByUserGroup?",
				"getUserList",
				elBasePaneDiv.id,
				{ 	
					addRequestParamFn : function () { return "&userGroupIDint=" + userGroupIDint; },
					paginator : new OPPaginator("SelectedPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "userIDint",
					sortDir : "asc",
					selectionMode : "multi"
				},
				0);
	},
	AddUserAndUserGroupLink : function ()
	{
		// Add Item Tag Panel
		var UserSelectLayout = function (btnClickCallback, config){
			var layoutWrapper = CruiseGlobal.CreateElement("div", "addUserDialogLayout");
			var layoutBody = CruiseGlobal.CreateElement("div", "addUserDialogLayoutBody", layoutWrapper, "bd");
			var UserSelectInnerCallback = function (){
				// 데이터를 가져온다.
				UserSelectDataTable = userGroupAndUserLinkHandler.GetUserListForAdd(
						{ searchText : CruiseGlobal.GetElementValue("UserSearchText") });
			};
			
			//Build Divs
			var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "UserDataListPaginateSection", layoutBody, null);
			var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "UserSearchCriteriaDIV", layoutBody);
	
			var elArray = new Array();
			elArray.push(searchCriteriaDIV);
			elArray.push(CruiseGlobal.CreateElement("SPAN", "UserSearchButton"));
			elArray.push(dataPaginationDIV);
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layoutBody);
			
			var datatableDIV = CruiseGlobal.CreateElement("DIV", "UserSearchDatatableDIV", layoutBody);
			datatableDIV.style.height = "370px";
			datatableDIV.style.width = "780px";

			//Input Tag
			var elInputArea = CruiseGlobal.CreateElement("INPUT", "UserSearchText", searchCriteriaDIV, "txtInputNormal");
			var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, UserSelectInnerCallback, this , false, false, this);
			keyListener.enable();

			//Search Button
			var btnSearch = new OPButton("UserSearchButton", l10nMsg["text_30"], null, UserSelectInnerCallback);
			btnSearch.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("UserSearchButton", btnSearch);
			return layoutWrapper.innerHTML;
		}
		
		var oTagDialog = new OPDialog ("addUserDialog", UserSelectLayout(), null, l10nMsg["msg_16"], null,
				{ width : 800,
				  height : 500 });
		
		var ClearDialogResources = function(){
			oTagDialog.Hide();
			CruiseGlobal.RemoveElement("addUserDialogLayout");
			SteerGlobal.SteerHandleResourceMan.Remove("UserSearchButton");
			SteerGlobal.SteerHandleResourceMan.Remove("addUserDialog");
		}
		oTagDialog.SetButtons([{ text:l10nMsg["text_33"], width: 100, handler:function(o, msg) {
							var selectedRows = UserSelectDataTable.GetSelectedRows();
							var callbackCount = 0;
							
							for (var i = 0; i < selectedRows.length; i++){
								var _callback = function(o, messages) {
									if (callbackCount >= selectedRows.length - 1){
										userGroupAndUserLinkHandler.dtLinkedUserList.Refresh();
									}else{
										callbackCount++;
										SteerGlobal.ShowLoading();
									}
									if (!SteerGlobal.ValidateResponse(messages)) return;
								};
								OPAjaxRequest("POST", "createLinkUserGroupAndUser", _callback, 
										"userGroupIDint=" + userGroupAndUserLinkHandler.selectedUserGroupIDint + "&userIDint=" + selectedRows[i].userIDint);
							}
							ClearDialogResources();
						}}, { text:l10nMsg["text_03"], width: 100, handler:function(o, msg) {
							ClearDialogResources();
						}}])
		oTagDialog.SetModal(true);
		oTagDialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("addUserDialog", oTagDialog);
		UserSelectDataTable = userGroupAndUserLinkHandler.GetUserListForAdd();
	},
	GetUserListForAdd : function (objs)
	{
		//Validation
		var addRequestVal = '&userGroupIDint=' + userGroupAndUserLinkHandler.selectedUserGroupIDint;
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		SteerGlobal.SteerHandleResourceMan.Remove("getUserListForAdd_UserSearchDatatableDIV");
		
		return SteerMindLogic.CreateHandleSteerDatatable("getUserListForAdd",
													"getUserListNoLinkToUserGroup?",
													"getUserList",
													"UserSearchDatatableDIV",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("UserDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userIDint",
														sortDir : "asc",
														selectionMode : "multi"
													},
													0);
	},
	RemoveUserAndUserGroupLink : function ()
	{
		var selectedRows = userGroupAndUserLinkHandler.dtLinkedUserList.GetSelectedRows();
		var callbackCount = 0;
		
		for (var i = 0; i < selectedRows.length; i++){
			var _callback = function(o, messages) {
				if (callbackCount >= selectedRows.length - 1){
					userGroupAndUserLinkHandler.dtLinkedUserList.Refresh();
				}else{
					callbackCount++;
					SteerGlobal.ShowLoading();
				}
				if (!SteerGlobal.ValidateResponse(messages)) return;
				
			};
			OPAjaxRequest("POST", "removeLinkUserGroupAndUser", _callback, 
					"userGroupIDint=" + userGroupAndUserLinkHandler.selectedUserGroupIDint + "&userIDint=" + selectedRows[i].userIDint);
		}
	}
};
