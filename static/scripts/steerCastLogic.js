/*==================================
    
    Steer Cast Scripts
    By Daesup, Lee
        
	* Example:
		this.GetFunctionList = function (action, event, obj)
		{
			var columns = [
				{key:"globalUniqueFunctionIDint", label:"GUFID", sortable:false},
				{key:"serverType", label:"서버타입", sortable:false}
				//... more columns
			];
			
			this.GetFunctionInfo = function (selectedValues)
			{
			    var msgBox = new OPMsgBox ("steerGetFunctionInfo", "steerGetFunctionInfo: " + selectedValues[0].globalUniqueFunctionIDint, "Row Selected");
			    msgBox.Show();
			}
			
			LoadCenter3PaneLayout();
			this.paginator = new OPPaginator("DataListPaginateSection", 20, true);
			new OPDataTable("getFunctionList", "/ajaxHandler?", columns, "DataListSection", this.GetFunctionInfo, null, this.paginator);	
		}
====================================*/

var _SteerCastLogic = function () {};
var SteerCastLogic = new _SteerCastLogic();

/////////////////////////////////
// Common Functions
/////////////////////////////////

_SteerCastLogic.prototype.CastProcessFormatter = function(elTr, oRecord)
{
	oRecord.setData('serverType', SteerGlobal.GetCodeText('serverType', oRecord.getData('serverType')));
	oRecord.setData('calleeServerType', SteerGlobal.GetCodeText('serverType', oRecord.getData('calleeServerType')));
	oRecord.setData('callerServerType', SteerGlobal.GetCodeText('serverType', oRecord.getData('callerServerType')));
	
	oRecord.setData('requireSessionFlag', SteerGlobal.GetCodeText('requireSessionFlag', oRecord.getData('requireSessionFlag')));
	oRecord.setData('userGroupUseFlag', SteerGlobal.GetCodeText('userGroupUseFlag', oRecord.getData('userGroupUseFlag')));
	oRecord.setData('allowMultipleLoginFlag', SteerGlobal.GetCodeText('allowMultipleLoginFlag', oRecord.getData('allowMultipleLoginFlag')));
	oRecord.setData('functionGroupUseFlag', SteerGlobal.GetCodeText('functionGroupUseFlag', oRecord.getData('functionGroupUseFlag')));
	oRecord.setData('displayGroupUseFlag', SteerGlobal.GetCodeText('displayGroupUseFlag', oRecord.getData('displayGroupUseFlag')));
	
	oRecord.setData('userState', SteerGlobal.GetCodeText('userState', oRecord.getData('userState')));
	oRecord.setData('actionType', SteerGlobal.GetCodeText('actionType', oRecord.getData('actionType')));
	oRecord.setData('executionState', SteerGlobal.GetCodeText('executionState', oRecord.getData('executionState')));
	oRecord.setData('displayGroupType', SteerGlobal.GetCodeText('displayGroupType', oRecord.getData('displayGroupType')));
	oRecord.setData('castState', SteerGlobal.GetCodeText('castState', oRecord.getData('castState')));
	
	oRecord.setData('executionTime', CruiseGlobal.GetLocalTimeString(oRecord.getData('executionTime')));
	oRecord.setData('lastUpdateTime', CruiseGlobal.GetLocalTimeString(oRecord.getData('lastUpdateTime')));
	oRecord.setData('actionTime', CruiseGlobal.GetLocalTimeString(oRecord.getData('actionTime')));
	
    return true;
}; 

