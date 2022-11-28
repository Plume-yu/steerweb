#!/usr/bin/env python
# _*_ coding: utf-8 _*_

#===============================
#
# Utility functions for Steer
#
#===============================
import cherrypy

#===============================
def ConvertStrListToTupleList (self, stringList):
    listReturn = []

    for value in stringList:
        listReturn.append(eval(value))
        
    return listReturn

#===============================
def RemoveHTML (val):
    return val.replace('<','$').replace('>','$')

#===============================
def ConvertUnicode(param):
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
        raise

#===============================
def GetCherrySession(key):
    if cherrypy.session.has_key(key):
        return cherrypy.session[key]
    else:
        return None

#===============================
def SetCherrySession(key, value):
    cherrypy.session[key] = value
