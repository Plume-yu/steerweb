#!/usr/bin/env python
# -*- coding: utf8 -*-
'''
Created on 2011. 03. 22.

@author: lunacalos
'''

import cherrypy
import os.path
import sys

LOCAL_PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(LOCAL_PATH, 'modules') )
sys.path.append(os.path.join(LOCAL_PATH, 'modules/pyCruise'))

from ajaxHandler import SteerAdmin
from pyCruise.Config import OpConfigParser

configfilename=os.path.join(LOCAL_PATH, 'steeradminweb.ini')
iniparser = OpConfigParser()
configdict = iniparser.dict_from_file(configfilename)

configdict['/']['tools.staticdir.root'] = LOCAL_PATH
configdict['/']['tools.sessions.timeout'] = int(configdict['/']['tools.sessions.timeout'])
configdict['global']['server.socket_port'] = int(configdict['global']['server.socket_port'])

if __name__ == '__main__':
    cherrypy.quickstart(SteerAdmin(LOCAL_PATH), config=configdict)
