/*==================================
    
    Steer Mind Scripts
    By Daesup, Lee

	* Example:
		_SteerMindLogic.prototype.GetFunctionList = function (action, event, obj)
		{
			//Initalize & Draw
			SteerGlobal.SteerPageResourceMan.RemoveAll();
			SteerGlobal.SteerHandleResourceMan.RemoveAll();
			SteerLayout.BuildDiv.LoadNormalListLayout();
			
			var dataDT = SteerMindLogic.CreateSteerDatatable("getFunctionList",
															"/ajaxHandler?",
															"getFunctionList",
															"DataListSection",
															{ 	paginator : new OPPaginator("DataListPaginateSection", SteerGlobal.IndividualData.SteerDatatablePageSize, true), 
																l10nObj : l10nMsg,
																formatRow : SteerMindLogic.MindProcessFormatter
															},
															0);
															
			SteerLayout.LoadCenterLayout(null, [dataDT]);
		}
====================================*/

var _SteerMindLogic = function () {};
var SteerMindLogic = new _SteerMindLogic();

/////////////////////////////////
// Common Functions
/////////////////////////////////

_SteerMindLogic.prototype.MindProcessFormatter = function(elTr, oRecord)
{
	oRecord.setData('serverType', SteerGlobal.GetCodeText('serverType', oRecord.getData('serverType')));
	oRecord.setData('category', SteerGlobal.GetCodeText('serverType', oRecord.getData('category')));
	oRecord.setData('calleeServerType', SteerGlobal.GetCodeText('serverType', oRecord.getData('calleeServerType')));
	oRecord.setData('callerServerType', SteerGlobal.GetCodeText('serverType', oRecord.getData('callerServerType')));
	
	oRecord.setData('requireSessionFlag', SteerGlobal.GetCodeText('requireSessionFlag', oRecord.getData('requireSessionFlag')));
	oRecord.setData('userGroupUseFlag', SteerGlobal.GetCodeText('userGroupUseFlag', oRecord.getData('userGroupUseFlag')));
	oRecord.setData('allowMultipleLoginFlag', SteerGlobal.GetCodeText('allowMultipleLoginFlag', oRecord.getData('allowMultipleLoginFlag')));
	oRecord.setData('functionGroupUseFlag', SteerGlobal.GetCodeText('functionGroupUseFlag', oRecord.getData('functionGroupUseFlag')));
	oRecord.setData('functionUseFlag', SteerGlobal.GetCodeText('functionUseFlag', oRecord.getData('functionUseFlag')));
	oRecord.setData('displayGroupUseFlag', SteerGlobal.GetCodeText('displayGroupUseFlag', oRecord.getData('displayGroupUseFlag')));
	
	oRecord.setData('userState', SteerGlobal.GetCodeText('userState', oRecord.getData('userState')));
	oRecord.setData('actionType', SteerGlobal.GetCodeText('actionType', oRecord.getData('actionType')));
	oRecord.setData('executionState', SteerGlobal.GetCodeText('executionState', oRecord.getData('executionState')));
	oRecord.setData('displayGroupType', SteerGlobal.GetCodeText('displayGroupType', oRecord.getData('displayGroupType')));
	oRecord.setData('castState', SteerGlobal.GetCodeText('castState', oRecord.getData('castState')));
	
	oRecord.setData('actionTime', CruiseGlobal.GetLocalTimeString(oRecord.getData('actionTime')));
	oRecord.setData('activityTime', CruiseGlobal.GetLocalTimeString(oRecord.getData('activityTime')));
	
	oRecord.setData('serverState', SteerGlobal.GetCodeText('serverState', oRecord.getData('serverState')));
	
	if (oRecord.getData('userIDstr') == '')
		oRecord.setData('userIDstr', "UNKNOWN");
	if (oRecord.getData('userGroupName') == '')
		oRecord.setData('userGroupName', "UNKNOWN");
	
    return true;
}; 

