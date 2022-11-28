# -*- coding: utf-8 -*-
'''
Created on 2011. 2. 9.

@author: rakho.kang
'''

import struct
import random
import hub_pb2
from twisted.internet import reactor
from PlatformBase import PlatformBaseProtocol
from PlatformBase import PlatformBaseClientFactory
from OpMsg import JobType, OpMsg
from Error import CruiseError

class PlatformBaseHubClientProtocol(PlatformBaseProtocol):
    idFormat = 'H'
    idSize = struct.calcsize(idFormat)
    
    def __init__(self, watchServerCategoryList = None):
        PlatformBaseProtocol.__init__(self)
        self.sentMessageMap = {}
        self.requestedMessageMap = {}
        self.watchServerCategories = {}
        if watchServerCategoryList != None:
            if isinstance(watchServerCategoryList, tuple) or isinstance(watchServerCategoryList, list):
                for category in watchServerCategoryList:
                    self.watchServerCategories[category] = []
        
        self.hubFunctionMap = {2: self.parseRegisterAns,
                               4: self.parseSendMessageAns,
                               5: self.parseRecvMessageReq,
                               6: self.parsePingReq,
                               8: self.parseServerEvent}
    
    def connectionMade(self):
        self.register()
    
    def stringReceived(self, data):
        msgID, = struct.unpack(self.idFormat, data[:self.idSize])
        self.hubFunctionMap[msgID](data[self.idSize:])
    
    def sendResponse(self, serverID, jobID, msgID, msgStream, args = None, errback = None):
        sentInfo = (serverID, jobID, msgID, msgStream)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self._sendMessage(serverID, jobID, msgID, msgStream)
    
    def selectServer(self, serverID):
        #serverID의 number부분이 0인 경우
        #watchServerCategories에 serverID의 category가 존재하는지 첵크해서
        #리스트 중에 하나를 랜덤 선택하여 셋팅
        if (serverID & 0x00ffffff) == 0:
            category = (serverID & 0xff000000) >> 24
            if len(self.watchServerCategories[category]) > 0:
                if category in self.watchServerCategories:
                    serverID = random.choice(self.watchServerCategories[category])
        return serverID
    
    def sendNotice(self, serverID, jobID, msgID, msgStream, args = None, errback = None):
        serverID = self.selectServer(serverID)
        sentInfo = (serverID, jobID, msgID, msgStream)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self._sendMessage(serverID, jobID, msgID, msgStream)
    
    def sendRequest(self, serverID, jobID, msgID, msgStream, args, callback, errback = None):
        serverID = self.selectServer(serverID)
        sentInfo = (serverID, jobID, msgID, msgStream)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self.requestedMessageMap[jobID] = (sentInfo, args, callback, errback)
        self._sendMessage(serverID, jobID, msgID, msgStream)
    
    def broadcast(self, serverCategory, msgID, msgStream, args, callback = None):
        jobID = self.factory.snm.getSN()
        for serverID in self.watchServerCategories[serverCategory]:
            self.sentMessageMap[jobID] = (None, args, None)
            self._sendMessage(serverID, jobID, msgID, msgStream)
    
    def _sendMessage(self, serverID, jobID, msgID, msgStream):
        req = hub_pb2.SendMessageReq()
        req.server_id = serverID
        req.job_id = jobID
        req.msg_buf = struct.pack(self.idFormat, msgID) + msgStream
        self.sendString(struct.pack(self.idFormat, 3) + req.SerializeToString())
    
    def register(self):
        req = hub_pb2.RegisterReq()
        req.server_id = self.factory.gusid
        for category in self.watchServerCategories.iterkeys():
            req.event_sub.append(category)
        self.sendString(struct.pack(self.idFormat, 1) + req.SerializeToString())
    
    def parseRegisterAns(self, msg):
        res = hub_pb2.RegisterAns()
        res.ParseFromString(msg)
        
        if res.result:
            self.factory.log.Console("critical", "Registered to HUB")
            self.factory.log.Console('critical', "$ Server ready $\r\n")
            for gusid in res.server_list:
                category = (gusid & 0xff000000) >> 24
                self.watchServerCategories[category].append(gusid)
            
            if hasattr(self.factory, 'RegisterCallback'):
                self.factory.RegisterCallback(self)
        else:
            self.factory.log.ConsoleError("Failed to register to HUB")
            if hasattr(self.factory, 'RegisterErrback'):
                self.factory.RegisterErrback(self)
            reactor.stop()
    
    def parseServerEvent(self, msg):
        res = hub_pb2.ServerEvent()
        res.ParseFromString(msg)
        category = (res.server_id & 0xff000000) >> 24
        
        if res.event == hub_pb2.ServerEvent.CONNECTED:
            self.watchServerCategories[category].append(res.server_id)
        else:
            for index in range(len(self.watchServerCategories[category])):
                if self.watchServerCategories[category][index] == res.server_id:
                    del self.watchServerCategories[category][index]
                    break
    
    def parseSendMessageAns(self, msg):
        recv = hub_pb2.SendMessageAns()
        recv.ParseFromString(msg)
        
        infos = self.sentMessageMap.pop(recv.job_id, None)
        
        if infos:
            sentInfo, args, errback = infos
            if sentInfo:
                serverID, jobID, msgID, msgStream = sentInfo
                if not recv.result:
                    if errback != None:
                        if msgID == 1:
                            opMsg = OpMsg().parse(msgStream)
                            errback(self, serverID, jobID, opMsg, args)
                        else:
                            errback(self, serverID, jobID, msgID, msgStream, args)
    
    def parseRecvMessageReq(self, msg):
        recv = hub_pb2.RecvMessageReq()
        recv.ParseFromString(msg)
        serverID = recv.server_id
        jobID = recv.job_id
        msgID, = struct.unpack(self.idFormat, recv.msg_buf[:self.idSize])
        msgBody = recv.msg_buf[self.idSize:]
        
        if msgID == 1:
            try:
                opMsg = OpMsg().parse(msgBody)
            except UnicodeError, e:
                self.factory.log.Error(e)
                opMsg = OpMsg().parseSkipEncoding(msgBody)
                if opMsg.getJobType() == JobType.REQUEST:
                    opMsg.changeRequestToResponse(self.factory.gusid, CruiseError.BuildFromGUSID(self.factory.gusid, CruiseError.CHARACTER_SET_ERROR))
                    self.sendResponse(serverID, jobID, msgID, opMsg.serializeSkipEncoding())
            except Exception, e:
                self.factory.log.Error(e)
                opMsg = OpMsg().parseSkipEncoding(msgBody)
                if opMsg.getJobType() == JobType.REQUEST:
                    opMsg.changeRequestToResponse(self.factory.gusid, CruiseError.BuildFromGUSID(self.factory.gusid, CruiseError.SYSTEM_ERROR))
                    self.sendResponse(serverID, jobID, msgID, opMsg.serializeSkipEncoding())
            
            if opMsg.getJobType() == JobType.REQUEST:
                function = self.factory.functionMap.get(opMsg.getGUFID())
                if function:
                    try:
                        function(self, serverID, jobID, opMsg)
                    except Exception, e:
                        #Logic Function에서 exception이 난 경우 처리
                        self.factory.log.Error("Raise exception in function", opMsg)
                        opMsg.changeRequestToResponse(self.factory.gusid, CruiseError.BuildFromGUSID(self.factory.gusid, CruiseError.SYSTEM_ERROR))
                        self.sendResponse(serverID, jobID, msgID, opMsg.serialize())
                else:
                    self.factory.log.Error("Do not exist function", opMsg)
                    opMsg.changeRequestToResponse(self.factory.gusid, CruiseError.BuildFromGUSID(self.factory.gusid, CruiseError.NOT_EXIST_FUNCTION))
                    self.sendResponse(serverID, jobID, msgID, opMsg.serialize())
            else:
                params = self.requestedMessageMap.pop(jobID, None)
                if params:
                    sentInfo, args, callback, errback = params
                    if callback:
                        '''받은 serverID, jobID, opMsg가 인자로 들어온다.
                        '''
                        callback(self, serverID, jobID, opMsg, args)
                else:
                    self.factory.log.Info("Do not find request object", opMsg)
        else:
            function = self.factory.functionMap.get(msgID)
            
            if function:
                function(self, serverID, jobID, msgID, msgBody)
            else:
                params = self.requestedMessageMap.pop(jobID, None)
                if params:
                    sentInfo, args, callback, errback = params
                    if callback:
                        callback(self, serverID, jobID, msgID, msgBody, args)
                else:
                    self.factory.log.Error("Do not exist function", "serverID", serverID, "jobID", jobID, "msgID", msgID)
    
    def parseArguments(self, functionArgumentNames, opMsgArguments):
        foundArguments = {}
        notFoundArgumentNames = []
        
        for functionArgumentName in functionArgumentNames:
            if functionArgumentName in opMsgArguments:
                foundArguments[functionArgumentName] = opMsgArguments[functionArgumentName]
            else:
                notFoundArgumentNames.append(functionArgumentName)
        
        return foundArguments, notFoundArgumentNames
    
    def parsePingReq(self, msg):
        recv = hub_pb2.PingReq()
        recv.ParseFromString(msg)
        
        res = hub_pb2.PingAns()
        self.sendString(struct.pack(self.idFormat, 7) + res.SerializeToString())

class PlatformBaseHubClientFactory(PlatformBaseClientFactory):
    def __init__(self, gusid, log, functionMap):
        PlatformBaseClientFactory.__init__(self)
        self.gusid = gusid
        self.log = log
        self.functionMap = functionMap
        
__all__ = ["PlatformBaseHubClientProtocol", "PlatformBaseHubClientFactory"]
