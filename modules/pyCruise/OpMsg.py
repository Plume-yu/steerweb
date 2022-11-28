#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2011. 4. 8.

@author: rakho.kang
'''

import OpMsgEncoder
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
        self.sender_gusid = None
        self.receiver_gusid = None
        self.job_type = None
        self.job_id = None
        self.gufid = None
        self.exec_type = None
        self.cast_target_user_group_sn = None
        self.session_key = None
        self.arguments = []
        self.result_code = None
        self.result_scalar = None
        self.result_sets = []
        self.blob = None

    def parse(self, serializedString, convertMode = ConvertMode.SENDER):
        sender_gusid,\
        receiver_gusid,\
        job_type,\
        job_id,\
        gufid,\
        exec_type,\
        cast_target_user_group_sn,\
        session_key,\
        arguments,\
        result_code,\
        result_scalar,\
        result_sets,\
        blob = OpMsgEncoder.parse(serializedString)
        
        self.sender_gusid = sender_gusid
        self.receiver_gusid = receiver_gusid
        self.job_type = job_type
        self.job_id = job_id
        self.gufid = gufid
        self.exec_type = exec_type
        self.cast_target_user_group_sn = cast_target_user_group_sn
        self.session_key = session_key
        self.arguments = self._decodeArguments(sender_gusid, arguments)
        self.result_code = result_code
        self.result_scalar = self._decodeResultScalar(sender_gusid, result_scalar)
        self.result_sets = self._decodeResultSets(sender_gusid, result_sets)
        self.blob = blob
        
        return self
    
    def serialize(self, convertMode = ConvertMode.RECEIVER):
        return OpMsgEncoder.serialize(self.sender_gusid,\
                                      self.receiver_gusid,\
                                      self.job_type,\
                                      self.job_id,\
                                      self.gufid,\
                                      self.exec_type,\
                                      self.cast_target_user_group_sn,\
                                      self.session_key,\
                                      self._encodeArguments(self.receiver_gusid, self.arguments),\
                                      self.result_code,\
                                      self._encodeResultScalar(self.receiver_gusid, self.result_scalar),\
                                      self._encoderResultSets(self.receiver_gusid, self.result_sets),\
                                      self.blob)
    
    def getSenderGUSID(self):
        return self.sender_gusid
    
    def setSenderGUSID(self, gusid):
        self.sender_gusid = gusid
        return self
    
    def getReceiverGUSID(self):
        return self.receiver_gusid
    
    def setReceiverGUSID(self, gusid):
        self.receiver_gusid = gusid
        return self
    
    def swapSenderReceiver(self):
        self.sender_gusid, self.receiver_gusid = self.receiver_gusid, self.sender_gusid
        return self
    
    def getJobType(self):
        return self.job_type
    
    def setJobType(self, jobType):
        self.job_type = jobType
        return self
    
    def getJobID(self):
        return self.job_id
    
    def setJobID(self, jobID):
        self.job_id = jobID
        return self
    
    def getGUFID(self):
        return self.gufid
    
    def setGUFID(self, gufid):
        self.gufid = gufid
        return self
    
    def getExecType(self):
        return self.exec_type
    
    def setExecType(self, execType):
        self.exec_type = execType
        return self

    def getCasteeUserGroup(self):
        return self.cast_target_user_group_sn
    
    def setCasteeUserGroup(self, castTargetUserGroupSN):
        self.cast_target_user_group_sn = castTargetUserGroupSN
        return self
    
    def getSessionKey(self):
        return self.session_key
    
    def setSessionKey(self, sessionKey):
        self.session_key = sessionKey
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
        self.arguments.append((self._convertUnicode(name), self._convertUnicode(value)))
        return self
    
    def addArgumentFromDict(self, sourceDict):
        for key, value in sourceDict.iteritems():
            self.arguments.append((self._convertUnicode(key), self._convertUnicode(value)))
        return self
    
    def copyArgumentFromSource(self, sourceOpMsg):
        for argument in sourceOpMsg.arguments:
            self.arguments.append(argument)
        return self
    
    def getArguments(self):
        """
        @return: {}
        """
        arguments = {}
        index = 0
        
        for name, value in self.arguments:
            if name:
                arguments[name] = value
            else:
                arguments[index] = value
            index += 1
        return arguments
    
    def _getArguments(self):
        return self.arguments
    
    def arguments2str(self):
        rtn = '{'
        for name, value in self.arguments:
            rtn += '%s:%s , ' % (name, value)
        rtn += '}'
        return rtn

    def getResultCode(self):
        return self.result_code
    
    def setResultCode(self, resultCode):
        self.result_code = resultCode
        return self

    def getResultScalar(self):
        return self.result_scalar
    
    def setResultScalar(self, resultScalar):
        self.result_scalar = self._convertUnicode(resultScalar)
        return self
    
    def addResultSet(self, rows, totalCount = 0):
        """
        @param rows: [{},] or ({}, ) or [[],] or [(),] or ([],) or ((),)
        @param totalCount: int
        """
        result_set_column_names = []
        result_set_rows = []
        
        if len(rows) > 0:
            if isinstance(rows[0], dict):
                for columnName in rows[0].iterkeys():
                    result_set_column_names.append(self._convertUnicode(columnName))
                
                for row in rows:
                    newRow = []
                    for value in row.itervalues():
                        newRow.append(self._convertUnicode(value))
                    result_set_rows.append(newRow)
            else:
                for row in rows:
                    newRow = []
                    for value in row:
                        newRow.append(self._convertUnicode(value))
                    result_set_rows.append(newRow)
        
        self.result_sets.append((result_set_column_names, result_set_rows, totalCount))
        
        return self

    def addResultSetEx(self, columnNames, rows, totalCount):
        """
        @param columnNames: [, ] or (,)
        @param rows: [ [], ] or ...
        @param totoaCount: int    
        """
        column_names_new = []
        rows_new = []
        
        if columnNames:
            for column_name in columnNames:
                column_names_new.append(self._convertUnicode(column_name))
        
        for row in rows:
            row_new = []
            for value in row:
                row_new.append(self._convertUnicode(value))
            rows_new.append(row_new)
        
        self.result_sets.append((column_names_new, rows_new, totalCount))
        
        return self

    
    def getResultSet(self, index = 0, resultSetMode = ResultSetMode.DICT):
        """
        @return: ( [{},], int ) or ( [[],], int )
        """
        result_set_new, total_count = [], 0
        
        if index < len(self.result_sets):
            result_set = self.result_sets[index]
            
            total_count = result_set[2]
            
            if resultSetMode == ResultSetMode.DICT:
                column_names = result_set[0]
                
                if column_names:
                    for row in result_set[1]:
                        row_new = {}
                        column_index = 0
                        
                        for value in row:
                            row_new[column_names[column_index]] = value
                            column_index += 1
                        
                        result_set_new.append(row_new)
                else:
                    for row in result_set[1]:
                        row_new = {}
                        column_index = 0
                        
                        for value in row:
                            row_new[column_index] = value
                            column_index += 1
                        
                        result_set_new.append(row_new)
            elif resultSetMode == ResultSetMode.TUPLE:
                for row in result_set[1]:
                    row_new = []
                    
                    for value in row:
                        row_new.append(value)
                    
                    result_set_new.append(row_new)
        
        return result_set_new, total_count
    
    def getResultSetColumnNames(self, index = 0):
        """
        @return: []
        """
        if index < len(self.result_sets):
            return self.result_sets[index][0]
        else:
            return []
    
    def getResultSetCount(self):
        """
        @return: int
        """
        return len(self.result_sets)

    def getAllResultSet(self):
        """
        @returns: [ {'totalCount':n , 'columnNames':[] , 'dataTable':[ [], ]  }, ]
        """
        result_sets = []
        
        for result_set in self.result_sets:
            result_set_new = {}
            result_set_new['columnNames'] = result_set[0]
            result_set_new['dataTable'] = result_set[1]
            result_set_new['totalCount'] = result_set[2]
            result_sets.append(result_set_new)
        
        return result_sets
    
    def _getAllResultSet(self):
        return self.result_sets
    
    def getBlob(self):
        return self.blob
    
    def setBlob(self,blob):
        self.blob = blob
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
                              self._getArguments(),
                              self.getResultCode(),
                              self.getResultScalar(),
                              self._getAllResultSet(),
                              hexdump(self.getBlob()))
    
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
    
    def _encodeArguments(self, gusid, arguments):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        arguments_new = []
        
        for name, value in arguments:
            if isNullTermination:
                name_converted = u"{0}{1}".format(name, u"\0").encode(characterSet)
                value_converted = u"{0}{1}".format(value, u"\0").encode(characterSet)
            else:
                name_converted = name.encode(characterSet)
                value_converted = value.encode(characterSet)
            
            arguments_new.append((name_converted, value_converted))
        
        return arguments_new
    
    def _encodeResultScalar(self, gusid, result_scalar):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        result_scalar_new = None
        
        if result_scalar:
            if isNullTermination:
                result_scalar_new = u"{0}{1}".format(result_scalar, u"\0").encode(characterSet)
            else:
                result_scalar_new = result_scalar.encode(characterSet)
        
        return result_scalar_new
    
    def _encoderResultSets(self, gusid, result_sets):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        result_sets_new = []
        
        for result_set in result_sets:
            column_names_new = []
            rows_new = []
            
            for column_name in result_set[0]:
                if isNullTermination:
                    column_name_converted = u"{0}{1}".format(column_name, u"\0").encode(characterSet)
                else:
                    column_name_converted = column_name.encode(characterSet)
                
                column_names_new.append(column_name_converted)
            
            for row in result_set[1]:
                row_new = []
                for value in row:
                    if isNullTermination:
                        value_converted = u"{0}{1}".format(value, u"\0").encode(characterSet)
                    else:
                        value_converted = value.encode(characterSet)
                    
                    row_new.append(value_converted)
                rows_new.append(row_new)
            
            result_sets_new.append((column_names_new, rows_new, result_set[2]))
        
        return result_sets_new
    
    def _decodeArguments(self, gusid, arguments):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        arguments_new = []
        
        for name, value in arguments:
            name_converted = name.decode(characterSet)
            value_converted = value.decode(characterSet)
            if isNullTermination:
                name_converted = name_converted[:-1]
                value_converted = value_converted[:-1]
            arguments_new.append((name_converted, value_converted))
        
        return arguments_new
    
    def _decodeResultScalar(self, gusid, result_scalar):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        result_scalar_new = None
        
        if result_scalar:
            result_scalar_new = result_scalar.decode(characterSet)
            
            if isNullTermination:
                result_scalar_new = result_scalar_new[:-1]
            
        return result_scalar_new
    
    def _decodeResultSets(self, gusid, result_sets):
        characterSet, isNullTermination = self.convertCategory.get(GUID.getCategory(gusid), ("utf-8", False))
        
        result_sets_new = []
        
        for result_set in result_sets:
            column_names_new = []
            rows_new = []
            
            for column_name in result_set[0]:
                column_name_new = column_name.decode(characterSet)
                
                if isNullTermination:
                    column_name_new = column_name_new[:-1]
                
                column_names_new.append(column_name_new)
            
            for row in result_set[1]:
                row_new = []
                
                for value in row:
                    value_new = value.decode(characterSet)
                    
                    if isNullTermination:
                        value_new = value_new[:-1]
                    
                    row_new.append(value_new)
                
                rows_new.append(row_new)
            
            result_sets_new.append((column_names_new, rows_new, result_set[2]))
        
        return result_sets_new

__all__ = ["JobType", "ExecType", "OpMsg", "hexdump"]

if __name__ == '__main__':
    """Do not encoded
    """
    req = OpMsg()
    req.makeRequest(GUID.make(ServerCategory.boxapi, 1), GUID.make(ServerCategory.steermind, 1), GUID.make(ServerCategory.steermind, 1), 1L, ExecType.EXECUTE)
    req.addArgument("name", "rakho")
    req.addArgument("sex", "male")
    
    msg = req.serialize()
    
    recv = OpMsg()
    recv.parse(msg)
    
    res = OpMsg()
    res.makeResponseFromRequest(GUID.make(ServerCategory.steermind, 1), recv, 0)
    
    resultSet = [{'name': 'rako',
                  'number': '1'},
                 {'name': 'hoho',
                  'number': '2'}]
    
    res.addResultSet(resultSet, len(resultSet))
    
    msg = res.serialize()
    
    recv = OpMsg()
    recv.parse(msg)
    
    print recv.getResultSet(0, ResultSetMode.TUPLE)
    
    """Do encoded
    """
    req = OpMsg()
    req.makeRequest(GUID.make(ServerCategory.arbitergw, 1), GUID.make(ServerCategory.arbitergw, 1), GUID.make(ServerCategory.arbitergw, 1), 1L, ExecType.EXECUTE)
    req.addArgument("name", "rakho")
    req.addArgument("sex", "male")
    
    msg = req.serialize()
    
    recv = OpMsg()
    recv.parse(msg)
    
    res = OpMsg()
    res.makeResponseFromRequest(GUID.make(ServerCategory.arbitergw, 1), recv, 0)
    
    resultSet = [{'name': 'rako',
                  'number': '1'},
                 {'name': 'hoho',
                  'number': '2'}]
    
    res.addResultSet(resultSet, len(resultSet))
    
    msg = res.serialize()
    
    recv = OpMsg()
    recv.parse(msg)
    
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
    
    pass