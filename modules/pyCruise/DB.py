#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on Mar 25, 2010

@author: lunacalos

Modified on Jan 1, 2011    rakho.kang
Modified on Apr 8, 2011    lunacalos
'''

import sys
import MySQLdb
from MySQLdb.cursors import DictCursor
import traceback
from pyCruise.Error import CruiseError


def CallProcDefer(dbpool, procedureName, inParams, outParams):
    df = dbpool.runWithConnection(CallProc,
                                  procedureName,
                                  inParams,
                                  outParams)
    return df

def CallProcDictDefer(dbpool, procedureName, inParams, outParams):
    df = dbpool.runWithConnection(CallProcDict,
                                  procedureName,
                                  inParams,
                                  outParams)
    return df

def CallProc(conn, procedureName, inParams, outParams, dataTableCount = None):
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
    
    # Cursor를 생성하여 DB의 SP를 호출한다.
    # Cursor의 생성이 실패하거나 프로시저의 호출이 실패하는 경우 1번더 retry 한다.
    try:
        cursor = conn.cursor()
        cursor.callproc(procedureName, inParams + outParams)
    except:
        print traceback.format_exc()
        try:
            conn.reconnect()
            cursor = conn.cursor()
            cursor.callproc(procedureName, inParams + outParams)
        except:
            cursor = None
            print traceback.format_exc()
    
    if cursor != None:
        # 반환된 DataTable을 저장한다.
        # 여러개의 resultDict가 반환되는 것도 가능하도록 list에 저장
        resultSet = []
        if not dataTableCount:
            #dataTableCount입력이 없으면 빈 튜플이 나올때까지 loop를 돈다.
            while True:
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
                if not result:
                    break
        else:
            #dataTableCount 입력이 있으면 입력된 개수만큼 loop를 돈다.
            for index in range(dataTableCount):
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
        
        # SP의 output을 얻어온다.
        cursor.execute(outParamQuery)
        resultParams = cursor.fetchone()
        
        cursor.close()
        conn.commit()
        
        callResult = True
    else:
        callResult = False
        resultParams = None
        resultSet = None
    
    return callResult, resultParams, resultSet

def CallProcDict(conn, procedureName, inParams, outParams, dataTableCount = None):
    """ SP를 호출하여 Output parameter tuple과 Dict List 형태의 결과 집합을 얻는다.
    @param dbConnection: db connection을 입력한다.
    @param procedureName: 호출할 SP의 이름을 입력한다.
    @param inParams: Input parameter들을 Tuple 형태로 입력한다.
    @param outParams: Output parameter들을 Tuple 형태로 입력한다. 개수만큼 None으로 입력한다.
    """
    #input, output 파라미터의 type을 첵크한다.
    #tuple이 아닌 경우 tuple로 변환
    if not isinstance(inParams, tuple):
        inParams = (inParams,)
    if not isinstance(outParams, tuple):
        outParams = (outParams,)
    
    #SP의 output 값을 얻어오기 위한 사전 작업을 한다.
    inParamCount, outParamCount = len(inParams), len(outParams)
    outParamNames = []
    outParamQuery = 'SELECT'
    
    #MySqlDB의 SP output을 가져오기 위한 규칙인
    #@_procedureName_index 를 만드는 작업을 한다.
    #outParamNames에는 SP의 output을 얻기 위한 string을 저장하고
    #outParamQuery에는 SP의 output을 query 하기 위한 string을 저장한다.
    for index in range(inParamCount, inParamCount + outParamCount):
        name = '@_' + procedureName + '_' + str(index)
        if index != inParamCount:
            outParamQuery = outParamQuery + ', ' + name
        else:
            outParamQuery = outParamQuery + ' ' + name
        outParamNames.append(name)
    
    #DictCursor를 생성하여 DB의 SP를 호출한다.
    #Cursor의 생성이 실패하거나 프로시저의 호출이 실패하는 경우 1번더 retry 한다.
    try:
        cursor = conn.cursor(DictCursor)
        cursor.callproc(procedureName, inParams + outParams)
    except:
        try:
            conn.reconnect()
            cursor = conn.cursor(DictCursor)
            cursor.callproc(procedureName, inParams + outParams)
        except:
            cursor = None
    
    if cursor != None:
        #반환된 DataTable을 저장한다.
        #여러개의 resultDict가 반환되는 것도 가능하도록 list에 저장
        resultSet = []
        if not dataTableCount:
            #dataTableCount입력이 없으면 빈 튜플이 나올때까지 loop를 돈다.
            while True:
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
                if not result:
                    break
        else:
            #dataTableCount 입력이 있으면 입력된 개수만큼 loop를 돈다.
            for index in range(dataTableCount):
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
        
        # SP의 output을 얻어온다.
        cursor.execute(outParamQuery)
        dictParams = cursor.fetchone()
        
        # SP의 output을 tuple로 만든다.
        resultParams = ()
        for name in outParamNames:
            resultParams = resultParams + (dictParams[name],)
        
        # cursor를 닫고 해당 connection을 commit 하여
        # 해당 연결을 초기화 한다.
        cursor.close()
        conn.commit()
        
        callResult = True
    else:
        callResult = False
        resultParams = None
        resultSet = None
    
    return callResult, resultParams, resultSet

def CallProc2(conn, procedureName, inParams, outParams, dataTableCount = None, isUseDict = True, retry = True):
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
    
    if isUseDict:
        outParamNames = []
    
    # MySqlDB의 SP output을 가져오기 위한 규칙인
    # @_procedureName_index 를 만드는 작업을 한다.
    #outParamNames에는 SP의 output을 얻기 위한 string을 저장하고
    # outParamQuery에는 SP의 output을 query 하기 위한 string을 저장한다.
    for index in range(inParamCount, inParamCount + outParamCount):
        name = '@_' + procedureName + '_' + str(index)
        if index != inParamCount:
            outParamQuery = outParamQuery + ', ' + name
        else:
            outParamQuery = outParamQuery + ' ' + name
        if isUseDict:
            outParamNames.append(name)
    
    # Cursor를 생성하여 DB의 SP를 호출한다.
    # Cursor의 생성이 실패하거나 프로시저의 호출이 실패하는 경우 1번더 retry 한다.
    try:
        if isUseDict:
            cursor = conn.cursor(DictCursor)
        else:
            cursor = conn.cursor()
        
        cursor.callproc(procedureName, inParams + outParams)
    except MySQLdb.OperationalError as (errorNumber, errorMessage):
        if errorNumber == 2006:
            if retry:
                try:
                    conn.reconnect()
                    if isUseDict:
                        cursor = conn.cursor(DictCursor)
                    else:
                        cursor = conn.cursor()
                    cursor.callproc(procedureName, inParams + outParams)
                except:
                    cursor = None
                    callFailure = sys.exc_info()
            else:
                try:
                    conn.reconnect()
                    cursor = None
                except:
                    cursor = None
                    callFailure = sys.exc_info()
        else:
            cursor = None
            callFailure = sys.exc_info()
    except:
        cursor = None
        callFailure = sys.exc_info()
    
    if cursor != None:
        # 반환된 DataTable을 저장한다.
        # 여러개의 resultDict가 반환되는 것도 가능하도록 list에 저장
        resultSet = []
        if not dataTableCount:
            #dataTableCount입력이 없으면 빈 튜플이 나올때까지 loop를 돈다.
            while True:
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
                if not result:
                    break
        else:
            #dataTableCount 입력이 있으면 입력된 개수만큼 loop를 돈다.
            for index in range(dataTableCount):
                result = cursor.fetchall()
                resultSet.append(result)
                cursor.nextset()
        
        if isUseDict:
            # SP의 output을 얻어온다.
            cursor.execute(outParamQuery)
            dictParams = cursor.fetchone()
            
            # SP의 output을 tuple로 만든다.
            resultParams = ()
            for name in outParamNames:
                resultParams = resultParams + (dictParams[name],)
        else:
            # SP의 output을 얻어온다.
            cursor.execute(outParamQuery)
            resultParams = cursor.fetchone()
        
        cursor.close()
        
        callResult = True
        callFailure = None
    else:
        callResult = False
        resultParams = None
        resultSet = None
    
    return callResult, callFailure, resultParams, resultSet

# fetch data set and return values from DB 
def RunProcWrapper(cursor, procName, inParam, outParam):
    '''
    Returns list of selected datasets and list of result values
    @param cursor: Created db cursor
    @param procName:  A procedure's name you want to call
    @param inParam: Input parameters for a procedure
    @param outParam: Output parameters for a procedure (tuple) or number of output parameters (integer value)  
    '''
    #In this case, as an order of parameters, output parameters must be placed next to the input parameters
    if type(inParam) != type(()):
        inParam = (inParam,)
    
    if type(outParam) == int:
        outParam = tuple([None] * outParam)
    elif type(outParam) != type(()):
        outParam = (outParam,)
        
    cursor.execute("set names utf8" )

    cursor.callproc (procName, inParam + outParam)
    fetchSets = []
    while True:
        result = cursor.fetchall()
        cursor.nextset() # For ignoring previous result set
        if not result:
            break
        else:
            fetchSets.append(result)

    outParamIdx = range(len(inParam), len(inParam + outParam))
    stmt = "SELECT "
    for idx in outParamIdx:
        stmt = stmt + "@_" + procName + "_" + str(idx)
        if (idx + 1) < len(inParam + outParam):
            stmt = stmt + ","
            
    cursor.execute(stmt)
    fetchVals = cursor.fetchone()
    
    return fetchSets, fetchVals

# fetch database version
def GetDBVersion(optHost, optPort, optUser, optPasswd, optDB):
    try:
        mysql = MySQLdb.connect(host = optHost, port = optPort, user = optUser, passwd = optPasswd, db = optDB)
        mysql_cursor = mysql.cursor()
        
        mysql_cursor.callproc("P_GetDBVersion", (None, None))
        mysql_cursor.execute("SELECT @_P_GetDBVersion_0, @_P_GetDBVersion_1")
        
        returnCode, version = mysql_cursor.fetchone()

        mysql_cursor.close()
        mysql.close()
        
        if CruiseError.IsSUCCESS(returnCode):
            if version == None:
                return False, None, (-1, "Database Version was not recognized in [%s]" % (optDB))
            else:
                return True, version, None
        else:
            return False, None, (-1, "Procedure returns error code [%d] in [%s]" % (returnCode, optDB))
    except MySQLdb.Error, e:
        return False, None, e.args

def CheckDBTimeZone(host, port, user, passwd, db):
    result, reason = False, ""
    
    try:
        conn = MySQLdb.connect(host = host, port = port, user = user, passwd = passwd, db = db)
        cur = conn.cursor()
        
        cur.execute("SELECT IF(CURRENT_TIMESTAMP() = UTC_TIMESTAMP(), 1, 0);")
        resultOfChecking, = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if resultOfChecking > 0:
            result = True
        else:
            reason = "Time Zone of Database is not UTC. Check Time Zone of Database."
    except MySQLdb.Error, e:
        reason = e.args
    
    return result, reason
    
    
__all__ = ["CallProcDefer", "CallProcDictDefer", "CallProc", "CallProcDict", "RunProcWrapper", "GetDBVersion"]
        