_SteerMindLogic.prototype.MindProcessColorFormatter = function(elTr, oRecord)
{
	SteerMindLogic.MindProcessFormatter(elTr, oRecord);

	var dangerLevel = oRecord.getData('dangerLevel');
    if (dangerLevel > 0) {
    	elTr.className = 'mark_warning';
    	return true;
    }
    return true;
}; 

_SteerMindLogic.prototype.GetColumns = function(key)
{
	switch (key)
	{
	case "getExecutableFunctionList":
		return [
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:true},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:true},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 200},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 200},
				{key:"functionUseFlag", label:l10nMsg["col_functionUseFlag"], sortable:true}
				];
	case "getCastableFunctionList":
		return [
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:true},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:true},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 200},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 200},
				{key:"functionUseFlag", label:l10nMsg["col_functionUseFlag"], sortable:true}
				];
	case "getServerCategory":
		return [
				{key:"categoryIDint", label:l10nMsg["col_categoryIDint"], sortable:true},
				{key:"serverName", label:l10nMsg["col_serverName"], sortable:true, resizeable: true, width: 200},
				{key:"description", label:l10nMsg["col_description"], sortable:true, resizeable: true, width: 300},
				];
	case "getUserList":
		return [
				{key:"userIDint", label:l10nMsg["col_userIDint"], sortable:true},
				{key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true, width: 150},
				{key:"userName", label:l10nMsg["col_userName"], sortable:true, resizeable: true, width: 150},
				{key:"userState", label:l10nMsg["col_userState"], sortable:true},
				{key:"allowMultipleLoginFlag", label:l10nMsg["col_allowMultipleLoginFlag"], sortable:true}
				];
		
	case "getUserGroupList":
		return [
				{key:"userGroupIDint", label:l10nMsg["col_userGroupIDint"], sortable:true},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:true, resizeable: true, width: 150},
				{key:"auditorUserGroupName", label:l10nMsg["col_auditorUserGroupName"], sortable:true, resizeable: true, width: 100},
				{key:"auditorUserGroupIDint", label:l10nMsg["col_auditorUserGroupIDint"], sortable:true},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:true},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:true, resizeable: true, width: 150},
				{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:true}
				];
		
	case "getFunctionList":
		return [
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:true},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:true},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 150},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 150},
				{key:"functionUseFlag", label:l10nMsg["col_functionUseFlag"], sortable:true},
				{key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:true},
				{key:"requireSessionFlag", label:l10nMsg["col_requireSessionFlag"], sortable:false}
				];
	case "getFunctionGroupList":
		return [
				{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:true},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:true, resizeable: true, width: 250},
				{key:"functionGroupUseFlag", label:l10nMsg["col_functionGroupUseFlag"], sortable:true}
				];
	case "getDisplayGroupList":
		return [
				{key:"displayGroupIDint", label:l10nMsg["col_displayGroupIDint"], sortable:true},
				{key:"serviceName", label:l10nMsg["col_serviceName"], sortable:true},
				{key:"displayGroupName", label:l10nMsg["col_displayGroupName"], sortable:true, resizeable: true, width: 200},
				{key:"displayGroupUseFlag", label:l10nMsg["col_displayGroupUseFlag"], sortable:true},
				{key:"displayGroupType", label:l10nMsg["col_displayGroupType"], sortable:true},
				{key:"displayOrder", label:l10nMsg["col_displayOrder"], sortable:true},
				{key:"displayAdditionalInfo", label:l10nMsg["col_displayAdditionalInfo"], sortable:true}
				];
	case "getSimpleFunctionList":
		return [
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:true},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:true},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 130},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 130},
				{key:"functionUseFlag", label:l10nMsg["col_functionUseFlag"], sortable:true},
				{key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:true}
				];
	case "displayGroupAndFunctionsDataTable":
		return [
		        {key:"displayGroupIDint", label:l10nMsg["col_displayGroupIDint"], sortable:false},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
				{key:"displaySubOrder", label:l10nMsg["col_displaySubOrder"], sortable:false},
				{key:"displayFunctionAdditionalInfo", label:l10nMsg["col_displayFunctionAdditionalInfo"], sortable:false},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:false},
				{key:"serverName", label:l10nMsg["col_serverName"], sortable:false},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:false},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:false}
				];
	case "functionGroupAndUserGroupsDataTable":
		return [
				{key:"userGroupIDint", label:l10nMsg["col_userGroupIDint"], sortable:false},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:false},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:false}
		        ];
	case "functionGroupAndFunctionsDataTable":
		return [{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:false},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
				{key:"actionType", label:l10nMsg["col_actionType"], sortable:false},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:false},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:false},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:false}];
		
	case "userGroupAndFunctionGroupDataTable":
		return [{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:false},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:false},
				{key:"functionGroupUseFlag", label:l10nMsg["col_functionGroupUseFlag"], sortable:false}];
		
	case "userGroupAndAuditorUserGroupDataTable":
		return [{key:"userGroupIDint", label:l10nMsg["col_userGroupIDint"], sortable:false},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:false},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:false}];
		
	case "userAndUserGroupsDataTable":
		return [{key:"userIDint", label:l10nMsg["col_userIDint"], sortable:false},
				{key:"userGroupIDint", label:l10nMsg["col_userGroupIDint"], sortable:false},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:false},
				{key:"auditorUserGroupIDint", label:l10nMsg["col_auditorUserGroupIDint"], sortable:false},
				{key:"auditorUserGroupName", label:l10nMsg["col_auditorUserGroupName"], sortable:false},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:false},
				{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:false},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:false}];
		
	case "functionAndFunctionGroupsDataTable":
		return [{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
		        {key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:false},
		        {key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:false},
		        {key:"actionType", label:l10nMsg["col_actionType"], sortable:false}];
		
	case "getSimpleFunctionDisplayList":
		return [
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				{key:"serviceName", label:l10nMsg["col_serviceName"], sortable:true},
				{key:"displaySubOrder", label:l10nMsg["col_displaySubOrder"], sortable:true},
				{key:"serverType", label:l10nMsg["col_serverType"], sortable:true},
				{key:"functionIDint", label:l10nMsg["col_functionIDint"], sortable:true},
				{key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 130},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 130},
				{key:"functionUseFlag", label:l10nMsg["col_functionUseFlag"], sortable:true},
				{key:"displayAdditionalInfo", label:l10nMsg["col_displayAdditionalInfo"], sortable:true}
				];
		
	case "getSimpleDisplayGroupFunctionList":
		return [
				{key:"displayGroupIDint", label:l10nMsg["col_displayGroupIDint"], sortable:true},
				{key:"serviceName", label:l10nMsg["col_serviceName"], sortable:true},
				{key:"displayGroupName", label:l10nMsg["col_displayGroupName"], sortable:true, resizeable: true, width: 200},
				{key:"displayGroupUseFlag", label:l10nMsg["col_displayGroupUseFlag"], sortable:true},
				{key:"displayGroupType", label:l10nMsg["col_displayGroupType"], sortable:true},
				{key:"displayOrder", label:l10nMsg["col_displayOrder"], sortable:true},
				{key:"displaySubOrder", label:l10nMsg["col_displaySubOrder"], sortable:true},
				{key:"displayAdditionalInfo", label:l10nMsg["col_displayAdditionalInfo"], sortable:true},
				{key:"displayFunctionAdditionalInfo", label:l10nMsg["col_displayFunctionAdditionalInfo"], sortable:true}
				];
	case "getServerStatus":
		return [
				{key:"globalUniqueServerIDint", label:l10nMsg["col_globalUniqueServerIDint"], sortable:true},
				{key:"activityTime", label:l10nMsg["col_activityTime"], sortable:true},
				{key:"infoText", label:l10nMsg["col_infoText"], sortable:true},
				{key:"infoInt1", label:l10nMsg["col_infoInt1"], sortable:true},
				{key:"infoInt2", label:l10nMsg["col_infoInt2"], sortable:true}
				];
	case "getActionLogListByDangerLevel":
		return [
				{key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true},
				{key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:true},
				{key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true},
				{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true},
				{key:"actionType", label:l10nMsg["col_actionType"], sortable:true},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true}
				];
	case "selectedFunctionGroupDataTable":
		return [{key:"functionGroupIDint", label:l10nMsg["col_functionGroupIDint"], sortable:false},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:false},
				{key:"functionGroupUseFlag", label:l10nMsg["col_functionGroupUseFlag"], sortable:false}];
	case "getConnectedServerInfo":
		return [
				{key:"category", label:l10nMsg["col_serverType"], sortable:false},
				{key:"number", label:l10nMsg["col_serverNumber"], sortable:false},
				{key:"sendCount", label:l10nMsg["col_sendCount"], sortable:false},
				{key:"receiveCount", label:l10nMsg["col_receiveCount"], sortable:false},
				{key:"connectTime", label:l10nMsg["col_connectTime"], sortable:false}
				];
	case "selectedAuditorUserGroupDataTable":
		return [{key:"userGroupIDint", label:l10nMsg["col_userGroupIDint"], sortable:false},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:false},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:false}];
	
	case "getAllActionLogList":
		return [
				{key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true},
				{key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true},
				{key:"actionType", label:l10nMsg["col_actionType"], sortable:true},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true, resizeable: true},
				{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true, resizeable: true, width: 150}
				];
	case "getServerCategoryActionLogList":
		return [
		        {key:"callerServerType", label:l10nMsg["col_callerServerType"], sortable:true, resizeable: true},
		        {key:"calleeServerType", label:l10nMsg["col_calleeServerType"], sortable:true, resizeable: true},
				{key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 150},
				{key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true},
				{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true, resizeable: true, width: 150},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true, resizeable: true}
				];
	case "getTermActionLogList":
		return [
				{key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
				{key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 150},
				{key:"callerServerType", label:l10nMsg["col_callerServerType"], sortable:true, resizeable: true},
		        {key:"calleeServerType", label:l10nMsg["col_calleeServerType"], sortable:true, resizeable: true},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true, resizeable: true},
				{key:"actionType", label:l10nMsg["col_actionType"], sortable:true},
				{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true, resizeable: true, width: 150},
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:true, resizeable: true, width: 150}
				];
	case "getUserActionLogList":
		return [
		        {key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
		        {key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true},
				{key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 150},
				{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true, resizeable: true, width: 150},
				{key:"actionType", label:l10nMsg["col_actionType"], sortable:true},
				{key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true, resizeable: true}
				];
		
	case "getUserGroupActionLogList":
		return [
		        {key:"actionLogIDint", label:l10nMsg["col_actionLogIDint"], sortable:true},
		        {key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:true, resizeable: true, width: 150},
		        {key:"userIDstr", label:l10nMsg["col_userIDstr"], sortable:true, resizeable: true},
		        {key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 150},
		        {key:"actionTime", label:l10nMsg["col_actionTime"], sortable:true, resizeable: true, width: 150},
		        {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true, resizeable: true}
				];
	case "getImportFunctionGroupList":
		return [
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:true, resizeable: true, width: 250},
				{key:"functionGroupUseFlag", label:l10nMsg["col_functionGroupUseFlag"], sortable:true}
				];
	case "getImportUserGroupList":
		return [
				{key:"userGroupName", label:l10nMsg["col_userGroupName"], sortable:true, resizeable: true, width: 150},
				{key:"auditorUserGroupName", label:l10nMsg["col_auditorUserGroupName"], sortable:true, resizeable: true, width: 100},
				{key:"userGroupUseFlag", label:l10nMsg["col_userGroupUseFlag"], sortable:true},
				{key:"functionGroupName", label:l10nMsg["col_functionGroupName"], sortable:true, resizeable: true, width: 150}
				];
	case "getPageServerState":
		return [
		        {key:"index", label:l10nMsg["col_index"], hidden: true},
				{key:"serverCategory", label:l10nMsg["col_serverType"], sortable:false, resizeable: true},
				{key:"serverNumber", label:l10nMsg["col_serverNumber"], sortable:false, resizeable: true},
				{key:"serverState", label:l10nMsg["col_serverState"], sortable:false, resizeable: true},
				{key:"serverStateUpdateTime", label:l10nMsg["col_serverStateUpdateTime"], sortable:false, resizeable: true},
				{key:"pythonVersion", label:l10nMsg["col_pythonVersion"], sortable:false, resizeable: true},
				{key:"osVersion", label:l10nMsg["col_osVersion"], sortable:false, resizeable: true},
				{key:"execPath", label:l10nMsg["col_execPath"], sortable:false, resizeable: true},
				{key:"logPath", label:l10nMsg["col_logPath"], sortable:false, resizeable: true},
				{key:"connectionInfo", label:l10nMsg["col_connectionInfo"], sortable:false, resizeable: true},
				];
	case "getPageServerReport":
		return [
		        {key:"index", label:l10nMsg["col_index"], hidden: true},
				{key:"serverCategory", label:l10nMsg["col_serverType"], sortable:false, resizeable: true},
				{key:"serverNumber", label:l10nMsg["col_serverNumber"], sortable:false, resizeable: true},
				{key:"systemCPU", label:l10nMsg["col_systemCPU"], sortable:false, resizeable: true},
				{key:"processCPU", label:l10nMsg["col_processCPU"], sortable:false, resizeable: true},
				{key:"systemMemory", label:l10nMsg["col_systemMemory"], sortable:false, resizeable: true, width: 150},
				{key:"processMemory", label:l10nMsg["col_processMemory"], sortable:false, resizeable: true, width: 150},
				];
	}
};

