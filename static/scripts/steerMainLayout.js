/*==================================
    
    Steer Layout Scripts
        
====================================*/

YAHOO.util.Event.onDOMReady(function() {
	CruiseGlobal.SetElHide("SteerBaseDIV");
    CheckLoadingProcess(SteerLayout.LoadBaseLayout);
});

SteerGlobal.baseLayout = null;
SteerGlobal.baseInnerLayout = null;
SteerGlobal.leftCenterLayout = null;
SteerGlobal.rightCenterLayout = null;

SteerLayout = {
	InitBaseLayoutCenter : function ()
	{
		var center = SteerGlobal.baseLayout.GetUnitByPosition("center");
		center.get("element").appendChild(center.get("wrap"));
		center.body = center.get("wrap").firstChild;
		SteerGlobal.baseLayout.Resize();
	},
	InitSteerLayoutCenter : function ()
	{
		var center = SteerGlobal.baseInnerLayout.GetUnitByPosition("center");
		center.get("element").appendChild(center.get("wrap"));
		center.body = center.get("wrap").firstChild;
		SteerGlobal.baseInnerLayout.Resize();
	},
	InitSteerLayoutRight : function ()
	{
		var right = SteerGlobal.baseInnerLayout.GetUnitByPosition("right");
		right.get("element").appendChild(right.get("wrap"));
		right.body = right.get("wrap").firstChild;
		SteerGlobal.baseInnerLayout.Resize();
	},
	LoadBaseLayout : function (eventLoadBaseLayoutReady)
	{
		CruiseGlobal.SetHTML("releaseName", l10nMsg["productTitle"]);
		CruiseGlobal.SetHTML("version", l10nMsg["version"]);
		CruiseGlobal.RemoveElement("loadingParentDiv");
	    SteerGlobal.baseLayout = new OPLayout ("baseLayout", 
	        [
	            { position: 'top', height: 94, body: 'baseTop', scroll: null, zIndex: 2 },
	            { position: 'bottom', height: 40, gutter: '2 0 0 0', body: 'baseBottom'},
	            { position: 'left', width: 200, gutter: '2 2 1 1', header: l10nMsg['text_22'], body: 'baseLeft', collapse: true, scroll: true, zIndex: 1 },
	            { position: 'center', scroll: false, resize: true}
	        ]);
	        
	    SteerLayout.InitBaseLayoutCenter();

		function ResizeEventFired (event, args, isInit)
		{
			CruiseLog.Debug("LoadDefaultLayout.ResizeEventFired :: Resize event fired");
			//Resize Logic needed
			if (SteerGlobal.baseInnerLayout.GetWidth('right') > SteerGlobal.baseLayout.GetWidth('center') - 200)
				SteerGlobal.baseInnerLayout.SetWidth('right', SteerGlobal.baseLayout.GetWidth('center') - 200);
		}
		
		var leftPaneDefaultDiv = CruiseGlobal.CreateElement("div", "leftPaneDefaultDiv", null, "PaneDefaultDiv", { body : l10nMsg['msg_13'] });
		var rightPaneDefaultDiv = CruiseGlobal.CreateElement("div", "rightPaneDefaultDiv", null, "PaneDefaultDiv", { body : l10nMsg['msg_14'] });
		
		SteerGlobal.baseInnerLayout = new OPLayout ("SteerGlobal.baseInnerLayout",
			[
				{ position: 'center', body: leftPaneDefaultDiv, gutter: '2 2 2 2', scroll: false, resize: false},
			    { position: 'right', body: rightPaneDefaultDiv, gutter: '2 2 2 5', minWidth: 200, scroll: true, resize: true}
			    
			],
			SteerGlobal.baseLayout.GetWrap("center"),
			ResizeEventFired,
			SteerGlobal.baseLayout);
			
		SteerGlobal.baseInnerLayout.SetWidth('right', SteerGlobal.baseLayout.GetWidth("center") / 1.7);

	 	//Logout div
	 	var elArray = new Array();
	 	elArray.push(CruiseGlobal.CreateElement("DIV", "AccountInfo", CruiseGlobal.GetEl("loginStatusDiv"), "AccountInfoDiv",
	 											{body: SteerGlobal.GetValue("userAccount") + l10nMsg["msg_09"]}));

	 	elArray.push(CruiseGlobal.CreateElement("DIV", "LogoutButton", CruiseGlobal.GetEl("loginStatusDiv")));
		var btnEndWork = new OPButton("LogoutButton", l10nMsg["text_23"], null , SteerLogout);
		
		var elTable = SteerGlobal.MakeLayoutHTMLTable(elArray, CruiseGlobal.GetEl("loginStatusDiv"), "logoutTable", "logoutTableTD");
		elTable.align = "right";

		if (eventLoadBaseLayoutReady)
			eventLoadBaseLayoutReady(SteerGlobal.baseLayout);
		
		// Menu Loading
		LoadMenuBar();
	    LoadLeftMenu();
	},
	LoadLeftCenterLayout : function (panes, arrResizable)
	{
		SteerLayout.InitSteerLayoutCenter();
		function ResizeEventFired (event, args, isInit)
		{
			CruiseLog.Debug("LoadLeftCenterLayout.ResizeEventFired :: Resize event fired");
			document.getElementById("DataListSection").style.height = (SteerGlobal.baseInnerLayout.GetHeight("center") - 108).toString() + "px";
			//Resize Logic needed	
		}

		if (!panes)
			panes = new Array();
		panes.push({ position: 'center', body: 'innerLeftCenter', gutter: '0 0 0 0', scroll: true, resize: false});
		
	    SteerGlobal.leftCenterLayout = new OPLayout ("leftCenterLayout",
			panes,
	        SteerGlobal.baseInnerLayout.GetWrap("center"),
	        ResizeEventFired,
	        SteerGlobal.baseInnerLayout);
	        
	    ResizeEventFired(null, null, true);
	    
	    SteerGlobal.SteerPageResourceMan.Add("leftCenterLayout", SteerGlobal.leftCenterLayout);
	    SteerGlobal.SteerPageTimer.RemoveAllInterval();
	},
	LoadRightCenterLayout : function (panes, arrResizable)
	{
		SteerLayout.InitSteerLayoutRight();
		function ResizeEventFired (event, args, isInit)
		{
			CruiseLog.Debug("LoadRightCenterLayout.ResizeEventFired :: Resize event fired");
			var manipulationDiv = document.getElementById("ManipulationSectionForList");
			if (manipulationDiv){
				manipulationDiv.style.height = (SteerGlobal.baseInnerLayout.GetHeight("center") - 108).toString() + "px";
			}
			//Resize Logic needed	
		}

		if (!panes)
			panes = new Array();
		panes.push({ position: 'center', body: 'innerRightCenter', gutter: '0 0 0 0', scroll: true, resize: false});
		
	    SteerGlobal.rightCenterLayout = new OPLayout ("rightCenterLayout",
			panes,
	        SteerGlobal.baseInnerLayout.GetWrap("right"),
	        ResizeEventFired,
	        SteerGlobal.baseInnerLayout);
	        
	    ResizeEventFired(null, null, true);
	    
	    SteerGlobal.SteerPageResourceMan.Add("rightCenterLayout", SteerGlobal.rightCenterLayout);
	    SteerGlobal.SteerHandleTimer.RemoveAllInterval();
	},
	CommonInnerLeft : function () {
		var newDiv = CruiseGlobal.CreateElement("div", "innerLeftCenter");
		CruiseGlobal.CreateElement("div", "LeftPaneNameArea", newDiv, "PaneNameArea");
		CruiseGlobal.CreateElement("div", "DataListActionSection", newDiv, "DataListAction");
		CruiseGlobal.CreateElement("div", "DataListSection", newDiv, "DataListSection");
	},
	LoadDefaultRightLayout : function (config) {
		SteerGlobal.SteerPageResourceMan.Remove("rightCenterLayout");
		
		var newDiv = CruiseGlobal.CreateElement("div", "innerRightCenter");
		CruiseGlobal.CreateElement("div", "RightPaneNameArea", newDiv, "PaneNameArea");
		var actionPane = CruiseGlobal.CreateElement("div", "DataHandlerActionSection", newDiv, "DataHandlerActionSection");
		var basePane = null;
		if (config != null && config.isForList){
			basePane = CruiseGlobal.CreateElement("div", "ManipulationSectionForList", newDiv, "ManipulationSection");
		}else{
			basePane = CruiseGlobal.CreateElement("div", "ManipulationSection", newDiv, "ManipulationSection", {paddingBottom: "10px"});
		}
		var bottomPane = CruiseGlobal.CreateElement("div", "BottomSection", newDiv, "BottomSection");
		
		if (config.arrPaneText == null){
			config.arrPaneText = [];
		}
		
		CruiseGlobal.SetHTML("RightPaneNameArea", CruiseGlobal.ToL10NMsg(SteerGlobal.GetPaneText(config.paneCode), config.arrPaneText), true);
		
		SteerLayout.LoadRightCenterLayout();
		
		return [actionPane, basePane, bottomPane];
	},
	LoadServerCategorySelect : function (id, targetDiv, keyCallback, isIncludeAll)
	{
		var select = CruiseGlobal.CreateElement("SELECT", id, targetDiv);
		var objCategory = SteerGlobal.GetValue("serverCategory");
		
		if (isIncludeAll == null || isIncludeAll)
			CruiseGlobal.CreateElement("OPTION", null, select, null, {value: -1, body: l10nMsg["text_31"]});
		
		for (var i = 0; i < objCategory.length - 1; i++){
			CruiseGlobal.CreateElement("OPTION", null, select, null, {value: Number(objCategory[i].categoryIDint), body: objCategory[i].serverName});
		}
		
		var selectKeyListener = new CruiseEvent.CreateKeyListener (select, 13, keyCallback, this, false, false, this);
		selectKeyListener.enable();		
	}
}