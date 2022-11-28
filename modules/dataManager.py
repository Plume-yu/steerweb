# _*_ coding: utf-8 _*_
from steerDataManager import ReturnData
from steerCodeHandler import ReturnDataType
from SteerErrorCode import SteerErrorCode
from SteerAdminReturnObject import ReturnObject

#===============================
#
# Ajax DataManager
# by Daesup, Lee
#
#===============================

#===============================
class DataManager ():
    listColumns = {
                    'getTopMenuList' : ('displayGroupIDint', 'displayGroupName', 'globalUniqueFunctionIDint', 'functionName', 'displayName', 'displayGroupType',
                                        'dangerLevel', 'displayOrder', 'displaySubOrder', 'displayAdditionalInfo' ),
                    'getCastListBySession' : ('castIDint','casterUserIDint','castTargetUserGroupIDint','executeUserGroupIDint','globalUniqueFunctionIDint',
                                              'castState','castComment','arguments','executorUserIDint','executionTime','previousCastIDint','lastUpdateTime','dangerLevel'),
                    'getCastCreatedListBySession' : ('castIDint','casterUserIDint','castTargetUserGroupIDint','executeUserGroupIDint','globalUniqueFunctionIDint','castState','castComment','arguments','executorUserIDint','executionTime','auditorUserIDint','previousCastIDint','lastUpdateTime','dangerLevel'),
                    'getCastDelegatableListBySession' : ('castIDint','userGroupName','userIDint','casterUserIDint','castTargetUserGroupIDint','executeUserGroupIDint','globalUniqueFunctionIDint','castState','castComment','arguments','executorUserIDint','executionTime','auditorUserIDint','previousCastIDint','lastUpdateTime','dangerLevel'),
                    'getCastDelegatedListBySession' : ('castIDint','casterUserIDint','castTargetUserGroupIDint','executeUserGroupIDint','globalUniqueFunctionIDint','castState','castComment','arguments','executorUserIDint','executionTime','previousCastIDint','lastUpdateTime','dangerLevel'),
                    'getCastExecutionListBySession' : ('actionTime','castIDint','casterUserIDint','castTargetUserGroupIDint','executeUserGroupIDint','globalUniqueFunctionIDint','arguments','results','actionMemo','castState','castComment','executorUserIDint','executionTime','previousCastIDint','lastUpdateTime'),
                    'getFunctionList' : ('globalUniqueFunctionIDint','serverType','functionIDint','functionName','dangerLevel','requireSessionFlag','arguments','results','functionDescription','displayName','displaySortOrder'),
                    'getFunctionListBySessionAndServerType' : ('userIDint','userGroupIDint','functionGroupIDint','actionType','globalUniqueFunctionIDint','functionName'),
                    'getFunctionGroupsList' : ('functionGroupIDint','functionGroupName','functionGroupUseFlag'),
                    'getFunctionGroupAndFunctionLink' : ('functionGroupIDint','functionGroupName', 'globalUniqueFunctionIDint', 'functionName', 'actionType'),
                    'getFunctionExecutionListBySession' : ('actionUserIDint','actionTime','globalUniqueFunctionIDint','arguments','actionMemo','serverType','functionIDint','dangerLevel'),
                    'getUserList' : ('userIDint','userIDstr','userName','userState','allowMultipleLoginFlag'),
                    'getUserGroupList' : ('userGroupIDint','userGroupName','auditorUserGroupIDint','userGroupUseFlag','functionGroupIDint'),
                    'getUserGroupAndUserLink' : ('userIDint','userIDstr','userName', 'userGroupIDint','userGroupName','auditorUserGroupIDint','functionGroupIDint'),
                    'getActionLogList' : ('actionLogIDint','actionUserIDint','actionTime','actionType','calleeServerType','callerServerType','globalUniqueFunctionIDint','castIDint','actionMemo'),
                    'getServerActivityInfoList' : ('globalUniqueServerIDint','activityTime','infoText','infoInt1','infoInt2'),
                    'getFunctionCallerListAll' : ('globalUniqueFunctionIDint','calleeServerType','callerServerType','callerServerTypeName'),
                    'getActionLogListByDangerLevel' : ('actionLogIDint', 'displayName', 'dangerLevel', 'actionUserIDint','actionTime','actionType','calleeServerType','callerServerType','globalUniqueFunctionIDint','castIDint','actionMemo')
                  }
    
    
    def ConvertListToKeyDatatable(self, dataTable, key):
        newDatatable = []
        for row in dataTable:
            newRow = dict(zip(self.listColumns[key], row))
            newDatatable.append(newRow)
        
        return newDatatable

    def _GetListDefault (self, request, key, executeFunction, postDataSetProcess = None):
        startPos = int(request.GET['startIndex'])
        pageRow = int(request.GET['results'])
        dir = request.GET['dir']
        sort = request.GET['sort']
        
        dataSet = None
        msg = executeFunction(startPos, pageRow, dir, sort)
        
        errCode = msg.getReturnCode()
        retData = ReturnData(ReturnDataType().LISTONLY, errCode, msg)
        
        retObj = ReturnObject()
        if retData.IsSuccess():
            retObj.SetReturnCode(SteerErrorCode.success)
            if postDataSetProcess is None:
                dataSet = msg.getResultSet()[0]['dataTable']
            else:
                dataSet = postDataSetProcess(msg.getResultSet()[0]['dataTable'])
            retObj.AddYUIDataTableFormat (key, dataSet, retData.GetMaxCount(), startPos, sort, dir, pageRow)
        else:
            retObj.SetReturnCode(errCode)
        
        retObj.SetReturnMsg(retData.GetReturnText())
    
        return retObj.ParseToJSON()
    
    def _ExecuteDafault (self, request, executeFunction):
        msg = executeFunction()
           
        errCode = msg.getReturnCode()                                                   
        retData = ReturnData(ReturnDataType().VALUE, errCode, msg)
        
        retObj = ReturnObject()
        
        if retData.IsSuccess():
            retObj.SetReturnCode(SteerErrorCode.success)
        else:
            retObj.SetReturnCode(errCode)
            
        retObj.SetReturnMsg(retData.GetReturnText())
        
        return retObj.ParseToJSON()

    def GetHTMLTemplate (self, request, key):
        templateName = request.GET['templateName']
        pageTemplete = get_template(templateName + '.html')
        variables = Context(TextMessagePool.GetListTextValue())
        renderedOutput = pageTemplete.render(variables)
        
        retObj = ReturnObject()
        retObj.SetReturnCode(SteerErrorCode.success)
        retObj.AddReturnValue("templateBody", renderedOutput)
        return retObj.ParseToJSON()
    
    
    
    