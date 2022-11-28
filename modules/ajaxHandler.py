# _*_ coding: utf-8 _*_
from SteerAdminError import SteerAdminError, SteerWebExceptionHandler
from SteerAdminUtility import GetCherrySession, SetCherrySession
from SteerAdminLocalization import SteerL10N
from SteerAdminSession import SteerSession
from SteerAdminReturnObject import ReturnObject

import cherrypy
import os
import pickle
import time
import json
import zlib

import SteerAdminConfig
import SteerAdminGlobal
from pyCruise.OpMsg import OpMsg, JobType, ExecType
from pyCruise.ServerCategory import GUID, ServerCategory
from SteerAdminWebRequester import SteerConnector, PlatformConnector
import io
import binascii

#===============================
#
# Ajax Handler
# by Daesup, Lee
#
#===============================

#===============================
class SteerAdmin():  
    def __init__(self, rootPath):
        self.rootPath = rootPath
        SteerAdminConfig.SteerAdminConfigReader.Initialize()
    
# Internal Functions
#===============================
    def CheckSession(self):
        retObj = ReturnObject()

        sessionKey = GetCherrySession('steerSessionKey')
        userSN = GetCherrySession('steerUserSN')

        if sessionKey and userSN:
            returnCode, retObj, newSessionKey = SteerSession.CheckRequest(sessionKey,
                                                                          userSN,
                                                                          cherrypy.request.remote.ip,
                                                                          None)
            if SteerAdminError.IsSuccess(returnCode):
                SetCherrySession('steerSessionKey', newSessionKey)
                return True, None
            else:
                retObj.SetReturnCode(SteerAdminError.NO_SESSION_EXIST)
        else:
            retObj.SetReturnCode(SteerAdminError.NO_SESSION_EXIST)

        return False, retObj

    def CheckAuthNoNoti(self, gufid):
        sessionKey = GetCherrySession('steerSessionKey')

        if sessionKey:
            returnCode, transKey, retObj = SteerSession.CheckAuth(sessionKey,
                                                                   gufid,
                                                                   None)
            if SteerAdminError.IsSuccess(returnCode):
                return True
            else:
                return False

        return False
    
    def RequestSteerMind (self, key, funcNumber, argNames, args, blob = None):
        if len(argNames) != len(args):
            raise Exception("MISMATCH :: argument name and arguments mismatched")
        
        listArg = zip(argNames, args)
        sessionKey = GetCherrySession('steerSessionKey')
        
        SteerAdminGlobal.Log.Debug('SteerMind Request', sessionKey, key, listArg)
        
        if blob:
            SteerAdminGlobal.Log.Debug('SteerMind Request BLOB', sessionKey, key, binascii.b2a_hex(blob))

        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steermind, funcNumber)))
        opMsg.setSenderGUSID(GUID.make(ServerCategory.steerweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steermind, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)
        
        if blob:
            opMsg.setBlob(blob)

        for arg in listArg:
            opMsg.addArgument(arg[0], arg[1]) 

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
        
        SteerAdminGlobal.Log.Debug('SteerMind Response', sessionKey, key, returnCode)
        return returnCode, retOpMsg
    
    def RequestSteerHub (self, key, funcNumber, argNames, args):
        if len(argNames) != len(args):
            raise Exception("MISMATCH :: argument name and arguments mismatched")
        
        listArg = zip(argNames, args)
        sessionKey = GetCherrySession('steerSessionKey')
        
        SteerAdminGlobal.Log.Debug('SteerHub Request', sessionKey, key, listArg)

        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steerhub, funcNumber)))
        opMsg.setSenderGUSID(GUID.make(ServerCategory.steerweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steerhub, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)

        for arg in listArg:
            opMsg.addArgument(arg[0], arg[1]) 

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
        
        SteerAdminGlobal.Log.Debug('SteerHub Response', sessionKey, key, returnCode)
        return returnCode, retOpMsg    
    
    def RequestSteerEye (self, key, funcNumber, argNames, args):
        if len(argNames) != len(args):
            raise Exception("MISMATCH :: argument name and arguments mismatched")
        
        listArg = zip(argNames, args)
        sessionKey = GetCherrySession('steerSessionKey')
        
        SteerAdminGlobal.Log.Debug('SteerEye Request', sessionKey, key, listArg)

        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steereye, funcNumber)))
        opMsg.setSenderGUSID(GUID.make(ServerCategory.steerweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steereye, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)

        for arg in listArg:
            opMsg.addArgument(arg[0], arg[1]) 

        returnCode, retOpMsg = PlatformConnector.SendAndRecv(SteerAdminConfig.SteerEye_GUSID , 1, opMsg.serialize())
        
        SteerAdminGlobal.Log.Debug('SteerEye Response', sessionKey, key, returnCode)
        return returnCode, retOpMsg    
    
    def RequestSteerCast (self, key, funcNumber, argNames, args):
        if len(argNames) != len(args):
            raise Exception("MISMATCH :: argument name and arguments mismatched")
        
        listArg = zip(argNames, args)
        sessionKey = GetCherrySession('steerSessionKey')
        
        SteerAdminGlobal.Log.Debug('SteerCast Request', sessionKey, key, listArg)

        opMsg = OpMsg()
        opMsg.setJobType(JobType.REQUEST)
        opMsg.setGUFID((GUID.make(ServerCategory.steercast, funcNumber)))
        opMsg.setSenderGUSID(GUID.make(ServerCategory.steerweb, 0))
        opMsg.setReceiverGUSID(GUID.make(ServerCategory.steercast, 0))
        opMsg.setExecType(ExecType.EXECUTE)
        opMsg.setSessionKey(sessionKey)

        for arg in listArg:
            opMsg.addArgument(arg[0], arg[1]) 

        returnCode, retOpMsg = SteerConnector.SendAndRecv(opMsg)
        
        SteerAdminGlobal.Log.Debug('SteerCast Response', sessionKey, key, returnCode)
        return returnCode, retOpMsg
    
# Exposed Functions
#===============================
    @cherrypy.expose
    def getL10NResources(self):
        retObj = ReturnObject()
        retObj.SetReturnCode(SteerAdminError.SUCCESS)

        if GetCherrySession('nationCode') is None:
            nationCode = SteerAdminConfig.NationCode.replace("'", "")
        else:
            nationCode = GetCherrySession('nationCode')

        resourceDict = SteerL10N.GetTextResource(nationCode)

        if resourceDict == None or len(resourceDict) < 0:
            retObj.SetReturnCode(SteerAdminError.INVALID_L10N)

        retObj.AddReturnValue('resourceDict', resourceDict)
        return retObj.ParseToJSON()
    
#=================================
    @cherrypy.expose
    def index(self):
        return open(os.path.join(self.rootPath, 'view/index.html'))
    
#=================================
    @cherrypy.expose
    def main(self):
        return open(os.path.join(self.rootPath, 'view/main.html'))
    
#=================================
    @cherrypy.expose
    def requestLogin(self, id, password):
        clientIP = cherrypy.request.remote.ip

        returnCode, retObj, sessionKey, userSN = SteerSession.LoginRequest(id, password, clientIP, None)

        if SteerAdminError.IsSuccess(returnCode):
            SetCherrySession('steerSessionKey', sessionKey)
            SetCherrySession('steerUserSN', userSN)
            SetCherrySession('steerID', id)

        retObj.SetReturnCode (returnCode)

        return retObj.ParseToJSON()
    
#=================================
    @cherrypy.expose
    def requestLogout(self):
        sessionKey = GetCherrySession('steerSessionKey')
        userSN = GetCherrySession('steerUserSN')

        if sessionKey and userSN:
            returnCode = SteerSession.LogoutRequest(sessionKey, userSN)
        else:
            returnCode = SteerAdminError.SUCCESS

        retObj = ReturnObject()
        retObj.SetReturnCode (returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def getCurrentUserInfo(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        SteerAdminGlobal.Log.Debug('getCurrentUserInfo Request')

        retObj = ReturnObject()
        retObj.SetReturnCode(SteerAdminError.SUCCESS)
        retObj.AddReturnValue("userID", GetCherrySession('steerUserSN'))
        retObj.AddReturnValue("userAccount", GetCherrySession('steerID'))

        SteerAdminGlobal.Log.Debug('getCurrentUserInfo Response', SteerAdminError.SUCCESS)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def getTopMenuList(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        SteerAdminGlobal.Log.Debug('getTopMenuList Request')

        menuRetObj = ReturnObject()
        menuRetObj.SetReturnCode(SteerAdminError.SUCCESS)

        returnCode, retSet = SteerSession.GetDisplayMenu(GetCherrySession('steerSessionKey'), 1)

        retData = []
        if SteerAdminError.IsSuccess(returnCode):
            for row in retSet[0]:
                retData.append({'displayGroupIDint' : row[0],
                                'displayGroupName' : row[1],
                                'globalUniqueFunctionIDint' : row[2],
                                'functionName' : row[3],
                                'displayName' : row[4],
                                'displayGroupType' : row[5],
                                'dangerLevel' : row[6],
                                'displayOrder' : row[7],
                                'displaySubOrder' : row[8],
                                'displayAdditionalInfo' : row[9]}
                               )
            menuRetObj.AddReturnTable(retData)
        else:
            menuRetObj.SetReturnCode(returnCode)

        SteerAdminGlobal.Log.Debug('getTopMenuList Response', returnCode)
        return menuRetObj.ParseToJSON()
    
#=================================
    @cherrypy.expose
    def getLeftMenuList(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        SteerAdminGlobal.Log.Debug('getLeftMenuList Request')

        menuRetObj = ReturnObject()
        menuRetObj.SetReturnCode(SteerAdminError.SUCCESS)

        returnCode, retSet = SteerSession.GetDisplayMenu(GetCherrySession('steerSessionKey'), 2)

        retData = []
        if SteerAdminError.IsSuccess(returnCode):
            for row in retSet[0]:
                retData.append({'displayGroupIDint' : row[0],
                                'displayGroupName' : row[1],
                                'globalUniqueFunctionIDint' : row[2],
                                'functionName' : row[3],
                                'displayName' : row[4],
                                'displayGroupType' : row[5],
                                'dangerLevel' : row[6],
                                'displayOrder' : row[7],
                                'displaySubOrder' : row[8],
                                'displayAdditionalInfo' : row[9]}
                               )
            menuRetObj.AddReturnTable(retData)
        else:
            menuRetObj.SetReturnCode(returnCode)

        SteerAdminGlobal.Log.Debug('getLeftMenuList Response', returnCode)
        return menuRetObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def checkExecCastPrivileges(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        SteerAdminGlobal.Log.Debug('checkExportPrivileges Request')
        
        retObj = ReturnObject()
        returnCode = SteerAdminError.AUTH_NO_PRIVILEGE
        
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 39)): # getExecutableFunctionList
            retObj.AddReturnValue("Executable", 1)
            returnCode = SteerAdminError.SUCCESS

        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 40)): # getCastableFunctionList
            retObj.AddReturnValue("Castable", 1)
            returnCode = SteerAdminError.SUCCESS
            
        retObj.SetReturnCode(returnCode)
    
        SteerAdminGlobal.Log.Debug('createBox Response', returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def getExecutableFunctionList(self, key, startIndex, results, sort, dir, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if serverType == None or serverType == "-1":
            serverType = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getExecutableFunctionList", 39,
                                                     ("userGroupUseFlag", "functionGroupUseFlag", "functionUseFlag", "rowOffset", "rowCount", "serverType", "criteria", "sort", "dir"),
                                                     (1, 1, 1, startIndex, results, serverType, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================  
    @cherrypy.expose
    def getCastableFunctionList(self, key, startIndex, results, sort, dir, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if serverType == None or serverType == "-1":
            serverType = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getCastableFunctionList", 40,
                                                     ("userGroupUseFlag", "functionGroupUseFlag", "functionUseFlag", "rowOffset", "rowCount", "serverType", "criteria", "sort", "dir"),
                                                     (1, 1, 1, startIndex, results, serverType, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def getServerCategoryAll(self):
        return self.getServerCategory("getServerCategoryAll", 0, 10000, "categoryIDint", "asc", "")
    
    @cherrypy.expose
    def getServerCategory(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getServerCategory", 46,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getUserList(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getUserList", 21,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def getUserGroupList(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getUserList", 22,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getFunctionList(self, key, startIndex, results, sort, dir, functionUseFlag = None, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if functionUseFlag == None:
            functionUseFlag = ''
        if serverType == None or serverType == "-1":
            serverType = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionList", 15,
                                                     ("functionUseFlag", "rowOffset", "rowCount", "serverType", "criteria", "sort", "dir"),
                                                     (functionUseFlag, startIndex, results, serverType, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def getFunctionGroupList(self, key, startIndex, results, sort, dir, functionGroupUseFlag = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if functionGroupUseFlag == None:
            functionGroupUseFlag = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionGroupList", 33,
                                                     ("functionGroupUseFlag", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (functionGroupUseFlag, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDisplayGroupList(self, key, startIndex, results, sort, dir, displayGroupUseFlag = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if displayGroupUseFlag == None:
            displayGroupUseFlag = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getDisplayGroupList", 47,
                                                     ("displayGroupUseFlag", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (displayGroupUseFlag, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getUserGroupListByUser(self, key, startIndex, results, sort, dir, userIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getUserGroupListByUser", 48,
                                                     ("userIDint", "rowOffset", "rowCount", "sort", "dir"),
                                                     (userIDint, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getUserGroupListNoLinkToUser(self, key, startIndex, results, sort, dir, userIDint, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getUserGroupListNoLinkToUser", 49,
                                                     ("userIDint", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (userIDint, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createLinkUserGroupAndUser(self, userIDint, userGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createLinkUserGroupAndUser", 7,
                                                     ("userIDint", "userGroupIDint"),
                                                     (userIDint, userGroupIDint))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def removeLinkUserGroupAndUser(self, userIDint, userGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("removeLinkUserGroupAndUser", 9,
                                                     ("userIDint", "userGroupIDint"),
                                                     (userIDint, userGroupIDint))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()    

#=================================    
    @cherrypy.expose
    def getUserListByUserGroup(self, key, startIndex, results, sort, dir, userGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getUserListByUserGroup", 50,
                                                     ("userGroupIDint", "rowOffset", "rowCount", "sort", "dir"),
                                                     (userGroupIDint, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getUserListNoLinkToUserGroup(self, key, startIndex, results, sort, dir, userGroupIDint, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getUserListNoLinkToUserGroup", 51,
                                                     ("userGroupIDint", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (userGroupIDint, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    

#=================================    
    @cherrypy.expose
    def getDetailUser(self, userIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailUser", 52,
                                                     ("userIDint",),
                                                     (userIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))
            retObj.AddReturnTable(retOpMsg.getResultSet(1))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getFunctionGroupListByFunction(self, key, startIndex, results, sort, dir, gufid, actionType):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionGroupListByFunction", 57,
                                                     ("globalUniqueFunctionIDint", "actionType", "rowOffset", "rowCount", "sort", "dir"),
                                                     (gufid, actionType, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getFunctionGroupListNoLinkToFunction(self, key, startIndex, results, sort, dir, gufid, actionType, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionGroupListNoLinkToFunction", 58,
                                                     ("globalUniqueFunctionIDint", "actionType", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (gufid, actionType, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createLinkFunctionGroupAndExecuteFunction(self, gufid, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createLinkFunctionGroupAndExecuteFunction", 4,
                                                     ("globalUniqueFunctionIDint", "functionGroupIDint", "actionType"),
                                                     (gufid, functionGroupIDint, 1))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def removeLinkFunctionGroupAndExecuteFunction(self, gufid, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("removeLinkFunctionGroupAndExecuteFunction", 8,
                                                     ("globalUniqueFunctionIDint", "functionGroupIDint", "actionType"),
                                                     (gufid, functionGroupIDint, 1))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()    

#=================================    
    @cherrypy.expose
    def getFunctionListByFunctionGroup(self, key, startIndex, results, sort, dir, functionGroupIDint, actionType):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionListByFunctionGroup", 59,
                                                     ("functionGroupIDint", "actionType", "rowOffset", "rowCount", "sort", "dir"),
                                                     (functionGroupIDint, actionType, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getFunctionListNoLinkToFunctionGroup(self, key, startIndex, results, sort, dir, functionGroupIDint, actionType, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
        if serverType == None or serverType == "-1":
            serverType = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionListNoLinkToFunctionGroup", 60,
                                                     ("functionGroupIDint", "actionType", "serverType", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (functionGroupIDint, actionType, serverType, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createLinkFunctionGroupAndCastFunction(self, gufid, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createLinkFunctionGroupAndCastFunction", 4,
                                                     ("globalUniqueFunctionIDint", "functionGroupIDint", "actionType"),
                                                     (gufid, functionGroupIDint, 2))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def removeLinkFunctionGroupAndCastFunction(self, gufid, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("removeLinkFunctionGroupAndCastFunction", 8,
                                                     ("globalUniqueFunctionIDint", "functionGroupIDint", "actionType"),
                                                     (gufid, functionGroupIDint, 2))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()   

#=================================    
    @cherrypy.expose
    def getDetailUserGroup(self, userGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailUserGroup", 53,
                                                     ("userGroupIDint",),
                                                     (userGroupIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))
            retObj.AddReturnTable(retOpMsg.getResultSet(1))
            retObj.AddReturnTable(retOpMsg.getResultSet(2))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDetailFunction(self, globalUniqueFunctionIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailFunction", 54,
                                                     ("globalUniqueFunctionIDint",),
                                                     (globalUniqueFunctionIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))
            retObj.AddReturnTable(retOpMsg.getResultSet(1))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDetailFunctionGroup(self, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailFunctionGroup", 55,
                                                     ("functionGroupIDint",),
                                                     (functionGroupIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))
            retObj.AddReturnTable(retOpMsg.getResultSet(1))
            retObj.AddReturnTable(retOpMsg.getResultSet(2))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDetailDisplayGroup(self, displayGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailDisplayGroup", 56,
                                                     ("displayGroupIDint",),
                                                     (displayGroupIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))
            retObj.AddReturnTable(retOpMsg.getResultSet(1))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDisplayGroupListByFunction(self, key, startIndex, results, sort, dir, gufid):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getDisplayGroupListByFunction", 61,
                                                     ("globalUniqueFunctionIDint", "rowOffset", "rowCount", "sort", "dir"),
                                                     (gufid, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getDisplayGroupListNoLinkToFunction(self, key, startIndex, results, sort, dir, gufid, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getDisplayGroupListNoLinkToFunction", 62,
                                                     ("globalUniqueFunctionIDint", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (gufid, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getFunctionListByDisplayGroup(self, key, startIndex, results, sort, dir, displayGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionListByDisplayGroup", 63,
                                                     ("displayGroupIDint", "rowOffset", "rowCount", "sort", "dir"),
                                                     (displayGroupIDint, startIndex, results, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
 
#=================================    
    @cherrypy.expose
    def getFunctionListNoLinkToDisplayGroup(self, key, startIndex, results, sort, dir, displayGroupIDint, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
        if serverType == None or serverType == "-1":
            serverType = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getFunctionListNoLinkToDisplayGroup", 64,
                                                     ("displayGroupIDint", "serverType", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (displayGroupIDint, serverType, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def removeLinkDisplayGroupAndFunction(self, gufid, displayGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("removeLinkDisplayGroupAndFunction", 65,
                                                     ("globalUniqueFunctionIDint", "displayGroupIDint"),
                                                     (gufid, displayGroupIDint))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()    

#=================================    
    @cherrypy.expose
    def createLinkDisplayGroupAndFunction(self, gufid, displayGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createLinkDisplayGroupAndFunction", 66,
                                                     ("globalUniqueFunctionIDint", "displayGroupIDint", "displaySubOrder", "displayFunctionAdditionalInfo"),
                                                     (gufid, displayGroupIDint, '', ''))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def modifyUser(self, userIDint, userName, password, userState, allowMultipleLoginFlag):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("modifyUser", 12,
                                                     ("userIDint", "userName", "PASSWORDstr", "userState", "allowMultipleLoginFlag"),
                                                     (userIDint, userName, password, userState, allowMultipleLoginFlag))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getServerStatus(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getServerStatus", 27,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getServerActionLogByDangerLevel(self, key, startIndex, results, sort, dir, searchCriteria = None, actionType = None, dangerLevel = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
        if actionType == None or actionType == "-1":
            actionType = ''
        if dangerLevel == None or dangerLevel <= 0:
            dangerLevel = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getServerActionLogByDangerLevel", 37,
                                                     ("actionType", "dangerLevel", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (actionType, dangerLevel, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def modifyME(self, userName, password):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("modifyME", 14,
                                                     ("userName", "PASSWORDstr"),
                                                     (userName, password))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createUser(self, userIDstr, userName, password, allowMultipleLoginFlag):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createUser", 5,
                                                     ("userIDstr", "userName", "PASSWORDstr", "userState", "allowMultipleLoginFlag"),
                                                     (userIDstr, userName, password, 1, allowMultipleLoginFlag))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getConnectedServerInfo(self, key, startIndex, results, sort, dir):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
 
        returnCode, retOpMsg = self.RequestSteerHub("getConnectedServerInfo", 21, (), ())

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def checkReceivedDelegatablePrivileges(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        SteerAdminGlobal.Log.Debug('checkReceivedDelegatablePrivileges Request')
        
        retObj = ReturnObject()
        returnCode = SteerAdminError.AUTH_NO_PRIVILEGE
        
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steercast, 1)): # getCastListBySession
            retObj.AddReturnValue("Received", 1)
            returnCode = SteerAdminError.SUCCESS

        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steercast, 4)): # getCastDelegatableListBySession
            retObj.AddReturnValue("Delegatable", 1)
            returnCode = SteerAdminError.SUCCESS
            
        retObj.SetReturnCode(returnCode)
    
        SteerAdminGlobal.Log.Debug('checkReceivedDelegatablePrivileges Response', returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def getRecvCastListBySession(self, key, startIndex, results, sort, dir, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if serverType == None or serverType == "-1":
            serverType = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerCast("getRecvCastListBySession", 1,
                                                     ("castState", "rowOffset", "rowCount", "serverType", "criteria", "sort", "dir"),
                                                     (1, startIndex, results, serverType, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getCastDelegatableListBySession(self, key, startIndex, results, sort, dir, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if serverType == None or serverType == "-1":
            serverType = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerCast("getCastDelegatableListBySession", 4,
                                                     ("rowOffset", "rowCount", "serverType", "criteria", "sort", "dir"),
                                                     (startIndex, results, serverType, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================  
    @cherrypy.expose
    def createUserGroup(self, userGroupName, auditorUserGroupIDint, userGroupUseFlag, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        if auditorUserGroupIDint == None:
            auditorUserGroupIDint = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("createUserGroup", 6,
                                                     ("userGroupName", "auditorUserGroupIDint", "userGroupUseFlag", "functionGroupIDint"),
                                                     (userGroupName, auditorUserGroupIDint, userGroupUseFlag, functionGroupIDint))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================  
    @cherrypy.expose
    def modifyUserGroup(self, userGroupIDint, userGroupName, auditorUserGroupIDint, userGroupUseFlag, functionGroupIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        if auditorUserGroupIDint == None:
            auditorUserGroupIDint = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("modifyUserGroup", 13,
                                                     ("userGroupIDint", "userGroupName", "auditorUserGroupIDint", "userGroupUseFlag", "functionGroupIDint"),
                                                     (userGroupIDint, userGroupName, auditorUserGroupIDint, userGroupUseFlag, functionGroupIDint))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getDetailServerCategory(self, categoryIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailServerCategory", 67,
                                                     ("categoryIDint",),
                                                     (categoryIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createFunction(self, serverType, functionIDint, functionName, functionUseFlag, dangerLevel, requireSessionFlag, arguments, results, functionDescription, displayName, displaySortOrder):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createFunction", 1,
                                                     ("serverType", "functionIDint", "functionName", "functionUseFlag", "dangerLevel", "requireSessionFlag", "requireSessionFlag", "arguments", "results", "functionDescription", "displayName", "displaySortOrder"),
                                                     (serverType, functionIDint, functionName, functionUseFlag, dangerLevel, requireSessionFlag, requireSessionFlag, arguments, results, functionDescription, displayName, displaySortOrder))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def modifyFunction(self, globalUniqueFunctionIDint, functionName, functionUseFlag, dangerLevel,requireSessionFlag, arguments, results, functionDescription, displayName, displaySortOrder):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("modifyFunction", 10,
                                                     ("globalUniqueFunctionIDint", "functionName", "functionUseFlag", "dangerLevel", "requireSessionFlag", "requireSessionFlag", "arguments", "results", "functionDescription", "displayName", "displaySortOrder"),
                                                     (globalUniqueFunctionIDint, functionName, functionUseFlag, dangerLevel, requireSessionFlag, requireSessionFlag, arguments, results, functionDescription, displayName, displaySortOrder))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createFunctionGroup(self, functionGroupName, functionGroupUseFlag):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createFunctionGroup", 3,
                                                     ("functionGroupName", "functionGroupUseFlag"),
                                                     (functionGroupName, functionGroupUseFlag))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def modifyFunctionGroup(self, functionGroupIDint, functionGroupName, functionGroupUseFlag):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("modifyFunction", 11,
                                                     ("functionGroupIDint", "functionGroupName", "functionGroupUseFlag"),
                                                     (functionGroupIDint, functionGroupName, functionGroupUseFlag))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def createDisplayGroup(self, displayGroupName, displayGroupUseFlag, displayGroupType, displayOrder, displayAdditionalInfo, serviceName):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createDisplayGroup", 68,
                                                     ("displayGroupName", "displayGroupUseFlag", "displayGroupType", "displayOrder", "displayAdditionalInfo", "serviceName"),
                                                     (displayGroupName, displayGroupUseFlag, displayGroupType, displayOrder, displayAdditionalInfo, serviceName))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def modifyDisplayGroup(self, displayGroupIDint, displayGroupName, displayGroupUseFlag, displayGroupType, displayOrder, displayAdditionalInfo, serviceName):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        returnCode, retOpMsg = self.RequestSteerMind("createDisplayGroup", 69,
                                                     ("displayGroupIDint", "displayGroupName", "displayGroupUseFlag", "displayGroupType", "displayOrder", "displayAdditionalInfo", "serviceName"),
                                                     (displayGroupIDint, displayGroupName, displayGroupUseFlag, displayGroupType, displayOrder, displayAdditionalInfo, serviceName))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def checkActionLogPrivileges(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        SteerAdminGlobal.Log.Debug('checkActionLogPrivileges Request')
        
        retObj = ReturnObject()
        returnCode = SteerAdminError.AUTH_NO_PRIVILEGE
        
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 41)): # getAllActionLogList
            retObj.AddReturnValue("All", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 42)): # getActionLogListByServerCategory
            retObj.AddReturnValue("ServerCategory", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 43)): # getActionLogListByTerm
            retObj.AddReturnValue("Term", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 44)): # getActionLogListByUser
            retObj.AddReturnValue("User", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 45)): # getActionLogListByUserGroup
            retObj.AddReturnValue("UserGroup", 1)
            returnCode = SteerAdminError.SUCCESS
            
        retObj.SetReturnCode(returnCode)
    
        SteerAdminGlobal.Log.Debug('checkActionLogPrivileges Response', returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getAllActionLogList(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getAllActionLogList", 41,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getActionLogListByServerCategory(self, key, startIndex, results, sort, dir, serverCategory = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if serverCategory == None or serverCategory == "-1":
            serverCategory = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getActionLogListByServerCategory", 42,
                                                     ("serverCategory", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (serverCategory, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getActionLogListByTerm(self, key, startIndex, results, sort, dir, serverCategory = None, startDate = None, endDate = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        if serverCategory == None or serverCategory == "-1":
            serverCategory = ''
        if startDate == None:
            startDate = ''
        if endDate == None:
            endDate = ''
        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getActionLogListByTerm", 43,
                                                     ("serverCategory", "startDate", "endDate", "rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (serverCategory, startDate, endDate, startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getActionLogListByUser(self, key, startIndex, results, sort, dir, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getActionLogListByUser", 44,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================  
    @cherrypy.expose
    def getActionLogListByUserGroup(self, key, startIndex, results, sort, dir, serverType = None, searchCriteria = None):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()

        if searchCriteria == None:
            searchCriteria = ''
            
        returnCode, retOpMsg = self.RequestSteerMind("getActionLogListByUserGroup", 45,
                                                     ("rowOffset", "rowCount", "criteria", "sort", "dir"),
                                                     (startIndex, results, searchCriteria, sort, dir))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddYUIDataTable(retOpMsg.getResultSet(0), startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def getDetailActionLog(self, actionLogIDint):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
            
        returnCode, retOpMsg = self.RequestSteerMind("getDetailActionLog", 70,
                                                     ("actionLogIDint",),
                                                     (actionLogIDint,))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retObj.AddReturnTable(retOpMsg.getResultSet(0))

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def exportUserGroupAndFunctionGroupAndFunction(self, exportData):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        selectedData = json.loads(exportData)
        
        """userGroupName들을 이용하여 export 할 data를 만든다.
        """
        userGroupNames = selectedData['userGroups']
        
        userGroups = [] # export file에 쓰여질 내용을 담는다.
        userGroupErrors = []
        
        for userGroupName in userGroupNames:
            returnCode, retOpMsg = self.RequestSteerMind("exportGetUserGroup", 71,
                                                         ("userGroupName",),
                                                         (userGroupName,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for userGroup in userGroups:
                        if row['userGroupName'] == userGroup['userGroupName'] and \
                           row['auditorUserGroupName'] == userGroup['auditorUserGroupName'] and \
                           row['userGroupUseFlag'] == userGroup['userGroupUseFlag'] and \
                           row['functionGroupName'] == userGroup['functionGroupName']:
                            isAdding = False
                    
                    if isAdding:
                        userGroups.append(row)
                else:
                    if not userGroupName in userGroupErrors:
                        userGroupErrors.append(userGroupName)
            else:
                if not userGroupName in userGroupErrors:
                    userGroupErrors.append(userGroupName)
        
        """functionGroupName들을 이용하여 export 할 data를 만든다.
        """
        functionGroupNames = selectedData['functionGroups']
        
        functionGroups = [] # export file에 쓰여질 내용을 담는다.
        functionGroupErrors = []
        
        for functionGroupName in functionGroupNames:
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunctionGroup", 72,
                                                         ("functionGroupName",),
                                                         (functionGroupName,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for functionGroup in functionGroups:
                        if row['functionGroupName'] == functionGroup['functionGroupName'] and \
                           row['functionGroupUseFlag'] == functionGroup['functionGroupUseFlag']:
                            isAdding = False
                    
                    if isAdding:
                        functionGroups.append(row)
                else:
                    if not functionGroupName in functionGroupErrors:
                        functionGroupErrors.append(functionGroupName)
            else:
                if not functionGroupName in functionGroupErrors:
                    functionGroupErrors.append(functionGroupName)
        
        """선택된 userGroup에 mapping 된 functionGroup도 functionGroupList에 append 한다.
        """
        for userGroup in userGroups:
            functionGroupName = userGroup['functionGroupName']
            
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunctionGroup", 72,
                                                         ("functionGroupName",),
                                                         (functionGroupName,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for functionGroup in functionGroups:
                        if row['functionGroupName'] == functionGroup['functionGroupName'] and \
                           row['functionGroupUseFlag'] == functionGroup['functionGroupUseFlag']:
                            isAdding = False
                    
                    if isAdding:
                        functionGroups.append(row)
                else:
                    if not functionGroupName in functionGroupErrors:
                        functionGroupErrors.append(functionGroupName)
            else:
                if not functionGroupName in functionGroupErrors:
                    functionGroupErrors.append(functionGroupName)
        
        """functionGroups의 functionGroupName들을 이용하여 function과 functionGroup간의 mapping 정보를 담는다.
        """
        functionGroupAndFunctionLinks = []
        functionGroupAndFunctionLinkErrors = []
        
        for functionGroup in functionGroups:
            functionGroupName = functionGroup['functionGroupName']
            
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunctionGroupAndFunctionLink", 73,
                                                         ("functionGroupName",),
                                                         (functionGroupName,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    for row in resultSet[0]:
                        isAdding = True
                        
                        for functionGroupAndFunctionLink in functionGroupAndFunctionLinks:
                            if row['functionGroupName'] == functionGroupAndFunctionLink['functionGroupName'] and \
                               row['globalUniqueFunctionIDint'] == functionGroupAndFunctionLink['globalUniqueFunctionIDint'] and \
                               row['actionType'] == functionGroupAndFunctionLink['actionType']:
                                isAdding = False
                        
                        if isAdding:
                            functionGroupAndFunctionLinks.append(row)
                else:
                    if not functionGroupName in functionGroupAndFunctionLinkErrors:
                        functionGroupAndFunctionLinkErrors.append(functionGroupName)
            else:
                if not functionGroupName in functionGroupAndFunctionLinkErrors:
                    functionGroupAndFunctionLinkErrors.append(functionGroupName)
        
        """displayGroup 번호들을 이용하여 export 할 data를 만든다.
        """
        displayGroupIDs = selectedData['displayGroups']
        
        displayGroups = [] # export file에 쓰여질 내용을 담는다.
        displayGroupErrors = []
        
        for displayGroupID in displayGroupIDs:
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunction", 96,
                                                         ("displayGroupIDint",),
                                                         (displayGroupID,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for displayGroup in displayGroups:
                        if row['displayGroupIDint'] == displayGroup['displayGroupIDint']:
                            isAdding = False
                    
                    if isAdding:
                        displayGroups.append(row)
                else:
                    if not displayGroupID in displayGroupErrors:
                        displayGroupErrors.append(displayGroupID)
            else:
                if not displayGroupID in displayGroupErrors:
                    displayGroupErrors.append(displayGroupID)
        
        """displayGroup 번호들을 이용하여 mapping된 Function 정보를 가져온다.
        """
        displayGroupAndFunctionLinks = []
        displayGroupAndFunctionLinkErrors = []
        
        for displayGroup in displayGroups:
            displayGroupID = displayGroup['displayGroupIDint']
            
            returnCode, retOpMsg = self.RequestSteerMind("exportGetDisplayGroupAndFunctionLink", 97,
                                                         ("displayGroupIDint",),
                                                         (displayGroupID,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    for row in resultSet[0]:
                        isAdding = True
                        
                        for displayGroupAndFunctionLink in displayGroupAndFunctionLinks:
                            if row['displayGroupIDint'] == displayGroupAndFunctionLink['displayGroupIDint'] and \
                                row['globalUniqueFunctionIDint'] == displayGroupAndFunctionLink['globalUniqueFunctionIDint']:
                                isAdding = False
                        
                        if isAdding:
                            displayGroupAndFunctionLinks.append(row)
                else:
                    if not displayGroupID in displayGroupAndFunctionLinkErrors:
                        displayGroupAndFunctionLinkErrors.append(displayGroupID)
            else:
                if not displayGroupID in displayGroupAndFunctionLinkErrors:
                    displayGroupAndFunctionLinkErrors.append(displayGroupID)
        
        """globalUniqueFunctionID들을 이용하여 export 할 data를 만든다.
        """
        globalUniqueFunctionIDs = selectedData['functions']
        
        globalUniqueFunctions = [] # export file에 쓰여질 내용을 담는다.
        globalUniqueFunctionErrors = []
        
        for globalUniqueFunctionID in globalUniqueFunctionIDs:
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunction", 74,
                                                         ("globalUniqueFunctionIDint",),
                                                         (globalUniqueFunctionID,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for globalUniqueFunction in globalUniqueFunctions:
                        if row['globalUniqueFunctionIDint'] == globalUniqueFunction['globalUniqueFunctionIDint']:
                            isAdding = False
                    
                    if isAdding:
                        globalUniqueFunctions.append(row)
                else:
                    if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                        globalUniqueFunctionErrors.append(globalUniqueFunctionID)
            else:
                if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                    globalUniqueFunctionErrors.append(globalUniqueFunctionID)
        
        """functionGroupAndFunctionLinkList의 globalUniqueFunctionID들을 이용하여 export 할 data를 만든다.
        """
        for functionGroupAndFunctionLink in functionGroupAndFunctionLinks:
            globalUniqueFunctionID = functionGroupAndFunctionLink['globalUniqueFunctionIDint']
            
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunction", 74,
                                                         ("globalUniqueFunctionIDint",),
                                                         (globalUniqueFunctionID,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for globalUniqueFunction in globalUniqueFunctions:
                        if row['globalUniqueFunctionIDint'] == globalUniqueFunction['globalUniqueFunctionIDint']:
                            isAdding = False
                    
                    if isAdding:
                        globalUniqueFunctions.append(row)
                else:
                    if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                        globalUniqueFunctionErrors.append(globalUniqueFunctionID)
            else:
                if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                    globalUniqueFunctionErrors.append(globalUniqueFunctionID)
        
        """displayGroupAndFunctionLinks의 globalUniqueFunctionID들을 이용하여 export 할 data를 만든다.
        """
        for displayGroupAndFunctionLink in displayGroupAndFunctionLinks:
            globalUniqueFunctionID = displayGroupAndFunctionLink['globalUniqueFunctionIDint']
            
            returnCode, retOpMsg = self.RequestSteerMind("exportGetFunction", 74,
                                                         ("globalUniqueFunctionIDint",),
                                                         (globalUniqueFunctionID,))
            
            if SteerAdminError.IsSuccess(returnCode):
                resultSet = retOpMsg.getResultSet(0)
                
                if resultSet and len(resultSet[0]) > 0:
                    row = resultSet[0][0]
                    isAdding = True
                    
                    for globalUniqueFunction in globalUniqueFunctions:
                        if row['globalUniqueFunctionIDint'] == globalUniqueFunction['globalUniqueFunctionIDint']:
                            isAdding = False
                    
                    if isAdding:
                        globalUniqueFunctions.append(row)
                else:
                    if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                        globalUniqueFunctionErrors.append(globalUniqueFunctionID)
            else:
                if not globalUniqueFunctionID in globalUniqueFunctionErrors:
                    globalUniqueFunctionErrors.append(globalUniqueFunctionID)
        
        """수집된 정보들을 container에 담는다.
        """
        container = {'userGroups': userGroups,
                     'functionGroups': functionGroups,
                     'functionGroupAndFunctionLinks': functionGroupAndFunctionLinks,
                     'displayGroups': displayGroups,
                     'displayGroupAndFunctionLinks': displayGroupAndFunctionLinks,
                     'globalUniqueFunctions': globalUniqueFunctions}
        
        """file을 저정할 path와 file 이름을 셋팅한다.
        """
        exportPath = os.path.join(self.rootPath, 'data/export/')
        exportFileName = "ExportSteerData_{0}_{1}.sef".format(GetCherrySession('steerID'), str(int(time.time())))
        
        """file을 열어서 serialize하여 저장한다.
        """
        pickledStream = pickle.dumps(container)
        compressedStream = zlib.compress(pickledStream)
        
        exportFile = open(exportPath + exportFileName, 'wb')
        exportFile.write(compressedStream)
        exportFile.close()
        
        retObj = ReturnObject()
        retObj.SetReturnCode(SteerAdminError.SUCCESS)
        retObj.AddReturnValue("exportFileName", exportFileName)
        retObj.AddReturnValue("userGroupCount", len(userGroups))
        retObj.AddReturnValue("functionGroupCount", len(functionGroups))
        retObj.AddReturnValue("displayGroupCount", len(displayGroups))
        retObj.AddReturnValue("globalUniqueFunctionCount", len(globalUniqueFunctions))
        retObj.AddReturnTable(userGroupErrors)
        retObj.AddReturnTable(functionGroupErrors)
        retObj.AddReturnTable(functionGroupAndFunctionLinkErrors)
        retObj.AddReturnTable(displayGroupErrors)
        retObj.AddReturnTable(displayGroupAndFunctionLinkErrors)
        retObj.AddReturnTable(globalUniqueFunctionErrors)
        
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def uploadUserGroupAndFunctionGroupAndFunction(self, qqfile):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        container = None 
        try:
            """전달 된 stream을 file로 저장하고 unpickle 한다.
            """
            fp = cherrypy.request.body
            receivedStream = fp.read(int(cherrypy.request.headers["Content-Length"]))
            
            importPath = os.path.join(self.rootPath, 'data/import/')
            importFileName = "{0}_{1}".format(str(int(time.time())), qqfile)
            
            importFile = open(importPath + importFileName, 'wb')
            importFile.write(receivedStream)
            importFile.close()
            
            decompressedStream = zlib.decompress(receivedStream)
            container = pickle.loads(decompressedStream)
        except Exception as exc:
            return SteerWebExceptionHandler.ToReturnObject(exc)
        
        retObj = ReturnObject()
        
        if container:
            """globalUniqueFunction들을 check 한다.
            """
            globalUniqueFunctions = container['globalUniqueFunctions']
            globalUniqueFunctionReports = []
            
            retObj.AddReturnTable(globalUniqueFunctions)
            
            for globalUniqueFunction in globalUniqueFunctions:
                paramNames = ('globalUniqueFunctionIDint',)
                paramValues = (globalUniqueFunction['globalUniqueFunctionIDint'],)
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailFunction", 89, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = globalUniqueFunction['globalUniqueFunctionIDint']
                    values = {'globalUniqueFunctionIDint': globalUniqueFunction['globalUniqueFunctionIDint'],\
                              'serverType': globalUniqueFunction['serverType'],\
                              'functionIDint': globalUniqueFunction['functionIDint'],\
                              'functionName': globalUniqueFunction['functionName'],\
                              'functionUseFlag': globalUniqueFunction['functionUseFlag'],\
                              'dangerLevel': globalUniqueFunction['dangerLevel'],\
                              'requireSessionFlag': globalUniqueFunction['requireSessionFlag'],\
                              'arguments': globalUniqueFunction['arguments'],\
                              'results': globalUniqueFunction['results'],\
                              'functionDescription': globalUniqueFunction['functionDescription'],\
                              'displayName': globalUniqueFunction['displayName'],\
                              'displaySortOrder': globalUniqueFunction['displaySortOrder']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'globalUniqueFunctionIDint': row['globalUniqueFunctionIDint'],\
                                     'serverType': row['serverType'],\
                                     'functionIDint': row['functionIDint'],\
                                     'functionName': row['functionName'],\
                                     'functionUseFlag': row['functionUseFlag'],\
                                     'dangerLevel': row['dangerLevel'],\
                                     'requireSessionFlag': row['requireSessionFlag'],\
                                     'arguments': row['arguments'],\
                                     'results': row['results'],\
                                     'functionDescription': row['functionDescription'],\
                                     'displayName': row['displayName'],\
                                     'displaySortOrder': row['displaySortOrder']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    globalUniqueFunctionReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
            
            """functionGroup들을 check 한다.
            """
            functionGroups = container['functionGroups']
            functionGroupReports = []
            
            retObj.AddReturnTable(functionGroups)
            
            for functionGroup in functionGroups:
                paramNames = ('functionGroupName',)
                paramValues = (functionGroup['functionGroupName'],)
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailFunctionGroup", 90, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = functionGroup['functionGroupName']
                    values = {'functionGroupName': functionGroup['functionGroupName'],\
                              'functionGroupUseFlag': functionGroup['functionGroupUseFlag']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'functionGroupName': row['functionGroupName'],\
                                     'functionGroupUseFlag': row['functionGroupUseFlag']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    functionGroupReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            """functionGroupAndFunctionLink들을 check 한다.
            """
            
            functionGroupAndFunctionLinks = container['functionGroupAndFunctionLinks']
            functionGroupAndFunctionReports = []
            
            retObj.AddReturnTable(functionGroupAndFunctionLinks)
            
            for functionGroupAndFunctionLink in functionGroupAndFunctionLinks:
                paramNames = ('functionGroupName', 'globalUniqueFunctionIDint', 'actionType')
                paramValues = (functionGroupAndFunctionLink['functionGroupName'],\
                               functionGroupAndFunctionLink['globalUniqueFunctionIDint'],\
                               functionGroupAndFunctionLink['actionType'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailFunctionGroupAndFunctionLink", 98, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = functionGroupAndFunctionLink['functionGroupName']
                    values = {'functionGroupName': functionGroupAndFunctionLink['functionGroupName'],\
                              'globalUniqueFunctionIDint': functionGroupAndFunctionLink['globalUniqueFunctionIDint'],\
                              'actionType': functionGroupAndFunctionLink['actionType']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'functionGroupName': row['functionGroupName'],\
                                     'globalUniqueFunctionIDint': row['globalUniqueFunctionIDint'],\
                                     'actionType': row['actionType']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    functionGroupAndFunctionReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            """displayGroup들을 check 한다.
            """
            displayGroups = container['displayGroups']
            displayGroupReports = []
            
            retObj.AddReturnTable(displayGroups)
            
            for displayGroup in displayGroups:
                paramNames = ('displayGroupIDint',)
                paramValues = (displayGroup['displayGroupIDint'],)
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailDisplayGroup", 99, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = displayGroup['displayGroupIDint']
                    values = {'displayGroupName': displayGroup['displayGroupName'],\
                              'displayGroupUseFlag': displayGroup['displayGroupUseFlag'],\
                              'displayGroupType': displayGroup['displayGroupType'],\
                              'displayOrder': displayGroup['displayOrder'],\
                              'displayAdditionalInfo': displayGroup['displayAdditionalInfo'],\
                              'serviceName': displayGroup['serviceName']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'displayGroupName': row['displayGroupName'],\
                                     'displayGroupUseFlag': row['displayGroupUseFlag'],\
                                     'displayGroupType': row['displayGroupType'],\
                                     'displayOrder': row['displayOrder'],\
                                     'displayAdditionalInfo': row['displayAdditionalInfo'],\
                                     'serviceName': row['serviceName']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    displayGroupReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            """displayGroupAndFunctionLink들을 check 한다.
            """
            displayGroupAndFunctionLinks = container['displayGroupAndFunctionLinks']
            displayGroupAndFunctionReports = []
            
            retObj.AddReturnTable(displayGroupAndFunctionLinks)
            
            for displayGroupAndFunctionLink in displayGroupAndFunctionLinks:
                paramNames = ('displayGroupIDint', 'globalUniqueFunctionIDint')
                paramValues = (displayGroupAndFunctionLink['displayGroupIDint'],\
                               displayGroupAndFunctionLink['globalUniqueFunctionIDint'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailDisplayGroupAndFunctionLink", 100, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = displayGroupAndFunctionLink['displayGroupIDint']
                    values = {'displayGroupIDint': displayGroupAndFunctionLink['displayGroupIDint'],\
                              'globalUniqueFunctionIDint': displayGroupAndFunctionLink['globalUniqueFunctionIDint'],\
                              'displaySubOrder': displayGroupAndFunctionLink['displaySubOrder'],\
                              'displayFunctionAdditionalInfo': displayGroupAndFunctionLink['displayFunctionAdditionalInfo']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'displayGroupIDint': row['displayGroupIDint'],\
                                     'globalUniqueFunctionIDint': row['globalUniqueFunctionIDint'],\
                                     'displaySubOrder': row['displaySubOrder'],\
                                     'displayFunctionAdditionalInfo': row['displayFunctionAdditionalInfo']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    displayGroupAndFunctionReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            """userGroup들을 check 한다.
            """
            userGroups = container['userGroups']
            userGroupReports = []
            
            retObj.AddReturnTable(userGroups)
            
            for userGroup in userGroups:
                paramNames = ('userGroupName',)
                paramValues = (userGroup['userGroupName'],)
                
                returnCode, retOpMsg = self.RequestSteerMind("importGetDetailUserGroup", 91, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultSet = retOpMsg.getResultSet(0)
                    key = userGroup['userGroupName']
                    values = {'userGroupName': userGroup['userGroupName'],\
                              'auditorUserGroupName': userGroup['auditorUserGroupName'],\
                              'userGroupUseFlag': userGroup['userGroupUseFlag'],\
                              'functionGroupName': userGroup['functionGroupName']}
                    
                    if resultSet[0]:
                        row = resultSet[0][0]
                        importType = 2
                        oldValues = {'userGroupName': row['userGroupName'],\
                                     'auditorUserGroupName': row['auditorUserGroupName'],\
                                     'userGroupUseFlag': row['userGroupUseFlag'],\
                                     'functionGroupName': row['functionGroupName']}
                    else:
                        importType = 1
                        oldValues = {}
                    
                    userGroupReports.append({'importType': importType, 'key': key, 'values': values, 'oldValues': oldValues})
                else:
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            reports = {'globalUniqueFunctions': globalUniqueFunctionReports,\
                       'functionGroups': functionGroupReports,\
                       'functionGroupAndFunctionLinks': functionGroupAndFunctionReports,\
                       'displayGroups': displayGroupReports,\
                       'displayGroupAndFunctionLinks': displayGroupAndFunctionReports,\
                       'userGroups': userGroupReports}
        else:
            """unpickle이 실패한 경우이므로 그냥 pass
            """
            pass
        
        if container:
            retObj.AddReturnValue("importFileName", importFileName)
            retObj.AddReturnValue('success', 'true')
            retObj.AddReturnValue('report', reports)
            retObj.SetReturnCode(SteerAdminError.SUCCESS)
        else:
            retObj.AddReturnValue('success', 'false')
        
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def importUserGroupAndFunctionGroupAndFunction(self, fileName):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        container = None
        
        try:
            filePath = os.path.join(self.rootPath, 'data/import/')
            
            readFile = io.FileIO(filePath + fileName, 'r')           
            receivedStream = readFile.readall()
            decompressedStream = zlib.decompress(receivedStream)
            container = pickle.loads(decompressedStream)
            readFile.close()
        except Exception as exc:
            return SteerWebExceptionHandler.ToReturnObject(exc)
        
        retObj = ReturnObject()
        retObj.SetReturnCode(SteerAdminError.SUCCESS)
        
        """container가 얻어진 경우에 한해서만 import 로직이 정상 동작 하도록 한다.
        """
        if container:
            """globalUniqueFunction들을 import 한다.
            """
            globalUniqueFunctions = container['globalUniqueFunctions']
            
            for globalUniqueFunction in globalUniqueFunctions:
                paramNames = ('globalUniqueFunctionIDint', 'serverType', 'functionIDint', 'functionName', 'functionUseFlag', 'dangerLevel', 'requireSessionFlag',\
                              'arguments', 'results', 'functionDescription', 'displayName', 'displaySortOrder')
                paramValues = (globalUniqueFunction['globalUniqueFunctionIDint'],\
                               globalUniqueFunction['serverType'],\
                               globalUniqueFunction['functionIDint'],\
                               globalUniqueFunction['functionName'],\
                               globalUniqueFunction['functionUseFlag'],\
                               globalUniqueFunction['dangerLevel'],\
                               globalUniqueFunction['requireSessionFlag'],\
                               globalUniqueFunction['arguments'],\
                               globalUniqueFunction['results'],\
                               globalUniqueFunction['functionDescription'],\
                               globalUniqueFunction['displayName'],\
                               globalUniqueFunction['displaySortOrder'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importReplaceFunction", 92, paramNames, paramValues)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
            
            """functionGroup들을 import 한다.
            """
            functionGroups = container['functionGroups']
            
            for functionGroup in functionGroups:
                paramNames = ('functionGroupName', 'functionGroupUseFlag')
                paramValues = (functionGroup['functionGroupName'],\
                               functionGroup['functionGroupUseFlag'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importReplaceFunctionGroup", 93, paramNames, paramValues)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
            
            """functionGroupAndFunctionLink들을 import 한다.
            * 링크를 한번에 등록하지 않을 경우 권한 문제가 발생할 수 있으므로, opMsg 내 blob에 압축하여 서버에 전달 후 한번에 처리한다.
            """
            functionGroupAndFunctionLinks = container['functionGroupAndFunctionLinks']
            
            if len(functionGroupAndFunctionLinks) > 0:
                arrLinksInfo = { "functionGroupNames": [],
                                "functionGroupAndFunctionLink": []}
                for functionGroup in functionGroups:
                    arrLinksInfo["functionGroupNames"].append(functionGroup['functionGroupName'])
                
                for functionGroupAndFunctionLink in functionGroupAndFunctionLinks:
                    arrLinksInfo["functionGroupAndFunctionLink"].append({'functionGroupName' : functionGroupAndFunctionLink['functionGroupName'],
                                         'globalUniqueFunctionIDint' : functionGroupAndFunctionLink['globalUniqueFunctionIDint'],
                                         'actionType' : functionGroupAndFunctionLink['actionType']
                                         })
    
                pickledStream = pickle.dumps(arrLinksInfo)
                compressedStream = zlib.compress(pickledStream)
    
                returnCode, retOpMsg = self.RequestSteerMind("importReplacefunctionGroupAndFunctionLinks", 94, (), (), compressedStream)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
           
            """userGroup들을 import 한다.
            """
            userGroups = container['userGroups']
            
            for userGroup in userGroups:
                paramNames = ('userGroupName', 'auditorUserGroupName', 'userGroupUseFlag', 'functionGroupName')
                paramValues = (userGroup['userGroupName'],\
                               userGroup['auditorUserGroupName'],\
                               userGroup['userGroupUseFlag'],\
                               userGroup['functionGroupName'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importReplaceUserGroup", 95, paramNames, paramValues)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
                
            """displayGroup을 import 한다.
            """
            displayGroups = container['displayGroups']
            
            for displayGroup in displayGroups:
                paramNames = ('displayGroupIDint', 'displayGroupName', 'displayGroupUseFlag', 'displayGroupType', 'displayOrder', 'displayAdditionalInfo', 'serviceName')
                paramValues = (displayGroup['displayGroupIDint'],\
                               displayGroup['displayGroupName'],\
                               displayGroup['displayGroupUseFlag'],\
                               displayGroup['displayGroupType'],\
                               displayGroup['displayOrder'],\
                               displayGroup['displayAdditionalInfo'],\
                               displayGroup['serviceName'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importReplaceDisplayGroup", 101, paramNames, paramValues)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
            
            """displayGroupAndFunctionLink을 import 한다.
            """
            displayGroupAndFunctionLinks = container['displayGroupAndFunctionLinks']
            
            for displayGroupAndFunctionLink in displayGroupAndFunctionLinks:
                paramNames = ('displayGroupIDint', 'globalUniqueFunctionIDint', 'displaySubOrder', 'displayFunctionAdditionalInfo')
                paramValues = (displayGroupAndFunctionLink['displayGroupIDint'],\
                               displayGroupAndFunctionLink['globalUniqueFunctionIDint'],\
                               displayGroupAndFunctionLink['displaySubOrder'],\
                               displayGroupAndFunctionLink['displayFunctionAdditionalInfo'])
                
                returnCode, retOpMsg = self.RequestSteerMind("importReplaceDisplayGroupAndFunctionLink", 102, paramNames, paramValues)
                
                if not SteerAdminError.IsSuccess(returnCode):
                    retObj.SetReturnCode(returnCode)
                    return retObj.ParseToJSON()
        else:
            retObj.SetReturnCode(SteerAdminError.INVALID_DATA)

        return retObj.ParseToJSON()

#=================================
    @cherrypy.expose
    def checkExportPrivileges(self):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        SteerAdminGlobal.Log.Debug('checkExportPrivileges Request')
        
        retObj = ReturnObject()
        returnCode = SteerAdminError.AUTH_NO_PRIVILEGE
        
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 74)): # Functions
            retObj.AddReturnValue("FunctionExport", 1)
            returnCode = SteerAdminError.SUCCESS

        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 73)): # Display Groups
            retObj.AddReturnValue("DisplayGroupExport", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 72)): # Function Groups
            retObj.AddReturnValue("FunctionGroupExport", 1)
            returnCode = SteerAdminError.SUCCESS
            
        if self.CheckAuthNoNoti(GUID.make(ServerCategory.steermind, 71)): # User Groups
            retObj.AddReturnValue("UserGroupExport", 1)
            returnCode = SteerAdminError.SUCCESS
            
        retObj.SetReturnCode(returnCode)
    
        SteerAdminGlobal.Log.Debug('checkExportPrivileges Response', returnCode)
        return retObj.ParseToJSON()

    @cherrypy.expose
    def exportLanguageResource(self, exportData):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        SteerAdminGlobal.Log.Debug('exportLanguageDataDownload Request', exportData)
        
        functions = []
        rowOffset, rowCount = 0, 100
        
        paramNames = ('rowOffset', 'rowCount')
        paramValues = (rowOffset, rowCount)
        
        returnCode, retOpMsg = self.RequestSteerMind("languageGetPageFunction", 103, paramNames, paramValues)
        
        if SteerAdminError.IsSuccess(returnCode):
            resultTable, totalCount = retOpMsg.getResultSet()
            functions += resultTable
            
            while rowOffset < totalCount:
                rowOffset += rowCount
                
                paramNames = ('rowOffset', 'rowCount')
                paramValues = (rowOffset, rowCount)
                
                returnCode, retOpMsg = self.RequestSteerMind("languageGetPageFunction", 103, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultTable, totalCount = retOpMsg.getResultSet()
                    functions += resultTable
        
        displayGroups = []
        rowOffset, rowCount = 0, 100
        
        paramNames = ('rowOffset', 'rowCount')
        paramValues = (rowOffset, rowCount)
        
        returnCode, retOpMsg = self.RequestSteerMind("languageGetPageDisplayGroup", 104, paramNames, paramValues)
        
        if SteerAdminError.IsSuccess(returnCode):
            resultTable, totalCount = retOpMsg.getResultSet()
            displayGroups += resultTable
            
            while rowOffset < totalCount:
                rowOffset += rowCount
                
                paramNames = ('rowOffset', 'rowCount')
                paramValues = (rowOffset, rowCount)
                
                returnCode, retOpMsg = self.RequestSteerMind("languageGetPageDisplayGroup", 104, paramNames, paramValues)
                
                if SteerAdminError.IsSuccess(returnCode):
                    resultTable, totalCount = retOpMsg.getResultSet()
                    displayGroups += resultTable
        
        exportPath = os.path.join(self.rootPath, 'data/export/')
        exportFileName_functions = "L10N_Function_%s_%d.csv" % (GetCherrySession('steerID'), int(time.time()))
        exportFileName_displayGroups = "L10N_DisplayGroup_%s_%d.csv" % (GetCherrySession('steerID'), int(time.time()))
        
        codePage = SteerAdminConfig.CodePage
        
        import csv
        
        function_writer = csv.writer(open(exportPath + exportFileName_functions, 'wb'), dialect=csv.excel)
        displayGroup_writer = csv.writer(open(exportPath + exportFileName_displayGroups, 'wb'), dialect=csv.excel)
        
        for function in functions:
            row = (function['globalUniqueFunctionIDint'].encode(codePage), function['functionDescription'].encode(codePage), function['displayName'].encode(codePage))
            function_writer.writerow(row)
        
        for displayGroup in displayGroups:
            row = (displayGroup['displayGroupIDint'].encode(codePage), displayGroup['displayGroupName'].encode(codePage))
            displayGroup_writer.writerow(row)
        
        retObj = ReturnObject()
        retObj.SetReturnCode(returnCode)
        retObj.AddReturnValue('functionFileName', exportFileName_functions)
        retObj.AddReturnValue('displayGroupFileName', exportFileName_displayGroups)
        
        return retObj.ParseToJSON()
    
    @cherrypy.expose
    def importLanguageResource(self, qqfile):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
        
        retObj = ReturnObject()
        
        try:
            fp = cherrypy.request.body
            receivedData = fp.read(int(cherrypy.request.headers["Content-Length"]))
               
            importPath = os.path.join(self.rootPath, 'data/import/')
            importFileName = str(int(time.time())) + "_" + qqfile
            
            importFile = open(importPath + importFileName, 'wb')
            importFile.write(receivedData)
            importFile.close()
            
            import csv
            
            reader = csv.reader(open(importPath + importFileName, 'rb'), dialect=csv.excel)
            
            fileName = qqfile.split('_')
            codePage = SteerAdminConfig.CodePage
            
            if fileName[1] == "Function":
                for row in reader:
                    paramNames = ('globalUniqueFunctionIDint', 'functionDescription', 'displayName')
                    paramValues = (unicode(row[0], codePage),
                                   unicode(row[1], codePage),
                                   unicode(row[2], codePage))
                    
                    returnCode, retOpMsg = self.RequestSteerMind("languageReplaceFunction", 105, paramNames, paramValues)
            elif fileName[1] == "DisplayGroup":
                for row in reader:
                    paramNames = ('displayGroupIDint', 'displayGroupName')
                    paramValues = (unicode(row[0], codePage),
                                   unicode(row[1], codePage))
                    
                    returnCode, retOpMsg = self.RequestSteerMind("languageReplaceDisplayGroup", 106, paramNames, paramValues)
        except Exception as exc:
            return SteerWebExceptionHandler.ToReturnObject(exc)
        
        retObj.SetReturnCode(0)
        retObj.AddReturnValue("success", "true")
        
        return retObj.ParseToJSON()

#=================================    
    @cherrypy.expose
    def getPageServerState(self, key, startIndex, results, sort, dir, serverCategory):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
 
        returnCode, retOpMsg = self.RequestSteerEye("getPageServerState", 3, ("rowOffset", "rowCount", "serverCategory"), (startIndex, results, serverCategory))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retDT = retOpMsg.getResultSet(0)
            i = 0
            for dt in retDT[0]:
                dt["index"] = i
                i = i + 1
                
            retObj.AddYUIDataTable(retDT, startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()
    
#=================================    
    @cherrypy.expose
    def getPageServerReport(self, key, startIndex, results, sort, dir, serverCategory, serverNumber):
        isExist, retObj = self.CheckSession()
        if not isExist:
            return retObj.ParseToJSON()
 
        returnCode, retOpMsg = self.RequestSteerEye("getPageServerReport", 4, ("rowOffset", "rowCount", "serverCategory", "serverNumber"), (startIndex, results, serverCategory, serverNumber))

        retObj = ReturnObject()
        if SteerAdminError.IsSuccess(returnCode):
            returnCode = retOpMsg.getResultCode()
            retDT = retOpMsg.getResultSet(0)
            i = 0
            for dt in retDT[0]:
                dt["index"] = i
                i = i + 1
            retObj.AddYUIDataTable(retDT, startIndex, results, sort, dir)

        retObj.SetReturnCode(returnCode)
        return retObj.ParseToJSON()