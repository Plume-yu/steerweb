#!/usr/bin/env python
# -*- coding: utf8 -*-
'''
Created on 2011. 06. 10.

@author: lunacalos
'''

import sys
import os.path
sys.stdout = sys.stderr

import atexit
import threading
import cherrypy

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

cherrypy.config.update({'environment': 'embedded'})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

application = cherrypy.Application(SteerAdmin(LOCAL_PATH), script_name=None, config=configdict)
