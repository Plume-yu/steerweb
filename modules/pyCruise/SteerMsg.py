#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2011. 4. 11.

@author: rakho.kang
'''

from OpMsg import JobType as JobType_OpMsg
from OpMsg import ExecType as ExecType_OpMsg
from OpMsg import OpMsg
from pyCruise.ServerCategory import ServerCategory, GUID
from SteerSessionKey import SteerSessionKey

class JobType:
    Request = JobType_OpMsg.REQUEST
    Response = JobType_OpMsg.RESPONSE
    Notice = JobType_OpMsg.NOTICE
    
class ExecType:
    Execute = ExecType_OpMsg.EXECUTE
    Cast = ExecType_OpMsg.CAST

class SteerMsg(OpMsg):
    @staticmethod
    def makeErrorReturnPacket(steerMsg, returnCode):
        newMsg = SteerMsg().setAll(JobType.Response,
                                   steerMsg.getExecType(),
                                   steerMsg.getGUFID(),
                                   steerMsg.getRequestSN(),
                                   steerMsg.getReceiverGUSID(),
                                   steerMsg.getSenderGUSID(),
                                   steerMsg.getActor())
        newMsg.setReturnCode(returnCode)
        return newMsg
    
    def __init__(self, data = None):
        OpMsg.__init__(self)
        if data:
            self.parse(data)

    def setAll(self,
               jobType = JobType.Request,
               execType = ExecType.Execute,
               gufid = 0,
               requestSN = 0,
               sender = GUID.make(ServerCategory.steergw),
               receiver = GUID.make(ServerCategory.steermind),
               actor = 0,
               sessionkey = None):
        self.setJobType(jobType)
        self.setGUFID(gufid)
        self.setRequestSN(requestSN)
        self.setSenderGUSID(sender)
        self.setReceiverGUSID(receiver)
        self.setExecType(execType)
        if sessionkey is None :
            if actor is None:
                actor = 0
            self.setActor(actor)
        else :
            self.setSessionKey(sessionkey)
        return self
    
    def makeRequest(self, senderGUSID, receiverGUSID, GUFID, jobID, execType = ExecType.Execute):
        self.setSenderGUSID(senderGUSID)
        self.setReceiverGUSID(receiverGUSID)
        self.setJobType(JobType.Request)
        self.setJobID(jobID)
        self.setGUFID(GUFID)
        self.setExecType(execType)
        return self
    
    def makeResponse(self, senderGUSID, receiverGUSID, GUFID, jobID, resultCode = None, execType = ExecType.Execute):
        self.setSenderGUSID(senderGUSID)
        self.setReceiverGUSID(receiverGUSID)
        self.setJobType(JobType.Response)
        self.setJobID(jobID)
        self.setGUFID(GUFID)
        self.setExecType(execType)
        if resultCode != None:
            self.setResultCode(resultCode)
        return self

    def fromProtoStream(self, protoStream):
        self.parse(protoStream)
        return self
    
    def toProtoStream(self):
        return self.serialize()
    
    #호환성을 위해서 이전 함수이름도 지원한다.
    getRequestSN = OpMsg.getJobID
    setRequestSN = OpMsg.setJobID
    
    getSeq = OpMsg.getJobID
    setSeq = OpMsg.setJobID
    
    #호환성을 위해서 이전 함수이름도 지원한다.
    getFnID = OpMsg.getGUFID
    setFnID = OpMsg.setGUFID
    
    def getActor(self):
        rtn = SteerSessionKey.parse(self.session_key)
        return rtn[0] if rtn else None
    
    def setActor(self, userSN):
        self.session_key = SteerSessionKey.make(userSN)
        return self
    
    #호환성을 위해서 이전 함수이름도 지원한다.
    addArg = OpMsg.addArgument
    copyArgsFrom = OpMsg.copyArgumentFromSource
    addDicToArgs = OpMsg.addArgumentFromDict
    
    getArgs = OpMsg.getArguments
    args2str = OpMsg.arguments2str
    
    getErrorcode = OpMsg.getResultCode
    setErrorcode = OpMsg.setResultCode
    
    getReturnCode = OpMsg.getResultCode
    setReturnCode = OpMsg.setResultCode
    
    # 이후는 resultsets 관련 함수들
    addResultSet = OpMsg.addResultSetEx

    # 단지 호환성만을 위해 존재하는 함수.
    def setRtns2(self,returnCode, totalCount, cols,rows):
        cl = len(cols)
        rl = len(rows)
        nrows = [rows[st:st+cl] for st in range(0, rl, cl)]
        self.addResultSet(cols,nrows,totalCount)
        self.setReturnCode(returnCode)
        return self
    
    def setMaxCount(self,totalCount,resultsetnumber = 0):
        self.result_sets[resultsetnumber][2] = totalCount
        return self
    
    def getMaxCount(self,resultsetnumber = 0):
        return self.result_sets[resultsetnumber][2]

    def __str__(self):
        return """SteerMsg: [
    jobType:%s
    GUFID:%s
    requestSN:%s
    From %s to %s 
    sessionKey:%s
    executeType:%s
    castTargetUserGroupSN:%s 
    arguments %s
    returnCode %s
    resultScalar %s
    resultSets %s
    ]""" % (
            self.getJobType(),
            GUID.toString(self.getGUFID()),
            self.getRequestSN(),
            GUID.toString(self.getSenderGUSID()),
            GUID.toString(self.getReceiverGUSID()),
            self.getSessionKey(),
            self.getExecType(),
            self.getCasteeUserGroup(),
            self.args2str(),
            self.getReturnCode(),
            self.getResultScalar(),
            self.getResultSet(),
            )

__all__ = ["JobType", "ExecType", "SteerMsg"]