_SteerCastLogic.prototype.GetColumns = function(key)
{
	switch (key)
	{
		case "getRecvCastListBySession":
			return [
				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:true},
				    {key:"casterUserIDstr", label:l10nMsg["col_casterUserIDstr"], sortable:true, resizeable: true},
				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:true},
				    {key:"castTargetUserGroupIDstr", label:l10nMsg["col_castTargetUserGroupIDstr"], sortable:true, resizeable: true},
				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				    {key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 100},
				    {key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 100},
				    {key:"castState", label:l10nMsg["col_castState"], sortable:true},
				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:true},
				    {key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:true}
					];
		case "getCastDelegatableListBySession":
			return [
				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:true},
				    {key:"casterUserIDstr", label:l10nMsg["col_casterUserIDstr"], sortable:true, resizeable: true},
				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:true},
				    {key:"castTargetUserGroupIDstr", label:l10nMsg["col_castTargetUserGroupIDstr"], sortable:true, resizeable: true},
				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:true},
				    {key:"functionName", label:l10nMsg["col_functionName"], sortable:true, resizeable: true, width: 100},
				    {key:"displayName", label:l10nMsg["col_displayName"], sortable:true, resizeable: true, width: 100},
				    {key:"castState", label:l10nMsg["col_castState"], sortable:true},
				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:true},
				    {key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:true}
					];
			
//		case "getCastCreatedListBySession":
//			return [
//				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:false},
//				    {key:"castTargetUserGroupIDint", label:l10nMsg["col_castTargetUserGroupIDint"], sortable:false},
//				    {key:"executeUserGroupIDint", label:l10nMsg["col_executeUserGroupIDint"], sortable:false},
//				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
//				    {key:"castState", label:l10nMsg["col_castState"], sortable:false},
//				    {key:"castComment", label:l10nMsg["col_castComment"], sortable:false},
//				    {key:"arguments", label:l10nMsg["col_arguments"], sortable:false, width: 100, resizeable: true},
//				    {key:"executorUserIDint", label:l10nMsg["col_executorUserIDint"], sortable:false},
//				    {key:"executionTime", label:l10nMsg["col_executionTime"], sortable:false},
//				    {key:"auditorUserIDint", label:l10nMsg["col_auditorUserIDint"], sortable:false},
//				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:false},
//				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:false},
//				    {key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:false}  
//					];
//		case "getCastDelegatedListBySession":
//			return [
//				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:false},
//				    {key:"casterUserIDint", label:l10nMsg["col_casterUserIDint"], sortable:false},
//				    {key:"castTargetUserGroupIDint", label:l10nMsg["col_castTargetUserGroupIDint"], sortable:false},
//				    {key:"executeUserGroupIDint", label:l10nMsg["col_executeUserGroupIDint"], sortable:false},
//				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
//				    {key:"castState", label:l10nMsg["col_castState"], sortable:false},
//				    {key:"castComment", label:l10nMsg["col_castComment"], sortable:false},
//				    {key:"arguments", label:l10nMsg["col_arguments"], sortable:false, width: 100, resizeable: true},
//				    {key:"executorUserIDint", label:l10nMsg["col_executorUserIDint"], sortable:false},
//				    {key:"executionTime", label:l10nMsg["col_executionTime"], sortable:false},
//				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:false},
//				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:false},
//				    {key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:false}   
//					];
//		case "getCastDelegatableListBySession":
//			return [
//				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:false},
//				    {key:"casterUserIDint", label:l10nMsg["col_casterUserIDint"], sortable:false},
//				    {key:"castTargetUserGroupIDint", label:l10nMsg["col_castTargetUserGroupIDint"], sortable:false},
//				    {key:"executeUserGroupIDint", label:l10nMsg["col_executeUserGroupIDint"], sortable:false},
//				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
//				    {key:"castState", label:l10nMsg["col_castState"], sortable:false},
//				    {key:"castComment", label:l10nMsg["col_castComment"], sortable:false},
//				    {key:"arguments", label:l10nMsg["col_arguments"], sortable:false, width: 100, resizeable: true},
//				    {key:"executorUserIDint", label:l10nMsg["col_executorUserIDint"], sortable:false},
//				    {key:"executionTime", label:l10nMsg["col_executionTime"], sortable:false},
//				    {key:"auditorUserIDint", label:l10nMsg["col_auditorUserIDint"], sortable:false},
//				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:false},
//				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:false},
//				    {key:"dangerLevel", label:l10nMsg["col_dangerLevel"], sortable:false} 
//					];
//		case "getCastExecutionListBySession":
//			return  [
//					{key:"actionTime", label:l10nMsg["col_actionTime"], sortable:false},
//				    {key:"castIDint", label:l10nMsg["col_castIDint"], sortable:false},
//				    {key:"casterUserIDint", label:l10nMsg["col_casterUserIDint"], sortable:false},
//				    {key:"castTargetUserGroupIDint", label:l10nMsg["col_castTargetUserGroupIDint"], sortable:false},
//				    {key:"executeUserGroupIDint", label:l10nMsg["col_executeUserGroupIDint"], sortable:false},
//				    {key:"globalUniqueFunctionIDint", label:l10nMsg["col_globalUniqueFunctionIDint"], sortable:false},
//				    {key:"arguments", label:l10nMsg["col_arguments"], sortable:false, width: 100, resizeable: true},
//				    {key:"results", label:l10nMsg["col_results"], sortable:false, width: 100, resizeable: true},
//				    {key:"actionMemo", label:l10nMsg["col_actionMemo"], sortable:false},
//				    {key:"castState", label:l10nMsg["col_castState"], sortable:false},
//				    {key:"castComment", label:l10nMsg["col_castComment"], sortable:false},
//				    {key:"executorUserIDint", label:l10nMsg["col_executorUserIDint"], sortable:false},
//				    {key:"executionTime", label:l10nMsg["col_executionTime"], sortable:false},
//				    {key:"previousCastIDint", label:l10nMsg["col_previousCastIDint"], sortable:false},
//				    {key:"lastUpdateTime", label:l10nMsg["col_lastUpdateTime"], sortable:false}
//					];
	}
};

