#!/usr/bin/env python
# -*- coding: utf8 -*-

#===============================
#
# Error stuff for Steer system
#
#===============================
from pyCruise.Error import CruiseError
from pyCruise.ServerCategory import ServerCategory
from SteerAdminReturnObject import ReturnObject
import SteerAdminGlobal
import traceback


#===============================
class _SteerAdminError (CruiseError):
    def __init__(self):
        CruiseError.__init__(self, ServerCategory.steerweb)         
        
        # SteerWeb ErrorCode
        self.CONNECTION_FAILED          = self.Make(1000)
        self.SEND_RECV_FAILED           = self.Make(1001)
        self.NO_AVAILABLE_MENU          = self.Make(1002)
        self.AUTH_UNKNOWN_ERROR         = self.Make(1003)
        self.AUTH_NO_PRIVILEGE          = self.Make(1004)
        self.INVALID_L10N               = self.Make(1005)
        self.INVALID_DATA               = self.Make(1006)
        self.EXCEPTION                  = self.Make(1007)
        
        self.NO_SESSION_EXIST           = self.Make(999)      

# singleton
SteerAdminError = _SteerAdminError()

class SteerWebExceptionHandler:
    @staticmethod
    def ToReturnObject(exc):
        retObj = ReturnObject()
        retObj.SetReturnCode(SteerAdminError.EXCEPTION)
        retObj.SetExceptionFlag(1)
        trace = traceback.format_exc()
        retObj.AddReturnValue("errMsg", str(exc))
        retObj.AddReturnValue("trace", trace)
        
        SteerAdminGlobal.Log.Error('Exception: ', trace)
        
        return retObj.ParseToJSON()

if __name__ == '__main__':
    print SteerAdminError.SUCCESS
    print SteerAdminError.CONNECTION_FAILED
    print SteerAdminError.SEND_RECV_FAILED
    print SteerAdminError.NO_AVAILABLE_MENU
    print SteerAdminError.AUTH_UNKNOWN_ERROR
    print SteerAdminError.AUTH_NO_PRIVILEGE
    print SteerAdminError.NO_SESSION_EXIST