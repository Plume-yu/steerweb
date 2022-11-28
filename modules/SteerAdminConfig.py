#!/usr/bin/env python
# -*- coding: utf8 -*-
from pyCruise.Log import CruiseLog
from pyCruise.Config import CruiseINIReader
import SteerAdminGlobal
import SteerAdminConfig

#===============================
#
# Configuration for Box system
#
#===============================

import os
import ConfigParser

SteerEye_GUSID = (35 << 24) + 0       # anycast
BoxAPI_GUSID = (16 << 24) + 0       # anycast
SteerSesion_GUSID = (10 << 24) + 0  # anycast
SteerMind_GUSID = (4 << 24) + 0     # anycast

# Net
HubGatewayAddress = '127.0.0.1'
HubGatewayPort = 8088
SteerGatewayAddress = '127.0.0.1'
SteerGatewayPort = 8109
MaxLen = 65535
TimeOut = 5
NationCode = 'ko'

# Log
LOG_LEVEL = 'debug'
LOG_PATH = 'Put Default Log path and filename here...'

#===============================
class SteerAdminConfigReader:
    @staticmethod
    def Initialize():
        configReader = CruiseINIReader(os.path.join(os.path.dirname(__file__), '../steeradminweb.ini'))
        SteerAdminConfig.LOG_LEVEL = configReader.GetString('SteerAdminWeb', 'log_level', 'debug')
        SteerAdminConfig.LOG_PATH = configReader.GetString('SteerAdminWeb', 'log_path_file')
        SteerAdminConfig.SteerGatewayAddress = configReader.GetString('SteerAdminWeb', 'steer_gateway_address', '127.0.0.1')
        SteerAdminConfig.SteerGatewayPort = configReader.GetInt('SteerAdminWeb', 'steer_gateway_port', 8109)
        SteerAdminConfig.MaxLen = configReader.GetInt('SteerAdminWeb', 'max_packet_length', 65535)
        SteerAdminConfig.TimeOut = configReader.GetInt('SteerAdminWeb', 'socket_timeout', 5)
        SteerAdminConfig.NationCode = configReader.GetString('SteerAdminWeb', 'nation_code', 'ko')
        SteerAdminConfig.CodePage = configReader.GetString('SteerAdminWeb', 'code_page', 'cp949')
        SteerAdminConfig.HubGatewayAddress = configReader.GetString('SteerAdminWeb', 'hub_gateway_address', '127.0.0.1')
        SteerAdminConfig.HubGatewayPort = configReader.GetInt('SteerAdminWeb', 'hub_gateway_port', 8109)

        SteerAdminGlobal.Log = CruiseLog(SteerAdminConfig.LOG_LEVEL, SteerAdminConfig.LOG_PATH)
