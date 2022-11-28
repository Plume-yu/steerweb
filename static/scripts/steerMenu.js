/*==================================
    
    Steer Menu Scripts
    By Daesup, Lee
        
====================================*/

function LoadFunctionMapping()
{
	document.MenuFunctionMapping = {
		67108878:	{ onclick: { fn: userListHandler.ModifyME, obj: null} },								//내 정보 수정
		67108880:	{ onclick: { fn: executeCastTabHandler.LoadExecCastLayout, obj: null} },				//실행 / 캐스트 가능한 기능 목록
		150994956:	{ onclick: { fn: receivedCastTabHandler.LoadRecvDeleCastLayout, obj: null} },			//받은 / 위임 가능 캐스트 목록
		150994953:	{ onclick: { fn: completedCastTabHandler.LoadCompletedCastLayout, obj: null} },			//처리한 캐스트 목록
		
		67108891:	{ onclick: { fn: serverStatusListHandler.LoadServerStatusListLayout, obj: null} },		//서버 상태 목록
		67108888:	{ onclick: { fn: actionLogTabHandler.LoadActionLogLayout, obj: null} },							//액션 로그 목록
		67108901:	{ onclick: { fn: dangerLevelActionLogListHandler.LoadServerActionLogListLayout, obj: null} },	//감사 로그 목록
		67108910:	{ onclick: { fn: serverCategoryListHandler.LoadServerCategoryListLayout, obj: null} },	//서버 카테고리 목록
		150994959:	{ onclick: { fn: castTabHandler.LoadCastLayout, obj: null} },							//캐스트 목록
		50331669:	{ onclick: { fn: connectedServerListHandler.LoadServerListLayout, obj: null} },			//서버 접속 목록
		
		587202563:	{ onclick: { fn: getPageServerStateHandler.LoadServerListLayout, obj: null} },	//서버 상태 조회
		587202564:	{ onclick: { fn: getPageServerReportHandler.LoadServerListLayout, obj: null} },//서버 리포트 조회
		
		67108949:	{ onclick: { fn: importDataHandler.LoadImportLayout, obj: null} },						//가져오기
		67108950:	{ onclick: { fn: exportDataHandler.LoadExportLayout, obj: null} },						//내보내기
		67108951:	{ onclick: { fn: ImportLangHandler.LoadImportLanguageDataLayout, obj: null} },			//언어 데이터 가져오기
		67108952:	{ onclick: { fn: ExportLangHandler.LoadExportLanguageDataLayout, obj: null} },			//언어 데이터 내보내기
		
		67108869:	{ onclick: { fn: userListHandler.CreateUser, obj: null} },								//사용자 생성
		67108885:	{ onclick: { fn: userListHandler.GetUserList, obj: null} },								//사용자 목록 보기
		
		67108870:	{ onclick: { fn: userGroupListHandler.CreateUserGroup, obj: null} },					//사용자 그룹 생성
		67108886:	{ onclick: { fn: userGroupListHandler.GetUserGroupList, obj: null} },					//사용자 그룹 목록 보기
		
		67108865:	{ onclick: { fn: functionListHandler.CreateFunction, obj: null} },						//기능 생성
		67108879:	{ onclick: { fn: functionListHandler.GetFunctionList, obj: null} },						//기능 목록 보기
		
		67108867:	{ onclick: { fn: functionGroupListHandler.CreateFunctionGroup, obj: null} },			//기능 그룹 생성
		67108897:	{ onclick: { fn: functionGroupListHandler.GetFunctionGroupList, obj: null} },			//기능 그룹 목록 보기
		
		67108932:	{ onclick: { fn: displayGroupListHandler.CreateDisplayGroup, obj: null} },				//디스플레이 그룹 생성
		67108911:	{ onclick: { fn: displayGroupListHandler.GetDisplayGroupList, obj: null} },				//디스플레이 그룹 목록 보기		
		
		67108871:	{ onclick: { fn: userAndUserGroupLinkHandler.LoadUserListLayout, obj: null} },			//사용자 - 사용자 그룹 연결
		67108939:	{ onclick: { fn: userGroupAndUserLinkHandler.LoadUserGroupListLayout, obj: null} },		//사용자 그룹 - 사용자 연결
		
		67108868:	{ onclick: { fn: functionGroupAndFunctionLinkHandler.LoadFunctionGroupListLayout, obj: null} },	//기능 그룹 - 실행 기능 연결
		67108941:	{ onclick: { fn: functionAndFunctionGroupLinkHandler.LoadFunctionListLayout, obj: null} },		//실행 기능 - 기능 그룹 연결
		
		67108943:	{ onclick: { fn: castFunctionGroupAndFunctionLinkHandler.LoadFunctionGroupListLayout, obj: null} },	//기능 그룹 - 캐스트 기능 연결
		67108945:	{ onclick: { fn: castFunctionAndFunctionGroupLinkHandler.LoadFunctionListLayout, obj: null} },		//캐스트 기능 - 기능 그룹 연결	
		
		67108930:	{ onclick: { fn: displayGroupAndFunctionLinkHandler.LoadDisplayGroupListLayout, obj: null} },		//디스플레이 그룹 - 기능 연결
		67108947:	{ onclick: { fn: functionAndDisplayGroupLinkHandler.LoadFunctionListLayout, obj: null} },			//기능 - 디스플레이 그룹 연결	
	};
}

