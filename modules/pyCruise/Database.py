#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 7. 5.

@author: rakho.kang
'''

import thread
import MySQLdb.cursors
from twisted.python import reflect
from twisted.internet import reactor

class DatabaseConnectionPool:
    def __init__(self, cruiseLog, dbapiName, *connargs, **connkw):
        self.log = cruiseLog
        self.dbapi = reflect.namedModule(dbapiName)
        self.connargs = connargs
        self.connkw = connkw
        self.dbConnections = {}
        reactor.addSystemEventTrigger('during', 'shutdown', self._closeAllConnection)
    
    def _closeAllConnection(self):
        for connection in self.dbConnections.values():
            connection.close()
    
    def _connect(self):
        """Database에 연결한다.
        connect에 성공하면 connection object를 반환하고, connection을 threadID를 key로 하여 저장한다.
        connect에 실패하면 None을 반환한다.
        """
        try:
            dbConnection = self.dbapi.connect(*self.connargs, **self.connkw)
        except:
            dbConnection = None
            self.log.ConsoleError('Failed to connect to the database host [%s:%s] db [%s].' % (self.connkw['host'], self.connkw['port'], self.connkw['db']))
        
        if dbConnection != None:
            threadID = thread.get_ident()
            self.dbConnections[threadID] = dbConnection
        
        return dbConnection
    
    def _disconnect(self):
        """Database 연결을 닫는다.
        connection을 close하고 threadID를 key로하여 저장되어 있는 connection을 지운다.
        """
        threadID = thread.get_ident()
        dbConnection = self.dbConnections.get(threadID)
        dbConnection.close()
        del self.dbConnections[threadID]
    
    def _getConnection(self):
        """Database connection을 얻는다.
        threadID로 이미 생성된 connection이 있으면 해당 connection을 반환하고, 없으면 database에 connect하여 반환한다.
        database에 connect가 실패할 경우 None이 반환될 수 있다.
        """
        threadID = thread.get_ident()
        dbConnection = self.dbConnections.get(threadID)
        if dbConnection == None:
            dbConnection = self._connect()
        return dbConnection
    
    def _getCursor(self, cursorClass = None):
        """Cursor를 얻는다.
        connection을 얻은 후 해당 connection의 cursor를 만들어서 반환 한다.
        database에 connect가 안되어 connection이 None이 반환되면 cursor를 만들 수 없음으로 None이 반환된다.
        """
        dbConnection = self._getConnection()
        if dbConnection != None:
            cursor = dbConnection.cursor(cursorClass)
        else:
            cursor = None
        
        return cursor
    
    def _callProc(self, procedureName, params):
        """기본 Cursor를 이용하여 SP를 호출한다.
        cursor가 None으로 얻어지면 None을 반환한다.
        cursor가 정상적으로 얻어지면 SP를 호출하고, SP 호출시 에러가 나면 database 연결을 닫고 다시 cursor를 얻어 SP 호출을 시도한다. 이때도 실패하면  None을 반환한다.
        """
        cursor = self._getCursor()
        if cursor != None:
            try:
                cursor.callproc(procedureName, params)
            except:
                self._disconnect()
                cursor = self._getCursor()
                if cursor != None:
                    try:
                        cursor.callproc(procedureName, params)
                    except:
                        cursor = None
                        self.log.ConsoleError('Failed to call a procedure [%s] with params [%s].' % (procedureName, params))
        
        return cursor
    
    def _callProcDict(self, procedureName, params):
        """Dictionary Cursor를 이용하여 SP를 호출한다.
        cursor가 None으로 얻어지면 None을 반환한다.
        cursor가 정상적으로 얻어지면 SP를 호출하고, SP 호출시 에러가 나면 database 연결을 닫고 다시 cursor를 얻어 SP 호출을 시도한다. 이때도 실패하면  None을 반환한다.
        """
        cursor = self._getCursor(MySQLdb.cursors.DictCursor)
        if cursor != None:
            try:
                cursor.callproc(procedureName, params)
            except:
                self._disconnect()
                cursor = self._getCursor(MySQLdb.cursors.DictCursor)
                if cursor != None:
                    try:
                        cursor.callproc(procedureName, params)
                    except:
                        cursor = None
                        self.log.ConsoleError('Failed to call a procedure [%s] with params [%s].' % (procedureName, params))
        
        return cursor
    
    def _commit(self):
        threadID = thread.get_ident()
        self.dbConnections[threadID].commit()
        
    def callProcTuple(self, procedureName, inParams, outParams, doCommit = True):
        """ SP를 호출하여 Output parameter tuple과 Tuple List 형태의 결과 집합을 얻는다.
        @param dbConnection: db connection을 입력한다.
        @param procedureName: 호출할 SP의 이름을 입력한다.
        @param inParams: Input parameter들을 Tuple 형태로 입력한다.
        @param outParams: Output parameter들을 Tuple 형태로 입력한다. 개수만큼 None으로 입력한다.
        """
        # input, output 파라미터의 type을 첵크한다.
        # tuple이 아닌 경우 tuple로 변환
        if not isinstance(inParams, tuple):
            inParams = (inParams,)
        if not isinstance(outParams, tuple):
            outParams = (outParams,)
        
        # SP의 output 값을 얻어오기 위한 사전 작업을 한다.
        inParamCount, outParamCount = len(inParams), len(outParams)
        outParamQuery = 'SELECT'
        
        # MySqlDB의 SP output을 가져오기 위한 규칙인
        # @_procedureName_index 를 만드는 작업을 한다.
        # outParamQuery에는 SP의 output을 query 하기 위한 string을 저장한다.
        for index in range(inParamCount, inParamCount + outParamCount):
            name = '@_' + procedureName + '_' + str(index)
            if index != inParamCount:
                outParamQuery = outParamQuery + ', ' + name
            else:
                outParamQuery = outParamQuery + ' ' + name
        
        cursor = self._callProc(procedureName, inParams + outParams)
        
        if cursor != None:
            # 반환된 DataTable을 저장한다.
            # 여러개의 resultDict가 반환되는 것도 가능하도록 list에 저장
            dataSet = []
            while True:
                result = cursor.fetchall()
                dataSet.append(result)
                cursor.nextset()
                if not result:
                    break
            
            # SP의 output을 얻어온다.
            cursor.execute(outParamQuery)
            params = cursor.fetchone()
            
            cursor.close()
            
            if doCommit:
                self._commit()
            
            result = True
        else:
            result = False
            params = None
            dataSet = None
        
        return result, params, dataSet
    
    def callProcDict(self, procedureName, inParams, outParams, doCommit = True):
        """ SP를 호출하여 Output parameter tuple과 Dict List 형태의 결과 집합을 얻는다.
        @param dbConnection: db connection을 입력한다.
        @param procedureName: 호출할 SP의 이름을 입력한다.
        @param inParams: Input parameter들을 Tuple 형태로 입력한다.
        @param outParams: Output parameter들을 Tuple 형태로 입력한다. 개수만큼 None으로 입력한다.
        """
        # input, output 파라미터의 type을 첵크한다.
        # tuple이 아닌 경우 tuple로 변환
        if not isinstance(inParams, tuple):
            inParams = (inParams,)
        if not isinstance(outParams, tuple):
            outParams = (outParams,)
        
        # SP의 output 값을 얻어오기 위한 사전 작업을 한다.
        inParamCount, outParamCount = len(inParams), len(outParams)
        outParamNames = []
        outParamQuery = 'SELECT'
        
        # MySqlDB의 SP output을 가져오기 위한 규칙인
        # @_procedureName_index 를 만드는 작업을 한다.
        # outParamNames에는 SP의 output을 얻기 위한 string을 저장하고
        # outParamQuery에는 SP의 output을 query 하기 위한 string을 저장한다.
        for index in range(inParamCount, inParamCount + outParamCount):
            name = '@_' + procedureName + '_' + str(index)
            if index != inParamCount:
                outParamQuery = outParamQuery + ', ' + name
            else:
                outParamQuery = outParamQuery + ' ' + name
            outParamNames.append(name)
        
        cursor = self._callProcDict(procedureName, inParams + outParams)
        
        if cursor != None:
            # 반환된 DataTable을 저장한다.
            # 여러개의 resultDict가 반환되는 것도 가능하도록 list에 저장
            dataSet = []
            while True:
                result = cursor.fetchall()
                dataSet.append(result)
                cursor.nextset()
                if not result:
                    break
            
            # SP의 output을 얻어온다.
            cursor.execute(outParamQuery)
            dictParams = cursor.fetchone()
            
            # SP의 output을 tuple로 만든다.
            params = ()
            for name in outParamNames:
                params = params + (dictParams[name],)
            
            # cursor를 닫고 해당 connection을 commit 하여
            # 해당 연결을 초기화 한다.
            cursor.close()
            
            if doCommit:
                self._commit()
            
            result = True
        else:
            result = False
            params = None
            dataSet = None
        
        return result, params, dataSet
