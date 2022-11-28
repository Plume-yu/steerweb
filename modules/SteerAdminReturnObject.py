#!/usr/bin/env python
# _*_ coding: utf-8 _*_

#===============================
#
# Ajax Return Object
#
#===============================

import json
#===============================
class ReturnObject ():    
    def __init__(self):
        self.baseDict = {}
        self.isParsed = False
        self.baseDict['recordsReturned'] = 0
        self.baseDict['totalRecords'] = 0
        self.baseDict['startIndex'] = 0
        self.baseDict['sort'] = None
        self.baseDict['dir'] = None
        self.baseDict['pageSize'] = 0
        self.baseDict['records'] = None
        # 세션이 만료되었을 경우 리스트를 요청하면 바로 튕긴다. DataSource에 맞게 기본 값이 입력되어 있어야 한다. 

    def GetReturnCode(self):
        return int(self.baseDict['returnCode'])
        
    def SetReturnCode(self, code):
        self.baseDict['returnCode'] = code
        
    def SetMaxCount (self, count):
        self.baseDict['maxCount'] = count
        
    def SetReturnMsg (self, msg):
        self.baseDict['returnMsg'] = msg
        
    def SetExceptionFlag (self, flag):
        self.baseDict['exceptionFlag'] = flag

    def AddReturnTable(self, table):
        if not self.baseDict.has_key('returnTables'):
            self.baseDict['returnTables'] = []
        self.baseDict['returnTables'].append(table)

    def AddReturnTableWithColumn(self, table, key):
        if not self.baseDict.has_key('returnTables'):
            self.baseDict['returnTables'] = []
        self.baseDict['returnTables'].append(ReturnObject.ConvertListToKeyDatatable(table, key))
    
    def AddReturnTableWithColumnName(self, columnNames, rows):
        if not self.baseDict.has_key('returnTables'):
            self.baseDict['returnTables'] = []
        self.baseDict['returnTables'].append(ReturnObject.ConvertDictList(columnNames, rows))

    def AddReturnValue(self, key, value):
        self.baseDict[key] = value
        
    def AddYUIDataTableFormat (self, columnNames, rows, maxCount, startIdx, sort, dir, pageSize):
        self.baseDict["recordsReturned"] = len(rows)
        self.baseDict["totalRecords"] = maxCount
        self.baseDict["startIndex"] = startIdx
        self.baseDict["sort"] = sort
        self.baseDict["dir"] = dir
        self.baseDict["pageSize"] = pageSize
        self.baseDict["records"] = ReturnObject.ConvertDictList(columnNames, rows)

    def AddYUIDataTable (self, dataTable, startIdx, pageSize, sort, dir):
        self.baseDict["recordsReturned"] = len(dataTable[0])
        self.baseDict["totalRecords"] = dataTable[1]
        self.baseDict["startIndex"] = startIdx
        self.baseDict["sort"] = sort
        self.baseDict["dir"] = dir
        self.baseDict["pageSize"] = pageSize
        self.baseDict["records"] = dataTable[0]

    def ParseToJSON(self):
        self.isParsed = True
        return json.dumps(self.baseDict)
    
    @staticmethod
    def ConvertDictList(columnNames, rows):
        newRows = []
        for row in rows:
            newRow = dict(zip(columnNames, row))
            newRows.append(newRow)
        return newRows
    
    @staticmethod
    def ConvertListToKeyDatatable(dataTable, key):
        newDatatable = []
        for row in dataTable:
            newRow = dict(zip(ReturnObject.listColumns[key], row))
            newDatatable.append(newRow)
        return newDatatable
#===============================