CruiseEvent.onDOMReady(function() {
	LoadFunctionMapping();
});

function LoadMenuBar ()
{
    var aSubmenuData = [];
    var callback = function (o, messages) {
		menuData = messages.returnTables[0];

		if (menuData.length <= 0)
		{
			var msgBox = new OPMsgBox ("noAvailMenu",
		    							l10nMsg["msg_11"],
		    							l10nMsg["text_07"],
		    							{isFixedCenter: true,
		    							isDraggable: false,
		    							isClose: false,
		    							isModal: true
		             					});
		             					
			var msgBoxHandler = function() {
				msgBox.OK();
				window.location = "./";
			};
				
		    msgBox.SetButtons([	{ text: l10nMsg["text_02"], handler:msgBoxHandler, isDefault:true }]);
		    msgBox.SetICON("alarm");
		    msgBox.Show();
		}
		
		topMenuBase = document.getElementById("steerTopMenuBase");
		var itemdata = [];
		for (var i = 0; i < menuData.length; i++){			
			itemdata.push(YAHOO.lang.merge({ text: menuData[i].displayName }, TopMenuBehavior(menuData[i].globalUniqueFunctionIDint)));
			if (menuData[i+1] == null || menuData[i+1].displayGroupIDint != menuData[i].displayGroupIDint){
				aSubmenuData.push({id: "topMenu" + menuData[i].displayGroupIDint, itemdata: itemdata});
				var elLI = CruiseGlobal.CreateElement("LI", null, topMenuBase, "yuimenubaritem");
				CruiseGlobal.CreateElement("A", null, elLI, "yuimenubaritemlabel",
														{href : "#topMenu" + menuData[i].displayGroupIDint,
														 body : menuData[i].displayGroupName});
				itemdata = [];
			}	
		}
        var menuBar = new OPMenuBar("baseMenuBar", aSubmenuData);
        menuBar.RenderMenu();
    };
    OPAjaxRequest ('GET', "getTopMenuList" , callback);
}

function TopMenuBehavior (gufid)
{
	//hooking function behavior here:
	var behavior = document.MenuFunctionMapping[gufid];
	if (behavior == null) {
		behavior = { onclick: { fn: function (name, event, gufid) { alert("Not implemented! [" + gufid + "]"); }, obj: gufid} };
	}
	return behavior;
}

function LoadLeftMenu ()
{
	var aSubmenuData = [];
    var callback = function (o, messages) {
		menuData = messages.returnTables[0];

		if (menuData.length <= 0) {
			SteerGlobal.InitQuickMenuContainer();
	    	SteerGlobal.baseLayout.GetUnitByPosition('left').collapse();
			return;
		}
		
		var menuItem = [];
		var menuGroup = [];
		var itemdata = [];
		for (var i = 0; i < menuData.length; i++){				
			itemdata.push(YAHOO.lang.merge({ text: menuData[i].displayName }, LeftMenuBehavior(menuData[i].globalUniqueFunctionIDint)));
			if (menuData[i+1] == null || menuData[i+1].displayGroupIDint != menuData[i].displayGroupIDint){
				menuItem.push(itemdata);
				menuGroup.push(menuData[i].displayGroupName);
				itemdata = [];
			}
		}
        var leftMenu = new OPMenu ("steerLeftMenu", "leftMenuDiv", menuItem, menuGroup);
		leftMenu.RenderMenu();
    };

    OPAjaxRequest ('GET', "getLeftMenuList", callback);
}

function LeftMenuBehavior (gufid)
{   
	//hooking function behavior here:
	var behavior = document.MenuFunctionMapping[gufid];
	if (behavior == null) {
		behavior = { onclick: { fn: function () { alert("Not implemented!"); }, obj: null} };
	}
	return behavior;
}