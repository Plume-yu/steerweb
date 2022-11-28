/*==================================
    
       SteerGlobal Scripts
        
====================================*/

CruiseEvent.onDOMReady(function() {
});

var SteerGlobal = {
		
	ValueContainer : {},
	DefaultPaginatorConfig : function () {
		return {
		"customPageLinks" : 5,
		"template" : "{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} {RowsPerPageDropdown}",
		"rowsPerPageOptions" : [10, 30, 50],
		"firstPageLinkLabel" : l10nMsg["text_24"],
		"lastPageLinkLabel" : l10nMsg["text_27"],
		"previousPageLinkLabel" : l10nMsg["text_25"],
		"nextPageLinkLabel" : l10nMsg["text_26"]};
	},
	SetValue : function (key, value)
	{
		SteerGlobal.ValueContainer[key] = value;
	},
	GetValue : function (key)
	{
		return SteerGlobal.ValueContainer[key];
	},
	IndividualData : {
		SteerInfoDialogSize : { width: 800, height: 500 },
		SteerDatatablePageSize : 25,
		DatatablePageSize : 34,
	},
	ShowLoading : function ()
	{
		CruiseGlobal.SHOWLOADING.show();
	},
	NowLoading : function ()
	{
		CruiseGlobal.NOWLOADING.show();
	},
	InitQuickMenuContainer : function ()
	{
		var baseLeft = CruiseGlobal.GetEl("baseLeft");
		CruiseGlobal.CreateElement("DIV", "leftMenuStatus", baseLeft, null, {paddingTop : "1px", body: "<br><center><b>" + l10nMsg["msg_12"] + "</center></b>"});
	},
	ValidateResponse : function (response, config)
	{
		if (response == null || response.returnCode == null){
			return false;
		}
		if (!SteerErrorCode.IsSuccess(response.returnCode))
		{
			if (response.exceptionFlag == 1){
				SHOW_ERROR_PANEL(response);
				return false;
			}

			if (SteerGlobal.GetValue("IsAlreadyShowMsg") == true){
				return;
			}
			
			retCode = response.returnCode;
			var errMsg = SteerErrorCode.GetErrorMsg(retCode);
			var errHeader = l10nMsg["text_07"];
			var rtnFocusID = null;
			
			if (config)
			{
				if (config.errMsg)
					errMsg = config.errMsg;
				if (config.errHeader)
					errHeader = config.errHeader;
				if (config.noMsgBox && retCode != SteerErrorCode.STEERLOGIC_SESSION_EXPIRED)
					return false;
				if (config.exceptionReturnCode)
					for (index in config.exceptionReturnCode)
						if (config.exceptionReturnCode[index] == retCode)
							return true;
							
				if (config.returnFocusID)
					rtnFocusID = config.returnFocusID;
				
				if (config.redirectPage)
					redirectPage = config.redirectPage;
			}

			var msgBox = new OPMsgBox ("ResponseError",
		    							errMsg,
		    							errHeader,
		    							{isFixedCenter: true,
		    							isDraggable: true,
		    							isClose: false,
		    							isModal: true
		             					});
		    
			SteerGlobal.SetValue("IsAlreadyShowMsg", true);
			
			var msgBoxHandler = function(){
				msgBox.OK();
				SteerGlobal.SetValue("IsAlreadyShowMsg", false);
			};
			if (retCode == SteerErrorCode.STEERLOGIC_SESSION_EXPIRED)
			{	
				msgBoxHandler = function() {
					msgBox.OK();
					window.location = "./";
				};
			}
			if (config && config.redirectPage)
			{
				msgBoxHandler = function() {
					msgBox.OK();
					window.location = redirectPage;
				};
			}	

		    msgBox.SetButtons([	{ text: l10nMsg["text_02"], handler:msgBoxHandler, isDefault:true }]);
		    msgBox.SetICON("alarm");
		    msgBox.Show();
		   
		    return false;
		}
		return true;
	},
	SteerHandleResourceMan : new OPResourceManager(),
	SteerPageResourceMan : new OPResourceManager(),
	SteerHandleTimer : CruiseGlobal.GetCruiseTimerInstance(),
	SteerPageTimer : CruiseGlobal.GetCruiseTimerInstance(),
	GetCodeText : function (codeName, value)
	{
		return l10nMsg["code_" + codeName + "_" + value];
	},
	GetPaneText : function (key)
	{
		return l10nMsg["PaneText_" + key.toString() ];
	},
	MakeSearchLayoutHTMLTable : function (arrDivInsideTD, parentDiv)
	{
		var elTable = CruiseGlobal.CreateElement("TABLE", "SearchTable", parentDiv, "searchTable");
		var elTR = CruiseGlobal.CreateElement("TR", "SearchTableTR", elTable);
		
		for (index in arrDivInsideTD)
		{
			var newTD = CruiseGlobal.CreateElement("TD", "SearchTableTD_" + index, elTR, "searchTableTD");
			newTD.appendChild(arrDivInsideTD[index]);
		}
	},
	MakeLayoutHTMLTable : function (arrDivInsideTD, parentDiv, tableClass, tdClass)
	{
		var elTable = CruiseGlobal.CreateElement("TABLE", "HtmlTable", parentDiv, tableClass);
		var elTR = CruiseGlobal.CreateElement("TR", "HtmlTableTR", elTable);
		
		for (index in arrDivInsideTD)
		{
			var newTD = CruiseGlobal.CreateElement("TD", "HtmlTableTD_" + index, elTR, tdClass);
			newTD.appendChild(arrDivInsideTD[index]);
		}
		return elTable;
	},
	MakeLayoutTR_HTML : function (arrHTMLInsideTD, elParentTable)
	{
		var elTR = CruiseGlobal.CreateElement("TR", "HtmlTableTR", elParentTable, "BoxInfoTR");
		for (index in arrHTMLInsideTD)
		{
			var newTD = CruiseGlobal.CreateElement("TD", "HtmlTableTD_" + index, elTR, "BoxInfoTD");
			newTD.innerHTML = arrHTMLInsideTD[index];
		}
		return elTR;
	},
	MakeLayoutTR_INPUT : function (LabelText, htmlTag, elParentTable)
	{
		var elTR = CruiseGlobal.CreateElement("TR", "HtmlTableTR", elParentTable, "BoxInputTR");
		if (LabelText != null){
			var labelTD = CruiseGlobal.CreateElement("TD", "HtmlTableTD_Label", elTR, "BoxInputLabelTD");
			labelTD.innerHTML = LabelText;
		}
		tagTD = CruiseGlobal.CreateElement("TD", "HtmlTableTD_" + htmlTag.id, elTR, "BoxInputTD");
		tagTD.appendChild(htmlTag);
		
		if (LabelText == null) {
			tagTD.colSpan = "2";
		}
		
		return elTR;
	}
};