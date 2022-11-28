var exportDataHandler = {
	opTabView : null,
	elActionPaneDiv : null,
	elBasePaneDiv : null,
	
	objExportFunctionData : [],
	objExportFunctionGroupData : [],
	objExportUserGroupData : [],
	objExportDisplayGroupData : [],
	
	dtExportFunction : null,
	dtExportFunctionGroup : null,
	dtExportUserGroup : null,
	dtExportDisplayGroup : null,
	
	// Reset 
	ResetFunctionList : function()
	{
		if (!exportDataHandler.objExportFunctionData || !exportDataHandler.dtExportFunction)
			return;
		
		var len = exportDataHandler.objExportFunctionData.length;
		for (var i = 0; i < len; i++){
			exportDataHandler.objExportFunctionData.pop();
		}
		exportDataHandler.dtExportFunction.Refresh();
	},
	ResetFunctionGroupList : function()
	{
		if (!exportDataHandler.objExportFunctionGroupData || !exportDataHandler.dtExportFunctionGroup)
			return;
		
		var len = exportDataHandler.objExportFunctionGroupData.length;
		for (var i = 0; i < len; i++){
			exportDataHandler.objExportFunctionGroupData.pop();
		}
		exportDataHandler.dtExportFunctionGroup.Refresh();
	},
	ResetUserGroupList : function()
	{
		if (!exportDataHandler.objExportUserGroupData || !exportDataHandler.dtExportUserGroup)
			return;
		
		var len = exportDataHandler.objExportUserGroupData.length;
		for (var i = 0; i < len; i++){
			exportDataHandler.objExportUserGroupData.pop();
		}
		exportDataHandler.dtExportUserGroup.Refresh();
	},
	ResetDisplayGroupList : function()
	{
		if (!exportDataHandler.objExportDisplayGroupData || !exportDataHandler.dtExportDisplayGroup)
			return;
		
		var len = exportDataHandler.objExportDisplayGroupData.length;
		for (var i = 0; i < len; i++){
			exportDataHandler.objExportDisplayGroupData.pop();
		}
		exportDataHandler.dtExportDisplayGroup.Refresh();
	},
	LoadExportLayout : function ()
	{
		SteerGlobal.SteerPageResourceMan.Remove("leftCenterLayout");
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "ImportPaneNameArea", {body: SteerGlobal.GetPaneText(42)});
		var tabDiv = CruiseGlobal.CreateElement("div", "DataListSection", newDiv);
		exportDataHandler.opTabView = new OPTabView ("exportTabView", tabDiv);

		SteerLayout.LoadLeftCenterLayout();
		
		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			if (messages.FunctionExport != null && messages.FunctionExport){
				exportDataHandler.LoadFunctionExportLayout();
			}
			if (messages.FunctionGroupExport != null && messages.FunctionGroupExport){
				exportDataHandler.LoadFunctionGroupExportLayout();
			}
			if (messages.UserGroupExport != null && messages.UserGroupExport){
				exportDataHandler.LoadUserGroupExportLayout();
			}
			if (messages.DisplayGroupExport != null && messages.DisplayGroupExport){
				exportDataHandler.LoadDisplayGroupExportLayout();
			}
			exportDataHandler.opTabView.SelectTab(0);
			exportDataHandler.LoadExportListLayout();
		};
		OPAjaxRequest("GET", "checkExportPrivileges", _callback);
		SteerGlobal.ShowLoading();
	},
	LoadExportListLayout : function ()
	{
		PaneArray = SteerLayout.LoadDefaultRightLayout ({ paneCode : 42 });
		exportDataHandler.elActionPaneDiv = PaneArray[0];
		exportDataHandler.elBasePaneDiv = PaneArray[1];
		
		//Resource Truncation
		SteerGlobal.SteerHandleResourceMan.RemoveAll();
		
		//Display Handler
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("SPAN", "DownloadButton"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportDataHandler.elActionPaneDiv);
		
		// Buttons
		var btnDownload = new OPButton("DownloadButton", l10nMsg["text_87"], null, exportDataHandler.Download);
		btnDownload.SetHeight(25);
		btnDownload.SetFontBold();
		btnDownload.SetFontSize(12);
		btnDownload.SetFontColor("#FF4444");
		
		// Resource Registration for clean-up
		SteerGlobal.SteerHandleResourceMan.Add("DownloadButton", btnDownload);
		
		// Contents
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_88"]}));
		elArray.push(CruiseGlobal.CreateElement("DIV", "ResetFunctionButton"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportDataHandler.elBasePaneDiv);
		var FunctionSelectedDIV = CruiseGlobal.CreateElement("DIV", "FunctionSelected", exportDataHandler.elBasePaneDiv, "ExportSelectionDiv");
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_89"]}));
		elArray.push(CruiseGlobal.CreateElement("DIV", "ResetFunctionGroupButton"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportDataHandler.elBasePaneDiv);
		var boxTagSelectedDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupSelected", exportDataHandler.elBasePaneDiv, "ExportSelectionDiv");
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_90"]}));
		elArray.push(CruiseGlobal.CreateElement("DIV", "ResetUserGroupButton"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportDataHandler.elBasePaneDiv);
		var UserGroupSelectedDIV = CruiseGlobal.CreateElement("DIV", "UserGroupSelected", exportDataHandler.elBasePaneDiv, "ExportSelectionDiv");
		
		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", null, null, "ExportSectionTextDiv", {body: l10nMsg["text_94"]}));
		elArray.push(CruiseGlobal.CreateElement("DIV", "ResetDisplayGroupButton"));
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportDataHandler.elBasePaneDiv);
		var DisplayGroupSelectedDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupSelected", exportDataHandler.elBasePaneDiv, "ExportSelectionDiv");
		
		var btnFunctionReset = new OPButton("ResetFunctionButton", l10nMsg["text_92"], null, exportDataHandler.ResetFunctionList);
		var btnFunctionGroupReset = new OPButton("ResetFunctionGroupButton", l10nMsg["text_92"], null, exportDataHandler.ResetFunctionGroupList);
		var btnUserGroupReset = new OPButton("ResetUserGroupButton", l10nMsg["text_92"], null, exportDataHandler.ResetUserGroupList);
		var btnDisplayGroupReset = new OPButton("ResetDisplayGroupButton", l10nMsg["text_92"], null, exportDataHandler.ResetDisplayGroupList);
		
		// Resource Registration for clean-up
		SteerGlobal.SteerHandleResourceMan.Add("ResetFunctionButton", btnFunctionReset);
		SteerGlobal.SteerHandleResourceMan.Add("ResetFunctionGroupButton", btnFunctionGroupReset);
		SteerGlobal.SteerHandleResourceMan.Add("ResetUserGroupButton", btnUserGroupReset);
		SteerGlobal.SteerHandleResourceMan.Add("ResetDisplayGroupButton", btnDisplayGroupReset);
		
		// Contents - Functions
		exportDataHandler.dtExportFunction = new OPDataTable("ExportFunctionSelection", null, SteerMindLogic.GetColumns("getFunctionList"), "FunctionSelected",
															 {	JSArrayObejct : { data : exportDataHandler.objExportFunctionData },
												    			l10nObj : l10nMsg,
																formatRow : SteerMindLogic.SteerBaseFormatter,
																selectionMode : "null"});
	    // Contents - Function Group
		exportDataHandler.dtExportFunctionGroup = new OPDataTable("ExportFunctionGroupSelection", null, SteerMindLogic.GetColumns("getFunctionGroupList"), "FunctionGroupSelected",
														 {	JSArrayObejct : { data : exportDataHandler.objExportFunctionGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});
		// Contents - User Group
		exportDataHandler.dtExportUserGroup = new OPDataTable("ExportUserGroupSelection", null, SteerMindLogic.GetColumns("getUserGroupList"), "UserGroupSelected",
														 {	JSArrayObejct : { data : exportDataHandler.objExportUserGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});
		// Contents - Display Group
		exportDataHandler.dtExportDisplayGroup = new OPDataTable("ExportDisplayGroupSelection", null, SteerMindLogic.GetColumns("getDisplayGroupList"), "DisplayGroupSelected",
														 {	JSArrayObejct : { data : exportDataHandler.objExportDisplayGroupData },
											    			l10nObj : l10nMsg,
															formatRow : SteerMindLogic.SteerBaseFormatter,
															selectionMode : "null"});
		
		// Resource Registration for clean-up
		SteerGlobal.SteerHandleResourceMan.Add("ExportFunctionSelection_FunctionSelected", exportDataHandler.dtExportFunction);
		SteerGlobal.SteerHandleResourceMan.Add("ExportFunctionGroupSelection_FunctionGroupSelected", exportDataHandler.dtExportFunctionGroup);
		SteerGlobal.SteerHandleResourceMan.Add("ExportUserGroupSelection_UserGroupSelected", exportDataHandler.dtExportUserGroup);
		SteerGlobal.SteerHandleResourceMan.Add("ExportDisplayGroupSelection_DisplayGroupSelected", exportDataHandler.dtExportDisplayGroup);
	},
	// Function Layout
	LoadFunctionExportLayout : function()
	{
		var ExportDataTable = null;
		var exportActionDiv = CruiseGlobal.CreateElement("div", "ExportFunctionAction", null, "ExportTab");
		exportDataHandler.opTabView.AddTab(l10nMsg["text_88"], exportActionDiv, false);

		function _callback() {
			var serverCategory = CruiseGlobal.GetElementValue("FuncServerCategorySelect");
			var searchText = CruiseGlobal.GetElementValue("SearchFunctionText");
			
			//Validation
			var addRequestVal = '';
			if (serverCategory) {
				addRequestVal += "&serverType=" + serverCategory;
				if (searchText != null && searchText != '')
					addRequestVal += "&searchCriteria=" + searchText;
			}
			
			if (ExportDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getFunctionList_FunctionDataListSection");
			
			var configs = {
					addRequestParamFn : function () { return addRequestVal; },
					paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "globalUniqueFunctionIDint",
					sortDir : "asc",
					selectionMode : "multi"};
			
			ExportDataTable = SteerMindLogic.CreateSteerDatatable("getFunctionList", "getFunctionList?", "getFunctionList", "FunctionDataListSection", configs, 0);
		}
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DataListPaginateSection", exportActionDiv, null);
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", exportActionDiv);

		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", "AddFunctionButton", null, "ExportAddButton"));
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportActionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "FunctionDataListSection", exportActionDiv);
		
		//Add Button
		var btnAdd = new OPButton("AddFunctionButton", l10nMsg["text_91"], null,
				function (){ 
					var selectedRows = ExportDataTable.GetSelectedRows();
					for (var i = 0; i < selectedRows.length; i++){
						var isSelected = false;
						for (var j = 0; j < exportDataHandler.objExportFunctionData.length; j++){
							if (exportDataHandler.objExportFunctionData[j].globalUniqueFunctionIDint == selectedRows[i].globalUniqueFunctionIDint){
								isSelected = true;
								break;
							}
						}
						if (isSelected == false){
							exportDataHandler.objExportFunctionData.push({
								globalUniqueFunctionIDint : selectedRows[i].globalUniqueFunctionIDint,
								serverType : selectedRows[i].serverType,
								functionIDint : selectedRows[i].functionIDint,
								functionName : selectedRows[i].functionName,
								displayName : selectedRows[i].displayName,
								functionUseFlag : selectedRows[i].functionUseFlag,
								dangerLevel : selectedRows[i].dangerLevel,
								requireSessionFlag : selectedRows[i].requireSessionFlag});
						}
					}
					exportDataHandler.dtExportFunction.Refresh();
				});
		btnAdd.SetHeight(25);
		btnAdd.SetFontBold();
		btnAdd.SetFontSize(12);
		btnAdd.SetFontColor("#FF4444");

		//ServerCategory		
		SteerLayout.LoadServerCategorySelect("FuncServerCategorySelect", searchCriteriaDIV, _callback);
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchFunctionText", searchCriteriaDIV, "txtInputVerySmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchFunctionListButton", l10nMsg["text_30"], null, function (){ _callback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnFunctionSearch", btnSearch);
		SteerGlobal.SteerPageResourceMan.Add("btnFunctionAdd", btnAdd);
		
		 _callback();
	},
	//Function Group Layout
	LoadFunctionGroupExportLayout : function()
	{
		var ExportDataTable = null;
		var exportActionDiv = CruiseGlobal.CreateElement("div", "ExportFunctionGroupAction", null, "ExportTab");
		exportDataHandler.opTabView.AddTab(l10nMsg["text_89"], exportActionDiv, false);
		
		function _callback() {
			var searchText = CruiseGlobal.GetElementValue("SearchFunctionGroupText");
			
			//Validation
			var addRequestVal = '';
			if (searchText) {
				if (searchText != null && searchText != '')
					addRequestVal += "&searchCriteria=" + searchText;
			}
			
			if (ExportDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getFunctionGroupList_FunctionGroupDataListSection");
			
			var configs = {
					addRequestParamFn : function () { return addRequestVal; },
					paginator : new OPPaginator("FunctionGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj : l10nMsg,
					formatRow : SteerMindLogic.MindProcessFormatter,
					sortColumn : "functionGroupIDint",
					sortDir : "asc",
					selectionMode : "multi"};
			
			ExportDataTable = SteerMindLogic.CreateSteerDatatable("getFunctionGroupList", "getFunctionGroupList?", "getFunctionGroupList", "FunctionGroupDataListSection", configs, 0);
		}
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "FunctionGroupDataListPaginateSection", exportActionDiv, null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", exportActionDiv);

		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", "AddFunctionGroupButton", null, "ExportAddButton"));
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchFunctionGroupListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportActionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "FunctionGroupDataListSection", exportActionDiv);
		
		//Add Button
		var btnAdd = new OPButton("AddFunctionGroupButton", l10nMsg["text_91"], null,
				function (){ 
					var selectedRows = ExportDataTable.GetSelectedRows();
					for (var i = 0; i < selectedRows.length; i++){
						var isSelected = false;
						for (var j = 0; j < exportDataHandler.objExportFunctionGroupData.length; j++){
							if (exportDataHandler.objExportFunctionGroupData[j].functionGroupName == selectedRows[i].functionGroupName){
								isSelected = true;
								break;
							}
						}
						if (isSelected == false){
							exportDataHandler.objExportFunctionGroupData.push({
								functionGroupIDint : selectedRows[i].functionGroupIDint,
								functionGroupName : selectedRows[i].functionGroupName,
								functionGroupUseFlag : selectedRows[i].functionGroupUseFlag});
						}
					}
					exportDataHandler.dtExportFunctionGroup.Refresh();
				});
		btnAdd.SetHeight(25);
		btnAdd.SetFontBold();
		btnAdd.SetFontSize(12);
		btnAdd.SetFontColor("#FF4444");
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchFunctionGroupText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchFunctionGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnFunctionGroupSearch", btnSearch);
		SteerGlobal.SteerPageResourceMan.Add("btnFunctionGroupAdd", btnAdd);
		
		_callback();
	},
	//UserGroup Layout
	LoadUserGroupExportLayout : function()
	{
		var ExportDataTable = null;
		var exportActionDiv = CruiseGlobal.CreateElement("div", "ExportUserGroupAction", null, "ExportTab");
		exportDataHandler.opTabView.AddTab(l10nMsg["text_90"], exportActionDiv, false);

		function _callback() {
			var searchText = CruiseGlobal.GetElementValue("SearchUserGroupText")
			
			var addRequestVal = '';
			if (searchText) {
				if (searchText != null && searchText != '')
					addRequestVal += "&searchCriteria=" + searchText;
			}
			
			if (ExportDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getUserGroupList_UserGroupDataListSection");
			
			var configs = {
					addRequestParamFn: function () { return addRequestVal; },
					paginator: new OPPaginator("UserGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "userGroupIDint",
					sortDir: "asc",
					selectionMode: "multi"}
			
			ExportDataTable = SteerMindLogic.CreateSteerDatatable("getUserGroupList", "getUserGroupList?", "getUserGroupList", "UserGroupDataListSection", configs, 0);
		}
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "UserGroupDataListPaginateSection", exportActionDiv, null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", exportActionDiv);

		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", "AddUserGroupButton", null, "ExportAddButton"));
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchUserGroupListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportActionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "UserGroupDataListSection", exportActionDiv);
		
		//Add Button
		var btnAdd = new OPButton("AddUserGroupButton", l10nMsg["text_91"], null,
				function (){ 
					var selectedRows = ExportDataTable.GetSelectedRows();
					for (var i = 0; i < selectedRows.length; i++){
						var isSelected = false;
						for (var j = 0; j < exportDataHandler.objExportUserGroupData.length; j++){
							if (exportDataHandler.objExportUserGroupData[j].userGroupName == selectedRows[i].userGroupName){
								isSelected = true;
								break;
							}
						}
						if (isSelected == false){
							exportDataHandler.objExportUserGroupData.push({
								userGroupIDint : selectedRows[i].userGroupIDint,
								userGroupName : selectedRows[i].userGroupName,
								auditorUserGroupName : selectedRows[i].auditorUserGroupName,
								auditorUserGroupIDint : selectedRows[i].auditorUserGroupIDint,
								userGroupUseFlag : selectedRows[i].userGroupUseFlag,
								functionGroupName : selectedRows[i].functionGroupName,
								functionGroupIDint : selectedRows[i].functionGroupIDint});
						}
					}
					exportDataHandler.dtExportUserGroup.Refresh();
				});
		btnAdd.SetHeight(25);
		btnAdd.SetFontBold();
		btnAdd.SetFontSize(12);
		btnAdd.SetFontColor("#FF4444");
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchUserGroupText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchUserGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnUserGroupSearch", btnSearch);
		SteerGlobal.SteerPageResourceMan.Add("btnUserGroupAdd", btnAdd);
		
		_callback();
	},
	//DisplayGroup Layout
	LoadDisplayGroupExportLayout : function()
	{
		var ExportDataTable = null;
		var exportActionDiv = CruiseGlobal.CreateElement("div", "ExportDisplayGroupAction", null, "ExportTab");
		exportDataHandler.opTabView.AddTab(l10nMsg["text_94"], exportActionDiv, false);

		function _callback() {
			var searchText = CruiseGlobal.GetElementValue("SearchDisplayGroupText")
			
			var addRequestVal = '';
			if (searchText) {
				if (searchText != null && searchText != '')
					addRequestVal += "&searchCriteria=" + searchText;
			}
			
			if (ExportDataTable)
				SteerGlobal.SteerPageResourceMan.Remove("getDisplayGroupList_DisplayGroupDataListSection");
			
			var configs = {
					addRequestParamFn: function () { return addRequestVal; },
					paginator: new OPPaginator("DisplayGroupDataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true, SteerGlobal.DefaultPaginatorConfig()), 
					l10nObj: l10nMsg,
					formatRow: SteerMindLogic.MindProcessFormatter,
					sortColumn: "displayGroupIDint",
					sortDir: "asc",
					selectionMode: "multi"}
			
			ExportDataTable = SteerMindLogic.CreateSteerDatatable("getDisplayGroupList", "getDisplayGroupList?", "getDisplayGroupList", "DisplayGroupDataListSection", configs, 0);
		}
		
		//Build Divs
		var dataPaginationDIV = CruiseGlobal.CreateElement("DIV", "DisplayGroupDataListPaginateSection", exportActionDiv, null, {paddingLeft : "30px"});
		var searchCriteriaDIV = CruiseGlobal.CreateElement("DIV", "searchCriteriaDIV", exportActionDiv);

		var elArray = new Array();
		elArray.push(CruiseGlobal.CreateElement("DIV", "AddDisplayGroupButton", null, "ExportAddButton"));
		elArray.push(searchCriteriaDIV);
		elArray.push(CruiseGlobal.CreateElement("DIV", "SearchDisplayGroupListButton"));
		elArray.push(dataPaginationDIV);
		
		SteerGlobal.MakeSearchLayoutHTMLTable(elArray, exportActionDiv);
		
		//Content Div
		CruiseGlobal.CreateElement("div", "DisplayGroupDataListSection", exportActionDiv);
		
		//Add Button
		var btnAdd = new OPButton("AddDisplayGroupButton", l10nMsg["text_91"], null,
				function (){ 
					var selectedRows = ExportDataTable.GetSelectedRows();
					for (var i = 0; i < selectedRows.length; i++){
						var isSelected = false;
						for (var j = 0; j < exportDataHandler.objExportDisplayGroupData.length; j++){
							if (exportDataHandler.objExportDisplayGroupData[j].displayGroupIDint == selectedRows[i].displayGroupIDint){
								isSelected = true;
								break;
							}
						}
						if (isSelected == false){
							exportDataHandler.objExportDisplayGroupData.push({
								displayGroupIDint : selectedRows[i].displayGroupIDint,
								serviceName : selectedRows[i].serviceName,
								displayGroupName : selectedRows[i].displayGroupName,
								displayGroupUseFlag : selectedRows[i].displayGroupUseFlag,
								displayGroupType : selectedRows[i].displayGroupType,
								displayOrder : selectedRows[i].displayOrder,
								displayAdditionalInfo : selectedRows[i].displayAdditionalInfo});
						}
					}
					exportDataHandler.dtExportDisplayGroup.Refresh();
				});
		btnAdd.SetHeight(25);
		btnAdd.SetFontBold();
		btnAdd.SetFontSize(12);
		btnAdd.SetFontColor("#FF4444");
		
		//Input Tag
		var elInputArea = CruiseGlobal.CreateElement("INPUT", "SearchDisplayGroupText", searchCriteriaDIV, "txtInputSmall");
		var keyListener = new CruiseEvent.CreateKeyListener (elInputArea, 13, _callback, this, false, false, this);
		keyListener.enable();
		
		//Search Button
		var btnSearch = new OPButton("SearchDisplayGroupListButton", l10nMsg["text_30"], null, function (){ _callback(); });
		btnSearch.SetHeight(20);
		
		//Resource Registration
		SteerGlobal.SteerPageResourceMan.Add("btnDisplayGroupSearch", btnSearch);
		SteerGlobal.SteerPageResourceMan.Add("btnDisplayGroupAdd", btnAdd);
		
		_callback();
	},
	Download : function ()
	{
		if (exportDataHandler.objExportFunctionData.length + 
			exportDataHandler.objExportFunctionGroupData.length +
			exportDataHandler.objExportUserGroupData.length + 
			exportDataHandler.objExportDisplayGroupData.length<= 0)
		{
			CruiseGlobal.SHOWINFO (l10nMsg["text_02"], l10nMsg["msg_31"], l10nMsg["text_02"]);
			return;
		}
		
		var exportFunctions = [];
		for (var i = 0; i < exportDataHandler.objExportFunctionData.length; i++){
			exportFunctions.push(exportDataHandler.objExportFunctionData[i].globalUniqueFunctionIDint);
		}
		
		var exportFunctionGroups = [];
		for (var i = 0; i < exportDataHandler.objExportFunctionGroupData.length; i++){
			exportFunctionGroups.push(exportDataHandler.objExportFunctionGroupData[i].functionGroupName);
		}
		
		var exportUserGroups = [];
		for (var i = 0; i < exportDataHandler.objExportUserGroupData.length; i++){
			exportUserGroups.push(exportDataHandler.objExportUserGroupData[i].userGroupName);
		}
		
		var exportDisplayGroups = [];
		for (var i = 0; i < exportDataHandler.objExportDisplayGroupData.length; i++){
			exportDisplayGroups.push(exportDataHandler.objExportDisplayGroupData[i].displayGroupIDint);
		}

		var exportData = {
				functions : exportFunctions,
				functionGroups : exportFunctionGroups,
				userGroups : exportUserGroups,
				displayGroups : exportDisplayGroups
		}
		
		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			
			var DownloadDialogLayout = function (btnClickCallback, config){
				var layoutWrapper = CruiseGlobal.CreateElement("div", "downloadDialogLayout");
				var layoutBody = CruiseGlobal.CreateElement("div", "downloadDialogLayoutBody", layoutWrapper, "bd");
				
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadTitle", {body: l10nMsg["msg_32"]});
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadText", {body: l10nMsg["msg_34"] + " " + messages.globalUniqueFunctionCount});
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadText", {body: l10nMsg["msg_35"] + " " + messages.functionGroupCount});
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadText", {body: l10nMsg["msg_36"] + " " + messages.userGroupCount});
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadText", {body: l10nMsg["msg_37"] + " " + messages.displayGroupCount});
				
				CruiseGlobal.CreateElement("div", null, layoutBody, "downloadSubTitle", {body: l10nMsg["msg_33"]});
				CruiseGlobal.CreateElement("A", null, layoutBody, "downloadText", {body: l10nMsg["text_93"], href: "./data/export/" + messages.exportFileName});
				return layoutWrapper.innerHTML;
			}
			
			var oDialog = new OPDialog ("downloadDialog", DownloadDialogLayout(), null, l10nMsg["text_87"], null,
					{ width : 400,
					  height : 250 });
			
			var ClearDialogResources = function(){
				oDialog.Hide();
				CruiseGlobal.RemoveElement("downloadDialogLayout");
				SteerGlobal.SteerHandleResourceMan.Remove("downloadDialog");
			}
			
			oDialog.SetButtons([{ text:l10nMsg["text_02"], width: 100, handler:function(o, msg) {
								ClearDialogResources();
							}}])
			oDialog.SetModal(true);
			oDialog.Show();
			
			SteerGlobal.SteerHandleResourceMan.Add("downloadDialog", oDialog);
		}
		
		OPAjaxRequest("POST", "exportUserGroupAndFunctionGroupAndFunction", _callback, "exportData=" + CruiseGlobal.ReplaceToSpecialChar(CruiseGlobal.ToJsonString(exportData)));
		SteerGlobal.ShowLoading();
	}
};
