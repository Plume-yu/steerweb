#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 6. 9.

@author: rakho.kang

For OpMsg.proto version 4.2
'''

import OpMsg_pb2
from pyCruise.ServerCategory import ServerCategory, GUID

HexDumpFilter=''.join([(len(repr(chr(x))) == 3) and chr(x) or '.' for x in range(256)])
def hexdump(src, length = 32):
    N, result = 0, ''
    while src:
        s, src = src[:length], src[length:]
        hexa = ' '.join(["%02X"%ord(x) for x in s])
        s = s.translate(HexDumpFilter)
        result += "%04X   %-*s   %s\n" % (N, length * 3, hexa, s)
        N += length
    return result

class ConvertMode:
    SENDER = 1
    RECEIVER = 2
    NEVER = 3

class ResultSetMode:
    TUPLE = 1
    DICT = 2

class JobType:
    REQUEST = 1
    RESPONSE = 2
    NOTICE = 3
    name = {REQUEST: "REQUEST",
            RESPONSE: "RESPONSE",
            NOTICE: "NOTICE"}
    
class ExecType:
    EXECUTE = 1
    CAST = 2
    name = {EXECUTE: "EXECUTE",
            CAST: "CAST"}

class OpMsg:
    #{ServerCategory: (characterSet, isNullTermination)}
    convertCategory = {ServerCategory.arbitergw: ("utf-16-le", True),
                       ServerCategory.boxbridgedorian: ("utf-16-le", True)}
    
    def __init__(self):
        self.msg = OpMsg_pb2.OpMsg()
    
    def _parseConvert(self, gusid):
        convertInfo = self.convertCategory.get(GUID.getCategory(gusid))
        if convertInfo != None:
            characterSet, isNullTermination = convertInfo
            
            for argument in self.msg.arguments:
                name = argument.name.decode(characterSet)
                value = argument.value.decode(characterSet)
                if isNullTermination:
                    name = name[:-1]
                    value = value[:-1]
                argument.name = name.encode("utf-8")
                argument.value = value.encode("utf-8")
            
            if self.msg.HasField('result_scalar'):
                resultScalar = self.msg.result_scalar.decode(characterSet)
                if isNullTermination:
                    resultScalar = resultScalar[:-1]
                self.msg.result_scalar = resultScalar.encode("utf-8")
            
            for result_set in self.msg.result_sets:
                for index in range(len(result_set.column_names)):
                    column_name = result_set.column_names[index].decode(characterSet)
                    if isNullTermination:
                        column_name = column_name[:-1]
                    result_set.column_names[index] = column_name.encode("utf-8")
                
                for row in result_set.rows:
                    for index in range(len(row.values)):
                        value = row.values[index].decode(characterSet)
                        if isNullTermination:
                            value = value[:-1]
                        row.values[index] = value.encode("utf-8")
    
    def _serializeConvert(self, gusid):
        convertInfo = self.convertCategory.get(GUID.getCategory(gusid))
        if convertInfo != None:
            characterSet, isNullTermination = convertInfo
            
            msg = OpMsg_pb2.OpMsg()
            msg.ParseFromString(self.msg.SerializeToString())
            
            for argument in msg.arguments:
                name = argument.name.decode("utf-8")
                value = argument.value.decode("utf-8")
                if isNullTermination:
                    name += "\0"
                    value += "\0"
                argument.name = name.encode(characterSet)
                argument.value = value.encode(characterSet)
            
            if msg.HasField('result_scalar'):
                resultScalar = msg.result_scalar.decode("utf-8")
                if isNullTermination:
                    resultScalar += "\0"
                msg.result_scalar = resultScalar.encode(characterSet)
            
            for result_set in msg.result_sets:
                for index in range(len(result_set.column_names)):
                    column_name = result_set.column_names[index].decode("utf-8")
                    if isNullTermination:
                        column_name += "\0"
                    result_set.column_names[index] = column_name.encode(characterSet)
                
                for row in result_set.rows:
                    for index in range(len(row.values)):
                        value = row.values[index].decode("utf-8")
                        if isNullTermination:
                            value += "\0"
                        row.values[index] = value.encode(characterSet)
        else:
            msg = self.msg
        
        return msg
    
    def _convertUnicode(self, param):
        if param == None:
            return u''
        elif isinstance(param, str):
            return unicode(param, "utf-8")
        elif isinstance(param, unicode):
            return param
        elif isinstance(param, int) or isinstance(param, long) or isinstance(param, float):
            return unicode(param)
        else:
            raise

    def parse(self, protoStream, convertMode = ConvertMode.SENDER):
        self.msg.ParseFromString(protoStream)
        
        if convertMode == ConvertMode.SENDER:
            self._parseConvert(self.getSenderGUSID())
        elif convertMode == ConvertMode.RECEIVER:
            self._parseConvert(self.getReceiverGUSID())
        elif convertMode == ConvertMode.NEVER:
            pass
        else:
            raise
        
        return self
    
    def parseSkipEncoding(self, serializedString):
        self.msg.ParseFromString(serializedString)
    
    def serialize(self, convertMode = ConvertMode.RECEIVER):
        if convertMode == ConvertMode.SENDER:
            msg = self._serializeConvert(self.getSenderGUSID())
        elif convertMode == ConvertMode.RECEIVER:
            msg = self._serializeConvert(self.getReceiverGUSID())
        elif convertMode == ConvertMode.NEVER:
            msg = self.msg
        else:
            raise
        
        return msg.SerializeToString()
    
    def serializeSkipEncoding(self):
        return self.msg.SerializeToString()
    
    def getSenderGUSID(self):
        return self.msg.sender_gusid
    
    def setSenderGUSID(self, gusid):
        self.msg.sender_gusid = gusid
        return self
    
    def getReceiverGUSID(self):
        return self.msg.receiver_gusid
    
    def setReceiverGUSID(self, gusid):
        self.msg.receiver_gusid = gusid
        return self
    
    def swapSenderReceiver(self):
        temp = self.msg.receiver_gusid
        self.msg.receiver_gusid = self.msg.sender_gusid
        self.msg.sender_gusid = temp
        return self
    
    def getJobType(self):
        return self.msg.job_type
    
    def setJobType(self, jobType):
        self.msg.job_type = jobType
        return self
    
    def getJobID(self):
        return self.msg.job_id
    
    def setJobID(self, jobID):
        self.msg.job_id = jobID
        return self
    
    def getGUFID(self):
        return self.msg.gufid
    
    def setGUFID(self, gufid):
        self.msg.gufid = gufid
        return self
    
    def getExecType(self):
        return self.msg.exec_type
    
    def setExecType(self, execType):
        self.msg.exec_type = execType
        return self

    def getCasteeUserGroup(self):
        return self.msg.cast_target_user_group_sn
    
    def setCasteeUserGroup(self, castTargetUserGroupSN):
        self.msg.cast_target_user_group_sn = castTargetUserGroupSN
        return self
    
    def getSessionKey(self):
        return self.msg.session_key
    
    def setSessionKey(self, sessionKey):
        self.msg.session_key = sessionKey
        return self
    
    def makeRequest(self, senderGUSID, receiverGUSID, GUFID, jobID, execType = ExecType.EXECUTE):
        self.setSenderGUSID(senderGUSID)
        self.setReceiverGUSID(receiverGUSID)
        self.setJobType(JobType.REQUEST)
        self.setJobID(jobID)
        self.setGUFID(GUFID)
        self.setExecType(execType)
        return self
    
    def makeResponse(self, senderGUSID, receiverGUSID, GUFID, jobID, resultCode = None, execType = ExecType.EXECUTE):
        self.setSenderGUSID(senderGUSID)
        self.setReceiverGUSID(receiverGUSID)
        self.setJobType(JobType.RESPONSE)
        self.setJobID(jobID)
        self.setGUFID(GUFID)
        self.setExecType(execType)
        if resultCode != None:
            self.setResultCode(resultCode)
        return self
    
    def makeResponseFromRequest(self, senderGUSID, requestOpMsg, resultCode = None):
        self.makeResponse(senderGUSID,
                          requestOpMsg.getSenderGUSID(),
                          requestOpMsg.getGUFID(),
                          requestOpMsg.getJobID(),
                          resultCode,
                          requestOpMsg.getExecType())
        return self
    
    def changeRequestToResponse(self, senderGUSID, resultCode):
        self.setSenderGUSID(senderGUSID)
        self.setReceiverGUSID(self.getSenderGUSID())
        self.setJobType(JobType.RESPONSE)
        self.setResultCode(resultCode)
        return self
    
    def addArgument(self, name, value):
        argument = self.msg.arguments.add()
        if name:
            argument.name = self._convertUnicode(name).encode("utf-8")
        argument.value = self._convertUnicode(value).encode("utf-8")
        return self
    
    def addArgumentFromDict(self, sourceDict):
        for key, value in sourceDict.iteritems():
            self.addArgument(key, value)
        return self
    
    def copyArgumentFromSource(self, sourceSteerMsg):
        for sourceArgument in sourceSteerMsg.msg.arguments:
            argument = self.msg.arguments.add()
            if (sourceArgument.name):
                argument.name = sourceArgument.name
            argument.value = sourceArgument.value
        return self
    
    def getArguments(self):
        """
        @return: {}
        """
        argumentDict = {}
        argumentIndex = 0
        
        for argument in self.msg.arguments:
            value = (argument.value).decode("utf-8")
            if argument.name:
                name = (argument.name).decode("utf-8")
                argumentDict[name] = value
            else:
                argumentDict[argumentIndex] = value
            argumentIndex += 1
        return argumentDict
    
    def arguments2str(self):
        arguments = self.getArguments()
        rtn = '{'
        for key, value in arguments.iteritems():
            rtn += '%s:%s , ' % (key, value)
        rtn += '}'
        return rtn

    def getResultCode(self):
        return self.msg.result_code
    
    def setResultCode(self, resultCode):
        self.msg.result_code = resultCode
        return self

    def getResultScalar(self):
        return (self.msg.result_scalar).decode("utf-8")
    
    def setResultScalar(self, resultScalar):
        self.msg.result_scalar = self._convertUnicode(resultScalar).encode("utf-8")
        return self
    
    def addResultSet(self, rows, totalCount = None):
        """
        @param rows: [{},] or ({}, ) or [[],] or [(),] or ([],) or ((),)
        @param totalCount: int
        """
        if len(rows) > 0:
            if isinstance(rows[0], dict):
                resultSet = self.msg.result_sets.add()
                if totalCount != None:
                    resultSet.total_count = totalCount
                
                for columnName in rows[0].iterkeys():
                    resultSet.column_names.append(self._convertUnicode(columnName).encode("utf-8"))
                
                for rowDict in rows:
                    newRow = resultSet.rows.add()
                    for value in rowDict.itervalues():
                        newRow.values.append(self._convertUnicode(value).encode("utf-8"))
            else:
                resultSet = self.msg.result_sets.add()
                if totalCount != None:
                    resultSet.total_count = totalCount
                
                for row in rows:
                    newRow = resultSet.rows.add()
                    for value in row:
                        newRow.values.append(self._convertUnicode(value).encode("utf-8"))
        else:
            if totalCount != None:
                resultSet = self.msg.result_sets.add()
                resultSet.total_count = totalCount
        
        return self

    def addResultSetEx(self, columnNames, rows, totalCount):
        """
        @param columnNames: [, ] or (,)
        @param rows: [ [], ] or ...
        @param totoaCount: int    
        """
        resultSet = self.msg.result_sets.add()
        if totalCount != None:
            resultSet.total_count = totalCount
        
        if columnNames != None:
            for columnName in columnNames:
                resultSet.column_names.append(self._convertUnicode(columnName).encode("utf-8"))
        
        for values in rows:
            newRow = resultSet.rows.add()
            for value in values:
                newRow.values.append(self._convertUnicode(value).encode("utf-8"))
        
        return self

    
    def getResultSet(self, index = 0, resultSetMode = ResultSetMode.DICT):
        """
        @return: ( [{},], int ) or ( [[],], int )
        """
        resultSet, totalCount = [], 0
        
        if index < len(self.msg.result_sets):
            result_set = self.msg.result_sets[index]
            
            if result_set.HasField('total_count'):
                totalCount = result_set.total_count
            
            if resultSetMode == ResultSetMode.DICT:
                if len(result_set.column_names) == 0:
                    for row in result_set.rows:
                        newRow = {}
                        columnIndex = 0
                        for value in row.values:
                            newRow[columnIndex] = value.decode("utf-8")
                            columnIndex += 1
                        resultSet.append(newRow)
                else:
                    for row in result_set.rows:
                        newRow = {}
                        columnIndex = 0
                        for value in row.values:
                            newRow[result_set.column_names[columnIndex].decode("utf-8")] = value.decode("utf-8")
                            columnIndex += 1
                        resultSet.append(newRow)
            elif resultSetMode == ResultSetMode.TUPLE:
                for row in result_set.rows:
                    newRow = []
                    for value in row.values:
                        newRow.append(value.decode("utf-8"))
                    resultSet.append(newRow)
        
        return resultSet, totalCount
    
    def getResultSetColumnNames(self, index = 0):
        """
        @return: []
        """
        columnNames = []
        
        if index < len(self.msg.result_sets):
            result_set = self.msg.result_sets[index]
            
            for column_name in result_set.column_names:
                columnNames.append(column_name.decode("utf-8"))
        
        return columnNames
    
    def getResultSetCount(self):
        """
        @return: int
        """
        return len(self.msg.result_sets)

    def getAllResultSet(self):
        """
        @returns: [ {'totalCount':n , 'columnNames':[] , 'dataTable':[ [], ]  }, ]
        """
        resultSet = []
        for result in self.msg.result_sets:
            newDict = {}
            newDict['totalCount'] = result.total_count
            
            newDict['columnNames'] = []
            for columnName in result.column_names:
                newDict["columnNames"].append(columnName.decode("utf-8"))
            
            newDict['dataTable'] = []
            for row in result.rows:
                values = []
                for value in row.values:
                    values.append(value.decode("utf-8"))
                newDict['dataTable'].append(values)

            resultSet.append(newDict)
        return resultSet


    def getBlob(self):
        return self.msg.blob
    
    def setBlob(self,blob):
        self.msg.blob = blob
        return self

    def __str__(self):
        return """
    JobID:           %s
    JobType:         %s
    Sender:          %s
    Receiver:        %s
    GUFID:           %s
    ExecType:        %s
    SessionKey:      %s
    CasteeUserGroup: %s
    Arguments:       %s
    ResultCode:      %s
    ResultScalar:    %s
    ResultSet:       %s
    BLOB             %s""" % (self.getJobID(),
                              JobType.name.get(self.getJobType()),
                              GUID.toString(self.getSenderGUSID()),
                              GUID.toString(self.getReceiverGUSID()),
                              GUID.toString(self.getGUFID()),
                              ExecType.name.get(self.getExecType()),
                              self.getSessionKey(),
                              self.getCasteeUserGroup(),
                              self.getArguments(),
                              self.getResultCode(),
                              self.getResultScalar(),
                              self.getAllResultSet(),
                              hexdump(self.getBlob()))

__all__ = ["JobType", "ExecType", "OpMsg", "hexdump"]

if __name__ == '__main__':
    def CheckExecutionTime():
        import datetime
        
        a = datetime.datetime.now()
        
        for index in range(10000):
            req = OpMsg()
            req.makeRequest(GUID.make(ServerCategory.boxapi, 1), GUID.make(ServerCategory.steermind, 1), GUID.make(ServerCategory.steermind, 1), 1L, ExecType.EXECUTE)
            req.addArgument("name", "rakho")
            req.addArgument("sex", "male")
            
            msg = req.serialize()
            
            recv = OpMsg()
            recv.parse(msg)
            
            res = OpMsg()
            res.makeResponseFromRequest(GUID.make(ServerCategory.steermind, 1), recv, 0)
            
            resultSet = [{'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'}]
            
            res.addResultSet(resultSet, len(resultSet))
            
            msg = res.serialize()
            
            recv = OpMsg()
            recv.parse(msg)
        
        b = datetime.datetime.now()
        
        print b - a
        
        a = datetime.datetime.now()
        
        for index in range(10000):
            req = OpMsg()
            req.makeRequest(GUID.make(ServerCategory.arbitergw, 1), GUID.make(ServerCategory.arbitergw, 1), GUID.make(ServerCategory.arbitergw, 1), 1L, ExecType.EXECUTE)
            req.addArgument("name", "rakho")
            req.addArgument("sex", "male")
            
            msg = req.serialize()
            
            recv = OpMsg()
            recv.parse(msg)
            
            res = OpMsg()
            res.makeResponseFromRequest(GUID.make(ServerCategory.arbitergw, 1), recv, 0)
            
            resultSet = [{'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'},
                         {'name0': 'rako', 'name1': 'rako', 'name2': 'rako', 'name3': 'rako', 'name4': 'rako', 'name5': 'rako', 'name6': 'rako', 'name7': 'rako', 'name8': 'rako', 'name9': 'rako'}]
            
            res.addResultSet(resultSet, len(resultSet))
            
            msg = res.serialize()
            
            recv = OpMsg()
            recv.parse(msg)
        
        b = datetime.datetime.now()
        
        print b - a
    
    CheckExecutionTime()
