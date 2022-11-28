#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 8. 4.

@author: rakho.kang
'''

import sys
import inspect

def DefineInterface(functionMap, functionArgumentNamesMap, GUFID):
    """외부로 노출될 interface function들을 정의 합니다.
    """
    def makeMap(functionObject):
        # check python 2.6.x
        if sys.version_info < (2, 6):
            argumentNames = inspect.getargspec(functionObject)[0]
        else:
            argumentNames = inspect.getargspec(functionObject).args
        
        del argumentNames[:4] #delete self, serverID, jobID, opMsg
        
        functionMap[GUFID] = functionObject
        functionArgumentNamesMap[GUFID] = argumentNames
        
        return functionObject
    return makeMap

__all__ = ["DefineInterface"]