_SteerCastLogic.prototype.CreateSteerDatatable = function(id, request, columnKey, container, configs, keyColumnIdx, refreshInterval)
{
	var columns = SteerCastLogic.GetColumns(columnKey);
	configs.returnCodeValidator = function (msg){
		if (!SteerGlobal.ValidateResponse(msg)){
			SteerGlobal.SteerPageResourceMan.Remove(id + "_" + container + "_Interval");
			return false;
		}
		return true;
	};
	
    var dt = new OPDataTable(id, request, columns, container, configs);					    								
	dt.SetKeyColumn(columns[keyColumnIdx].key);
	SteerGlobal.SteerPageResourceMan.Add(id + "_" + container, dt);
	
	if (refreshInterval)
	{
		CruiseTimer.AddInterval(id + "_" + container, function () { dt.Refresh(); }, refreshInterval);
		SteerGlobal.SteerPageResourceMan.Add(id + "_" + container + "_Interval", CruiseTimer.GetDestroyInterface(id + "_" + container) );
	}
	return dt;
};

_SteerCastLogic.prototype.CreateHandleSteerDatatable = function(id, request, columnKey, container, configs, keyColumnIdx, refreshInterval)
{
	var columns = SteerCastLogic.GetColumns(columnKey);
	configs.returnCodeValidator = function (msg){
		if (!SteerGlobal.ValidateResponse(msg)){
			SteerGlobal.SteerHandleResourceMan.Remove(id + "_" + container + "_Interval");
			return false;
		}
		return true;
	};
	
    var dt = new OPDataTable(id, request, columns, container, configs);
	dt.SetKeyColumn(columns[keyColumnIdx].key);
	SteerGlobal.SteerHandleResourceMan.Add(id + "_" + container, dt);
	
	if (refreshInterval)
	{
		CruiseTimer.AddInterval(id + "_" + container, function () { dt.Refresh(); }, refreshInterval);
		SteerGlobal.SteerHandleResourceMan.Add(id + "_" + container + "_Interval", CruiseTimer.GetDestroyInterface(id + "_" + container) );
	}
	return dt;
};
