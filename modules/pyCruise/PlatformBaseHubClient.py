# -*- coding: utf-8 -*-
'''
Created on 2011. 1. 1.

@author: rakho.kang
'''

import struct
import random
import hub_pb2
from twisted.internet import reactor
from PlatformBase import PlatformBaseProtocol
from PlatformBase import PlatformBaseClientFactory
from OpMsg import JobType, OpMsg

class ServerEvent:
    CONNECTED = 1
    DISCONNECTED = 2

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
                    self.watchServerCategories[category] = set()
        
        self.hubFunctionMap = {2: self.parseRegisterAns,
                               4: self.parseSendMessageAns,
                               5: self.parseRecvMessageReq,
                               6: self.parsePingReq,
                               8: self.parseServerEvent}
    
    def connectionMade(self):
        self.register()
    
    def stringReceived(self, data):
        msgID, = struct.unpack_from(self.idFormat, data)
        self.hubFunctionMap[msgID](data[self.idSize:])
    
    def sendResponse(self, serverID, jobID, opMsg, args = None, errback = None):
        sentInfo = (serverID, jobID, opMsg)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self._sendMessage(serverID, jobID, 1, opMsg.serialize())
    
    def selectServer(self, serverID):
        #serverID의 number부분이 0인 경우
        #watchServerCategories에 serverID의 category가 존재하는지 첵크해서
        #리스트 중에 하나를 랜덤 선택하여 셋팅
        if (serverID & 0x00ffffff) == 0:
            category = (serverID & 0xff000000) >> 24
            if len(self.watchServerCategories[category]) > 0:
                if category in self.watchServerCategories:
                    serverID = random.choice(list(self.watchServerCategories[category]))
        return serverID
    
    def sendNotice(self, serverID, jobID, opMsg, args = None, errback = None):
        serverID = self.selectServer(serverID)
        sentInfo = (serverID, jobID, opMsg)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self._sendMessage(serverID, jobID, 1, opMsg.serialize())
    
    def broadcastNotice(self, serverID, jobID, opMsg, args = None, errback = None):
        category = (serverID & 0xff000000) >> 24
        
        for receiverGUSID in self.watchServerCategories[category]:
            newJobID = self.factory.snm.getSN()
            opMsg.setJobID(newJobID)
            opMsg.setReceiverGUSID(receiverGUSID)
            
            sentInfo = (receiverGUSID, newJobID, opMsg)
            self.sentMessageMap[newJobID] = (sentInfo, args, errback)
            self._sendMessage(receiverGUSID, newJobID, 1, opMsg.serialize())
    
    def sendRequest(self, serverID, jobID, opMsg, args, callback, errback = None):
        serverID = self.selectServer(serverID)
        sentInfo = (serverID, jobID, opMsg)
        self.sentMessageMap[jobID] = (sentInfo, args, errback)
        self.requestedMessageMap[jobID] = (sentInfo, args, callback, errback)
        self._sendMessage(serverID, jobID, 1, opMsg.serialize())
    
    def broadcast(self, serverCategory, msgID, msg, extras, requested, callback = None):
        jobID = self.factory.snm.getSN()
        for serverID in self.watchServerCategories[serverCategory]:
            self.sentMessageMap[jobID] = (None, requested, extras, None)
            self._sendMessage(serverID, jobID, msgID, msg)
    
    def _sendMessage(self, serverID, jobID, msgID, msg):
        req = hub_pb2.SendMessageReq()
        req.server_id = serverID
        req.job_id = jobID
        req.msg_buf = struct.pack(self.idFormat, msgID) + msg
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
                self.watchServerCategories[category].add(gusid)
            
            self.registerSucceeded()
            
            if hasattr(self.factory, 'RegisterCallback'):
                self.factory.RegisterCallback(self)
        else:
            self.factory.log.ConsoleError("Failed to register to HUB")
            if hasattr(self.factory, 'RegisterErrback'):
                self.factory.RegisterErrback(self)
            reactor.stop()
    
    def registerSucceeded(self):
        pass
    
    def parseServerEvent(self, msg):
        res = hub_pb2.ServerEvent()
        res.ParseFromString(msg)
        category = (res.server_id & 0xff000000) >> 24
        
        if res.event == hub_pb2.ServerEvent.CONNECTED:
            self.watchServerCategories[category].add(res.server_id)
            self.serverEventReceived(ServerEvent.CONNECTED, res.server_id)
        else:
            self.watchServerCategories[category].remove(res.server_id)
            self.serverEventReceived(ServerEvent.DISCONNECTED, res.server_id)
    
    def serverEventReceived(self, serverEvent, serverID):
        pass
    
    def parseSendMessageAns(self, msg):
        recv = hub_pb2.SendMessageAns()
        recv.ParseFromString(msg)
        
        infos = self.sentMessageMap.pop(recv.job_id, None)
        
        if infos != None:
            sentInfo, args, errback = infos
            serverID, jobID, opMsg = sentInfo
            if not recv.result:
                self.factory.log.Info("Failed to send", opMsg)
                if errback != None:
                    '''보냈던 serverID, jobID, opMsg가 인자로 들어온다.
                    '''
                    errback(self, serverID, jobID, opMsg, args)
    
    def parseRecvMessageReq(self, msg):
        recv = hub_pb2.RecvMessageReq()
        recv.ParseFromString(msg)
        serverID = recv.server_id
        jobID = recv.job_id
        msgID, = struct.unpack(self.idFormat, recv.msg_buf[:self.idSize])
        
        if msgID == 1:
            opMsg = OpMsg().parse(recv.msg_buf[self.idSize:])
            if opMsg.getJobType() == JobType.REQUEST:
                functionArgumentNames = self.factory.functionArgumentNamesMap.get(opMsg.getGUFID())
                if functionArgumentNames != None:
                    foundArguments, notFoundArgumentNames = self.parseArguments(functionArgumentNames, opMsg.getArguments())
                    if len(notFoundArgumentNames) == 0:
                        function = self.factory.functionMap.get(opMsg.getGUFID())
                        if function != None:
                            function(self, serverID, jobID, opMsg, **foundArguments)
                        else:
                            self.factory.log.Error("Do not exist function", opMsg)
                    else:
                        self.factory.log.Error("Insufficient arguments", "Insufficient Argument names", notFoundArgumentNames, opMsg)
                else:
                    self.factory.log.Error("Do not exist argument names of function", "jobID", opMsg)
            else:
                params = self.requestedMessageMap.pop(jobID, None)
                if params != None:
                    sentInfo, args, callback, errback = params
                    if callback != None:
                        '''받은 serverID, jobID, opMsg가 인자로 들어온다.
                        '''
                        callback(self, serverID, jobID, opMsg, args)
                else:
                    self.factory.log.Info("Do not find request object", opMsg)
        else:
            self.factory.log.Info("Wrong Message ID", opMsg)
    
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
    def __init__(self, gusid, log, functionMap, functionArgumentNamesMap):
        PlatformBaseClientFactory.__init__(self)
        self.gusid = gusid
        self.log = log
        self.functionMap = functionMap
        self.functionArgumentNamesMap = functionArgumentNamesMap
        
__all__ = ["PlatformBaseHubClientProtocol", "PlatformBaseHubClientFactory"]

