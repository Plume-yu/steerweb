#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
Created on 2011. 1. 7.

@author: rakho.kang
'''

def ConvertToUnicode(param):
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

all = ["ConvertToUnicode"]