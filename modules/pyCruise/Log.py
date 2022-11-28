#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on Mar 22, 2010
@author: lunacalos

Usage: You can put various types of arguments as below
    log.Info(1, 1, 'val1,%s,val2,%s' % (10, 20))
    log.Info(1, 2, 'val1',10,'val2',20)
    log.Info('# This is test message')
    log.Debug(1, 1, val1=10, val2=20)
    log.Error('# This is test message', val1=10, val2=20)
    
On Windows
    log = CruiseLog('debug', "D:\\log\\test.log")
On Linux
    log = CruiseLog('debug', "/lunacalost/test.log")
'''

import logging.handlers
import inspect
import traceback
import sys

LOG_LEVELS = {'debug': logging.DEBUG, 
              'info': logging.INFO,
              'warning': logging.WARNING,
              'error': logging.ERROR,
              'critical': logging.CRITICAL}

#===============================
class CruiseLog:
    def __init__(self, level, filePath = None,appName = 'CruiseLog', useInspect=False ):
        '''
        Initialize log instance, set default values
        @param level: The log level of this log object
        @param filePath: Log file's absolute path
        '''
        self.LOG_LEVEL = LOG_LEVELS.get(level, logging.NOTSET)
        self.PATH = filePath
        self.IsConsoleOnly = False
        if self.PATH == None or len(self.PATH) <= 0:
            self.IsConsoleOnly = True

        self.Logger = self.GetLogger(appName) if self.IsConsoleOnly == False else None
        self.ConsoleLogger = self.GetConsoleLogger( appName +'_Console', False)
        self.ConsoleErrLogger = self.GetConsoleLogger(appName +'_ConsoleErr', True)
        self.useInspect = useInspect
   
    def _ConvertUnicode(self, param):
        if param == None:
            return u''
        elif isinstance(param, str):
            return unicode(param, "utf-8")
        elif isinstance(param, unicode):
            return param
        elif isinstance(param, list):
            return unicode(str(param), "utf-8")
        elif isinstance(param, dict):
            return unicode(str(param), "utf-8")
        elif isinstance(param, int) or isinstance(param, long) or isinstance(param, float):
            return unicode(param)
        else:
            return unicode(param)
    
    def GetLogger (self, loggerName):
        '''
        @param loggerName: unique name
        '''
        logger = logging.getLogger(loggerName)
        logger.setLevel(self.LOG_LEVEL) 
        
        if logger.handlers == []:
            hdlrFile = logging.handlers.TimedRotatingFileHandler(self.PATH, "H", 1, 0)
            hdlrFile.setFormatter(logging.Formatter("%(asctime)s, %(levelname)s%(message)s"))
            logger.addHandler(hdlrFile)
        return logger
    
    def GetConsoleLogger (self, loggerName, isUseStdErr):
        '''
        @param loggerName: unique name
        @param isUseStdErr: Using standard output or error output
        '''
        logger = logging.getLogger(loggerName)
        logger.setLevel(self.LOG_LEVEL) 
        
        if logger.handlers == []:
            consoleLogger = logging.StreamHandler(sys.stderr if isUseStdErr else sys.stdout)
            consoleLogger.setLevel(self.LOG_LEVEL)
            consoleLogger.setFormatter(logging.Formatter("%(asctime)s, %(levelname)s%(message)s"))
            logger.addHandler(consoleLogger)
        return logger

    def ProcessMsg (self, msg, kwMsg, addStr = ''):
        '''
        Build message 
        @param msg: A message that you want to write
        @param kwMsg: key-value type arguments
        @param addStr: Additional string, ex) stack trace
        '''
        if self.useInspect : 
            fullPath , linenumber , functionname = inspect.getouterframes(inspect.currentframe())[2][1:4]
            fileName = fullPath.split('\\')
            if len(fileName) == 1:
                fileName = fullPath.split('/')[-1]
            else:
                fileName = fileName[-1]
            
            retMsg = u', %s, %s, %s' % ( fileName , linenumber , functionname)
        else :
            retMsg  = u''
      
        if len(msg) == 1 and isinstance(msg[0], str):
            retMsg += ', ' + msg[0]
        elif (isinstance(msg, tuple) or isinstance(msg, list)):
            for item in msg:
                retMsg += ', ' + self._ConvertUnicode(item)
        
        for k, v in kwMsg.iteritems():
            retMsg += ', ' + str(k) + ', ' + str(v)
            
        return retMsg + addStr
    
    def Info (self, *strMsg, **kwStrMsg):
        '''
        Write log if self.LOG_LEVEL is same or lower than logging.INFO
        '''
        if self.LOG_LEVEL > logging.INFO:
            return None
        
        message = self.ProcessMsg(strMsg, kwStrMsg)
        
        if self.IsConsoleOnly:
            self.ConsoleLogger.info(message)
        else:
            self.Logger.info(message)
        
    def Debug(self, *strMsg, **kwStrMsg):
        '''
        Write log if self.LOG_LEVEL is same or lower than logging.DEBUG
        '''
        if self.LOG_LEVEL > logging.DEBUG:
            return None

        message = self.ProcessMsg(strMsg, kwStrMsg)
        
        if self.IsConsoleOnly:
            self.ConsoleLogger.debug( message)
        else:
            self.Logger.debug(message)
        
    def Error (self, *strMsg, **kwStrMsg):
        '''
        Write log if self.LOG_LEVEL is same or lower than logging.ERROR
        '''
        if self.LOG_LEVEL > logging.ERROR:
            return None

        traceMsg = traceback.format_exc()
        if traceMsg != None and traceMsg != 'None\n':
            message = self.ProcessMsg(strMsg, kwStrMsg, (" :: " + traceMsg))
        else:
            message = self.ProcessMsg(strMsg, kwStrMsg, '')
        
        if self.IsConsoleOnly:
            self.ConsoleErrLogger.error(message)
        else:
            self.Logger.error(message)
        
    def Console (self, level, *strMsg, **kwStrMsg):
        '''
        Write console log (using standard output) if self.LOG_LEVEL is same or lower than level
        @param level: Writing level of your message 
        '''
        
        logLevel = LOG_LEVELS.get(level, logging.NOTSET)
        if self.LOG_LEVEL > logLevel:
            return None
        
        self.ConsoleLogger.log(logLevel, self.ProcessMsg(strMsg, kwStrMsg))
        if not self.IsConsoleOnly:
            self.Logger.log(logLevel, self.ProcessMsg(strMsg, kwStrMsg))

    def ConsoleError (self, *strMsg, **kwStrMsg):
        '''
        Write console error log (using standard error output) if self.LOG_LEVEL is same or lower than level
        '''
        if self.LOG_LEVEL > logging.ERROR:
            return None
            
        self.ConsoleErrLogger.error(self.ProcessMsg(strMsg, kwStrMsg))
        if not self.IsConsoleOnly:
            traceMsg = traceback.format_exc()
            if traceMsg != None and traceMsg != 'None\n':
                message = self.ProcessMsg(strMsg, kwStrMsg, (" :: " + traceMsg))
            else:
                message = self.ProcessMsg(strMsg, kwStrMsg, '')
            self.Logger.error(message)
#===============================

if __name__ == '__main__':    
    log = CruiseLog('debug', None,appName = 'logTestApp', useInspect=True)
    log.Info(1, 1, 'val1,%s,val2,%s' % (10, 20))
    log.Info(1, 2, 'val1',10,'val2',20)
    log.Info('# This is test message')
    
    log.Debug(1, 1, val1=10, val2=20)
    log.Error('# This is test message', val1=10, val2=20)
    
    log = CruiseLog('debug',None,appName = 'logTestApp', useInspect=False)
    log.Info(1, 1, 'val1,%s,val2,%s' % (10, 20))
    log.Info(1, 2, 'val1',10,'val2',20)
    log.Info('# This is test message')
    
    log.Debug(1, 1, val1=10, val2=20)
    log.Error('# This is test message', val1=10, val2=20)
    
    log.Console('info','# This is info message')
    log.Console('debug','# This is debug message')
    log.ConsoleError('# This is error message')
    