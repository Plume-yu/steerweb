#!/usr/bin/env python
# _*_ coding: utf-8 _*_
from pyCruise.OpMsg import OpMsg, JobType, ExecType
from pyCruise.ServerCategory import GUID, ServerCategory
from SteerAdminWebRequester import SteerConnector
from SteerAdminError import SteerAdminError
from SteerAdminReturnObject import ReturnObject

import SteerAdminGlobal

#===============================
#
# Steer Session 
#
#===============================

#===============================
class SteerSession ():
    @staticmethod
    def LoginRequest(steerID, steerPassword, clientIP, addInfo):  
        SteerAdminGlobal.Log.Debug('LoginRequest Request', steerID, clientIP, addInfo)
        
        sessionKey, userSN = None, None
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steersession, 1))) #1 openSession
        opMsg.setSenderGUSID(GUID.make(ServerCategory.boxweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.addArgument('loginid', steerID)
        opMsg.addArgument('password', steerPassword)
        opMsg.addArgument('clientIP', clientIP)
        opMsg.addArgument('additionalInfo', addInfo)
        opMsg.addArgument('serviceName', 'Steer')
        opMsg.addArgument('allowMultipleLoginFlag', '0')

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)

        if SteerAdminError.IsSuccess(returnCode):
            sessionKey, userSN = retOpMsg.getSessionKey(), retOpMsg.getResultScalar()
            returnCode = retOpMsg.getResultCode()
        
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('LoginRequest Response', steerID, returnCode)
        return returnCode, retObj, sessionKey, userSN

    @staticmethod
    def CheckRequest(sessionKey, userSN, clientIP, addInfo):
        SteerAdminGlobal.Log.Debug('CheckRequest Request', sessionKey, userSN, clientIP, addInfo)
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steersession, 2))) #2 checkSession
        opMsg.setSenderGUSID(GUID.make(ServerCategory.boxweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)
        opMsg.addArgument('clientIP', clientIP)
        opMsg.addArgument('additionalInfo', addInfo)

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
        
        newSessionKey = None
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            newSessionKey = retOpMsg.getSessionKey()
        
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('CheckRequest Response', sessionKey, returnCode)
        return returnCode, retObj, newSessionKey
    
    @staticmethod
    def LogoutRequest(sessionKey, userSN):
        SteerAdminGlobal.Log.Debug('LogoutRequest Request', sessionKey, userSN)
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steersession, 3))) #3 closeSession
        opMsg.setSenderGUSID(GUID.make(ServerCategory.boxweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
        
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
        
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('LogoutRequest Response', sessionKey, returnCode)
        return returnCode
   
    @staticmethod
    def GetDisplayMenu(sessionKey, displayGroupType):
        SteerAdminGlobal.Log.Debug('GetDisplayFunctionListByUserIDintForMenu Request', sessionKey, displayGroupType)
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steermind, 35))) #3 GetDisplayFunctionListByUserIDintForMenu
        opMsg.setSenderGUSID(GUID.make(ServerCategory.boxweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)
        opMsg.addArgument('displayGroupType', displayGroupType)
        opMsg.addArgument('serviceName', 'Steer')
        
        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
    
        retSet = None
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retSet = retOpMsg.getResultSet(0)
        
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('GetDisplayFunctionListByUserIDintForMenu Response', sessionKey, returnCode)
        return returnCode, retSet
    
    @staticmethod
    def CheckAuth(sessionKey, globalUniqueFunctionIDint, executeArguments = None):
        return SteerSession.CheckFunctionExecutionPrivilege(sessionKey, globalUniqueFunctionIDint, executeArguments)
        
    @staticmethod
    def CheckFunctionExecutionPrivilege(sessionKey, globalUniqueFunctionIDint, executeArguments = None):
        SteerAdminGlobal.Log.Debug('CheckFunctionExecutionPrivilege Request', sessionKey, globalUniqueFunctionIDint, executeArguments)
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steermind, 18))) #18 checkFunctionExecutionPrivilege
        opMsg.setSenderGUSID(GUID.make(ServerCategory.cardweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)
        opMsg.addArgument('globalUniqueFunctionIDint', globalUniqueFunctionIDint)
        
        if executeArguments == None:
            strExecuteArguments = ''
        elif len(executeArguments) <= 1:
            strExecuteArguments = ConvertUnicode(executeArguments[0])
        else:
            uniArgs = ''
            for idx in range(0, len(executeArguments)):
                uniArgs += ConvertUnicode(executeArguments[idx])
                uniArgs += ',' if idx < len(executeArguments) - 1 else ''
            strExecuteArguments = uniArgs
            
        opMsg.addArgument('executeArguments', strExecuteArguments)
        
        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
    
        transactionID = None
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            transactionID = retOpMsg.getResultScalar()
        
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('CheckFunctionExecutionPrivilege Response', sessionKey, returnCode)
        return returnCode, transactionID, retObj

    @staticmethod
    def NotiAuth(sessionKey, transactionID, isSuccess, result, executeComment = None):
        return SteerSession.NotiFunctionExecutionResult(sessionKey, transactionID, isSuccess, result, executeComment)
     
    @staticmethod
    def NotiFunctionExecutionResult(sessionKey, transactionID, returnCode, result, executeComment = None):
        SteerAdminGlobal.Log.Debug('NotiFunctionExecutionResult Request', sessionKey, transactionID, returnCode, result, executeComment)
        retObj = ReturnObject()
        
        opMsg = OpMsg()
        opMsg.setJobType(JobType.NOTICE)
        opMsg.setGUFID((GUID.make(ServerCategory.steermind, 19))) #19 notifyFunctionResult
        opMsg.setSenderGUSID(GUID.make(ServerCategory.cardweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steergw, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)
        
        opMsg.addArgument('transactionIDint', transactionID)
        opMsg.addArgument('executionResult', '1' if SteerAdminError.IsSuccess(returnCode) else '0')
        opMsg.addArgument('result', ConvertUnicode(result))
        opMsg.addArgument('executeComment', '' if executeComment is None else ConvertUnicode(executeComment))
        
        returnCode = SteerConnector.Send(opMsg)
        retObj.SetReturnCode(returnCode)
        
        SteerAdminGlobal.Log.Debug('NotiFunctionExecutionResult Response', sessionKey, returnCode)
        return returnCode, retObj
    