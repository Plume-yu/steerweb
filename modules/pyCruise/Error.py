#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
Created on 2010. 8. 09.

@author: lunacalos
'''

from pyCruise.ServerCategory import GUID
    
#===============================
# Do not make the instance of this class
class CruiseError:
    # Primitive
    SUCCESS                       = 0x00000000
    SYSTEM_ERROR                  = 0x00FFFF00
    NOT_EXIST_FUNCTION            = 0x00FFFF01
    INSUFFICIENT_ARGUMENTS        = 0x00FFFF02
    NOT_EXIST_FUNCTION_ARGUMENTS  = 0x00FFFF03
    WRONG_OPMSG_ID                = 0x00FFFF04
    CHARACTER_SET_ERROR           = 0x00FFFF05
    DB_CALL_FAILED                = 0x00FFFF06
    INVALID_ARGUMENT_VALUE        = 0x00FFFF07
    WAITTING_TERMINATE            = 0x00FFFF08
    CATEGORY_MISMATCHED           = 0x00FFFF09
    
    def __init__(self, serverCategory):
        self.BASE = GUID.make(serverCategory)
        
        # ServerCategory + Primitive ErrorCode
        self.SUCCESS                      += self.BASE
        self.SYSTEM_ERROR                 += self.BASE
        self.NOT_EXIST_FUNCTION           += self.BASE
        self.INSUFFICIENT_ARGUMENTS       += self.BASE
        self.NOT_EXIST_FUNCTION_ARGUMENTS += self.BASE
        self.WRONG_OPMSG_ID               += self.BASE
        self.CHARACTER_SET_ERROR          += self.BASE
        self.DB_CALL_FAILED               += self.BASE
        self.WAITTING_TERMINATE           += self.BASE
        self.CATEGORY_MISMATCHED          += self.BASE
        
    def IsSuccess(self, errorCode):
        if GUID.getNumber(errorCode) == CruiseError.SUCCESS:
            return True
        else:
            return False

    def Make(self, errorCode):
        return self.SUCCESS + errorCode
        
    @staticmethod
    def Build(serverCategory, errorCode):
        return GUID.make(serverCategory, errorCode)

    @staticmethod
    def BuildFromGUSID(gusid, errorCode):
        return GUID.make(GUID.getCategory(gusid), errorCode)
    
    @staticmethod
    def IsSUCCESS(errorCode):
        if GUID.getNumber(errorCode) == CruiseError.SUCCESS:
            return True
        else:
            return False