_SteerMindLogic.prototype.CreateSteerDatatable = function(id, request, columnKey, container, configs, keyColumnIdx, refreshInterval)
{
	var columns = SteerMindLogic.GetColumns(columnKey);
	configs.returnCodeValidator = function (msg){
		if (!SteerGlobal.ValidateResponse(msg)){
			SteerGlobal.SteerPageResourceMan.Remove(id + "_" + container + "_Interval");
			return false;
		}
		return true;
	};
	
    var dt = new OPDataTable(id, request, columns, container, configs);
    
    if (!CruiseValidation.IsArray(keyColumnIdx)){
    	dt.SetKeyColumn(columns[keyColumnIdx].key);
    } else {
    	dt.SetKeyColumnIdxs(columns, keyColumnIdx);
    }
    
	SteerGlobal.SteerPageResourceMan.Add(id + "_" + container, dt);
	
	if (refreshInterval)
	{
		SteerGlobal.SteerPageTimer.AddInterval(id + "_" + container, function () { dt.Refresh(); }, refreshInterval);
		SteerGlobal.SteerPageResourceMan.Add(id + "_" + container + "_Interval", SteerGlobal.SteerPageTimer.GetDestroyInterface(id + "_" + container) );
	}
	return dt;
};

_SteerMindLogic.prototype.CreateHandleSteerDatatable = function(id, request, columnKey, container, configs, keyColumnIdx, refreshInterval)
{
	var columns = SteerMindLogic.GetColumns(columnKey);
	configs.returnCodeValidator = function (msg){
		if (!SteerGlobal.ValidateResponse(msg)){
			SteerGlobal.SteerHandleResourceMan.Remove(id + "_" + container + "_Interval");
			return false;
		}
		return true;
	};
	
    var dt = new OPDataTable(id, request, columns, container, configs);
    if (!CruiseValidation.IsArray(keyColumnIdx)){
    	dt.SetKeyColumn(columns[keyColumnIdx].key);
    } else {
    	dt.SetKeyColumnIdxs(columns, keyColumnIdx);
    }
	SteerGlobal.SteerHandleResourceMan.Add(id + "_" + container, dt);
	
	if (refreshInterval)
	{
		SteerGlobal.SteerHandleTimer.AddInterval(id + "_" + container, function () { dt.Refresh(); }, refreshInterval);
		SteerGlobal.SteerHandleResourceMan.Add(id + "_" + container + "_Interval", SteerGlobal.SteerHandleTimer.GetDestroyInterface(id + "_" + container) );
	}
	return dt;
};
