var userAndUserGroupLinkHandler = {
	dtUserList : null,
	dtLinkedUserGroupList : null,
	selectedUserIDint : null,
	
	LoadUserListLayout : function (action, event, obj)
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		SteerLayout.CommonInnerLeft();
		CruiseGlobal.SetHTML("LeftPaneNameArea", SteerGlobal.GetPaneText(8), true);

		SteerLayout.LoadLeftCenterLayout();
		
		var innerCallback = function ()
		{
			userAndUserGroupLinkHandler.GetUserList ({ searchText : CruiseGlobal.GetElementValue("SearchUserText") });
		};
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", CruiseGlobal.GetEl("DataListActionSection"), null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", CruiseGlobal.GetEl("DataListActionSection"));

		var elArray = new Array();
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchUserListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, document.getElementById("DataListActionSection"));
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, innerCallback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchUserListButton", l10nMsg["text_30"], null, function (){ innerCallback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnSearch", btnSearch);
		
		userAndUserGroupLinkHandler.dtUserList = userAndUserGroupLinkHandler.GetUserList();
	},
	GetUserList : function (objs)
	{
		//Validation
		var addRequestVal = '';
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		if (userAndUserGroupLinkHandler.dtUserList)
			SteerGlobal.SteerPageResourceMan.Remove("getUserList_DataListSection");
		
		return SteerMindLogic.CreateSteerDatatable("getUserList",
													"getUserList?",
													"getUserList",
													"DataListSection",
													{ 	
														selectCallbackFn : userAndUserGroupLinkHandler.ISelectedDataTable, 
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userIDint",
														sortDir : "asc",
														selectionMode : "single"
													},
													0);
	},
	ISelectedDataTable : function (selectedValues, tableObj)
	{
		SteerGlobal.NowLoading();
		userAndUserGroupLinkHandler.GetUserGroupListByUser(selectedValues[0].userIDint, selectedValues[0].userIDstr);
		userAndUserGroupLinkHandler.selectedUserIDint = selectedValues[0].userIDint;
	},
	GetUserGroupListByUser : function (userIDint, userIDstr)
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 9, arrPaneText : [userIDstr], isForList: true});
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
									l10nMsg["text_32"], 
									elActionPaneDiv,
									userAndUserGroupLinkHandler.AddUserAndUserGroupLink);
		btnAdd.SetFontBold();
		SteerGlobal.SteerHandleResourceMan.Add("btnAdd", btnAdd);
		
		//Remove Button
		var btnRemove = new OPButton("RemoveButton",
									l10nMsg["text_09"], 
									elActionPaneDiv,
									userAndUserGroupLinkHandler.RemoveUserAndUserGroupLink);
		SteerGlobal.SteerHandleResourceMan.Add("btnRemove", btnRemove);
		
		if (userAndUserGroupLinkHandler.dtLinkedUserGroupList)
			SteerGlobal.SteerHandleResourceMan.Remove("getLinkedUserGroupList_" + elBasePaneDiv.id);
		
		userAndUserGroupLinkHandler.dtLinkedUserGroupList = SteerMindLogic.CreateHandleSteerDatatable("getUserGroupListByUser",
				"getUserGroupListByUser?",
				"getUserGroupList",
				elBasePaneDiv.id,
				{ 	
					addRequestParamFn : function () { return "&userIDint=" + userIDint; },
					paginator : new OPPaginator("SelectedPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "userGroupIDint",
					sortDir : "asc",
					selectionMode : "multi"
				},
				0);
	},
	AddUserAndUserGroupLink : function ()
	{
		// Add Item Tag Panel
		var UserGroupSelectLayout = function (btnClickCallback, config){
			var layoutWrapper = CruiseGlobal.CreateElement("div", "addUserGroupDialogLayout");
			var layoutBody = CruiseGlobal.CreateElement("div", "addUserGroupDialogLayoutBody", layoutWrapper, "bd");
			var UserGroupSelectInnerCallback = function (){
				// 데이터를 가져온다.
				UserGroupSelectDataTable = userAndUserGroupLinkHandler.GetUserGroupListForAdd(
						{ searchText : CruiseGlobal.GetElementValue("UserGroupSearchText") });
			};
			
			//Build Divs
			var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "UserGroupDataListPaginateSection", layoutBody, null);
			var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "UserGroupSearchCriteriaDIV", layoutBody);
	
			var elArray = new Array();
			elArray.push(searchCriteriaDIV);
			elArray.push(CruiseGlobal.CreateElement("SPAN", "UserGroupSearchButton"));
			elArray.push(dataPaginationDIV);
			SteerGlobal.MakeSearchLayoutHTMLTable(elArray, layoutBody);
			
			var datatableDIV = CruiseGlobal.CreateElement("DIV", "UserGroupSearchDatatableDIV", layoutBody);
			datatableDIV.style.height = "370px";
			datatableDIV.style.width = "780px";

			//Input Tag
			var elInputArea = CruiseGlobal.CreateElement("INPUT", "UserGroupSearchText", searchCriteriaDIV, "txtInputNormal");
			var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, UserGroupSelectInnerCallback, this , false, false, this);
			keyListener.enable();

			//Search Button
			var btnSearch = new OPButton("UserGroupSearchButton", l10nMsg["text_30"], null, UserGroupSelectInnerCallback);
			btnSearch.SetHeight(20);

			//Resource Regiatration
			SteerGlobal.SteerHandleResourceMan.Add("UserGroupSearchButton", btnSearch);
			return layoutWrapper.innerHTML;
		}
		
		var oTagDialog = new OPDialog ("addUserGroupDialog", UserGroupSelectLayout(), null, l10nMsg["msg_15"], null,
				{ width : 800,
				  height : 500 });
		
		var ClearDialogResources = function(){
			oTagDialog.Hide();
			CruiseGlobal.RemoveElement("addUserGroupDialogLayout");
			SteerGlobal.SteerHandleResourceMan.Remove("UserGroupSearchButton");
			SteerGlobal.SteerHandleResourceMan.Remove("addUserGroupDialog");
		}
		oTagDialog.SetButtons([{ text:l10nMsg["text_33"], width: 100, handler:function(o, msg) {
							var selectedRows = UserGroupSelectDataTable.GetSelectedRows();
							var callbackCount = 0;
							
							for (var i = 0; i < selectedRows.length; i++){
								var _callback = function(o, messages) {
									if (callbackCount >= selectedRows.length - 1){
										userAndUserGroupLinkHandler.dtLinkedUserGroupList.Refresh();
									}else{
										callbackCount++;
										SteerGlobal.ShowLoading();
									}
									if (!SteerGlobal.ValidateResponse(messages)) return;
								};
								OPAjaxRequest("POST", "createLinkUserGroupAndUser", _callback, 
										"userIDint=" + userAndUserGroupLinkHandler.selectedUserIDint + "&userGroupIDint=" + selectedRows[i].userGroupIDint);
							}
							ClearDialogResources();
						}}, { text:l10nMsg["text_03"], width: 100, handler:function(o, msg) {
							ClearDialogResources();
						}}])
		oTagDialog.SetModal(true);
		oTagDialog.Show();
		
		SteerGlobal.SteerHandleResourceMan.Add("addUserGroupDialog", oTagDialog);
		UserGroupSelectDataTable = userAndUserGroupLinkHandler.GetUserGroupListForAdd();
	},
	GetUserGroupListForAdd : function (objs)
	{
		//Validation
		var addRequestVal = '&userIDint=' + userAndUserGroupLinkHandler.selectedUserIDint;
		if (objs)
		{
			if (objs.searchText != null && objs.searchText != '')
				addRequestVal += "&searchCriteria=" + objs.searchText;
		}
		
		SteerGlobal.SteerHandleResourceMan.Remove("getUserGroupListForAdd_UserGroupSearchDatatableDIV");
		
		return SteerMindLogic.CreateHandleSteerDatatable("getUserGroupListForAdd",
													"getUserGroupListNoLinkToUser?",
													"getUserGroupList",
													"UserGroupSearchDatatableDIV",
													{ 	
														addRequestParamFn : function () { return addRequestVal; },
														paginator : new OPPaginator("UserGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
														l10nObj : l10nMsg,
														formatRow : SteerMindLogic.MindProcessFormatter,
														sortColumn : "userGroupIDint",
														sortDir : "asc",
														selectionMode : "multi"
													},
													0);
	},
	RemoveUserAndUserGroupLink : function ()
	{
		var selectedRows = userAndUserGroupLinkHandler.dtLinkedUserGroupList.GetSelectedRows();
		var callbackCount = 0;
		
		for (var i = 0; i < selectedRows.length; i++){
			var _callback = function(o, messages) {
				if (callbackCount >= selectedRows.length - 1){
					userAndUserGroupLinkHandler.dtLinkedUserGroupList.Refresh();
				}else{
					callbackCount++;
					SteerGlobal.ShowLoading();
				}
				if (!SteerGlobal.ValidateResponse(messages)) return;
				
			};
			OPAjaxRequest("POST", "removeLinkUserGroupAndUser", _callback, 
					"userIDint=" + userAndUserGroupLinkHandler.selectedUserIDint + "&userGroupIDint=" + selectedRows[i].userGroupIDint);
		}
	}
};
